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
  TableContainer,
  Flex,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import { useEffect, useRef, useState } from "react";
import RolesEditModal from "./RolesEditModal";

export default function RolesList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit modal state
  const [selectedRole, setSelectedRole] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // Delete confirmation dialog state
  const [roleToDelete, setRoleToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  const isProtectedRole = (role) =>
    ["employee", "admin", "owner"].includes(
      String(role?.role_name || "")
        .trim()
        .toLowerCase(),
    );

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgId = getOrgCode();
      const res = await axios.get(
        `/settings/get_company_roles_list?org_id=${encodeURIComponent(
          orgId || "",
        )}`,
      );
      const items = res?.data?.roles || [];
      setRoles(items);
    } catch (err) {
      setError(err?.message || "Failed to load roles");
      setRoles([]);
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

    fetchRoles();
  }, []);

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    onEditOpen();
  };

  const handleCloseEdit = () => {
    setSelectedRole(null);
    onEditClose();
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete?._id) return;

    setDeleting(true);
    try {
      const url = `/organization/delete_role/${roleToDelete._id}`;
      await axios.delete(url);

      toast({
        title: "Role deleted",
        description: `Role "${roleToDelete.role_name}" has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setRoleToDelete(null);
      onDeleteClose();
      await fetchRoles();
    } catch (err) {
      toast({
        title: "Failed to delete role",
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
    setRoleToDelete(null);
    onDeleteClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="12px"
        // p={6}
        boxShadow="sm"
        // w={"100%"}
        // mt={3}
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
        mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
        w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
        ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
      >
        <BreadcrumbsNav />
        <Box
          borderRadius={"10px"}
          border={"1px solid #e0e0e0"}
          p={{ base: 2, sm: 2, md: 3, lg: 8 }}
          h={{ base: "68vh", sm: "72vh", md: "68vh", lg: "72vh" }}
          display="flex"
          flexDirection="column"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            flexWrap="wrap"
          >
            <Box
              fontWeight="bold"
              fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
              fontFamily="poppins"
              mb={{ base: 3, md: 0 }}
            >
              Roles
            </Box>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width={{ base: "100%", sm: "180px", md: "100px" }}
              _hover={{ bg: "blue.800" }}
              size="md"
              onClick={() => navigate("add-roles")}
            >
              Add
            </Button>
          </Box>
          <Box flex="1" overflowY="auto" pt={2}>
            <Box display={{ base: "block", md: "none" }}>
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                </Box>
              ) : error ? (
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text color="red.500">{error}</Text>
                </Box>
              ) : roles.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Text fontFamily="poppins">No Roles available</Text>
                </Box>
              ) : (
                roles.map((role) => (
                  <Box
                    key={role._id}
                    p={4}
                    mb={4}
                    border="1px solid #e0e0e0"
                    borderRadius="14px"
                    boxShadow="sm"
                    bg="white"
                    position="relative"
                    isDisabled={isProtectedRole(role)}
                    _disabled={{
                      opacity: 0.4,
                      cursor: "not-allowed",
                    }}
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
                          onClick={() => handleOpenEdit(role)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon fontSize="14px" />}
                          onClick={() => handleDeleteClick(role)}
                          isDisabled={
                            deleting && roleToDelete?._id === role._id
                          }
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    {/* <Text fontWeight="600" mb={2}>
                      {role.role_name}
                    </Text> */}
                    <Flex justify="space-between" align="center" mt={5} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Role Name:
                      </Text>
                      <Text fontSize="sm">{role.role_name}</Text>
                    </Flex>
                    {/* <Text fontSize="sm" mb={1}>
                      <Text as="span" fontWeight="600">Number of Employees:&nbsp;</Text>
                      {role.employee_count ?? 0}
                    </Text> */}
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Number of Employees:
                      </Text>
                      <Text fontSize="sm">{role.employee_count ?? 0}</Text>
                    </Flex>
                    {/* <Text fontSize="sm" mb={1}>
                      <Text as="span" fontWeight="600">Description:&nbsp;</Text>
                      {role.description}
                    </Text> */}
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Description:
                      </Text>
                      <Text fontSize="sm">{role.description}</Text>
                    </Flex>
                  </Box>
                ))
              )}
            </Box>
            <TableContainer
              display={{ base: "none", md: "block" }}
              h="100%"
              overflowY="auto"
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
                    {/* <Th></Th> */}
                    <Th>Role Name</Th>
                    <Th>Number of Employees</Th>
                    <Th>Description</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        <Spinner />
                      </Td>
                    </Tr>
                  ) : error ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Text color="red.500">{error}</Text>
                      </Td>
                    </Tr>
                  ) : roles.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Text>No Roles available</Text>
                      </Td>
                    </Tr>
                  ) : (
                    roles.map((role) => (
                      <Tr key={role._id}>
                        <Td>{role.role_name}</Td>
                        <Td>{role.employee_count ?? 0}</Td>
                        <Td>{role.description}</Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<span>•••</span>}
                              size="sm"
                              variant="ghost"
                              aria-label="actions"
                              isDisabled={isProtectedRole(role)}
                              _disabled={{
                                opacity: 0.4,
                                cursor: "not-allowed",
                              }}
                            />
                            <MenuList fontFamily={"Poppins"}>
                              <MenuItem
                                icon={<EditIcon fontSize="14px" />}
                                onClick={() => handleOpenEdit(role)}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                icon={<DeleteIcon fontSize="14px" />}
                                onClick={() => handleDeleteClick(role)}
                                isDisabled={
                                  deleting && roleToDelete?._id === role._id
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
      </Box>
      {selectedRole && (
        <RolesEditModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          role={selectedRole}
          onUpdated={fetchRoles}
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
              Delete Role
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm" color="gray.700" py={4}>
              {`Are you sure you want to delete the role "${
                roleToDelete?.role_name || ""
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
