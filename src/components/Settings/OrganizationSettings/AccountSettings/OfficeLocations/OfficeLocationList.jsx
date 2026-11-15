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
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  CloseButton,
  TableContainer,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import { useEffect, useState, useRef } from "react";
import OfficeLocationEditModal from "./OfficeLocationEditModal";

export default function OfficeLocationList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // Delete confirmation dialog state
  const [locationToDelete, setLocationToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const searchInputStyle = {
    fontFamily: "Poppins",
    fontSize: "14px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "35px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "8px",
  };

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId = getOrgCode();
      const res = await axios.get(
        `/settings/get_company_location_list?org_id=${encodeURIComponent(
          orgId || ""
        )}`
      );
      const items = res?.data?.locations || res?.data?.data || [];
      setLocations(items);
    } catch (err) {
      console.error("fetchLocations", err);
      setError(err?.message || "Failed to load locations");
      setLocations([]);
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
    fetchLocations();
  }, []);

  const handleOpenEdit = (loc) => {
    setSelectedLocationId(loc._id);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedLocationId(null);
    onEditClose();
  };

  const handleDeleteClick = (loc) => {
    setLocationToDelete(loc);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete?._id) return;

    setDeleting(true);
    try {
      // DELETE /settings/delete_location/:locationId
      const url = `/settings/delete_location/${locationToDelete._id}`;
      await axios.delete(url);

      toast({
        title: "Location deleted",
        description: `Location "${locationToDelete.location_name || locationToDelete.locationName || ""
          }" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setLocationToDelete(null);
      onDeleteClose();
      await fetchLocations();
    } catch (err) {
      console.error("Failed to delete location", err);
      toast({
        title: "Failed to delete location",
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
    setLocationToDelete(null);
    onDeleteClose();
  };
  const filteredLocations = locations.filter((loc) => {
    const name =
      loc.location_name ||
      loc.locationName ||
      "";

    return name.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <>
      <Box
        bg="white"
        // h={'85.5vh'}

        borderRadius="14px"
        fontFamily={"Poppins"}
        boxShadow="sm"
        w={"100%"}
        // mt={3}
        border={"1px solid #cccccc"}
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
        mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
        w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
        ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      >
        <BreadcrumbsNav />
        <Box borderRadius={"10px"} border={"1px solid #cccccc"} p={{ base: 2, sm: 2, md: 3, lg: 8 }} h="75vh"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
          //  h={'73vh'}
          h={{ base: '69vh', sm: '72vh', md: '80vh', lg: '73vh' }}
        >
          <Box
            display={{ base: 'block', md: 'flex' }}
            justifyContent={{ md: 'space-between' }}
            alignItems={{ md: 'center' }}
            mb={4}
          >
            <Box fontWeight="bold" /*fontSize="xl"*/ fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
              Office Locations
            </Box>
            <Flex align="center" gap={3} direction={{ base: 'column', md: 'row' }} w={{ base: '100%', md: 'auto' }}>
              <InputGroup
                size="sm"
                w={{ base: '100%', md: '230px' }}
              // border="1px solid #cccccc"
              // borderRadius={"5px"}
              >
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  fontFamily='poppins'
                  placeholder="Search by Location Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      loadFirstPage();
                    }
                  }}
                  {...searchInputStyle}
                />
                {/* {search && (
                  <InputRightElement>
                    <CloseButton
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        if (debounceRef.current)
                          clearTimeout(debounceRef.current);
                        loadFirstPage();
                      }}
                    />
                  </InputRightElement>
                )} */}
              </InputGroup>
              <Button
                bg="blue.900"
                color="white"
                borderRadius="14px"
                width={{ base: '100%', md: '100px' }}
                _hover={{ bg: "blue.800" }}
                size="md"
                onClick={() => navigate("add-office-location")}
                mt={{ base: 2, md: 0 }}
              >
                Add
              </Button>
            </Flex>


          </Box>
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
            ) : filteredLocations.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontFamily="poppins">No locations available</Text>
              </Box>
            ) : (
              filteredLocations.map((loc) => (
                <Box
                  key={loc._id}
                  p={4}
                  border="1px solid #cccccc"
                  borderRadius="14px"
                  mb={4}
                  bg="white"
                  boxShadow="sm"
                >
                  <Text fontFamily="poppins" fontSize="lg" mb={2}>
                    <Text as="span" fontWeight="600">Office Locations:</Text> {loc.location_name || loc.locationName}
                  </Text>
                  <Text fontFamily="poppins" mb={1}>
                    <Text as="span" fontWeight="600">Address:</Text> {loc.city || loc.city_name || loc.cityName}
                  </Text>
                  <Text fontFamily="poppins" mb={3}>
                    <Text as="span" fontWeight="600">Number of Employees:</Text> {loc.employee_count ?? loc.employeeCount ?? 0}
                  </Text>
                  <Flex justify="flex-end">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<span>•••</span>}
                        size="sm"
                        variant="ghost"
                        aria-label="actions"
                      />
                      <MenuList fontFamily="Poppins">
                        <MenuItem
                          icon={<EditIcon fontSize="14px" />}
                          onClick={() => handleOpenEdit(loc)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon fontSize="14px" />}
                          onClick={() => handleDeleteClick(loc)}
                          isDisabled={
                            deleting && locationToDelete?._id === loc._id
                          }
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Box>
              ))
            )}
          </Box>

          {/* Desktop Table View */}
          <TableContainer display={{ base: 'none', md: 'block' }}>
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
                  {/* <Th></Th> */}
                  <Th minW="150px">Location Name</Th>
                  <Th minW="120px">City</Th>
                  {/* <Th>Mail</Th> */}
                  <Th minW="150px">Number of Employees</Th>
                  <Th minW="80px">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" justifyContent={'center'}>
                      <Spinner size={'lg'} />
                    </Td>
                  </Tr>
                ) : error ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Text color="red.500">{error}</Text>
                    </Td>
                  </Tr>
                ) :
                  // locations.length === 0 ? (
                  filteredLocations.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Text fontFamily='poppins' textAlign='center'>No locations available</Text>
                      </Td>
                    </Tr>
                  ) : (
                    // locations.map((loc) => (
                    filteredLocations.map((loc) => (
                      <Tr key={loc._id}>
                        {/* <Td>
                        <IconButton
                          icon={<span>&#8801;</span>}
                          size="sm"
                          variant="ghost"
                          aria-label="drag"
                        />
                      </Td> */}
                        <Td>{loc.location_name || loc.locationName}</Td>
                        <Td>{loc.city || loc.city_name || loc.cityName}</Td>
                        <Td>{loc.employee_count ?? loc.employeeCount ?? 0}</Td>
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
                                onClick={() => handleOpenEdit(loc)}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                icon={<DeleteIcon fontSize="14px" />}
                                onClick={() => handleDeleteClick(loc)}
                                isDisabled={
                                  deleting && locationToDelete?._id === loc._id
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
      {selectedLocationId && (
        <OfficeLocationEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          locationId={selectedLocationId}
          onUpdated={fetchLocations}
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
              Delete Office Location
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the location "${locationToDelete?.location_name ||
                locationToDelete?.locationName ||
                ""
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
