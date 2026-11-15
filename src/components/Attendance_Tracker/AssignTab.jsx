// import React from "react";
// import { Flex, Text } from "@chakra-ui/react";
// import { useLocation, useNavigate } from "react-router-dom";

// const AssignTab = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const tabs = [

//     {
//         label: "Fixed Shift",
//         path:"/attendances/fixedshift",
//     },
//     {
//       label: "Rotational Shift",
//       path: "/attendances/rotationalshift",
//     },

//   ];

//   return (
//     <Flex
//       borderBottom="1px solid #E5E7EB"
//       px={4}
//       gap={8}
//       bg="white"
//     >
//       {tabs.map((tab) => {
//         const isActive = location.pathname === tab.path;

//         return (
//           <Text
//             key={tab.path}
//             py={3}
//             fontSize="13px"
//             fontWeight={isActive ? "600" : "500"}
//             color={isActive ? "#274066" : "#667085"}
//             borderBottom={isActive ? "2px solid #274066" : "2px solid transparent"}
//             cursor="pointer"
//             onClick={() => navigate(tab.path)}
//           >
//             {tab.label}
//           </Text>
//         );
//       })}
//     </Flex>
//   );
// };

// export default AssignTab;

// import React, { useState } from "react";
// import { Box, Flex, Button } from "@chakra-ui/react";
// import { Box, Flex, Radio, RadioGroup } from "@chakra-ui/react";
// import AssignShift from "./AssignShift";
// import FixedShift from "./FixedShift";

// export default function AssignTab() {
//   const [activeTab, setActiveTab] = useState("fixed_shift");

//   return (
//     <Box
//       mt={{ base: "7.7vh", sm: "6.4vh", md: "0vh", lg: "0vh" }}
//       ml={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
//       mr={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
//       w={{ base: "96vw", sm: "96vw", md: "100%", lg: "100%" }}
//     >
//       <Flex
//         //  gap={2}
//         //  borderBottom="1px solid #E2E8F0"
//         //  mb={4}
//         bg="#243B66"
//         p={2}
//         borderRadius="14px"
//         align="center"
//         w="100%"
//         mb={4}
//         gap={2}
//         wrap="wrap"
//         justify="space-between"
//       >
//         <Button
//           variant="ghost"
//           // borderBottom={
//           //   activeTab === "fixed_shift" ? "2px solid #1769E0" : "none"
//           // }
//            flex={{
//               base: "1 1 calc(50% - 8px)",
//               sm: "1 1 calc(33.33% - 8px)",
//               md: "1 1 calc(25% - 8px)",
//               lg: "1 1 calc(14.28% - 8px)",
//             }}
//             minW="0"
//             w="100%"
//             h={{ base: "44px", md: "56px" }}
//             bg={activeTab === "fixed_shift" ? "white" : "#2F4A7A"}
//             // color={isActive ? "black" : "white"}
//             borderRadius="7px"
//             _hover={{
//               bg: activeTab === "fixed_shift" ? "white" : "#3b5c92"

//             }}
//             boxShadow={activeTab === "fixed_shift" ? "md" : "none"}
//             justifyContent="center"
//             whiteSpace="nowrap"
//             overflow="hidden"
//             textOverflow="ellipsis"
//             iconSpacing={{ base: 1, sm: 2 }}
//             borderWidth={'1px'}
//             borderColor={'#637691'}
//           color={activeTab === "fixed_shift" ? "black" : "white"}
//           onClick={() => setActiveTab("fixed_shift")}
//         >
//           Fixed Shift
//         </Button>

//         <Button
//           variant="ghost"
//           flex={{
//               base: "1 1 calc(50% - 8px)",
//               sm: "1 1 calc(33.33% - 8px)",
//               md: "1 1 calc(25% - 8px)",
//               lg: "1 1 calc(14.28% - 8px)",
//             }}
//             minW="0"
//             w="100%"
//             h={{ base: "44px", md: "56px" }}
//             bg={activeTab === "roational_shift" ? "white" : "#2F4A7A"}
//             // color={isActive ? "black" : "white"}
//             borderRadius="7px"
//             _hover={{
//               bg: activeTab === "roational_shift" ? "white" : "#3b5c92"

//             }}
//             boxShadow={activeTab === "roational_shift" ? "md" : "none"}
//             justifyContent="center"
//             whiteSpace="nowrap"
//             overflow="hidden"
//             textOverflow="ellipsis"
//             iconSpacing={{ base: 1, sm: 2 }}
//             borderWidth={'1px'}
//             borderColor={'#637691'}
//           // borderBottom={
//           //   activeTab === "roational_shift" ? "2px solid #e07b17" : "none"
//           // }
//           color={activeTab === "roational_shift" ? "black" : "white"}
//           onClick={() => setActiveTab("roational_shift")}
//         >
//           Rotational Shift
//         </Button>
//       </Flex>

//       {activeTab === "fixed_shift" && <FixedShift />}

// {activeTab === "roational_shift" && <AssignShift />}
//     </Box>
//   );
// }
// import React, { useState } from "react";
// import { Box, Flex, Button } from "@chakra-ui/react";
// // import TeamAttendanceTable from "../Attendance_Tracker/TeamAttendanceTable";
// // import AssignShift from "../Attendance_Tracker/AssignShift";
// // import AssignSetting from "./AssignSetting";
// import AssignShift from "./AssignShift";
// import FixedShift from "./FixedShift";

// export default function AssignTab() {
//   const [activeTab, setActiveTab] = useState("fixed_shift");

//   return (
//     <Box
//       mt={{ base: "7.7vh", sm: "6.4vh", md: "0vh", lg: "0vh" }}
//       ml={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
//       mr={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
//       w={{ base: "96vw", sm: "96vw", md: "100%", lg: "100%" }}
//     >
//       {/* Tabs */}
//       <Flex
//         // bg="white"
//         p={2}
//         borderRadius="14px"
//         align="center"
//         w="100%"
//         mb={4}
//         gap={2}
//         wrap="wrap"
//       >
//         {/* Fixed Shift */}
//         <Button
//           variant="ghost"
//           flex="0 0 120px"
//           minW="220px"
//           w="220px"
//           h={{ base: "44px", md: "56px" }}
//           // bg={
//           //   activeTab === "fixed_shift"
//           //     ? "white"
//           //     : "#2F4A7A"
//           // }
//           // borderRadius="7px"
//           // border="1px solid #637691"
//           // _hover={{
//           //   bg:
//           //     activeTab === "fixed_shift"
//           //       ? "white"
//           //       : "#3b5c92",
//           // }}
//           // boxShadow={
//           //   activeTab === "fixed_shift" ? "md" : "none"
//           // }
//           boxShadow={
//             "md"
//           }
//           justifyContent="center"
//           whiteSpace="nowrap"
//           overflow="hidden"
//           textOverflow="ellipsis"
//           color={
//             activeTab === "fixed_shift"
//               ? "black"
//               : "black"
//           }
//           onClick={() => setActiveTab("fixed_shift")}
//         >
//           {/* Radio indicator */}
//           <Box
//             w="16px"
//             h="16px"
//             borderRadius="50%"
//             border="2px solid"
//             borderColor={
//               activeTab === "fixed_shift"
//                 ? "#243B66"
//                 : "black"
//             }
//             mr={2}
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             flexShrink={0}
//           >
//             {activeTab === "fixed_shift" && (
//               <Box
//                 w="8px"
//                 h="8px"
//                 borderRadius="50%"
//                 bg="#243B66"
//               />
//             )}
//           </Box>

//           Fixed Shift
//         </Button>

//         {/* Rotational Shift */}
//         <Button
//           variant="ghost"
//           flex="0 0 120px"
//           minW="220px"
//           w="220px"
//           h={{ base: "44px", md: "56px" }}
//           // bg={
//           //   activeTab === "roational_shift"
//           //     ? "white"
//           //     : "#2F4A7A"
//           // }
//           // borderRadius="7px"
//           // border="1px solid #637691"
//           // _hover={{
//           //   bg:
//           //     activeTab === "roational_shift"
//           //       ? "white"
//           //       : "#3b5c92",
//           // }}
//           boxShadow={
//             // activeTab === "roational_shift"
//             //   ? "md"
//             //   : "none"
//             "md"
//           }
//           justifyContent="center"
//           whiteSpace="nowrap"
//           overflow="hidden"
//           textOverflow="ellipsis"
//           color={
//             activeTab === "roational_shift"
//               ? "black"
//               : "black"
//           }
//           onClick={() => setActiveTab("roational_shift")}
//         >
//           {/* Radio indicator */}
//           <Box
//             w="16px"
//             h="16px"
//             borderRadius="50%"
//             border="2px solid"
//             borderColor={
//               activeTab === "roational_shift"
//                 ? "#243B66"
//                 : "black"
//             }
//             mr={2}
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             flexShrink={0}
//           >
//             {activeTab === "roational_shift" && (
//               <Box
//                 w="8px"
//                 h="8px"
//                 borderRadius="50%"
//                 bg="#243B66"
//               />
//             )}
//           </Box>

//           Rotational Shift
//         </Button>
//       </Flex>

//       {/* Tab content */}
//       {activeTab === "fixed_shift" && <FixedShift />}

//       {activeTab === "roational_shift" && <AssignShift />}
//     </Box>
//   );
// }
import React, { useState } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import AssignShift from "./AssignShift";
import FixedShift from "./FixedShift";

export default function AssignTab() {
  const [activeTab, setActiveTab] = useState("fixed_shift");

  return (
    <Box
      bg="white"
      mt={{ base: "7.7vh", sm: "6.4vh", md: "0vh", lg: "0vh" }}
      ml={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
      mr={{ base: "2vw", sm: "2vw", md: "0vw", lg: "0vw" }}
      w={{ base: "96vw", sm: "96vw", md: "100%", lg: "100%" }}
      className="
        shiftwrapper
      "
    >
      {/* Tabs */}
      <Flex
        bg="white"
        // borderRadius="7px"
        borderTopLeftRadius="14px"
        borderTopRightRadius="14px"
        // borderBottom="1px solid #E2E8F0"
        position="relative"
         _after={{
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "2px",
          backgroundImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
        }}
        align="center"
        w="100%"
        mb={4}
        gap={4}
        px={2}
      >
        {/* Fixed Shift */}
        <Button
          variant="ghost"
          minW="120px"
          mt="12px"
          w="120px"
          h="70px"
          zIndex="2"
          borderRadius="0"
          borderBottom={
            activeTab === "fixed_shift"
              ? "3px solid #243B66"
              : "3px solid transparent"
          }
          color={activeTab === "fixed_shift" ? "gray.800" : "#757575"}
          fontSize="16px"
          fontWeight={activeTab === "fixed_shift" ? "700" : "700"}
          bg="transparent"
          _hover={{
            bg: "transparent",
          }}
          justifyContent="center"
          whiteSpace="nowrap"
          onClick={() => setActiveTab("fixed_shift")}
        >
          Fixed Shift
        </Button>

        {/* Rotational Shift */}
        <Button
          variant="ghost"
          minW="150px"
          mt="12px"
          w="150px"
          h="70px"
          borderRadius="0"
           zIndex="2"
          borderBottom={
            activeTab === "roational_shift"
              ? "3px solid #243B66"
              : "3px solid transparent"
          }
          color={activeTab === "roational_shift" ? "gray.800" : "#757575"}
          fontSize="16px"
          fontWeight={activeTab === "roational_shift" ? "700" : "700"}
          bg="transparent"
          _hover={{
            bg: "transparent",
          }}
          justifyContent="center"
          whiteSpace="nowrap"
          onClick={() => setActiveTab("roational_shift")}
        >
          Rotational Shift
        </Button>
      </Flex>

      {/* Tab content */}
      {activeTab === "fixed_shift" && <FixedShift />}

      {activeTab === "roational_shift" && <AssignShift />}
    </Box>
  );
}
