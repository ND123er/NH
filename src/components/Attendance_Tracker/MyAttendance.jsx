import {
  Box,
  Flex,
  Avatar,
  Text,
  SimpleGrid,
  Badge,
  Button,
  Select,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  InputGroup,
  ModalFooter,
  Toast,
  Tooltip,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiClock, FiGrid, FiList } from "react-icons/fi";
import absent from "../../assets/absent.svg";
import leave from "../../assets/leave.png";
import persent from "../../assets/persent.svg";
import halfDay from "../../assets/halfDay.png";
import timer from "../../assets/timer.png";
import fourdot from "../../assets/fourdot.png";
import listdot from "../../assets/listdot.png";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getEmpCode } from "../../utils/token";
import TimePicker from "./TimePicker";
import { useOutletContext } from "react-router-dom";
import add_employee from "../../assets/add_employee1.png";
import shift from "../../assets/shift_icon.svg";

const badgeStyle = {
  /* { bg: "green.100", color: "green.600" },*/
  "On Time": {
    bg: "#87D78E4D",
    color: "#74D27E",
    border: "0.67px solid #74D27E",
  },
  Late: {
    bg: "#FFF7CC",
    color: "#FFCE20",
    border: "0.67px solid #FFCE20",
  },
  Absent: {
    bg: "#e8e1e1ff",
    color: "#8E8E8E",
    border: "0.67px solid #8E8E8E",
  },
  "Half Day": {
    bg: "#E0E7FF",
    color: "#4F46E5",
    border: "0.67px solid #4F46E5",
    fontFamily: "Poppins",
  },
  "HOLIDAY": {
    bg: "#E8E1E1",
    color: "#8E8E8E",
    border: "0.67px solid #8E8E8E",
  },
  "Week Off": {
    bg: "#e8e1e1ff",
    color: "#8E8E8E",
    border: "0.67px solid #8E8E8E",
  },
};

const MyAttendance = () => {
  const { user, token, loading } = useSelector((state) => state.auth);
  const [attendanceSummary, setAttendanceSummary] = useState("");
  const [attendanceData, setattendanceData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPagess, setTotalPages] = useState(0);
  const [totalPagess, setTotalPages] = useState(1);

  const today = new Date();
  const { attendanceRefreshKey } = useOutletContext();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const buildISOTime = (date, time) => {
    // return new Date(${date}T${time}:00.000Z).toISOString();
    return new Date(`${date}T${time}:00.000Z`).toISOString();
  };

  // const summaryCards = [
  //     { label: "Present", key: "present", icon: persent },
  //     { label: "Absent", key: "absent", icon: absent },
  //     { label: "Shift", key: "absent", icon: shift },
  // ];
  const summaryCards = [
    { label: "Present", key: "totalPresent", icon: persent },
    { label: "Absent", key: "totalAbsent", icon: absent },
    { label: "Shift", key: "shift", icon: shift },
  ];
  useEffect(() => {
    getAttendanceHistorData(currentPage, selectedMonth);
  }, [currentPage, selectedMonth, selectedYear, attendanceRefreshKey]);

  useEffect(() => {
    // fetchProfile();
    // getAttendanceData();
    if (user?.employee_id) {
      getAttendanceData();
      fetchProfile();
    }
    // getAttendanceHistorData(currentPage);
  }, [selectedMonth, selectedYear, user?.employee_id, attendanceRefreshKey]);

  useEffect(() => {
    if (selectedDate) {
      getAttendanceDay(selectedDate);
    }
  }, [selectedDate]);
  const getAttendanceData = async () => {
    const month = selectedMonth || new Date().getMonth() + 1;
    const year = selectedYear || new Date().getFullYear();
    try {
      // const basicRes = await api.get(
      //     `/attendance/get_my_attendance_summary?employee_id=${user?.employee_id
      //     }&month=${selectedMonth}&year=${selectedYear}`
      // );
      const basicRes = await api.get(
        `/employee/get_employee_detail?employee_id=${
          user?.employee_id
        }&month=${selectedMonth}&year=${selectedYear}`,
      );

      let basic = basicRes?.data;
      setAttendanceSummary(basic);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  };
  const getAttendanceHistorData = async (page = 1, month = selectedMonth) => {
    try {
      const basicRes = await api.get(
        `/attendance/get_my_attendance_history?employee_id=${user?.employee_id}&month=${month}&year=${selectedYear}&page=${page}&limit=6`,
      );

      const basic = basicRes?.data;
      setattendanceData(basic.data);
      // ✅ IMPORTANT LINE
      setTotalPages(basic.pagination.total_pages);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const employeeId = getEmpCode();
      // const url = /employee/get_admin_detail ? employee_id = ${ employeeId };
      const url = `/employee/get_admin_detail?employee_id=${employeeId}`;
      const res = await api.get(url);
      const data = res?.data?.result || {};
      setUserProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  // employee/get_admin_detail?employee_id=EMP000180

  // const getStatusKey = (status) => {
  //     switch (status) {
  //         case "Present":
  //             return "On Time";
  //         case "Late":
  //             return "Late";
  //         case "Absent":
  //             return "Absent";
  //         case "Half Day":
  //             return "Half Day";
  //         default:
  //             return "Absent";
  //     }
  // };
  const getStatusKey = (displayStatus) => {
    switch (displayStatus) {
      case "On Time":
        return "On Time";
      case "Late":
        return "Late";
      case "Absent":
        return "Absent";
      case "Half Day":
      case "HALF_DAY":
        return "Half Day";
      // case "WEEK_OFF":
      //   return "Week Off";
      // default:
      //   return "Absent";
      case "WEEK_OFF":
        return "Week Off";
      case "HOLIDAY":
        return "HOLIDAY";
      default:
        return "Absent";
    }
  };
  const isoToLocalTime = (isoTime) => {
    if (!isoTime) return "-";

    return new Date(isoTime).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });
  };

  const getAttendanceDay = async (date) => {
    if (!date) return;
    try {
      const basicRes = await api.get(
        `/attendance/get_attendance_day ? employee_id = ${user?.employee_id} & attendance_date=${date}`,
      );
      let basic = basicRes?.data;
      setAttendanceSummary(basic);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  };

  const UpdateAttendance = async (selectedSessionIndex, checkIn, checkOut) => {
    if (!attendanceSummary?.sessions?.length) return;
    const sessions = attendanceSummary.sessions;
    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];
    const date = attendanceSummary.attendance_date;
    if (!firstSession || !lastSession) {
      console.error("Sessions not found");
      return;
    }
    const payload = {
      session_id1: firstSession.session_id,
      session_id2: lastSession.session_id,
      check_in_time: buildISOTime(date, checkIn),
      check_out_time: buildISOTime(date, checkOut),
    };
    try {
      const res = await api.put("/attendance/update_attendance_time", payload);
      // Refresh day data if needed
      // getAttendanceDay(attendanceSummary.attendance_date);
      getAttendanceHistorData();
    } catch (err) {
      console.error("Failed to update attendance session:", err);
    } finally {
      onClose();
    }
  };

  const ITEMS_PER_PAGE = 6;
  const totalItems = attendanceData?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const formatDateReadable = (isoDate) => {
    if (!isoDate) return "-";
    // Extract date part only (YYYY-MM-DD)
    const datePart = isoDate.split("T")[0];
    const [year, month, day] = datePart.split("-");
    // Create date WITHOUT timezone conversion
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  return (
    <Box bg="#F6F7FB" h="80vh" mt={0}>
      {/* ================= Employee Details ================= */}
      <Box
        h="100%"
        overflowY="auto"
        pt={3}
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        <Box
          position="relative"
          bg="white"
          borderRadius="14px"
          mb={2}
          border="1px solid #E5E7EB"
          overflow="hidden"
          _after={{
            content: '""',
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "420px",
            height: "420px",
            bg: `linear-gradient(
      135deg,
      rgba(255,255,255,0) 38%,
      rgba(39,65,103,0.12) 100%
    )`,
            opacity: 0.22,
            filter: "blur(1px)",
            pointerEvents: "none",
          }}
        >
          <Flex justify="space-between" align="center" pt={3} pl={6} pr={6}>
            <Text
              fontWeight="600"
              fontSize="24px"
              color="#404040"
              fontFamily="Poppins"
            >
              Employee Details
            </Text>
            <Flex gap={3}>
              {/* Month Select */}
              <Select
                size="sm"
                w="150px"
                h="35px"
                borderRadius="8px"
                fontFamily="Poppins"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Select>

              {/* Year (Read Only) */}

              <Select
                size="sm"
                w="100px"
                h="35px"
                borderRadius="8px"
                fontFamily="Poppins"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>
          {/* <Box
                    my={3}
                    h="1px"
                    bgImage="repeating-linear-gradient(to right,#C7C7C7 0,#C7C7C7 4px,transparent 4px,transparent 8px)"
                /> */}
          <Box
            my={3}
            h="1.8px"
            bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
          />

          <Flex gap={6} align="center" pl={6} pr={6} pt={2} pb={2}>
            {/* <Avatar size="xl" /> */}
            <Avatar
              size="xl"
              name="Employee"
              src={add_employee}
              border="4px solid #1E2A78"
              padding="2px"
            />
            <Box>
              {/* <Text fontSize="28px" fontWeight="500" fontFamily="Poppins">
                                {userProfile?.first_name} {userProfile?.midlle_name && (userProfile?.midlle_name)} {userProfile?.last_name}
                            </Text> */}
              <Text fontSize="28px" fontWeight="500" fontFamily="Poppins">
                {attendanceSummary?.employee_detail?.full_name}
              </Text>

              <SimpleGrid columns={3} spacing={10} mt={2}>
                <Box>
                  <Text
                    fontSize="15px"
                    color="#ADACAC"
                    fontWeight={"500"}
                    fontFamily="Poppins"
                  >
                    Designation
                  </Text>
                  {/* <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">{userProfile?.designation}</Text> */}
                  <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">
                    {attendanceSummary?.employee_detail?.designation}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="15px"
                    color="#ADACAC"
                    fontWeight={"500"}
                    fontFamily="Poppins"
                  >
                    Phone Number
                  </Text>
                  {/* <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">+91 {userProfile?.mobile}</Text> */}
                  <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">
                    +91 {attendanceSummary?.employee_detail?.mobile}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="15px"
                    color="#ADACAC"
                    fontFamily="Poppins"
                    fontWeight={"500"}
                  >
                    Email Address
                  </Text>
                  {/* <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">{userProfile?.work_email}</Text> */}
                  <Text fontSize="18px" fontWeight="500" fontFamily="Poppins">
                    {attendanceSummary?.employee_detail?.email}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </Flex>
          {/* <SimpleGrid columns={4} spacing={4} p={6}>
                    {summaryCards?.map((item) => (
                        <Box
                            key={item.key}
                            border="1px solid #E5E7EB"
                            borderRadius="12px"
                            p={4}
                        >
                            <Flex align="center" gap={2}>
                                <Box w="22px" h="22px" display="flex" alignItems="center">
                                    <img src={item.icon} alt={item.label} width="18" />
                                </Box>

                                <Text fontSize="14px" color="gray.500" fontWeight="600" fontFamily="Poppins">
                                    {item.label}
                                </Text>
                            </Flex>
                            <Text fontSize="26px" fontWeight="600" fontFamily="Poppins">
                                {attendanceSummary?.summary?.[item.key] ?? 0} days
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid> */}
          {/* <SimpleGrid columns={3} spacing={4} pl={6} pr={6} pt={3} pb={3}>
                    {summaryCards?.map((item) => (
                        <Box
                            key={item.key}
                            border="1px solid #E5E7EB"
                            borderRadius="12px"
                            p={4}
                            pt={2}
                            pb={2}
                        >
                            <Flex align='center' gap={2}>
                                <Box w="22px" h="20px" display="flex" alignItems="center" >
                                    <img src={item.icon} alt={item.label} />
                                </Box>

                                <Text fontSize="15px" align='center' color="#ADACAC" fontWeight="500" fontFamily="Poppins" mt={item.label === "Absent" ? 2.5 : 1.5}>
                                    {item.label === "Shift" ? "Shift(name)" : item.label}
                                </Text>
                            </Flex>
                            {
                                item.label === 'Shift' ? (
                                    <Flex align="baseline">
                                        <Text
                                            fontSize="30px"
                                            fontWeight="500"
                                            fontFamily="Poppins"
                                            lineHeight="1"
                                            mt={4}
                                            color='#000'
                                        >
                                            (20:00 - 05:00)
                                        </Text>

                                    </Flex>
                                ) : (<Flex align="baseline" gap="6px">
                                    <Text
                                        fontSize="35px"
                                        fontWeight="500"
                                        fontFamily="Poppins"
                                        lineHeight="1"
                                        mt={2}
                                        color='#000'
                                    >
                                        {attendanceSummary?.summary?.[item.key] ?? 0}
                                    </Text>

                                    <Text
                                        fontSize="25px"
                                        fontWeight="500"
                                        fontFamily="Poppins"
                                        color="#000"
                                    >
                                        days
                                    </Text>
                                </Flex>

                                )
                            }

                        </Box>
                    ))}
                </SimpleGrid> */}
          <SimpleGrid columns={3} spacing={4} p={6}>
            {summaryCards.map((item) => (
              <Box
                key={item.key}
                border="1px solid #E5E7EB"
                borderRadius="12px"
                p={4}
                pt={2}
                pb={2}
              >
                <Flex align="center" gap={2} h={9} alignItems={"center"}>
                  <Box w="25px">
                    <img src={item.icon} alt={item.label} />
                  </Box>
                  <Text
                    fontSize="15px"
                    color="#ADACAC"
                    fontWeight="500"
                    fontFamily="Poppins"
                    //   margin-top="10px"

                    mt={
                      item.label === "Shift"
                        ? 2.5
                        : item.label === "Present"
                          ? 10.5
                          : 17.5
                    }
                    // mt={6}
                  >
                    {/* {item.label === "Shift"
                      ? `Shift (${attendanceSummary?.employee_detail?.shift})`
                      : item.label} */}
                    {item.label === "Shift"
                      ? `Shift (${
                          attendanceSummary?.employee_detail?.current_schedule
                            ?.shift_snapshot?.shift_name ??
                          attendanceSummary?.employee_detail?.shift ??
                          "--"
                        })`
                      : item.label}
                  </Text>
                </Flex>

                {item.key === "shift" ? (
                  <Flex direction="column" mt={6}>
                    <Text color="#000" fontSize="30px" fontWeight="500">
                      {/* ({attendanceSummary?.employee_detail?.shift_start || "--"}{" "}
                      - {attendanceSummary?.employee_detail?.shift_end || "--"}) */}
                      (
                      {attendanceSummary?.employee_detail?.current_schedule
                        ?.shift_snapshot?.start ??
                        attendanceSummary?.employee_detail?.shift_start ??
                        "--"}{" "}
                      -{" "}
                      {attendanceSummary?.employee_detail?.current_schedule
                        ?.shift_snapshot?.end ??
                        attendanceSummary?.employee_detail?.shift_end ??
                        "--"}
                      )
                    </Text>
                  </Flex>
                ) : (
                  <Flex align="baseline" gap="6px" mt={2}>
                    <Text
                      fontSize="40px"
                      fontWeight="500"
                      lineHeight="1"
                      mt={5}
                    >
                      {attendanceSummary?.[item.key] ?? 0}
                    </Text>
                    <Text fontSize="25px" fontWeight="500">
                      days
                    </Text>
                  </Flex>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* ================= Attendance History ================= */}
        <Box
          bg="white"
          borderRadius="14px"
          p={0}
          pt={2}
          pb={3}
          border="1px solid #E5E7EB"
          mb={5}
          mt={3}
        >
          <Flex justify="space-between" align="center" mb={2} pl={6} pr={6}>
            <Text
              fontWeight="600"
              color="#404040"
              fontSize="24px"
              fontFamily="Poppins"
            >
              Attendance History
            </Text>
            {/* RIGHT SIDE ACTIONS */}
            <Flex align="center" gap={2}>
              <Flex backgroundColor={"#E8E8E8"} borderRadius="10px" p={1}>
                <Box
                  w="36px"
                  h="36px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="5px"
                  // cursor="pointer"
                  _hover={{ bg: "#F3F4F6" }}
                  bg={viewType === "grid" ? "white" : "transparent"}
                  border={viewType === "grid" ? "1px solid #E5E7EB" : "none"}
                  onClick={() => setViewType("grid")}
                >
                  <img src={fourdot} alt="Grid view" width="16" height="16" />
                </Box>

                {/* List Icon */}
                <Box
                  w="36px"
                  h="36px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="5px"
                  cursor="pointer"
                  _hover={{ bg: "#F3F4F6" }}
                  bg={viewType === "list" ? "white" : "transparent"}
                  border={viewType === "list" ? "1px solid #E5E7EB" : "none"}
                  onClick={() => setViewType("list")}
                >
                  <img src={listdot} alt="Grid view" width="16" height="16" />
                </Box>
              </Flex>
            </Flex>
          </Flex>

          {/* dotted divider */}
          <Box
            mb={3}
            h="2px"
            bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
          />

          {attendanceData.length === 0 ? (
            <Flex justify="center" align="center" py={10}>
              <Text
                fontSize="16px"
                fontWeight="600"
                color="#9CA3AF"
                fontFamily="Poppins"
              >
                No attendance history found
              </Text>
            </Flex>
          ) : viewType === "grid" ? (
            /* ================= GRID VIEW ================= */
            <SimpleGrid columns={3} spacing={4} pl={6} pr={6}>
              {attendanceData?.map((item, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px solid #E5E7EB"
                  borderRadius="12px"
                  // bg={item.status === "Absent" ? "#F3F4F6" : "white"}
                  // bg={item?.base_status === "Absent" ? "#F3F4F6" : "white"}
                  bg={
                    item?.base_status === "ABSENT" ||
                    item?.base_status === "WEEK_OFF"
                      ? "#F3F4F6"
                      : "white"
                  }
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <img src={timer} width="18" height="18" />
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        color="#000"
                        fontFamily="Poppins"
                      >
                        {formatDateReadable(item.date)}
                      </Text>
                    </Flex>
                    <Badge
                      borderRadius="full"
                      px={3}
                      fontSize="13px"
                      fontWeight="500"
                      textTransform="none"
                      fontFamily="poppins"
                      {...badgeStyle[getStatusKey(item.display_status)]}
                    >
                      {getStatusKey(item.display_status)}
                    </Badge>
                  </Flex>

                  <Flex mt={6} justify="space-between">
                    <Box>
                      <Text
                        fontSize="13px"
                        color="#ADACAC"
                        fontWeight="600"
                        fontFamily="Poppins"
                      >
                        Check-in Time
                      </Text>
                      <Text
                        fontWeight="600"
                        fontSize="25px"
                        fontFamily="Poppins"
                      >
                        {isoToLocalTime(item.check_in)}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="13px"
                        color="#ADACAC"
                        fontWeight="600"
                        fontFamily="Poppins"
                      >
                        Check-out Time
                      </Text>
                      <Text
                        fontWeight="600"
                        fontSize="25px"
                        fontFamily="Poppins"
                      >
                        {isoToLocalTime(item.check_out)}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            /* ================= LIST VIEW ================= */
            <Flex direction="column" gap={3} pl={6} pr={6}>
              {attendanceData?.map((item, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px solid #E5E7EB"
                  borderRadius="12px"
                  // bg={item.status === "Absent" ? "#F3F4F6" : "white"}
                  // bg={item?.base_status === "Absent" ? "#F3F4F6" : "white"}
                  bg={
                    item?.base_status === "ABSENT" ||
                    item?.base_status === "WEEK_OFF"
                      ? "#F3F4F6"
                      : "white"
                  }
                  // cursor="pointer"
                  _hover={{ bg: "#F9FAFB" }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <img src={timer} width="18" height="18" />
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        color="#000"
                        fontFamily="Poppins"
                      >
                        {formatDateReadable(item.date)}
                      </Text>
                    </Flex>

                    <Badge
                      borderRadius="full"
                      px={3}
                      fontSize="11px"
                      fontWeight="500"
                      textTransform="none"
                      fontFamily="poppins"
                      {...badgeStyle[getStatusKey(item.display_status)]}
                    >
                      {getStatusKey(item.display_status)}
                    </Badge>
                  </Flex>

                  <Flex
                    mt={6}
                    justify="space-between"
                    direction={viewType === "list" ? "row" : "row"}
                  >
                    <Box>
                      <Text
                        fontSize="13px"
                        color="#ADACAC"
                        fontWeight="600"
                        fontFamily="Poppins"
                      >
                        Check-in Time
                      </Text>
                      <Text
                        fontWeight="600"
                        fontSize="25px"
                        fontFamily="Poppins"
                      >
                        <Text
                          fontWeight="600"
                          fontSize="25px"
                          fontFamily="Poppins"
                        >
                          {isoToLocalTime(item.check_in)}
                        </Text>
                      </Text>
                    </Box>

                    <Box>
                      <Text
                        fontSize="13px"
                        color="#ADACAC"
                        fontWeight="600"
                        fontFamily="Poppins"
                      >
                        Check-out Time
                      </Text>
                      <Text
                        fontWeight="600"
                        fontSize="25px"
                        fontFamily="Poppins"
                      >
                        {isoToLocalTime(item.check_out)}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}

          <Flex justify="center" align="center" gap={3} mt={6}>
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon />}
              variant="outline"
              borderRadius="full"
              size="sm"
              border="1px solid #000"
              color="#000"
              // isDisabled={currentPage === 1}
              isDisabled={attendanceData?.length === 0 || currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />

            {/* Page Numbers */}
            {/* {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <Button
                                key={pageNumber}
                                variant="ghost"
                                size="sm"
                                fontWeight="600"
                                fontFamily="Poppins"
                                color={currentPage === pageNumber ? "#243B66" : "#9CA3AF"}
                                onClick={() => setCurrentPage(pageNumber)}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })} */}
            {Array.from({ length: totalPagess }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Button
                  key={pageNumber}
                  variant="ghost"
                  size="sm"
                  fontWeight="600"
                  fontFamily="Poppins"
                  color={currentPage === pageNumber ? "#243B66" : "#9CA3AF"}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            {/* Right Arrow */}
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon />}
              variant="outline"
              borderRadius="full"
              size="sm"
              border="1px solid #000"
              color="#000"
              // isDisabled={currentPage === totalPagess}
              isDisabled={attendanceData?.length === 0 || currentPage >= totalPagess}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPagess))
              }
            />
          </Flex>
          {/* )} */}
        </Box>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent
            borderRadius="14px"
            p={1}
            w="350px"
            pb={10}
            h="220px"
            position="fixed"
            bottom="150px"
            right="50px"
          >
            <ModalHeader
              fontSize="19px"
              fontWeight="600"
              color="#404040"
              fontFamily="Poppins"
            >
              Enter Working Hours
            </ModalHeader>
            {/* <ModalCloseButton /> */}

            <ModalBody>
              <Flex gap={4}>
                {/* Check In */}
                <Box flex="1">
                  <Text
                    fontSize="12px"
                    color="#000"
                    mb={1}
                    fontWeight="600"
                    fontFamily="Poppins"
                  >
                    Enter Check In Time*
                  </Text>
                  <TimePicker
                    value={selectedCheckIn}
                    onChange={(time) => setSelectedCheckIn(time)}
                  />
                </Box>

                {/* Check Out */}
                <Box flex="1">
                  <Text
                    fontSize="12px"
                    color="#000"
                    fontWeight="600"
                    mb={1}
                    fontFamily="Poppins"
                  >
                    Enter Check Out Time*
                  </Text>
                  <InputGroup>
                    <TimePicker
                      value={selectedCheckOut}
                      onChange={(time) => setSelectedCheckOut(time)}
                    />
                  </InputGroup>
                </Box>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button
                w="100%"
                bg="#243B66"
                color="white"
                borderRadius="10px"
                _hover={{ bg: "#1f3055" }}
                // onClick={UpdateAttendance}
                fontFamily="Poppins"
                onClick={() => {
                  if (attendanceSummary?.sessions?.length) {
                    const lastIndex = attendanceSummary.sessions.length - 1;
                    UpdateAttendance(
                      lastIndex,
                      selectedCheckIn,
                      selectedCheckOut,
                    );
                  }
                }}
              >
                Mark Attendance
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default MyAttendance;
