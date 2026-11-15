import React from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Select,
  Input,
  Checkbox,
  Button,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiCalendar, FiUsers, FiInfo } from "react-icons/fi";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import api from "../../api/axios";
// import AssignTab from "./AssignTab";

const AssignShift = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState("");
  const [patternLoading, setPatternLoading] = useState(false);
  //new
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState("");

  const limit = 20;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cycleStartDate, setCycleStartDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 8, 1));
  const [noEndDate, setNoEndDate] = useState(false);
  const fetchPatterns = async () => {
    try {
      setPatternLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(`/schedules/patterns?organisation_id=${orgId}`);

      setPatterns(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching shift patterns:", error);

      toast({
        title: "Failed to fetch shift patterns",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPatternLoading(false);
    }
  };
  useEffect(() => {
    fetchPatterns();
  }, []);
  const fetchEmployees = async (searchValue = "", offsetValue = 0) => {
    try {
      setLoadingEmployees(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const url = `/employee/get_employees_list?org_id=${encodeURIComponent(
        orgId || "",
      )}&employee_id=${encodeURIComponent(
        user?.employee_id || "",
      )}&search=${encodeURIComponent(
        searchValue.trim(),
      )}&offset=${offsetValue}&limit=${limit}`;

      const res = await api.get(url);

      const pageData = res?.data?.data || [];

      setEmployees(pageData);
      setOffset(offsetValue + pageData.length);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };
  useEffect(() => {
    fetchEmployees("", 0);
  }, []);

  const parseDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDayDifference = (date1, date2) => {
    const first = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
    );
    const second = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate(),
    );
    return Math.round(
      (first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const selectedPatternData = patterns.find(
    (pattern) => pattern._id === selectedPattern,
  );

  const patternDays = selectedPatternData?.days || [];

  const getPatternDay = (date) => {
    if (!cycleStartDate || patternDays.length === 0) return null;

    const cycleStart = parseDate(cycleStartDate);
    if (!cycleStart) return null;

    const difference = getDayDifference(date, cycleStart);
    const patternIndex =
      ((difference % patternDays.length) + patternDays.length) %
      patternDays.length;

    return {
      patternDay: patternDays[patternIndex],
      dayNumber: patternIndex + 1,
    };
  };

  const getShiftType = (patternDay) => {
    if (!patternDay) return "gray";

    const uniqueShiftIds = [
      ...new Set(
        patternDays.filter((day) => day !== null).map((day) => day.shift_id),
      ),
    ];

    const shiftIndex = uniqueShiftIds.indexOf(patternDay.shift_id);
    return shiftIndex === 1 ? "purple" : "blue";
  };

  const getCalendarLabel = (date) => {
    if (!cycleStartDate || patternDays.length === 0) return "";

    const cycleStart = parseDate(cycleStartDate);
    if (!cycleStart) return "";

    const difference = getDayDifference(date, cycleStart);

    if (difference === 0) return "Day 1";
    if (difference > 0 && difference % patternDays.length === 0)
      return "Cycle repeats";
    return "";
  };

  const generateCalendarWeeks = () => {
    const monthStart = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const firstDay = monthStart.getDay();
    const mondayOffset = firstDay === 0 ? -6 : 1 - firstDay;

    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() + mondayOffset);

    const monthEnd = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    );
    const lastDay = monthEnd.getDay();
    const sundayOffset = lastDay === 0 ? 0 : 7 - lastDay;

    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + sundayOffset);

    const weeks = [];
    let weekStart = new Date(calendarStart);

    while (weekStart <= calendarEnd) {
      const week = [];

      for (let i = 0; i < 7; i += 1) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);

        const start = startDate ? parseDate(startDate) : null;
        const end = endDate ? parseDate(endDate) : null;
        const inAssignmentRange =
          (!start || date >= start) && (!end || date <= end);

        week.push({
          date,
          inAssignmentRange,
          patternInfo: inAssignmentRange ? getPatternDay(date) : null,
        });
      }

      weeks.push(week);
      weekStart.setDate(weekStart.getDate() + 7);
    }

    return weeks;
  };

  const calendarWeeks = generateCalendarWeeks();
  const assignmentDays =
    startDate && endDate
      ? getDayDifference(parseDate(endDate), parseDate(startDate)) + 1
      : 0;

  const calendarMonthLabel = calendarMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const onSubmit = async () => {
    if (!selectedPattern) {
      toast({
        title: "Shift pattern is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedEmployees?.length) {
      toast({
        title: "Employee is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Start date is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!cycleStartDate) {
      toast({
        title: "Cycle start date is required",
        status: "warning",
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
        employee_ids: selectedEmployees.map((employee) => employee.employee_id),
        type: "ROTATIONAL",
        pattern_id: selectedPattern,
        start_date: startDate,
        end_date: endDate || null,
        anchor_date: cycleStartDate,
      };

      // const response = await api.post("/schedules/assignments", payload);

      // console.log("Rotational shift assignment response:", response.data);

      // setAssignmentStatus("");

      // toast({
      //   title: "Rotational shift assigned successfully",
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      // });
      const response = await api.post("/schedules/assignments", payload);

      // console.log("Rotational shift assignment response:", response.data);

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

      console.log("Rotational shift command results:", commandResults);

      // const isSuccess =
      //   response?.status === 202 &&
      //   results.length > 0 &&
      //   results.every((item) => Number(item?.status) === 202);

      // if (!isSuccess) {
      //   const failedResult = results.find(
      //     (item) => Number(item?.status) !== 202,
      //   );

      //   setAssignmentStatus("");

      //   toast({
      //     title: failedResult?.msg || "Failed to assign rotational shift",
      //     status: "error",
      //     duration: 5000,
      //     isClosable: true,
      //   });

      //   return;
      // }

      // setAssignmentStatus("");

      // toast({
      //   title: "Rotational shift assigned successfully",
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
            "Failed to assign rotational shift",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        return;
      }

      setAssignmentStatus("");

      toast({
        title: "Rotational shift assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Rotational shift assignment error:", error);

      setAssignmentStatus("");

      toast({
        title:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to assign rotational shift",
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
      {/* Page Header */}
      {/* <AssignTab /> */}
      <Box mb={4}>
        {/* <Text
          fontSize={{ base: "22px", md: "27px" }}
          fontWeight="700"
          color="#0F172A"
          lineHeight="1.2"
        >
          Assign shift pattern
        </Text>

        <Text mt={1} fontSize="14px" color="#64748B">
          Choose employees and preview their repeating schedule.
        </Text> */}
      </Box>

      {/* Main Content */}
      <Grid
        templateColumns={{ base: "1fr", xl: "430px 1fr" }}
        gap={3}
        alignItems="stretch"
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

            {/* Shift Pattern */}
            <Box mb={4}>
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Shift pattern
              </Text>

              <Box position="relative">
                {/* <Select
                  size="sm"
                  value="td - 7-day cycle"
                  fontSize="13px"
                  color="#334155"
                  borderColor="#CBD5E1"
                  borderRadius="6px"
                  h="35px"
                  icon={<ChevronDownIcon />}
                >
                  <option value="td - 7-day cycle">
                    td · 7-day cycle
                  </option>
                </Select> */}
                <Select
                  size="sm"
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                  placeholder={
                    patternLoading ? "Loading shifts..." : "Select shift"
                  }
                  fontSize="13px"
                  color="#334155"
                  borderColor="#CBD5E1"
                  borderRadius="6px"
                  h="35px"
                  icon={<ChevronDownIcon />}
                >
                  {patterns.map((pattern) => (
                    <option key={pattern._id} value={pattern._id}>
                      {pattern.name}
                    </option>
                  ))}
                </Select>
              </Box>

              <Text mt={1} fontSize="11px" color="#64748B">
                5 working days · 2 rest days
              </Text>
            </Box>

            {/* Employees */}
            {/* <Box mb={4}>
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Employees
              </Text>

              <Box
                border="1px solid #CBD5E1"
                borderRadius="6px"
                minH="35px"
                px={2}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack spacing={1.5}>
                  <Box
                    bg="#E7F0FC"
                    color="#334155"
                    px={1.5}
                    py={1}
                    borderRadius="5px"
                    fontSize="12px"
                  >
                    Aarav Shah
                    <Text as="span" ml={2} color="#64748B">
                      ×
                    </Text>
                  </Box>

                  <Box
                    bg="#E7F0FC"
                    color="#334155"
                    px={1.5}
                    py={1}
                    borderRadius="5px"
                    fontSize="12px"
                  >
                    Priya Patel
                    <Text as="span" ml={2} color="#64748B">
                      ×
                    </Text>
                  </Box>
                </HStack>

                <ChevronDownIcon color="#64748B" />
              </Box>

              <Text mt={1} fontSize="11px" color="#64748B">
                2 employees selected
              </Text>
            </Box> */}
            {/* new */}
            {/* <Box mb={4}>
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Employees
              </Text>

              <Input
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  fetchEmployees(value, 0);
                }}
                placeholder="Search by Full Name or Employee ID"
                fontFamily="Poppins"
                h="39px"
                fontSize="14px"
                borderWidth="1.5px"
                borderColor="#cccccc"
                borderRadius="10px"
              />

              <Box
                mt={2}
                border="1px solid #CBD5E1"
                borderRadius="6px"
                minH="35px"
                px={2}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack spacing={1.5}>
                  {selectedEmployees.map((employee) => (
                    <Box
                      key={employee.employee_id}
                      bg="#E7F0FC"
                      color="#334155"
                      px={1.5}
                      py={1}
                      borderRadius="5px"
                      fontSize="12px"
                    >
                      {employee.full_name}

                      <Text
                        as="span"
                        ml={2}
                        color="#64748B"
                        cursor="pointer"
                        onClick={() =>
                          setSelectedEmployees((prev) =>
                            prev.filter(
                              (item) =>
                                item.employee_id !== employee.employee_id,
                            ),
                          )
                        }
                      >
                        ×
                      </Text>
                    </Box>
                  ))}
                </HStack>

                <ChevronDownIcon color="#64748B" />
              </Box>

              <Text mt={1} fontSize="11px" color="#64748B">
                {selectedEmployees.length} employees selected
              </Text>
            </Box> */}
            {/* newer */}
            {/* <Box position="relative">
              <Input
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  fetchEmployees(value, 0);
                }}
                placeholder="Search by Full Name or Employee ID"
                fontFamily="Poppins"
                h="39px"
                fontSize="14px"
                borderWidth="1.5px"
                borderColor="#cccccc"
                borderRadius="10px"
              />

              {search && employees.length > 0 && (
                <Box
                  position="absolute"
                  top="42px"
                  left={0}
                  right={0}
                  bg="white"
                  border="1px solid #CBD5E1"
                  borderRadius="6px"
                  zIndex={10}
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
                      onClick={() => {
                        setSelectedEmployees((prev) => {
                          if (
                            prev.some(
                              (item) =>
                                item.employee_id === employee.employee_id,
                            )
                          ) {
                            return prev;
                          }

                          return [...prev, employee];
                        });

                        setSearch("");
                      }}
                    >
                      <Text fontSize="13px" color="#334155">
                        {employee.full_name}
                      </Text>

                      <Text fontSize="11px" color="#64748B">
                        {employee.employee_id}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box> */}
            <Box mb={4} position="relative">
              {/* Search box + selected employees */}
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
                  >
                    {employee.full_name}

                    <Text
                      as="span"
                      ml={2}
                      color="#64748B"
                      cursor="pointer"
                      onClick={() =>
                        setSelectedEmployees((prev) =>
                          prev.filter(
                            (item) => item.employee_id !== employee.employee_id,
                          ),
                        )
                      }
                    >
                      ×
                    </Text>
                  </Box>
                ))}

                <Input
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    fetchEmployees(value, 0);
                  }}
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
                  _focus={{
                    border: "none",
                    boxShadow: "none",
                  }}
                />
              </Box>

              {/* Search options */}
              {search && employees.length > 0 && (
                <Box
                  position="absolute"
                  top="43px"
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
                      onClick={() => {
                        setSelectedEmployees((prev) => {
                          if (
                            prev.some(
                              (item) =>
                                item.employee_id === employee.employee_id,
                            )
                          ) {
                            return prev;
                          }

                          return [...prev, employee];
                        });

                        setSearch("");
                        setEmployees([]);
                      }}
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
            </Box>

            {/* Start / End Date */}
            <Grid templateColumns="1fr 1fr" gap={3} mb={3}>
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                  Start date
                </Text>

                <Box position="relative">
                  <Input
                    type="date"
                    value={startDate}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (endDate && value > endDate) return;
                    //   setStartDate(value);
                    //   if (cycleStartDate && value > cycleStartDate)
                    //     setCycleStartDate(value);
                    //   if (value) {
                    //     const date = parseDate(value);
                    //     setCalendarMonth(
                    //       new Date(date.getFullYear(), date.getMonth(), 1),
                    //     );
                    //   }
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = formatDateKey(new Date());

                      if (value === today) {
                        toast({
                          title: "Invalid date",
                          description: "Today's date cannot be selected.",
                          status: "warning",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }

                      if (endDate && value > endDate) return;

                      setStartDate(value);

                      if (cycleStartDate && value > cycleStartDate) {
                        setCycleStartDate(value);
                      }

                      if (value) {
                        const date = parseDate(value);
                        setCalendarMonth(
                          new Date(date.getFullYear(), date.getMonth(), 1),
                        );
                      }
                    }}
                    pl="34px"
                    h="35px"
                    fontSize="12px"
                    borderColor="#CBD5E1"
                    borderRadius="6px"
                  />

                  <Icon
                    as={FiCalendar}
                    position="absolute"
                    left="10px"
                    top="9px"
                    color="#475569"
                    boxSize="15px"
                  />
                </Box>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                  End date
                </Text>

                <Box
                  position="relative"
                  bg={noEndDate ? "grey" : "white"}
                  borderRadius="6px"
                  opacity={noEndDate ? 0.5 : 1}
                  transition="all 0.25s ease-in-out"
                >
                  {/* <Input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (startDate && value < startDate) return;
                      setEndDate(value);
                      if (cycleStartDate && value < cycleStartDate)
                        setCycleStartDate(value);
                    }}
                    pl="34px"
                    h="35px"
                    fontSize="12px"
                    borderColor="#CBD5E1"
                    borderRadius="6px"
                  /> */}
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate}
                    isDisabled={noEndDate}
                    transition="all 0.25s ease-in-out"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (startDate && value < startDate) return;
                      setEndDate(value);

                      if (cycleStartDate && value < cycleStartDate)
                        setCycleStartDate(value);
                    }}
                    pl="34px"
                    h="35px"
                    fontSize="12px"
                    border={noEndDate ? "unset" : "1px solid #CBD5E1"}
                    borderColor={noEndDate ? "unset" : "#CBD5E1"}
                    borderRadius="6px"
                  />

                  <Icon
                    as={FiCalendar}
                    position="absolute"
                    left="10px"
                    top="9px"
                    color="#475569"
                    boxSize="15px"
                  />
                </Box>
              </Box>
            </Grid>

            {/* No end date */}
            {/* <Checkbox
              size="sm"
              colorScheme="blue"
              mb={4}
              fontSize="12px"
              color="#334155"
            >
              No end date
            </Checkbox> */}
            <Checkbox
              size="sm"
              colorScheme="blue"
              mb={4}
              fontSize="12px"
              color="#334155"
              isChecked={noEndDate}
              onChange={(e) => {
                const checked = e.target.checked;
                setNoEndDate(checked);

                if (checked) {
                  setEndDate("");
                }
              }}
            >
              No end date
            </Checkbox>

            {/* Cycle starts on */}
            <Box mb={4}>
              <Text fontSize="13px" fontWeight="600" color="#172033" mb={1.5}>
                Cycle starts on
              </Text>

              <Box position="relative">
                <Input
                  type="date"
                  value={cycleStartDate}
                  min={startDate}
                  max={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      (startDate && value < startDate) ||
                      (endDate && value > endDate)
                    )
                      return;
                    setCycleStartDate(value);
                    if (value) {
                      const date = parseDate(value);
                      setCalendarMonth(
                        new Date(date.getFullYear(), date.getMonth(), 1),
                      );
                    }
                  }}
                  pl="34px"
                  h="35px"
                  fontSize="12px"
                  borderColor="#CBD5E1"
                  borderRadius="6px"
                />

                <Icon
                  as={FiCalendar}
                  position="absolute"
                  left="10px"
                  top="9px"
                  color="#475569"
                  boxSize="15px"
                />
              </Box>

              <Text mt={1} fontSize="11px" color="#64748B">
                This date represents Day 1 of the pattern.
              </Text>
            </Box>

            {/* Pattern Sequence */}
            {/* <Box bg="#F1F5F9" borderRadius="6px" p={2}>
              <Text fontSize="13px" fontWeight="700" color="#1E293B" mb={2}>
                Pattern sequence
              </Text>

              <Flex align="center" mb={1}>
                <Text w="72px" fontSize="12px" color="#1E293B">
                  Days 1–3
                </Text>

                <Box
                  flex="1"
                  bg="#DCEBFF"
                  color="#1769E0"
                  borderRadius="5px"
                  px={2}
                  py={1}
                  fontSize="11px"
                >
                  morning · 15:45–20:47
                </Box>
              </Flex>

              <Flex align="center" mb={1}>
                <Text w="72px" fontSize="12px" color="#1E293B">
                  Days 4–5
                </Text>

                <Box
                  flex="1"
                  bg="#E9DEFF"
                  color="#6842B5"
                  borderRadius="5px"
                  px={2}
                  py={1}
                  fontSize="11px"
                >
                  Zeus Munoz · 05:41–16:06
                </Box>
              </Flex>

              <Flex align="center">
                <Text w="72px" fontSize="12px" color="#1E293B">
                  Days 6–7
                </Text>

                <Box
                  flex="1"
                  bg="#E2E7EC"
                  color="#475569"
                  borderRadius="5px"
                  px={2}
                  py={1}
                  fontSize="11px"
                >
                  Rest day
                </Box>
              </Flex>
            </Box> */}
            {/* Pattern Sequence */}
            {/* <Box bg="#F1F5F9" borderRadius="6px" p={2}>
              <Text fontSize="13px" fontWeight="700" color="#1E293B" mb={2}>
                Pattern sequence
              </Text>

              {(() => {
                const groupedPatternDays = [];

                patternDays.forEach((day, index) => {
                  const key = day === null ? "OFF_DAY" : day.shift_id;

                  const existingGroup = groupedPatternDays.find(
                    (group) => group.key === key,
                  );

                  if (existingGroup) {
                    existingGroup.dayNumbers.push(index + 1);
                  } else {
                    groupedPatternDays.push({
                      key,
                      dayNumbers: [index + 1],
                      shift: day,
                    });
                  }
                });

                return groupedPatternDays.map((group, groupIndex) => {
                  const isOffDay = group.shift === null;

                  const dayText = group.dayNumbers
                    .map((dayNumber) => `Day ${dayNumber}`)
                    .join(" & ");

                  const shiftText = isOffDay
                    ? "Off day"
                    : `${group.shift?.shift_name || ""}${group.shift?.start && group.shift?.end
                      ? ` · ${group.shift.start}–${group.shift.end}`
                      : ""
                    }`;

                  const background = isOffDay
                    ? "#E2E7EC"
                    : groupIndex === 1
                      ? "#E9DEFF"
                      : "#DCEBFF";

                  const textColor = isOffDay
                    ? "#475569"
                    : groupIndex === 1
                      ? "#6842B5"
                      : "#1769E0";

                  return (
                    <Flex
                      key={group.key}
                      align="center"
                      mb={groupIndex < groupedPatternDays.length - 1 ? 1 : 0}
                    >
                      <Text w="72px" fontSize="12px" color="#1E293B">
                        {dayText}
                      </Text>

                      <Box
                        flex="1"
                        bg={background}
                        color={textColor}
                        borderRadius="5px"
                        px={2}
                        py={1}
                        fontSize="11px"
                      >
                        {shiftText}
                      </Box>
                    </Flex>
                  );
                });
              })()}
            </Box> */}
            {/* Pattern Sequence */}
            <Box bg="#F1F5F9" borderRadius="8px" p={3}>
              <Text fontSize="13px" fontWeight="700" color="#1E293B" mb={3}>
                Pattern sequence
              </Text>

              {(() => {
                const groupedPatternDays = [];

                patternDays.forEach((day, index) => {
                  const key = day === null ? "OFF_DAY" : day.shift_id;

                  const existingGroup = groupedPatternDays.find(
                    (group) => group.key === key,
                  );

                  if (existingGroup) {
                    existingGroup.dayNumbers.push(index + 1);
                  } else {
                    groupedPatternDays.push({
                      key,
                      dayNumbers: [index + 1],
                      shift: day,
                    });
                  }
                });

                // Keep groups in the order of their first appearance
                groupedPatternDays.sort(
                  (a, b) => a.dayNumbers[0] - b.dayNumbers[0],
                );

                return groupedPatternDays.map((group, groupIndex) => {
                  const isOffDay = group.shift === null;

                  const dayText = group.dayNumbers
                    .map((dayNumber) => `Day ${dayNumber}`)
                    .join("  &  ");

                  const shiftText = isOffDay
                    ? "Off day"
                    : `${group.shift?.shift_name || ""}${
                        group.shift?.start && group.shift?.end
                          ? ` · ${group.shift.start}–${group.shift.end}`
                          : ""
                      }`;

                  const background = isOffDay
                    ? "#E2E7EC"
                    : groupIndex === 1
                      ? "#E9DEFF"
                      : "#DCEBFF";

                  const textColor = isOffDay
                    ? "#475569"
                    : groupIndex === 1
                      ? "#6842B5"
                      : "#1769E0";

                  return (
                    <Flex
                      key={group.key}
                      align="center"
                      gap={3}
                      mb={groupIndex < groupedPatternDays.length - 1 ? 2 : 0}
                      minH="38px"
                    >
                      {/* Days */}
                      <Box w="110px" minW="110px" pr={2}>
                        <Text
                          fontSize="11px"
                          fontWeight="500"
                          color="#334155"
                          lineHeight="1.4"
                        >
                          {dayText}
                        </Text>
                      </Box>

                      {/* Shift */}
                      <Box
                        flex="1"
                        minW="0"
                        minH="34px"
                        display="flex"
                        alignItems="center"
                        bg={background}
                        color={textColor}
                        borderRadius="6px"
                        px={3}
                        py={2}
                      >
                        <Text
                          fontSize="11px"
                          fontWeight="500"
                          lineHeight="1.3"
                          noOfLines={1}
                        >
                          {shiftText}
                        </Text>
                      </Box>
                    </Flex>
                  );
                });
              })()}
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
            {/* Schedule Header */}
            <Flex justify="space-between" align="flex-start" mb={4}>
              <Box>
                <Text fontSize="20px" fontWeight="700" color="#0F172A">
                  Schedule preview
                </Text>
                <Text mt={1} fontSize="14px" color="#64748B">
                  {startDate && endDate
                    ? `${parseDate(startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – ${parseDate(endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${assignmentDays} days`
                    : "Select dates"}
                </Text>
              </Box>

              {/* <HStack spacing={3}>
                <Button
                  variant="ghost"
                  minW="auto"
                  h="30px"
                  p={1}
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon boxSize={5} color="#475569" />
                </Button>

                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="#1E293B"
                  minW="125px"
                  textAlign="center"
                >
                  {calendarMonthLabel}
                </Text>

                <Button
                  variant="ghost"
                  minW="auto"
                  h="30px"
                  p={1}
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  aria-label="Next month"
                >
                  <ChevronRightIcon boxSize={5} color="#475569" />
                </Button>
              </HStack> */}
              <HStack spacing={2}>
                {/* <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCalendarMonth(new Date())}
                  borderRadius="6px"
                  bg="#FFFFFF"
                  fontSize="14px"
                  fontWeight="600"
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
                  borderColor="#CBD5E0"
                  borderRadius="6px"
                  bg="#FFFFFF"
                />

                <select
                  value={calendarMonth.getMonth()}
                  onChange={(event) =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        Number(event.target.value),
                        1,
                      ),
                    )
                  }
                  style={{
                    // height: "32px",
                    // border: "1px solid #CBD5E0",
                    // borderRadius: "6px",
                    // padding: "0 10px",
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
                  onChange={(event) =>
                    setCalendarMonth(
                      new Date(
                        Number(event.target.value),
                        calendarMonth.getMonth(),
                        1,
                      ),
                    )
                  }
                  style={{
                    // height: "32px",
                    // border: "1px solid #CBD5E0",
                    // borderRadius: "6px",
                    // padding: "0 10px",
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

                <Button
                  size="sm"
                  fontSize="30px"
                  variant="ghost"
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
                  borderColor="#CBD5E0"
                  borderRadius="6px"
                  bg="#FFFFFF"
                />
              </HStack>
            </Flex>

            {/* Calendar */}
            <Box
              bg="#fff"
              borderRadius="14px"
              border="1px solid #cccccc"
              boxShadow="md"
              overflow="hidden"
            >
              <Grid templateColumns="repeat(7, 1fr)">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <Box
                      key={day}
                      bg="#F3F6FA"
                      borderRight="1px solid #cccccc"
                      borderBottom="1px solid #cccccc"
                      textAlign="center"
                      py={2}
                      fontSize="14px"
                      fontWeight="400"
                      color="#000000"
                      fontFamily="'Poppins', sans-serif"
                    >
                      {day}
                    </Box>
                  ),
                )}
              </Grid>

              {calendarWeeks.map((week, weekIndex) => (
                <Grid key={weekIndex} templateColumns="repeat(7, 1fr)">
                  {week.map(({ date, inAssignmentRange, patternInfo }) => {
                    const patternDay = patternInfo?.patternDay;
                    const value = !inAssignmentRange
                      ? ""
                      : patternDay === null
                        ? "Off day"
                        : patternDay?.shift_name || "";
                    const type = !inAssignmentRange
                      ? "gray"
                      : patternDay === null
                        ? "gray"
                        : getShiftType(patternDay);
                    // const label = inAssignmentRange
                    //   ? getCalendarLabel(date)
                    //   : "";

                    return (
                      <CalendarCell
                        key={formatDateKey(date)}
                        date={date.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                        // label={label}
                        value={value}
                        type={type}
                        isOutsideMonth={
                          date.getMonth() !== calendarMonth.getMonth()
                        }
                        isOutsideAssignment={!inAssignmentRange}
                      />
                    );
                  })}
                </Grid>
              ))}
            </Box>

            {/* Legend */}
            <HStack spacing={5} mt={4} mb={4} fontSize="12px" color="#334155">
              {patternDays
                .filter(
                  (day, index, array) =>
                    day !== null &&
                    array.findIndex(
                      (item) => item?.shift_id === day.shift_id,
                    ) === index,
                )
                .slice(0, 2)
                .map((day) => (
                  <Legend
                    key={day.shift_id}
                    color={
                      getShiftType(day) === "purple" ? "#6842B5" : "#1769E0"
                    }
                    text={day.shift_name}
                  />
                ))}
              {patternDays.some((day) => day === null) && (
                <Legend color="#94A3B8" text="Off day" />
              )}
            </HStack>

            {/* Info */}
            <Flex
              align="center"
              bg="#EAF4FF"
              border="1px solid #93C5FD"
              borderRadius="5px"
              px={3}
              py={2.5}
              color="#334155"
            >
              <Icon as={FiInfo} boxSize={17} mr={2} />

              <Text fontSize="12px">
                {patternDays.length > 0
                  ? `This ${patternDays.length}-day cycle repeats through ${endDate ? parseDate(endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "the selected end date"}.`
                  : "Select a shift pattern to preview the cycle."}
              </Text>
            </Flex>

            {/* Bottom Statistics */}
            <Flex justify="flex-end" align="center" mt={8} gap={4}>
              <HStack spacing={2}>
                <Icon as={FiUsers} boxSize={17} color="#475569" />
                <Text fontSize="12px" color="#334155">
                  {selectedEmployees.length} employees
                </Text>
              </HStack>

              <Box h="25px" w="1px" bg="#CBD5E1" />

              <HStack spacing={2}>
                <Icon as={FiCalendar} boxSize={17} color="#475569" />
                <Text fontSize="12px" color="#334155">
                  {assignmentDays} calendar days
                </Text>
              </HStack>
            </Flex>
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
            setSelectedPattern("");
            setSelectedEmployees([]);
            setSearch("");
            setEmployees([]);
            setStartDate("");
            setEndDate("");
            setCycleStartDate("");
            setNoEndDate(false);
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
          _hover={{
            bg: "#1769E0",
          }}
        >
          Assign to {selectedEmployees.length} employees
        </Button> */}
        <Button
          h="38px"
          px={5}
          bg="#274167"
          color="#FFFFFF"
          borderRadius="6px"
          fontSize="12px"
          fontWeight="500"
          // _hover={{
          //   bg: "#1769E0",
          // }}
          onClick={onSubmit}
          isLoading={assignmentStatus === "Assigning..."}
        >
          Assign to {selectedEmployees.length} employees
        </Button>
      </Flex>
    </Box>
  );
};

/* Calendar Cell */
const CalendarCell = ({
  date,
  label,
  value,
  type,
  isOutsideMonth,
  isOutsideAssignment,
}) => {
  const bg =
    type === "blue" ? "#E2EEFF" : type === "purple" ? "#EEE5FF" : "#E9EDF1";

  const color =
    type === "blue" ? "#1769E0" : type === "purple" ? "#6842B5" : "#475569";

  return (
    <Box
      minH="100px"
      p={1.5}
      borderRight="1px solid #DCE3EB"
      borderBottom="1px solid #DCE3EB"
    >
      <Text
        fontSize="12px"
        fontWeight="600"
        color={isOutsideMonth ? "#94A3B8" : "#1E293B"}
      >
        {date}
      </Text>

      {label && (
        <Text fontSize="11px" color="#1769E0" fontWeight="500" mt={1}>
          {label}
        </Text>
      )}

      {!isOutsideAssignment && (
        <Box
          mt={label ? 2 : 4}
          bg={bg}
          color={color}
          borderRadius="5px"
          textAlign="center"
          py={1.5}
          px={1}
          fontSize="11px"
          whiteSpace="nowrap"
        >
          {/* {value} */}
          {value?.length > 4 ? `${value.slice(0, 4)}...` : value}
        </Box>
      )}
    </Box>
  );
};

const Legend = ({ color, text }) => {
  return (
    <HStack spacing={2}>
      <Box w="11px" h="11px" borderRadius="50%" bg={color} />

      <Text>{text}</Text>
    </HStack>
  );
};

export default AssignShift;
