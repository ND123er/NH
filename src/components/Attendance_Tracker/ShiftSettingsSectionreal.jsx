import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { ViewIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import ShiftTab from "./ShiftTab";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import api from "../../api/axios";

const ShiftSettingsSection = ({ title }) => {
  const [cycleLength, setCycleLength] = useState();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [cycleDays, setCycleDays] = useState([]);

  // Added only for saved patterns/calendar
  const [patterns, setPatterns] = useState([]);
  const [patternLoading, setPatternLoading] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isPatternCalendarOpen, setIsPatternCalendarOpen] = useState(false);
  const [patternCalendarMonth, setPatternCalendarMonth] = useState(
    new Date(2026, 8, 1),
  );

  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  // Fetch shifts when component loads
  useEffect(() => {
    fetchShiftList();
    fetchPatterns();
  }, []);

  // Same API implementation as AttendanceTrackerSetting
  const fetchShiftList = async () => {
    try {
      setLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const url = `/settings/get_company_shift_list?org_id=${orgId}`;

      const res = await api.get(url);

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

  // Fetch saved shift patterns
  const fetchPatterns = async () => {
    try {
      setPatternLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(
        `/schedules/patterns?organisation_id=${encodeURIComponent(
          orgId || "",
        )}`,
      );

      setPatterns(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);

      toast({
        title: "Failed to fetch patterns",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPatternLoading(false);
    }
  };

  const savePattern = async () => {
    try {
      const orgId = getOrgIdFromReduxOrStorage(user);

      const payload = {
        organisation_id: orgId,
        name: patternName,
        days: cycleDays.map((day) => day.shiftId),
      };

      console.log("Pattern payload:", payload);

      await api.post("/schedules/patterns", payload);

      toast({
        title: "Pattern saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh saved patterns after save
      await fetchPatterns();
    } catch (error) {
      console.error("Error saving pattern:", error);

      toast({
        title: "Failed to save pattern",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open calendar for selected pattern
  const openPatternCalendar = (pattern) => {
    setSelectedPattern(pattern);
    setPatternCalendarMonth(new Date(2026, 8, 1));
    setIsPatternCalendarOpen(true);
  };

  // Get the pattern shift for a particular calendar date.
  // The first calendar date represents cycle day 1,
  // then the response days repeat according to their order.
  const getPatternShiftForDate = (date) => {
    if (!selectedPattern?.days?.length) {
      return null;
    }

    const patternDays = selectedPattern.days;

    const referenceDate = new Date(2026, 8, 1);
    referenceDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    const difference = Math.floor(
      (currentDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const cycleIndex =
      ((difference % patternDays.length) + patternDays.length) %
      patternDays.length;

    return patternDays[cycleIndex];
  };

  // Calendar cells
  const getPatternCalendarDays = () => {
    const year = patternCalendarMonth.getFullYear();
    const month = patternCalendarMonth.getMonth();

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

  const calendarDays = getPatternCalendarDays();

  const monthName = patternCalendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      bg="#ffffff"
      borderRadius="12px"
      boxShadow="0 2px 12px rgba(15, 23, 42, 0.06)"
      overflow="hidden"
      minH="100vh"
      pt="16px"
      mt="10px"
    >
      {/* Existing tabs */}
      <ShiftTab />
      <Box
        border="1px solid"
        borderColor="#E2E8F0"
        borderRadius="10px"
        h="100%"
        p={{ base: 5, md: 6 }}
        bg="#fff"
        fontFamily="Poppins"
      >
        <Box mb={5}>
          <Heading
            fontSize="18px"
            fontWeight="600"
            fontFamily="poppins"
            color="#1F2937"
          >
            Add pattern
          </Heading>
        </Box>
        {/* Pattern Name */}

        <FormControl mb={5}>
          <FormLabel fontSize="13px" fontWeight="600" color="#122B55" mb={1}>
            Pattern name
          </FormLabel>

          <Input
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            placeholder="Enter pattern name"
            h="40px"
            borderColor="#CBD5E1"
            borderRadius="7px"
            fontSize="13px"
          />
        </FormControl>

        {/* Cycle Length */}
        <FormControl mb={5}>
          <FormLabel fontSize="13px" fontWeight="600" color="#122B55" mb={1}>
            Cycle length
          </FormLabel>

          <Input
            type="number"
            min={1}
            max={366}
            value={cycleLength}
            placeholder="Enter cycle length"
            height="40px"
            fontSize="13px"
            borderColor="#CBD5E1"
            borderRadius="6px"
            onChange={(e) => {
              const value = Number(e.target.value);

              if (value > 366) {
                setCycleLength(366);
              } else {
                setCycleLength(value);
              }
            }}
          />

          <Text mt={1} fontSize="11px" color="#718096">
            Enter cycle length in days (maximum 366 days).
          </Text>
        </FormControl>

        {/* Cycle Table */}
        <Box
          border="1px solid #E2E8F0"
          borderRadius="6px"
          overflow="hidden"
          height="auto"
          minH="360px"
        >
          {/* Header */}
          <Grid
            templateColumns="155px 215px 1fr"
            bg="#F8FAFC"
            borderBottom="1px solid #E2E8F0"
          >
            <Box p={2} fontSize="12px" fontWeight="500" color="#122B55">
              Cycle day
            </Box>

            <Box p={2} fontSize="12px" fontWeight="500" color="#122B55">
              Shift
            </Box>

            <Box p={2} fontSize="12px" fontWeight="500" color="#122B55">
              Hours
            </Box>
          </Grid>

          {/* Scrollable rows */}
          <Box height="250px" overflowY="auto">
            {Array.from({ length: cycleLength || 0 }, (_, index) => {
              const day = index + 1;

              return (
                <Grid
                  key={day}
                  templateColumns="155px 215px 1fr"
                  borderBottom="1px solid #E2E8F0"
                  minH="44px"
                >
                  {/* Cycle Day */}
                  <Box p={2.1} fontSize="12px" color="#334155">
                    Day {day}
                  </Box>

                  {/* Shift */}
                  <Box p={1.2}>
                    <Select
                      size="sm"
                      value={cycleDays[index]?.shiftId || ""}
                      placeholder={
                        loading ? "Loading shifts..." : "Select shift"
                      }
                      bg="#E0F0FF"
                      color="#1769E0"
                      border="none"
                      borderRadius="5px"
                      fontSize="12px"
                      onChange={(e) => {
                        const updatedDays = [...cycleDays];

                        updatedDays[index] = {
                          shiftId:
                            e.target.value === "OFF_DAY"
                              ? null
                              : e.target.value,
                        };

                        setCycleDays(updatedDays);
                      }}
                    >
                      {shifts.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.shift_name}
                        </option>
                      ))}

                      <option value="OFF_DAY">Off day</option>
                    </Select>
                  </Box>

                  {/* Hours */}
                  {/* <Box p={2.1} fontSize="12px" color="#334155">
                    09:00–17:00
                  </Box> */}
                  {/* Hours */}
                  <Box p={2.1} fontSize="12px" color="#334155">
                    {(() => {
                      const selectedShift = shifts.find(
                        (shift) => shift._id === cycleDays[index]?.shiftId,
                      );

                      return selectedShift?.start && selectedShift?.end
                        ? `${selectedShift.start} – ${selectedShift.end}`
                        : "";
                    })()}
                  </Box>
                </Grid>
              );
            })}
          </Box>
        </Box>

        {/* Summary */}
        {/* <Box mt={4} p={3} bg="#F5F8FC" borderRadius="6px">
          <Text fontSize="12px" fontWeight="600" color="#334155">
            7-day cycle · 5 working days · 2 rest days
          </Text>

          <Text mt={1} fontSize="11px" color="#718096">
            The cycle repeats for the assignment duration.
          </Text>
        </Box> */}

        {/* Buttons */}
        <Flex justify="flex-end" gap={3} mt={6} mb={5}>
          <Button
            variant="outline"
            height="38px"
            px={5}
            borderColor="#CBD5E1"
            fontSize="12px"
            fontWeight="400"
          >
            Cancel
          </Button>

          <Button
            height="38px"
            px={5}
            bg="#274167"
            color="#fff"
            fontSize="12px"
            fontWeight="400"
            _hover={{
              bg: "#1769E0",
            }}
            onClick={savePattern}
          >
            Save pattern
          </Button>
        </Flex>
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
        {/* =====================================================
            SAVED PATTERNS
            Added below Save pattern button
        ====================================================== */}
        <Box mt={7}>
          {/* <Text fontSize="13px" fontWeight="600" color="#122B55" mb={3}>
            Saved patterns
          </Text> */}
          <Heading
            fontSize="18px"
            fontWeight="600"
            fontFamily="poppins"
            color="#1F2937"
            mb={5}
          >
            Shift Pattern List
          </Heading>

          <Box border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
            {/* Table Header */}
            <Grid
              templateColumns="1fr 80px"
              bg="#F8FAFC"
              borderBottom="1px solid #E2E8F0"
            >
              <Box p={3} fontSize="12px" fontWeight="600" color="#122B55">
                Pattern name
              </Box>

              <Box
                p={3}
                textAlign="center"
                fontSize="12px"
                fontWeight="600"
                color="#122B55"
              >
                View
              </Box>
            </Grid>

            {/* Loading */}
            {patternLoading ? (
              <Box p={4}>
                <Text fontSize="12px" color="#718096">
                  Loading patterns...
                </Text>
              </Box>
            ) : patterns.length === 0 ? (
              /* Empty */
              <Box p={4}>
                <Text fontSize="12px" color="#718096">
                  No saved patterns found.
                </Text>
              </Box>
            ) : (
              /* Pattern Rows */
              patterns.map((pattern) => (
                <Grid
                  key={pattern._id}
                  templateColumns="1fr 80px"
                  borderBottom="1px solid #E2E8F0"
                  minH="44px"
                  alignItems="center"
                >
                  {/* Pattern Name */}
                  <Box px={3}>
                    <Text fontSize="12px" fontWeight="500" color="#334155">
                      {pattern.name}
                    </Text>
                  </Box>

                  {/* Eye Button */}
                  <Flex justify="center">
                    <IconButton
                      aria-label={`View ${pattern.name}`}
                      icon={<ViewIcon />}
                      size="sm"
                      variant="ghost"
                      color="#274167"
                      onClick={() => openPatternCalendar(pattern)}
                    />
                  </Flex>
                </Grid>
              ))
            )}
          </Box>
        </Box>
      </Box>
      {/* =====================================================
          PATTERN CALENDAR MODAL
      ====================================================== */}
      {/* <Modal
        isOpen={isPatternCalendarOpen}
        onClose={() => setIsPatternCalendarOpen(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay />

        <ModalContent fontFamily="Poppins">
          <ModalHeader
            fontSize="16px"
            fontWeight="600"
            color="#122B55"
          >
            {selectedPattern?.name || "Pattern"}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6}>
            <Flex
              align="center"
              justify="space-between"
              mb={4}
            >
              <IconButton
                aria-label="Previous month"
                icon={<ChevronLeftIcon />}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPatternCalendarMonth(
                    new Date(
                      patternCalendarMonth.getFullYear(),
                      patternCalendarMonth.getMonth() - 1,
                      1
                    )
                  );
                }}
              />

              <Text
                fontSize="14px"
                fontWeight="600"
                color="#122B55"
              >
                {monthName}
              </Text>

              <IconButton
                aria-label="Next month"
                icon={<ChevronRightIcon />}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPatternCalendarMonth(
                    new Date(
                      patternCalendarMonth.getFullYear(),
                      patternCalendarMonth.getMonth() + 1,
                      1
                    )
                  );
                }}
              />
            </Flex>

            <Grid
              templateColumns="repeat(7, 1fr)"
              borderTop="1px solid #E2E8F0"
              borderLeft="1px solid #E2E8F0"
            >
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <Box
                  key={day}
                  p={2}
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
              ))}
            </Grid>

            <Grid
              templateColumns="repeat(7, 1fr)"
              borderLeft="1px solid #E2E8F0"
               minW="0"
            >
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <Box
                      key={`empty-${index}`}
                      minH="95px"
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      bg="#FAFAFA"
                       minW="0"
                    />
                  );
                }

                const patternDay =
                  getPatternShiftForDate(date);

                return (
                  <Box
                    key={date.toISOString()}
                    minH="95px"
                    p={2}
                    borderRight="1px solid #E2E8F0"
                    borderBottom="1px solid #E2E8F0"
                    bg="#fff"
                  >
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="#122B55"
                      mb={2}
                    >
                      {date.getDate()}
                    </Text>

                    {patternDay ? (
                      <Box
                        bg="#E0F0FF"
                        borderRadius="5px"
                        p={2}
                      >
                        <Text
                          fontSize="10px"
                          fontWeight="600"
                          color="#1769E0"
                          noOfLines={2}
                        >
                          {patternDay.shift_name}
                        </Text>

                        <Text
                          mt={1}
                          fontSize="9px"
                          color="#475569"
                        >
                          {patternDay.start} –{" "}
                          {patternDay.end}
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        bg="#F1F5F9"
                        borderRadius="5px"
                        p={2}
                      >
                        <Text
                          fontSize="10px"
                          fontWeight="500"
                          color="#64748B"
                        >
                          Off day
                        </Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal> */}
      ```jsx
      {/* =====================================================
    PATTERN CALENDAR MODAL
====================================================== */}
      <Modal
        isOpen={isPatternCalendarOpen}
        onClose={() => setIsPatternCalendarOpen(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay />

        <ModalContent
          fontFamily="Poppins"
          maxW="900px"
          w="calc(100% - 32px)"
          maxH="90vh"
          overflow="hidden"
        >
          <ModalHeader fontSize="16px" fontWeight="600" color="#122B55">
            {selectedPattern?.name || "Pattern"}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6} overflowY="auto" overflowX="hidden">
            {/* Month Navigation */}
            <Flex align="center" justify="space-between" mb={4}>
              <IconButton
                aria-label="Previous month"
                icon={<ChevronLeftIcon />}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPatternCalendarMonth(
                    new Date(
                      patternCalendarMonth.getFullYear(),
                      patternCalendarMonth.getMonth() - 1,
                      1,
                    ),
                  );
                }}
              />

              <Text fontSize="14px" fontWeight="600" color="#122B55">
                {monthName}
              </Text>

              <IconButton
                aria-label="Next month"
                icon={<ChevronRightIcon />}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPatternCalendarMonth(
                    new Date(
                      patternCalendarMonth.getFullYear(),
                      patternCalendarMonth.getMonth() + 1,
                      1,
                    ),
                  );
                }}
              />
            </Flex>

            {/* Week Header */}
            <Grid
              templateColumns="repeat(7, minmax(0, 1fr))"
              borderTop="1px solid #E2E8F0"
              borderLeft="1px solid #E2E8F0"
              minW="0"
              w="100%"
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Box
                  key={day}
                  p={2}
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
              ))}
            </Grid>

            {/* Calendar */}
            <Grid
              templateColumns="repeat(7, minmax(0, 1fr))"
              borderLeft="1px solid #E2E8F0"
              minW="0"
              w="100%"
            >
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <Box
                      key={`empty-${index}`}
                      minH="95px"
                      minW="0"
                      maxW="100%"
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      bg="#FAFAFA"
                    />
                  );
                }

                const patternDay = getPatternShiftForDate(date);

                return (
                  <Box
                    key={date.toISOString()}
                    minH="95px"
                    minW="0"
                    maxW="100%"
                    p={2}
                    borderRight="1px solid #E2E8F0"
                    borderBottom="1px solid #E2E8F0"
                    bg="#fff"
                    overflow="hidden"
                  >
                    {/* Date */}
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="#122B55"
                      mb={2}
                    >
                      {date.getDate()}
                    </Text>

                    {/* Shift */}
                    {patternDay ? (
                      <Box
                        bg="#E0F0FF"
                        borderRadius="5px"
                        p={2}
                        minW="0"
                        maxW="100%"
                        overflow="hidden"
                      >
                        <Text
                          fontSize="10px"
                          fontWeight="600"
                          color="#1769E0"
                          noOfLines={2}
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {patternDay.shift_name}
                        </Text>

                        <Text
                          mt={1}
                          fontSize="9px"
                          color="#475569"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {patternDay.start} – {patternDay.end}
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        bg="#F1F5F9"
                        borderRadius="5px"
                        p={2}
                        minW="0"
                        maxW="100%"
                      >
                        <Text fontSize="10px" fontWeight="500" color="#64748B">
                          Off day
                        </Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ShiftSettingsSection;
