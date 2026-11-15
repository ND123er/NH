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
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { getOrgCode } from "../../../../../utils/token";
import api from "../../../../../api/axios";
import QualificationEditModal from "./QualificationEditModal";

export default function QualificationList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQualificationId, setSelectedQualificationId] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [qualificationToDelete, setQualificationToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchQualifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const org =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      const url = `/settings/get_qualifications?org_id=${encodeURIComponent(
        org,
      )}`;
      const res = await api.get(url);
      const data = res?.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch qualifications", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load qualifications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchQualifications();
  }, []);

  const handleEdit = (q) => {
    setSelectedQualificationId(q._id || q.id);
    onEditOpen();
  };

  const handleDeleteClick = (q) => {
    setQualificationToDelete(q);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!qualificationToDelete?._id && !qualificationToDelete?.id) return;

    const id = qualificationToDelete._id || qualificationToDelete.id;

    setDeleting(true);
    try {
      const url = `/settings/delete_qualification/${id}`;
      await api.delete(url);

      toast({
        title: "Qualification deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setQualificationToDelete(null);
      onDeleteClose();
      await fetchQualifications();
    } catch (err) {
      console.error("Failed to delete qualification", err);
      toast({
        title: "Failed to delete qualification",
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
      >
        <BreadcrumbsNav />
        <Box borderRadius={"10px"} border={"1px solid #e0e0e0"} p={{ base: 2, sm: 2, md: 3, lg: 8 }} h={{ base: "68vh", sm: "72vh", md: "68vh", lg: "72vh" }}
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
              Qualification
            </Box>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width={"100px"}
              _hover={{ bg: "blue.800" }}
              size="md"
              onClick={() => navigate("add-qualification")}
            >
              Add
            </Button>
          </Box>

          {loading ? (
            <Center py={8}>
              <Spinner />
              <Text ml={3}>Loading qualifications...</Text>
            </Center>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : (
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
                  <Th>Qualification Type</Th>
                  <Th>Number of employees</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.length === 0 ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Text textAlign="center" py={4}>
                        No qualifications found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  items.map((q) => (
                    <Tr key={q._id || q.id}>
                      <Td>{q.name || q.qualification_name || "-"}</Td>
                      <Td>
                        {typeof q.employee_count === "number"
                          ? q.employee_count
                          : q.employee_count || 0}
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
                              onClick={() => handleEdit(q)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon fontSize="14px" />}
                              onClick={() => handleDeleteClick(q)}
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
          )}
        </Box>
      </Box>

      <QualificationEditModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedQualificationId(null);
        }}
        qualificationId={selectedQualificationId}
        onUpdated={fetchQualifications}
      />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
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
              Delete Qualification
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete "${qualificationToDelete?.name ||
                qualificationToDelete?.qualification_name ||
                ""
                }"?`}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
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
