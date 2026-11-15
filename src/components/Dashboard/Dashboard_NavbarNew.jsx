import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Image,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  Tag,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useMediaQuery,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import searchIcon from "../../assets/search_icon2.svg";
import bellIcon from "../../assets/bell_icon.svg";
import chevronDown from "../../assets/mingcute_down-line.png";
import avatar_img from "../../assets/avatar_img.png";
import nav_logo from "../../assets/nav_logo.png";
import NotificationsDropdown from "./NotificationsDropdown";
import { decodeTokenPayload, getEmpCode } from "../../utils/token";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../slices/authSlice";
import Cookies from "js-cookie";
//new
import { useMemo } from "react";

import {
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Select,
  SimpleGrid,
  Spacer,
  Switch,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

import {
  AddIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
const SESSION_CHECK_IN_TIME = "check_in_time";
const SESSION_IS_CHECKED_IN = "is_checked_in";
const SESSION_ELAPSED_SECONDS = "elapsed_seconds";
/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_SHIFTS = [
  {
    id: "morning",
    code: "M",
    name: "Morning Shift",
    start: "06:00 AM",
    end: "02:00 PM",
    color: "#2F855A",
    bg: "#C6E6B8",
    border: "#A9D79A",
  },
  {
    id: "evening",
    code: "E",
    name: "Evening Shift",
    start: "02:00 PM",
    end: "10:00 PM",
    color: "#B7791F",
    bg: "#FFE0AE",
    border: "#FFD08A",
  },
  {
    id: "night",
    code: "N",
    name: "Night Shift",
    start: "10:00 PM",
    end: "06:00 AM",
    color: "#24528F",
    bg: "#BFD6F5",
    border: "#A8C6F0",
  },
  {
    id: "off",
    code: "OFF",
    name: "Day Off",
    start: "",
    end: "",
    color: "#5D6470",
    bg: "#EEF0F3",
    border: "#D8DCE2",
  },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
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
];

/* =========================================================
   HELPERS
========================================================= */

const pad = (number) => String(number).padStart(2, "0");

const dateToKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
};

const parseDateKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const differenceInDays = (dateA, dateB) => {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());

  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((a - b) / msPerDay);
};
// const getWeekDays = (weekIndex) => {
//   return rotationDays.slice(weekIndex * 7, weekIndex * 7 + 7);
// };

/* =========================================================
   SHIFT BADGE
========================================================= */

function ShiftBadge({ shift, size = "md", onClick }) {
  if (!shift) return null;

  const dimensions =
    size === "sm"
      ? {
          width: "27px",
          height: "27px",
          fontSize: "11px",
        }
      : {
          width: "32px",
          height: "32px",
          fontSize: "12px",
        };

  return (
    <Box
      width={dimensions.width}
      height={dimensions.height}
      borderRadius="6px"
      bg={shift.bg}
      border={`1px solid ${shift.border}`}
      color={shift.color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="700"
      fontSize={dimensions.fontSize}
      cursor={onClick ? "pointer" : "default"}
      transition="all .15s ease"
      _hover={
        onClick
          ? {
              transform: "translateY(-1px)",
              boxShadow: "0 2px 5px rgba(0,0,0,.08)",
            }
          : {}
      }
      onClick={onClick}
    >
      {shift.code}
    </Box>
  );
}

/* =========================================================
   SHIFT SELECTOR
========================================================= */

function ShiftSelector({
  shifts,
  selectedShiftId,
  onSelect,
  buttonText = "Select Shift",
}) {
  const selectedShift = shifts.find((s) => s.id === selectedShiftId);

  return (
    <Menu placement="bottom-start">
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        borderColor="#D6DAE1"
        bg="white"
        fontSize="13px"
        fontWeight="500"
        h="38px"
        minW="180px"
        textAlign="left"
      >
        {selectedShift ? (
          <HStack spacing={2}>
            <ShiftBadge shift={selectedShift} size="sm" />
            <Box>
              <Text fontSize="12px" fontWeight="600">
                {selectedShift.name}
              </Text>

              {selectedShift.start && (
                <Text fontSize="10px" color="gray.500">
                  {selectedShift.start} - {selectedShift.end}
                </Text>
              )}
            </Box>
          </HStack>
        ) : (
          buttonText
        )}
      </MenuButton>

      <MenuList
        borderRadius="10px"
        p={1}
        minW="240px"
        boxShadow="0 8px 30px rgba(0,0,0,.12)"
      >
        {shifts.map((shift) => (
          <MenuItem
            key={shift.id}
            borderRadius="7px"
            py={2}
            onClick={() => onSelect(shift.id)}
          >
            <HStack spacing={3}>
              <ShiftBadge shift={shift} size="sm" />

              <Box flex="1">
                <Text fontSize="13px" fontWeight="600">
                  {shift.name}
                </Text>

                {shift.start && (
                  <Text fontSize="10px" color="gray.500">
                    {shift.start} - {shift.end}
                  </Text>
                )}
              </Box>

              {selectedShiftId === shift.id && (
                <CheckIcon color="#1F3661" boxSize={3} />
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export default function Dashboard_Navbar() {
  const toast = useToast();

  /* ---------------------------------------------------------
     BASIC FORM
  --------------------------------------------------------- */

  const [patternName, setPatternName] = useState("3 Shift Weekly Rotation");

  const [rotationType, setRotationType] = useState("Weekly");

  const [repeatCycle, setRepeatCycle] = useState(true);

  /*
    The date from which cycle day #1 starts.

    Change this to whatever date your backend considers
    the beginning of the rotation.
  */
  const [cycleStartDate, setCycleStartDate] = useState("2026-09-01");

  /* ---------------------------------------------------------
     DYNAMIC SHIFTS
  --------------------------------------------------------- */

  const [shifts, setShifts] = useState(INITIAL_SHIFTS);

  /* ---------------------------------------------------------
     CALENDAR
  --------------------------------------------------------- */

  const initialCalendarDate = new Date(2026, 8, 1);

  const [calendarDate, setCalendarDate] = useState(initialCalendarDate);

  /*
    Every date starts as AUTO.

    Example:
    {
      "2026-09-05": "off",
      "2026-09-15": "evening"
    }

    Dates assigned to the same shift are grouped into one
    pattern card below the calendar.
  */
  const [calendarAssignments, setCalendarAssignments] = useState({});

  /* ---------------------------------------------------------
     NEW SHIFT FORM
  --------------------------------------------------------- */

  const [isAddingShift, setIsAddingShift] = useState(false);

  const [newShift, setNewShift] = useState({
    name: "",
    code: "",
    start: "",
    end: "",
    color: "#6B46C1",
    bg: "#E9D8FD",
    border: "#D6BCFA",
  });

  /* ---------------------------------------------------------
     MONTH INFORMATION
  --------------------------------------------------------- */

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  /*
    We create enough cells to display a normal calendar grid.
  */
  const calendarCells = useMemo(() => {
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(currentYear, currentMonth, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  /* ---------------------------------------------------------
     SHIFT LOOKUP
  --------------------------------------------------------- */

  const getShiftById = (shiftId) => {
    return shifts.find((shift) => shift.id === shiftId);
  };


  const previousMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToCurrentMonth = () => {
    const today = new Date();

    setCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  /* =========================================================
     ADD SHIFT
  ========================================================= */

  const handleAddShift = () => {
    if (!newShift.name.trim()) {
      toast({
        title: "Shift name required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });

      return;
    }

    const code =
      newShift.code.trim().toUpperCase() ||
      newShift.name.trim().substring(0, 1).toUpperCase();

    const id =
      newShift.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now();

    const shift = {
      ...newShift,
      id,
      code,
      name: newShift.name.trim(),
    };

    setShifts((previous) => [...previous, shift]);

    setNewShift({
      name: "",
      code: "",
      start: "",
      end: "",
      color: "#6B46C1",
      bg: "#E9D8FD",
      border: "#D6BCFA",
    });

    setIsAddingShift(false);

    toast({
      title: "Shift added",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
  };

  /* =========================================================
     DELETE SHIFT
  ========================================================= */

  const deleteShift = (shiftId) => {
    /*
      Don't allow deleting OFF.
    */
    if (shiftId === "off") {
      return;
    }

    setShifts((previous) => previous.filter((shift) => shift.id !== shiftId));

    /*
      Remove the deleted shift from any calendar assignments.
      Those dates return to AUTO.
    */
    setCalendarAssignments((previous) => {
      const updated = { ...previous };

      Object.keys(updated).forEach((date) => {
        if (updated[date] === shiftId) {
          delete updated[date];
        }
      });

      return updated;
    });
  };

  /* =========================================================
     CALENDAR ASSIGNMENT
  ========================================================= */

  const getCalendarAssignment = (date) => {
    const key = dateToKey(date);
    return calendarAssignments[key] || "auto";
  };

  const assignDateShift = (date, shiftId) => {
    const key = dateToKey(date);

    setCalendarAssignments((previous) => ({
      ...previous,
      [key]: shiftId,
    }));
  };

  const setDateAuto = (date) => {
    const key = dateToKey(date);

    setCalendarAssignments((previous) => {
      const updated = { ...previous };
      delete updated[key];
      return updated;
    });
  };

  /*
    Group every selected date by its shift.

    Example:
    Morning -> 01 Sep, 02 Sep, 03 Sep
    OFF     -> 04 Sep
    Evening -> 05 Sep, 06 Sep
  */
  const patternGroups = useMemo(() => {
    const groups = {};

    Object.entries(calendarAssignments).forEach(([date, shiftId]) => {
      if (!shiftId || shiftId === "auto") return;

      const shift = shifts.find((item) => item.id === shiftId);

      if (!shift) return;

      if (!groups[shiftId]) {
        groups[shiftId] = {
          shiftId,
          shift,
          dates: [],
        };
      }

      groups[shiftId].dates.push(date);
    });

    return Object.values(groups);
  }, [calendarAssignments, shifts]);

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {
    const payload = {
      pattern_name: patternName,
      rotation_type: rotationType,
      repeat_cycle: repeatCycle,
      cycle_start_date: cycleStartDate,

      shifts,

      calendar_assignments: calendarAssignments,

      pattern_groups: patternGroups.map((group) => ({
        shift_id: group.shiftId,
        dates: group.dates,
      })),
    };

    console.log("SHIFT PATTERN PAYLOAD:", payload);

    toast({
      title: "Pattern saved",
      description: "The shift pattern data has been logged to the console.",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      // minH="100%"
      minH="100vh"
      h="auto"
      // h="100%"
      bg="#F7F9FC"
      p={{ base: 3, md: 6 }}
      fontFamily="'Poppins', sans-serif"
      color="#1D2939"
    >
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <Flex align="center" gap={2} mb={5} color="#667085" fontSize="12px">
        <Text>Settings</Text>
        <Text>›</Text>

        <Text>Attendance Tracker Settings</Text>
        <Text>›</Text>

        <Text>Shift Settings</Text>
        <Text>›</Text>

        <Text color="#101828" fontWeight="600">
          Create Shift Pattern
        </Text>
      </Flex>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid #E4E7EC"
        overflow="visible"
        boxShadow="0 1px 3px rgba(16,24,40,.04)"
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Box px={{ base: 5, md: 7 }} py={5} borderBottom="1px solid #E4E7EC">
          <Grid
            templateColumns={{
              base: "1fr",
              lg: "1.5fr 1fr 1fr 1fr",
            }}
            gap={6}
            alignItems="end"
          >
            <Box>
              <Text fontSize="18px" fontWeight="700" color="#101828">
                Create Shift Pattern
              </Text>

              <Text mt={1} fontSize="12px" color="#667085">
                Build a rotation pattern using shifts or days off.
              </Text>
            </Box>

            {/* Pattern Name */}

            <FormControl>
              <FormLabel fontSize="11px" fontWeight="600" mb={1.5}>
                Pattern Name{" "}
                <Text as="span" color="#E53E3E">
                  *
                </Text>
              </FormLabel>

              <Input
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                h="38px"
                fontSize="12px"
                borderColor="#D0D5DD"
                borderRadius="7px"
                _focus={{
                  borderColor: "#1F3661",
                  boxShadow: "0 0 0 1px #1F3661",
                }}
              />
            </FormControl>

            {/* Rotation Type */}

            <FormControl>
              <FormLabel fontSize="11px" fontWeight="600" mb={1.5}>
                Rotation Type
              </FormLabel>

              <Select
                value={rotationType}
                onChange={(e) => setRotationType(e.target.value)}
                h="38px"
                fontSize="12px"
                borderColor="#D0D5DD"
                borderRadius="7px"
              >
                <option value="Daily">Daily</option>

                <option value="Weekly">Weekly</option>

                <option value="Monthly">Monthly</option>

                <option value="Custom">Custom</option>
              </Select>
            </FormControl>

            {/* Repeat */}

            <FormControl>
              <Flex align="center" justify="space-between">
                <Box>
                  <FormLabel fontSize="11px" fontWeight="600" mb={0}>
                    Repeat Cycle
                  </FormLabel>

                  <Text fontSize="10px" color="#667085" mt={1}>
                    Repeat after 21 days
                  </Text>
                </Box>

                <Switch
                  isChecked={repeatCycle}
                  onChange={(e) => setRepeatCycle(e.target.checked)}
                  colorScheme="green"
                />
              </Flex>
            </FormControl>
          </Grid>

          {/* Cycle start date */}

          <Flex
            mt={5}
            align={{ base: "start", md: "center" }}
            gap={4}
            flexWrap="wrap"
          >
            <FormControl maxW="220px">
              <FormLabel fontSize="11px" fontWeight="600" mb={1.5}>
                Rotation Start Date
              </FormLabel>

              <Input
                type="date"
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                h="38px"
                fontSize="12px"
                borderColor="#D0D5DD"
              />
            </FormControl>

            <Box>
              <Text fontSize="10px" color="#667085">
                Day 1 of the rotation will begin on
              </Text>

              <Text fontSize="12px" fontWeight="600" color="#1F3661">
                {new Date(cycleStartDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* ===================================================
            SHIFT PALETTE
        =================================================== */}

        <Box px={{ base: 5, md: 7 }} py={5}>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            flexWrap="wrap"
            gap={3}
          >
            <Box>
              <Text fontSize="15px" fontWeight="700" color="#101828">
                Shift Types
              </Text>

              <Text fontSize="11px" color="#667085" mt={1}>
                Drag conceptually or click a day to assign shifts.
              </Text>
            </Box>

            <Button
              size="sm"
              leftIcon={<AddIcon />}
              variant="outline"
              borderColor="#1F3661"
              color="#1F3661"
              onClick={() => setIsAddingShift(!isAddingShift)}
            >
              Add Shift
            </Button>
          </Flex>

          {/* Existing shifts */}

          <Flex gap={3} flexWrap="wrap">
            {shifts.map((shift) => (
              <Flex
                key={shift.id}
                align="center"
                gap={3}
                border="1px solid #E4E7EC"
                borderRadius="8px"
                px={3}
                py={2}
                minW="145px"
                bg="white"
              >
                <ShiftBadge shift={shift} />

                <Box flex="1">
                  <Text fontSize="11px" fontWeight="600">
                    {shift.name}
                  </Text>

                  {shift.start ? (
                    <Text fontSize="9px" color="#667085">
                      {shift.start} - {shift.end}
                    </Text>
                  ) : (
                    <Text fontSize="9px" color="#667085">
                      Day Off
                    </Text>
                  )}
                </Box>

                {shift.id !== "off" && (
                  <IconButton
                    aria-label="Delete shift"
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    color="#98A2B3"
                    onClick={() => deleteShift(shift.id)}
                  />
                )}
              </Flex>
            ))}
          </Flex>

          {/* Add shift */}

          {isAddingShift && (
            <Box
              mt={4}
              p={4}
              bg="#F8FAFC"
              border="1px solid #E4E7EC"
              borderRadius="10px"
            >
              <Text fontSize="12px" fontWeight="700" mb={3}>
                Add New Shift
              </Text>

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(4, 1fr)",
                }}
                gap={3}
              >
                <Input
                  placeholder="Shift name"
                  value={newShift.name}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      name: e.target.value,
                    })
                  }
                  bg="white"
                  fontSize="12px"
                />

                <Input
                  placeholder="Code e.g. G"
                  value={newShift.code}
                  maxLength={3}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      code: e.target.value,
                    })
                  }
                  bg="white"
                  fontSize="12px"
                />

                <Input
                  type="time"
                  value={newShift.start}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      start: e.target.value,
                    })
                  }
                  bg="white"
                  fontSize="12px"
                />

                <Input
                  type="time"
                  value={newShift.end}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      end: e.target.value,
                    })
                  }
                  bg="white"
                  fontSize="12px"
                />
              </Grid>

              <Flex justify="flex-end" gap={2} mt={3}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingShift(false)}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  bg="#1F3661"
                  color="white"
                  _hover={{
                    bg: "#162843",
                  }}
                  onClick={handleAddShift}
                >
                  Add Shift
                </Button>
              </Flex>
            </Box>
          )}
        </Box>

        <Divider />

        <Divider />

        {/* ===================================================
            MONTH CALENDAR
        =================================================== */}

        <Box px={{ base: 5, md: 7 }} py={6}>
          <Flex
            justify="space-between"
            align="center"
            mb={5}
            flexWrap="wrap"
            gap={3}
          >
            <Box>
              <Text fontSize="15px" fontWeight="700">
                Monthly Schedule
              </Text>

              <Text fontSize="11px" color="#667085" mt={1}>
                Every date starts as Auto. Select a shift or OFF to build the pattern.
              </Text>
            </Box>

            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                onClick={goToCurrentMonth}
              >
                Today
              </Button>

              <IconButton
                aria-label="Previous month"
                icon={<ChevronLeftIcon />}
                size="sm"
                variant="outline"
                onClick={previousMonth}
              />

              <Box minW="150px" textAlign="center">
                <Text fontSize="14px" fontWeight="700">
                  {MONTHS[currentMonth]} {currentYear}
                </Text>
              </Box>

              <IconButton
                aria-label="Next month"
                icon={<ChevronRightIcon />}
                size="sm"
                variant="outline"
                onClick={nextMonth}
              />
            </HStack>
          </Flex>

          {/* Legend */}

          <Flex gap={4} mb={4} flexWrap="wrap">
            <HStack spacing={2}>
              <Box
                width="27px"
                height="27px"
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
                A
              </Box>

              <Text fontSize="10px" color="#667085">
                Auto
              </Text>
            </HStack>

            {shifts.map((shift) => (
              <HStack key={shift.id} spacing={2}>
                <ShiftBadge shift={shift} size="sm" />

                <Text fontSize="10px" color="#667085">
                  {shift.name}
                </Text>
              </HStack>
            ))}
          </Flex>

          {/* Calendar */}

          <Box
            border="1px solid #E4E7EC"
            borderRadius="10px"
            overflow="hidden"
          >
            {/* Week header */}

            <Grid
              templateColumns="repeat(7, 1fr)"
              bg="#F8FAFC"
              borderBottom="1px solid #E4E7EC"
            >
              {WEEK_DAYS.map((day) => (
                <Box
                  key={day}
                  py={3}
                  textAlign="center"
                  borderRight="1px solid #E4E7EC"
                  _last={{
                    borderRight: "none",
                  }}
                >
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    color="#667085"
                  >
                    {day}
                  </Text>
                </Box>
              ))}
            </Grid>

            {/* Days */}

            <Grid templateColumns="repeat(7, 1fr)">
              {calendarCells.map((date, index) => {
                if (!date) {
                  return (
                    <Box
                      key={`empty-${index}`}
                      minH={{
                        base: "85px",
                        md: "120px",
                      }}
                      bg="#FBFCFD"
                      borderRight="1px solid #E4E7EC"
                      borderBottom="1px solid #E4E7EC"
                    />
                  );
                }

                const key = dateToKey(date);
                const assignment = getCalendarAssignment(date);
                const selectedShift =
                  assignment === "auto"
                    ? null
                    : getShiftById(assignment);

                const today = new Date();
                const isToday =
                  dateToKey(date) === dateToKey(today);

                return (
                  <Box
                    key={key}
                    minH={{
                      base: "85px",
                      md: "120px",
                    }}
                    p={{
                      base: 2,
                      md: 3,
                    }}
                    borderRight="1px solid #E4E7EC"
                    borderBottom="1px solid #E4E7EC"
                    position="relative"
                    bg="white"
                    transition="background .15s"
                    _hover={{
                      bg: "#F9FAFB",
                    }}
                  >
                    {/* Date */}

                    <Flex
                      justify="space-between"
                      align="center"
                      mb={3}
                    >
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
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                        >
                          {date.getDate()}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Date assignment */}

                    <Menu placement="bottom-start">
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        p={0}
                        h="auto"
                        minW="auto"
                        width="100%"
                        _hover={{
                          bg: "transparent",
                        }}
                        _active={{
                          bg: "transparent",
                        }}
                      >
                        <VStack
                          spacing={1}
                          align="start"
                          width="100%"
                        >
                          {assignment === "auto" ? (
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
                                fontSize="12px"
                              >
                                A
                              </Box>

                              <Text
                                fontSize="9px"
                                color="#667085"
                                textAlign="left"
                              >
                                Auto
                              </Text>
                            </>
                          ) : (
                            <>
                              <ShiftBadge
                                shift={selectedShift}
                              />

                              <Text
                                fontSize="9px"
                                color="#667085"
                                textAlign="left"
                                maxW="100px"
                                noOfLines={1}
                              >
                                {selectedShift?.name}
                              </Text>
                            </>
                          )}
                        </VStack>
                      </MenuButton>

                      <MenuList
                        minW="230px"
                        p={1}
                        borderRadius="9px"
                        boxShadow="0 8px 30px rgba(0,0,0,.12)"
                      >
                        <Box px={3} py={2}>
                          <Text
                            fontSize="11px"
                            fontWeight="700"
                          >
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>

                          <Text
                            fontSize="9px"
                            color="#98A2B3"
                            mt={1}
                          >
                            Select a shift, OFF, or Auto
                          </Text>
                        </Box>

                        <Divider />

                        {/* Auto */}

                        <MenuItem
                          borderRadius="6px"
                          onClick={() => setDateAuto(date)}
                        >
                          <HStack spacing={3}>
                            <Box
                              width="27px"
                              height="27px"
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
                              A
                            </Box>

                            <Text
                              fontSize="11px"
                              fontWeight="600"
                              flex="1"
                            >
                              Auto
                            </Text>

                            {assignment === "auto" && (
                              <CheckIcon
                                boxSize={3}
                                color="#1F3661"
                              />
                            )}
                          </HStack>
                        </MenuItem>

                        {/* Shifts + OFF */}

                        {shifts.map((availableShift) => (
                          <MenuItem
                            key={availableShift.id}
                            onClick={() =>
                              assignDateShift(
                                date,
                                availableShift.id
                              )
                            }
                            borderRadius="6px"
                          >
                            <HStack spacing={3}>
                              <ShiftBadge
                                shift={availableShift}
                                size="sm"
                              />

                              <Box flex="1">
                                <Text
                                  fontSize="11px"
                                  fontWeight="600"
                                >
                                  {availableShift.name}
                                </Text>

                                {availableShift.start && (
                                  <Text
                                    fontSize="9px"
                                    color="#98A2B3"
                                  >
                                    {availableShift.start} -{" "}
                                    {availableShift.end}
                                  </Text>
                                )}
                              </Box>

                              {assignment ===
                                availableShift.id && (
                                <CheckIcon
                                  boxSize={3}
                                  color="#1F3661"
                                />
                              )}
                            </HStack>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </Box>

        <Divider />

        {/* ===================================================
            PATTERN GROUPS
        =================================================== */}

        <Box px={{ base: 5, md: 7 }} py={6}>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            flexWrap="wrap"
            gap={3}
          >
            <Box>
              <Text
                fontSize="15px"
                fontWeight="700"
                color="#101828"
              >
                Pattern Groups
              </Text>

              <Text
                fontSize="11px"
                color="#667085"
                mt={1}
              >
                Dates assigned to the same shift are grouped into one pattern card.
              </Text>
            </Box>

            <Badge
              px={3}
              py={1}
              borderRadius="full"
              colorScheme="purple"
            >
              {patternGroups.length} Groups
            </Badge>
          </Flex>

          {patternGroups.length === 0 ? (
            <Box
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="10px"
              p={6}
              textAlign="center"
              bg="gray.50"
            >
              <Text
                fontSize="13px"
                fontWeight="600"
                color="gray.600"
              >
                No pattern groups created yet
              </Text>

              <Text
                fontSize="11px"
                color="gray.500"
                mt={1}
              >
                Select a shift or OFF on one or more calendar dates.
              </Text>
            </Box>
          ) : (
            <SimpleGrid
              columns={{
                base: 1,
                md: 2,
                xl: 3,
              }}
              spacing={4}
            >
              {patternGroups.map((group) => {
                const shift = group.shift;

                return (
                  <Box
                    key={group.shiftId}
                    border="1px solid"
                    borderColor={shift.border}
                    borderRadius="10px"
                    overflow="hidden"
                    bg="white"
                  >
                    {/* Card Header */}

                    <Box
                      bg={shift.bg}
                      px={4}
                      py={3}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                      >
                        <HStack spacing={3}>
                          <ShiftBadge
                            shift={shift}
                          />

                          <Box>
                            <Text
                              fontSize="13px"
                              fontWeight="700"
                              color={shift.color}
                            >
                              {shift.name}
                            </Text>

                            {shift.start && (
                              <Text
                                fontSize="10px"
                                color="#667085"
                              >
                                {shift.start} - {shift.end}
                              </Text>
                            )}
                          </Box>
                        </HStack>

                        <Badge
                          bg="white"
                          color={shift.color}
                          border="1px solid"
                          borderColor={shift.border}
                          borderRadius="full"
                          px={2}
                        >
                          {group.dates.length}{" "}
                          {group.dates.length === 1
                            ? "Day"
                            : "Days"}
                        </Badge>
                      </Flex>
                    </Box>

                    {/* Dates */}

                    <Box p={4}>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        color="#667085"
                        mb={2}
                        textTransform="uppercase"
                      >
                        Assigned Dates
                      </Text>

                      <Wrap spacing={2}>
                        {group.dates.map((dateKey) => {
                          const assignedDate =
                            parseDateKey(dateKey);

                          return (
                            <WrapItem key={dateKey}>
                              <Box
                                px={3}
                                py={2}
                                borderRadius="6px"
                                bg="#F8FAFC"
                                border="1px solid #EAECF0"
                              >
                                <Text
                                  fontSize="11px"
                                  fontWeight="600"
                                  color="#344054"
                                >
                                  {assignedDate.toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    }
                                  )}
                                </Text>
                              </Box>
                            </WrapItem>
                          );
                        })}
                      </Wrap>
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

        <Divider />

        {/* ===================================================
            FOOTER
        =================================================== */}

        <Box
          px={{ base: 5, md: 7 }}
          py={5}
          borderTop="1px solid #E4E7EC"
          bg="#FCFCFD"
        >
          <Flex justify="flex-end" gap={3}>
            <Button
              variant="outline"
              borderColor="#D0D5DD"
              bg="white"
              minW="115px"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>

            <Button
              bg="#1F3661"
              color="white"
              minW="140px"
              _hover={{
                bg: "#162843",
              }}
              onClick={handleSave}
            >
              Save Pattern
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

// export default function Dashboard_Navbar({
//   setMobileOpen,
//   onAttendanceChange,
// }) {
//   const navBg = useColorModeValue("white", "#000");
//   const borderClr = useColorModeValue("#cccccc", "gray.700");
//   const textClr = useColorModeValue("black", "white");
//   const subTextClr = useColorModeValue("#757575", "gray.400");
//   const payload = typeof window !== "undefined" ? decodeTokenPayload() : null;
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [seconds, setSeconds] = useState(0);
//   const [userProfile, setUserProfile] = useState(null);
//   const timerRef = useRef(null);
//   const { user, token, loading } = useSelector((state) => state.auth);
//   const toast = useToast();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const cancelRef = useRef();
//   const location = useLocation();
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1;
//   const currentYear = now.getFullYear();

//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [settingsData, setSettingsData] = useState(null);
//   const [
//     isMobile,
//     isTablet,
//     isDesktop,
//     isLargeScreen,
//   ] = useMediaQuery([
//     "(max-width: 480px)",
//     "(min-width: 481px) and (max-width: 768px)",
//     "(min-width: 769px) and (max-width: 1200px)", // desktop
//     "(min-width: 1201px)",
//   ]);
//   useEffect(() => {
//     const isChecked = sessionStorage.getItem(SESSION_IS_CHECKED_IN);
//     const storedSeconds = sessionStorage.getItem(SESSION_ELAPSED_SECONDS);
//     const checkInTime = sessionStorage.getItem(SESSION_CHECK_IN_TIME);

//     if (storedSeconds) {
//       setSeconds(parseInt(storedSeconds, 10));
//     }

//     if (isChecked === "true" && checkInTime) {
//       const startTime = parseInt(checkInTime, 10);
//       const now = Date.now();
//       const elapsedFromLastCheckIn = Math.floor((now - startTime) / 1000);

//       setSeconds((prev) => prev + elapsedFromLastCheckIn);
//       setIsCheckedIn(true);
//       startTimer();
//     } else {
//       setIsCheckedIn(false);
//     }

//     return () => stopTimer();
//   }, []);

//   useEffect(() => {
//     fetchProfile();
//     fetchSettings();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const employeeId = getEmpCode();
//       const url = `/employee/get_admin_detail?employee_id=${employeeId}`;
//       const res = await api.get(url);

//       const data = res?.data?.result || {};
//       setUserProfile(data);
//     } catch (err) {
//       console.error("Failed to fetch profile", err);
//     }
//   };

//   const fetchSettings = async () => {
//     try {
//       const url = `attendance/get_attendance_setting?organisation_id=${user?.organisation_id}`;
//       const res = await api.get(url);
//       setSettingsData(res.data?.data);
//       // setAllowWeb(res.data?.data?.allow_web_checkin);
//       // setMandatoryCheckout(res.data?.data?.mandatory_checkout);
//       // // setLateMode(res.data?.data?.late_mark_mode);
//       // setLateMode(LATE_MODE_UI_MAP[res.data?.data?.late_mark_mode]);
//     } catch (err) {
//       console.error("Error fetching attendance settings:", err);
//     }
//   }

//   const getAttendanceHistorData = async (
//     page = 1,
//     month = selectedMonth,
//     year = selectedYear
//   ) => {
//     try {
//       const res = await api.get(`/attendance/get_my_attendance_history`, {
//         params: {
//           employee_id: user?.employee_id,
//           month,
//           year,
//           page,
//           limit: 6,
//         },
//       });
//       const data = res?.data;

//       setAttendanceData(data?.data || []);
//       setTotalPages(data?.pagination?.total_pages || 1);
//     } catch (error) {
//       console.error("Error fetching attendance history:", error);
//     }
//   };

//   const handleCheckToggle = async () => {
//     if (isCheckedIn) {
//       // 🔴 CHECK OUT
//       const success = await handleCheckInCheckOut("check_out");
//       if (!success) return;

//       stopTimer();
//       setIsCheckedIn(false);

//       sessionStorage.setItem(SESSION_ELAPSED_SECONDS, seconds.toString());
//       sessionStorage.removeItem(SESSION_CHECK_IN_TIME);
//       sessionStorage.setItem(SESSION_IS_CHECKED_IN, "false");
//     } else {
//       // 🟢 CHECK IN
//       const success = await handleCheckInCheckOut("check_in");
//       if (!success) return; // ❌ API failed → STOP HERE

//       const now = Date.now();
//       sessionStorage.setItem(SESSION_CHECK_IN_TIME, now.toString());
//       sessionStorage.setItem(SESSION_IS_CHECKED_IN, "true");

//       setIsCheckedIn(true);
//       startTimer(); // ✅ ONLY AFTER SUCCESS
//     }
//   };

//   const handleConfirmLogout = () => {
//     onLogoutClose();
//     handleLogout();
//   };
//   // const handleLogout = () => {
//   //   // 1. Redux clear
//   //   dispatch(logout());

//   //   // 2. LocalStorage clear
//   //   localStorage.removeItem("token");
//   //   localStorage.removeItem("user");

//   //   // 3. Cookies clear (🔥 THIS WAS MISSING)
//   //   Cookies.remove("auth_token");

//   //   // 4. Navigate to login
//   //   navigate("/", { replace: true });
//   // };
//   const handleLogout = () => {
//     stopTimer();
//     setSeconds(0);
//     setIsCheckedIn(false);
//     sessionStorage.clear();

//     dispatch(logout());
//     localStorage.clear();
//     Cookies.remove("auth_token");
//     localStorage.removeItem("org_code");

//     navigate("/", { replace: true });
//   };

//   const stopTimer = () => {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   };

//   const formatTime = (totalSeconds) => {
//     const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
//     const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
//       2,
//       "0"
//     );
//     const secs = String(totalSeconds % 60).padStart(2, "0");
//     return `${hrs}:${mins}:${secs}`;
//   };

//   const startTimer = () => {
//     if (timerRef.current) return;
//     timerRef.current = setInterval(() => {
//       setSeconds((prev) => prev + 1);
//     }, 1000);
//   };

//   const {
//     isOpen: isProfileOpen,
//     onOpen: onProfileOpen,
//     onClose: onProfileClose,
//   } = useDisclosure();
//   const {
//     isOpen: isLogoutOpen,
//     onOpen: onLogoutOpen,
//     onClose: onLogoutClose,
//   } = useDisclosure();

//   const getFirstName = () => {
//     return (
//       (payload && (payload.first_name || payload.firstName)) ||
//       (payload && payload.full_name ? payload.full_name.split(" ")[0] : null) ||
//       (userProfile && (userProfile.first_name || userProfile.firstName)) ||
//       "User"
//     );
//   };

//   const getFullName = () => {
//     if (payload && (payload.full_name || payload.fullName)) {
//       return payload.full_name || payload.fullName;
//     }
//     const parts = [
//       payload?.first_name ||
//       payload?.firstName ||
//       userProfile?.first_name ||
//       userProfile?.firstName ||
//       "",
//       payload?.middle_name ||
//       payload?.midlle_name ||
//       userProfile?.middle_name ||
//       userProfile?.midlle_name ||
//       "",
//       payload?.last_name ||
//       payload?.lastName ||
//       userProfile?.last_name ||
//       userProfile?.lastName ||
//       "",
//     ].filter(Boolean);
//     return parts.length ? parts.join(" ") : "User";
//   };

//   const firstName = getFirstName();
//   const fullName = getFullName();

//   const handleCheckInCheckOut = async (action) => {
//     try {
//       const body = {
//         employee_id: user?.employee_id,
//       };

//       await api.post("/attendance/punch", body);

//       toast({
//         title:
//           action === "check_in"
//             ? "Check In successfully"
//             : "Check Out successfully",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       // getAttendanceHistorData();
//       onAttendanceChange();
//       // setTimeout(() => {
//       //   window.location.reload();
//       // }, 800);

//       return true; // ✅ SUCCESS
//     } catch (err) {
//       toast({
//         title: "Attendance Failed",
//         description: err?.response?.data?.msg || "Invalid request",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });

//       return false; // ❌ FAILURE
//     }
//   };

//   return (
//     <Box w="100%">
//       <Flex
//         direction={{ base: "column", md: "row" }}
//         align="stretch"
//         gap={3}
//         px={0}
//       >
//         {/* LEFT: Logo card (separate entity) */}
//         <Box
//           // ml={{ base: 0, md: 4 }}
//           ml={isMobile ? '1.9vw' : 3}
//           mt={{ base: 4, md: 3 }}
//           h={{ base: "56px", md: "70px" }}
//           // w={{ base: "100%", md: "21.4%" }}
//           w={
//             isMobile
//               ? "96%"
//               : isTablet
//                 ? "97%"
//                 : isDesktop
//                   ? "25%"
//                   : "22.4%"
//           }

//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           px={4}
//           bg={navBg}
//           boxShadow="sm"
//           borderRadius={"14px"}
//           border={"1px solid #cccccc"}
//         >
//           <Image
//             src={nav_logo}
//             alt="Logo"
//             maxH={{ base: "40px", md: "48px" }}
//             objectFit="contain"
//             w="100%"
//           />
//         </Box>

//         {/* RIGHT: Main navbar card */}
//         <Flex
//           flex="1"
//           mt={{ base: 0, md: 3 }}
//           mr={3}
//           h={{ base: "auto", md: "70px" }}
//           align="center"
//           // bg="white"
//           bg={navBg}
//           boxShadow="sm"
//           borderRadius={"14px"}
//           px={{ base: 0, md: 4 }}
//           py={{ base: 3, md: 0 }}
//           border={"1px solid #cccccc"}
//           w={
//             isMobile
//               ? "96%"
//               : isTablet
//                 ? "97%"
//                 : isDesktop
//                   ? "100%"
//                   : "21.4%"
//           }
//           ml={

//             isMobile
//               ? '1.9vw'
//               : isTablet
//                 ? 2
//                 : isDesktop
//                   ? 0
//                   : 0
//           }
//         >
//           <Flex w="100%" align="center" gap={6} pr={3} >
//             <Flex align="center" gap={2} flexShrink={0}>
//               <IconButton
//                 display={{ base: "inline-flex", md: "none" }}
//                 aria-label="open menu"
//                 icon={<HamburgerIcon />}
//                 variant="ghost"
//                 onClick={() => setMobileOpen && setMobileOpen(true)}
//               />
//               <Text
//                 fontSize={{ base: "sm", md: "xl" }}
//                 fontFamily="'Poppins', sans-serif"
//               >
//                 <Box
//                   as="span"
//                   color="#757575"
//                   fontFamily="'Poppins', sans-serif"
//                   fontWeight={400}
//                   letterSpacing={'-0.3px'}
//                 >
//                   Welcome,
//                 </Box>{" "}
//                 <Box
//                   as="span"
//                   fontWeight="600"
//                   letterSpacing={'-0.3px'}
//                   // color="#000000"
//                   color={textClr}
//                   fontFamily="'Poppins', sans-serif"
//                 >
//                   {/* {firstName} */}
//                   {userProfile?.first_name}
//                 </Box>
//               </Text>
//             </Flex>

//             {/* Right side: bell + avatar + name */}
//             <Flex
//               align="center"
//               gap={4}
//               flexShrink={0}
//               ml="auto"
//               justify="flex-end"
//               minW="0"
//             >
//               <Box
//                 flex="1"
//                 maxW="520px"
//                 minW={{
//                   base: "auto",
//                   xl:"350px",
//                 }
//                 }
//                 display={{ base: "none", md: "block" }}
//               // mx={4}
//               >
//                 <InputGroup>
//                   <InputLeftElement pointerEvents="none">
//                     <Image src={searchIcon} alt="search" boxSize="16px" color={'#757575'} />
//                   </InputLeftElement>
//                   <Input
//                     placeholder="Search"
//                     borderRadius={8}
//                     fontSize="sm"
//                     _placeholder={{
//                       color: "gray.400",
//                       fontFamily: "'Poppins', sans-serif",
//                     }}
//                   />
//                 </InputGroup>
//               </Box>
//               {!user?.is_admin && user?.punch_status === 1 && settingsData?.allow_web_checkin && (
//                 <>
//                   <Tag
//                     cursor="pointer"
//                     onClick={handleCheckToggle}
//                     bg="#FFF"
//                     color={isCheckedIn ? "#EE5D50" : "#43aa41ff"}
//                     borderRadius="8px"
//                     fontWeight="600"
//                     borderWidth="1px"
//                     h={10}
//                     w={120}
//                     justifyContent="center"
//                     borderColor={isCheckedIn ? "#EE5D50" : "#4e9d49ff"}
//                     fontFamily={'Poppins'}
//                   >
//                     {/* {isCheckedIn
//                       ? `${formatTime(seconds)}  Check Out`
//                       : `${seconds > 0 ? formatTime(seconds) + "  " : ""
//                       }Check In`} */}
//                     {isCheckedIn ? "Check Out" : "Check In"}
//                   </Tag>
//                   {/* {isCheckedIn && ( */}
//                   {seconds !== 0 && (
//                     <Tag
//                       bg="#F6F6F6"
//                       color="#000"
//                       borderRadius="8px"
//                       fontWeight="600"
//                       borderWidth="1px"
//                       h={10}
//                       w={120}
//                       justifyContent="center"
//                       borderColor="#CACACA"
//                     >
//                       {formatTime(seconds)}
//                     </Tag>
//                   )}
//                 </>
//               )}

//               {/* Bell with red dot */}
//               {/* <Box position="relative">
//                 <IconButton
//                   aria-label="notifications"
//                   icon={<Image src={bellIcon} alt="bell" boxSize="20px" />}
//                   bg="white"
//                   borderRadius={7}
//                   boxShadow="sm"
//                   size="md"
//                   p={2}
//                   border={"1px solid #cccccc"}
//                 />
//                 <Badge
//                   position="absolute"
//                   top="-4px"
//                   right="-4px"
//                   borderRadius="full"
//                   boxSize="12px"
//                   bg="red.500"
//                   p={0}
//                 />
//               </Box> */}
//               <NotificationsDropdown />

//               {/* Avatar + name */}
//               <Flex
//                 gap={3}
//                 // bg="white"
//                 bg={navBg}
//                 // p={1}
//                 borderRadius={10}
//                 justify={"flex-end"}
//                 px={0}
//                 py={1}
//                 flexShrink={0}
//               >
//                 <Menu>
//                   <MenuButton
//                     as={Button}
//                     variant="ghost"
//                     bg="transparent"
//                     p={0}
//                     px={0}
//                     minW={0}
//                     height="auto"
//                     _hover={{ bg: "transparent" }}
//                     _active={{ bg: "transparent" }}
//                     _focusVisible={{ boxShadow: "none" }}
//                   >
//                     <Image
//                       src={avatar_img}
//                       alt="avatar"
//                       boxSize={{ base: "32px", md: "40px" }}
//                       objectFit="cover"
//                       flexShrink={0}
//                     />
//                   </MenuButton>

//                   <MenuList
//                     borderRadius="12px"
//                     boxShadow="xl"
//                     minW="200px"
//                     p={0}
//                     overflow="hidden"
//                   >
//                     <Box
//                       px={4}
//                       py={3}
//                       borderBottom="1px solid"
//                       borderColor="gray.100"
//                     >
//                       <Text
//                         fontSize="sm"
//                         fontWeight="600"
//                         fontFamily="'Poppins', sans-serif"
//                         color="gray.800"
//                         whiteSpace="nowrap"
//                       >
//                         {fullName}
//                       </Text>
//                     </Box>

//                     <MenuItem
//                       onClick={onProfileOpen}
//                       fontFamily="Poppins"
//                       fontSize="sm"
//                       py={2.5}
//                       _hover={{ bg: "gray.50" }}
//                     >
//                       Profile
//                     </MenuItem>

//                     <MenuItem
//                       onClick={onLogoutOpen}
//                       fontFamily="Poppins"
//                       fontSize="sm"
//                       py={2.5}
//                       color="red.500"
//                       _hover={{ bg: "red.50" }}
//                     >
//                       Logout
//                     </MenuItem>
//                   </MenuList>
//                 </Menu>
//               </Flex>
//             </Flex>
//           </Flex>
//         </Flex>
//       </Flex>
//       <ProfileSettingsModal isOpen={isProfileOpen} onClose={onProfileClose} />
//       <AlertDialog
//         isOpen={isLogoutOpen}
//         leastDestructiveRef={cancelRef}
//         onClose={onLogoutClose}
//         isCentered
//       >
//         <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(2px)">
//           <AlertDialogContent
//             borderRadius="md"
//             boxShadow="lg"
//             border="1px solid"
//             borderColor="gray.200"
//             bg="white"
//           >
//             <AlertDialogHeader
//               fontSize="lg"
//               fontWeight="600"
//               // borderBottom="1px solid"
//               borderColor="gray.100"
//               fontFamily={"Poppins"}
//             >
//               Confirm Logout
//             </AlertDialogHeader>

//             <AlertDialogBody
//               fontSize="sm"
//               color="gray.700"
//               py={4}
//               fontFamily={"Poppins"}
//             >
//               Are you sure you want to log out?
//             </AlertDialogBody>

//             <AlertDialogFooter gap={3} borderColor="gray.100">
//               <Button
//                 ref={cancelRef}
//                 onClick={onLogoutClose}
//                 border={"1px solid #cccccc"}
//                 variant="outline"
//                 size="sm"
//                 fontFamily={"Poppins"}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 // colorScheme="red"
//                 _hover={{ bg: "blue.800", color: "white" }}
//                 border={"1px solid #cccccc"}
//                 bg={"white"}
//                 onClick={handleConfirmLogout}
//                 size="sm"
//                 fontFamily={"Poppins"}
//               >
//                 Logout
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//     </Box>
//   );
// }
