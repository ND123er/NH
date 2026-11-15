import React, { useState } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import TeamAttendanceTable from "../Attendance_Tracker/TeamAttendanceTable";
// import AssignShift from "../Attendance_Tracker/AssignShift";
import AssignSetting from "./AssignSetting";
import AssignTab from "./AssignTab";
import ViewShift from "./ViewShift";

export default function AttendanceTab() {
  const [activeTab, setActiveTab] = useState("all_employees");

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
        //  gap={2}
        //  borderBottom="1px solid #E2E8F0"
        //  mb={4}
        bg="#243B66"
        p={2}
        borderRadius="14px"
        align="center"
        w="100%"
        mb={4}
        gap={2}
        wrap="wrap"
        justify=""
      >
        <Button
          variant="ghost"
          // borderBottom={
          //   activeTab === "all_employees" ? "2px solid #1769E0" : "none"
          // }
          //  flex={{
          //     base: "1 1 calc(50% - 8px)",
          //     sm: "1 1 calc(33.33% - 8px)",
          //     md: "1 1 calc(25% - 8px)",
          //     lg: "1 1 calc(14.28% - 8px)",
          //   }}
          //   minW="0"
          //   w="120px"
          flex="0 0 220px"
          minW="220px"
          w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "all_employees" ? "white" : "#2F4A7A"}
          // color={isActive ? "black" : "white"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "all_employees" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "all_employees" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          iconSpacing={{ base: 1, sm: 2 }}
          borderWidth={"1px"}
          borderColor={"#637691"}
          color={activeTab === "all_employees" ? "black" : "white"}
          onClick={() => setActiveTab("all_employees")}
        >
          All employees
        </Button>

        <Button
          variant="ghost"
          // flex={{
          //     base: "1 1 calc(50% - 8px)",
          //     sm: "1 1 calc(33.33% - 8px)",
          //     md: "1 1 calc(25% - 8px)",
          //     lg: "1 1 calc(14.28% - 8px)",
          //   }}
          flex="0 0 220px"
          minW="220px"
          w="220px"
          // minW="0"
          // w="120px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "assign_shift" ? "white" : "#2F4A7A"}
          // color={isActive ? "black" : "white"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "assign_shift" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "assign_shift" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          iconSpacing={{ base: 1, sm: 2 }}
          borderWidth={"1px"}
          borderColor={"#637691"}
          // borderBottom={
          //   activeTab === "assign_shift" ? "2px solid #e07b17" : "none"
          // }
          color={activeTab === "assign_shift" ? "black" : "white"}
          onClick={() => setActiveTab("assign_shift")}
        >
          Assign shift
        </Button>
        <Button
          variant="ghost"
          flex="0 0 220px"
          minW="220px"
          w="220px"
          h={{ base: "44px", md: "56px" }}
          bg={activeTab === "view_shift" ? "white" : "#2F4A7A"}
          borderRadius="7px"
          _hover={{
            bg: activeTab === "view_shift" ? "white" : "#3b5c92",
          }}
          boxShadow={activeTab === "view_shift" ? "md" : "none"}
          justifyContent="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          borderWidth="1px"
          borderColor="#637691"
          color={activeTab === "view_shift" ? "black" : "white"}
          onClick={() => setActiveTab("view_shift")}
        >
          View shift
        </Button>
      </Flex>

      {/* Tab content */}
      {activeTab === "all_employees" && <TeamAttendanceTable />}

      {activeTab === "assign_shift" && <AssignTab />}
      {activeTab === "view_shift" && <ViewShift />}
    </Box>
  );
}
