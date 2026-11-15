// src/components/Dashboard/EmployeeDashboard.jsx
import React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
// import AnnouncementsBoardSmall from "../Announcements/AnnouncementsBoardSmall";
import EmployeeQuickCards from "./EmployeeQuickCards";
import MyTasks from "./MyTasks";
import EmployeePerformanceCard from "./EmployeePerformanceCard";
import AssetsDocuments from "./AssetsDocuments";
import Calender from "../Calender";
import TodayAttendance from "./TodayAttendance";

export default function EmployeeDashboard({ isCollapsed }) {
  return (
    <Box>
      {/* Top quick-status cards */}
      <EmployeeQuickCards />
      {/* Main Grid */}
      <SimpleGrid
        columns={{ base: 1, 
        lg: isCollapsed ? 2 : 3, 
        }}
        spacing={3}
        mt={2}
        alignItems="flex-start"
        // width={'43.1vw'}
        w={{ base: "100%", md: "100%", 
          lg: isCollapsed ? "100%" : "65.040vw",
        }}
      >
        <Box gridColumn={{ base: "1 / -1", 
          // lg: "span 2" 
          lg: isCollapsed ? "auto" : "span 2",
          }}>
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={3}>
            <MyTasks />
            {/* <TodayAttendance /> */}
          </SimpleGrid>
          <Box mt={2}>
            <EmployeePerformanceCard />
          </Box>

          <Box mt={2}>
            <AssetsDocuments />
          </Box>
        </Box>

        <Box mt={-3} >
          <Calender isCollapsed={isCollapsed}/>

          {/* <Box mt={4}>
            <AnnouncementsBoardSmall />
          </Box> */}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
