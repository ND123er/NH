import React, { useState } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import TeamAttendanceTable from "../Attendance_Tracker/TeamAttendanceTable";
import EmployeeReport from "./EmployeeReport";
import AssetReport from "./AssetReport";
import AttendanceReport from "./AttendanceReport";
import LeaveReport from "./LeaveReport";

export default function AttendanceTab() {
  const [activeTab, setActiveTab] = useState("employee_report");

  return (
    <Box
      // bg="white"
      mt="12px"
      // mt={{ base: "7.7vh", sm: "6.4vh", md: "0vh", lg: "0vh" }}
      ml={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
      mr={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
      w={{ base: "96vw", sm: "96vw", md: "100%", lg: "100%" }}
    >
      {/* Tabs */}
      <Flex
        bg="#243B66"
        p={2}
        borderRadius="14px"
        align="center"
        w="100%"
        mb={3}
        gap={2}
        wrap="wrap"
        justify=""
      >
        <Button
          variant="ghost"
          flex="1"
          // minW="220px"
          // w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "employee_report" ? "white" : "#2F4A7A"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "employee_report" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "employee_report" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          iconSpacing={{ base: 1, sm: 2 }}
          borderWidth={"1px"}
          borderColor={"#637691"}
          color={activeTab === "employee_report" ? "black" : "white"}
          onClick={() => setActiveTab("employee_report")}
        >
          Employees
        </Button>

        <Button
          variant="ghost"
          flex="1"
          // minW="220px"
          // w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "attendance_report" ? "white" : "#2F4A7A"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "attendance_report" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "attendance_report" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          borderWidth="1px"
          borderColor="#637691"
          color={activeTab === "attendance_report" ? "black" : "white"}
          onClick={() => setActiveTab("attendance_report")}
        >
          Attendance
        </Button>

        <Button
          variant="ghost"
          flex="1"
          // minW="220px"
          // w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "leave_report" ? "white" : "#2F4A7A"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "leave_report" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "leave_report" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          iconSpacing={{ base: 1, sm: 2 }}
          borderWidth={"1px"}
          borderColor={"#637691"}
          color={activeTab === "leave_report" ? "black" : "white"}
          onClick={() => setActiveTab("leave_report")}
        >
          Leave
        </Button>

        <Button
          variant="ghost"
          flex="1"
          // minW="220px"
          // w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "asset_report" ? "white" : "#2F4A7A"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "asset_report" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "asset_report" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          borderWidth="1px"
          borderColor="#637691"
          color={activeTab === "asset_report" ? "black" : "white"}
          onClick={() => setActiveTab("asset_report")}
        >
          Assets
        </Button>
      </Flex>

      {/* Tab content */}
      {activeTab === "employee_report" && <EmployeeReport />}

      {activeTab === "leave_report" && <LeaveReport />}
      {activeTab === "attendance_report" && <AttendanceReport />}
      {activeTab === "asset_report" && <AssetReport />}
    </Box>
  );
}
