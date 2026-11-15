// DivisionList.jsx
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
  Spinner,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import DivisionEditModal from "./DivisionEditModal";

export default function DivisionList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit modal
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // delete dialog
  const [divisionToDelete, setDivisionToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchDivisions = async () => {
    setLoading(true);
    setError(null);
    try {
      const org =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      const url = `/settings/get_company_divisions?org_id=${encodeURIComponent(
        org || ""
      )}`;
      const res = await api.get(url);

      // try multiple places for array response
      const data = res?.data?.data || res?.data?.divisions || res?.data || [];
      // if API returns single object, convert to array
      const arr = Array.isArray(data) ? data : [data];
      setDivisions(arr);
    } catch (err) {
      console.error("Failed to fetch divisions", err);
      setError(
        err?.response?.data?.msg ||
        err?.msg ||
        "Failed to load divisions"
      );
      setDivisions([]);
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
    fetchDivisions();
  }, []);

  const handleOpenEdit = (div) => {
    setSelectedDivisionId(div._id);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedDivisionId(null);
    onEditClose();
  };

  const handleDeleteClick = (div) => {
    setDivisionToDelete(div);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!divisionToDelete?._id) return;
    setDeleting(true);
    try {
      const url = `/organization/delete_division/${divisionToDelete._id}`;
      await api.delete(url);

      toast({
        title: "Division deleted",
        description: `Division "${divisionToDelete.division_name || ""
          }" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setDivisionToDelete(null);
      onDeleteClose();
      await fetchDivisions();
    } catch (err) {
      console.error("Failed to delete division", err);
      toast({
        title: "Failed to delete division",
        description:
          err?.response?.data?.msg ||
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
    setDivisionToDelete(null);
    onDeleteClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        // p={6}
        boxShadow="sm"
        // w={"100%"}
        // mt={3}
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
        mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
        w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
        ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
        display="flex"
        flexDirection="column"
      >
        <BreadcrumbsNav />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          flexShrink={0}
        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Divisions
          </Box>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width={"100px"}
            _hover={{ bg: "blue.800" }}
            size="md"
            onClick={() => navigate("add-division")}
          >
            Add
          </Button>
        </Box>

        <Box flex="1" overflowY="auto" sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
        }}>
          {/* Mobile Card View */}
          <Box display={{ base: 'block', md: 'none' }}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" />
              </Box>
            ) : error ? (
              <Box p={4} bg="red.50" borderRadius="md">
                <Text color="red.500">{error}</Text>
              </Box>
            ) : divisions.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontFamily="poppins">No divisions available</Text>
              </Box>
            ) : (
              divisions.map((d) => (
                <Box
                  key={d._id || d.division_code || Math.random()}
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
                        onClick={() => handleOpenEdit(d)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon fontSize="14px" />}
                        onClick={() => handleDeleteClick(d)}
                        isDisabled={
                          deleting && divisionToDelete?._id === d._id
                        }
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  {/* <Text fontWeight="600" mb={2}>
                    {d.division_name}
                  </Text> */}
                  <Flex justify="space-between" align="center" mt={5} mb={1}>
                    <Text fontSize="sm" fontWeight="600">
                      Division Name:
                    </Text>
                    <Text fontSize="sm">
                      {d.division_name}
                    </Text>
                  </Flex>
                  {/* <Text fontSize="sm" mb={1}>
                    <Text as="span" fontWeight="600">Email:&nbsp;</Text>
                    {d.email || "-"}
                  </Text> */}
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="sm" fontWeight="600">
                      Email:
                    </Text>
                    <Text fontSize="sm">
                      {d.email || "-"}
                    </Text>
                  </Flex>

                  {/* <Text fontSize="sm" mb={1}>
                    <Text as="span" fontWeight="600">Number of employees:&nbsp;</Text>
                    {d.employee_count ?? d.employeeCount ?? 0}
                  </Text> */}
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="sm" fontWeight="600">
                      Number of employees:
                    </Text>
                    <Text fontSize="sm">
                      {d.employee_count ?? d.employeeCount ?? 0}
                    </Text>
                  </Flex>
                </Box>
              ))
            )}
          </Box>

          {/* Desktop Table View */}
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
                  <Th>Division Name</Th>
                  <Th>Email</Th>
                  <Th>Number of employees</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Spinner />
                    </Td>
                  </Tr>
                ) : error ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Text color="red.500"
                      textAlign="center"
                      >{error}</Text>
                    </Td>
                  </Tr>
                ) : divisions.length === 0 ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Text
                      textAlign="center"
                      >No divisions available</Text>
                    </Td>
                  </Tr>
                ) : (
                  divisions.map((d) => (
                    <Tr key={d._id || d.division_code || Math.random()}>
                      <Td 
                      >{d.division_name}</Td>
                      <Td>{d.email || "-"}</Td>
                      <Td>{d.employee_count ?? d.employeeCount ?? 0}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<span>•••</span>}
                            size="sm"
                            variant="ghost"
                            aria-label="actions"
                          />
                          <MenuList fontFamily={"Poppins"}>
                            <MenuItem
                              icon={<EditIcon fontSize="14px" />}
                              onClick={() => handleOpenEdit(d)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon fontSize="14px" />}
                              onClick={() => handleDeleteClick(d)}
                              isDisabled={
                                deleting && divisionToDelete?._id === d._id
                              }
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
        </Box>
      </Box>

      {/* Edit modal */}
      {selectedDivisionId && (
        <DivisionEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          divisionId={selectedDivisionId}
          onUpdated={fetchDivisions}
        />
      )}

      {/* Delete confirmation */}
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
              Delete Division
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the division "${divisionToDelete?.division_name || ""
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
