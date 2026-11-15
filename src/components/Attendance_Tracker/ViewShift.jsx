import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Badge,
  Input,
  Button,
  Grid,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { LuEye } from "react-icons/lu";
import { useToast } from "@chakra-ui/react";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import api from "../../api/axios";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getOneMonthAfter = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
};

const ViewShift = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  // const [selectedDate, setSelectedDate] = useState(
  //   new Date().toISOString().split("T")[0],
  // );

  const [selectedDate, setSelectedDate] = useState("");

  const [shiftData, setShiftData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeCalendar, setEmployeeCalendar] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const [startDate, setStartDate] = useState(formatDate(new Date()));
  // const [endDate, setEndDate] = useState(
  //   formatDate(getOneMonthAfter(new Date())),
  // );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  //old
  // const fetchEmployeeShifts = async (date) => {
  //   if (!date) return;

  //   try {
  //     setLoading(true);

  //     const orgId = getOrgIdFromReduxOrStorage(user);

  //     const res = await api.get(
  //       `/schedules/employees?organisation_id=${encodeURIComponent(
  //         orgId || "",
  //       )}&date=${encodeURIComponent(date)}&page=1&limit=20`,
  //     );

  //     setShiftData(res.data?.data || []);
  //   } catch (error) {
  //     console.error("Error fetching employee shifts:", error);

  //     setShiftData([]);

  //     toast({
  //       title: "Failed to fetch employee shifts",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //old

  //new
  const fetchEmployeeShifts = async (date, pageNumber = 1) => {
    if (!date) return;

    try {
      setLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(
        `/schedules/employees?organisation_id=${encodeURIComponent(
          orgId || "",
        )}&date=${encodeURIComponent(date)}&page=${pageNumber}&limit=20`,
      );

      const newData = res.data?.data || [];

      setShiftData((prev) =>
        pageNumber === 1 ? newData : [...prev, ...newData],
      );

      setHasMore(newData.length === 20);
    } catch (error) {
      console.error("Error fetching employee shifts:", error);
      if (pageNumber === 1) setShiftData([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchEmployeeShifts(selectedDate || new Date().toISOString().split("T")[0]);
  // }, [selectedDate]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);

    fetchEmployeeShifts(
      selectedDate || new Date().toISOString().split("T")[0],
      1,
    );
  }, [selectedDate]);

  const fetchEmployeeCalendar = async (
    employee,
    calendarStartDate = startDate,
    calendarEndDate = endDate,
  ) => {
    if (!employee?.employee_id) {
      toast({
        title: "Employee ID not available",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!calendarStartDate || !calendarEndDate) return;

    try {
      setSelectedEmployee(employee);
      setCalendarLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(
        `/schedules/calendar?organisation_id=${encodeURIComponent(
          orgId || "",
        )}&employee_id=${encodeURIComponent(
          employee.employee_id,
        )}&start_date=${calendarStartDate}&end_date=${calendarEndDate}`,
      );

      setEmployeeCalendar(res.data?.data || []);

      const firstDate = new Date(`${calendarStartDate}T00:00:00`);
      setCalendarMonth(
        new Date(firstDate.getFullYear(), firstDate.getMonth(), 1),
      );
    } catch (error) {
      console.error("Error fetching employee calendar:", error);

      setEmployeeCalendar([]);

      toast({
        title: "Failed to fetch employee calendar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCalendarLoading(false);
    }
  };

  // const handleViewEmployee = async (employee) => {
  //   setSelectedEmployee(employee);

  //   const today = new Date();
  //   const defaultStartDate = formatDate(today);
  //   const defaultEndDate = formatDate(getOneMonthAfter(today));

  //   setStartDate(defaultStartDate);
  //   setEndDate(defaultEndDate);

  //   await fetchEmployeeCalendar(employee, defaultStartDate, defaultEndDate);
  // };
  const handleViewEmployee = async (employee) => {
    setSelectedEmployee(employee);

    const today = new Date();
    const apiStartDate = formatDate(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const apiEndDate = formatDate(
      new Date(today.getFullYear(), today.getMonth() + 1, 0),
    );

    await fetchEmployeeCalendar(employee, apiStartDate, apiEndDate);
  };

  const handleDateFilter = async () => {
    if (!selectedEmployee) return;

    if (!startDate || !endDate) {
      toast({
        title: "Please select both dates",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Start date cannot be after end date",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await fetchEmployeeCalendar(selectedEmployee, startDate, endDate);
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let index = 0; index < firstDay; index++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const calendarDays = getCalendarDays();

  const getCalendarDataForDate = (date) => {
    const dateKey = formatDate(date);

    return employeeCalendar.find((item) => item?.date === dateKey) || null;
  };
  const getShiftColor = (shiftName = "") => {
    const colors = [
      { bg: "#E0F2FE", text: "#0369A1" },
      { bg: "#DCFCE7", text: "#15803D" },
      { bg: "#FEF3C7", text: "#B45309" },
      { bg: "#FCE7F3", text: "#BE185D" },
      { bg: "#EDE9FE", text: "#6D28D9" },
      { bg: "#CCFBF1", text: "#0F766E" },
    ];

    let hash = 0;
    for (let i = 0; i < shiftName.length; i++) {
      hash = shiftName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 20 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);

      fetchEmployeeShifts(
        selectedDate || new Date().toISOString().split("T")[0],
        nextPage,
      );
    }
  };

  return (
    <Box
      bg="#F6F8FB"
      // p={{ base: 4, md: 6 }}
      // h="74vh"
      fontFamily="Poppins"
    >
      {!selectedEmployee ? (
        <Box
          bg="#FFFFFF"
          border="1px solid #c4c4c4"
          borderRadius="14px"
          h="74vh"
          overflow="hidden"
          boxShadow="0 2px 10px rgba(15, 23, 42, 0.05)"
        >
          {/* Header */}
          <Flex
            px={{ base: 4, md: 5 }}
            py={6}
            justify="space-between"
            align="center"
            // borderBottom="1px solid #E2E8F0"
            mb="16px"
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "2px",
              backgroundImage:
                "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
            }}
          >
            <Box>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="700"
                color="gray.800"
                // ml={{ base: 0, md: 1 }}
                fontFamily="Poppins"
              >
                View Shift
              </Text>
            </Box>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              w={{ base: "150px", md: "180px" }}
              h="40px"
              fontSize="12px"
              borderColor="#CBD5E1"
              borderRadius="7px"
              color="#334155"
            />
          </Flex>

          {/* Table */}
          <TableContainer
            // h="100%"
            // overflowY="scroll"
            // overflowX="auto"
            // onScroll={handleScroll}
            h="calc(74vh - 100px)"
            maxH="calc(74vh - 100px)"
            overflowY="auto"
            overflowX="auto"
            onScroll={handleScroll}
            sx={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E1",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#F8FAFC",
              },
            }}
          >
            <Table
              variant="simple"
              size="sm"
              sx={{
                "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
                "& tbody tr:nth-of-type(even) td": { background: "white" },
                "& td, & th": {
                  border: "none !important",
                  //  pl: 6,
                  // pr: 3,
                },
                "& thead th": { paddingBottom: "14px" },
                "& tbody tr:first-of-type td": { paddingTop: "12px" },
              }}
            >
              <Thead
                sx={{
                  th: {
                    textTransform: "none",
                    fontWeight: "600",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#000000",
                    fontSize: "14px",
                  },
                  td: {
                    fontFamily: "'Poppins', sans-serif",
                  },
                }}
              >
                <Tr>
                  <Th>Employee Code</Th>
                  <Th>Employee Name</Th>
                  <Th>Employee Shift Name</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>

              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Text>Loading employee shifts...</Text>
                    </Td>
                  </Tr>
                ) : shiftData.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Text>
                        {selectedDate
                          ? "No employee shifts found."
                          : "Select a date to view employee shifts."}
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  shiftData.map((item, index) => (
                    <Tr key={item.employee_id || `employee-${index}`}>
                      <Td>{item.employee_code || "-"}</Td>

                      <Td>{item.employee_name || "-"}</Td>

                      <Td>{item.employee_shift_name || "-"}</Td>

                      <Td>{item.date}</Td>

                      <Td py={4}>
                        <Badge
                          px={2}
                          py={1}
                          borderRadius="5px"
                          fontSize="10px"
                          fontWeight="500"
                          bg={
                            item.status === "SCHEDULED" ? "#ECFDF3" : "#F1F5F9"
                          }
                          color={
                            item.status === "SCHEDULED" ? "#027A48" : "#64748B"
                          }
                        >
                          {item.status}
                        </Badge>
                      </Td>

                      <Td py={4} textAlign="center">
                        <IconButton
                          aria-label={`View ${
                            item.employee_name || "employee"
                          }`}
                          icon={<LuEye />}
                          size="sm"
                          variant="ghost"
                          color="#274167"
                          onClick={() => handleViewEmployee(item)}
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box
          bg="#FFFFFF"
          border="1px solid #E2E8F0"
          borderRadius="10px"
          overflow="hidden"
          boxShadow="0 2px 10px rgba(15, 23, 42, 0.05)"
        >
          {/* Calendar Header */}
          <Flex
            px={{ base: 4, md: 6 }}
            py={4}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
            borderBottom="1px solid #E2E8F0"
            wrap="wrap"
          >
            <Box>
              <Flex align="center" gap={3}>
                {/* <Button
                  size="sm"
                  variant="outline"
                  borderColor="#CBD5E1"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Back
                </Button>
                 */}
                <IconButton
                  icon={<ChevronLeftIcon boxSize={6} />}
                  aria-label="Go Back"
                  // onClick={() => navigate(-1)}
                  onClick={() => setSelectedEmployee(null)}
                  bg="blue.900"
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: "blue.800" }}
                  size="md"
                  marginRight={4}
                />

                <Box>
                  <Text fontSize="18px" fontWeight="600" color="#122B55">
                    {selectedEmployee?.employee_name || "Employee"}
                  </Text>

                  <Text mt={1}>Shift calendar</Text>
                </Box>
              </Flex>
            </Box>

            {/* Date Filters */}
            <Flex align="center" gap={2} wrap="wrap">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                w={{ base: "145px", md: "155px" }}
                h="38px"
                fontSize="12px"
                borderColor="#CBD5E1"
                borderRadius="7px"
              />

              <Text>to</Text>

              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                w={{ base: "145px", md: "155px" }}
                h="38px"
                fontSize="12px"
                borderColor="#CBD5E1"
                borderRadius="7px"
              />

              <Button
                h="38px"
                px={4}
                bg="#274167"
                color="#FFFFFF"
                fontSize="12px"
                fontWeight="500"
                _hover={{ bg: "#274167" }}
                onClick={handleDateFilter}
              >
                Apply
              </Button>
            </Flex>
          </Flex>

          {/* Month Navigation */}
          <Flex
            px={{ base: 4, md: 6 }}
            py={4}
            align="center"
            justify="space-between"
            borderBottom="1px solid #E2E8F0"
          >
            {/* <IconButton
              aria-label="Previous month"
              icon={<ChevronLeftIcon />}
              variant="outline"
              size="sm"
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
            /> */}
            <IconButton
              aria-label="Previous month"
              icon={<ChevronLeftIcon />}
              variant="outline"
              size="sm"
              onClick={async () => {
                const previousMonth = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() - 1,
                  1,
                );

                const monthStartDate = formatDate(
                  new Date(
                    previousMonth.getFullYear(),
                    previousMonth.getMonth(),
                    1,
                  ),
                );

                const monthEndDate = formatDate(
                  new Date(
                    previousMonth.getFullYear(),
                    previousMonth.getMonth() + 1,
                    0,
                  ),
                );

                setCalendarMonth(previousMonth);

                await fetchEmployeeCalendar(
                  selectedEmployee,
                  monthStartDate,
                  monthEndDate,
                );
              }}
            />

            <Text fontSize="15px" fontWeight="600" color="#122B55">
              {calendarMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            {/* <IconButton
              aria-label="Next month"
              icon={<ChevronRightIcon />}
              variant="outline"
              size="sm"
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
            /> */}
            <IconButton
              aria-label="Next month"
              icon={<ChevronRightIcon />}
              variant="outline"
              size="sm"
              onClick={async () => {
                const nextMonth = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() + 1,
                  1,
                );

                const monthStartDate = formatDate(
                  new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
                );

                const monthEndDate = formatDate(
                  new Date(
                    nextMonth.getFullYear(),
                    nextMonth.getMonth() + 1,
                    0,
                  ),
                );

                setCalendarMonth(nextMonth);

                await fetchEmployeeCalendar(
                  selectedEmployee,
                  monthStartDate,
                  monthEndDate,
                );
              }}
            />
          </Flex>

          {/* Calendar */}
          {calendarLoading ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="md" color="#1769E0" />
            </Flex>
          ) : (
            <Box p={{ base: 3, md: 5 }}>
              <Grid
                templateColumns="repeat(7, minmax(0, 1fr))"
                borderTop="1px solid #E2E8F0"
                borderLeft="1px solid #E2E8F0"
                minW="0"
                w="100%"
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <Box
                      key={day}
                      p={3}
                      minW="0"
                      textAlign="center"
                      bg="#F8FAFC"
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      fontSize="11px"
                      fontWeight="600"
                      color="#122B55"
                    >
                      {day}
                    </Box>
                  ),
                )}

                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <Box
                        key={`empty-${index}`}
                        minH="110px"
                        minW="0"
                        borderRight="1px solid #E2E8F0"
                        borderBottom="1px solid #E2E8F0"
                        bg="#FAFAFA"
                      />
                    );
                  }

                  const dayData = getCalendarDataForDate(date);
                  const shiftColor = getShiftColor(
                    dayData?.shift_snapshot?.shift_name,
                  );

                  return (
                    <Box
                      key={date.toISOString()}
                      minH="110px"
                      minW="0"
                      maxW="100%"
                      p={2}
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      bg="#FFFFFF"
                      overflow="hidden"
                    >
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="#122B55"
                        mb={2}
                      >
                        {date.getDate()}
                      </Text>

                      {dayData?.error ? (
                        <Box bg="#F1F5F9" borderRadius="5px" p={2}>
                          <Text
                            fontSize="10px"
                            fontWeight="500"
                            color="#64748B"
                            noOfLines={3}
                          >
                            No shift
                          </Text>

                          <Text
                            mt={1}
                            fontSize="9px"
                            color="#94A3B8"
                            noOfLines={2}
                          >
                            {dayData.error}
                          </Text>
                        </Box>
                      ) : dayData?.status === "WEEK_OFF" ? (
                        // <Box
                        //   // bg="#E0F0FF"
                        //   bg={shiftColor.bg}
                        //   borderRadius="5px"
                        //   p={2}
                        //   minW="0"
                        //   maxW="100%"
                        // >
                        //   <Text
                        //     fontSize="10px"
                        //     fontWeight="600"
                        //     // color="#1769E0"
                        //     color={shiftColor.text}
                        //     noOfLines={2}
                        //   >
                        //     {dayData?.shift_snapshot?.shift_name || "Shift"}
                        //   </Text>

                        //   <Text
                        //     mt={1}
                        //     fontSize="9px"
                        //     color="#475569"
                        //     whiteSpace="nowrap"
                        //   >
                        //     {dayData?.shift_snapshot?.start || "--:--"} –{" "}
                        //     {dayData?.shift_snapshot?.end || "--:--"}
                        //   </Text>

                        //   <Text mt={1} fontSize="9px" color="#64748B">
                        //     {dayData?.status || ""}
                        //   </Text>
                        // </Box>
                        <Box bg="#E5E7EB" borderRadius="5px" p={2}>
                          <Text
                            fontSize="10px"
                            fontWeight="500"
                            color="#6B7280"
                          >
                            WEEK_OFF
                          </Text>
                        </Box>
                      ) : dayData ? (
                        <Box
                          bg={shiftColor.bg}
                          borderRadius="5px"
                          p={2}
                          minW="0"
                          maxW="100%"
                        >
                          <Text
                            fontSize="10px"
                            fontWeight="600"
                            color={shiftColor.text}
                            noOfLines={2}
                          >
                            {dayData?.shift_snapshot?.shift_name || "Shift"}
                          </Text>

                          <Text
                            mt={1}
                            fontSize="9px"
                            color="#475569"
                            whiteSpace="nowrap"
                          >
                            {dayData?.shift_snapshot?.start || "--:--"} –{" "}
                            {dayData?.shift_snapshot?.end || "--:--"}
                          </Text>

                          <Text mt={1} fontSize="9px" color="#64748B">
                            {dayData?.status || ""}
                          </Text>
                        </Box>
                      ) : (
                        <Box bg="#F1F5F9" borderRadius="5px" p={2}>
                          <Text
                            fontSize="10px"
                            fontWeight="500"
                            color="#64748B"
                          >
                            No data
                          </Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ViewShift;
