import { isAdminUser } from "../utils/roles";
// import React, { useState } from "react";
// import TeamLeavesTable from "../components/Leave_Tracker/TeamLeavesTable";
// import LeaveTabsNavbar from "../components/Leave_Tracker/LeaveTabsNavbar";
// import HolidayList from "../components/Leave_Tracker/HolidayList";
// import CustomisedBal from "../components/Leave_Tracker/CustomisedBal";
// import LeaveRollover from "../components/Leave_Tracker/LeaveRollover";
// import AttendanceTabsNavbar from "../components/Attendance_Tracker/AttendanceTabsNavbar";
// import TeamAttendanceTable from '../components/Attendance_Tracker/TeamAttendanceTable';
// import AttendanceReportTable from "../components/Attendance_Tracker/AttendanceReportTable";
// import MyAttendance from "../components/Attendance_Tracker/MyAttendance";
// import { useSearchParams } from "react-router-dom";
// import AdminView from "../components/Attendance_Tracker/AdminView";
// import AttendanceReportsView from "../components/Attendance_Tracker/AttendanceReportsView";
// export default function AttendanceTracker() {
//   // const [activeTab, setActiveTab] = useState("my_attendance"); 
//   const [searchParams, setSearchParams] = useSearchParams();
//   const defaultTab = searchParams.get("tab") || "my_attendance";
//   const [activeTab, setActiveTab] = useState(defaultTab);
//   const [showAdminView, setShowAdminView] = useState(false);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSearchParams({ tab });
//     setShowAdminView(false);
//   };
//   return (
//     <>
//       {/* Navbar */}
//       <AttendanceTabsNavbar activeTab={activeTab} /*setActiveTab={setActiveTab}*/ setActiveTab={handleTabChange} />

//       {/* Render based on selected tab */}
//       {activeTab === "my_attendance" && <MyAttendance />}

//       {/* {activeTab === "team_attendance" && <TeamAttendanceTable />} */}
//       {activeTab === "team_attendance" && (
//         showAdminView ? (
//           <AdminView onBack={() => setShowAdminView(false)} />
//         ) : (
//           <TeamAttendanceTable onViewAdmin={() => setShowAdminView(true)} />
//         )
//       )}
//       {/* {activeTab === "reports" && <AttendanceReportTable />} */}
//       {activeTab === "reports" && <AttendanceReportsView />}



//     </>
//   );
// }
// AttendanceTracker.jsx




// import { Box } from "@chakra-ui/react";
// import { useState } from "react";
// import { useSearchParams } from "react-router-dom"; // Make sure this is imported
// import AttendanceTabsNavbar from "../../src/components/Attendance_Tracker/AttendanceTabsNavbar";
// // import MyAttendance from "../components/Attendance_Tracker/MyAttendance
// import MyAttendance from "../components/Attendance_Tracker/MyAttendance";
// import TeamAttendanceTable from "../components/Attendance_Tracker/TeamAttendanceTable";
// import AdminView from "../components/Attendance_Tracker/AdminView";
// import AttendanceReportsView from "../components/Attendance_Tracker/AttendanceReportsView";

// export default function AttendanceTracker() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const defaultTab = searchParams.get("tab") || "my_attendance";
//   const [activeTab, setActiveTab] = useState(defaultTab);
//   const [showAdminView, setShowAdminView] = useState(false);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSearchParams({ tab });
//     setShowAdminView(false);
//   };

//   return (
//     <Box
//       bg="#F6F7FB"
//       borderRadius="16px"
//       overflow="hidden"
//       p={0}
//       pr={0}
//       pl={{ base: 2, sm: 2, md: 0, lg: 0 }}
//       mt={{ base: "7.6vh", sm: "6.3vh", md: "0vh", lg: '0vh' }}
//       w={{ base: "98vw", sm: "98vw", md: "100%", lg: '100%' }}
//     >
//       {/* Navbar */}
//       <AttendanceTabsNavbar
//         activeTab={activeTab}
//         setActiveTab={handleTabChange}
//       />

//       {/* Content */}
//       <Box mt={0}>
//         {activeTab === "my_attendance" && <MyAttendance />}

//         {activeTab === "team_attendance" &&
//           (showAdminView ? (
//             <AdminView onBack={() => setShowAdminView(false)} />
//           ) : (
//             <TeamAttendanceTable onViewAdmin={() => setShowAdminView(true)} />
//           ))}

//         {activeTab === "reports" && <AttendanceReportsView />}
//       </Box>
//       {/* <TeamAttendanceTable/> */}
//       {/* <MyAttendance/> */}
//     </Box>
//   );
// }

//old1709
// import { Box } from "@chakra-ui/react";
// import { useSelector } from "react-redux";

// import MyAttendance from "../components/Attendance_Tracker/MyAttendance";
// import TeamAttendanceTable from "../components/Attendance_Tracker/TeamAttendanceTable";

// export default function AttendanceTracker() {
//   const { user } = useSelector((state) => state.auth);

//   const isAdmin = isAdminUser(user);

//   return (
//     <Box
//       bg="#F6F7FB"
//       borderRadius="16px"
//       overflow="hidden"
//       p={0}
//       pr={0}
//       pl={{ base: 2, sm: 2, md: 0, lg: 0 }}
//       mt={{ base: "7.6vh", sm: "6.3vh", md: "0vh", lg: "0vh" }}
//       w={{ base: "98vw", sm: "98vw", md: "100%", lg: "100%" }}
//     >
//       {isAdmin ? (
//         <TeamAttendanceTable
//           onViewAdmin={() => {}}
//         />
//       ) : (
//         <MyAttendance />
//       )}
//     </Box>
//   );
// }

//1709
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";

import MyAttendance from "../components/Attendance_Tracker/MyAttendance";
import AttendanceTab from "../components/Attendance_Tracker/AttendanceTab";

export default function AttendanceTracker() {
  const { user } = useSelector((state) => state.auth);

  const isAdmin = isAdminUser(user);

  return (
    <Box
      bg="#F6F7FB"
      borderRadius="16px"
      overflow="hidden"
      p={0}
      pr={0}
      pl={{ base: 2, sm: 2, md: 0, lg: 0 }}
      mt={{ base: "7.6vh", sm: "6.3vh", md: "0vh", lg: "0vh" }}
      w={{ base: "98vw", sm: "98vw", md: "100%", lg: "100%" }}
    >
      {isAdmin ? (
        <AttendanceTab
          onViewAdmin={() => {}}
        />
      ) : (
        <MyAttendance />
      )}
    </Box>
  );
}