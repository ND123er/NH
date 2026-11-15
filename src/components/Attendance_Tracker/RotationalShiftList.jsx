import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import ShiftTab from "./ShiftTab";
const ROTATIONAL_PATTERN_STORAGE_KEY = "attendance_rotational_shift_patterns";

const STATIC_ROTATIONAL_PATTERNS = [
  {
    id: "static-3-shift-weekly",
    patternName: "3 Shift Weekly Rotation",
    startDate: "2026-09-01",
    endDate: "",
    shiftType: "Morning Shift",
    repeatCycle: true,
    isStatic: true,
  },
  {
    id: "static-2-shift-weekly",
    patternName: "2 Shift Weekly Rotation",
    startDate: "2026-09-01",
    endDate: "",
    shiftType: "Evening Shift",
    repeatCycle: true,
    isStatic: true,
  },
  {
    id: "static-day-off-rotation",
    patternName: "Shift With Weekly Day Off",
    startDate: "2026-09-01",
    endDate: "",
    shiftType: "Day Off",
    repeatCycle: true,
    isStatic: true,
  },
];

const dateToKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const formatDate = (value) => {
  if (!value) return "No end date";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStoredPatterns = () => {
  try {
    const stored = localStorage.getItem(ROTATIONAL_PATTERN_STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getPatternWeeks = (pattern) => {
  const assignments = pattern.calendarAssignments || pattern.calendar_assignments || {};
  const assignmentKeys = Object.keys(assignments)
    .filter((key) => assignments[key] && assignments[key] !== "auto")
    .sort();

  if (!assignmentKeys.length) return [];

  const firstDate = pattern.startDate
    ? new Date(`${pattern.startDate}T00:00:00`)
    : new Date(`${assignmentKeys[0]}T00:00:00`);

  const lastDate = pattern.endDate
    ? new Date(`${pattern.endDate}T00:00:00`)
    : new Date(`${assignmentKeys[assignmentKeys.length - 1]}T00:00:00`);

  const firstMonday = new Date(firstDate);
  const day = firstMonday.getDay();
  firstMonday.setDate(
    firstMonday.getDate() + (day === 0 ? -6 : 1 - day),
  );

  const weeks = [];
  let weekStart = new Date(firstMonday);

  while (weekStart <= lastDate || weeks.length === 0) {
    const week = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);

      week.push({
        date,
        key: dateToKey(date),
        shiftId: assignments[dateToKey(date)] || null,
        inRange: date >= firstDate && date <= lastDate,
      });
    }

    weeks.push(week);
    weekStart.setDate(weekStart.getDate() + 7);

    if (weeks.length >= 52) break;
  }

  return weeks;
};

const getPatternShifts = (pattern) => {
  return pattern.shifts || pattern.shiftTypes || [];
};

const getShift = (pattern, shiftId) => {
  return getPatternShifts(pattern).find((shift) => shift.id === shiftId);
};

const getWeekNumberLabel = (index, total) => {
  return total > 1 ? `Week ${index + 1} of ${total}` : "1 Week";
};

const PatternWeekTimeline = ({ pattern, selectedWeek, onWeekChange }) => {
  const weeks = useMemo(() => getPatternWeeks(pattern), [pattern]);
  const week = weeks[selectedWeek] || weeks[0] || [];

  if (!weeks.length) {
    return (
      <Box
        border="1px dashed #D0D5DD"
        borderRadius="10px"
        p={4}
        bg="#F8FAFC"
      >
        <Text fontSize="10px" color="#667085" textAlign="center">
          Calendar assignments will appear here after the pattern is saved.
        </Text>
      </Box>
    );
  }

  const shifts = getPatternShifts(pattern);

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        mb={3}
        gap={3}
        flexWrap="wrap"
      >
        <Text fontSize="11px" fontWeight="700" color="#344054">
          {getWeekNumberLabel(selectedWeek, weeks.length)}
        </Text>

        <HStack spacing={1}>
          <Button
            size="xs"
            variant="outline"
            isDisabled={selectedWeek === 0}
            onClick={(event) => {
              event.stopPropagation();
              onWeekChange(Math.max(0, selectedWeek - 1));
            }}
          >
            Previous
          </Button>

          <Button
            size="xs"
            variant="outline"
            isDisabled={selectedWeek === weeks.length - 1}
            onClick={(event) => {
              event.stopPropagation();
              onWeekChange(
                Math.min(weeks.length - 1, selectedWeek + 1),
              );
            }}
          >
            Next
          </Button>
        </HStack>
      </Flex>

      {weeks.length > 1 && (
        <HStack
          spacing={1}
          mb={3}
          overflowX="auto"
          pb={1}
          onClick={(event) => event.stopPropagation()}
        >
          {weeks.map((_, index) => (
            <Button
              key={index}
              size="xs"
              minW="60px"
              variant={selectedWeek === index ? "solid" : "outline"}
              bg={selectedWeek === index ? "#1F3661" : "white"}
              color={selectedWeek === index ? "white" : "#667085"}
              borderColor="#D0D5DD"
              onClick={() => onWeekChange(index)}
            >
              Week {index + 1}
            </Button>
          ))}
        </HStack>
      )}

      <Box
        border="1px solid #E4E7EC"
        borderRadius="10px"
        overflow="hidden"
        bg="white"
      >
        <Flex
          bg="#F8FAFC"
          borderBottom="1px solid #E4E7EC"
        >
          {week.map((item) => (
            <Box
              key={`header-${item.key}`}
              flex="1"
              minW="58px"
              py={2}
              textAlign="center"
              borderRight="1px solid #E4E7EC"
              _last={{ borderRight: "none" }}
            >
              <Text fontSize="8px" fontWeight="700" color="#667085">
                {item.date.toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </Text>
              <Text fontSize="10px" fontWeight="700" color="#344054">
                {item.date.getDate()}
              </Text>
            </Box>
          ))}
        </Flex>

        <Flex minH="44px">
          {week.map((item) => {
            const shift = item.shiftId
              ? getShift(pattern, item.shiftId)
              : null;

            const isAuto = item.shiftId === "auto";
            const isOff =
              shift?.id === "off" ||
              shift?.name?.toLowerCase() === "day off";

            return (
              <Box
                key={item.key}
                flex="1"
                minW="58px"
                h="44px"
                bg={
                  !item.inRange
                    ? "#FBFCFD"
                    : isAuto
                      ? "#F2F4F7"
                      : shift?.bg || "#EDF2F7"
                }
                borderRight="1px solid rgba(255,255,255,.8)"
                _last={{ borderRight: "none" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                title={
                  !item.inRange
                    ? ""
                    : shift?.name || (isAuto ? "Auto" : "Unassigned")
                }
              >
                {item.inRange && (
                  <Text
                    fontSize="9px"
                    fontWeight="700"
                    color={
                      isOff
                        ? shift?.color || "#667085"
                        : shift?.color || "#344054"
                    }
                  >
                    {shift?.code || (isAuto ? "A" : "-")}
                  </Text>
                )}
              </Box>
            );
          })}
        </Flex>
      </Box>

      {shifts.length > 0 && (
        <HStack
          mt={3}
          spacing={3}
          flexWrap="wrap"
          onClick={(event) => event.stopPropagation()}
        >
          {shifts.map((shift) => (
            <HStack key={shift.id} spacing={1}>
              <Box
                w="9px"
                h="9px"
                borderRadius="2px"
                bg={shift.bg || "#EDF2F7"}
                border="1px solid"
                borderColor={shift.border || "#D0D5DD"}
              />
              <Text fontSize="9px" color="#667085">
                {shift.name}
              </Text>
            </HStack>
          ))}
        </HStack>
      )}
    </Box>
  );
};

const RotationalShiftPatternList = () => {
  const navigate = useNavigate();
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [selectedPatternId, setSelectedPatternId] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState({});

  useEffect(() => {
    setSavedPatterns(getStoredPatterns());
  }, []);

  const patterns = useMemo(
    () => [...STATIC_ROTATIONAL_PATTERNS, ...savedPatterns],
    [savedPatterns],
  );

  useEffect(() => {
    if (
      patterns.length &&
      !patterns.some((pattern) => pattern.id === selectedPatternId)
    ) {
      setSelectedPatternId(patterns[0].id);
    }
  }, [patterns, selectedPatternId]);

  const handleCreatePattern = () => {
    navigate(
      "/settings/AttendanceTrackerSetting/shiftSetting/patterns",
    );
  };

  const handleSelectPattern = (pattern) => {
    setSelectedPatternId(pattern.id);
  };

  const handleWeekChange = (patternId, weekIndex) => {
    setSelectedWeeks((previous) => ({
      ...previous,
      [patternId]: weekIndex,
    }));
  };

  return (
    <Box bg="white" borderRadius="14px" boxShadow="sm" overflow="hidden" minH="78vh">
    <ShiftTab />
    <Box
      minH="100vh"
      bg="#F7F9FC"
      p={{ base: 4, md: 7 }}
      fontFamily="'Poppins', sans-serif"
      color="#1D2939"
    >
      <Box
        bg="white"
        border="1px solid #E4E7EC"
        borderRadius="16px"
        overflow="hidden"
        boxShadow="0 1px 3px rgba(16,24,40,.04)"
      >
        <Flex
          px={{ base: 5, md: 7 }}
          py={5}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          flexWrap="wrap"
          borderBottom="1px solid #E4E7EC"
        >
          <Box>
            <Text fontSize="18px" fontWeight="700" color="#101828">
              Rotational Shift Patterns
            </Text>
            <Text mt={1} fontSize="12px" color="#667085">
              Select a rotational pattern or create a custom pattern.
            </Text>
          </Box>

          <Button
            leftIcon={<AddIcon />}
            bg="#1F3661"
            color="white"
            _hover={{ bg: "#162843" }}
            onClick={handleCreatePattern}
          >
            Create New Pattern
          </Button>
        </Flex>

        <Box p={{ base: 5, md: 7 }}>
          <VStack spacing={4} align="stretch">
            {patterns.map((pattern) => {
              const selected = selectedPatternId === pattern.id;
              const weeks = getPatternWeeks(pattern);
              const weekIndex = Math.min(
                selectedWeeks[pattern.id] || 0,
                Math.max(weeks.length - 1, 0),
              );

              return (
                <Box
                  key={pattern.id}
                  border="1px solid"
                  borderColor={selected ? "#1F3661" : "#E4E7EC"}
                  borderRadius="12px"
                  bg="white"
                  cursor="pointer"
                  boxShadow={
                    selected
                      ? "0 0 0 1px #1F3661, 0 6px 22px rgba(31,54,97,.09)"
                      : "0 1px 2px rgba(16,24,40,.03)"
                  }
                  onClick={() => handleSelectPattern(pattern)}
                  transition="all .15s ease"
                  _hover={{
                    borderColor: "#1F3661",
                    boxShadow: "0 6px 20px rgba(16,24,40,.08)",
                  }}
                  overflow="hidden"
                >
                  <Flex
                    px={{ base: 4, md: 5 }}
                    py={4}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    flexWrap="wrap"
                    borderBottom="1px solid #EAECF0"
                  >
                    <Box flex="1" minW="220px">
                      <HStack spacing={2}>
                        {selected && (
                          <Box
                            w="7px"
                            h="7px"
                            borderRadius="full"
                            bg="#1F3661"
                          />
                        )}

                        <Text
                          fontSize="14px"
                          fontWeight="700"
                          color="#101828"
                        >
                          {String(pattern.patternName || "Untitled Shift Pattern")}
                        </Text>

                        <Badge
                          borderRadius="full"
                          px={2}
                          colorScheme={pattern.isStatic ? "blue" : "purple"}
                        >
                          {pattern.isStatic ? "Default" : "Custom"}
                        </Badge>
                      </HStack>

                      <HStack
                        mt={1}
                        spacing={3}
                        flexWrap="wrap"
                      >
                        <Text fontSize="10px" color="#667085">
                          {formatDate(pattern.startDate)}
                          {pattern.endDate
                            ? ` - ${formatDate(pattern.endDate)}`
                            : " - No end date"}
                        </Text>

                        <Text fontSize="10px" color="#98A2B3">
                          {weeks.length || 1}{" "}
                          {weeks.length === 1 ? "week" : "weeks"}
                        </Text>

                        {pattern.repeatCycle && (
                          <Text fontSize="10px" color="#38A169">
                            Repeat cycle
                          </Text>
                        )}
                      </HStack>
                    </Box>

                    <Button
                      size="sm"
                      variant={selected ? "solid" : "outline"}
                      bg={selected ? "#1F3661" : "white"}
                      color={selected ? "white" : "#1F3661"}
                      borderColor="#1F3661"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectPattern(pattern);
                      }}
                    >
                      {selected ? "Selected" : "Select Pattern"}
                    </Button>
                  </Flex>

                  <Box px={{ base: 4, md: 5 }} py={4}>
                    <PatternWeekTimeline
                      pattern={pattern}
                      selectedWeek={weekIndex}
                      onWeekChange={(index) =>
                        handleWeekChange(pattern.id, index)
                      }
                    />
                  </Box>
                </Box>
              );
            })}
          </VStack>

          {!patterns.length && (
            <VStack py={12} spacing={2}>
              <Text fontSize="14px" fontWeight="600">
                No rotational patterns yet
              </Text>
              <Text fontSize="11px" color="#667085">
                Create a new pattern to add it to this list.
              </Text>
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
    </Box>
  );
};

export { ROTATIONAL_PATTERN_STORAGE_KEY };

export default RotationalShiftPatternList;
