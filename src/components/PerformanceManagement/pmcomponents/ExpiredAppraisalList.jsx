import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  AlarmClock,
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  Search,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  TriangleAlert,
} from "lucide-react";
import {
  reopenSelfAssessment,
  sendMissedDeadlineEmail,
  sendReviewReminder,
  reopenReview,
  PERFORMANCE_V2_ENABLED,
} from "../../../api/performancemanagementdashborad";
import PerformanceManagementTable from "./ui/PerformanceManagementTable";
import { useCompanyDepartments } from "./useCompanyDepartments";

const ExpiredStatus = ({ status = "Expired" }) => (
  <Badge
    border="1px solid #ff3333"
    borderRadius="full"
    bg="white"
    color="#e52323"
    px={2}
    py="2px"
    fontSize="10px"
    fontWeight={400}
    textTransform="none"
  >
    {status}
  </Badge>
);

const expiredColumns = [
  { key: "employeeCode", label: "Employee ID", width: "145px" },
  { key: "fullName", label: "Full Name", width: "300px" },
  { key: "department", label: "Department", width: "165px" },
  {
    key: "formStatus",
    label: "Form Status",
    width: "165px",
    render: (value) => <ExpiredStatus status={value} />,
  },
];

const getApiError = (error) =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.message ||
  "The request could not be completed.";

const ExpiredAppraisalList = ({
  rows = [],
  loading = false,
  error = "",
  onBack,
  onRefresh,
}) => {
  const dateInputRef = useRef(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");
  const [reminderStates, setReminderStates] = useState({});
  const [reopenedIds, setReopenedIds] = useState({});
  const [reopenTarget, setReopenTarget] = useState(null);
  const [reopenLoading, setReopenLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { departmentNames, isLoading: departmentsLoading, error: departmentsError } =
    useCompanyDepartments();
  const openDatePicker = () => {
    const dateInput = dateInputRef.current;
    if (!dateInput) return;

    dateInput.focus();
    try {
      if (typeof dateInput.showPicker === "function") dateInput.showPicker();
      else dateInput.click();
    } catch {
      dateInput.click();
    }
  };
  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedDate("");
    setSearch("");
  };

  const uniqueDepartmentNames = [...new Set(departmentNames)];
  const departmentOptions = ["All Departments", ...uniqueDepartmentNames];
  const quickDepartments = uniqueDepartmentNames.slice(0, 3);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const rowId = row.formId || row._id || row.appraisalId;
      const matchesDepartment =
        !selectedDepartment || row.department === selectedDepartment;
      const matchesDate = !selectedDate || row.appraisalDateISO === selectedDate;
      const matchesSearch =
        !query ||
        [row.employeeCode, row.fullName, row.department, row.formStatus].some((value) =>
          String(value || "").toLowerCase().includes(query),
        );

      return (
        !reopenedIds[rowId] &&
        matchesDepartment &&
        matchesDate &&
        matchesSearch
      );
    });
  }, [rows, reopenedIds, selectedDepartment, selectedDate, search]);

  const handleReminder = async (row) => {
    const appraisalId = row?.appraisalId || row?._id;
    if (!appraisalId) {
      toast({ title: "Appraisal ID is missing", status: "error", isClosable: true });
      return false;
    }

    setReminderStates((current) => ({ ...current, [appraisalId]: "sending" }));
    try {
      const response = PERFORMANCE_V2_ENABLED && row.formType === 2
        ? await sendReviewReminder(row.formId || row._id)
        : await sendMissedDeadlineEmail(appraisalId);
      setReminderStates((current) => ({ ...current, [appraisalId]: "queued" }));
      await onRefresh?.();
      toast({
        title: "Reminder queued",
        description: response?.msg || "The reminder email was queued successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (requestError) {
      setReminderStates((current) => ({ ...current, [appraisalId]: "idle" }));
      toast({
        title: "Reminder could not be sent",
        description: getApiError(requestError),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }
  };

  const openReopenDialog = (row) => {
    const appraisalId = row?.appraisalId || row?._id;
    if (row?.isDummy || (PERFORMANCE_V2_ENABLED ? !row.can_reactivate : reminderStates[appraisalId] !== "sent")) return;

    setReopenTarget(row);
    onOpen();
  };

  const sendReminderFromDialog = async () => {
    if (reopenTarget && (await handleReminder(reopenTarget))) {
      onClose();
    }
  };

  const confirmReopen = async () => {
    const appraisalId = reopenTarget?.appraisalId || reopenTarget?._id;
    if (!appraisalId) {
      toast({ title: "Appraisal ID is missing", status: "error", isClosable: true });
      return;
    }

    setReopenLoading(true);
    try {
      const response = PERFORMANCE_V2_ENABLED && reopenTarget.formType === 2
        ? await reopenReview(reopenTarget.formId || reopenTarget._id)
        : await reopenSelfAssessment(appraisalId);
      setReopenedIds((current) => ({ ...current, [appraisalId]: true }));
      toast({
        title: "Form reopened",
        description:
          response?.msg || "The employee has five calendar days to complete the form.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });
      onClose();
      await onRefresh?.();
    } catch (requestError) {
      toast({
        title: "Appraisal could not be reopened",
        description: getApiError(requestError),
        status: "error",
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setReopenLoading(false);
    }
  };

  const rowActions = [
    {
      label: "Reminder",
      getLabel: (row) =>
        reminderStates[row.appraisalId || row._id] === "queued" ? "Queued" : "Reminder",
      icon: <AlarmClock size={14} strokeWidth={1.7} />,
      getIcon: (row) =>
        reminderStates[row.appraisalId || row._id] === "queued" ? (
          <Check size={14} strokeWidth={2} />
        ) : (
          <AlarmClock size={14} strokeWidth={1.7} />
        ),
      size: "xs",
      h: "28px",
      px: 2,
      borderRadius: "full",
      getVariant: (row) =>
        reminderStates[row.appraisalId || row._id] === "queued" ? "solid" : "outline",
      getColorScheme: (row) =>
        reminderStates[row.appraisalId || row._id] === "queued" ? "blue" : "gray",
      isLoading: (row) =>
        reminderStates[row.appraisalId || row._id] === "sending",
      getIsDisabled: (row) =>
        row.isDummy || reminderStates[row.appraisalId || row._id] === "queued",
      loadingText: "Sending...",
      onClick: handleReminder,
    },
    {
      label: "Re-open",
      icon: <SquareArrowOutUpRight size={14} strokeWidth={1.7} />,
      size: "xs",
      h: "28px",
      px: 2,
      borderRadius: "full",
      variant: "outline",
      getIsDisabled: (row) =>
        row.isDummy || (PERFORMANCE_V2_ENABLED ? !row.can_reactivate : true),
      onClick: openReopenDialog,
    },
  ];

  const hasSentReminder =
    reopenTarget &&
    (PERFORMANCE_V2_ENABLED ? reopenTarget.can_reactivate : false);
  const modalReminderLoading =
    reopenTarget &&
    reminderStates[reopenTarget.appraisalId || reopenTarget._id] === "sending";

  return (
    <>
      <Box
        w="100%"
        bg="white"
        color="#111"
        fontFamily="Arial, sans-serif"
        border="1px solid #d8d8d8"
        borderRadius="16px"
        overflow="hidden"
      >
        <Flex
          minH="62px"
          align="center"
          justify="space-between"
          px={{ base: 3, md: 6 }}
          borderBottom="1px solid #e5e5e5"
        >
          <Heading as="h1" fontSize={{ base: "17px", md: "19px" }} fontWeight={700}>
            Expired Appraisal List
          </Heading>
          <Button
            onClick={onBack}
            leftIcon={<ArrowLeft size={14} />}
            size="sm"
            variant="ghost"
            color="#555"
            fontWeight={400}
          >
            Appraisal overview
          </Button>
        </Flex>

        <Flex
          minH="46px"
          px={{ base: 3, md: 5 }}
          py={2}
          align="center"
          justify="space-between"
          gap={3}
          flexWrap="wrap"
          borderBottom="1px dashed #d8d8d8"
        >
          <Flex align="center" gap={2} flexWrap="wrap">
            <Text fontSize="13px" fontWeight={700} mr={1}>
              Quick Filter
            </Text>
            {quickDepartments.length ? quickDepartments.map((department) => {
              const isActive = selectedDepartment === department;

              return (
                <Button
                  key={department}
                  onClick={() =>
                    setSelectedDepartment((current) =>
                      current === department ? "" : department,
                    )
                  }
                  aria-pressed={isActive}
                  minW="auto"
                  h="23px"
                  px={2.5}
                  border="1px solid #d7d7d7"
                  borderRadius="full"
                  bg={isActive ? "#eef2f7" : "white"}
                  color="#666"
                  fontSize="11px"
                  fontWeight={400}
                >
                  {department}
                </Button>
              );
            }) : (
              <Text fontSize="11px" color="#777">
                {departmentsLoading
                  ? "Loading departments..."
                  : departmentsError || "No departments available"}
              </Text>
            )}
          </Flex>

          <Flex align="center" gap={2} flexWrap="wrap" ml="auto">
            <InputGroup size="sm" w={{ base: "150px", md: "110px" }}>
              <InputLeftElement pointerEvents="auto" h="28px" zIndex={2}>
                <IconButton
                  type="button"
                  aria-label="Open date picker"
                  icon={<CalendarDays size={14} />}
                  onClick={openDatePicker}
                  variant="ghost"
                  size="xs"
                  minW="24px"
                  h="24px"
                  color="#777"
                  _hover={{ bg: "gray.100" }}
                />
              </InputLeftElement>
              <Input
                ref={dateInputRef}
                aria-label="Filter expired appraisals by appraisal date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                h="28px"
                pl={8}
                pr={1}
                borderColor="#d4d4d4"
                borderRadius="6px"
                fontSize="10px"
                color="#555"
                sx={{
                  "&::-webkit-calendar-picker-indicator": {
                    opacity: 0,
                    cursor: "pointer",
                  },
                }}
              />
            </InputGroup>

            <InputGroup size="sm" w={{ base: "150px", md: "118px" }}>
              <InputLeftElement pointerEvents="none" h="28px">
                <Search size={13} color="#888" />
              </InputLeftElement>
              <Input
                aria-label="Search expired appraisals"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                h="28px"
                pl={8}
                borderColor="#d4d4d4"
                borderRadius="6px"
                fontSize="11px"
                _placeholder={{ color: "#777" }}
              />
            </InputGroup>

            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<SlidersHorizontal size={13} />}
                size="sm"
                h="28px"
                px={2.5}
                border="1px solid #d4d4d4"
                borderRadius="6px"
                bg="white"
                color="#555"
                fontSize="11px"
                fontWeight={400}
                _hover={{ bg: "gray.50" }}
              >
                Filter
              </MenuButton>
              <MenuList minW="170px" fontSize="12px">
                {departmentOptions.map((department) => (
                  <MenuItem
                    key={department}
                    onClick={() =>
                      setSelectedDepartment(
                        department === "All Departments" ? "" : department,
                      )
                    }
                    bg={
                      (department === "All Departments" && !selectedDepartment) ||
                      selectedDepartment === department
                        ? "gray.100"
                        : "white"
                    }
                  >
                    {department}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Button
              type="button"
              aria-label="Clear expired appraisal filters"
              onClick={clearFilters}
              h="28px"
              px={2.5}
              border="1px solid #d4d4d4"
              borderRadius="6px"
              bg="white"
              color="#555"
              fontSize="11px"
              fontWeight={400}
              _hover={{ bg: "gray.50" }}
            >
              Clear filters
            </Button>
          </Flex>
        </Flex>

        <PerformanceManagementTable
          data={visibleRows}
          columns={expiredColumns}
          rowActions={rowActions}
          loading={loading}
          showHeader={false}
          striped
          rowHeight={37}
          actionColumnWidth="225px"
          actionHeaderAlign="left"
          cellPadding={20}
          emptyMessage={error || "No expired appraisals match these filters."}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(30, 34, 42, 0.16)" backdropFilter="blur(4px)" />
        <ModalContent
          w="calc(100vw - 24px)"
          maxW="435px"
          borderRadius="16px"
          overflow="hidden"
          fontFamily="Poppins, sans-serif"
        >
          <ModalHeader
            minH="72px"
            display="flex"
            alignItems="center"
            borderBottom="1px solid #dedede"
            pl={5}
            pr={14}
            fontSize="23px"
            fontWeight={700}
          >
            <Flex align="center" gap={2}>
              {hasSentReminder ? (
                <SquareArrowOutUpRight size={22} color="#ee8b00" />
              ) : (
                <TriangleAlert size={22} color="#ee8b00" />
              )}
              <Text>{hasSentReminder ? "Re-open Self-Assessment?" : "Send Reminder First!"}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} size="lg" aria-label="Close dialog" />

          <ModalBody px={5} py={4}>
            {hasSentReminder ? (
              <>
                <Text color="#555" fontSize="12px" lineHeight="1.6" mb={3}>
                  Re-open {reopenTarget?.fullName || "this employee"}'s self-assessment after
                  reviewing their reason for missing the deadline. The backend will assign the configured reactivation deadline.
                </Text>
                <Flex align="flex-start" gap={3} bg="#f0f0f0" borderRadius="9px" p={3}>
                  <CircleAlert size={27} color="#999" />
                  <Text color="#777" fontSize="11px" lineHeight="1.5">
                    The backend will verify that this appraisal is overdue and has not already
                    been submitted.
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <Text color="#666" fontSize="12px" lineHeight="1.55" mb={3}>
                  A reminder must be delivered (SENT) for this expired form before reactivation is permitted.
                </Text>
                <Flex align="center" gap={3} bg="#f0f0f0" borderRadius="9px" p={3}>
                  <CircleAlert size={30} color="#999" />
                  <Box w="1px" alignSelf="stretch" bg="#d5d5d5" />
                  <Text color="#777" fontSize="11px" lineHeight="1.5">
                    The Re-open option is enabled only when the backend confirms eligibility.
                  </Text>
                </Flex>
              </>
            )}
          </ModalBody>

          <ModalFooter gap={3} pt={1} pb={4} px={5}>
            <Button
              onClick={onClose}
              variant="outline"
              borderColor="#e1e1e1"
              color="#243e68"
              fontSize="12px"
              fontWeight={500}
              minW="120px"
              h="36px"
            >
              Cancel
            </Button>
            {hasSentReminder ? (
              <Button
                onClick={confirmReopen}
                isLoading={reopenLoading}
                loadingText="Re-opening..."
                bg="#243e68"
                color="white"
                fontSize="12px"
                fontWeight={500}
                minW="120px"
                h="36px"
                _hover={{ bg: "#1c3154" }}
              >
                Re-open Form
              </Button>
            ) : (
              <Button
                onClick={sendReminderFromDialog}
                isLoading={Boolean(modalReminderLoading)}
                loadingText="Sending..."
                bg="#243e68"
                color="white"
                fontSize="12px"
                fontWeight={500}
                minW="120px"
                h="36px"
                _hover={{ bg: "#1c3154" }}
              >
                Send Reminder
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExpiredAppraisalList;
