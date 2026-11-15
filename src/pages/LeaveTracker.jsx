import React, { useState } from "react";
import TeamLeavesTable from "../components/Leave_Tracker/TeamLeavesTable";
import LeaveTabsNavbar from "../components/Leave_Tracker/LeaveTabsNavbar";
import HolidayList from "../components/Leave_Tracker/HolidayList";
import CustomisedBal from "../components/Leave_Tracker/CustomisedBal";
import LeaveRollover from "../components/Leave_Tracker/LeaveRollover";
import MyLeave from "../components/Leave_Tracker/MyLeave";
import CompOff from "../components/Leave_Tracker/CompOff"

import { decodeTokenPayload } from "../utils/token";
// import LeaveReports from "../components/Leave_Tracker/LeaveReports";
import { Box } from "@chakra-ui/react";

export default function LeaveTracker() {
  // determine user role from token payload
  const payload = decodeTokenPayload();
  const isAdmin = Boolean(payload?.is_admin);

  // default active tab depends on role
  const [activeTab, setActiveTab] = useState(isAdmin ? "team_leave" : "my_leave");

  // visibleTabs: employees get a restricted set; admins get all except my_leave
  const employeeTabs = ["my_leave", "holiday", "leave_rollover", "comp_off"];
  const adminTabs = ["team_leave", "holiday", "leave_rollover", "balance", "report", "comp_off"];
  const visibleTabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <>
      {/* Navbar */}
      <Box mt={{ base: "7.7vh", sm: '6.4vh', md: "0vh", lg: '0vh' }}
        // ml={'2vw'}
        // mr={'2vw'}
        // w={'96vw'}
        ml={{ base: "2vw", sm: '2vw', md: "0vw", lg: '0vw' }}
        mr={{ base: "2vw", sm: '2vw', md: "0vw", lg: '0vw' }}
        w={{ base: "96vw", sm: '96vw', md: "0vw", lg: '100%' }}
      >
        <LeaveTabsNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          visibleTabs={visibleTabs}
        />

        {/* Render based on selected tab */}
        {activeTab === "my_leave" && <MyLeave />}

        {activeTab === "team_leave" && <TeamLeavesTable />}

        {activeTab === "holiday" && <HolidayList />}

        {activeTab === "leave_rollover" && <LeaveRollover />}

        {activeTab === "balance" && <CustomisedBal />}

        {/* {activeTab === "report" && <LeaveReports />} */}

         {activeTab === "comp_off" && <CompOff />}
      </Box>
    </>
  );
}
