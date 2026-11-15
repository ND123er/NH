import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Input,
  FormControl,
  FormLabel,
  Stack,
  Card,
  CardBody,
  IconButton,
  useToast,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Checkbox,
  CheckboxGroup,
  Select,
  Wrap,
  WrapItem,
  TagLabel,
  TagCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  FormErrorMessage,
  Switch,
  Collapse,
  SimpleGrid,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  DeleteIcon,
  AddIcon,
  EditIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import axios from "axios";
import api from "../../api/axios";
import BreadcrumbsNav from "../BreadCrumbsNav/BreadCrumbsNav";
import { Tag } from "lucide-react";
import { BsThreeDots } from "react-icons/bs";
import { TimePicker } from "react-time-picker";

const AttendanceTrackerSetting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadings, setLoading] = useState(false);
  const [shiftName, setShiftName] = useState("");
  // const [workinDays, setworkinDays] = useState("");
  const [workinHours, setworkinHours] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const { user, token, loading } = useSelector((state) => state.auth);
  const toast = useToast();
  const [editingShiftId, setEditingShiftId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [workinDays, setworkinDays] = useState([]);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [isGraceAllowed, setIsGraceAllowed] = useState(false);
  const [graceTime, setGraceTime] = useState(null);
  const [graceError, setGraceError] = useState("");
  const [fullDay, setFullDay] = useState("");
  const [fullDayTolerance, setFullDayTolerance] = useState("");
  const [halfDay, setHalfDay] = useState("");
  const [halfDayTolerance, setHalfDayTolerance] = useState("");
  //new
  const [shiftCode, setShiftCode] = useState("");
  const [crossesMidnight, setCrossesMidnight] = useState(false);
  // const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  // const [lateArrivalRule, setLateArrivalRule] = useState("After grace period");
  // const [earlyDepartureRule, setEarlyDepartureRule] = useState(
  //   "Before shift end minus grace",
  // );
  // const [overtimeEligibility, setOvertimeEligibility] = useState(false);
  // const [status, setStatus] = useState("Active");

  // Shift type controls the fields shown after Shift Code.
  const [shiftType, setShiftType] = useState("fixed");
  const [rotationalShift, setRotationalShift] = useState("");
  const [rotationalShiftOptions, setRotationalShiftOptions] = useState([]);
  // const rotationalShiftOptions = [
  //   "Weekly Rotation",
  //   "Bi-Weekly Rotation",
  //   "Monthly Rotation",
  // ];

  // const timePickerStyle = {
  //     ".react-time-picker": {
  //         width: "100%",
  //     },
  //     ".react-time-picker__wrapper": {
  //         height: "42px",
  //         borderRadius: "6px",
  //         border: "1px solid #E2E8F0",
  //         padding: "0 12px",
  //         display: "flex",
  //         alignItems: "center",
  //         fontFamily: "poppins",
  //         fontSize: "14px",
  //     },
  //     ".react-time-picker__inputGroup": {
  //         border: "none",
  //     },
  //     ".react-time-picker__wrapper:hover": {
  //         borderColor: "#CBD5E0",
  //     },
  //     ".react-time-picker__wrapper:focus-within": {
  //         borderColor: "#274066",
  //         boxShadow: "0 0 0 1px #274066",
  //     },
  //     ".react-time-picker__inputGroup__input": {
  //         fontFamily: "poppins",
  //         fontSize: "14px",
  //         color: "#1A202C",
  //     },
  //     ".react-time-picker__clear-button": {
  //         display: "none",
  //     },
  //     ".react-time-picker__clock-button": {
  //         display: "none",
  //     },
  // };
  const timePickerStyle = {
    ".react-time-picker": {
      width: "100%",
    },

    ".react-time-picker__wrapper": {
      height: "42px",
      borderRadius: "8px",
      border: "1.5px solid #274066",
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
      fontFamily: "poppins",
      fontSize: "14px",
    },

    /* ✅ REMOVE INNER BOX */
    ".react-time-picker__inputGroup": {
      border: "none",
    },

    ".react-time-picker__inputGroup__input": {
      border: "none",
      outline: "none",
      boxShadow: "none",
      padding: "0",
      fontFamily: "poppins",
      fontSize: "14px",
      width: "22px",
      textAlign: "center",
    },

    ".react-time-picker__inputGroup__divider": {
      padding: "0 4px",
    },

    ".react-time-picker__clear-button": {
      display: "none",
    },

    ".react-time-picker__clock-button": {
      display: "none", // 🔥 clock icon removed
    },
  };

  useEffect(() => {
    fetchShiftList();
  }, []);

  useEffect(() => {
    const storedPatterns = localStorage.getItem(
      "attendance_rotational_shift_patterns",
    );

    if (storedPatterns) {
      const parsedPatterns = JSON.parse(storedPatterns);

      setRotationalShiftOptions(
        parsedPatterns.map((pattern) => pattern.patternName),
      );
    }
  }, []);

  const fetchShiftList = async () => {
    try {
      setLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);
      const url = `/settings/get_company_shift_list?org_id=${orgId}`;
      const res = await api.get(url);
      // ✅ FIXED HERE
      setShifts(res.data?.list || []);
    } catch (error) {
      console.error("Error fetching shifts", error);
      toast({
        title: "Failed to fetch shifts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const DAY_MAP = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const NUMBER_TO_DAY = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };
  const handleShowAddForm = () => {
    setShowForm(true);
    setShiftType("fixed");
    setRotationalShift("");
    setEditingShiftId(null);
    setShiftName("");
    setShiftStart("");
    setShiftEnd("");
    setworkinDays([]);
    setworkinHours("");
    setFullDayTolerance("");
    setHalfDayTolerance("");
    setFullDay("");
    setHalfDay("");
    setGraceTime("");
    setIsGraceAllowed("");
  };
  const convertTimeToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleAddShift = async () => {
    const numericWorkingDays = workinDays.map((day) => DAY_MAP[day]);
    if (!shiftName || !shiftStart || !shiftEnd || !workinHours || !workinDays) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);
      const body = {
        organisation_id: orgId,
        shift_name: shiftName,
        start: shiftStart,
        end: shiftEnd,
        working_days: numericWorkingDays,
        working_minutes: workinHours,
        // working_hours: workinHours,
        is_grace_allowed: isGraceAllowed,
        grace_time: isGraceAllowed ? convertTimeToMinutes(graceTime) : 0,
        full_day_minutes: convertTimeToMinutes(fullDay),
        full_day_tolerance_minutes: convertTimeToMinutes(fullDayTolerance),
        half_day_minutes: convertTimeToMinutes(halfDay),
        half_day_tolerance_minutes: convertTimeToMinutes(halfDayTolerance),
        //new
        shift_code: shiftCode,
        // crosses_midnight: crossesMidnight,
        // timezone,
        // late_arrival_rule: lateArrivalRule,
        // early_departure_rule: earlyDepartureRule,
        // overtime_eligible: overtimeEligibility,
        // status,
      };
      const res = await api.post(`/settings/add_company_shift_deatils`, body);
      toast({
        title: "Shift added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ IMPORTANT: Fresh list reload
      await fetchShiftList();

      // reset form
      setShiftName("");
      setShiftStart("");
      setShiftEnd("");
      // setworkinDays("");
      setworkinDays([]);
      setworkinHours("");
      setShowForm(false);
      setIsGraceAllowed(false);
      setGraceTime(null);
      setFullDay("");
      setFullDayTolerance("");
      setHalfDay("");
      setHalfDayTolerance("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to add shift",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditShift = async (shiftId) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/settings/get_comapany_shift_by_id/${shiftId}`,
      );
      const shift = res.data?.data;
      if (!shift) return;
      // 🔹 form pre-fill
      setShiftName(shift.shift_name);
      setShiftStart(shift.start);
      setShiftEnd(shift.end);
      setworkinDays(
        (shift.working_days || []).map((num) => NUMBER_TO_DAY[num]),
      );

      setworkinHours(shift.working_minutes);
      // setworkinHours(shift.working_hours);
      setIsGraceAllowed(shift.is_grace_time);
      setFullDay(convertMinutesToTime(shift.full_day_minutes));
      setFullDayTolerance(
        convertMinutesToTime(shift.full_day_tolerance_minutes),
      );
      setHalfDay(convertMinutesToTime(shift.half_day_minutes));
      setHalfDayTolerance(
        convertMinutesToTime(shift.half_day_tolerance_minutes),
      );

      if (shift.is_grace_time) {
        setGraceTime(convertMinutesToTime(shift.grace_time));
      } else {
        setGraceTime(null);
      }
      setEditingShiftId(shiftId);
      setShowForm(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to fetch shift details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShift = async () => {
    if (!editingShiftId) return;

    if (
      !shiftName ||
      !shiftStart ||
      !shiftEnd ||
      workinDays.length === 0 ||
      !workinHours
    ) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const workingDaysNumbers = workinDays.map((day) => DAY_MAP[day]);
    try {
      setLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);
      const body = {
        organisation_id: orgId,
        shift_name: shiftName,
        start: shiftStart,
        end: shiftEnd,
        working_days: workingDaysNumbers,
        // working_hours: workinHours,
        working_minutes: workinHours,
        is_grace_allowed: isGraceAllowed,
        grace_time: isGraceAllowed ? convertTimeToMinutes(graceTime) : 0,
        full_day_minutes: convertTimeToMinutes(fullDay),
        full_day_tolerance_minutes: convertTimeToMinutes(fullDayTolerance),
        half_day_minutes: convertTimeToMinutes(halfDay),
        half_day_tolerance_minutes: convertTimeToMinutes(halfDayTolerance),
        //new
        shift_code: shiftCode,
        // crosses_midnight: crossesMidnight,
        // timezone,
        // late_arrival_rule: lateArrivalRule,
        // early_departure_rule: earlyDepartureRule,
        // overtime_eligible: overtimeEligibility,
        // status,
      };
      const res = await api.put(
        `/settings/update_shift_data/${editingShiftId}`,
        body,
      );
      setShifts((prev) =>
        prev.map((shift) =>
          shift._id === editingShiftId ? { ...shift, ...body } : shift,
        ),
      );

      toast({
        title: "Shift updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowForm(false);
      setEditingShiftId(null);
      setShiftName("");
      setShiftStart("");
      setShiftEnd("");
      setworkinDays([]);
      setworkinHours("");
      setIsGraceAllowed(false);
      setGraceTime(null);
      setFullDay("");
      setHalfDay("");
      setFullDayTolerance("");
      setHalfDayTolerance("");
    } catch (error) {
      toast({
        title: "Failed to update shift",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      const url = `/settings/delete_shift_data/${shiftToDelete}`;
      const res = await api.delete(url);
      toast({
        title: "Shift deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchShiftList();
      onClose();
      setShiftToDelete(null);
    } catch (error) {
      console.error("Delete Shift Error:", error);

      toast({
        title: "Failed to delete shift",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };
  const isEndTimeAfterStart = (start, end) => {
    if (!start || !end) return true;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return eh * 60 + em > sh * 60 + sm;
  };
  const handleWorkingHoursChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setworkinHours(value);
  };

  const validateForm = () => {
    let newErrors = {};
    const fullDayMin = convertToMinutes(fullDay);
    const halfDayMin = convertToMinutes(halfDay);
    const fullTolMin = convertToMinutes(fullDayTolerance);
    const halfTolMin = convertToMinutes(halfDayTolerance);
    if (!shiftName.trim()) {
      newErrors.shiftName = "Shift name is required";
    }
    if (!fullDay.trim()) {
      newErrors.fullDay = "Full day is required";
    }
    if (!halfDay.trim()) {
      newErrors.halfDay = "Half day is required";
    }
    if (halfDay && fullDay && halfDayMin > fullDayMin) {
      newErrors.halfDay = "Half day cannot be greater than full day";
    }

    // 2️⃣ Full Day Tolerance > Full Day
    if (fullDayTolerance && fullTolMin > fullDayMin) {
      newErrors.fullDayTolerance =
        "Full day tolerance cannot be greater than full day";
    }

    // 3️⃣ Half Day Tolerance > Half Day
    if (halfDayTolerance && halfTolMin > halfDayMin) {
      newErrors.halfDayTolerance =
        "Half day tolerance cannot be greater than half day";
    }

    if (!shiftStart) {
      newErrors.shiftStart = "Start time is required";
    }

    if (!shiftEnd) {
      newErrors.shiftEnd = "End time is required";
    }

    if (shiftStart && shiftEnd && !isEndTimeAfterStart(shiftStart, shiftEnd)) {
      newErrors.shiftEnd = "End time must be after start time";
    }

    if (!workinDays.length) {
      newErrors.workinDays = "Select at least one working day";
    }

    if (!workinHours || Number(workinHours) <= 0) {
      newErrors.workinHours = "Enter valid working hours";
    }
    if (isGraceAllowed && !graceTime) {
      setGraceError("Please enter grace time");
    } else {
      setGraceError("");
    }
    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0 && !(isGraceAllowed && !graceTime)
    );
  };
  //old1409
  // const calculateWorkingHours = (start, end) => {
  //   if (!start || !end) return "";
  //   const [sh, sm] = start.split(":").map(Number);
  //   const [eh, em] = end.split(":").map(Number);
  //   const startMinutes = sh * 60 + sm;
  //   const endMinutes = eh * 60 + em;
  //   if (endMinutes <= startMinutes) return "";
  //   const diffMinutes = endMinutes - startMinutes;
  //   return diffMinutes;
  // };
  //new1409
  const calculateWorkingHours = (start, end) => {
    if (!start || !end) return "";

    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);

    let diff = endMinutes - startMinutes;

    if (diff <= 0) {
      diff += 24 * 60;
    }

    return diff;
  };
  //new
  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const convertMinutesToTime = (minutes) => {
    if (!minutes && minutes !== 0) return null;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };
  const minutesToHHMM = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return "";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const convertToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const shiftSettingTabs = [
    {
      label: "Shift Definitions",
      path: "/settings/AttendanceTrackerSetting/shiftSetting",
    },
    //  {
    //   label: "Shift List",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/shiftlist",
    // },
    {
      label: "Shift Patterns",
      path: "/settings/AttendanceTrackerSetting/shiftSetting/patterns",
    },
    // {
    //   label: "Assign Shift",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/AssignShift",
    // },
    // {
    //   label: "Rosters",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/rosters",
    // },
    // {
    //   label: "Work Locations",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/work-locations",
    // },
    // {
    //   label: "Attendance Policies",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/attendance-policies",
    // },
  ];

  return (
    <Box p={0} mt={3}>
      {/* <Box mb={4}>
        <BreadcrumbsNav
          extraSegments={["checkInCheckOutSettings", "shift-setting"]}
        />
      </Box> */}
      <Box
        bg="white"
        borderRadius="14px"
        boxShadow="sm"
        p={6}
        pl={0}
        pr={0}
        h="78vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        {/* Shift settings tabs */}
        <Flex
          px={6}
          borderBottom="1px solid"
          borderColor="#E7EAF0"
          gap={{ base: 5, md: 7 }}
          overflowX="auto"
          sx={{
            "&::-webkit-scrollbar": { height: "0px" },
          }}
        >
          {shiftSettingTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Button
                key={tab.path}
                variant="unstyled"
                minW="max-content"
                h="48px"
                px={1}
                fontSize="13px"
                fontWeight={isActive ? "600" : "500"}
                color={isActive ? "#274066" : "#4B5563"}
                borderBottom={
                  isActive ? "2px solid #274066" : "2px solid transparent"
                }
                borderRadius="0"
                onClick={() => navigate(tab.path)}
                _hover={{ color: "#274066" }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Flex>

        {/* Header */}
        <Flex
          justify="space-between"
          align="flex-start"
          mb={4}
          mt={5}
          ml={6}
          mr={6}
        >
          <Box>
            <Heading
              fontSize="18px"
              fontWeight="600"
              fontFamily="poppins"
              color="#1F2937"
            >
              Shift Definitions
            </Heading>
            {/* <Text fontSize="11px" color="#6B7280" mt={1} fontFamily="poppins">
              These shifts will be used in creating shift patterns and rosters.
            </Text> */}
          </Box>
          <Button
            size="sm"
            bg="#2F4A7A"
            color="white"
            borderRadius="8px"
            fontSize="13px"
            px={4}
            _hover={{ bg: "#233A63" }}
            onClick={handleShowAddForm}
            fontFamily="poppins"
            height={"38px"}
          >
            Add Shift
          </Button>
        </Flex>
        {/* Dashed Divider */}
        <Box
          w="100%"
          h="2px"
          bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
          mb={4}
        />
        {/* Table */}
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  pl={6}
                  textTransform="none"
                  verticalAlign="middle"
                  py={3}
                  fontWeight="600"
                  color={"#000"}
                >
                  Shift Name
                </Th>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  pl={6}
                  textTransform="none"
                  verticalAlign="middle"
                  py={3}
                  fontWeight="600"
                  color={"#000"}
                >
                  Shift Code
                </Th>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  textTransform="none"
                  fontWeight="600"
                  color={"#000"}
                >
                  Start time
                </Th>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  textTransform="none"
                  fontWeight="600"
                  color={"#000"}
                >
                  End time
                </Th>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  textTransform="none"
                  fontWeight="600"
                  color={"#000"}
                >
                  Working days
                </Th>
                <Th
                  fontSize="14px"
                  fontFamily="poppins"
                  textTransform="none"
                  fontWeight="600"
                  color={"#000"}
                >
                  Working hours
                </Th>
                <Th
                  fontSize="14px"
                  textAlign="right"
                  fontFamily="poppins"
                  pr={6}
                  textTransform="none"
                  fontWeight="600"
                  color={"#000"}
                >
                  Action
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {shifts.map((shift, index) => (
                <Tr key={shift._id} bg={index % 2 === 0 ? "#F5F6F8" : "white"}>
                  <Td fontSize="14px" fontFamily="poppins" color="#000" pl={6}>
                    {shift.shift_name}
                  </Td>
                  <Td fontSize="14px" fontFamily="poppins" color="#000" pl={6}>
                    {shift.shift_code}
                  </Td>
                  <Td fontSize="14px" fontFamily="poppins" color="#000">
                    {shift.start}
                  </Td>
                  <Td fontSize="14px" fontFamily="poppins" color="#000">
                    {shift.end}
                  </Td>
                  <Td fontSize="14px" fontFamily="poppins" color="#000">
                    {shift.working_days?.length}
                  </Td>
                  <Td fontSize="14px" fontFamily="poppins" color="#000">
                    {/* {shift.working_minutes} */}
                    {minutesToHHMM(shift.working_minutes)}
                    {/* {minutesToHHMM(shift.working_hours)} */}
                  </Td>

                  {/* 3-dot action */}
                  <Td textAlign="right" pr={9}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        size="sm"
                        variant="ghost"
                        // icon={<ChevronDownIcon />}
                        icon={<BsThreeDots />}
                      />

                      {/* icon={<BsThreeDots />} */}
                      <MenuList>
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => handleEditShift(shift._id)}
                          fontFamily="poppins"
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={() => {
                            setShiftToDelete(shift._id);
                            onOpen();
                          }}
                          fontFamily="poppins"
                          color="red.500"
                          _hover={{
                            bg: "red.50",
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingShiftId(null);
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.400" />

        <ModalContent
          borderRadius="12px"
          fontFamily="poppins"
          boxShadow="0px 10px 30px rgba(0,0,0,0.2)"
          maxW="800px"
          overflow="hidden"
        >
          {/* HEADER */}
          <ModalHeader
            fontSize="20px"
            fontWeight="600"
            color="#122B55"
            borderBottom="1px solid #E2E8F0"
            pb={4}
            pt={5}
            px={6}
            fontFamily="poppins"
          >
            {editingShiftId ? "Update Shift" : "Add Shift"}
            <Text fontSize="12px" fontWeight="400" color="#64748B" mt={1}>
              Create a new shift to be used in shift patterns and rosters.
            </Text>
          </ModalHeader>

          <ModalCloseButton top="18px" right={5} size="md" color="#122B55" />

          <ModalBody p={0}>
            <Stack spacing={0}>
              {/* 1. BASIC INFORMATION */}
              <Box px={6} py={4}>
                <Text fontSize="16px" fontWeight="600" color="#122B55" mb={3}>
                  1. Basic Information
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={errors.shiftName}>
                    <FormLabel
                      fontSize="13px"
                      fontWeight="500"
                      color="#122B55"
                      mb={1.5}
                    >
                      Shift Name
                      <Text as="span" color="red.500">
                        {" "}
                        *
                      </Text>
                    </FormLabel>

                    <Input
                      placeholder="e.g. Morning Shift"
                      value={shiftName}
                      onChange={(e) => {
                        setShiftName(e.target.value);
                        clearError("shiftName");
                      }}
                      height="42px"
                      borderColor="#CBD5E1"
                      borderRadius="7px"
                      _focus={{
                        borderColor: "#274066",
                        boxShadow: "0 0 0 1px #274066",
                      }}
                      _placeholder={{
                        color: "#94A3B8",
                        fontSize: "13px",
                      }}
                    />
                    <FormErrorMessage>{errors.shiftName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.shiftCode}>
                    <FormLabel
                      fontSize="13px"
                      fontWeight="500"
                      color="#122B55"
                      mb={1.5}
                    >
                      Shift Code
                      <Text as="span" color="red.500">
                        {" "}
                        *
                      </Text>
                    </FormLabel>

                    <Input
                      placeholder="e.g. MORN"
                      value={shiftCode}
                      onChange={(e) => {
                        setShiftCode(e.target.value.toUpperCase());
                        clearError("shiftCode");
                      }}
                      height="42px"
                      borderColor="#CBD5E1"
                      borderRadius="7px"
                      _focus={{
                        borderColor: "#274066",
                        boxShadow: "0 0 0 1px #274066",
                      }}
                      _placeholder={{
                        color: "#94A3B8",
                        fontSize: "13px",
                      }}
                    />
                    <FormErrorMessage>{errors.shiftCode}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Box borderTop="1px solid #E2E8F0" />

              {/* 2. SHIFT TYPE */}
              {/* <Box px={6} py={4}> */}
              {/* <Text fontSize="16px" fontWeight="600" color="#122B55" mb={3}>
                  2. Shift Type
                </Text> */}

              {/* <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <Box>
                    <RadioGroup value={shiftType} onChange={setShiftType}>
                      <Radio
                        value="fixed"
                        colorScheme="blue"
                        fontFamily="poppins"
                      >
                        <Text fontSize="14px" fontWeight="500">
                          Fixed Shift
                        </Text>
                        <Text
                          fontSize="12px"
                          color="#64748B"
                          ml={0}
                          mt={1}
                        >
                          Define a consistent start and end time.
                        </Text>
                      </Radio>
                    </RadioGroup>
                  </Box>

                  <Box>
                    <RadioGroup value={shiftType} onChange={setShiftType}>
                      <Radio
                        value="rotational"
                        colorScheme="blue"
                        fontFamily="poppins"
                      >
                        <Text fontSize="14px" fontWeight="500">
                          Rotational Shift
                        </Text>
                        <Text
                          fontSize="12px"
                          color="#64748B"
                          mt={1}
                        >
                          Use an existing shift pattern.
                        </Text>
                      </Radio>
                    </RadioGroup>

                    {shiftType === "rotational" && (
                      <FormControl className="shiftwrapper" mt={3}>
                        <Menu>
                          <MenuButton
                            as={Button}
                            width="100%"
                            height="42px"
                            variant="outline"
                            textAlign="left"
                            fontWeight="400"
                            fontFamily="Poppins"
                            justifyContent="space-between"
                            rightIcon={<ChevronDownIcon />}
                            borderColor="#CBD5E1"
                          >
                            {rotationalShift || "Select Shift Pattern"}
                          </MenuButton>

                          <MenuList width="100%" className="addshift">
                            {rotationalShiftOptions.map((option) => (
                              <MenuItem
                                width="100%"
                                key={option}
                                onClick={() => setRotationalShift(option)}
                                fontFamily="Poppins"
                              >
                                {option}
                              </MenuItem>
                            ))}

                            <MenuDivider
                              borderBottomWidth="1px"
                              borderColor="#CBD5E0"
                            />

                            <MenuItem
                              onClick={() =>
                                navigate(
                                  "/settings/AttendanceTrackerSetting/shiftSetting/patterns"
                                )
                              }
                              fontFamily="Poppins"
                              icon={<AddIcon />}
                            >
                              Create shift pattern
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </FormControl>
                    )}
                  </Box>
                </SimpleGrid> */}
              {/* </Box> */}

              {/* <Box borderTop="1px solid #E2E8F0" /> */}

              {/* 3. TIME DETAILS */}
              {/* {shiftType === "fixed" && ( */}
              <>
                <Box px={6} py={4}>
                  <Text fontSize="16px" fontWeight="600" color="#122B55" mb={3}>
                    3. Time Details
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {/* Start Time */}
                    <FormControl isInvalid={errors.shiftStart}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Start Time
                        <Text as="span" color="red.500">
                          {" "}
                          *
                        </Text>
                      </FormLabel>

                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={shiftStart}
                          onChange={(value) => {
                            setShiftStart(value);

                            if (shiftEnd) {
                              const hours = calculateWorkingHours(
                                value,
                                shiftEnd,
                              );
                              setworkinHours(hours);
                            }
                            clearError("shiftStart");
                          }}
                        />
                      </Box>
                      <FormErrorMessage>{errors.shiftStart}</FormErrorMessage>
                    </FormControl>

                    {/* End Time */}
                    <FormControl isInvalid={errors.shiftEnd}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        End Time
                        <Text as="span" color="red.500">
                          {" "}
                          *
                        </Text>
                      </FormLabel>

                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={shiftEnd}
                          onChange={(value) => {
                            setShiftEnd(value);

                            if (shiftStart) {
                              const hours = calculateWorkingHours(
                                shiftStart,
                                value,
                              );
                              setworkinHours(hours);
                            }
                            clearError("shiftEnd");
                          }}
                        />
                      </Box>
                      <FormErrorMessage>{errors.shiftEnd}</FormErrorMessage>
                    </FormControl>

                    {/* Working Hours */}
                    <FormControl>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Working Hours
                      </FormLabel>

                      <Input
                        value={minutesToHHMM(workinHours)}
                        height="42px"
                        disabled
                        bg="#F1F5F9"
                        color="#64748B"
                        borderColor="#E2E8F0"
                        borderRadius="7px"
                      />
                    </FormControl>

                    {/* Crosses Midnight */}
                    {/* <FormControl>
                        <FormLabel
                          fontSize="13px"
                          fontWeight="500"
                          color="#122B55"
                          mb={1.5}
                        >
                          Crosses Midnight
                        </FormLabel>

                        <Flex align="center" height="42px">
                          <Switch
                            isChecked={crossesMidnight}
                            onChange={(e) =>
                              setCrossesMidnight(e.target.checked)
                            }
                            sx={{
                              ".chakra-switch__track": {
                                bg: "gray.300",
                              },
                              ".chakra-switch__track[data-checked]": {
                                bg: "#D4D9E1",
                              },
                              ".chakra-switch__thumb": {
                                bg: "#fff",
                              },
                              ".chakra-switch__thumb[data-checked]": {
                                bg: "#274066",
                              },
                            }}
                          />
                        </Flex>
                      </FormControl> */}
                  </SimpleGrid>
                </Box>

                <Box borderTop="1px solid #E2E8F0" />

                {/* 4. WORKING DAYS */}
                <Box px={6} py={4}>
                  <Text fontSize="16px" fontWeight="600" color="#122B55" mb={1}>
                    4. Working Days
                  </Text>
                  <Text fontSize="12px" color="#64748B" mb={3}>
                    Select the days on which this shift normally works.
                  </Text>

                  <FormControl isInvalid={!!errors.workinDays}>
                    <CheckboxGroup
                      value={workinDays}
                      onChange={(values) => {
                        setworkinDays(values);
                        if (values.length) {
                          clearError("workinDays");
                        }
                      }}
                    >
                      <Flex gap={{ base: 3, md: 5 }} wrap="wrap">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <Checkbox
                            key={day}
                            value={day.slice(0, 3)}
                            fontSize="13px"
                            fontFamily="poppins"
                            sx={{
                              ".chakra-checkbox__control": {
                                border: "1px solid #CBD5E0",
                                borderRadius: "4px",
                              },
                              ".chakra-checkbox__control[data-checked]": {
                                bg: "#274066",
                                borderColor: "#274066",
                              },
                              ".chakra-checkbox__label": {
                                fontSize: "13px",
                                fontFamily: "poppins",
                                color: "#334155",
                              },
                            }}
                          >
                            {day}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                    <FormErrorMessage>{errors.workinDays}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box borderTop="1px solid #E2E8F0" />

                {/* 5. OTHER SETTINGS */}
                <Box px={6} py={4}>
                  <Text fontSize="16px" fontWeight="600" color="#122B55" mb={3}>
                    5. Other Settings
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {/* Grace Time */}
                    <FormControl>
                      <Flex align="center" mb={1.5}>
                        <FormLabel
                          mb={0}
                          fontSize="13px"
                          fontWeight="500"
                          color="#122B55"
                        >
                          Grace Time
                        </FormLabel>
                        {/* <Switch
                            size="sm"
                            isChecked={isGraceAllowed}
                            onChange={(e) => {
                              setIsGraceAllowed(e.target.checked);
                              if (!e.target.checked) {
                                setGraceTime(null);
                                setGraceError("");
                              }
                            }}
                            sx={{
                              ".chakra-switch__track": {
                                bg: "gray.300",
                              },
                              ".chakra-switch__track[data-checked]": {
                                bg: "#D4D9E1",
                              },
                              ".chakra-switch__thumb": {
                                bg: "#fff",
                              },
                              ".chakra-switch__thumb[data-checked]": {
                                bg: "#274066",
                              },
                            }}
                          /> */}
                      </Flex>

                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={graceTime}
                          onChange={(value) => {
                            setGraceTime(value);
                            setIsGraceAllowed(!!value);
                            setGraceError("");
                          }}
                          // disabled={!isGraceAllowed}
                        />
                      </Box>

                      <FormErrorMessage>{graceError}</FormErrorMessage>
                    </FormControl>

                    {/* Working hour(s) */}
                    {/* <FormControl>
                        <FormLabel
                          fontSize="13px"
                          fontWeight="500"
                          color="#122B55"
                          mb={1.5}
                        >
                          Working hour(s)
                        </FormLabel>
                        <Input
                          value={minutesToHHMM(workinHours)}
                          height="42px"
                          disabled
                          bg="#F1F5F9"
                          color="#64748B"
                          borderColor="#E2E8F0"
                          borderRadius="7px"
                        />
                      </FormControl> */}

                    {/* Full Day */}
                    <FormControl isInvalid={!!errors.fullDay}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Full Day
                        <Text as="span" color="red.500">
                          {" "}
                          *
                        </Text>
                      </FormLabel>
                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={fullDay}
                          onChange={setFullDay}
                        />
                      </Box>
                      <FormErrorMessage>{errors.fullDay}</FormErrorMessage>
                    </FormControl>

                    {/* Half Day */}
                    <FormControl isInvalid={!!errors.halfDay}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Half Day
                        <Text as="span" color="red.500">
                          {" "}
                          *
                        </Text>
                      </FormLabel>
                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={halfDay}
                          onChange={setHalfDay}
                        />
                      </Box>
                      <FormErrorMessage>{errors.halfDay}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  {/* Existing tolerance fields are retained */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                    <FormControl isInvalid={!!errors.fullDayTolerance}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Full Day Tolerance
                      </FormLabel>
                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={fullDayTolerance}
                          onChange={setFullDayTolerance}
                        />
                      </Box>
                      <FormErrorMessage>
                        {errors.fullDayTolerance}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.halfDayTolerance}>
                      <FormLabel
                        fontSize="13px"
                        fontWeight="500"
                        color="#122B55"
                        mb={1.5}
                      >
                        Half Day Tolerance
                      </FormLabel>
                      <Box sx={timePickerStyle}>
                        <TimePicker
                          format="HH:mm"
                          disableClock
                          value={halfDayTolerance}
                          onChange={setHalfDayTolerance}
                        />
                      </Box>
                      <FormErrorMessage>
                        {errors.halfDayTolerance}
                      </FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              </>
              {/* )} */}
            </Stack>
          </ModalBody>

          {/* FOOTER */}
          <ModalFooter
            borderTop="1px solid #E2E8F0"
            pt={4}
            px={6}
            pb={4}
            justifyContent="flex-end"
            gap={3}
          >
            <Button
              variant="outline"
              borderColor="#CBD5E1"
              color="#274066"
              px={6}
              fontSize="13px"
              fontWeight="500"
              height="38px"
              onClick={() => {
                setShiftName("");
                setShiftStart("");
                setShiftEnd("");
                setworkinDays([]);
                setworkinHours("");
              }}
            >
              Clear form
            </Button>

            <Button
              bg="#274066"
              color="white"
              px={6}
              fontSize="13px"
              fontWeight="500"
              minW="120px"
              height="38px"
              fontFamily="poppins"
              _hover={{ bg: "#1F3552" }}
              onClick={() => {
                if (validateForm()) {
                  editingShiftId ? handleUpdateShift() : handleAddShift();
                }
              }}
            >
              {editingShiftId ? "Update Shift" : "Save Shift"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              fontFamily="poppins"
            >
              Delete Shift
            </AlertDialogHeader>

            <AlertDialogBody fontFamily="poppins">
              Are you sure you want to delete this shift?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} fontFamily="poppins">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteShift}
                ml={3}
                fontFamily="poppins"
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AttendanceTrackerSetting;
