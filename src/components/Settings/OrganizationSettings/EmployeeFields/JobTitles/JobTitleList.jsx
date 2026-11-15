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
  Center,
  Alert,
  AlertIcon,
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
import { getOrgCode } from "../../../../../utils/token";
import api from "../../../../../api/axios";
import JobTitleEditModal from "./JobTitleEditModal";

export default function JobTitleStatusList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  // Delete confirmation dialog state
  const [jobTitleToDelete, setJobTitleToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchJobTitles = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      const org = orgId;

      const url = `/settings/get_job_titles?org_id=${encodeURIComponent(org)}`;
      const res = await api.get(url);
      const data = res?.data?.data || [];
      setJobTitles(data);
    } catch (err) {
      console.error("Failed to fetch job titles", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load job titles"
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
    fetchJobTitles();

  }, []);

  const handleOpenEdit = (jobTitle) => {
    setSelectedJobTitle(jobTitle);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedJobTitle(null);
    onEditClose();
  };

  // Open delete confirmation
  const handleDeleteClick = (jobTitle) => {
    setJobTitleToDelete(jobTitle);
    onDeleteOpen();
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!jobTitleToDelete?._id) return;

    setDeleting(true);
    try {
      const url = `/organization/delete_position/${jobTitleToDelete._id}`;
      await api.delete(url);

      toast({
        title: "Designation deleted",
        description: `Designation "${jobTitleToDelete.position_name}" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setJobTitleToDelete(null);
      onDeleteClose();
      await fetchJobTitles();
    } catch (err) {
      console.error("Failed to delete designation", err);
      toast({
        title: "Failed to delete designation",
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
    setJobTitleToDelete(null);
    onDeleteClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        fontFamily={"Poppins"}
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
            Designation
          </Box>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width={"100px"}
            _hover={{ bg: "blue.800" }}
            size="md"
            onClick={() => navigate("add-designation")}
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
            ) : jobTitles.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontFamily="poppins">No job titles found.</Text>
              </Box>
            ) : (
              jobTitles.map((j) => (
                <Box
                  key={j._id}
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
                        onClick={() => handleOpenEdit(j)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon fontSize="14px" />}
                        onClick={() => handleDeleteClick(j)}
                        isDisabled={
                          deleting && jobTitleToDelete?._id === j._id
                        }
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  {/* <Text fontWeight="600" mb={2}>
                    {j.position_name}
                  </Text> */}
                  <Flex justify="space-between" align="center" mt={5} mb={1}>
                    <Text fontSize="sm" fontWeight="600">
                      Designation name:
                    </Text>
                    <Text fontSize="sm">
                      {j.position_name}
                    </Text>
                  </Flex>
                  {/* <Text fontSize="sm" mb={1}>
                    <Text as="span" fontWeight="600">Number of employees:&nbsp;</Text>
                    {typeof j.employee_count === "number" ? j.employee_count : 0}
                  </Text> */}
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="sm" fontWeight="600">
                      Number of employees:
                    </Text>
                    <Text fontSize="sm">
                      {typeof j.employee_count === "number" ? j.employee_count : 0}
                    </Text>
                  </Flex>
                  {/* Number of employees */}
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
                  <Th>Designation name</Th>
                  <Th>Number of employees</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Spinner />
                    </Td>
                  </Tr>
                ) : error ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Text color="red.500">{error}</Text>
                    </Td>
                  </Tr>
                ) : jobTitles.length === 0 ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Text textAlign="center" py={4}>
                        No job titles found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  jobTitles.map((j) => (
                    <Tr key={j._id}>
                      <Td>{j.position_name}</Td>
                      <Td>
                        {typeof j.employee_count === "number"
                          ? j.employee_count
                          : 0}
                      </Td>
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
                              onClick={() => handleOpenEdit(j)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon fontSize="14px" />}
                              onClick={() => handleDeleteClick(j)}
                              isDisabled={
                                deleting && jobTitleToDelete?._id === j._id
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

      {/* Edit Modal */}
      {selectedJobTitle && (
        <JobTitleEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          jobTitle={selectedJobTitle}
          onUpdated={fetchJobTitles}
        />
      )}

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
              Delete Designation
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the designation "${jobTitleToDelete?.position_name || ""
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
