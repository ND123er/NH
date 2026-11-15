import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../api/axios";
import { Box, SimpleGrid, Text, Button, Flex } from "@chakra-ui/react";
import Attendance from "../../../assets/Attendance.svg";
import leave_balance from "../../../assets/leave_balance.svg";
import next_payday from "../../../assets/next_payday.svg";

export default function EmployeeQuickCards() {
  const [checkedIn, setCheckedIn] = useState(true); // dummy
  const [leaveBalance] = useState(12); // dummy
  const [nextPayDays] = useState(5); // dummy

  const toggleCheckIn = () => setCheckedIn((s) => !s);
  const { user } = useSelector((state) => state.auth);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    if (!user?.employee_id) {
      setTodayAttendance(null);
      return;
    }

    let cancelled = false;

    const fetchTodayAttendance = async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const todayDate = `${year}-${String(month).padStart(2, "0")}-${String(
        today.getDate(),
      ).padStart(2, "0")}`;

      try {
        const res = await api.get(
          `/attendance/get_my_attendance_history?employee_id=${user.employee_id}&month=${month}&year=${year}&page=1&limit=31`,
        );

        const records = res?.data?.data || [];

        const todayRecord = records.find(
          (item) => item.date?.split("T")[0] === todayDate,
        );

        if (!cancelled) {
          setTodayAttendance(todayRecord || null);
        }
      } catch (error) {
        console.error("Error fetching today's attendance:", error);
        if (!cancelled) setTodayAttendance(null);
      }
    };

    fetchTodayAttendance();

    return () => {
      cancelled = true;
    };
  }, [user?.employee_id]);

  const isoToLocalTime = (isoTime) => {
    if (!isoTime) return "--";

    const date = new Date(isoTime);
    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={3} mb={3}>
      {/* Attendance Card */}
      <Box p={4} borderRadius="14px" bg="white" border="1px solid #cccccc">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={4}>
          <Flex align="center" gap={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img src={Attendance} alt="Attendance" width={28} height={28} />
            </Box>
            <Text fontSize="16px" fontWeight="700">
              Attendance
              <Text as="span" fontSize="16px" color="gray.500" fontWeight="500">
                (Today)
              </Text>
            </Text>
          </Flex>
          <Box
            px={4}
            py={1}
            borderRadius="999px"
            bg="#E9F9EE"
            color="#2FAF65"
            fontSize="11px"
            fontWeight="600"
            border="1px solid #8FE0B3"
          >
            On Time
          </Box>
        </Flex>
        {/* Checked in row */}
        <Flex justify="space-between" align="center" py={3}>
          <Text fontSize="14px" fontWeight="600">
            Checked-in
          </Text>
          <Text fontSize="14px" color="gray.500">
            {isoToLocalTime(todayAttendance?.check_in)}
          </Text>
        </Flex>
        <Box h="1px" bg="#E5E5E5" /> {/* Checked out row */}
        <Flex justify="space-between" align="center" py={3}>
          <Text fontSize="14px" fontWeight="600">
            Checked-out
          </Text>
          <Text fontSize="14px" color="gray.400">
            {isoToLocalTime(todayAttendance?.check_out)}
          </Text>
        </Flex>
        {/* Action */}
        <Button
          w="100%"
          mt={3}
          h="30px"
          borderRadius="10px"
          bg="#1F3661"
          color="white"
          fontSize="14px"
          fontWeight="400"
          _hover={{ bg: "blue.700" }}
          p={6}
        >
          View all attendance
        </Button>
      </Box>

      {/* Leave Balance Card */}
      {/* <Box p={4} borderRadius="14px" bg="white" border="1px solid #cccccc">
        <Flex align="center" gap={3} mb={4}>
          <Box
            w="40px"
            h="40px"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <img src={leave_balance} alt="Leave" width={28} height={28} />
          </Box>

          <Text fontSize="16px" fontWeight="700">
            Leave balance
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" py={3}>
          <Text fontSize="14px" fontWeight="600">
            Remaining
          </Text>
          <Text fontSize="14px" fontWeight="700">
            12 Day(s)
          </Text>
        </Flex>

        <Box h="1px" bg="#E5E5E5" />

        <Flex justify="space-between" align="center" py={3}>
          <Text fontSize="14px" fontWeight="600">
            Used
          </Text>
          <Text fontSize="14px" fontWeight="700">
            4 Day(s)
          </Text>
        </Flex>

        <Button
          w="100%"
          mt={3}
          h="30px"
          borderRadius="10px"
          bg="#1F3661"
          color="white"
          fontSize="14px"
          fontWeight="400"
          _hover={{ bg: "blue.700" }}
          p={6}
        >
          Apply Leave
        </Button>
      </Box> */}
      {/* Next Payday Card */}
      <Box
        p={4}
        display="flex"
        flexDirection="column"
        borderRadius="14px"
        bg="white"
        border="1px solid #cccccc"
      >
        {/* Header */}
        <Flex align="center" gap={3} mb={6}>
          <Box
            w="38px"
            h="35px"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* replace with your payday icon if available */}
            <img src={next_payday} alt="Next Payday" width={28} height={28} />
          </Box>

          <Text fontSize="16px" fontWeight="700">
            Next payday
          </Text>
        </Flex>

        {/* Main content */}
        <Flex align="baseline" gap={3} py={6}>
          <Text fontSize="28px" fontWeight="700">
            {/* 5 Days */}
          </Text>
          <Text fontSize="16px" color="gray.500">
            {/* (Salary on July 31) */}
          </Text>
        </Flex>

        {/* Action */}
        <Button
          w="100%"
          mt="auto"
          // h="30px"
          borderRadius="10px"
          bg="#1F3661"
          color="white"
          fontSize="14px"
          fontWeight="400"
          _hover={{ bg: "blue.700" }}
          p={6}
        >
          View
        </Button>
      </Box>
    </SimpleGrid>
  );
}
