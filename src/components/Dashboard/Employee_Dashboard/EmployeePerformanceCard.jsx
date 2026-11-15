// src/components/Dashboard/employee/EmployeePerformanceCard.jsx
import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import bgImgemp from "../../../assets/bgImgemp2.png";

export default function EmployeePerformanceCard() {
  return (
    <Box
      p={6}
      borderRadius="16px"
      bgGradient="linear(to-r, #0f172a, #0b1220)"
        // backgroundImage={`url(${bgImgemp})`}
      color="white"
      minH="110px"
      mt={3}
      mb={3}
      //  bgRepeat="no-repeat"
    >
      <Text fontWeight="600" fontSize="lg" mb={2}>
        Performance
      </Text>

      <Text fontSize="md" mb={2}>
        Last Review: Meets Expectations
      </Text>

      <Text fontSize="sm" color="gray.200" mb={4}>
        Goals in progress: 3 • Next review: Oct 2025
      </Text>

      <Button size="sm" variant="outline" colorScheme="whiteAlpha">
        View Performance
      </Button>
    </Box>
  );
}
