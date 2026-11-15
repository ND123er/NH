// DivisionEditModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function DivisionEditModal({
  isOpen,
  onClose,
  divisionId,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    division_name: "",
    division_code: "",
    description: "",
    divisional_head: "",
    email: "",
    organisation_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [divisionHeadQuery, setDivisionHeadQuery] = useState("");
  const [divisionHeadOptions, setDivisionHeadOptions] = useState([]);
  const [divisionHeadLoading, setDivisionHeadLoading] = useState(false);
  const [showDivisionHeadDropdown, setShowDivisionHeadDropdown] =
    useState(false);

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
    borderRadius: "8px",
  };

  // fetch single division when modal opens
  useEffect(() => {
    if (!isOpen || !divisionId) return;

    const fetchSingle = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/organization/get_single_division/${encodeURIComponent(
          divisionId,
        )}`;
        const res = await api.get(url);
        const data = res?.data?.data || res?.data;

        if (data) {
          setFormData({
            division_name: data?.division?.division_name || "",
            division_code: data?.division?.division_code || "",
            description: data?.division?.description || "",
            divisional_head: data?.division?.divisional_head || "",
            email: data?.division?.email || "",
            organisation_id:
              data?.division?.organisation_id || getOrgCode() || "",
          });
          setDivisionHeadQuery(data?.division?.divisional_head_name || "");
          setDivisionHeadOptions([]);
          setShowDivisionHeadDropdown(false);
        }
      } catch (err) {
        console.error("Failed to fetch division", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load division details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingle();
  }, [isOpen, divisionId]);

  // const handleChange = (field) => (e) => {

  //   setFormData((p) => ({ ...p, [field]: e.target.value }));
  // };
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    switch (field) {
      case "division_name":
      case "divisional_head":
        // Only letters and spaces
        value = value.replace(/[^A-Za-z\s]/g, "");
        break;

      case "division_code":
        // Only letters and numbers
        value = value.replace(/[^A-Za-z0-9]/g, "");
        break;

      case "email":
        // Force lowercase
        // value = value.toLowerCase();
        break;

      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailChange = (e) => {
    const input = e.target;
    const cursorPos = input.selectionStart; // current cursor position
    const lowerValue = e.target.value.toLowerCase();

    setFormData((prev) => ({
      ...prev,
      email: lowerValue,
    }));

    // update cursor after state change
    setTimeout(() => {
      input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const fetchEmployees = async (search) => {
    if (!search || search.trim().length < 3) return;

    setDivisionHeadLoading(true);

    try {
      const res = await api.get("/employee/get_employees_list", {
        params: {
          org_id: getOrgCode(),
          search: search.trim(),
        },
      });

      const data = res?.data?.data || [];

      setDivisionHeadOptions(Array.isArray(data) ? data : []);
      setShowDivisionHeadDropdown(true);
    } catch (err) {
      console.error("Error fetching employees list:", err);

      toast({
        title: "Failed to search employees",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while searching employees",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      setDivisionHeadOptions([]);
      setShowDivisionHeadDropdown(false);
    } finally {
      setDivisionHeadLoading(false);
    }
  };

  const handleDivisionHeadChange = (e) => {
    const value = e.target.value;

    setDivisionHeadQuery(value);

    // Clear previous ID when user starts searching.
    setFormData((prev) => ({
      ...prev,
      divisional_head: "",
    }));

    if (value.trim().length >= 3) {
      fetchEmployees(value);
    } else {
      setDivisionHeadOptions([]);
      setShowDivisionHeadDropdown(false);
    }
  };

  const handleSelectDivisionHead = (emp) => {
    // Show the employee name.
    setDivisionHeadQuery(emp.full_name);

    // Store the employee ID for the update API.
    setFormData((prev) => ({
      ...prev,
      divisional_head: emp.employee_id,
    }));

    setShowDivisionHeadDropdown(false);
  };

  const handleUpdate = async () => {
    if (!divisionId) return;

    if (!formData.division_name.trim()) {
      toast({
        title: "Division name required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const url = `/organization/update_single_division/${divisionId}`;
      const payload = {
        division_name: formData.division_name,
        division_code: formData.division_code,
        description: formData.description,
        divisional_head: formData.divisional_head,
        email: formData.email,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({ title: "Division updated", status: "success", duration: 3000 });
      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update division", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update division",
      );
      toast({
        title: "Failed to update division",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!divisionId) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Division</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading division details...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box>
              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Division name</FormLabel>
                <Input
                  value={formData.division_name}
                  // onChange={handleChange("division_name")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      division_name: value,
                    }));
                  }}
                  placeholder="Enter division name"
                  {...inputStyle}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel fontSize="sm">Division code</FormLabel>
                <Input
                  value={formData.division_code}
                  // onChange={handleChange("division_code")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                    // .toUpperCase()
                    setFormData((prev) => ({
                      ...prev,
                      division_code: value,
                    }));
                  }}
                  placeholder="Enter division code"
                  {...inputStyle}
                />
              </FormControl>

              {/* <FormControl mb={3}>
                <FormLabel fontSize="sm">Divisional head</FormLabel>
                <Input
                  value={formData.divisional_head}
                  onChange={handleChange("divisional_head")}
                  placeholder="Divisional head"
                  {...inputStyle}
                />
              </FormControl> */}

              <FormControl mb={3} position="relative">
                <FormLabel fontSize="sm">Divisional head</FormLabel>

                <Box position="relative">
                  <Input
                    value={divisionHeadQuery}
                    onChange={handleDivisionHeadChange}
                    placeholder="Divisional head"
                    {...inputStyle}
                    autoComplete="off"
                    onFocus={() => {
                      if (divisionHeadOptions.length > 0) {
                        setShowDivisionHeadDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowDivisionHeadDropdown(false), 150);
                    }}
                  />

                  {showDivisionHeadDropdown && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      mt={1}
                      bg="white"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                      maxH="220px"
                      overflowY="auto"
                      zIndex={10}
                      boxShadow="sm"
                    >
                      {divisionHeadLoading ? (
                        <Box px={3} py={2}>
                          <Text fontSize="sm" color="gray.500">
                            Searching...
                          </Text>
                        </Box>
                      ) : divisionHeadOptions.length === 0 ? (
                        <Box px={3} py={2}>
                          <Text fontSize="sm" color="gray.500">
                            No employees found
                          </Text>
                        </Box>
                      ) : (
                        divisionHeadOptions.map((emp) => (
                          <Box
                            key={emp.employee_id}
                            px={3}
                            py={2}
                            _hover={{ bg: "gray.50" }}
                            cursor="pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectDivisionHead(emp);
                            }}
                          >
                            <Text fontSize="sm" fontWeight="500">
                              {emp.full_name}
                            </Text>

                            {emp.employee_code && (
                              <Text fontSize="xs" color="gray.500">
                                {emp.employee_code}
                              </Text>
                            )}
                          </Box>
                        ))
                      )}
                    </Box>
                  )}
                </Box>
              </FormControl>

              <FormControl mb={3}>
                <FormLabel fontSize="sm">Email</FormLabel>
                {/* <Input
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="Enter email"
                  {...inputStyle}
                /> */}
                <Input
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="Enter email"
                  {...inputStyle}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Enter description"
                  rows={3}
                  {...inputStyle}
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>

        <Flex p={4} justify={"space-between"}>
          <Button
            onClick={handleClose}
            size="sm"
            color={"#757575"}
            bg={"white"}
          >
            Cancel
          </Button>
          <Button
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.800" }}
            size="sm"
            onClick={handleUpdate}
            isLoading={saving}
            isDisabled={loading}
          >
            Update
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
