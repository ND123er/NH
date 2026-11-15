import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Text,
  useToast,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import api from "../../api/axios";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import { getOrgCode, getEmpCode } from "../../utils/token";

export default function AssignAssetModal({ isOpen, onClose, asset, onAssign }) {
  const toast = useToast();
  const orgId =
    getOrgIdFromReduxOrStorage?.() ||
    (typeof window !== "undefined" && localStorage.getItem("org_id"));

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      assetName: asset?.asset_name || asset?.name || "",
      assetCode: asset?.asset_code || asset?.assetId || "",
      serialNumber: asset?.serial_number || asset?.serialNumber || "",
      category: asset?.category || "",
      assignTo: "",
      assigned_to_id: "",
      note: "",
    },
  });

  // keep form in sync when asset changes
  useEffect(() => {
    reset({
      assetName: asset?.asset_name || asset?.name || "",
      assetCode: asset?.asset_code || asset?.assetId || "",
      serialNumber: asset?.serial_number || asset?.serialNumber || "",
      category: asset?.category || "",
      assignTo: "",
      assigned_to_id: "",
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  // ---- Assign-to dropdown (similar to Qualification in EducationDetails) ----
  const [employees, setEmployees] = useState([]);
  const [queryAssign, setQueryAssign] = useState("");
  const [showDropdownAssign, setShowDropdownAssign] = useState(false);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const debounceRefAssign = useRef(null);
  const wrapperRefAssign = useRef(null);

  // fetch employees (GET /employee/get_employees_list?org_id=...&search=...)
  const fetchEmployees = async (search = "") => {
    try {
      setLoadingEmp(true);
      const url = `/employee/get_employees_list?org_id=${orgId || ""
        }&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      const items = res?.data?.data || [];
      setEmployees(items);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setEmployees([]);
    } finally {
      setLoadingEmp(false);
    }
  };

  // Debounced search when queryAssign changes (exactly like Qualification)
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRefAssign.current) clearTimeout(debounceRefAssign.current);
    debounceRefAssign.current = setTimeout(() => {
      fetchEmployees(queryAssign.trim());
    }, 300);
    return () => clearTimeout(debounceRefAssign.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryAssign, isOpen]);

  // click outside to close dropdown (again matching pattern)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideAssign =
        wrapperRefAssign.current && wrapperRefAssign.current.contains(e.target);
      if (!clickedInsideAssign) setShowDropdownAssign(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // load initial list (no search) when modal opens (same as onFocus fetch in your pattern)
  useEffect(() => {
    if (isOpen) {
      fetchEmployees("");
      setShowDropdownAssign(false);
      setQueryAssign("");
    } else {
      setEmployees([]);
      setShowDropdownAssign(false);
      setQueryAssign("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmitAssign = async (formData) => {
    const selectedEmpId = formData.assigned_to_id || "";
    if (!selectedEmpId) {
      toast({
        title: "Select employee",
        description: "Please select an employee from the dropdown.",
        status: "warning",
      });
      return;
    }

    const assigned_by = getEmpCode() || null;

    const payload = {
      asset_name: asset?.asset_name || asset?.name || "",
      asset_id: asset?.raw?._id || asset?.raw?.asset_id || asset?.asset_id || asset?.id || "",
      asset_code: asset?.asset_code || asset?.assetCode || asset?.assetId || "",
      assigned_to: selectedEmpId,
      assigned_by,
      assignment_date: new Date().toISOString(),
      serial_number: asset?.serial_number || asset?.serialNumber || "",
      category: asset?.category || "",
      note: formData.note || "",
      organisation_id: orgId || "",
    };

    try {
      await api.post(`/assets/assign_asset`, payload);

      toast({
        status: "success",
        title: "Asset assigned",
        duration: 2000,
      });

      if (typeof onAssign === "function") {
        try {
          onAssign(payload);
        } catch (_) { }
      }

      onClose();
    } catch (err) {
      console.error("Assign failed", err);
      toast({
        status: "error",
        title: "Failed to assign",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to assign asset",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign asset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Asset name</FormLabel>
              <Input
                {...register("assetName", {
                  required: "Asset name is required",
                })}
                isReadOnly
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Asset Category Code</FormLabel>
              <Input
                {...register("assetCode", {
                  required: "Asset Category code is required",
                })}
                isReadOnly
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Serial number</FormLabel>
              <Input
                {...register("serialNumber", {
                  required: "Serial number is required",
                })}
                isReadOnly
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Input
                {...register("category", { required: "Category is required" })}
                isReadOnly
              />
            </FormControl>

            {/* Assign to - behaves like Qualification in EducationDetails */}
            <FormControl isRequired mb={3} ref={wrapperRefAssign}>
              <FormLabel>Assign to</FormLabel>
              {/* hidden employee id for backend */}
              <input
                type="hidden"
                {...register("assigned_to_id", { required: true })}
              />
              <Controller
                name="assignTo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="Enter employee name or ID"
                      onChange={(e) => {
                        field.onChange(e);
                        setQueryAssign(e.target.value);
                        setShowDropdownAssign(true);
                      }}
                      onFocus={() => {
                        setShowDropdownAssign(true);
                        if (employees.length === 0) fetchEmployees("");
                      }}
                    />

                    {showDropdownAssign && (
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
                        {loadingEmp ? (
                          <Box p={2}>Loading...</Box>
                        ) : employees.length === 0 ? (
                          <Box p={2}>No results</Box>
                        ) : (
                          employees.map((emp) => (
                            <Box
                              key={emp.employee_id || emp.id}
                              px={3}
                              py={2}
                              _hover={{ bg: "gray.50", cursor: "pointer" }}
                              onClick={() => {
                                const label =
                                  emp.full_name || emp.name || emp.employee_id;
                                field.onChange(label);
                                setValue(
                                  "assigned_to_id",
                                  emp.employee_id || emp.id || ""
                                );
                                setShowDropdownAssign(false);
                              }}
                            >
                              <Text fontWeight="500">
                                {emp?.full_name || emp?.name || emp?.employee_id}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {/* {emp.employee_id} */}
                                {emp?.employee_code}
                              </Text>
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </>
                )}
              />
              {(errors.assignTo || errors.assigned_to_id) && (
                <Text color="red.500" fontSize="12px" mt={1}>
                  Please select an employee.
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea
                {...register("note")}
                placeholder="Write your note..."
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Flex justifyContent="space-between" gap={2} width={"100%"}>
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isSubmitting}
              border={"1px solid #e6e6e6"}
              color="#757575"
            >
              Cancel
            </Button>
            <Button
              bg="#274167"
              color="white"
              _hover={{ bg: "#1f3143" }}
              onClick={handleSubmit(handleSubmitAssign)}
              isLoading={isSubmitting}
            >
              Assign
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
