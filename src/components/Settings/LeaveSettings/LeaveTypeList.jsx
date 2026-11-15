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
  Center,
  Checkbox,
  HStack,
  Image,
} from "@chakra-ui/react";

// import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";
import filter from "../../../assets/filter.svg";
import LeaveEditModal from "./LeaveEditModal";

export default function LeaveTypeList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  // edit modal
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // delete dialog
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  // useEffect(() => {
  //   fetchLeavePolicies();
  //    window.scrollTo({
  //     top: 0,
  //     left: 0,
  //     behavior: 'smooth',
  //   });
  // }, []);

  useEffect(() => {
    fetchLeavePolicies();
  }, [selectedStatuses]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const fetchLeavePolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const organisation_id =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      const params = {
        organisation_id,
      };

      if (selectedStatuses.length === 1) {
        params.status = selectedStatuses[0] === "active";
      }

      const res = await axios.get("/leave/get_all_leave_policies", {
        params,
      });
      // const res = await axios.get("/leave/get_all_leave_policies", {
      //   params: { organisation_id },
      // });

      const policies =
        res?.data?.data ?? (Array.isArray(res?.data) ? res.data : null);

      if (policies) {
        setLeavePolicies(policies);
      } else {
        setError("Failed to fetch leave policies");
        setLeavePolicies([]);
      }
    } catch (err) {
      console.error("fetchLeavePolicies", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load leave policies",
      );
      setLeavePolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = (item) => {
  //   setSelectedLeaveId(item._id);
  //   onEditOpen();
  // };

  const handleEdit = (item) => {
    setIsViewMode(false);
    setSelectedLeaveId(item._id);
    onEditOpen();
  };

  const handleView = (item) => {
    setIsViewMode(true);
    setSelectedLeaveId(item._id);
    onEditOpen();
  };

  const handleDeleteClick = (item) => {
    setLeaveToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!leaveToDelete?._id) return;
    setDeleting(true);
    try {
      const organisation_id = getOrgCode();
      const leave_id = leaveToDelete._id;
      await axios.delete(`/leave/delete_leave_policy/${leave_id}`, {
        params: { organisation_id },
      });

      toast({
        title: "Leave policy deleted and stored as inactive",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setLeaveToDelete(null);
      onDeleteClose();
      await fetchLeavePolicies();
    } catch (err) {
      console.error("Failed to delete leave policy", err);
      toast({
        title: "Failed to delete",
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
        p={6}
        boxShadow="sm"
        w={"100%"}
        mt={2}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
      >
        <BreadcrumbsNav />
        <Box borderRadius={"10px"} border={"1px solid #e0e0e0"} pt={6}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            pr={6}
            pl={6}
          >
            <Box fontWeight="bold" fontSize="xl">
              Leave Types
            </Box>
            {/* <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width="100px"
              _hover={{ bg: "blue.700" }}
              size="md"
              onClick={() => navigate("add-leaves")}
            >
              Add
            </Button> */}
            <HStack spacing={3}>
              {/* Filter dropdown */}
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  variant="outline"
                  borderColor="#A0AEC0"
                  borderRadius="8px"
                  fontWeight={500}
                  fontSize="14px"
                  leftIcon={<Image src={filter} boxSize="14px" alt="filter" />}
                  bg="white"
                  _hover={{ bg: "gray.50" }}
                  _active={{ bg: "gray.50" }}
                >
                  Filter
                </MenuButton>

                <MenuList
                  minW="240px"
                  p={3}
                  borderRadius="10px"
                  boxShadow="lg"
                  fontFamily="Poppins"
                >
                  <Text
                    fontSize="13px"
                    fontWeight={600}
                    mb={3}
                    color="gray.700"
                  >
                    Status
                  </Text>

                  <Checkbox
                    display="flex"
                    mb={3}
                    colorScheme="blue"
                    isChecked={selectedStatuses.includes("active")}
                    onChange={() => toggleStatus("active")}
                  >
                    <Text fontSize="14px">Active</Text>
                  </Checkbox>

                  <Checkbox
                    display="flex"
                    mb={3}
                    colorScheme="blue"
                    isChecked={selectedStatuses.includes("inactive")}
                    onChange={() => toggleStatus("inactive")}
                  >
                    <Text fontSize="14px">Inactive</Text>
                  </Checkbox>

                  <Box
                    borderTop="1px solid"
                    borderColor="gray.200"
                    pt={3}
                    mt={3}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      width="100%"
                      fontWeight={600}
                      color="blue.900"
                      onClick={() => setSelectedStatuses([])}
                    >
                      Clear all
                    </Button>
                  </Box>
                </MenuList>
              </Menu>

              {/* Existing Add button */}
              <Button
                bg="blue.900"
                color="white"
                borderRadius="14px"
                width="100px"
                _hover={{ bg: "blue.700" }}
                size="md"
                onClick={() => navigate("add-leaves")}
              >
                Add
              </Button>
            </HStack>
          </Box>

          <Box
            h="1px"
            w="100%"
            bgImage={`repeating-linear-gradient(
          to right,
          #C7C7C7 0,
          #C7C7C7 4px,
          transparent 4px,
          transparent 8px
        )`}
            mb={2}
          />

          {loading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : error ? (
            <Center py={6}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : (
            <Table variant="simple" mt={4}>
              <Thead>
                <Tr>
                  {["Name", "Display Name", "Type", "Status", "Action"].map(
                    (label) => (
                      <Th
                        key={label}
                        fontFamily="Poppins, sans-serif"
                        fontWeight={600}
                        fontSize="14px"
                        textTransform="none"
                        letterSpacing="-0.42px"
                        color="black"
                        whiteSpace="nowrap"
                        py={2.5}
                        textAlign={"center"}
                      >
                        {label}
                      </Th>
                    ),
                  )}
                </Tr>
              </Thead>

              <Tbody>
                {leavePolicies.length === 0 ? (
                  <Tr>
                    <Td colSpan={5}>
                      <Text textAlign="center" py={4}>
                        No leave policies found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  leavePolicies.map((l) => (
                    <Tr key={l._id}>
                      <Td textAlign={"center"} fontSize={"14px"}>
                        {l.leave_name}
                      </Td>
                      <Td textAlign={"center"} fontSize={"14px"}>
                        {l.display_name || l.display}
                      </Td>
                      <Td textAlign={"center"} fontSize={"14px"}>
                        {l.pay_type}
                      </Td>
                      <Td textAlign={"center"} fontSize={"14px"}>
                        {l.is_active ? "Active" : "Inactive"}
                      </Td>
                      <Td textAlign={"center"} fontSize={"14px"}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<span>•••</span>}
                            size="sm"
                            variant="ghost"
                            aria-label="actions"
                          />
                          {/* <MenuList fontFamily={"Poppins"}>
                            <MenuItem
                              icon={<EditIcon />}
                              onClick={() => handleEdit(l)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(l)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList> */}
                          <MenuList fontFamily="Poppins">
                            {l.is_active === false ? (
                              <MenuItem
                                icon={<ViewIcon />}
                                onClick={() => handleView(l)}
                              >
                                View
                              </MenuItem>
                            ) : (
                              <>
                                <MenuItem
                                  icon={<EditIcon />}
                                  onClick={() => handleEdit(l)}
                                >
                                  Edit
                                </MenuItem>

                                <MenuItem
                                  icon={<DeleteIcon />}
                                  onClick={() => handleDeleteClick(l)}
                                >
                                  Delete
                                </MenuItem>
                              </>
                            )}
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
      {selectedLeaveId && (
        // <LeaveEditModal
        //   isOpen={isEditOpen}
        //   onClose={() => {
        //     onEditClose();
        //     setSelectedLeaveId(null);
        //   }}
        //   leaveId={selectedLeaveId}
        //   onUpdated={fetchLeavePolicies}
        // />
        <LeaveEditModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            setSelectedLeaveId(null);
            setIsViewMode(false);
          }}
          leaveId={selectedLeaveId}
          onUpdated={fetchLeavePolicies}
          isViewMode={isViewMode}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(2px)">
          <AlertDialogContent fontFamily="Poppins">
            <AlertDialogHeader fontWeight="600">
              Delete Leave Policy
            </AlertDialogHeader>
            <AlertDialogBody>
              {`Are you sure you want to delete the leave policy "${
                leaveToDelete?.leave_name || ""
              }"?`}
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                variant="outline"
                size="sm"
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
