// import { Box, Flex, Text } from "@chakra-ui/react";
// import { useState } from "react";

// const REPORT_TABS = [
//   { key: "checkin", label: "Employee Check-in/ Check-out" },
//   { key: "manual", label: "Manual entry report" },
//   { key: "grace", label: "Grace period non-compliance report" },
// ];

// const AttendanceReportsView = () => {
//   const [activeTab, setActiveTab] = useState("checkin");

//   return (
//     <Box>
//       {/* ===== WHITE SUB TAB CONTAINER ===== */}
//       <Box
//         bg="white"
//         borderRadius="0 0 12px 12px"
//         px={6}
//         pt={4}
//         pb={0}
//         mt={-4}
//       >
//         <Flex gap={8} align="center">
//           {REPORT_TABS.map((tab) => (
//             <Box
//               key={tab.key}
//               cursor="pointer"
//               pb={3}
//               position="relative"
//               onClick={() => setActiveTab(tab.key)}
//             >
//               <Text
//                 fontSize="13px"
//                 fontWeight="600"
//                 color={activeTab === tab.key ? "#243B66" : "#737373"}
//               >
//                 {tab.label}
//               </Text>

//               {/* ===== ACTIVE BOTTOM BORDER ===== */}
//               {activeTab === tab.key && (
//                 <Box
//                   position="absolute"
//                   bottom="0"
//                   left="0"
//                   width="100%"
//                   height="5px"
//                   bg="#243B66"
//                   borderRadius="6px 6px 0 0"
//                 />
//               )}
//             </Box>
//           ))}
//         </Flex>

//         {/* ===== LIGHT BOTTOM BORDER ===== */}
//         <Box
//           mt={1}
//           h="1px"
//           bg="#E5E7EB"
//         />
//       </Box>

//       {/* ===== REPORT CONTENT AREA ===== */}
//       <Box mt={4} px={6}>
//         {activeTab === "checkin" && <Text>Employee Check-in/Check-out Report</Text>}
//         {activeTab === "manual" && <Text>Manual Entry Report</Text>}
//         {activeTab === "grace" && <Text>Grace Period Non-compliance Report</Text>}
//       </Box>
//     </Box>
//   );
// };

// export default AttendanceReportsView;

// AttendanceReportsView.jsximport { Box, Flex, Text } from "@chakra-ui/react";


import { Box, Flex,Text } from "@chakra-ui/react";
import { useState } from "react";
import EmployeeCheckInCheckOut from "./EmployeeCheckInCheckOut";
import ManualEntryReport from "./ManualEntryReport";
import GracePeriodReport from "./GracePeriodReport";
import EmployeeCheckInCheckOutDetils from "./EmployeeCheckInCheckOutDetails";

const REPORT_TABS = [
  { key: "checkin", label: "Employee Check-in/ Check-out" },
  { key: "manual", label: "Manual entry report" },
  { key: "grace", label: "Grace period non-compliance report" },
];

const AttendanceReportsView = () => {
  const [activeTab, setActiveTab] = useState("checkin");
    const [showDetails, setShowDetails] = useState(false);


  return (
    <Box>
      {/* ===== WHITE SUB TAB CONTAINER ===== */}
      <Box
        bg="white"
        borderRadius="0 0 12px 12px"
        px={6}
        pt={6}
        pb={0}
        mt={-3}
        boxShadow="sm"
      >
        <Flex gap={8} align="center">
          {REPORT_TABS.map((tab) => (
            <Box
              key={tab.key}
              cursor="pointer"
              pb={3}
              position="relative"
              onClick={() => {setActiveTab(tab.key), setShowDetails(false)}}
            >
              <Text
                fontSize="13px"
                fontWeight="600"
                color={activeTab === tab.key ? "#243B66" : "#000"}
              >
                {tab.label}
              </Text>

              {/* ===== ACTIVE BOTTOM BORDER ===== */}
              {activeTab === tab.key && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  width="100%"
                  height="5px"
                  bg="#243B66"
                  borderRadius="6px 6px 0 0"
                />
              )}
            </Box>
          ))}
        </Flex>

        {/* ===== LIGHT BOTTOM BORDER ===== */}
        <Box mt={1} h="1px" bg="#E5E7EB" />
      </Box>

      {/* ===== REPORT CONTENT AREA ===== */}
      <Box mt={4} px={0} mb={6}>
        {/* {activeTab === "checkin" && <EmployeeCheckInCheckOut/>} */}
        {activeTab === "checkin" && !showDetails && (
          <EmployeeCheckInCheckOut
            onViewDetails={() => setShowDetails(true)}
          />
        )}

        {activeTab === "checkin" && showDetails && (
          <EmployeeCheckInCheckOutDetils />
        )}

        {activeTab === "manual" && <ManualEntryReport/>}
        {activeTab === "grace" && <GracePeriodReport/>}
      </Box>
    </Box>
  );
};

export default AttendanceReportsView;
