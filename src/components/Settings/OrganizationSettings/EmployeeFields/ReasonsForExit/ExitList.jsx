import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Center,
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
import ExitDistributionChart from "./ExitDistributionChart";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import ExitEditModal from "./ExitEditModal";

export default function ExitStatusList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [exitStatus, setExitStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedExitId, setSelectedExitId] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [exitToDelete, setExitToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    fetchExitReasons();
  }, []);

  const fetchExitReasons = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/settings/get_reason_for_exit_list`, {
        params: { org_id: getOrgCode() },
      });
      if (res?.data?.success) {
        setExitStatus(res.data.data || []);
      } else {
        setError("Failed to fetch exit reasons");
      }
    } catch (err) {
      console.error("Error fetching exit reasons:", err);
      setError("Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedExitId(item._id);
    onEditOpen();
  };

  const handleDeleteClick = (item) => {
    setExitToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!exitToDelete?._id) return;

    setDeleting(true);
    try {
      await axios.delete(`/settings/delete_reason_for_exit/${exitToDelete._id}`);

      toast({
        title: "Exit reason deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setExitToDelete(null);
      onDeleteClose();
      fetchExitReasons();
    } catch (err) {
      toast({
        title: "Failed to delete",
        description: err?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const pieChartData = exitStatus.map((item) => ({
    name: item.reason_name,
    employees: item.employee_count || 0,
  }));

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        fontFamily="Poppins"
        boxShadow="sm"
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
        mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
        w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
        ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        border="1px solid #cccccc"
        overflow="hidden"
      >
        <BreadcrumbsNav />

        <Box
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ base: "stretch", md: "center" }}
          gap={3}
          mb={4}
        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Reasons for Exit
          </Box>

          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width={{ base: "100%", md: "100px" }}
            _hover={{ bg: "blue.800" }}
            size="md"
            onClick={() => navigate("add-reason-for-exit")}
          >
            Add
          </Button>
        </Box>

        <Box
          maxH="66vh"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
        >
          {loading ? (
            <Center py={10}>
              <Spinner size="lg" />
            </Center>
          ) : error ? (
            <Center py={6}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : (
            <>
              <Box display={{ base: "block", md: "none" }}>
                {exitStatus.length === 0 ? (
                  <Box p={4} textAlign="center">
                    No records found
                  </Box>
                ) : (
                  exitStatus.map((item) => (
                    <Box
                      key={item._id}
                      p={4}
                      mb={4}
                      border="1px solid #e0e0e0"
                      borderRadius="14px"
                      boxShadow="sm"
                      bg="white"
                      position="relative"
                    >
                      <Box position="absolute" top={2} right={2}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<span>&#8226;&#8226;&#8226;</span>}
                            size="sm"
                            variant="ghost"
                            aria-label="actions"
                          />
                          <MenuList fontFamily="Poppins">
                            <MenuItem
                              icon={<EditIcon fontSize="14px" />}
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon fontSize="14px" />}
                              onClick={() => handleDeleteClick(item)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>

                      {/* <Box mt={5}>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Reasons For Exit
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {item.reason_name}
                        </Text>
                      </Box> */}
                      <Flex justify="space-between" align="center" mt={5} >
                        <Text fontSize="sm" fontWeight="600">
                          Reasons For Exit:
                        </Text>
                        <Text fontSize="sm">
                          {item.reason_name}
                        </Text>
                      </Flex>

                      {/* <Box mt={4}>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Number of employees
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {item.employee_count ?? 0}
                        </Text>
                      </Box> */}
                      <Flex justify="space-between" align="center" mt={1}>
                        <Text fontSize="sm" fontWeight="600">
                          Number of employees:
                        </Text>
                        <Text fontSize="sm">
                          {item.employee_count ?? 0}
                        </Text>
                      </Flex>
                    </Box>
                  ))
                )}
              </Box>

              <Box display={{ base: "none", md: "block" }}>
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
                      <Th>Reasons For Exit</Th>
                      <Th>Number of employees</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {exitStatus.length === 0 ? (
                      <Tr>
                        <Td colSpan={3} textAlign="center">
                          No records found
                        </Td>
                      </Tr>
                    ) : (
                      exitStatus.map((item) => (
                        <Tr key={item._id}>
                          <Td>{item.reason_name}</Td>
                          <Td>{item.employee_count ?? 0}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<span>&#8226;&#8226;&#8226;</span>}
                                size="sm"
                                variant="ghost"
                                aria-label="actions"
                              />
                              <MenuList fontFamily="Poppins">
                                <MenuItem
                                  icon={<EditIcon fontSize="14px" />}
                                  onClick={() => handleEdit(item)}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  icon={<DeleteIcon fontSize="14px" />}
                                  onClick={() => handleDeleteClick(item)}
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
              </Box>

              <ExitDistributionChart data={pieChartData} />
            </>
          )}
        </Box>
      </Box>

      {selectedExitId && (
        <ExitEditModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            setSelectedExitId(null);
          }}
          exitId={selectedExitId}
          onUpdated={fetchExitReasons}
        />
      )}

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400">
          <AlertDialogContent fontFamily="Poppins">
            <AlertDialogHeader fontWeight="600">
              Delete Exit Reason
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this exit reason?
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
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
