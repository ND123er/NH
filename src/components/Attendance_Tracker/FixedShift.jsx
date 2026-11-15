import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiCalendar, FiInfo, FiUser } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import api from "../../api/axios";
// import AssignTab from "./AssignTab";

const WEEK_DAYS = [
  { number: 1, label: "Mon" },
  { number: 2, label: "Tue" },
  { number: 3, label: "Wed" },
  { number: 4, label: "Thu" },
  { number: 5, label: "Fri" },
  { number: 6, label: "Sat" },
  { number: 7, label: "Sun" },
];

const formatTime = (value) => {
  if (!value) return "--:--";
  return value;
};

const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
  const date = parseDate(value);
  if (!date) return "--";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonday = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + mondayOffset);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const differenceInDays = (from, to) => {
  const first = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const second = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((first.getTime() - second.getTime()) / 86400000);
};

const getCalendarDayNumber = (date) => {
  const nativeDay = date.getDay();
  return nativeDay === 0 ? 7 : nativeDay;
};

const FixedShift = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  const [shifts, setShifts] = useState([]);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [calendarStart, setCalendarStart] = useState(null);
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 8, 1));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      shiftId: "",
      selectedEmployees: [],
      effectiveFrom: "",
      noEndDate: true,
      effectiveUntil: "",
    },
  });

  const shiftId = watch("shiftId");
  const selectedEmployees = watch("selectedEmployees") || [];
  const effectiveFrom = watch("effectiveFrom");
  const noEndDate = watch("noEndDate");
  const effectiveUntil = watch("effectiveUntil");

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift._id === shiftId),
    [shifts, shiftId],
  );

  const workingDayNumbers = useMemo(() => {
    if (!selectedShift) return [];
    return (selectedShift.working_days || [])
      .filter((day) => Number(day) >= 1 && Number(day) <= 7)
      .map(Number);
  }, [selectedShift]);

  const isWorkingDay = (date) =>
    workingDayNumbers.includes(getCalendarDayNumber(date));

  const fetchShifts = async () => {
    try {
      setShiftLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);
      const res = await api.get(
        `/settings/get_company_shift_list?org_id=${encodeURIComponent(orgId || "")}`,
      );
      setShifts(res?.data?.list || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast({
        title: "Failed to fetch shifts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setShiftLoading(false);
    }
  };

  const fetchEmployees = async (searchValue = "") => {
    try {
      setEmployeeLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);
      const url = `/employee/get_employees_list?org_id=${encodeURIComponent(
        orgId || "",
      )}&employee_id=${encodeURIComponent(
        user?.employee_id || "",
      )}&search=${encodeURIComponent(searchValue.trim())}&offset=0&limit=20`;

      const res = await api.get(url);
      setEmployees(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchEmployees("");
  }, []);

  useEffect(() => {
    if (!effectiveFrom) {
      setCalendarStart(null);
      return;
    }

    const effectiveDate = parseDate(effectiveFrom);
    setCalendarStart(getMonday(effectiveDate));
    setCalendarMonth(
      new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), 1),
    );
  }, [effectiveFrom]);

  const calendarDays = useMemo(() => {
    if (!calendarMonth) return [];

    const monthStart = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const monthEnd = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    );

    const start = getMonday(monthStart);
    const end = addDays(getMonday(monthEnd), 6);
    const days = [];

    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
      days.push(new Date(date));
    }

    return days;
  }, [calendarMonth]);

  const calendarWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    return weeks;
  }, [calendarDays]);

  const scheduleRangeText = useMemo(() => {
    if (!effectiveFrom) return "Select effective date";

    if (noEndDate) {
      return `${formatDisplayDate(effectiveFrom)} – Ongoing`;
    }

    if (effectiveUntil) {
      return `${formatDisplayDate(effectiveFrom)} – ${formatDisplayDate(effectiveUntil)}`;
    }

    return `${formatDisplayDate(effectiveFrom)} – End date not set`;
  }, [effectiveFrom, effectiveUntil, noEndDate]);

  const handleEmployeeSearch = (value) => {
    setSearch(value);
    fetchEmployees(value);
  };

  const addEmployee = (employee) => {
    const alreadySelected = selectedEmployees.some(
      (item) => item.employee_id === employee.employee_id,
    );
    if (alreadySelected) return;

    setValue("selectedEmployees", [...selectedEmployees, employee], {
      shouldDirty: true,
    });
    setSearch("");
    setEmployees([]);
  };

  const removeEmployee = (employeeId) => {
    setValue(
      "selectedEmployees",
      selectedEmployees.filter((item) => item.employee_id !== employeeId),
      { shouldDirty: true },
    );
  };

  // const onSubmit = async (values) => {
  //   console.log("Fixed shift assignment values:", {
  //     organisation_id: getOrgIdFromReduxOrStorage(user),
  //     shift_id: values.shiftId,
  //     employees: values.selectedEmployees,
  //     effective_from: values.effectiveFrom,
  //     no_end_date: values.noEndDate,
  //     effective_until: values.noEndDate ? null : values.effectiveUntil,
  //   });

  //   toast({
  //     title: "Fixed shift details ready",
  //     status: "success",
  //     duration: 3000,
  //     isClosable: true,
  //   });
  // };
  //new
  // const onSubmit = async (values) => {
  //   try {
  //     setAssignmentStatus("Assigning...");

  //     const orgId = getOrgIdFromReduxOrStorage(user);

  //     const payload = {
  //       organisation_id: orgId,
  //       employee_ids: values.selectedEmployees.map(
  //         (employee) => employee.employee_id,
  //       ),
  //       type: "FIXED",
  //       shift_id: values.shiftId,
  //       start_date: values.effectiveFrom,
  //       // end_date: values.noEndDate ? null : values.effectiveUntil,
  //       end_date: null,
  //     };

  //     const response = await api.post("/schedules/assignments", payload);

  //     const commandId =
  //       response?.data?.command_id || response?.data?.data?.command_id;

  //     if (!commandId) {
  //       throw new Error("Command ID was not returned from assignment API.");
  //     }

  //     let completed = false;

  //     while (!completed) {
  //       await new Promise((resolve) => setTimeout(resolve, 2000));

  //       const commandResponse = await api.get(
  //         `/schedules/commands/${commandId}?organisation_id=${encodeURIComponent(
  //           orgId || "",
  //         )}`,
  //       );

  //       const status =
  //         commandResponse?.data?.data?.status || commandResponse?.data?.status;

  //       if (commandResponse.status === 202 && status === "PENDING") {
  //         setAssignmentStatus("Assigning...");
  //         continue;
  //       }

  //       if (commandResponse.status === 200 && status === "COMPLETED") {
  //         completed = true;
  //         setAssignmentStatus("");

  //         toast({
  //           title: "Fixed shift assigned successfully",
  //           status: "success",
  //           duration: 3000,
  //           isClosable: true,
  //         });

  //         // Refresh calendar-related data
  //         await fetchShifts();

  //         continue;
  //       }

  //       if (commandResponse.status === 200 && status === "FAILED") {
  //         completed = true;
  //         setAssignmentStatus("");

  //         toast({
  //           title:
  //             commandResponse?.data?.data?.error?.message ||
  //             commandResponse?.data?.error?.message ||
  //             "Failed to assign fixed shift",
  //           status: "error",
  //           duration: 5000,
  //           isClosable: true,
  //         });

  //         continue;
  //       }

  //       // Handle an unexpected response
  //       completed = true;
  //       setAssignmentStatus("");

  //       toast({
  //         title: "Unable to determine assignment status",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Fixed shift assignment error:", error);

  //     setAssignmentStatus("");

  //     toast({
  //       title:
  //         error?.response?.data?.error?.message ||
  //         error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to assign fixed shift",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };
  //new
  const onSubmit = async (values) => {
    if (!values.shiftId) {
      toast({
        title: "Shift is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!values.selectedEmployees?.length) {
      toast({
        title: "Employee is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!values.effectiveFrom) {
      toast({
        title: "Effective from date is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setAssignmentStatus("Assigning...");

      const orgId = getOrgIdFromReduxOrStorage(user);

      const payload = {
        organisation_id: orgId,
        employee_ids: values.selectedEmployees.map(
          (employee) => employee.employee_id,
        ),
        type: "FIXED",
        shift_id: values.shiftId,
        start_date: values.effectiveFrom,
        end_date: null,
      };

      const response = await api.post("/schedules/assignments", payload);

      const results = response?.data?.results || [];

      const commandResults = await Promise.all(
        results
          .filter((item) => item.command_id)
          .map(async (item) => {
            const commandResponse = await api.get(
              `/schedules/commands/${item.command_id}?organisation_id=${encodeURIComponent(orgId)}`,
            );

            return {
              employee_id: item.employee_id,
              command_id: item.command_id,
              httpStatus: commandResponse.status,
              data: commandResponse.data,
            };
          }),
      );

      // console.log("Schedule command results:", commandResults);

      // const isSuccess =
      //   response?.status === 202 &&
      //   results.length > 0 &&
      //   results.every((item) => item?.status === 202);

      // if (!isSuccess) {
      //   const failedResults = results.filter((item) => item?.status !== 202);

      //   toast({
      //     title: failedResults[0]?.msg || "Failed to assign fixed shift",
      //     status: "error",
      //     duration: 5000,
      //     isClosable: true,
      //   });

      //   setAssignmentStatus("");
      //   return;
      // }

      // setAssignmentStatus("");

      // toast({
      //   title: "Fixed shift assignment completed",
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      // });

      const commandStatuses = commandResults.map(
        (item) => item.data?.data?.status || item.data?.status || "UNKNOWN",
      );

      const hasCommandIds = results.some((item) => item.command_id);

      const isSuccess = hasCommandIds
        ? response?.status === 202 &&
          commandStatuses.length ===
            results.filter((item) => item.command_id).length &&
          commandStatuses.every((status) => status === "COMPLETED") &&
          results
            .filter((item) => !item.command_id)
            .every((item) => Number(item.status) === 202)
        : response?.status === 202 &&
          results.length > 0 &&
          results.every((item) => Number(item.status) === 202);

      if (!isSuccess) {
        const failedResult = results.find(
          (item) => !item.command_id && Number(item.status) !== 202,
        );

        setAssignmentStatus("");

        toast({
          title:
            commandStatuses.find((status) => status !== "COMPLETED") ||
            failedResult?.msg ||
            "Failed to assign fixed shift",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        return;
      }

      setAssignmentStatus("");

      toast({
        title: "Fixed shift assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchShifts();
      reset({
        shiftId: "",
        selectedEmployees: [],
        effectiveFrom: "",
        noEndDate: true,
        effectiveUntil: "",
      });

      setSearch("");
      setEmployees([]);
    } catch (error) {
      console.error("Fixed shift assignment error:", error);

      setAssignmentStatus("");

      toast({
        title:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to assign fixed shift",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Box
      bg="#F6F8FB"
      minH="100vh"
      fontFamily="Poppins"
      p={{ base: 3, md: 4, lg: 5 }}
    >
      {/* <AssignTab /> */}

      <Grid
        gap={3}
        alignItems="stretch"
        mt={4}
        className="
          fixedform
        "
      >
        {/* LEFT CARD */}
        <GridItem>
          <Box
            bg="#FFFFFF"
            border="1px solid #DDE3EA"
            borderRadius="7px"
            p={{ base: 4, md: 5 }}
            h="100%"
          >
            <Text fontSize="20px" fontWeight="700" color="#0F172A" mb={4}>
              Assignment details
            </Text>

            {/* Shift */}
            <Box mb={4}>
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Shift
              </Text>

              <Controller
                name="shiftId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="sm"
                    value={field.value}
                    placeholder={
                      shiftLoading ? "Loading shifts..." : "Select shift"
                    }
                    fontSize="13px"
                    color="#334155"
                    borderColor="#CBD5E1"
                    borderRadius="6px"
                    h="35px"
                    icon={<ChevronDownIcon />}
                  >
                    {shifts
                      .filter((shift) => shift.is_active !== false)
                      .map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.shift_name} · {formatTime(shift.start)}–
                          {formatTime(shift.end)}
                        </option>
                      ))}
                  </Select>
                )}
              />

              <Text mt={1} fontSize="11px" color="#64748B">
                {selectedShift?.working_days?.length
                  ? `${workingDayNumbers.length} configured working day${workingDayNumbers.length === 1 ? "" : "s"}`
                  : "Working days come from the selected shift."}
              </Text>
            </Box>

            {/* Employees */}
            <Box mb={4} position="relative">
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Employees
              </Text>

              <Box
                border="1.5px solid #cccccc"
                borderRadius="10px"
                minH="39px"
                px={2}
                display="flex"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                bg="#FFFFFF"
              >
                {selectedEmployees.map((employee) => (
                  <Box
                    key={employee.employee_id}
                    bg="#E7F0FC"
                    color="#334155"
                    px={1.5}
                    py={1}
                    borderRadius="5px"
                    fontSize="12px"
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FiUser} boxSize="12px" color="#1769E0" mr={1.5} />
                    {employee.full_name}
                    <Text
                      as="span"
                      ml={2}
                      color="#64748B"
                      cursor="pointer"
                      onClick={() => removeEmployee(employee.employee_id)}
                    >
                      ×
                    </Text>
                  </Box>
                ))}

                <Input
                  value={search}
                  onChange={(e) => handleEmployeeSearch(e.target.value)}
                  placeholder={
                    selectedEmployees.length === 0
                      ? "Search by Full Name or Employee ID"
                      : "Search employees"
                  }
                  border="none"
                  boxShadow="none"
                  flex="1"
                  minW="150px"
                  h="32px"
                  fontFamily="Poppins"
                  fontSize="13px"
                  _focus={{ border: "none", boxShadow: "none" }}
                />
              </Box>

              {search && employees.length > 0 && (
                <Box
                  position="absolute"
                  top="67px"
                  left="0"
                  right="0"
                  bg="white"
                  border="1px solid #CBD5E1"
                  borderRadius="6px"
                  boxShadow="sm"
                  zIndex={20}
                  maxH="200px"
                  overflowY="auto"
                >
                  {employees.map((employee) => (
                    <Box
                      key={employee.employee_id}
                      px={3}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "#F1F5F9" }}
                      onClick={() => addEmployee(employee)}
                    >
                      <Text fontSize="13px" color="#334155">
                        {employee.full_name}
                      </Text>
                      <Text fontSize="11px" color="#64748B">
                        {employee.employee_code}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}

              {search && employeeLoading && (
                <Text mt={1} fontSize="11px" color="#64748B">
                  Searching employees...
                </Text>
              )}

              <Text mt={1} fontSize="11px" color="#64748B">
                {selectedEmployees.length} employee
                {selectedEmployees.length === 1 ? "" : "s"} selected
              </Text>
            </Box>

            {/* Effective Dates */}
            <Grid templateColumns="1fr 1fr" gap={3} mb={2}>
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                  Effective from
                </Text>
                <Box position="relative">
                  <Controller
                    name="effectiveFrom"
                    control={control}
                    render={({ field }) => (
                      // <Input
                      //   {...field}
                      //   type="date"
                      //   pl="34px"
                      //   h="35px"
                      //   fontSize="12px"
                      //   borderColor="#CBD5E1"
                      //   borderRadius="6px"
                      //   onChange={(e) => {
                      //     const value = e.target.value;
                      //     field.onChange(value);
                      //     if (
                      //       !noEndDate &&
                      //       effectiveUntil &&
                      //       value > effectiveUntil
                      //     ) {
                      //       setValue("effectiveUntil", value);
                      //     }
                      //   }}
                      // />
                      <Input
                        {...field}
                        type="date"
                        pl="34px"
                        h="35px"
                        fontSize="12px"
                        borderColor="#CBD5E1"
                        borderRadius="6px"
                        onChange={(e) => {
                          const value = e.target.value;
                          const today = formatDateInput(new Date());

                          if (value === today) {
                            toast({
                              title: "Invalid date",
                              description: "Today’s date cannot be selected.",
                              status: "warning",
                              duration: 3000,
                              isClosable: true,
                            });
                            return;
                          }

                          field.onChange(value);

                          if (
                            !noEndDate &&
                            effectiveUntil &&
                            value > effectiveUntil
                          ) {
                            setValue("effectiveUntil", value);
                          }
                        }}
                      />
                    )}
                  />
                  <Icon
                    as={FiCalendar}
                    position="absolute"
                    left="10px"
                    top="9px"
                    color="#475569"
                    boxSize="15px"
                    pointerEvents="none"
                  />
                </Box>
              </Box>

              <Box>
                {/* <Flex align="center" mb={1.5} h="18px">
                  <Controller
                    name="noEndDate"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        isChecked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          if (e.target.checked) setValue("effectiveUntil", "");
                        }}
                        size="sm"
                        colorScheme="blue"
                        fontSize="12px"
                        color="#334155"
                      >
                        No end date
                      </Checkbox>
                    )}
                  />
                </Flex> */}

                {/* <Box position="relative">
                  <Controller
                    name="effectiveUntil"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        min={effectiveFrom || undefined}
                        isDisabled={noEndDate}
                        placeholder="--"
                        pl="34px"
                        h="35px"
                        fontSize="12px"
                        borderColor="#CBD5E1"
                        borderRadius="6px"
                        bg={noEndDate ? "#F1F5F9" : "#FFFFFF"}
                      />
                    )}
                  />
                  <Icon
                    as={FiCalendar}
                    position="absolute"
                    left="10px"
                    top="9px"
                    color="#94A3B8"
                    boxSize="15px"
                    pointerEvents="none"
                  />
                </Box> */}
              </Box>
            </Grid>

            {/* Shift details */}
            <Box
              mt={4}
              border="1px solid #DDE3EA"
              borderRadius="6px"
              p={2}
              bg="#F8FAFC"
            >
              <Text fontSize="13px" fontWeight="700" color="#1E293B" mb={3}>
                Shift details
              </Text>

              <Flex align="stretch">
                <Box minW="115px" pr={4}>
                  <Text fontSize="11px" color="#475569" mb={1.5}>
                    Hours
                  </Text>
                  <Text fontSize="12px" fontWeight="700" color="#1E293B">
                    {selectedShift
                      ? `${formatTime(selectedShift.start)}–${formatTime(selectedShift.end)}`
                      : "--:--–--:--"}
                  </Text>
                </Box>

                <Box borderLeft="1px solid #DCE3EB" pl={4} flex="1">
                  <Text fontSize="11px" color="#475569" mb={1.5}>
                    Working days
                  </Text>
                  <HStack spacing={1} flexWrap="wrap">
                    {WEEK_DAYS.map((day) => {
                      const active = workingDayNumbers.includes(day.number);
                      return (
                        <Box
                          key={day.number}
                          minW="40px"
                          textAlign="center"
                          px={1.5}
                          py={1}
                          borderRadius="5px"
                          bg={active ? "#DCEBFF" : "#E9EDF1"}
                          color={active ? "#1769E0" : "#64748B"}
                          fontSize="11px"
                          fontWeight="500"
                        >
                          {day.label}
                        </Box>
                      );
                    })}
                  </HStack>
                  <Text mt={1.5} fontSize="11px" color="#64748B">
                    {selectedShift
                      ? `${
                          WEEK_DAYS.filter((day) =>
                            workingDayNumbers.includes(day.number),
                          )
                            .map((day) => day.label)
                            .join(", ") || "No configured working days"
                        }`
                      : "Working days come from the selected shift."}
                  </Text>
                </Box>
              </Flex>

              <Text mt={3} fontSize="10px" color="#7B8794">
                Working days come from the selected shift.
              </Text>
            </Box>
          </Box>
        </GridItem>

        {/* RIGHT CARD */}
        <GridItem>
          <Box
            bg="#FFFFFF"
            border="1px solid #DDE3EA"
            borderRadius="7px"
            p={{ base: 4, md: 5 }}
            h="100%"
          >
            <Flex
              justify="space-between"
              align="center"
              mb={5}
              flexWrap="wrap"
              gap={3}
            >
              <Box>
                <Text fontSize="20px" fontWeight="700" color="#0F172A">
                  Schedule preview
                </Text>

                <Text fontSize="14px" color="#667085" mt={1}>
                  {scheduleRangeText}
                </Text>
              </Box>

              {/* <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  leftIcon={<ChevronLeftIcon />}
                  borderColor="#D0D5DD"
                  color="#344054"
                  bg="#FFFFFF"
                  _hover={{ bg: "#F9FAFB" }}
                />

                <Button
                  variant="outline"
                  h="32px"
                  minW="150px"
                  px={3}
                  borderColor="#CBD5E0"
                  borderRadius="6px"
                  bg="#FFFFFF"
                  color="#1D2939"
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: "#F9FAFB" }}
                  onClick={() => {
                    if (effectiveFrom) {
                      const date = parseDate(effectiveFrom);
                      setCalendarMonth(
                        new Date(date.getFullYear(), date.getMonth(), 1),
                      );
                    }
                  }}
                >
                  {calendarMonth.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  rightIcon={<ChevronRightIcon />}
                  borderColor="#D0D5DD"
                  color="#344054"
                  bg="#FFFFFF"
                  _hover={{ bg: "#F9FAFB" }}
                />
              </HStack> */}
              <HStack spacing={2}>
                {/* <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setCalendarMonth(new Date())}
                >
                  Today
                </Button> */}

                <Button
                  size="sm"
                  variant="ghost"
                  fontSize="30px"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  leftIcon={<ChevronLeftIcon />}
                />

                <HStack spacing={2}>
                  <select
                    value={calendarMonth.getMonth()}
                    onChange={(event) => {
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          Number(event.target.value),
                          1,
                        ),
                      );
                    }}
                    style={{
                      // height: "32px",
                      // fontSize: "14px",
                      // fontWeight: "600",
                      // background: "#FFFFFF",
                      // cursor: "pointer",
                      height: "32px",
                      border: "none",
                      outline: "none",
                      padding: "0 8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: "transparent",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={calendarMonth.getFullYear()}
                    onChange={(event) => {
                      setCalendarMonth(
                        new Date(
                          Number(event.target.value),
                          calendarMonth.getMonth(),
                          1,
                        ),
                      );
                    }}
                    style={{
                      // height: "32px",
                      // fontSize: "14px",
                      // fontWeight: "600",
                      // background: "#FFFFFF",
                      // cursor: "pointer",
                      height: "32px",
                      border: "none",
                      outline: "none",
                      padding: "0 8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: "transparent",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    {Array.from({ length: 201 }, (_, index) => {
                      const year = 1900 + index;

                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </HStack>

                <Button
                  size="md"
                  border="unset"
                  variant="ghost"
                  fontSize="30px"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  rightIcon={<ChevronRightIcon />}
                />
              </HStack>
            </Flex>

            <Box
              bg="#fff"
              borderRadius="14px"
              border="1px solid #cccccc"
              boxShadow="md"
              overflow="hidden"
            >
              <Grid
                templateColumns="repeat(7, 1fr)"
                bg="#F8FAFC"
                borderBottom="1px solid #cccccc"
              >
                {WEEK_DAYS.map((day) => (
                  <Box
                    key={day.number}
                    py={2}
                    textAlign="center"
                    bg="#F3F6FA"
                    borderRight="1px solid #cccccc"
                    _last={{ borderRight: "none" }}
                  >
                    <Text
                      fontSize="14px"
                      fontWeight="400"
                      color="#000000"
                      fontFamily="'Poppins', sans-serif"
                    >
                      {day.label}
                    </Text>
                  </Box>
                ))}
              </Grid>

              <Grid templateColumns="repeat(7, 1fr)">
                {calendarWeeks.flatMap((week, weekIndex) =>
                  week.map((date, dayIndex) => {
                    if (!date) {
                      return (
                        <Box
                          key={`empty-${weekIndex}-${dayIndex}`}
                          minH={{ base: "85px", md: "120px" }}
                          bg="#FBFCFD"
                          borderRight="1px solid #E4E7EC"
                          borderBottom="1px solid #E4E7EC"
                          _last={{ borderRight: "none" }}
                        />
                      );
                    }

                    const working = isWorkingDay(date);
                    // No end date means the fixed shift continues indefinitely.
                    // When an end date exists, the shift stops after that date.
                    const inEffectiveRange =
                      (!effectiveFrom ||
                        formatDateInput(date) >= effectiveFrom) &&
                      (noEndDate ||
                        !effectiveUntil ||
                        formatDateInput(date) <= effectiveUntil);

                    const showShift =
                      selectedShift && working && inEffectiveRange;

                    const isToday =
                      formatDateInput(date) === formatDateInput(new Date());

                    return (
                      <Box
                        key={formatDateInput(date)}
                        minH={{ base: "85px", md: "100px" }}
                        p={{ base: 2, md: 3 }}
                        borderRight="1px solid #E4E7EC"
                        borderBottom="1px solid #E4E7EC"
                        position="relative"
                        bg="white"
                        _hover={{ bg: "#F9FAFB" }}
                      >
                        {/* <Flex justify="space-between" align="center" mb={3}>
                          <Box
                            width="24px"
                            height="24px"
                            borderRadius="50%"
                            bg={isToday ? "#1F3661" : "transparent"}
                            color={isToday ? "white" : "#344054"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="14px" fontWeight="600">
                              {date.getDate()}
                            </Text>
                          </Box>
                        </Flex> */}
                        <Flex justify="space-between" align="center" mb={3}>
                          <Text
                            fontSize="12px"
                            fontWeight="500"
                            color={isToday ? "#1F3661" : "#000000"}
                          >
                            {date.toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                            })}
                          </Text>
                        </Flex>

                        <VStack spacing={1} align="start" width="100%">
                          {selectedShift ? (
                            showShift ? (
                              <>
                                <Box
                                  px={2}
                                  py={1.5}
                                  borderRadius="6px"
                                  bg="#E2EEFF"
                                  border="1px solid #BFD6F5"
                                  color="#1769E0"
                                  fontWeight="700"
                                  fontSize="10px"
                                  maxW="100%"
                                  overflow="hidden"
                                >
                                  <Text noOfLines={1}>
                                    {selectedShift.shift_name}
                                  </Text>
                                </Box>

                                <Text
                                  fontSize="9px"
                                  color="#667085"
                                  noOfLines={1}
                                >
                                  {formatTime(selectedShift.start)} -{" "}
                                  {formatTime(selectedShift.end)}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Box
                                  width="32px"
                                  height="32px"
                                  borderRadius="6px"
                                  bg="#F2F4F7"
                                  border="1px solid #D0D5DD"
                                  color="#667085"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontWeight="700"
                                  fontSize="11px"
                                >
                                  OFF
                                </Box>

                                <Text fontSize="9px" color="#667085">
                                  Week off
                                </Text>
                              </>
                            )
                          ) : null}
                        </VStack>
                      </Box>
                    );
                  }),
                )}
              </Grid>
            </Box>

            <Box borderTop="1px solid #E5EAF0" mt={5} pt={3}>
              <HStack spacing={2}>
                <Icon as={FiUser} boxSize={17} color="#475569" />
                <Text fontSize="12px" color="#334155">
                  {selectedEmployees.length} employee
                  {selectedEmployees.length === 1 ? "" : "s"}
                </Text>
                <Text fontSize="12px" color="#94A3B8">
                  ·
                </Text>
                <Text fontSize="12px" color="#334155">
                  {noEndDate
                    ? "No end date"
                    : effectiveUntil
                      ? formatDisplayDate(effectiveUntil)
                      : "End date not set"}
                </Text>
              </HStack>
            </Box>
          </Box>
        </GridItem>
      </Grid>

      {/* Bottom Action Bar */}
      <Flex
        mt={4}
        pt={3}
        borderTop="1px solid #DCE3EB"
        justify="flex-end"
        align="center"
        gap={3}
      >
        <HStack spacing={3}>
          <Button
            variant="outline"
            h="38px"
            px={5}
            borderColor="#CBD5E1"
            borderRadius="6px"
            fontSize="12px"
            fontWeight="500"
            color="#334155"
            bg="#FFFFFF"
            onClick={() => {
              reset();
              setSearch("");
              setEmployees([]);
            }}
          >
            Cancel
          </Button>

          {/* <Button
            h="38px"
            px={5}
            bg="#1769E0"
            color="#FFFFFF"
            borderRadius="6px"
            fontSize="12px"
            fontWeight="500"
            _hover={{ bg: "#1769E0" }}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Assign fixed shift
          </Button> */}
          <Button
            h="38px"
            px={5}
            bg="#274167"
            color="#FFFFFF"
            borderRadius="6px"
            fontSize="12px"
            fontWeight="500"
            // _hover={{ bg: "#1769E0" }}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Assign fixed shift"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default FixedShift;
