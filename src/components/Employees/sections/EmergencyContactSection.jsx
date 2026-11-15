import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
} from "@chakra-ui/react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import api from "../../../api/axios";
import { useFormContext } from "react-hook-form";
// import { updateEmployee } from "../../../api/employee";
import { deleteEmployeeEmergencyContact } from "../../../api/employee";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

export default function EmergencyContactSection() {
  const [contact, setContact] = useState([]);
  // index being edited; null => add mode
  const [editingIndex, setEditingIndex] = useState(null);

  // Map numeric relationship_id values to human-readable labels
  const RELATIONSHIP_MAP = {
    1: "Father",
    2: "Mother",
    3: "Spouse",
    4: "Brother",
    5: "Sister",
    6: "Son",
    7: "Daughter",
    8: "Other",
  };

  // initialize from preloaded data (if present)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("employee_emergency_contacts");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setContact(parsed);
      }
    } catch (e) {
      console.warn("Failed to initialize emergency contacts from storage", e);
    }
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm({ mode: "onChange", reValidateMode: "onChange" });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;
  const pinValue = methods.watch("pin");
  const methods2 = useFormContext();
  const { getValues } = methods2;

  // Relationship dropdown state
  const [relationships, setRelationships] = useState([]);
  const [queryRel, setQueryRel] = useState("");
  const [showRelDropdown, setShowRelDropdown] = useState(false);
  const [loadingRel, setLoadingRel] = useState(false);
  const debounceRefRel = useRef(null);
  const wrapperRefRel = useRef(null);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontWeight: "400",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "5px",
  };

  // Fetch relationships with debounce
  const fetchRelationships = async (search = "") => {
    try {
      setLoadingRel(true);
      const url = `/employee/relationships${
        search ? `?search=${encodeURIComponent(search)}` : ""
      }`;
      const res = await api.get(url);
      const items = res?.data?.data || [];
      setRelationships(items);
    } catch (err) {
      console.error("Failed to fetch relationships", err);
      setRelationships([]);
    } finally {
      setLoadingRel(false);
    }
  };

  useEffect(() => {
    if (debounceRefRel.current) clearTimeout(debounceRefRel.current);
    debounceRefRel.current = setTimeout(
      () => fetchRelationships(queryRel.trim()),
      300,
    );
    return () => clearTimeout(debounceRefRel.current);
  }, [queryRel]);

  // click outside to close relationship dropdown
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRefRel.current && !wrapperRefRel.current.contains(e.target)) {
        setShowRelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (pinValue && pinValue.length === 6) {
      const timer = setTimeout(() => {
        fetchAddressByPincode(pinValue);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [pinValue]);

  // --- Add or Update handler ---
  const onSubmit = async (data) => {
    // Build API payload keys expected by backend
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;

    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before adding emergency contact.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const employee_id = dbId || empCode;

    // UI-friendly entry we store locally (and send to update endpoint)
    const newEntry = {
      name: data.name || "",
      relationship: data.relationship || "",
      relationship_id: data.relationship_id || null,
      phone: data.phone || "",
      email: data.email || "",
      address_line_1: data.addressLineOne || "",
      address_line_2: data.addressLineTwo || "",
      city: data.city || "",
      state: data.state || "",
      country: data.country || "",
      postal_code: data.pin || "",
    };

    // EDIT MODE
    if (editingIndex !== null && editingIndex >= 0) {
      try {
        const existing = contact[editingIndex] || {};
        // try to extract an id of the specific contact entry if available
        const contact_id =
          existing._id ||
          existing.id ||
          existing.contact_id ||
          existing.emergency_contact_id ||
          null;

        // Build body expected by update endpoint
        const body = {
          employee_id,
          // ...(contact_id ? { contact_id } : {}),
          name: newEntry.name,
          relationship_id: newEntry.relationship_id,
          phone: newEntry.phone,
          email: newEntry.email,
          address_line_1: newEntry.address_line_1,
          address_line_2: newEntry.address_line_2,
          city: newEntry.city,
          state: newEntry.state,
          country: newEntry.country,
          postal_code: newEntry.postal_code,
        };

        // call update endpoint
        const res = await api.put(
          "/employee/update_employee_emergency_contact",
          body,
        );

        // prefer server-returned object if present
        let updatedItem = null;
        if (res?.data) {
          // common shapes: res.data.data or res.data.updated or res.data
          updatedItem = res.data.data || res.data.updated || res.data || null;
        }

        const newList = [...contact];
        if (updatedItem) {
          // map server response to UI shape (try multiple keys)
          const uiItem = {
            name: updatedItem.name || updatedItem.contact_name || newEntry.name,
            relationship:
              updatedItem.relationship_name ||
              updatedItem.relationship ||
              newEntry.relationship,
            relationship_id:
              updatedItem.relationship_id || newEntry.relationship_id,
            phone: updatedItem.phone || newEntry.phone,
            email: updatedItem.email || newEntry.email,
            address_line_1:
              updatedItem.address_line_1 || newEntry.address_line_1,
            address_line_2:
              updatedItem.address_line_2 || newEntry.address_line_2,
            city: updatedItem.city || newEntry.city,
            state: updatedItem.state || newEntry.state,
            country: updatedItem.country || newEntry.country,
            postal_code:
              updatedItem.postal_code ||
              updatedItem.pin ||
              newEntry.postal_code,
            _id: updatedItem._id || updatedItem.id || contact_id,
          };
          newList[editingIndex] = uiItem;
        } else {
          // fallback: merge locally and preserve id
          newList[editingIndex] = {
            ...newList[editingIndex],
            ...newEntry,
            _id: contact_id || newList[editingIndex]._id || null,
          };
        }

        setContact(newList);
        try {
          localStorage.setItem(
            "employee_emergency_contacts",
            JSON.stringify(newList),
          );
        } catch (e) {}

        toast({
          title: "Emergency contact updated",
          status: "success",
          duration: 1500,
          isClosable: true,
        });

        reset();
        setEditingIndex(null);
        onClose();
      } catch (err) {
        console.error("Update contact failed", err);
        toast({
          title: "Update failed",
          description:
            err?.response?.data?.message ||
            err?.message ||
            "Unable to update contact",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    // ADD MODE (existing behavior)
    const body = {
      employee_id,
      name: newEntry.name,
      relationship_id: newEntry.relationship_id,
      phone: newEntry.phone,
      email: newEntry.email,
      address_line_1: newEntry.address_line_1,
      address_line_2: newEntry.address_line_2,
      city: newEntry.city,
      state: newEntry.state,
      country: newEntry.country,
      postal_code: newEntry.postal_code,
    };

    try {
      // const res = await api.post(
      //   "/employee/add_employee_emergency_contact",
      //   body,
      // );

      // setContact((prev) => {
      //   const savedContact = res.data?.data;

      //   const next = [
      //     ...prev,
      //     {
      //       ...newEntry,
      //       employee_id,
      //       _id: savedContact?._id || savedContact?.id || null,
      //     },
      //   ];
      //   try {
      //     localStorage.setItem(
      //       "employee_emergency_contacts",
      //       JSON.stringify(next),
      //     );
      //   } catch (e) {}
      //   return next;
      // });
      await api.post("/employee/add_employee_emergency_contact", body);

      // Fetch the saved contact from backend to get its actual _id
      const orgId = localStorage.getItem("organisation_id");

      const res = await api.get("/employee/get_employee_emergency_contacts", {
        params: {
          employee_id,
          org_id: orgId,
        },
      });

      const updatedContacts = res.data?.data || [];

      setContact(updatedContacts);

      localStorage.setItem(
        "employee_emergency_contacts",
        JSON.stringify(updatedContacts),
      );

      toast({
        title: "Emergency Contact Added",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      reset();
      onClose();
    } catch (err) {
      console.error("Add emergency contact failed", err);
      toast({
        title: "Add failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to add contact",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete functionality

  const handleDelete = async (index) => {
    const stateContact = contact[index];

    const storedContacts = JSON.parse(
      localStorage.getItem("employee_emergency_contacts") || "[]",
    );

    const employeeId =
      stateContact?.employee_id ||
      getValues("employee_emp_code") ||
      localStorage.getItem("employee_emp_code");

    const selectedContact = stateContact?._id
      ? stateContact
      : storedContacts.find(
          (item) =>
            item._id &&
            item.employee_id === employeeId &&
            item.name === stateContact?.name &&
            item.phone === stateContact?.phone,
        ) || stateContact;

    const contactId =
      selectedContact?._id ||
      selectedContact?.contact_id ||
      selectedContact?.emergency_contact_id;

    console.log("React state contact:", stateContact);
    console.log("Selected contact:", selectedContact);
    console.log("Employee ID:", employeeId);
    console.log("Contact ID:", contactId);

    if (!employeeId || !contactId) {
      toast({
        title: "Delete failed",
        description: "Employee ID or contact ID is missing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await deleteEmployeeEmergencyContact(
        employeeId,
        contactId,
      );

      if (response?.success === false) {
        throw new Error(response?.msg || "Unable to delete contact");
      }

      const newList = contact.filter((_, i) => i !== index);

      setContact(newList);

      localStorage.setItem(
        "employee_emergency_contacts",
        JSON.stringify(newList),
      );

      toast({
        title: "Contact Details Deleted",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch (err) {
      console.error("Delete Contact Details failed", err);

      toast({
        title: "Delete failed",
        description: err?.message || err?.msg || "Unable to delete contact",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // open modal for Add (clears edit state)
  const openAddModal = () => {
    setEditingIndex(null);
    reset({
      name: "",
      relationship: "",
      relationship_id: null,
      phone: "",
      email: "",
      addressLineOne: "",
      addressLineTwo: "",
      city: "",
      state: "",
      country: "",
      pin: "",
    });
    onOpen();
  };

  const openEditModal = (row, idx) => {
    const relLabel =
      row.relationship ||
      row.relationship_name ||
      (row.relationship_id
        ? RELATIONSHIP_MAP[Number(row.relationship_id)]
        : "") ||
      "";

    reset({
      name: row.name || "",
      relationship: relLabel,
      relationship_id: row.relationship_id || row.relationship_id || null,
      phone: row.phone || "",
      email: row.email || "",
      addressLineOne: row.address_line_1 || row.addressLineOne || "",
      addressLineTwo: row.address_line_2 || row.addressLineTwo || "",
      city: row.city || "",
      state: row.state || "",
      country: row.country || "",
      pin: row.postal_code || row.pin || "",
    });
    try {
      setValue(
        "relationship_id",
        row.relationship_id || row.relationship_id || null,
      );
    } catch (e) {
      console.warn("Failed to set relationship_id in edit modal", e);
    }

    setEditingIndex(idx);
    onOpen();
  };

  // utility to capitalize first letter
  const capitalize = (str = "") => {
    const s = String(str).trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  // const fetchAddressByPincode = async (pincode) => {
  //   try {
  //     const res = await fetch(
  //       `https://api.postalpincode.in/pincode/${pincode}`
  //     );
  //     const data = await res.json();

  //     if (
  //       !Array.isArray(data) ||
  //       data[0]?.Status !== "Success" ||
  //       !data[0]?.PostOffice?.length
  //     ) {
  //       return;
  //     }

  //     const postOffice =
  //       data[0].PostOffice.find((po) => po.DeliveryStatus === "Delivery") ||
  //       data[0].PostOffice[0];

  //     methods.setValue("state", postOffice.State || "", { shouldValidate: true });
  //     methods.setValue("city", postOffice.Division || "", { shouldValidate: true });
  //     methods.setValue("country", postOffice.Country || "India", { shouldValidate: true });

  //   } catch (err) {
  //     console.error("Pincode lookup failed", err);
  //   }
  // };
  const fetchAddressByPincode = async (pincode) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data = await res.json();

      // ✅ Validation yahi hona chahiye
      if (
        !Array.isArray(data) ||
        data[0]?.Status !== "Success" ||
        !data[0]?.PostOffice?.length
      ) {
        methods.setValue("city", "");
        methods.setValue("state", "");
        methods.setValue("country", "");

        toast({
          title: "Invalid Pin Code",
          status: "error",
          duration: 2000,
          isClosable: true,
        });

        return;
      }

      const postOffice =
        data[0].PostOffice.find((po) => po.DeliveryStatus === "Delivery") ||
        data[0].PostOffice[0];

      methods.setValue("state", postOffice.State || "", {
        shouldValidate: true,
      });
      methods.setValue("city", postOffice.Division || "", {
        shouldValidate: true,
      });
      methods.setValue("country", postOffice.Country || "India", {
        shouldValidate: true,
      });
    } catch (err) {
      console.error("Pincode lookup failed", err);
    }
  };
  return (
    <Box
      p={4}
      border="1px solid #e2e8f0"
      borderRadius="14px"
      bg={"white"}
      // h="70vh"
      height={{ base: "50vh", sm: "61vh", md: "66vh", lg: "66Vh" }}
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
      <Flex justify="space-between" align="center">
        <Heading
          fontSize="23px"
          fontFamily="Poppins, sans-serif"
          pl={2}
          fontWeight={"600"}
          color={"#000"}
        >
          Emergency Contacts
        </Heading>

        <Button
          onClick={openAddModal}
          color="white"
          backgroundColor="#1A365D"
          _hover={{ bg: "#153e75" }}
          width={"121px"}
          borderRadius={"10px"}
          fontWeight={"500"}
          // mt={-2}
        >
          Add
        </Button>
      </Flex>
      <Box
        borderBottom="2px solid transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
        }}
        mt={6}
        mb={6}
        ml={-2}
        mr={-2}
      ></Box>

      {/* contact Table */}
      <Table variant="simple">
        <Thead
          sx={{
            th: {
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              textTransform: "capitalize",
              color: "black",
              h: "21px",
              w: "96px",
            },
          }}
        >
          <Tr>
            <Th>Name</Th>
            <Th>Relationship</Th>
            <Th>Phone</Th>
            <Th>City</Th>
            <Th textAlign={"center"}>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {contact?.map((v, idx) => (
            <Tr key={idx} justifyContent={"center"}>
              <Td>{v.name}</Td>
              <Td>
                {v.relationship ||
                  RELATIONSHIP_MAP[Number(v.relationship_id)] ||
                  v.relationship_name ||
                  (v.relationship && typeof v.relationship === "object"
                    ? v.relationship.name
                    : "")}
              </Td>
              <Td>{v.phone}</Td>
              <Td>{v.city}</Td>
              <Td textAlign={"center"}>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="ghost">
                    ...
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        openEditModal(v, idx);
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem color="red.500" onClick={() => handleDelete(idx)}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingIndex(null);
          reset();
        }}
      >
        <ModalOverlay />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader
                color={"#000"}
                fontWeight={"600"}
                fontFamily={"poppins"}
              >
                {editingIndex !== null
                  ? "Update Emergency Contact"
                  : "Emergency Contact"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* name */}
                <Box
                  borderBottom="2px solid transparent"
                  // sx={{
                  //   borderImage:
                  //     "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
                  // }}
                  sx={{
                    borderImage:
                      "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
                  }}
                  mt={-2}
                  mb={6}
                  ml={-5}
                  mr={-5}
                ></Box>
                <FormControl isRequired mb={3}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Name
                  </FormLabel>
                  <Input
                    // {...register("name", { required: true })}
                    maxLength={32}
                    {...register("name", {
                      required: "Name is required",
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(
                          /[^a-zA-Z ]/g,
                          "",
                        );
                      },
                    })}
                    placeholder="Enter name"
                    onBlur={(e) => {
                      const transformed = capitalize(e.target.value);
                      setValue("name", transformed, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                {/* Hidden relationship id for backend (if needed) */}
                <input type="hidden" {...register("relationship_id")} />

                {/* Relationship */}
                <FormControl
                  isRequired
                  mb={3}
                  ref={wrapperRefRel}
                  isInvalid={!!errors.relationship}
                >
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Relationship
                  </FormLabel>
                  <Controller
                    name="relationship"
                    control={methods.control}
                    rules={{ required: "Relationship is required" }}
                    render={({ field }) => (
                      <>
                        <Box position="relative">
                          <Input
                            {...field}
                            placeholder="Select Relationship"
                            readOnly
                            cursor="pointer"
                            onClick={() => {
                              setShowRelDropdown((prev) => !prev);
                              if (relationships.length === 0)
                                fetchRelationships("");
                            }}
                            paddingRight="40px"
                            {...inputStyle}
                          />

                          {/* 🔼🔽 Toggle Icon */}
                          <Box
                            position="absolute"
                            right="12px"
                            top="50%"
                            transform="translateY(-50%)"
                            pointerEvents="none"
                          >
                            {showRelDropdown ? (
                              <ChevronUpIcon boxSize={5} />
                            ) : (
                              <ChevronDownIcon boxSize={5} />
                            )}
                          </Box>
                        </Box>

                        {showRelDropdown && (
                          <Box
                            position="absolute"
                            left={0}
                            right={0}
                            mt={1}
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="md"
                            zIndex={50}
                            maxH="200px"
                            overflowY="auto"
                          >
                            {relationships.map((r) => (
                              <Box
                                key={r._id || r.id}
                                px={3}
                                py={2}
                                _hover={{ bg: "gray.50", cursor: "pointer" }}
                                onClick={() => {
                                  field.onChange(r.name);
                                  setValue(
                                    "relationship_id",
                                    r.id || r._id || null,
                                  );
                                  setShowRelDropdown(false); // 👈 close dropdown
                                }}
                              >
                                {r.name}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  />
                  {errors.relationship && (
                    <FormErrorMessage fontFamily={"poppins"}>
                      {errors.relationship.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                {/* phone number */}
                <FormControl isRequired mb={3} isInvalid={!!errors.phone}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Phone number
                  </FormLabel>
                  <Controller
                    name="phone"
                    control={methods.control}
                    rules={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone must be exactly 10 digits",
                      },
                      validate: {
                        notAllZeros: (value) =>
                          value !== "0000000000" ||
                          "Phone number cannot be all zeros",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Phone Number"
                        maxLength={10}
                        inputMode="numeric"
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          field.onChange(digits);
                        }}
                        {...inputStyle}
                      />
                    )}
                  />
                  {errors?.phone && (
                    <FormErrorMessage fontFamily={"poppins"}>
                      {errors.phone.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                {/* email */}
                {/* <FormControl isRequired mb={3} isInvalid={!!errors.email}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Email Address
                  </FormLabel>
                  <Controller
                    name="email"
                    control={methods.control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                      validate: (value) =>
                        value === value.toLowerCase() ||
                        "Capital letters are not allowed",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Email Address"
                        inputMode="email"
                        // onChange={(e) => field.onChange(e.target.value.trim())}
                        onChange={(e) => {
                          const lower = e.target.value.toLowerCase();
                          field.onChange(lower);
                        }}
                        {...inputStyle}
                      />
                    )}
                  />
                  {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                  )}
                </FormControl> */}
                <FormControl isRequired mb={3} isInvalid={!!errors.email}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Email address
                  </FormLabel>

                  <Controller
                    name="email"
                    control={methods.control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Email Address"
                        inputMode="email"
                        onChange={(e) => {
                          const input = e.target;
                          const cursorPos = input.selectionStart;
                          const lowerValue = input.value.toLowerCase();
                          field.onChange(lowerValue);
                          // cursor restore
                          requestAnimationFrame(() => {
                            input.setSelectionRange(cursorPos, cursorPos);
                          });
                        }}
                        {...inputStyle}
                      />
                    )}
                  />

                  {errors.email && (
                    <FormErrorMessage fontFamily={"poppins"}>
                      {errors.email.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                {/* address line 1 */}
                <FormControl
                  isRequired
                  mb={3}
                  isInvalid={!!errors?.addressLineOne}
                >
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Address line 1
                  </FormLabel>
                  <Input
                    // {...register("addressLineOne", { required: true })}
                    maxLength={32}
                    {...register("addressLineOne", {
                      required: "Address Line 1 is required",
                      validate: (value) =>
                        value.trim().length > 0 || "Address Line 1 is required",
                    })}
                    onChange={(e) => {
                      // ✅ Allow only letters & space
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      e.target.value = value;
                    }}
                    placeholder="Enter address line 1"
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors?.addressLineOne?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* address line 2 */}
                <FormControl mb={3}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Address line 2
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("addressLineTwo")}
                    placeholder="Enter address line 2"
                    {...inputStyle}
                  />
                </FormControl>

                {/* city */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.city}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    City
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("city", {
                      required: "City is required",
                      // validate: (value) =>
                      //   value.trim().length > 0 || "City is required",
                      validate: {
                        notEmpty: (value) =>
                          value.trim().length > 0 || "City is required",
                        onlyLetters: (value) =>
                          /^[A-Za-z ]+$/.test(value) ||
                          "Only alphabets are allowed",
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(
                          /[^A-Za-z ]/g,
                          "",
                        );
                      },
                    })}
                    placeholder="Enter City"
                    readOnly
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors?.city?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* state */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.state}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    State
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("state", {
                      required: "State is required",
                      // validate: (value) =>
                      //   value.trim().length > 0 || "State is required",
                      validate: {
                        notEmpty: (value) =>
                          value.trim().length > 0 || "State is required",
                        onlyLetters: (value) =>
                          /^[A-Za-z ]+$/.test(value) ||
                          "Only alphabets are allowed",
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(
                          /[^A-Za-z ]/g,
                          "",
                        );
                      },
                    })}
                    placeholder="Enter State"
                    readOnly
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors?.state?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* country */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.country}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Country
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("country", {
                      required: "Country is required",
                      // validate: (value) =>
                      //   value.trim().length > 0 || "Country is required",
                      validate: {
                        notEmpty: (value) =>
                          value.trim().length > 0 || "Country is required",
                        onlyLetters: (value) =>
                          /^[A-Za-z ]+$/.test(value) ||
                          "Only alphabets are allowed",
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(
                          /[^A-Za-z ]/g,
                          "",
                        );
                      },
                    })}
                    placeholder="Enter Country"
                    readOnly
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors?.country?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* pin code */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.pin}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Pin code
                  </FormLabel>

                  <Input
                    {...register("pin", {
                      required: "Pin code is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only digits are allowed",
                      },
                      validate: {
                        lengthCheck: (v) =>
                          v.length === 6 || "Pin code must be exactly 6 digits",
                      },
                    })}
                    placeholder="Enter Pin Code"
                    maxLength={6}
                    onChange={(e) => {
                      let cleaned = e.target.value.replace(/[^0-9]/g, "");
                      cleaned = cleaned.slice(0, 6);
                      e.target.value = cleaned;
                      setValue("pin", cleaned, { shouldValidate: true });
                    }}
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors?.pin?.message}
                  </FormErrorMessage>
                </FormControl>
              </ModalBody>

              <Flex justifyContent={"space-between"} p={4}>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={() => reset()}
                  color={"#757575"}
                  width={"121px"}
                  borderRadius={"10px"}
                  fontFamily={"poppins"}
                  fontWeight={"500"}
                >
                  Clear form
                </Button>
                <Button
                  type="submit"
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  width={"121px"}
                  borderRadius={"10px"}
                  fontFamily={"poppins"}
                  fontWeight={"500"}
                >
                  {editingIndex !== null ? "Update" : "Save"}
                </Button>
              </Flex>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </Box>
  );
}
