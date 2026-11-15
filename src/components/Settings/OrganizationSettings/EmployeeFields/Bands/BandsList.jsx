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
import BandsEditModal from "./BandsEditModal";

export default function BandsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBand, setSelectedBand] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [bandToDelete, setBandToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchBands = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      const org = orgId;

      const url = `/settings/get_bands?org_id=${encodeURIComponent(org)}`;
      const res = await api.get(url);
      const data = res?.data?.data || [];
      setBands(data);
    } catch (err) {
      console.error("Failed to fetch bands", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load bands",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    fetchBands();
  }, []);

  const handleOpenEdit = (band) => {
    setSelectedBand(band);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedBand(null);
    onEditClose();
  };

  const handleDeleteClick = (band) => {
    setBandToDelete(band);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!bandToDelete?._id) return;

    setDeleting(true);
    try {
      const url = `/organization/delete_band/${bandToDelete._id}`;
      await api.delete(url);

      toast({
        title: "Band deleted",
        description: `Band "${bandToDelete.band_name}" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setBandToDelete(null);
      onDeleteClose();
      await fetchBands();
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
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setBandToDelete(null);
    onDeleteClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        fontFamily="Poppins"
        boxShadow="sm"
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: "78vh", sm: "70vh", md: "80vh", lg: "85.5vh" }}
        mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
        w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
        ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        border="1px solid #cccccc"
        sx={{
          overflowY: "auto",
          // Firefox
          scrollbarWidth: "none",
          // Chrome, Safari, Edge
          "&::-webkit-scrollbar": {
            display: "none",
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
          <Box
            fontWeight="bold"
            fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
            fontFamily="poppins"
            mb={{ base: 3, md: 0 }}
          >
            Bands
          </Box>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width="100px"
            _hover={{ bg: "blue.800" }}
            size="md"
            onClick={() => navigate("add-band")}
          >
            Add
          </Button>
        </Box>

        {loading ? (
          <Center py={10}>
            <Spinner size="lg" />
            <Text ml={3}>Loading bands...</Text>
          </Center>
        ) : error ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <>
            <Box display={{ base: "block", md: "none" }}>
              {bands.length === 0 ? (
                <Box p={4} textAlign="center">
                  No bands found.
                </Box>
              ) : (
                bands.map((b) => (
                  <Box
                    key={b._id}
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
                            onClick={() => handleOpenEdit(b)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<DeleteIcon fontSize="14px" />}
                            onClick={() => handleDeleteClick(b)}
                            isDisabled={deleting && bandToDelete?._id === b._id}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* <Box mt={5}>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Band Name
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {b.band_name}
                      </Text>
                    </Box> */}
                    <Flex justify="space-between" align="center" mt={5} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Band Name:
                      </Text>
                      <Text fontSize="sm">{b.band_name}</Text>
                    </Flex>

                    {/* <Box mt={4}>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Number of employees
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {typeof b.employee_count === "number"
                          ? b.employee_count
                          : 0}
                      </Text>
                    </Box> */}
                    <Flex justify="space-between" align="center" mt={1} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Number of employees:
                      </Text>
                      <Text fontSize="sm">
                        {typeof b.employee_count === "number"
                          ? b.employee_count
                          : 0}
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
                    <Th>Band Name</Th>
                    <Th>Number of employees</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bands.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Text textAlign="center" py={4}>
                          No bands found.
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    bands.map((b) => (
                      <Tr key={b._id}>
                        <Td>{b.band_name}</Td>
                        <Td>
                          {typeof b.employee_count === "number"
                            ? b.employee_count
                            : 0}
                        </Td>
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
                                onClick={() => handleOpenEdit(b)}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                icon={<DeleteIcon fontSize="14px" />}
                                onClick={() => handleDeleteClick(b)}
                                isDisabled={
                                  deleting && bandToDelete?._id === b._id
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
            </Box>
          </>
        )}
      </Box>

      {selectedBand && (
        <BandsEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          band={selectedBand}
          onUpdated={fetchBands}
        />
      )}

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
            fontFamily="Poppins"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="600">
              Delete Band
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the band "${
                bandToDelete?.band_name || ""
              }" ?`}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={handleCancelDelete}
                variant="outline"
                size="sm"
                border="1px solid #cccccc"
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
