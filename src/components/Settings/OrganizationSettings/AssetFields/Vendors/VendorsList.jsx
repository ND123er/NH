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
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import VendorsEditModal from "./VendorsEditModal";

export default function VendorsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      const url = `/settings/get_asset_vendors_with_count?org_id=${encodeURIComponent(
        orgId,
      )}`;

      const res = await api.get(url);
      const data = res?.data?.data || [];
      setVendors(data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load vendors",
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
    fetchVendors();
  }, []);

  const handleOpenEdit = (vendor) => {
    setSelectedVendor(vendor);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedVendor(null);
    onEditClose();
  };

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete?._id) return;

    setDeleting(true);
    try {
      const url = `/organization/delete_asset_vendor/${vendorToDelete._id}`;
      await api.delete(url);

      toast({
        title: "Vendor deleted",
        description: `Vendor "${vendorToDelete.vendor_name}" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setVendorToDelete(null);
      onDeleteClose();
      await fetchVendors();
    } catch (err) {
      console.error("Failed to delete vendor", err);
      toast({
        title: "Failed to delete vendor",
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
    setVendorToDelete(null);
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
        h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
        mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
        w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
        ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        border="1px solid #cccccc"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <BreadcrumbsNav />
        <Box
          borderRadius="10px"
          border="1px solid #e0e0e0"
          p={{ base: 4, md: 8 }}
          flex="1"
          minH="0"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ base: "stretch", md: "center" }}
            gap={3}
            mb={4}
          >
            <Box
              fontWeight="bold"
              fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
              fontFamily="poppins"
              mb={{ base: 0, md: 0 }}
            >
              Vendors
            </Box>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width={{ base: "100%", md: "100px" }}
              _hover={{ bg: "blue.800" }}
              size="md"
              onClick={() => navigate("add-vendors")}
            >
              Add
            </Button>
          </Box>

          {loading ? (
            <Center py={10}>
              <Spinner size="lg" />
              <Text ml={3}>Loading vendors...</Text>
            </Center>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Box flex="1" minH="0" overflowY="auto">
              <Box display={{ base: "block", md: "none" }}>
                {vendors.length === 0 ? (
                  <Box p={4} textAlign="center">
                    No vendors found.
                  </Box>
                ) : (
                  vendors.map((v) => (
                    <Box
                      key={v._id}
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
                              onClick={() => handleOpenEdit(v)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon fontSize="14px" />}
                              onClick={() => handleDeleteClick(v)}
                              isDisabled={deleting && vendorToDelete?._id === v._id}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>

                      {/* <Box mt={5}>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Vendor Name
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {v.vendor_name}
                        </Text>
                      </Box> */}
                      <Flex justify="space-between" align="center" mt={5} >
                        <Text fontSize="sm" fontWeight="600">
                          Vendor Name:
                        </Text>
                        <Text fontSize="sm">
                          {v.vendor_name}
                        </Text>
                      </Flex>

                      {/* <Box mt={4}>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Number of assets
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {typeof v.asset_count === "number" ? v.asset_count : "-"}
                        </Text>
                      </Box> */}
                      <Flex justify="space-between" align="center" mt={1} >
                        <Text fontSize="sm" fontWeight="600">
                          Number of assets:
                        </Text>
                        <Text fontSize="sm">
                          {typeof v.asset_count === "number" ? v.asset_count : "-"}
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
                      <Th>Vendor Name</Th>
                      <Th>Number of assets</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vendors.length === 0 ? (
                      <Tr>
                        <Td colSpan={4}>
                          <Text textAlign="center" py={4}>
                            No vendors found.
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      vendors.map((v) => (
                        <Tr key={v._id}>
                          <Td>{v.vendor_name}</Td>
                          <Td>
                            {typeof v.asset_count === "number" ? v.asset_count : "-"}
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
                                  onClick={() => handleOpenEdit(v)}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  icon={<DeleteIcon fontSize="14px" />}
                                  onClick={() => handleDeleteClick(v)}
                                  isDisabled={
                                    deleting && vendorToDelete?._id === v._id
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
            </Box>
          )}
        </Box>
      </Box>

      {selectedVendor && (
        <VendorsEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          vendorId={selectedVendor._id}
          vendor={selectedVendor}
          onUpdated={fetchVendors}
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
              Delete Vendor
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the vendor "${vendorToDelete?.vendor_name || ""
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
