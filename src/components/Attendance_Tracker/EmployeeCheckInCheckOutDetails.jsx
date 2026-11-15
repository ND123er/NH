import React, { useState } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    IconButton,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
    Tag,
    HStack,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Image,
    Stack,
    Input,
    Divider,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Box as ChakraBox,
    Icon,
    MenuDivider,
    Checkbox,
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import { BiCalendar } from "react-icons/bi";
import FilterDropdownLeave from "../Leave_Tracker/Filters/FilterDropdownLeave";
import SortDropdownLeave from "../Leave_Tracker/Filters/SortDropdownLeave";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineCheckCircle, AiOutlineDelete, AiOutlineFile } from "react-icons/ai";
import { FaFileExcel } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import DeleteTeamAttendance from "./DeleteTeamAttendance";
import { useNavigate } from "react-router-dom";
import deleteBtn from '../../assets/deletebtn.png'

const dummyData = [
    {
        date: "20-08-2025",
        status: "Present",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Late",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    {
        date: "20-08-2025",
        status: "Absent",
        clockIn: "09:30 AM",
        clockOut: "06:30 PM",
        breakTime: 0,
        totalHours: 8,
    },
    // Add more entries as needed
];

const EmployeeCheckInCheckOutDetils = ({ onViewAdmin }) => {
    const [rows] = useState(dummyData);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);

    const navigate = useNavigate();

    // date default display and ISO helpers
    const todayISO = (() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    })();
    const [fromDate, setFromDate] = useState(todayISO);
    const [toDate, setToDate] = useState(todayISO);

    const openFor = (row) => {
        setSelected(row);
        onOpen();
    };

    const filtered = rows.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            String(r.fullName).toLowerCase().includes(s) ||
            String(r.employeeId).toLowerCase().includes(s) ||
            String(r.leaveType).toLowerCase().includes(s)
        );
    });

    return (
        <Box
            bg="white"
            borderRadius={"10px"}
            shadow="sm"
            fontFamily={"Poppins"}
            border={"1px solid #c4c4c4"}
            pb={2}
            mb={5}
        >
            {/* Header */}
            <Box py={0} pb={2} bg="transparent">
                <Flex justify="space-between" align="center" gap={3} wrap="wrap" m={3}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800" ml={4}>
                        David Scotland
                    </Text>

                    <Flex align="center" gap={3}>
                        <Flex align="center" gap={3}>
                            {/* Search input */}
                            {/* <img src={deleteBtn} width={'120px'}/> */}
                            <Box
                                border="2px solid #cccccc"
                                borderRadius="5px"
                                p={1}
                                h={8}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                cursor="pointer"
                                _hover={{ opacity: 0.8, transform: "scale(1.05)" }}
                            >
                                <Icon as={BiCalendar} w={5} h={5} color="#cccccc" />

                                <Text fontSize={15} color={'#cccccc'}>
                                    {fromDate
                                        ? (() => {
                                            const d = new Date(fromDate);
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const year = d.getFullYear();
                                            return `${day}-${month}-${year}`;
                                        })()
                                        : 'DD-MM-YYYY'}
                                </Text>

                            </Box>


                            <InputGroup
                                size="sm"
                                w="130px"
                                border="1px solid #cccccc"
                                borderRadius={"5px"}
                            >
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    borderRadius={"5px"}
                                />
                            </InputGroup>

                            {/* Filter button */}
                            <Box border="1px solid #cccccc" borderRadius={"5px"}>
                                <FilterDropdownLeave />
                            </Box>

                            {/* Sort button */}

                            <Menu>
                                <MenuList minW="260px" p={3}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={1}>
                                                From
                                            </Text>
                                            <InputGroup size="sm">
                                                <InputLeftElement pointerEvents="none">
                                                    <IoMdCalendar style={{ opacity: 0.8 }} />
                                                </InputLeftElement>
                                                <Input
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Box>

                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={1}>
                                                To
                                            </Text>
                                            <InputGroup size="sm">
                                                <InputLeftElement pointerEvents="none">
                                                    <IoMdCalendar style={{ opacity: 0.8 }} />
                                                </InputLeftElement>
                                                <Input
                                                    type="date"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Box>

                                        <Flex gap={2} justify="flex-end" pt={2}>
                                            <Button size="sm" variant="ghost">
                                                Clear
                                            </Button>
                                            <Button
                                                size="sm"
                                                _hover={{ bg: "blue.800", color: "white" }}
                                                border={"1px solid #1A365D"}
                                                bg={"#1A365D"}
                                                color="white"
                                            >
                                                Apply
                                            </Button>
                                        </Flex>
                                    </Stack>
                                </MenuList>
                            </Menu>

                            {/* More menu */}
                            <ChakraBox
                                border="1px solid #cccccc"
                                borderRadius="8px"
                                overflow="hidden"
                            >
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        size="sm"
                                        bg="white"
                                        borderRadius="8px"
                                        border="1px solid #cccccc"
                                        px={3}
                                        py={2}
                                    >
                                        <Flex align="center" justify="center" w="100%">
                                            <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                                        </Flex>
                                    </MenuButton>

                                    <MenuList
                                        minW="220px"
                                        borderRadius="8px"
                                        boxShadow="lg"
                                        py={0}
                                    >
                                        <MenuItem px={4} py={3}>
                                            <HStack spacing={3}>
                                                <ChakraBox
                                                    borderRadius="md"
                                                    p={2}
                                                    bg="gray.50"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    minW="36px"
                                                    minH="36px"
                                                >
                                                    <Icon
                                                        as={AiOutlineFile}
                                                        boxSize={5}
                                                        color="gray.700"
                                                    />
                                                </ChakraBox>
                                                <ChakraBox>
                                                    <Text fontSize="sm" fontWeight={600}>
                                                        Export as .csv
                                                    </Text>
                                                </ChakraBox>
                                            </HStack>
                                        </MenuItem>

                                        <MenuDivider />

                                        <MenuItem px={4} py={3}>
                                            <HStack spacing={3} align="center" w="100%">
                                                <ChakraBox
                                                    borderRadius="md"
                                                    p={2}
                                                    bg="gray.50"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    minW="36px"
                                                    minH="36px"
                                                >
                                                    <Icon
                                                        as={FaFileExcel}
                                                        boxSize={5}
                                                        color="green.600"
                                                    />
                                                </ChakraBox>

                                                <ChakraBox flex="1">
                                                    <Text fontSize="sm" fontWeight={600} color="gray.800">
                                                        Export as .xls
                                                    </Text>
                                                </ChakraBox>

                                                <Icon
                                                    as={AiOutlineCheckCircle}
                                                    boxSize={5}
                                                    color="green.500"
                                                />
                                            </HStack>
                                        </MenuItem>

                                        <MenuDivider />

                                        <MenuItem px={4} py={3}>
                                            <HStack spacing={3}>
                                                <ChakraBox
                                                    borderRadius="md"
                                                    p={2}
                                                    bg="gray.50"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    minW="36px"
                                                    minH="36px"
                                                >
                                                    <Icon as={FiUpload} boxSize={5} color="gray.700" />
                                                </ChakraBox>
                                                <ChakraBox>
                                                    <Text fontSize="sm" fontWeight={600}>
                                                        Import
                                                    </Text>
                                                </ChakraBox>
                                            </HStack>
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </ChakraBox>
                        </Flex>
                    </Flex>
                </Flex>
            </Box>

            <Box
                w="100%"
                //         bgImage={`repeating-linear-gradient(
                //   to right,
                //   #C7C7C7 0,
                //   #C7C7C7 4px,
                //   transparent 3px,
                //   transparent 8px
                // )`}
                h="2px"
                bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
                mb={4}
            />

            <Box p={0}>
                <Table
                    variant="simple"
                    size="sm"
                    sx={{
                        "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
                        "& tbody tr:nth-of-type(even) td": { background: "white" },
                        "& td, & th": {
                            border: "none !important", pl: 6,
                            pr: 6,
                        },
                        "& thead th": {
                            paddingBottom: "14px", pl: 6,
                            pr: 6,
                        },
                        "& tbody tr:first-of-type td": {
                            paddingTop: "12px", pl: 6,
                            pr: 6,
                        },
                    }}
                >
                    <Thead
                        sx={{
                            th: {
                                fontSize: "12px",
                                textTransform: "none",
                                fontWeight: "600",
                                fontFamily: "'Poppins', sans-serif",
                                color: "#000000",
                            },
                        }}
                    >
                        <Tr>
                            <Th>
                                <Checkbox
                                    isChecked={selectedRows.length === rows.length && rows.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(rows.map((_, i) => i)); // select all
                                        } else {
                                            setSelectedRows([]); // unselect all
                                        }
                                    }}
                                    sx={{
                                        ".chakra-checkbox__control": {
                                            w: "20px",
                                            h: "20px",
                                            borderRadius: "4px",
                                            border: "1px solid #cccccc",
                                        },
                                        ".chakra-checkbox__control[data-checked]": {
                                            bg: "#274066",
                                            borderColor: "#274066",
                                            color: "white",
                                        },
                                    }}
                                />

                            </Th>
                            <Th>Date</Th>
                            <Th>Attendance Status</Th>
                            <Th>Clock-in</Th>
                            <Th>Clock-out</Th>
                            <Th>Break-time</Th>
                            <Th>Total Hours Worked</Th>
                        </Tr>
                    </Thead>


                    <Tbody>
                        {rows.map((r, index) => (
                            <Tr key={index}>
                                <Td>

                                    <Checkbox
                                        isChecked={selectedRows.includes(index)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRows([...selectedRows, index]);
                                            } else {
                                                setSelectedRows(selectedRows.filter((i) => i !== index));
                                            }
                                        }}
                                        sx={{
                                            ".chakra-checkbox__control": {
                                                w: "20px",
                                                h: "20px",
                                                borderRadius: "4px",
                                                border: "1px solid #cccccc",
                                            },
                                            ".chakra-checkbox__control[data-checked]": {
                                                bg: "#274066",
                                                borderColor: "#274066",
                                                color: "white",
                                            },
                                        }}
                                    />

                                </Td>
                                <Td>{r.date}</Td>
                                <Td>{r.status}</Td>
                                <Td>{r.clockIn}</Td>
                                <Td>{r.clockOut}</Td>
                                <Td>{r.breakTime}</Td>
                                <Td>{r.totalHours}</Td>

                            </Tr>
                        ))}
                    </Tbody>

                </Table>

                {/* if no rows */}
                {filtered.length === 0 && (
                    <VStack py={8}>
                        <Text>No Attendance found</Text>
                    </VStack>
                )}
            </Box>

            {/* Modal for details */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent borderRadius="16px">
                    <ModalHeader>
                        <Text fontSize="lg" fontWeight={700}>
                            {selected?.fullName}
                        </Text>
                        <Divider />
                        <Text fontSize="sm" color="gray.500">
                            {selected?.employeeId}
                        </Text>
                        <Divider />
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <Box>
                                <Text fontSize="sm" mb={1} color="gray.600">
                                    {selected?.leaveType}
                                </Text>
                                <Divider />
                                <Flex gap={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">
                                            From*
                                        </Text>
                                        <Text fontWeight={600}>{selected?.from}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">
                                            To*
                                        </Text>
                                        <Text fontWeight={600}>{selected?.to}</Text>
                                    </Box>
                                </Flex>
                            </Box>
                            <Divider />
                            <Box>
                                <Text fontSize="xs" color="gray.500">
                                    No. of days :
                                </Text>
                                <Text fontWeight={600}>{selected?.days}</Text>
                            </Box>

                            <Divider />

                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                    Reason
                                </Text>
                                <Text>{selected?.reason}</Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={2}>
                                    Uploaded document
                                </Text>
                                <Box
                                    border="1px dashed #d1d5db"
                                    borderRadius="8px"
                                    p={6}
                                    textAlign="center"
                                >
                                    <Image
                                        src={selected?.document || undefined}
                                        alt="uploaded"
                                        fallbackSrc="https://via.placeholder.com/200x120?text=uploaded+document"
                                        mx="auto"
                                        maxH="120px"
                                        objectFit="contain"
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            w={{ base: "100%", md: "auto" }}
                            borderRadius="md"
                            bg="#274167"
                            color="white"
                            _hover={{ bg: "#1f3143" }}
                            fontFamily={"Poppins"}
                            fontWeight={"500"}
                        >
                            Approve
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
export default EmployeeCheckInCheckOutDetils;
