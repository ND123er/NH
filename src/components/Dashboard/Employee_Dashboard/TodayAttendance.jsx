// src/components/Dashboard/employee/TodayAttendance.jsx
import React from "react";
import { Box, Text, VStack, Button } from "@chakra-ui/react";

export default function TodayAttendance() {
  // dummy timeline
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="16px"
      bg="white"
      border="1px solid #cccccc"
      
    >
      <Text fontWeight="600" mb={3}>
        Today's Attendance
      </Text>

      <VStack align="stretch" spacing={2} mb={4}>
        <Box>
          <Text fontSize="lg" fontWeight="700">
            09:42 AM
          </Text>
          <Text fontSize="sm" color="gray.500">
            Checked In
          </Text>
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="700">
            01:10 PM - 01:45 PM
          </Text>
          <Text fontSize="sm" color="gray.500">
            Lunch break
          </Text>
        </Box>
      </VStack>

      <Button
        size="sm"
        bg="#1F3661"
        color="white"
        borderRadius="8px"
        _hover={{ bg: "#162843" }}
      >
        Check Out
      </Button>
    </Box>
  );
}
