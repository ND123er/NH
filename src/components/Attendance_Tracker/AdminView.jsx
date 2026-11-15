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
import { useLocation } from "react-router-dom";
import BreadcrumbsNav from "../BreadCrumbsNav/BreadCrumbsNav";
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
  "Week Off": {
    bg: "#e8e1e1ff",
    color: "#8E8E8E",
    border: "0.67px solid #8E8E8E",
  },
};
const isCheckoutBeforeCheckin = (checkIn, checkOut) => {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);

  const checkInMinutes = inH * 60 + inM;
  const checkOutMinutes = outH * 60 + outM;

  return checkOutMinutes <= checkInMinutes;
};

const AdminView = (rowData) => {
  const location = useLocation();
  const employee = location.state?.employee;
  const queryParams = new URLSearchParams(location.search);
  const employeeId =
    employee?.employee_id ||
    employee?.employee_code ||
    queryParams.get("employee_id") ||
    "";
  const { user, token, loading } = useSelector((state) => state.auth);
  console.log("user____________________", user);
  const [attendanceSummary, setAttendanceSummary] = useState("");
  const [attendanceData, setattendanceData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  //new
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagess, setTotalPages] = useState(1);

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);
  const [attendanceError, setAttendanceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeDetail = attendanceSummary?.employee_detail || {};
  const employeeFullName =
    employeeDetail?.full_name ||
    employee?.full_name ||
    employee?.fullName ||
    [
      employeeDetail?.first_name ||
      userProfile?.first_name ||
      employee?.first_name ||
      "",
      employeeDetail?.middle_name ||
      employeeDetail?.midlle_name ||
      userProfile?.middle_name ||
      userProfile?.midlle_name ||
      employee?.middle_name ||
      employee?.midlle_name ||
      "",
      employeeDetail?.last_name ||
      userProfile?.last_name ||
      employee?.last_name ||
      "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  const employeeDesignation =
    employeeDetail?.designation ||
    userProfile?.designation ||
    employee?.designation ||
    employee?.position ||
    "-";
  const employeeMobile =
    employeeDetail?.mobile ||
    userProfile?.mobile ||
    employee?.mobile ||
    employee?.phone ||
    employee?.phone_number ||
    "";
  const employeeEmail =
    employeeDetail?.email ||
    employeeDetail?.work_email ||
    userProfile?.work_email ||
    userProfile?.email ||
    employee?.work_email ||
    employee?.email ||
    "-";

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

  // const buildISOTime = (date, time) => {
  //     if (!date || !time) return null;
  //     let baseDate;
  //     if (date.includes("T")) {
  //         baseDate = new Date(date);
  //     }
  //     else {
  //         baseDate = new Date(`${date}T00:00:00`);
  //     }
  //     if (isNaN(baseDate.getTime())) {
  //         console.error("Invalid base date:", date);
  //         return null;
  //     }
  //     const [hours, minutes] = time.split(":").map(Number);
  //     baseDate.setHours(hours);
  //     baseDate.setMinutes(minutes);
  //     baseDate.setSeconds(0);
  //     baseDate.setMilliseconds(0);

  //     return baseDate.toISOString();
  // };

  const buildISOTimeWithOffset = (date, time) => {
    if (!date || !time) return null;

    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);

    const offsetMinutes = -d.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00${sign}${hh}:${mm}`;
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
    if (employeeId) {
      getAttendanceHistorData(currentPage, selectedMonth);
    }
  }, [currentPage, selectedMonth, selectedYear, employeeId]);
  useEffect(() => {
    if (employeeId) {
      getAttendanceData();
      fetchProfile();
    }
  }, [selectedMonth, selectedYear, employeeId]);

  useEffect(() => {
    if (selectedDate) {
      getAttendanceDay(selectedDate);
    }
  }, [selectedDate]);
  const getAttendanceData = async () => {
    try {
      // const basicRes = await api.get(
      //     `/attendance/get_my_attendance_summary?employee_id=${employee?.employee_id
      //     }&month=${selectedMonth}&year=${selectedYear}`
      // );
      const basicRes = await api.get(
        `/employee/get_employee_detail?employee_id=${employeeId
        }&month=${selectedMonth}&year=${selectedYear}`,
      );
      //old
      // let basic = basicRes?.data;
      // setAttendanceSummary(basic);
      //new
      const basic = basicRes?.data;

      setEmployeeDetails(basic?.employee_detail || {});
      setAttendanceSummary(basic);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  };

  const getAttendanceHistorData = async (page = 1, month = selectedMonth) => {
    try {
      const basicRes = await api.get(
        `/attendance/get_my_attendance_history?employee_id=${employeeId}&month=${month}&year=${selectedYear}&page=${page}&limit=6`,
      );
      const basic = basicRes?.data;
      setattendanceData(basic.data);
      setTotalPages(basic.pagination.total_pages);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };
  const fetchProfile = async () => {
    try {
      const loggedInEmployeeId = getEmpCode();
      const url = `/employee/get_admin_detail?employee_id=${employeeId || loggedInEmployeeId}`;
      const res = await api.get(url);
      const data = res?.data?.result || {};
      setUserProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

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
      case "WEEK_OFF":
        return "Week Off";
      default:
        return "Absent";
    }
  };

  const isoToRailwayTime = (isoTime) => {
    if (!isoTime) return "-";
    const date = new Date(isoTime);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };
  const isoToLocalTime = (isoTime) => {
    if (!isoTime) return "-";
    const date = new Date(isoTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const getAttendanceDay = async (date) => {
    if (!date) return;

    try {
      const basicRes = await api.get(
        `/attendance/get_attendance_day?employee_id=${employeeId}&attendance_date=${date}`,
      );
      //old
      //   let basic = basicRes?.data;
      //   setAttendanceSummary(basic);
      //new
      const basic = basicRes?.data;
      setAttendanceSummary(basic);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkAttendanceCommand = async (commandId) => {
    try {
      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        const response = await api.get(
          `/schedules/commands/${commandId}`,
          {
            params: {
              organisation_id: user?.organisation_id,
            },
          }
        );
        const commandData = response?.data?.data || response?.data;

        console.log("Attendance Command Status:", commandData);

        const status = commandData?.status?.toUpperCase();

        if (["COMPLETED", "SUCCESS", "SUCCEEDED"].includes(status)) {
          return true;
        }

        if (["FAILED", "ERROR", "REJECTED"].includes(status)) {
          throw new Error(
            commandData?.msg || "Attendance correction failed"
          );
        }

        await delay(2000);
        attempts++;
      }

      throw new Error("Attendance correction is taking longer than expected.");

    } catch (error) {
      throw error;
    }
  };



  const UpdateAttendance = async (selectedSessionIndex, checkIn, checkOut) => {
    setAttendanceError("");

    if (isCheckoutBeforeCheckin(checkIn, checkOut)) {
      setAttendanceError("Check-out time must be after Check-in time.");
      return;
    }

    // 🔴 Validation
    if (!checkIn || !checkOut) {
      setAttendanceError("Please enter both Check-in and Check-out time.");
      return;
    }

    // if (!attendanceSummary?.sessions?.length) {
    //     setAttendanceError("Attendance sessions not found.");
    //     return;
    // }
    // if (!attendanceSummary?.sessions?.length) return;
    // const sessions = attendanceSummary.sessions;
    // const firstSession = sessions[0];
    // const lastSession = sessions[sessions.length - 1];
    const date = attendanceSummary.attendance_date;
    // if (!firstSession || !lastSession) {
    //     console.error("Sessions not found");
    //     return;
    // }
    // if (!firstSession?._id || !lastSession?._id) {
    //     setAttendanceError("Invalid attendance session.");
    //     return;
    // }
    const payload = {
      attendance_id: attendanceSummary.attendance_id,
      // session_id1: firstSession._id,
      // session_id2: lastSession._id,
      check_in_time: buildISOTimeWithOffset(date, checkIn),
      check_out_time: buildISOTimeWithOffset(date, checkOut),
      // updated_by: user?.employee_id,
    };
    try {
      const res = await api.put("/attendance/update_attendance_time", payload);
      getAttendanceDay(attendanceSummary.attendance_date);
      // getAttendanceHistorData();
      console.log("Attendance Update Response:", res?.data);

      const commandId = res?.data?.command_id;

      if (!commandId) {
        throw new Error("Command ID not received from server.");
      }

      // Step 2: Check command status
      await checkAttendanceCommand(commandId);

      // Step 3: Refresh attendance data after completion
      await getAttendanceDay(attendanceSummary.attendance_date);
      await getAttendanceHistorData(currentPage, selectedMonth);

      // getAttendanceHistorData(currentPage, selectedMonth);
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
    const datePart = isoDate.split("T")[0];
    const [year, month, day] = datePart.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };
  return (
    <Box
      bg="#F6F7FB"
      // minH="100vh" mt={3}
      p={{ base: 2, sm: 2, md: 3, lg: 0 }}
      h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "100vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
      w={{ base: "100vw", sm: "100vw", md: "96vw", lg: "100%" }}
    // ml={{ base: "1.0vw", sm: "1.0vw", md: "2.0vw", lg: "0vw" }}
    // mr={{ base: "1.0vw", sm: "1.0vw", md: "2.0vw", lg: "0vw" }}
    >
      {/* ================= Employee Details ================= */}
      <Box mb={4}>
        <BreadcrumbsNav extraSegments={["team-attendance", "employeeVew"]} />
      </Box>
      <Box
        h="80vh"
        overflowY="auto"
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
          mb={6}
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
          <Flex
            justify="space-between"
            align="center"
            pt={3}
            /*pl={6} pr={6}*/ pl={{ base: 2, sm: 3, md: 6, lg: 6 }}
            pr={{ base: 2, sm: 3, md: 6, lg: 6 }}
          >
            <Text
              fontWeight="600"
              fontSize={{ base: "14px", sm: "15px", md: "22px", lg: "24px" }}
              color="#404040"
              fontFamily="Poppins"
            >
              Employee Details
            </Text>
            <Flex gap={3}>
              {/* Month Select */}
              <Select
                size="sm"
                // w="150px"
                w={{ base: "120px", sm: "120px", md: "130px", lg: "150px" }}
                h="35px"
                borderRadius="8px"
                fontFamily="Poppins"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {months?.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Select>
              <Select
                size="sm"
                // w="100px"
                w={{ base: "80px", sm: "80px", md: "80px", lg: "100px" }}
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
          <Box
            mt={2}
            h="1.5px"
            bgImage="repeating-linear-gradient(
                        to right,
                      #C7C7C7 0 6px,
                        transparent 6px 14px
                        )"
          />
          <Flex
            gap={{ base: 2, sm: 3, md: 6, lg: 6 }}
            align="center"
            pl={{ base: 2, sm: 3, md: 6, lg: 6 }}
            pr={{ base: 2, sm: 3, md: 6, lg: 6 }}
            pt={2}
            pb={2}
          >
            <Avatar
              size={{ base: "md", sm: "md", md: "lg", lg: "xl" }}
              name="Employee"
              src={add_employee}
              border="4px solid #1E2A78"
              padding="2px"
            />
            <Box>
              <Text
                fontSize={{ base: "16px", sm: "18px", md: "22px", lg: "28px" }}
                fontWeight="500"
                fontFamily="Poppins"
                lineHeight={{ base: "1.3", md: "1.2" }}
                whiteSpace="normal"
                wordBreak="break-word"
              >
                {employeeFullName || "Employee"}
              </Text>

              <SimpleGrid
                columns={{ base: 2, sm: 2, md: 3, lg: 3 }}
                spacing={{ base: 5, sm: 3, md: 8, lg: 10 }}
                mt={2}
              >
                <Box>
                  <Text
                    fontSize={{
                      base: "13px",
                      sm: "14px",
                      md: "15px",
                      lg: "18px",
                    }}
                    color="#ADACAC"
                    fontWeight={"500"}
                    fontFamily="Poppins"
                  >
                    Designation
                  </Text>
                  <Text fontWeight="500" fontFamily="Poppins">
                    {employeeDesignation}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize={{
                      base: "13px",
                      sm: "14px",
                      md: "15px",
                      lg: "18px",
                    }}
                    color="#ADACAC"
                    fontWeight={"500"}
                    fontFamily="Poppins"
                  >
                    Phone Number
                  </Text>
                  <Text
                    fontWeight="500"
                    fontFamily="Poppins"
                    fontSize={{
                      base: "12px",
                      sm: "13px",
                      md: "15px",
                      lg: "16px",
                    }}
                  >
                    {employeeMobile ? `+91 ${employeeMobile}` : "-"}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize={{
                      base: "13px",
                      sm: "14px",
                      md: "15px",
                      lg: "18px",
                    }}
                    color="#ADACAC"
                    fontFamily="Poppins"
                    fontWeight={"500"}
                  >
                    Email Address
                  </Text>
                  <Text
                    fontWeight="500"
                    fontFamily="Poppins"
                    fontSize={{
                      base: "12px",
                      sm: "13px",
                      md: "15px",
                      lg: "16px",
                    }}
                  >
                    {employeeEmail}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
            {/* <Box>
                            <Text fontSize="28px" fontWeight="500" fontFamily="Poppins">
                                {userProfile?.first_name} {userProfile?.midlle_name && (userProfile?.midlle_name)} {userProfile?.last_name}
                            </Text>

                            <SimpleGrid columns={3} spacing={10} mt={2}>
                                <Box>
                                    <Text fontSize="18px" color="#ADACAC" fontWeight={'500'} fontFamily="Poppins">
                                        Designation
                                    </Text>
                                    <Text fontWeight="500" fontFamily="Poppins">{userProfile?.designation}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="18px" color="#ADACAC" fontWeight={'500'} fontFamily="Poppins">
                                        Phone Number
                                    </Text>
                                    <Text fontWeight="500" fontFamily="Poppins">+91 {userProfile?.mobile}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="18px" color="#ADACAC" fontFamily="Poppins" fontWeight={'500'}>
                                        Email Address
                                    </Text>
                                    <Text fontWeight="500" fontFamily="Poppins">{userProfile?.work_email}</Text>
                                </Box>
                            </SimpleGrid>
                        </Box> */}
          </Flex>

          <SimpleGrid
            columns={3}
            spacing={{ base: 2, sm: 2, md: 4, lg: 4 }}
            pl={{ base: 2, sm: 2, md: 6, lg: 6 }}
            pr={{ base: 2, sm: 2, md: 6, lg: 6 }}
            pt={3}
            pb={3}
          >
            {summaryCards?.map((item) => (
              <Box
                key={item.key}
                border="1px solid #E5E7EB"
                borderRadius="12px"
                p={{ base: 2, sm: 2, md: 4, lg: 4 }}
                pt={2}
                pb={2}
              >
                <Flex
                  align="center"
                  gap={{ base: 0, sm: 0, md: 2, lg: 2 }}
                  h={9}
                  alignItems={"center"}
                >
                  <Box w="25px">
                    <img src={item.icon} alt={item.label} />
                  </Box>
                  <Text
                    fontSize={{
                      base: "13px",
                      sm: "14px",
                      md: "15px",
                      lg: "15px",
                    }}
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
                    {/* {item.label} ({attendanceSummary?.employee_detail?.shift}) */}
                    {/* {item.label==='Shift'?({attendanceSummary?.employee_detail?.shift}):item.label}  */}
                    {/* old */}
                    {/* {item.label === "Shift"
                      ? `Shift (${attendanceSummary?.employee_detail?.shift})`
                      : item.label} */}
                    {/* new */}

                    {/* {item.label === "Shift"
                      ? `Shift (${employeeDetails?.shift || "--"})`
                      : item.label} */}

                    {item.label === "Shift"
                      ? `Shift (${employeeDetails?.current_schedule?.shift_snapshot
                        ?.shift_name ??
                      employeeDetails?.shift ??
                      "--"
                      })`
                      : item.label}
                  </Text>
                </Flex>

                {item.key === "shift" ? (
                  <Flex direction="column" mt={6}>
                    <Text
                      color="#000"
                      fontSize={{
                        base: "15px",
                        sm: "15px",
                        md: "30px",
                        lg: "30px",
                      }}
                      fontWeight="500"
                    >
                      {/* (
                                            {attendanceSummary?.employee_detail?.shift_start || "--"} -{" "}
                                            {attendanceSummary?.employee_detail?.shift_end || "--"}
                                            ) */}
                      {/* old */}
                      {/* ({attendanceSummary?.employee_detail?.shift_start || "--"}{" "}
                      - {attendanceSummary?.employee_detail?.shift_end || "--"}) */}
                      {/* new */}
                      {/* ({employeeDetails?.shift_start || "--"} -{" "}
                      {employeeDetails?.shift_end || "--"}) */}
                      (
                      {employeeDetails?.current_schedule?.shift_snapshot
                        ?.start ??
                        employeeDetails?.shift_start ??
                        "--"}{" "}
                      -{" "}
                      {employeeDetails?.current_schedule?.shift_snapshot?.end ??
                        employeeDetails?.shift_end ??
                        "--"}
                      )
                    </Text>
                  </Flex>
                ) : (
                  <Flex align="baseline" gap="6px" mt={2}>
                    <Text
                      fontSize={{
                        base: "20px",
                        sm: "20px",
                        md: "40px",
                        lg: "40px",
                      }}
                      fontWeight="500"
                      lineHeight="1"
                      mt={5}
                    >
                      {attendanceSummary?.[item.key] ?? 0}
                    </Text>
                    <Text
                      fontSize={{
                        base: "15px",
                        sm: "15px",
                        md: "25px",
                        lg: "25px",
                      }}
                      fontWeight="500"
                    >
                      days
                    </Text>
                  </Flex>
                )}
              </Box>
            ))}
          </SimpleGrid>
          {/* </SimpleGrid> */}
        </Box>

        {/* ================= Attendance History ================= */}
        <Box
          bg="white"
          borderRadius="14px"
          flexWrap={"wrap"}
          p={0}
          pt={2}
          pb={3}
          border="1px solid #E5E7EB"
          mb={{
            base: 40,
            sm: 90,
            md: 5,
            lg: 5,
          }} /*h={{ base: '88vh', sm: '63vh', md: '60vh', lg: '60vh' }}*/
        >
          <Flex justify="space-between" align="center" mb={2} pl={6} pr={6}>
            <Text
              fontWeight="600"
              color="#404040"
              fontSize={{ base: "14px", sm: "15px", md: "22px", lg: "24px" }}
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
                  borderRadius="8px"
                  cursor="pointer"
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
                  borderRadius="8px"
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
          {viewType === "grid" ? (
            /* ================= GRID VIEW ================= */
            <SimpleGrid
              columns={{ base: 2, sm: 2, md: 3, lg: 3 }}
              spacing={4}
              pl={{ base: 2, sm: 2, md: 6, lg: 6 }}
              pr={{ base: 2, sm: 2, md: 6, lg: 6 }}
            >
              {attendanceData?.map((item, index) => (
                <Box
                  key={index}
                  p={{ base: 2, sm: 2, md: 4, lg: 4 }}
                  pt={{ base: 2, sm: 2, md: 4, lg: 4 }}
                  pb={{ base: 2, sm: 2, md: 4, lg: 4 }}
                  border="1px solid #E5E7EB"
                  borderRadius="12px"
                  // bg={item.status === "Absent" ? "#F3F4F6" : "white"}
                  bg={
                    item?.base_status === "ABSENT" ||
                      item?.base_status === "WEEK_OFF"
                      ? "#F3F4F6"
                      : "white"
                  }
                  onClick={() => {
                    setSelectedDate(item.date);
                    setSelectedCheckIn(isoToLocalTime(item.check_in));
                    setSelectedCheckOut(isoToLocalTime(item.check_out));
                    onOpen();
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <img src={timer} width="18" height="18" />
                      {/* <Text fontSize="14px" fontWeight='600' color='#000' fontFamily="Poppins">{item.date}</Text> */}
                      <Text
                        fontSize="16px"
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
                      fontFamily="Poppins"
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
                  bg={
                    item?.base_status === "ABSENT" ||
                      item?.base_status === "WEEK_OFF"
                      ? "#F3F4F6"
                      : "white"
                  }
                  cursor="pointer"
                  _hover={{ bg: "#F9FAFB" }}
                  onClick={() => {
                    setSelectedDate(item.date);
                    setSelectedCheckIn(isoToLocalTime(item.check_in));
                    setSelectedCheckOut(isoToLocalTime(item.check_out));
                    onOpen();
                  }}
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
                        {/* {item.date} */}
                        {formatDateReadable(item.date)}
                      </Text>
                    </Flex>

                    <Badge
                      borderRadius="full"
                      px={3}
                      fontSize="11px"
                      fontWeight="500"
                      textTransform="none"
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
              isDisabled={
                attendanceData?.length === 0 || currentPage >= totalPagess
              }
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
            h={attendanceError ? "250px" : "auto"}
            className="
              check-modal
            "
          >
            <ModalHeader
              fontSize="19px"
              fontWeight="600"
              color="#404040"
              fontFamily="Poppins"
            >
              Enter Working Hours
              <Flex align="center" gap={1}>
                <img src={timer} width="16" height="13" />
                <Text fontSize="14px" color="#6B7280" fontWeight="500">
                  {formatDateReadable(selectedDate)}
                </Text>
              </Flex>
            </ModalHeader>

            <ModalBody>
              <Flex gap={4}>
                <Box flex="1">
                  <Text
                    fontSize="12px"
                    color="#000"
                    mb={1}
                    fontWeight="600"
                    fontFamily="Poppins"
                  >
                    Enter Check In Time
                    <Text as="span" color="red.500" fontSize="12px">
                      {" "}
                      *
                    </Text>
                  </Text>

                  <TimePicker
                    value={selectedCheckIn}
                    onChange={(time) => setSelectedCheckIn(time)}
                  />
                </Box>
                <Box flex="1">
                  <Text
                    fontSize="12px"
                    color="#000"
                    mb={1}
                    fontWeight="600"
                    fontFamily="Poppins"
                  >
                    Enter Check Out Time
                    <Text as="span" color="red.500" fontSize="12px">
                      {" "}
                      *
                    </Text>
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
            {attendanceError && (
              <Text
                mt={3}
                fontSize="13px"
                color="red.500"
                fontWeight="500"
                fontFamily="Poppins"
                ml={7}
              >
                {attendanceError}
              </Text>
            )}

            <ModalFooter>
              <Button
                w="100%"
                bg="#243B66"
                color="white"
                borderRadius="10px"
                _hover={{ bg: "#1f3055" }}
                fontFamily="Poppins"
                fontWeight="500"
                fontSize="14px"
                isLoading={isSubmitting}
                onClick={() => {
                  const lastIndex = attendanceSummary?.sessions?.length - 1;
                  UpdateAttendance(
                    lastIndex,
                    selectedCheckIn,
                    selectedCheckOut,
                  );
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

export default AdminView;
