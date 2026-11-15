// import React, { useState } from "react";
// import {
//     Box,
//     Flex,
//     Text,
//     Table,
//     Thead,
//     Tbody,
//     Tr,
//     Th,
//     Td,
//     TableContainer,
//     Badge,
//     IconButton,
//     Button,
// } from "@chakra-ui/react";
// import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
// import { useNavigate } from "react-router-dom";

// const ResignedEmployee = () => {
//     const employees = [
//         {
//             employeeNumber: "EMP001",
//             employeeName: "Rahul Kumar",
//             joiningDate: "12 Jan 2023",
//             endDate: "15 Aug 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP002",
//             employeeName: "Amit Singh",
//             joiningDate: "05 Mar 2022",
//             endDate: "20 Jul 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP003",
//             employeeName: "Priya Sharma",
//             joiningDate: "18 Jun 2024",
//             endDate: "10 Jun 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP004",
//             employeeName: "Ankit Verma",
//             joiningDate: "10 Feb 2023",
//             endDate: "05 Jun 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP005",
//             employeeName: "Neha Singh",
//             joiningDate: "15 Apr 2022",
//             endDate: "25 May 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP006",
//             employeeName: "Ravi Kumar",
//             joiningDate: "20 Jul 2023",
//             endDate: "18 May 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP007",
//             employeeName: "Pooja Sharma",
//             joiningDate: "08 Sep 2022",
//             endDate: "12 May 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP008",
//             employeeName: "Vikas Gupta",
//             joiningDate: "11 Jan 2024",
//             endDate: "30 Apr 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP009",
//             employeeName: "Sneha Roy",
//             joiningDate: "18 Mar 2023",
//             endDate: "22 Apr 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP010",
//             employeeName: "Manish Das",
//             joiningDate: "25 Jun 2022",
//             endDate: "15 Apr 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP011",
//             employeeName: "Sanjay Kumar",
//             joiningDate: "10 Aug 2023",
//             endDate: "10 Apr 2026",
//             status: "Inactive",
//         },
//         {
//             employeeNumber: "EMP012",
//             employeeName: "Kiran Singh",
//             joiningDate: "05 May 2024",
//             endDate: "01 Apr 2026",
//             status: "Inactive",
//         },
//     ];

//     // 10 records per page
//     const itemsPerPage = 10;
//     const navigate = useNavigate();
//     const [currentPage, setCurrentPage] = useState(1);

//     const totalPages = Math.ceil(employees.length / itemsPerPage);

//     const startIndex = (currentPage - 1) * itemsPerPage;

//     const currentEmployees = employees.slice(
//         startIndex,
//         startIndex + itemsPerPage
//     );

//     const handlePrevious = () => {
//         if (currentPage > 1) {
//             setCurrentPage((prev) => prev - 1);
//         }
//     };

//     const handleNext = () => {
//         if (currentPage < totalPages) {
//             setCurrentPage((prev) => prev + 1);
//         }
//     };

//     return (
//         <Box
//             w="100%"
//             minH="100vh"
//             bg="#F8F9FB"
//             pt={3}
//             fontFamily="Poppins"
//         >
//             {/* Resigned Employees Card */}
//             <Box
//                 bg="white"
//                 border="1px solid #E2E8F0"
//                 borderRadius="14px"
//                 boxShadow="sm"
//                 overflow="hidden"
//             >
//                 {/* Card Header */}

//                 <Box pt={4} pb={3}>
//                     <Flex
//                         align="center"
//                         gap={3}
//                         px={5}
//                     >
//                         {/* Go Back Button */}
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => navigate("/employee")}
//                             fontFamily="Poppins"
//                             fontSize="14px"
//                             fontWeight={500}
//                             color="#1F3661"
//                             px={2}
//                             _hover={{
//                                 bg: "#F3F5F8",
//                             }}
//                         >
//                             ← Go Back
//                         </Button>

//                         {/* Title */}
//                         <Text
//                             fontSize={{ base: "18px", md: "20px" }}
//                             fontWeight={600}
//                             color="#1F1F1F"
//                         >
//                             Resigned Employees
//                         </Text>
//                     </Flex>

//                     {/* Underline */}
//                     <Box
//                         mt={4}
//                         borderBottom="1px solid #E2E8F0"
//                     />
//                 </Box>

//                 {/* Table */}
//                 <TableContainer
//                     maxH="67vh"
//                     overflowY="auto"
//                     overflowX="auto"
//                     sx={{
//                         "&::-webkit-scrollbar": {
//                             width: "6px",
//                             height: "6px",
//                         },
//                         "&::-webkit-scrollbar-thumb": {
//                             background: "#C4C4C4",
//                             borderRadius: "10px",
//                         },
//                         "&::-webkit-scrollbar-track": {
//                             background: "#F7F8FA",
//                         },
//                     }}
//                 >
//                     <Table variant="simple">
//                         <Thead bg="#F7F8FA">
//                             <Tr>
//                                 <Th
//                                     fontFamily="Poppins"
//                                     fontSize="13px"
//                                     fontWeight={600}
//                                     color="#1F3661"
//                                     py={4}
//                                 >
//                                     Employee Number
//                                 </Th>

//                                 <Th
//                                     fontFamily="Poppins"
//                                     fontSize="13px"
//                                     fontWeight={600}
//                                     color="#1F3661"
//                                 >
//                                     Employee Name
//                                 </Th>

//                                 <Th
//                                     fontFamily="Poppins"
//                                     fontSize="13px"
//                                     fontWeight={600}
//                                     color="#1F3661"
//                                 >
//                                     Joining Date
//                                 </Th>

//                                 <Th
//                                     fontFamily="Poppins"
//                                     fontSize="13px"
//                                     fontWeight={600}
//                                     color="#1F3661"
//                                 >
//                                     End Date
//                                 </Th>

//                                 <Th
//                                     fontFamily="Poppins"
//                                     fontSize="13px"
//                                     fontWeight={600}
//                                     color="#1F3661"
//                                 >
//                                     Status
//                                 </Th>
//                             </Tr>
//                         </Thead>

//                         <Tbody>
//                             {currentEmployees.length > 0 ? (
//                                 currentEmployees.map((employee, index) => (
//                                     <Tr key={index}>
//                                         <Td
//                                             fontFamily="Poppins"
//                                             fontSize="14px"
//                                             fontWeight={500}
//                                         >
//                                             {employee.employeeNumber}
//                                         </Td>

//                                         <Td
//                                             fontFamily="Poppins"
//                                             fontSize="14px"
//                                             fontWeight={500}
//                                         >
//                                             {employee.employeeName}
//                                         </Td>

//                                         <Td
//                                             fontFamily="Poppins"
//                                             fontSize="14px"
//                                         >
//                                             {employee.joiningDate}
//                                         </Td>

//                                         <Td
//                                             fontFamily="Poppins"
//                                             fontSize="14px"
//                                         >
//                                             {employee.endDate}
//                                         </Td>

//                                         <Td>
//                                             <Badge
//                                                 px={3}
//                                                 py={1}
//                                                 borderRadius="full"
//                                                 fontFamily="Poppins"
//                                                 fontSize="12px"
//                                                 fontWeight={600}
//                                                 colorScheme="red"
//                                             >
//                                                 {employee.status}
//                                             </Badge>
//                                         </Td>
//                                     </Tr>
//                                 ))
//                             ) : (
//                                 <Tr>
//                                     <Td
//                                         colSpan={5}
//                                         textAlign="center"
//                                         py={8}
//                                     >
//                                         <Text
//                                             fontFamily="Poppins"
//                                             color="gray.500"
//                                         >
//                                             No resigned employees found
//                                         </Text>
//                                     </Td>
//                                 </Tr>
//                             )}
//                         </Tbody>
//                     </Table>
//                 </TableContainer>

//                 {/* Pagination */}
//                 {employees.length > itemsPerPage && (
//                     <Flex
//                         justify="space-between"
//                         align="center"
//                         px={5}
//                         py={3}
//                         borderTop="1px solid #E2E8F0"
//                     >
//                         {/* Page Number */}
//                         <Text
//                             fontSize="13px"
//                             fontFamily="Poppins"
//                             color="#757575"
//                         >
//                             Page {currentPage} of {totalPages}
//                         </Text>
//                         {/* Previous - Left */}
//                         <Box>
//                             <IconButton
//                                 aria-label="Previous page"
//                                 icon={<ChevronLeftIcon boxSize={6} />}
//                                 variant="ghost"
//                                 size="sm"
//                                 color="#1F3661"
//                                 isDisabled={currentPage === 1}
//                                 onClick={handlePrevious}
//                                 _hover={{
//                                     bg: "#F3F5F8",
//                                 }}
//                             />



//                             {/* Next - Right */}
//                             <IconButton
//                                 aria-label="Next page"
//                                 icon={<ChevronRightIcon boxSize={6} />}
//                                 variant="ghost"
//                                 size="sm"
//                                 color="#1F3661"
//                                 isDisabled={currentPage === totalPages}
//                                 onClick={handleNext}
//                                 _hover={{
//                                     bg: "#F3F5F8",
//                                 }}
//                             />
//                         </Box>
//                     </Flex>
//                 )}
//             </Box>
//         </Box>
//     );
// };

// export default ResignedEmployee;


import React, { useEffect, useState } from "react";

import {
    Box,
    Flex,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    IconButton,
    Button,
    Spinner,
} from "@chakra-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";

const ResignedEmployee = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [resignedCount, setResignedCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 10;

    // ================= GET RESIGNED EMPLOYEES API =================

    useEffect(() => {
        let mounted = true;

        const fetchResignedEmployees = async () => {
            try {
                setLoading(true);

                const orgId = getOrgCode();

                if (!orgId) {
                    console.log("Organization ID not found");
                    return;
                }

                const response = await api.get(
                    `/get_resigned_employee/${orgId}`
                );

                console.log(
                    "Resigned Employees Response:",
                    response?.data
                );

                if (!mounted) return;

                if (response?.data?.success) {
                    setEmployees(response?.data?.data || []);
                    setResignedCount(response?.data?.count || 0);
                } else {
                    setEmployees([]);
                    setResignedCount(0);
                }
                // if (response?.data?.success) {
                //     const allEmployees = response?.data?.data || [];

                //     // Current date (time ignored)
                //     const today = new Date();
                //     today.setHours(0, 0, 0, 0);

                //     // Filter employees whose last working date is before today
                //     const filteredEmployees = allEmployees.filter((employee) => {
                //         if (!employee.last_working) return false;

                //         const lastWorkingDate = new Date(employee.last_working);
                //         lastWorkingDate.setHours(0, 0, 0, 0);

                //         return lastWorkingDate < today;
                //     });

                //     setEmployees(filteredEmployees);
                //     setResignedCount(filteredEmployees.length);

                //     // Reset pagination     
                //     setCurrentPage(1);
                // } else {
                //     setEmployees([]);
                //     setResignedCount(0);
                // }
            } catch (error) {
                console.error(
                    "Resigned Employees API Error:",
                    error?.response?.data || error
                );

                if (mounted) {
                    setEmployees([]);
                    setResignedCount(0);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchResignedEmployees();

        return () => {
            mounted = false;
        };
    }, []);

    // ================= PAGINATION =================

    const totalPages = Math.ceil(employees.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentEmployees = employees.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    // ================= DATE FORMAT =================

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ================= UI =================

    return (
        <Box
            w="100%"
            minH="100vh"
            bg="#F8F9FB"
            pt={3}
            fontFamily="Poppins"
        >
            <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="14px"
                boxShadow="sm"
                overflow="hidden"
            >
                {/* Header */}
                <Box pt={4} pb={3}>
                    <Flex
                        align="center"
                        gap={3}
                        px={5}
                        flexWrap="wrap"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/employee")}
                            fontFamily="Poppins"
                            fontSize="14px"
                            fontWeight={500}
                            color="#1F3661"
                            px={2}
                            _hover={{
                                bg: "#F3F5F8",
                            }}
                        >
                            ← Go Back
                        </Button>

                        <Flex align="center" gap={2}>
                            <Text
                                fontSize={{ base: "18px", md: "20px" }}
                                fontWeight={600}
                                color="#1F1F1F"
                            >
                                Resigned Employees
                            </Text>

                            <Badge
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontFamily="Poppins"
                                fontSize="13px"
                                fontWeight={600}
                                colorScheme="red"
                            >
                                {loading ? (
                                    <Spinner size="xs" />
                                ) : (
                                    resignedCount
                                )}
                            </Badge>
                        </Flex>
                    </Flex>

                    <Box
                        mt={4}
                        borderBottom="1px solid #E2E8F0"
                    />
                </Box>

                {/* Employee Table */}
                <TableContainer
                    maxH="67vh"
                    overflowY="auto"
                    overflowX="auto"
                    sx={{
                        "&::-webkit-scrollbar": {
                            width: "6px",
                            height: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#C4C4C4",
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "#F7F8FA",
                        },
                    }}
                >
                    <Table variant="simple">
                        <Thead bg="#F7F8FA">
                            <Tr>
                                <Th
                                    fontFamily="Poppins"
                                    fontSize="13px"
                                    fontWeight={600}
                                    color="#1F3661"
                                    py={4}
                                >
                                    Employee Number
                                </Th>

                                <Th
                                    fontFamily="Poppins"
                                    fontSize="13px"
                                    fontWeight={600}
                                    color="#1F3661"
                                >
                                    Employee Name
                                </Th>

                                <Th
                                    fontFamily="Poppins"
                                    fontSize="13px"
                                    fontWeight={600}
                                    color="#1F3661"
                                >
                                    Joining Date
                                </Th>

                                <Th
                                    fontFamily="Poppins"
                                    fontSize="13px"
                                    fontWeight={600}
                                    color="#1F3661"
                                >
                                    Last Working Date
                                </Th>

                                <Th
                                    fontFamily="Poppins"
                                    fontSize="13px"
                                    fontWeight={600}
                                    color="#1F3661"
                                >
                                    Status
                                </Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={5} textAlign="center" py={10}>
                                        <Spinner
                                            size="lg"
                                            color="#274066"
                                        />
                                        <Text
                                            mt={2}
                                            fontSize="13px"
                                            color="gray.500"
                                            fontFamily="Poppins"
                                        >
                                            Loading employees...
                                        </Text>
                                    </Td>
                                </Tr>
                            ) : currentEmployees.length > 0 ? (
                                currentEmployees.map((employee, index) => (
                                    <Tr key={employee.employee_id || index}>
                                        <Td
                                            fontFamily="Poppins"
                                            fontSize="14px"
                                            fontWeight={500}
                                        >
                                            {employee.employee_code || "N/A"}
                                        </Td>

                                        <Td
                                            fontFamily="Poppins"
                                            fontSize="14px"
                                            fontWeight={500}
                                        >
                                            {employee.full_name || "N/A"}
                                        </Td>

                                        <Td
                                            fontFamily="Poppins"
                                            fontSize="14px"
                                        >
                                            {formatDate(employee.joining_date)}
                                        </Td>

                                        <Td
                                            fontFamily="Poppins"
                                            fontSize="14px"
                                        >
                                            {formatDate(employee.last_working)}
                                        </Td>

                                        <Td>
                                            <Badge
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                                fontFamily="Poppins"
                                                fontSize="12px"
                                                fontWeight={600}
                                                colorScheme="red"
                                            >
                                                Resigned
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td
                                        colSpan={5}
                                        textAlign="center"
                                        py={8}
                                    >
                                        <Text
                                            fontFamily="Poppins"
                                            color="gray.500"
                                        >
                                            No resigned employees found
                                        </Text>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {!loading && employees.length > itemsPerPage && (
                    <Flex
                        justify="space-between"
                        align="center"
                        px={5}
                        py={3}
                        borderTop="1px solid #E2E8F0"
                    >
                        <Text
                            fontSize="13px"
                            fontFamily="Poppins"
                            color="#757575"
                        >
                            Page {currentPage} of {totalPages}
                        </Text>

                        <Box>
                            <IconButton
                                aria-label="Previous page"
                                icon={<ChevronLeftIcon boxSize={6} />}
                                variant="ghost"
                                size="sm"
                                color="#1F3661"
                                isDisabled={currentPage === 1}
                                onClick={handlePrevious}
                                _hover={{
                                    bg: "#F3F5F8",
                                }}
                            />

                            <IconButton
                                aria-label="Next page"
                                icon={<ChevronRightIcon boxSize={6} />}
                                variant="ghost"
                                size="sm"
                                color="#1F3661"
                                isDisabled={currentPage === totalPages}
                                onClick={handleNext}
                                _hover={{
                                    bg: "#F3F5F8",
                                }}
                            />
                        </Box>
                    </Flex>
                )}
            </Box>
        </Box>
    );
};

export default ResignedEmployee;

