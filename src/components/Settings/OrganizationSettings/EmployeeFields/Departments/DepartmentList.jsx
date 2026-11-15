import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Text,
  Center,
  Alert,
  AlertIcon,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { getOrgCode } from "../../../../../utils/token";
import api from "../../../../../api/axios";
import DepartmentEditModal from "./DepartmentEditModal";

export default function DepartmentsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // state for edit modal
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // state for delete confirmation dialog
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      const org = orgId;

      const url = `/settings/get_company_departments?org_id=${encodeURIComponent(
        org
      )}`;

      const res = await api.get(url);
      const data = res?.data?.data || [];

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch departments", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load departments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    fetchDepartments();
  }, []);

  // open edit modal
  const handleEdit = (dep) => {
    setSelectedDepartmentId(dep._id);
    onEditOpen();
  };

  // open delete confirmation
  const handleDeleteClick = (dep) => {
    setDepartmentToDelete(dep);
    onDeleteOpen();
  };

  // confirm delete
  const handleConfirmDelete = async () => {
    if (!departmentToDelete?._id) return;

    setDeleting(true);
    try {
      const url = `/organization/delete_department/${departmentToDelete._id}`;
      await api.delete(url);

      toast({
        title: "Department deleted",
        description: `Department "${departmentToDelete.department_name}" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setDepartmentToDelete(null);
      onDeleteClose();
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department", err);
      toast({
        title: "Failed to delete department",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDepartmentToDelete(null);
    onDeleteClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        // p={6}
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
        mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
        w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
        ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        boxShadow="sm"
        // w={"100%"}
        // mt={3}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
        // h="90vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        <BreadcrumbsNav />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}

        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Departments
          </Box>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            _hover={{ bg: "blue.800" }}
            size="md"
            width={"100px"}
            onClick={() => navigate("add")}
          >
            Add
          </Button>
        </Box>

        {loading ? (
          <Center py={10}>
            <Spinner size="lg" />
            <Text ml={3}>Loading departments...</Text>
          </Center>
        ) : error ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <>
            <Box display={{ base: 'block', md: 'none' }}>
              {departments.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Text>No departments found.</Text>
                </Box>
              ) : (
                departments.map((dep) => (
                  <Box
                    key={dep._id}
                    p={4}
                    mb={4}
                    border="1px solid #e0e0e0"
                    borderRadius="14px"
                    boxShadow="sm"
                    bg="white"
                    position="relative"
                  >
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<span>•••</span>}
                        size="sm"
                        variant="ghost"
                        aria-label="actions"
                        position="absolute"
                        top={2}
                        right={2}
                      />
                      <MenuList fontFamily={"Poppins"}>
                        <MenuItem
                          icon={<EditIcon fontSize="14px" />}
                          onClick={() => handleEdit(dep)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon fontSize="14px" />}
                          onClick={() => handleDeleteClick(dep)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    {/* <Text fontWeight="600" mb={2}>
                      {dep.department_name}
                    </Text> */}
                    <Flex justify="space-between" align="center" mt={5} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Department Name:
                      </Text>
                      <Text fontSize="sm">
                        {dep.department_name}
                      </Text>
                    </Flex>
                    {/* <Text fontSize="sm" mb={1}>
                      <Text as="span" fontWeight="600">Mail:&nbsp;</Text>
                      {dep.email || "-"}
                    </Text> */}
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Email:
                      </Text>
                      <Text fontSize="sm">
                        {dep.email}
                      </Text>
                    </Flex>
                    {/* <Text fontSize="sm" mb={1}>
                      <Text as="span" fontWeight="600">Head of the department:&nbsp;</Text>
                      {dep.head_of_department || "-"}
                    </Text> */}
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Head of Department:
                      </Text>
                      <Text fontSize="sm">
                        {dep.head_of_department || "-"}
                      </Text>
                    </Flex>
                    {/* <Text fontSize="sm" mb={1}>
                      <Text as="span" fontWeight="600">Number of employees:&nbsp;</Text>
                      {typeof dep.employee_count === "number" ? dep.employee_count : 0}
                    </Text> */}
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Number of employees
                      </Text>
                      <Text fontSize="sm">
                        {typeof dep.employee_count === "number" ? dep.employee_count : 0}
                      </Text>
                    </Flex>
                  </Box>
                ))
              )}
            </Box>

            <TableContainer display={{ base: 'none', md: 'block' }} h="100%" overflowY="auto"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "0px",
                },
                scrollbarWidth: "none",
                "-ms-overflow-style": "none",
              }}
            >
              <Table variant="simple">
                <Thead
                  sx={{
                    th: {
                      fontSize: "14px",
                      textTransform: "none",
                      fontWeight: "600",
                      fontFamily: "'Poppins', sans-serif",
                      color: "#000000",
                    },
                  }}
                >
                  <Tr>
                    <Th>Department name</Th>
                    <Th>Mail</Th>
                    <Th>Head of the department</Th>
                    <Th>Number of employees</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {departments.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}>
                        <Text textAlign="center" py={4}>
                          No departments found.
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    departments.map((dep) => (
                      <Tr key={dep._id}>
                        <Td>{dep.department_name}</Td>
                        <Td>{dep.email || "-"}</Td>
                        <Td>{dep.head_of_department || "-"}</Td>
                        <Td>
                          {typeof dep.employee_count === "number"
                            ? dep.employee_count
                            : 0}
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              size="sm"
                              variant="ghost"
                              aria-label="actions"
                              icon={<span>•••</span>}
                            />
                            <MenuList fontFamily={"Poppins"}>
                              <MenuItem
                                icon={<EditIcon fontSize="14px" />}
                                onClick={() => handleEdit(dep)}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                icon={<DeleteIcon fontSize="14px" />}
                                onClick={() => handleDeleteClick(dep)}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Edit Modal */}
      <DepartmentEditModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedDepartmentId(null);
        }}
        departmentId={selectedDepartmentId}
        onUpdated={fetchDepartments} // refresh list after update
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelDelete}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(2px)">
          <AlertDialogContent
            borderRadius="md"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            fontFamily={"Poppins"}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="600">
              Delete Department
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the department "${departmentToDelete?.department_name || ""
                }" ?`}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={handleCancelDelete}
                variant="outline"
                size="sm"
                border={"1px solid #cccccc"}
              >
                Cancel
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
