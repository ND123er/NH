import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Input,
  Textarea,
  Spinner,
  useToast,
  InputGroup,
  InputRightElement,
  Image,
  HStack,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  CloseButton,
  InputLeftElement,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { decodeTokenPayload, getOrgCode } from "../../utils/token";
import api from "../../api/axios";
import LeaveRolloverTable from "./LeaveRolloverTable";
import LeaveRolloverRequest from "./LeaveRolloverRequest";
import policy_summary from "../../assets/policy_summary.svg";
import { SearchIcon } from "@chakra-ui/icons";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineCheckCircle, AiOutlineFile } from "react-icons/ai";
import FilterDropdownRollover from "./Filters/FilterDropdownRollover";

export default function LeaveRollover() {
  const toast = useToast();
  const decoded = decodeTokenPayload();
  const isAdmin = decoded?.is_admin ?? decoded?.isAdmin ?? false;

  const [view, setView] = useState("apply");

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [loadingRemaining, setLoadingRemaining] = useState(false);

  // Filter states for admin view
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchExpand, setSearchExpand] = useState(false);
  const placeholders = ["Search by Full Name", "Search by Employee ID"];
  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];
  const [leaveTypeFilter, setLeaveTypeFilter] = useState([]);

  // Calendar/date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  const searchInputStyle = {
    fontFamily: "Poppins",
    fontSize: "14px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "35px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "8px",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      leaveTypeId: "",
      daysToRollover: "",
      encashment: "",
      reason: "",
    },
  });

  const watchedLeaveTypeId = watch("leaveTypeId");

  /* ================= PLACEHOLDER ROTATION FOR ADMIN VIEW ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH LEAVE TYPES ================= */
  useEffect(() => {
    if (isAdmin) return;

    const fetchLeaveTypes = async () => {
      try {
        setLoadingLeaveTypes(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/leave/get_all_leave_policies?organisation_id=${orgId}`,
        );

        if (res?.data?.data) {
          setLeaveTypes(res.data.data.filter((l) => l.is_active));
        }
      } catch {
        toast({
          title: "Failed to load leave types",
          status: "error",
        });
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, [isAdmin, toast]);

  /* ================= derive selected leave + fetch remaining ================= */
  const organisation_id = getOrgCode();
  const employee_id = decoded?.employee_id;

  useEffect(() => {
    if (!watchedLeaveTypeId || leaveTypes.length === 0) {
      setSelectedLeave(null);
      setRemainingDays(null);
      return;
    }

    const found = leaveTypes.find((l) => l._id === watchedLeaveTypeId);
    setSelectedLeave(found || null);

    let isCancelled = false;

    const fetchRemaining = async () => {
      try {
        setLoadingRemaining(true);

        // Use summary endpoint and pick matching leave's available_now
        const res = await api.get(`/leave/get_my_leave_summary`, {
          params: { organisation_id, employee_id },
        });

        if (!isCancelled) {
          const leaves = res?.data?.leaves || [];
          const match = leaves.find(
            (l) =>
              l.leave_type_id === watchedLeaveTypeId ||
              l._id === watchedLeaveTypeId,
          );
          setRemainingDays(match?.available_now ?? 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setRemainingDays(null);
        }
      } finally {
        if (!isCancelled) {
          setLoadingRemaining(false);
        }
      }
    };

    fetchRemaining();

    return () => {
      isCancelled = true;
    };
  }, [watchedLeaveTypeId, leaveTypes]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    try {
      const organisation_id = getOrgCode();
      const employee_id = decoded?.employee_id;

      const payload = {
        organisation_id,
        employee_id,
        leave_type_id: data.leaveTypeId,
        carry_forward_days: Number(data.daysToRollover),
        encashment_days: Number(data.encashment || 0),
        reason: data.reason,
      };

      await api.post("leave/submit_leave_rollover_request", payload);

      toast({
        title: "Rollover request submitted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      reset();
      setSelectedLeave(null);
      setRemainingDays(null);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.msg || err?.response?.data?.message || null;

      // Handle known business rule errors
      if (backendMsg) {
        // Remaining days / rollover mismatch
        if (
          backendMsg.toLowerCase().includes("mismatch") ||
          backendMsg.toLowerCase().includes("not enough")
        ) {
          setError("daysToRollover", {
            type: "server",
            message:
              "You do not have enough remaining leave balance for this rollover.",
          });

          toast({
            title: "Invalid rollover request",
            description:
              "Requested carry forward days exceed your remaining leave balance.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
          return;
        }

        // Max carry forward violation
        if (backendMsg.toLowerCase().includes("carry")) {
          setError("daysToRollover", {
            type: "server",
            message: backendMsg,
          });
          return;
        }

        // Generic backend message
        toast({
          title: "Rollover request failed",
          description: backendMsg,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Network / unexpected error fallback
      toast({
        title: "Something went wrong",
        description:
          "Unable to submit rollover request. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  /* ================= ADMIN VIEW ================= */
  if (isAdmin) {
    return (
      <Box
        fontFamily="Poppins"
        h="100vh"
        overflowY="auto"
        bg="#F6F7FB"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #cccccc"
          p={4}
          mb={2}
        >
          <Flex
            align="center"
            justify="space-between"
            border="1px solid #cccccc"
            borderRadius="10px"
            p={3}
          >
            <Flex align="center" gap={3}>
              <Image src={policy_summary} alt="Policy Summary" boxSize="20px" />
              <Text fontSize="15px" fontWeight="500">
                Leave policy summary
              </Text>
            </Flex>
            <Button
              borderWidth={2}
              shadow={"sm"}
              variant="outline"
              color={"#274066"}
            >
              View policy
            </Button>
          </Flex>
        </Box>

        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #cccccc"
          mt={3}
          pt={4}
          mb={4}
          overflowY="auto"
        >
          <Flex justifyContent={"space-between"}>
            <Text fontSize="xl" fontWeight="700" ml={4} mt={1}>
              Leave rollover request
            </Text>

            {/* Filters Header Row */}
            <Box bg="transparent" px={4}>
              <Flex
                justify="space-between"
                align="center"
                gap={3}
                wrap="wrap"
                mb={3}
              >
                <Flex align="center" gap={3}>
                  {/* Search input */}
                  <Box
                    position="relative"
                    w={searchExpand ? "320px" : "210px"}
                    overflow="hidden"
                    _focusWithin={{
                      borderColor: "#cccccc",
                      boxShadow: "none",
                    }}
                  >
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="#757575" mt={2} />
                      </InputLeftElement>
                      {!search && (
                        <Text
                          key={`${placeholderIndex}-${searchExpand}`}
                          position="absolute"
                          left="30px"
                          top="50%"
                          transform="translateY(-50%)"
                          fontSize="14px"
                          fontFamily="Poppins"
                          fontWeight={"400"}
                          color="#757575"
                          pointerEvents="none"
                          animation="slideFade 3s ease-in-out"
                          whiteSpace="nowrap"
                        >
                          {searchExpand
                            ? placeholderexpandsearch[placeholderIndex]
                            : placeholders[placeholderIndex]}
                        </Text>
                      )}

                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setSearchExpand(true)}
                        onBlur={() => {
                          if (!search) setSearchExpand(false);
                        }}
                        fontFamily="Poppins"
                        h="39px"
                        borderWidth="1.5px"
                        borderColor="#cccccc"
                        borderRadius="10px"
                        pl="30px"
                        _focus={{
                          borderColor: "#cccccc",
                          boxShadow: "none",
                        }}
                      />

                      {search && (
                        <InputRightElement>
                          <CloseButton
                            size="sm"
                            onClick={() => {
                              setSearch("");
                            }}
                          />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </Box>
                  <Box
                    // boxShadow="0px 0px 10px rgba(0, 0, 0, 0.08)"
                    shadow={"sm"}
                    // borderRadius="20px"
                  >
                    <FilterDropdownRollover
                      onApply={(filters) => {
                        setLeaveTypeFilter(filters.leaveTypes || []);
                      }}
                      onClear={() => {
                        setLeaveTypeFilter([]);
                      }}
                    />
                  </Box>
                  {/* Calendar button */}
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      bg="white"
                      borderRadius="8px"
                      border={"1px solid #cccccc"}
                      h="39px"
                      shadow={"md"}
                      // shadowRadius={12}
                    >
                      <IoMdCalendar size={18} color="#757575" />
                    </MenuButton>

                    <MenuList minW="260px" p={3}>
                      <Stack spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={1}>
                            From
                          </Text>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <IoMdCalendar style={{ opacity: 0.8 }} />
                            </InputLeftElement>
                            <Input
                              type="date"
                              value={tempFromDate}
                              onChange={(e) => setTempFromDate(e.target.value)}
                            />
                          </InputGroup>
                        </Box>

                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={1}>
                            To
                          </Text>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <IoMdCalendar style={{ opacity: 0.8 }} />
                            </InputLeftElement>
                            <Input
                              type="date"
                              value={tempToDate}
                              min={tempFromDate || undefined}
                              onChange={(e) => setTempToDate(e.target.value)}
                            />
                          </InputGroup>
                        </Box>

                        <Flex gap={2} justify="flex-end" pt={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTempFromDate("");
                              setTempToDate("");
                              setFromDate("");
                              setToDate("");
                            }}
                          >
                            Clear
                          </Button>

                          <Button
                            size="sm"
                            bg="#1A365D"
                            color="white"
                            _hover={{ bg: "blue.800" }}
                            onClick={() => {
                              setFromDate(tempFromDate);
                              setToDate(tempToDate);
                            }}
                          >
                            Apply
                          </Button>
                        </Flex>
                      </Stack>
                    </MenuList>
                  </Menu>

                  {/* More menu */}
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      bg="white"
                      borderRadius="8px"
                      border="1px solid #cccccc"
                      px={3}
                      py={2}
                      h="39px"
                      shadow={"md"}
                    >
                      <Flex align="center" justify="center" w="100%">
                        <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                      </Flex>
                    </MenuButton>

                    <MenuList
                      minW="220px"
                      borderRadius="8px"
                      boxShadow="lg"
                      py={0}
                    >
                      <MenuItem px={4} py={3}>
                        <HStack spacing={3}>
                          <Box
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon
                              as={AiOutlineFile}
                              boxSize={5}
                              color="gray.700"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight={600}>
                              Export as .csv
                            </Text>
                          </Box>
                        </HStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </Flex>
            </Box>
          </Flex>

          <Box
            w="100%"
            h="1.5px"
            bgImage="repeating-linear-gradient(
            to right,
            #C7C7C7 0 6px,
            transparent 6px 14px
            )"
            mb={4}
          />

          {/* Status chips row */}
          <Flex gap={3} mb={4} align="center" wrap="wrap" px={4}>
            <Text fontWeight={600} minW="120px">
              Current Status
            </Text>

            <HStack spacing={2} wrap="wrap">
              {[
                // {
                //   label: "Approved",
                //   key: "APPROVED",
                //   color: "green",
                //   bg: "#cdeed0",
                //   border: "#a8e3ae",
                //   tcolor: "#74D27E",
                // },
                // {
                //   label: "Pending",
                //   key: "PENDING",
                //   color: "orange",
                //   bg: "#fdf8ed",
                //   border: "#f8ecd6",
                //   tcolor: "#f9d59a",
                // },
                // {
                //   label: "Rejected",
                //   key: "REJECTED",
                //   color: "red",
                //   bg: "#fce8e6",
                //   border: "#fce2df",
                //   tcolor: "#fbbab4",
                // },
                { label: "Approved", key: "APPROVED", color: "green" },
                { label: "Pending", key: "PENDING", color: "orange" },
                { label: "Rejected", key: "REJECTED", color: "red" },
              ].map((s) => {
                const active = statusFilter === s.key;
                const anySelected = Boolean(statusFilter);
                const faded = anySelected && !active;

                return (
                  <Button
                    key={s.key}
                    size="sm"
                    onClick={() =>
                      setStatusFilter((prev) => (prev === s.key ? "" : s.key))
                    }
                    position="relative"
                    borderRadius="full"
                    px={6}
                    py={1.5}
                    h="36px"
                    _focus={{ boxShadow: "none" }}
                    borderWidth="1px"
                    borderColor={
                      active ? `${s.color}.300` : faded ? "gray.200" : "#cccccc"
                    }
                    bg={active ? `${s.color}.100` : "transparent"}
                    color={active ? `${s.color}.600` : "gray.700"}
                    opacity={faded ? 0.45 : 1}
                    transition="all 0.2s ease"
                    _hover={{
                      bg: active
                        ? `${s.color}.200`
                        : faded
                          ? "transparent"
                          : "gray.50",
                    }}
                  >
                    <Text
                      fontSize="14px"
                      fontWeight={600}
                      letterSpacing="-0.03em"
                      fontFamily="Poppins"
                    >
                      {s.label}
                    </Text>

                    {/* {active && (
                      <Box
                        position="absolute"
                        top="-7px"
                        right="-7px"
                        w="22px"
                        h="22px"
                        borderRadius="full"
                        bg={`${s.color}.400`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="2px solid white"
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter("");
                        }}
                      >
                        <Icon
                          viewBox="0 0 24 24"
                          boxSize="11px"
                          color="gray.900"
                        >
                          <path
                            fill="currentColor"
                            d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                          />
                        </Icon>
                      </Box>
                    )} */}
                    {active && (
                      <CloseButton
                        position="absolute"
                        top="-10px"
                        right="4px"
                        boxSize="20px"
                        minW="20px"
                        h="20px"
                        p="0"
                        fontSize="9px"
                        bg="#E5F4EC"
                        color="#000"
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter("");
                        }}
                        aria-label={`Clear ${s.label}`}
                        _hover={{ bg: "#C6EAD8" }}
                      />
                    )}
                  </Button>
                );
              })}
            </HStack>
          </Flex>

          <Box
            w="100%"
            h="1.5px"
            bgImage="repeating-linear-gradient(
            to right,
            #C7C7C7 0 6px,
            transparent 6px 14px
            )"
            mb={4}
          />

          <style>
            {`
@keyframes slideFade {
  0% {
    opacity: 0;
    transform: translateY(-18px);
  }
  30% {
    opacity: 1;
    transform: translateY(-50%);
  }
  70% {
    opacity: 1;
    transform: translateY(-50%);
  }
  100% {
    opacity: 0;
    transform: translateY(18px);
  }
}
`}
          </style>

          <LeaveRolloverTable
            status={statusFilter}
            search={search}
            fromDate={fromDate}
            toDate={toDate}
            leaveTypeIds={leaveTypeFilter}
          />
        </Box>
      </Box>
    );
  }

  if (view === "my_requests") {
    return <LeaveRolloverRequest onBack={() => setView("apply")} />;
  }

  /* ================= APPLY FORM ================= */
  return (
    <Box
      fontFamily="Poppins"
      h="100vh"
      overflowY="auto"
      bg="#F6F7FB"
      // p={3}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
      <Box
        bg="white"
        borderRadius="12px"
        border="1px solid #cccccc"
        p={4}
        mb={2}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="700">
            Leave rollover request
          </Text>

          <Button
            bg="#274167"
            color="white"
            fontSize="13px"
            fontWeight={500}
            px={4}
            py={2}
            borderRadius="8px"
            _hover={{ bg: "#1f3143" }}
            onClick={() => setView("my_requests")}
          >
            My requests
          </Button>
        </Flex>

        <Flex
          align="center"
          justify="space-between"
          border="1px solid #cccccc"
          borderRadius="10px"
          p={3}
        >
          <Flex align="center" gap={3}>
            <Image src={policy_summary} alt="Policy Summary" boxSize="20px" />
            <Text fontSize="15px" fontWeight="500">
              Policy summary
            </Text>
          </Flex>
          <Button variant="outline" color={"#274066"}>
            View policy
          </Button>
        </Flex>
      </Box>

      <Box
        bg="white"
        borderRadius="10px"
        border="1px solid #cccccc"
        mt={3}
        pt={4}
        mb={4}
      >
        <Text fontSize="xl" fontWeight="700" ml={8}>
          Rollover request form
        </Text>

        <Box
          h="1px"
          w="100%"
          bgImage={`repeating-linear-gradient(
          to right,
          #C7C7C7 0,
          #C7C7C7 10px,
          transparent 5px,
          transparent 18px
        )`}
          my={4}
        />

        <Box
          bg="white"
          borderRadius="12px"
          // border="1px solid #cccccc"h
          p={4}
          m={4}
          noValidate
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          overflowY="auto"
        >
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.leaveTypeId} isRequired>
              <FormLabel>Leave type</FormLabel>

              {loadingLeaveTypes ? (
                <Spinner size="sm" />
              ) : (
                <Controller
                  control={control}
                  name="leaveTypeId"
                  rules={{ required: "Please select a leave type" }}
                  render={({ field }) => (
                    <Select placeholder="Select" {...field} {...inputStyle}>
                      {leaveTypes.map((leave) => (
                        <option key={leave._id} value={leave._id}>
                          {leave.leave_name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              )}

              <FormErrorMessage>{errors.leaveTypeId?.message}</FormErrorMessage>
            </FormControl>

            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="600" color="black">
                Note:
              </Text>{" "}
              Remaining number of unused leaves -{" "}
              <Text as="span" fontWeight="700">
                {loadingRemaining
                  ? "..."
                  : remainingDays !== null
                    ? remainingDays
                    : "_._ _"}
              </Text>{" "}
              day(s)
            </Text>

            <FormControl isInvalid={!!errors.daysToRollover} isRequired>
              <FormLabel>Carry forward</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  placeholder="Enter Carry forward days"
                  min={1}
                  step={1}
                  onWheel={(e) => e.target.blur()}
                  {...register("daysToRollover", {
                    required: "Please enter days",
                    min: {
                      value: 1,
                      message: "Days must be greater than 0",
                    },
                    setValueAs: (v) => (v === "" ? "" : Number(v)),
                  })}
                  {...inputStyle}
                  borderColor={errors.daysToRollover ? "#E53E3E" : "#D0D5DD"}
                  _focus={{
                    borderColor: errors.daysToRollover ? "#E53E3E" : "",
                    boxShadow: errors.daysToRollover ? "0 0 0 1px #E53E3E" : "",
                  }}
                />
                <InputRightElement pointerEvents="none" w="70px" mt={2}>
                  <Text fontSize="sm" color="gray.600">
                    day(s)
                  </Text>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.daysToRollover?.message}
              </FormErrorMessage>
            </FormControl>

            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="600" color="black">
                Note:
              </Text>{" "}
              The maximum number of days that can be carry forwarded is{" "}
              <Text as="span" fontWeight="700">
                {selectedLeave?.carry_forward?.max_days ?? "_._ _"}
              </Text>{" "}
              day(s)
            </Text>

            <FormControl>
              <FormLabel>Encashment</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  placeholder="Enter Encashment days"
                  min={0}
                  step={1}
                  onWheel={(e) => e.target.blur()}
                  {...register("encashment", {
                    setValueAs: (v) => (v === "" ? 0 : Number(v)),
                    min: {
                      value: 0,
                      message: "Encashment cannot be negative",
                    },
                  })}
                  {...inputStyle}
                />
                <InputRightElement pointerEvents="none" w="70px" mt={2}>
                  <Text fontSize="sm" color="gray.600">
                    day(s)
                  </Text>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="600" color="black">
                Note:
              </Text>{" "}
              Encashment pay type is{" "}
              <Text as="span" fontWeight="700">
                {selectedLeave?.encashment?.pay_basis === "BASIC_PAY"
                  ? "Basic Pay"
                  : selectedLeave?.encashment?.pay_basis === "FULL_PAY"
                    ? "Full Pay"
                    : "Full Pay"}
              </Text>{" "}
              and the maximum number of day(s) that can be encashed is{" "}
              <Text as="span" fontWeight="700">
                {selectedLeave
                  ? selectedLeave?.encashment?.enabled
                    ? (selectedLeave?.encashment?.max_days ?? "-")
                    : "Not available"
                  : "_._ _"}
              </Text>{" "}
              day(s)
            </Text>

            <FormControl isRequired isInvalid={!!errors.reason}>
              <FormLabel>Reason</FormLabel>
              <Textarea
                {...register("reason", { required: "Reason is required" })}
                {...inputStyle}
              />
              <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
            </FormControl>

            <Flex justify="space-between">
              <Button
                bg="white"
                color="#757575"
                fontWeight={500}
                onClick={() => reset()}
                _hover={{ bg: "#F7F7F8" }}
                borderRadius="8px"
                px={6}
                py={2}
              >
                Cancel
              </Button>
              <Button
                bg="#274167"
                color="white"
                _hover={{ bg: "#1f3143" }}
                type="submit"
                fontWeight={500}
                isLoading={isSubmitting}
                borderRadius="8px"
                px={8}
                py={2}
              >
                Apply
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
