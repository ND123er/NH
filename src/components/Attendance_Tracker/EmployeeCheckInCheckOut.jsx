// import React, { useState } from "react";
// import {
//     Box,
//     Flex,
//     Text,
//     Button,
//     IconButton,
//     Icon,
//     Table,
//     Thead,
//     Tbody,
//     Tr,
//     Th,
//     Td,
//     Tag,
//     HStack,
//     Input,
//     Menu,
//     MenuButton,
//     MenuList,
//     MenuItem,
//     Stack,
//     InputGroup,
//     InputLeftElement,
//     MenuDivider,
// } from "@chakra-ui/react";
// import { SearchIcon } from "@chakra-ui/icons";
// import { FiMoreVertical, FiUpload } from "react-icons/fi";
// import { BiCalendar } from "react-icons/bi";
// import { AiOutlineFile, AiOutlineCheckCircle } from "react-icons/ai";
// import { IoMdCalendar } from "react-icons/io";
// import { BsThreeDots } from "react-icons/bs";
// import { FaFileExcel } from "react-icons/fa";
// import FilterDropdownLeave from "../Leave_Tracker/Filters/FilterDropdownLeave";

// /* ---------------- Dummy Data ---------------- */
// const employees = Array.from({ length: 10 }).map(() => ({
//     name: "David Scotland",
//     id: "1004859",
//     location: "London",
//     job: "HR Admin",
//     dept: "Human Resources",
//     status: ["Present", "Late", "Absent"][Math.floor(Math.random() * 3)],
//     hours: "8",
// }));

// const EmployeeCheckInCheckOut = ({ onViewDetails }) => {
//     const todayISO = new Date().toISOString().slice(0, 10);
//     const [fromDate, setFromDate] = useState(todayISO);
//     const [search, setSearch] = useState("");

//     return (
//         <Box bg="white" p={0} pb={6} pt={6} borderRadius="12px" border="1px solid #E5E7EB">
//             {/* Header */}
//             <Flex justify="space-between" align="center" mb={4} pl={6} pr={6}>
//                 <Text fontSize="lg" fontWeight="600">
//                     All employees Clock-in/Clock-out
//                 </Text>

//                 <Flex gap={3}>
//                     <Box
//                         border="1px solid #ccc"
//                         borderRadius="5px"
//                         p={1}
//                         h={8}
//                         display="flex"
//                         alignItems="center"
//                         gap={2}
//                     >
//                         <Icon as={BiCalendar} color="#999" />
//                         <Text fontSize="14px">
//                             {fromDate.split("-").reverse().join("-")}
//                         </Text>
//                     </Box>

//                     <InputGroup size="sm" w="130px">
//                         <InputLeftElement pointerEvents="none">
//                             <SearchIcon color="gray.400" />
//                         </InputLeftElement>

//                         <Input
//                             placeholder="Search"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             borderRadius="5px"
//                             border="1px solid #ccc"
//                             _focus={{ borderColor: "#1A365D", boxShadow: "none" }}
//                         />
//                     </InputGroup>

//                     <Box border="0px solid #cccccc" borderRadius={"5px"}>
//                         <FilterDropdownLeave />
//                     </Box>
//                     {/* Menu */}
//                     <Menu>
//                         <MenuButton as={Button} size="sm" variant="outline">
//                             <BsThreeDots />
//                         </MenuButton>
//                         <MenuList>
//                             <MenuItem icon={<AiOutlineFile />}>Export CSV</MenuItem>
//                             <MenuItem icon={<FaFileExcel />}>Export XLS</MenuItem>
//                             <MenuDivider />
//                             <MenuItem icon={<FiUpload />}>Import</MenuItem>
//                         </MenuList>
//                     </Menu>
//                 </Flex>
//             </Flex>
//             <Box
//                 h="1px"
//                 w="100%"
//                 bgImage={`repeating-linear-gradient(
//                 to right,
//                 #C7C7C7 0,
//                 #C7C7C7 4px,
//                 transparent 3px,
//                 transparent 8px
//               )`}
//                 mb={4}

//             />
//             {/* Status */}
//             <HStack spacing={4} mb={4} pl={6}
//                 pr={6}>
//                 <Text fontSize="16px" fontWeight="600">
//                     Current Status
//                 </Text>
//                 <Tag bg="#E8F7EF"
//                     color="#74D27E"
//                     borderRadius="20px"
//                     fontWeight="600"
//                     borderWidth="1px"
//                     borderColor="#87D78E4D">Active</Tag>
//                 <Tag bg="#FFF6E5" color="#D0860F" borderRadius='20px' fontWeight={'600'} borderWidth="1px"
//                     borderColor="#EFC95133">Pending</Tag>
//                 <Tag bg="#F3F4F6" color="#8E8E8E" borderRadius='20px' fontWeight={'600'} borderWidth="1px"
//                     borderColor="#737373">On Probation</Tag>
//                 <Tag bg="#FDECEC" color="#EE5D50" borderRadius='20px' fontWeight={'600'} borderWidth="1px"
//                     borderColor="#EE5D50">Expired</Tag>
//             </HStack>
//             <Box
//                 h="1px"
//                 w="100%"
//                 bgImage={`repeating-linear-gradient(
//                 to right,
//                 #C7C7C7 0,
//                 #C7C7C7 4px,
//                 transparent 3px,
//                 transparent 8px
//               )`}

//                 mb={4}

//             />

//             {/* Table */}
//             <Table size="sm" variant="unstyled"
//                 sx={{
//                     "& thead th": {
//                         textTransform: "none",
//                         // fontSize: "12px",
//                         fontWeight: "600",
//                         pb: 4,
//                         pl: 6,
//                         pr: 6,
//                     },
//                     "& tbody td": {
//                         pl: 6,
//                         pr: 6,
//                     },
//                     "& tbody tr:nth-of-type(odd)": {
//                         bg: "#F3F4F6",
//                     },
//                 }}
//             >
//                 <Thead sx={{
//                     th: {
//                                 textTransform: "none",
//                                 fontWeight: "600",
//                                 fontFamily: "'Poppins', sans-serif",
//                                 color: "#000000",
//                                 fontSize: "14px",
//                                 whiteSpace: "nowrap",
//                             },
//                 }}>
//                     <Tr>
//                         <Th>Full Name</Th>
//                         <Th>Employee ID</Th>
//                         <Th>Location</Th>
//                         <Th>Job Title</Th>
//                         <Th>Department</Th>
//                         <Th>Status</Th>
//                         <Th>Hours</Th>
//                         <Th textAlign="center">Action</Th>
//                     </Tr>
//                 </Thead>

//                 <Tbody>
//                     {employees?.map((emp, i) => (
//                         <Tr key={i} >
//                             <Td>{emp.name}</Td>
//                             <Td>{emp.id}</Td>
//                             <Td>{emp.location}</Td>
//                             <Td>{emp.job}</Td>
//                             <Td>{emp.dept}</Td>
//                             <Td>{emp.status}</Td>
//                             <Td>{emp.hours}</Td>
//                             <Td textAlign="center">
//                                 <IconButton
//                                     icon={<FiMoreVertical />}
//                                     size="sm"
//                                     variant="ghost"
//                                     onClick={onViewDetails}
//                                 />
//                             </Td>
//                         </Tr>
//                     ))}
//                 </Tbody>
//             </Table>
//         </Box>
//     );
// };

// export default EmployeeCheckInCheckOut;


import React from "react";
import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";

const EmployeeCheckInCheckOut = () => {
    return (
        <Flex
            minH="70vh"
            align="center"
            justify="center"
            // bg="gray.50"
            px={2}
            width={{ base: '100vw', sm: '100vw', md: '100%', lg: '100%' }}
        >
            <Box
                textAlign="center"
                // bg="white"
                // p={10}
                // borderRadius="lg"
                // boxShadow="lg"
                // maxW="700px"
                // height='250px'
                w="100%"
            >
                <Icon
                    as={TimeIcon}
                    w={12}
                    h={12}
                    color="#233A63"
                    mb={4}
                />

                <Heading size="lg" mb={2}>
                    Coming Soon
                </Heading>

                <Text fontSize="md" color="gray.600">
                    Welcome! This section will be available soon.
                    We’re working to bring you new features.
                </Text>
            </Box>
        </Flex>
    );
};

export default EmployeeCheckInCheckOut;

