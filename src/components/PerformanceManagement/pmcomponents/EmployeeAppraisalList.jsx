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
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { CalendarDays, Eye, Search, Settings2, SlidersHorizontal } from "lucide-react";
import PerformanceManagementTable from "./ui/PerformanceManagementTable";
import { appraisalColumns } from "./ui/upcomingColumns";
import { getAppraisalDetails } from "../../../api/performancemanagementdashborad";
import { useCompanyDepartments } from "./useCompanyDepartments";
import { selfAssessmentCriteria } from "./data/dummyAppraisalData";

const statusOptions = ["Submitted", "Pending", "Locked"];

const statusStyles = {
  Submitted: { color: "#24a148", background: "#e8f7ec", borderColor: "#91dfa5" },
  Pending: { color: "#d98918", background: "#fff8ed", borderColor: "#f3d6a7" },
  Upcoming: { color: "#8063bd", background: "#f5f0ff", borderColor: "#d4c5f1" },
  Locked: { color: "#ef8585", background: "#fff", borderColor: "#ffcaca" },
};

const StatusChip = ({ status, onClick, isActive }) => {
  const style = statusStyles[status];

  return (
    <Button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      minW="auto"
      h="22px"
      px={2.5}
      border="1px solid"
      borderColor={style.borderColor}
      borderRadius="full"
      bg={isActive ? style.background : "white"}
      color={style.color}
      fontSize="11px"
      fontWeight={400}
      lineHeight="1"
      _hover={{ bg: style.background }}
    >
      {status}
    </Button>
  );
};

const EmployeeAppraisalList = ({ appraisals = [], loading = false, error = "" }) => {
  const dateInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
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
    setSearch("");
    setSelectedStatus("");
    setSelectedDepartment("All Departments");
    setSelectedDate("");
  };
  const departmentOptions = [
    "All Departments",
    ...new Set(departmentNames),
  ];

  const filteredAppraisals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appraisals.filter((record) => {
      const matchesSearch =
        !query ||
        Object.values(record).some((value) =>
          String(value).toLowerCase().includes(query),
        );
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "Locked"
          ? record.feedback === "Locked"
          : record.selfAssessment === selectedStatus);
      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        record.department === selectedDepartment;
      const matchesDate = !selectedDate || record.appraisalDateISO === selectedDate;

      return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
    });
  }, [appraisals, search, selectedStatus, selectedDepartment, selectedDate]);

  const handleViewRecord = async (record) => {
    setActiveRecord(record);
    setActiveDetails(null);
    setDetailsError("");
    onOpen();

    if (record.isDummy) {
      const questions = selfAssessmentCriteria.map((criterion, index) => ({
        id: `dummy-question-${index + 1}`,
        text: criterion.label,
      }));
      const answers = selfAssessmentCriteria.map((criterion, index) => ({
        question_id: `dummy-question-${index + 1}`,
        score: criterion.score,
      }));
      const submittedReviewers = Number.parseInt(record.feedback, 10) || 0;
      const totalReviewers = Number.parseInt(record.feedback.split("/")[1], 10) || 0;

      setActiveDetails({
        self_assessment: {
          questions,
          submission: {
            answers,
            total_score: answers.reduce((total, answer) => total + answer.score, 0),
          },
        },
        reviewer_progress: {
          submitted: submittedReviewers,
          total: totalReviewers,
          text: `${submittedReviewers} of ${totalReviewers} submitted`,
        },
      });
      setDetailsLoading(false);
      return;
    }

    setDetailsLoading(true);

    try {
      const response = await getAppraisalDetails(record.appraisalId);
      setActiveDetails(response?.result || null);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.msg ||
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to load appraisal details.";
      setDetailsError(message);
      toast({ title: "Could not load appraisal", description: message, status: "error" });
    } finally {
      setDetailsLoading(false);
    }
  };

  const rowActions = [
    {
      label: "View appraisal",
      icon: <Eye size={16} strokeWidth={1.7} />,
      iconOnly: true,
      size: "xs",
      variant: "ghost",
      onClick: handleViewRecord,
    },
  ];


  const assessment = activeDetails?.self_assessment;
  const questions = assessment?.questions || [];
  const answers = assessment?.submission?.answers || [];
  const reviewerProgress = activeDetails?.reviewer_progress || activeRecord?.reviewer_progress;
  const reviewers = activeDetails?.reviewers || [];
  const totalScore =
    assessment?.submission?.total_score ??
    (answers.length ? answers.reduce((total, answer) => total + Number(answer.score || 0), 0) : null);
  return (
    <Box
      id="appraisal-list"
      w="100%"
      bg="white"
      color="#111"
      fontFamily="Arial, sans-serif"
      border="1px solid #d8d8d8"
      borderRadius="16px"
      overflow="hidden"
    >
      <Flex
        minH="56px"
        align="center"
        justify="space-between"
        px={{ base: 3, md: 2.5 }}
        borderBottom="1px solid"
        borderColor="#e5e5e5"
      >
        <Heading as="h1" fontSize={{ base: "17px", md: "19px" }} fontWeight={700}>
          Employees Appraisal List
        </Heading>
        <IconButton
          aria-label="Appraisal settings"
          icon={<Settings2 size={17} />}
          variant="ghost"
          size="sm"
          color="#777"
          borderRadius="md"

        />
      </Flex>

      <Flex
        minH="42px"
        px={{ base: 3, md: 2 }}
        py={2}
        align="center"
        justify="space-between"
        gap={3}
        flexWrap="wrap"
        borderBottom="1px dashed #d8d8d8"
      >
        <Flex align="center" gap={2} flexWrap="wrap">
          <Text fontSize="13px" fontWeight={700} mr={1}>
            Self-Assessment
          </Text>
          {statusOptions.map((status) => (
            <StatusChip
              key={status}
              status={status}
              isActive={selectedStatus === status}
              onClick={() =>
                setSelectedStatus((current) => (current === status ? "" : status))
              }
            />
          ))}
        </Flex>

        <Flex align="center" gap={2} flexWrap="wrap" ml="auto">
          <InputGroup size="sm" w={{ base: "150px", md: "100px" }}>
            <InputLeftElement pointerEvents="auto" h="27px" zIndex={2}>
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
              aria-label="Filter by document date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              h="27px"
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

          <InputGroup size="sm" w={{ base: "160px", md: "106px" }}>
            <InputLeftElement pointerEvents="none" h="27px">
              <Search size={13} color="#888" />
            </InputLeftElement>
            <Input
              aria-label="Search appraisals"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              h="27px"
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
              h="27px"
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
              {departmentOptions.length > 1 ? departmentOptions.map((department) => (
                <MenuItem
                  key={department}
                  onClick={() => setSelectedDepartment(department)}
                  bg={selectedDepartment === department ? "gray.100" : "white"}
                >
                  {department}
                </MenuItem>
              )) : (
                <MenuItem isDisabled>
                  {departmentsLoading
                    ? "Loading departments..."
                    : departmentsError || "No departments available"}
                </MenuItem>
              )}
            </MenuList>
          </Menu>
          <Button
            type="button"
            aria-label="Clear all appraisal filters"
            onClick={clearFilters}
            h="27px"
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

      <Box pt={2}>
        <PerformanceManagementTable
          data={filteredAppraisals}
          columns={appraisalColumns}
          rowActions={rowActions}
          loading={loading}
          showHeader={false}
          striped
          emptyMessage={error || "No appraisals match these filters."}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
        <ModalOverlay bg="rgba(20, 25, 35, 0.18)" backdropFilter="blur(4px)" />
        <ModalContent
          w="calc(100vw - 20px)"
          maxW="624px"
          h="calc(100vh - 20px)"
          maxH="946px"
          display="flex"
          flexDirection="column"
          borderRadius="16px"
          overflow="hidden"
          fontFamily="Poppins, sans-serif"
        >
          <ModalHeader
            flexShrink={0}
            minH="76px"
            display="flex"
            alignItems="center"
            borderBottom="1px solid #d8d8d8"
            px={5}
            pr={14}
            fontSize={{ base: "22px", md: "28px" }}
            fontWeight={700}
          >
            {activeRecord?.fullName || "Employee"}
          </ModalHeader>
          <ModalCloseButton
            top={4}
            right={4}
            size="lg"
            borderRadius="full"
            aria-label="Close appraisal details"
          />

          <ModalBody flex="1" minH={0} overflowY="auto" p={0}>
            <Box px={5} pt={4} pb={5}>
              <Flex align="center" gap={2} mb={4} fontSize="13px">
                <Text>Self-assessment score</Text>
                <Badge
                  bg={totalScore === null ? "#f1f1f1" : "#008b12"}
                  color={totalScore === null ? "#666" : "white"}
                  borderRadius="full"
                  px={2.5}
                  py="2px"
                  fontSize="12px"
                  fontWeight={500}
                  textTransform="none"
                >
                  {totalScore === null ? "Not submitted" : `${totalScore} / 100`}
                </Badge>
              </Flex>

              {detailsLoading ? (
                <Flex justify="center" py={10}>
                  <Spinner />
                </Flex>
              ) : detailsError ? (
                <Text color="red.600" fontSize="13px" py={3}>
                  {detailsError}
                </Text>
              ) : questions.length > 0 ? (
                <Box>
                  {questions.map((question, index) => {
                    const answer = answers.find(
                      (item) => String(item.question_id) === String(question.id),
                    );

                    return (
                      <Flex
                        key={question.id}
                        minH="44px"
                        align="center"
                        justify="space-between"
                        px={2.5}
                        mb={1}
                        borderRadius="18px"
                        bg="#f1f1f1"
                        fontSize="13px"
                      >
                        <Text>{index + 1}.&nbsp; {question.text}</Text>
                        <Flex
                          align="center"
                          justify="center"
                          minW="96px"
                          h="29px"
                          borderRadius="full"
                          bg="white"
                          boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                          fontSize="14px"
                          fontWeight={500}
                        >
                          {answer ? `${answer.score} / 10` : "- / 10"}
                        </Flex>
                      </Flex>
                    );
                  })}
                </Box>
              ) : (
                <Text color="gray.600" fontSize="13px" py={3}>
                  No self-assessment questions are available for this appraisal.
                </Text>
              )}

              <Button
                variant="link"
                mt={2}
                color="#777"
                fontSize="11px"
                fontWeight={400}
                onClick={() =>
                  toast({
                    title: "Self-assessment",
                    description: "The employee's self-assessment is shown above.",
                    status: "info",
                    duration: 2200,
                    isClosable: true,
                  })
                }
              >
                View self-assessment
              </Button>
            </Box>

            <Box bg="#f1f1f1" px={5} py={3.5}>
              <Text fontSize="13px" fontWeight={700} mb={1}>
                Reviewer activity
              </Text>
              <Text color="#777" fontSize="12px" lineHeight="1.5">
                {reviewers.length
                  ? reviewers
                      .map((reviewer) => `${reviewer.name || "Reviewer"} (${reviewer.submitted ? "submitted" : "pending"})`)
                      .join(", ")
                  : "No reviewers are assigned to this appraisal yet."}
              </Text>
            </Box>

            <Box bg="#f1f1f1" px={5} py={3.5} borderTop="1px solid #e5e5e5">
              <Flex align="center" justify="space-between" mb={1}>
                <Text fontSize="13px" fontWeight={700}>
                  Reviewer feedback
                </Text>
                <Badge
                  minW="60px"
                  textAlign="center"
                  borderRadius="full"
                  bg="white"
                  px={2.5}
                  py={1}
                  fontSize="13px"
                  fontWeight={600}
                  textTransform="none"
                >
                  {reviewerProgress?.submitted || 0} / {reviewerProgress?.total || 0}
                </Badge>
              </Flex>
              <Text color="#777" fontSize="12px">
                {activeDetails?.result
                  ? `Final score ${activeDetails.result.score}; increment ${activeDetails.result.increment_percent}%`
                  : `Final increment pending - ${reviewerProgress?.text || "0 of 0 submitted"}`}
              </Text>
            </Box>
          </ModalBody>

          <Flex justify="flex-end" p={2.5} flexShrink={0}>
            <Button
              onClick={() => {
                onClose();
              }}
              bg="#233d68"
              color="white"
              size="sm"
              px={4}
              _hover={{ bg: "#1b3155" }}
            >
              Save &amp; Proceed
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeAppraisalList;
