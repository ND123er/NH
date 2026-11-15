import React, { useEffect, useState } from "react";
import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Checkbox,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    RadioGroup,
    Stack,
    Radio,
    ModalFooter,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../api/axios";
import { getOrgIdFromReduxOrStorage } from "../../../utils/token";

const EmployeecheckInCheckOutSettings = () => {

    const [employeeData, setEmployeeData] = useState([]);
    const { user, token, loading } = useSelector((state) => state.auth);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [status, setStatus] = useState("1");
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        getEmployeeData();
    }, []);
    const getEmployeeData = async (q = "") => {
        const s = encodeURIComponent((q || "").trim());
        const orgId = getOrgIdFromReduxOrStorage(user);
        const baseUrl = `/employee/get_employees_list?org_id=${orgId}&search=${s}`
        const res = await api.get(
            baseUrl,);
        // setEmployeeData(res?.data?.data || []);
        // const filteredData = (res?.data?.data || []).filter(
        //     (emp) => emp.punch_deleted === true || emp.employee_punch === "not updated"
        // );
        const filteredData = (res?.data?.data || []).filter(
            (emp) =>
                emp.punch_deleted === false ||
                emp.punch_deleted === "not updated"
        );

        setEmployeeData(filteredData);

    }
    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        if (employee?.punch_deleted === "not updated") {
            setStatus("");
        } else {
            setStatus(Number(employee.employee_punch) === 2 ? "2" : "1");
        }

        // setStatus(Number(employee.employee_punch) === 2 ? "2" : "1"); // map to 1 or 2
        onOpen();
    };

    const handleDelete = async (employeeId) => {
        try {
            const orgId = getOrgIdFromReduxOrStorage(user);
            const url = `/settings/delete_employee_punch?employee_id=${employeeId?.employee_id}&organisation_id=${orgId}`;
            const res = await api.delete(url);

            // Log the full response
            toast({
                title: "Employee check-in / Check-out",
                description: `Employee check-in / Check-out "${employeeId?.full_name}" has been deleted.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            await getEmployeeData();
        } catch (err) {
            console.error("Failed to delete band", err);
            toast({
                title: "Failed to delete band",
                description:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };
    const handleUpdateStatus = async () => {
        if (!status) {
            toast({
                title: "Please select status",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        try {
            const orgId = getOrgIdFromReduxOrStorage(user);
            const payload = {
                employee_id: selectedEmployee.employee_id,
                organisation_id: orgId,
                status: Number(status),
            };
            const res = await api.post("/settings/allow_employee_punch", payload);

            toast({
                title: "Status updated",
                description: `${selectedEmployee.full_name} is now ${status === "1" ? "Active" : "Inactive"}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await getEmployeeData();
            onClose();
        } catch (err) {
            console.error("Failed to update status:", err);
            toast({
                title: "Error",
                description: err?.response?.data?.message || err?.message || "Something went wrong",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };
    const isNotUpdated = selectedEmployee?.punch_deleted === "not updated";

    return (
        <Box p={0} bg="#f5f6f8" minH="100vh" pt={0} pl={0} mt={3}>

            <Box mb={4}>
                <BreadcrumbsNav
                    extraSegments={[
                        "employee-check-in-check-out",
                    ]}
                />
            </Box>

            {/* White Card (Table Container) */}
            <Box bg="white" borderRadius="8px" boxShadow="sm" p={0} h="76vh"
          
                overflowY="auto"
                sx={{
                    "&::-webkit-scrollbar": {
                        width: "0px",
                    },
                }}>
                <Heading fontSize={'18px'} fontWeight={'700'} p={6} pb={0} pl={4} fontFamily='poppins'>
                    Employee check-in / Check-out
                </Heading>
                <Box
                    my={5}
                    // bgImage="repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1"
                    h="1.5px"
                    bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
                />
                <Table size="sm">

                    {/* Header – NO background */}
                    <Thead>
                        <Tr>
                            {/* <Th w="40px">
                                <Checkbox />
                            </Th> */}
                            <Th textTransform="none" color={'#000000'} fontSize={'14px'} fontWeight={'600'} fontFamily='poppins'>Employee Name</Th>
                            <Th textTransform="none" color={'#000000'} fontSize={'14px'} fontWeight={'600'} fontFamily='poppins'>Web check-in / check-out</Th>
                            <Th textTransform="none" color={'#000000'} fontSize={'14px'} fontWeight={'600'} textAlign={'center'} fontFamily='poppins'>Action</Th>
                        </Tr>
                    </Thead>
                    {/* Zebra Rows */}
                    <Tbody>
                        {employeeData?.map((item, index) => (
                            <Tr
                                key={item.employee_id}
                                bg={index % 2 === 0 ? "gray.100" : "white"}
                                _hover={{ bg: "gray.200" }}
                            >
                                {/* <Td>
                                    <Checkbox />
                                </Td> */}
                                <Td fontFamily='poppins'>{item?.full_name}</Td>
                                {
                                    item?.punch_deleted === "not updated" ? <Td fontFamily='poppins'>Not Updated</Td> : <Td fontFamily='poppins'>{Number(item?.employee_punch) === 2 ? "Inactive" : "Active"}</Td>
                                }
                                {/* <Td>{Number(item?.employee_punch) === 2 ? "Inactive" : "Active"}</Td> */}

                                <Td textAlign={'center'}>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<BsThreeDots />}
                                            variant="ghost"
                                            size="sm"
                                        />
                                        <MenuList fontFamily='poppins'>
                                            <MenuItem onClick={() => handleEdit(item)}>Edit</MenuItem>
                                            {/* <MenuItem color="red.500" fontFamily='poppins' onClick={() => handleDelete(item)}>Delete</MenuItem> */}
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>

                </Table>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontFamily='poppins'>Edit Employee Status</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <RadioGroup onChange={setStatus} value={status}
                        >
                            <Stack direction="column" fontFamily='poppins'>
                                <Radio sx={{
                                    "input:checked + &": {
                                        bg: "#274167",
                                        borderColor: "#274167",
                                        color: "white",
                                    },
                                }} value="1" >Active</Radio>
                                <Radio sx={{
                                    "input:checked + &": {
                                        bg: "#274167",
                                        borderColor: "#274167",
                                        color: "white",
                                    },
                                }} value="2">Inactive</Radio>
                            </Stack>
                        </RadioGroup>

                    </ModalBody>
                    <ModalFooter>
                        <Button bg={'#274167'} color={"#fff"} mr={3} onClick={handleUpdateStatus} fontFamily='poppins'
                        >
                            Save
                        </Button>
                        <Button fontFamily='poppins' onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default EmployeecheckInCheckOutSettings;
