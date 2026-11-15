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
  Spinner,
  Flex,
  Text,
  useToast,
  Box,
} from "@chakra-ui/react";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DepartmentEditModal({
  isOpen,
  onClose,
  departmentId,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    department_name: "",
    email: "",
    head_of_department: "",
    is_active: true,
    organisation_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // HOD search state
  const [hodQuery, setHodQuery] = useState("");
  const [hodOptions, setHodOptions] = useState([]);
  const [hodLoading, setHodLoading] = useState(false);
  const [showHodDropdown, setShowHodDropdown] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
  });

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

  // Fetch single department when modal opens
  useEffect(() => {
    if (!isOpen || !departmentId) return;

    const fetchSingleDepartment = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/settings/get_single_department/${departmentId}`;
        const res = await api.get(url);
        const data = res?.data?.data;

        if (data) {
          setFormData({
            department_name: data.department_name || "",
            email: data.email || "",
            head_of_department: data.head_of_department || "",
            description: data.description || "",
            is_active: data.is_active ?? true,
            organisation_id: data.organisation_id || "",
          });

          setHodQuery(data.head_of_department || "");
        }
      } catch (err) {
        console.error("Failed to fetch single department", err);
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load department details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingleDepartment();
  }, [isOpen, departmentId]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      setErrors((prev) => ({
        ...prev,
        email:
          value.trim() === ""
            ? "Email is required"
            : emailRegex.test(value)
              ? ""
              : "Invalid email format",
      }));
    }
  };

  // =========================
  // API: search employees (3+ chars)
  // =========================
  const fetchEmployees = async (search) => {
    if (!search || search.trim().length < 3) return;

    setHodLoading(true);
    try {
      const orgId = getOrgCode();
      const res = await api.get("employee/get_employees_list", {
        params: {
          org_id: orgId,
          search: search.trim(),
        },
      });

      const data = res?.data?.data || [];
      setHodOptions(data);
      setShowHodDropdown(true);
    } catch (err) {
      console.error("Error fetching employees list:", err);
      toast({
        title: "Failed to search employees",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Something went wrong while searching employees",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setHodOptions([]);
      setShowHodDropdown(false);
    } finally {
      setHodLoading(false);
    }
  };

  // handle typing in HOD field
  const handleHodChange = (e) => {
    const value = e.target.value;
    setHodQuery(value);

    // user is typing manually, so clear stored id until they select
    setFormData((prev) => ({
      ...prev,
      head_of_department: "",
    }));

    if (value.trim().length >= 3) {
      fetchEmployees(value);
    } else {
      setHodOptions([]);
      setShowHodDropdown(false);
    }
  };

  const handleSelectEmployee = (emp) => {
    setHodQuery(emp.full_name);
    setFormData((prev) => ({
      ...prev,
      head_of_department: emp.employee_id,
    }));
    setShowHodDropdown(false);
  };

  const handleUpdate = async () => {
    // block if email invalid
    if (errors.email) {
      toast({
        title: "Invalid email",
        description: errors.email,
        status: "error",
        duration: 3000,
      });
      return;
    }

    // block if empty
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast({
        title: "Email required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!departmentId) return;

    setSaving(true);
    setError(null);
    try {
      const url = `/organization/update_company_department/${departmentId}`;

      const payload = {
        department_name: formData.department_name,
        email: formData.email,
        head_of_department: formData.head_of_department,
        description: formData.description,
        is_active: formData.is_active,
        organisation_id: formData.organisation_id,
      };

      await api.put(url, payload);

      toast({
        title: "Department updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update department", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update department"
      );
      toast({
        title: "Failed to update department",
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{base:'sm',sm:'md',md:'md',lg:'lg'}}>
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Department</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading department details...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box fontFamily={"Poppins"}>
              <FormControl mb={3}>
                <FormLabel fontSize="sm" fontFamily="Poppins', sans-serif">Department name</FormLabel>
                <Input
                  value={formData.department_name}
                  onChange={handleChange("department_name")}
                  placeholder="Enter department name"
                  {...inputStyle}
                />
              </FormControl>

              <FormControl mb={3} isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" fontFamily="Poppins', sans-serif">Email</FormLabel>
                <Input
                  value={formData.email || ""}
                  onChange={handleChange("email")}
                  placeholder="Enter email"
                  {...inputStyle}
                />
                {errors.email && (
                  <Text color="red.500" fontFamily="Poppins', sans-serif" fontSize="xs" mt={1}>
                    {errors.email}
                  </Text>
                )}
              </FormControl>

              {/* Head of the department */}
              <FormControl mb={3} position="relative">
                <FormLabel fontSize="sm" fontFamily="Poppins', sans-serif">Head of the department</FormLabel>
                <Box position="relative">
                  <Input
                    value={hodQuery}
                    onChange={handleHodChange}
                    fontFamily="Poppins', sans-serif"
                    placeholder="Head of the department"
                    {...inputStyle}
                    autoComplete="off"
                    onFocus={() => {
                      if (hodOptions.length > 0) setShowHodDropdown(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowHodDropdown(false), 150);
                    }}
                  />

                  {showHodDropdown && (
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
                      {hodLoading ? (
                        <Box px={3} py={2}>
                          <Text fontSize="sm" fontFamily="Poppins', sans-serif" color="gray.500">
                            Searching...
                          </Text>
                        </Box>
                      ) : hodOptions.length === 0 ? (
                        <Box px={3} py={2}>
                          <Text fontSize="sm" fontFamily="Poppins', sans-serif" color="gray.500">
                            No employees found
                          </Text>
                        </Box>
                      ) : (
                        hodOptions.map((emp) => (
                          <Box
                            key={emp.employee_id}
                            px={3}
                            py={2}
                            _hover={{ bg: "gray.50" }}
                            cursor="pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectEmployee(emp);
                            }}
                          >
                            <Text fontSize="sm" fontFamily="Poppins', sans-serif" fontWeight="500">
                              {emp.full_name}
                            </Text>
                            {emp.employee_code && (
                              <Text fontSize="xs" fontFamily="Poppins', sans-serif" color="gray.500">
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
                <FormLabel fontSize="sm" fontFamily="Poppins', sans-serif">Description</FormLabel>
                <Textarea
                fontFamily="Poppins', sans-serif"
                  value={formData.description || ""}
                  onChange={handleChange("description")}
                  placeholder="Enter description"
                  {...inputStyle}
                  rows={3}
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
            fontFamily="Poppins', sans-serif"
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
            fontFamily="Poppins', sans-serif"
          >
            Update
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
