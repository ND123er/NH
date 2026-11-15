import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  HStack,
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
  Checkbox,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  CloseButton,
  Image,
  Flex,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { getOrgCode } from "../../../../../utils/token";
import api from "../../../../../api/axios";
import NationalityEditModal from "./NationalityEditModal";
import filter from "../../../../../assets/filter.svg";

export default function NationalityList() {
  const navigate = useNavigate();
  const toast = useToast();

  /* ===================== STATES ===================== */
  const [nationalities, setNationalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search & filter
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState([]); // [] means All

  // refs
  const searchDebounceRef = useRef(null);
  const initialFetchDoneRef = useRef(false);

  // edit modal
  const [selectedNationality, setSelectedNationality] = useState(null);
  const { isOpen: isEditOpen, onOpen, onClose } = useDisclosure();

  // delete dialog
  const [nationalityToDelete, setNationalityToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  /* ===================== API ===================== */
  const fetchNationalities = useCallback(
    async ({ q = "", genderValue = [] } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const orgId =
          getOrgCode?.() ||
          (typeof window !== "undefined" && localStorage.getItem("org_code"));

        const params = new URLSearchParams();
        params.append("org_id", orgId);

        if (q && q.length >= 3) params.append("search", q);
        if (genderValue.length > 0) {
          params.append("gender", genderValue.join(","));
        }

        const res = await api.get(
          `/settings/get_nationalities?${params.toString()}`,
        );

        setNationalities(res?.data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load nationalities",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* ===================== SINGLE FETCH ===================== */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchNationalities({ q: "", genderValue: gender });
      return;
    }

    // search guard
    if (search && search.length < 3) return;

    // debounce
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      fetchNationalities({ q: search, genderValue: gender });
    }, 500);

    return () => clearTimeout(searchDebounceRef.current);
  }, [search, gender, fetchNationalities]);

  /* ===================== DELETE ===================== */
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(
        `/organization/delete_nationality/${nationalityToDelete._id}`,
      );

      toast({
        title: "Nationality deleted",
        status: "success",
      });

      onDeleteClose();
      fetchNationalities({ q: search, genderValue: gender });
    } catch {
      toast({
        title: "Delete failed",
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  /* ===================== UI ===================== */
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

        {/* Header */}
        <Box
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ base: "stretch", md: "center" }}
          gap={3}
          mb={4}
        >
         <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Nationality
          </Box>

          <HStack
            spacing={3}
            flexDirection={{ base: "column", md: "row" }}
            width={{ base: "100%", md: "auto" }}
            alignItems="stretch"
          >
            {/* Search */}
            <InputGroup
              size="md"
              w={{ base: "100%", md: "160px" }}
              borderRadius="5px"
            >
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setSearch(value);
                }}
              />
              {search && (
                <InputRightElement>
                  <CloseButton size="sm" onClick={() => setSearch("")} />
                </InputRightElement>
              )}
            </InputGroup>

            {/* Filter: multi-select checkboxes */}
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                size="md"
                border="1px solid #e1e8f0"
                color="#757575"
                borderRadius="5px"
                bg="white"
                width={{ base: "100%", md: "auto" }}
                leftIcon={<Image src={filter} boxSize={{ base: "14px", sm: "16px" }} alt="filter" />}
              >
                Filter
              </MenuButton>
              <MenuList minW="200px" px={2}>
                <MenuItem onClick={() => setGender([])}>
                  <Checkbox isChecked={gender.length === 0} pointerEvents="none">
                    All
                  </Checkbox>
                </MenuItem>
                {[
                  { label: "Male", value: 1 },
                  { label: "Female", value: 2 },
                  { label: "Others", value: 3 },
                ].map(({ label, value }) => (
                  <MenuItem
                    key={value}
                    onClick={() =>
                      setGender((prev) =>
                        prev.includes(value)
                          ? prev.filter((item) => item !== value)
                          : [...prev, value]
                      )
                    }
                  >
                    <Checkbox isChecked={gender.includes(value)} pointerEvents="none">
                      {label}
                    </Checkbox>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width={{ base: "100%", md: "100px" }}
              _hover={{ bg: "blue.800" }}
              size="md"
              onClick={() => navigate("add-nationality")}
            >
              Add
            </Button>
          </HStack>
        </Box>

        {/* Mobile Cards */}
        <Box
          display={{ base: "block", md: "none" }}
          mb={4}
          flex="1"
          minH="0"
          overflowY="auto"
          pr={1}
        >
          {loading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : nationalities.length === 0 ? (
            <Box p={4} textAlign="center">
              No records found
            </Box>
          ) : (
            nationalities.map((n) => (
              <Box
                key={n._id}
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
                    icon={<BsThreeDots />}
                    size="sm"
                    variant="ghost"
                    aria-label="actions"
                    position="absolute"
                    top={2}
                    right={2}
                  />
                  <MenuList>
                    <MenuItem
                      icon={<EditIcon />}
                      onClick={() => {
                        setSelectedNationality(n);
                        onOpen();
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={() => {
                        setNationalityToDelete(n);
                        onDeleteOpen();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              
                <Flex justify="space-between" align="center" mt={5} mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Nationality Name:
                  </Text>
                  <Text fontSize="sm">
                    {n.nationality_name}
                  </Text>
                </Flex>
               
                <Flex justify="space-between" align="center" mt={5} mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Number of employees:
                  </Text>
                  <Text fontSize="sm">
                    {n.result?.count ?? 0}
                  </Text>
                </Flex>
              </Box>
            ))
          )}
        </Box>

        {/* Desktop Table */}
        <Box
          display={{ base: "none", md: "block" }}
          flex="1"
          minH="0"
          overflowY="auto"
        >
          {loading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th
                    fontFamily="Poppins, sans-serif"
                    fontWeight={600}
                    fontSize="14px"
                    textTransform="none"
                    color="black"
                    pb="12px"
                  >
                    Nationality Name
                  </Th>
                  <Th
                    fontFamily="Poppins, sans-serif"
                    fontWeight={600}
                    fontSize="14px"
                    textTransform="none"
                    color="black"
                    pb="12px"
                  >
                    Number of employees
                  </Th>
                  <Th
                    fontFamily="Poppins, sans-serif"
                    fontWeight={600}
                    fontSize="14px"
                    textTransform="none"
                    color="black"
                    pb="12px"
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {nationalities.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} textAlign="center">
                      No records found
                    </Td>
                  </Tr>
                ) : (
                  nationalities.map((n) => (
                    <Tr key={n._id}>
                      <Td>{n.nationality_name}</Td>
                      <Td>{n.result?.count ?? 0}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<BsThreeDots />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<EditIcon />}
                              onClick={() => {
                                setSelectedNationality(n);
                                onOpen();
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => {
                                setNationalityToDelete(n);
                                onDeleteOpen();
                              }}
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

      {/* Edit Modal */}
      {selectedNationality && (
        <NationalityEditModal
          isOpen={isEditOpen}
          onClose={onClose}
          nationality={selectedNationality}
          onUpdated={() =>
            fetchNationalities({ q: search, genderValue: gender })
          }
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Nationality</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <b>{nationalityToDelete?.nationality_name}</b>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                isLoading={deleting}
                onClick={handleConfirmDelete}
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
