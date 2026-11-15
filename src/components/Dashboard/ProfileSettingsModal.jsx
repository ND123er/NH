import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  Image,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";
import api from "../../api/axios";
import profile from "../../assets/profile.png";
import appearence from "../../assets/appearence.png";
import avatar_profile from "../../assets/avatar_profile.png";
import { useNavigate } from "react-router-dom";
import { getEmpCode } from "../../utils/token";
import AppearancePanel from "./AppearancePanel";

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState("main");
  const navigate = useNavigate();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designationState, setDesignationState] = useState("");
  const [genderState, setGenderState] = useState("");
  const [dobState, setDobState] = useState("");
  const [passwordCount, setPasswordCount] = useState(null);
  const [passwordLastChanged, setPasswordLastChanged] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const initialProfileRef = useRef(null);

  const isDirty = useMemo(() => {
    const init = initialProfileRef.current;
    if (!init) return false;
    return (
      firstName !== init.firstName ||
      lastName !== init.lastName ||
      workEmail !== init.workEmail ||
      genderState !== init.genderState ||
      dobState !== init.dobState ||
      phone !== init.phone
    );
  }, [firstName, lastName, workEmail, genderState, dobState, phone]);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  // const NavItem = ({ idx, label, icon }) => {
  //   const isActive = idx === activeIndex;
  //   return (
  //     <HStack
  //       spacing={4}
  //       cursor="pointer"
  //       px={2}
  //       py={2}
  //       borderRadius="8px"
  //       bg={isActive ? "gray.50" : "transparent"}
  //       _hover={{ bg: "gray.50" }}
  //       onClick={() => setActiveIndex(idx)}
  //     >
  //       <Image src={icon} boxSize="16px" />
  //       <Text
  //         fontSize="14px"
  //         fontWeight={isActive ? 600 : 500}
  //         color={isActive ? "#1f3143" : "gray.600"}
  //       >
  //         {label}
  //       </Text>
  //     </HStack>
  //   );
  // };

  const NavItem = ({ idx, label, icon }) => {
    const isActive = idx === activeIndex;
    return (
      <HStack
        spacing={4}
        cursor="pointer"
        px={2}
        py={2}
        borderRadius="8px"
        bg={isActive ? "gray.50" : "transparent"}
        _hover={{ bg: "gray.50" }}
        onClick={() => {
          setActiveIndex(idx);
          // map index to page names
          if (idx === 0) setPage("main");
          else if (idx === 1) setPage("appearance");
          // (add other pages if you add more nav items)
        }}
      >
        <Image src={icon} boxSize="16px" />
        <Text
          fontSize="14px"
          fontWeight={isActive ? 600 : 500}
          color={isActive ? "#1f3143" : "gray.600"}
        >
          {label}
        </Text>
      </HStack>
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      try {
        const employeeId = getEmpCode();
        const url = `/employee/get_admin_detail?employee_id=${employeeId}`;
        const res = await api.get(url);
        const data = res?.data?.result || {};
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setWorkEmail(data.work_email || "");
        setDesignationState(data.designation || "");
        setGenderState(data.gender || "");

        // dob: converting to yyyy-mm-dd for input[type=date]
        if (data.dob) {
          const d = new Date(data.dob);
          const iso = d.toISOString().slice(0, 10);
          setDobState(iso);
        } else {
          setDobState("");
        }
        setPhone(data.mobile || "");
        const pwCount =
          typeof data.password === "number" ? data.password : null;
        setPasswordCount(pwCount);
        setPasswordLastChanged(data.date ? new Date(data.date) : null);
        // store initial snapshot for dirty tracking
        initialProfileRef.current = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          workEmail: data.work_email || "",
          genderState: data.gender || "",
          dobState: data.dob
            ? new Date(data.dob).toISOString().slice(0, 10)
            : "",
          phone: data.mobile || "",
        };
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleSave = async () => {
    try {
      const employeeId = getEmpCode();
      const url = `/employee/update_admin_detail?employee_id=${employeeId}`;
      const payload = {
        first_name: firstName,
        last_name: lastName,
        work_email: workEmail,
        gender: genderState,
        dob: dobState || null,
        mobile: phone,
      };
      const updateApi = await api.put(url, payload);
      toast({ title: "Profile updated", status: "success", duration: 2000 });
      onClose();
      // setTimeout(() => {
      window.location.reload();
      // }, 300);
    } catch (err) {
      console.error("Update failed", err);
      toast({
        title: "Update failed",
        description: err?.message || "",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="14px" maxW="1100px">
        <ModalCloseButton />

        {/* Header */}
        <ModalHeader px={8} pt={6}>
          {page === "main" && (
            <Text fontSize="28px" fontWeight={600}>
              Profile Settings
            </Text>
          )}

          {page === "appearance" && (
            <Text fontSize="28px" fontWeight={600}>
              Appearance
            </Text>
          )}

          {page === "updatePassword" && (
            <HStack spacing={4} align="center">
              <IconButton
                icon={<ChevronLeftIcon />}
                aria-label="Back"
                onClick={() => setPage("main")}
                bg="blue.900"
                color="white"
                borderRadius="full"
                _hover={{ bg: "blue.800" }}
                size="sm"
              />
              <Breadcrumb
                spacing="8px"
                separator={<ChevronRightIcon color="gray.500" />}
              >
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage("main")}
                    cursor="pointer"
                  >
                    My profile
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink fontWeight="bold">
                    Update Password
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </HStack>
          )}
        </ModalHeader>

        <Divider />

        <ModalBody px={0} py={0}>
          <Flex minH="560px">
            {/* Sidebar */}
            <Box w="220px" borderRight="1px solid #E6E6E6" px={6} py={8}>
              <VStack align="stretch" spacing={4}>
                <NavItem idx={0} label="My profile" icon={profile} />
                <NavItem idx={1} label="Appearance" icon={appearence} />
              </VStack>
            </Box>

            {/* Content panel */}
            <Box flex="1" px={8} py={6}>
              {page === "main" ? (
                <>
                  {/* Avatar */}
                  <Flex gap={6} align="center" mb={6}>
                    <Image
                      src={avatar_profile}
                      boxSize="100px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Button size="sm" variant="outline">
                        Change photo
                      </Button>
                      <Text fontSize="12px" color="gray.500" mt={2}>
                        At least 800 x 800 px recommended
                      </Text>
                      <Text fontSize="12px" color="gray.400">
                        Use JPG or PNG
                      </Text>
                    </Box>
                  </Flex>

                  <Divider mb={6} />

                  {/* NAME */}
                  <SimpleGrid columns={2} spacing={4} mb={4}>
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        placeholder="Enter First Name"
                        {...inputStyle}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        placeholder="Enter Last Name"
                        {...inputStyle}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* WORK EMAIL */}
                  <FormControl isRequired mb={4}>
                    <FormLabel>Work Email</FormLabel>
                    <Input
                      placeholder="Enter work email"
                      {...inputStyle}
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                    />
                  </FormControl>

                  {/* PASSWORD */}
                  <FormControl isRequired mb={6}>
                    <FormLabel>Password</FormLabel>

                    <Flex
                      align="center"
                      justify="space-between"
                      border="1.5px solid #D0D5DD"
                      borderRadius="8px"
                      px={4}
                      py={4}
                      h="100px"
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => setPage("updatePassword")}
                    >
                      <Box>
                        <Text fontSize="14px" color="gray.600">
                          A secure password that protects your account
                        </Text>
                        <Text fontSize="13px" color="gray.400" mt={1}>
                          {passwordCount
                            ? "*".repeat(passwordCount)
                            : "********"}
                        </Text>
                        <Text fontSize="12px" color="gray.400" mt={1}>
                          {passwordLastChanged
                            ? `Last changed on ${passwordLastChanged.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}`
                            : "Last changed on —"}
                        </Text>
                      </Box>

                      <ChevronRightIcon boxSize={6} color="gray.500" />
                    </Flex>
                  </FormControl>

                  {/* REST FIELDS */}
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        placeholder="Enter phone number"
                        {...inputStyle}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Designation</FormLabel>
                      <Input
                        placeholder="Enter Designation"
                        {...inputStyle}
                        value={designationState}
                        onChange={(e) => setDesignationState(e.target.value)}
                        isDisabled
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Gender</FormLabel>
                      <Input
                        placeholder="Enter Gender"
                        {...inputStyle}
                        value={genderState}
                        onChange={(e) => setGenderState(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Date Of Birth</FormLabel>
                      <Input
                        type="date"
                        {...inputStyle}
                        value={dobState}
                        onChange={(e) => setDobState(e.target.value)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* ACTIONS */}
                  <Flex justify="space-between" mt={6}>
                    <Button variant="ghost" onClick={onClose} color="#757575">
                      Cancel
                    </Button>
                    <Button
                      bg="#274167"
                      color="white"
                      _hover={{ bg: "blue.700" }}
                      px={6}
                      onClick={handleSave}
                      isDisabled={!isDirty}
                    >
                      Save
                    </Button>
                  </Flex>
                </>
              ) : page === "appearance" ? (
  <AppearancePanel
  currentTheme="system"
  onApply={async (theme) => {
    setPage("main");
    toast({
      title: "Theme saved",
      description: theme,
      status: "success",
      duration: 1500,
    });
  }}
  onCancel={() => setPage("main")}
/>
) : (
                // Update Password view inside modal
                <Box>
                  <Heading size="md" mb={6}>
                    Update Password
                  </Heading>

                  <FormControl mb={6} isRequired>
                    <FormLabel>Old password</FormLabel>
                    <InputGroup>
                      <Input
                        placeholder="Enter Old password"
                        type={showOldPassword ? "text" : "password"}
                        h="55px"
                        borderWidth="1.5px"
                        borderColor="#D0D5DD"
                        borderRadius="8px"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          type="button"
                          aria-label={
                            showOldPassword ? "Hide password" : "Show password"
                          }
                          icon={showOldPassword ? <LuEyeOff /> : <LuEye />}
                          onClick={() => setShowOldPassword((s) => !s)}
                          variant="ghost"
                          size="sm"
                          _hover={{ bg: "transparent" }}
                          _active={{ bg: "transparent" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl mb={6} isRequired>
                    <FormLabel>New password</FormLabel>
                    <InputGroup>
                      <Input
                        placeholder="Enter New password"
                        type={showNewPassword ? "text" : "password"}
                        h="55px"
                        borderWidth="1.5px"
                        borderColor="#D0D5DD"
                        borderRadius="8px"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          type="button"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                          icon={showNewPassword ? <LuEyeOff /> : <LuEye />}
                          onClick={() => setShowNewPassword((s) => !s)}
                          variant="ghost"
                          size="sm"
                          _hover={{ bg: "transparent" }}
                          _active={{ bg: "transparent" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl mb={4} isRequired>
                    <FormLabel>Re-type New password</FormLabel>
                    <InputGroup>
                      <Input
                        placeholder="Re-enter New password"
                        type={showRetypePassword ? "text" : "password"}
                        h="55px"
                        borderWidth="1.5px"
                        borderColor="#D0D5DD"
                        borderRadius="8px"
                        value={retypePassword}
                        onChange={(e) => setRetypePassword(e.target.value)}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          type="button"
                          aria-label={
                            showRetypePassword
                              ? "Hide password"
                              : "Show password"
                          }
                          icon={showRetypePassword ? <LuEyeOff /> : <LuEye />}
                          onClick={() => setShowRetypePassword((s) => !s)}
                          variant="ghost"
                          size="sm"
                          _hover={{ bg: "transparent" }}
                          _active={{ bg: "transparent" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Flex justify="flex-end" mt={6}>
                    {/* <Box>
                      <Text
                        mt={2}
                        color="#274066"
                        cursor="pointer"
                        textDecoration={"underline"}
                        onClick={() => navigate("/forgot-password")}
                      >
                        Forgot password?
                      </Text>
                    </Box> */}

                    <Box>
                      <Button
                        variant="ghost"
                        mr={4}
                        onClick={() => setPage("main")}
                        color={"#757575"}
                      >
                        Clear form
                      </Button>
                      <Button
                        bg="#274167"
                        color="white"
                        _hover={{ bg: "#1f3143" }}
                        px={6}
                        onClick={async () => {
                          // trigger change password
                          try {
                            setPasswordLoading(true);
                            const empId = getEmpCode();
                            if (!oldPassword || !newPassword) {
                              toast({
                                title: "Please fill all fields",
                                status: "warning",
                                duration: 2000,
                              });
                              setPasswordLoading(false);
                              return;
                            }
                            if (newPassword !== retypePassword) {
                              toast({
                                title: "Passwords do not match",
                                status: "error",
                                duration: 2000,
                              });
                              setPasswordLoading(false);
                              return;
                            }

                            const payload = {
                              employee_id: empId,
                              old_password: oldPassword,
                              new_password: newPassword,
                            };

                            await api.post("/auth/change_password", payload);

                            toast({
                              title: "Password changed",
                              status: "success",
                              duration: 2000,
                            });
                            // update local password metadata
                            setPasswordCount(newPassword.length);
                            setPasswordLastChanged(new Date());
                            setOldPassword("");
                            setNewPassword("");
                            setRetypePassword("");
                            setPage("main");
                          } catch (err) {
                            console.error("Change password failed", err);
                            toast({
                              title: "Change password failed",
                              description: err?.message || "",
                              status: "error",
                              duration: 3000,
                            });
                          } finally {
                            setPasswordLoading(false);
                          }
                        }}
                        isLoading={passwordLoading}
                      >
                        Save
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
