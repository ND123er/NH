import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Radio,
  Checkbox,
  HStack,
  Box,
  VStack,
  Text,
  useToast,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";

export default function EditHolidayModal({
  isOpen,
  onClose,
  holiday,
  onUpdated,
}) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: "",
      from: "",
      to: "",
      type: "",
      days: "",
      // applicable: "all",
      applicable: ["all"],
      locations: [],
      departments: [],
      notes: "",
    },
  });

  const applicable = watch("applicable");

  /* -------------------- LOCATION / DEPARTMENT STATE -------------------- */

  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [locationsFetched, setLocationsFetched] = useState(false);
  const [departmentsFetched, setDepartmentsFetched] = useState(false);

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

  // helper: format ISO timestamp to YYYY-MM-DD suitable for <input type="date">
  const formatIsoToInputDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return "";
    }
  };

  /* -------------------- PREFILL FORM -------------------- */

  useEffect(() => {
    if (!holiday) return;

    const holidayTypeMap = {
      PUBLIC: "Public Holiday",
      COMPANY: "Company Holiday",
    };

    reset({
      name: holiday.name,
      from: formatIsoToInputDate(holiday.start_date),
      to: formatIsoToInputDate(holiday.end_date),
      type: holidayTypeMap[holiday.holiday_type],
      days: holiday.no_of_days,
      notes: holiday.description || "",
      // applicable:
      //   holiday.applies_to === "ALL"
      //     ? "all"
      //     : holiday.applies_to === "LOCATION"
      //       ? "location"
      //       : "department",
      applicable:
        holiday.applies_to === "ALL"
          ? ["all"]
          : holiday.applies_to === "LOCATION"
            ? ["location"]
            : holiday.applies_to === "DEPARTMENT"
              ? ["department"]
              : holiday.applies_to === "LOCATION_DEPARTMENT"
                ? ["location", "department"]
                : ["all"],
      locations: holiday.location_ids || [],
      departments: holiday.department_ids || [],
    });

    // also validate and compute days based on dates
    const fromVal = formatIsoToInputDate(holiday.start_date);
    const toVal = formatIsoToInputDate(holiday.end_date);
    if (fromVal && toVal) {
      const start = parseInputDate(fromVal);
      const end = parseInputDate(toVal);
      if (start && end && end >= start) {
        const diffDays = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
        setValue("days", diffDays);
        clearErrors("to");
      } else {
        setError("to", {
          type: "validate",
          message: "End date cannot be before start date",
        });
        if (!toast.isActive("holiday-date-error")) {
          toast({
            id: "holiday-date-error",
            title: "End date cannot be before start date",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    }
  }, [holiday, reset, setValue, setError, clearErrors]);

  /* -------------------- FETCH LOCATIONS -------------------- */

  useEffect(() => {
    // if (applicable !== "location" || locationsFetched) return;
    if (!applicable?.includes("location") || locationsFetched) return;

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/settings/get_company_location_list?org_id=${orgId}`,
        );

        if (res?.data?.status) {
          setLocations(res.data.locations || []);
          setLocationsFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [applicable, locationsFetched]);

  /* -------------------- FETCH DEPARTMENTS -------------------- */

  useEffect(() => {
    // if (applicable !== "department" || departmentsFetched) return;
    if (!applicable?.includes("department") || departmentsFetched) return;

    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/settings/get_company_departments?org_id=${orgId}`,
        );

        if (res?.data?.data) {
          setDepartments(res.data.data);
          setDepartmentsFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [applicable, departmentsFetched]);

  // helper: parse YYYY-MM-DD from date input without timezone shifts
  const parseInputDate = (value) => {
    if (!value) return null;
    const parts = String(value)
      .split("-")
      .map((p) => Number(p));
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  // auto-calc days when from/to change
  const fromVal = watch("from");
  const toVal = watch("to");

  useEffect(() => {
    if (!fromVal || !toVal) return;
    const start = parseInputDate(fromVal);
    const end = parseInputDate(toVal);
    if (!start || !end) return;
    if (end < start) {
      setError("to", {
        type: "validate",
        message: "End date cannot be before start date",
      });
      if (!toast.isActive("holiday-date-error")) {
        toast({
          id: "holiday-date-error",
          title: "End date cannot be before start date",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
      return;
    }
    clearErrors("to");
    const diffDays = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
    setValue("days", diffDays);
  }, [fromVal, toVal, setValue, setError, clearErrors, toast]);

  /* -------------------- SUBMIT -------------------- */

  const onSubmit = async (data) => {
    try {
      // const appliesToMap = {
      //   all: "ALL",
      //   location: "LOCATION",
      //   department: "DEPARTMENT",
      // };

      const selected = Array.isArray(data.applicable) ? data.applicable : [];

      const hasLocation = selected.includes("location");
      const hasDepartment = selected.includes("department");

      const appliesTo =
        hasLocation && hasDepartment
          ? "LOCATION_DEPARTMENT"
          : hasLocation
            ? "LOCATION"
            : hasDepartment
              ? "DEPARTMENT"
              : "ALL";

      const holidayTypeMap = {
        "Public Holiday": "PUBLIC",
        "Company Holiday": "COMPANY",
      };

      if (hasLocation && !data.locations?.length) {
        toast({
          title: "Please select at least one location",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (hasDepartment && !data.departments?.length) {
        toast({
          title: "Please select at least one department",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const payload = {
        name: data.name.trim(),
        start_date: data.from,
        end_date: data.to,
        holiday_type: holidayTypeMap[data.type],
        // applies_to: appliesToMap[data.applicable],
        // location_ids:
        //   data.applicable === "location" ? data.locations || [] : [],
        // department_ids:
        //   data.applicable === "department" ? data.departments || [] : [],
        applies_to: appliesTo,
        location_ids: hasLocation ? data.locations || [] : [],
        department_ids: hasDepartment ? data.departments || [] : [],
        no_of_days: Number(data.days),
        description: data.notes?.trim() || "",
      };

      await api.put(`/settings/update_holiday/${holiday._id}`, payload);

      toast({
        title: "Holiday updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await onUpdated();
      onClose();
    } catch (err) {
      toast({
        title: "Failed to update holiday",
        status: "error",
      });
      console.error(err);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="16px">
        <ModalHeader fontFamily={"Poppins"}>Edit Holiday</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontFamily={"Poppins"}>Holiday name</FormLabel>
                <Input
                  {...register("name", { required: true })}
                  {...inputStyle}
                />
              </FormControl>

              <HStack>
                <FormControl isRequired>
                  <FormLabel fontFamily={"Poppins"}>From</FormLabel>
                  <Input
                    type="date"
                    {...register("from", { required: true })}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.to}>
                  <FormLabel fontFamily={"Poppins"}>To</FormLabel>
                  <Input
                    type="date"
                    {...register("to", { required: true })}
                    {...inputStyle}
                  />
                  {/* <FormErrorMessage>{errors.to?.message}</FormErrorMessage> */}
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontFamily={"Poppins"}>Number of days</FormLabel>
                <Input
                  type="number"
                  isReadOnly
                  pointerEvents={"none"}
                  {...register("days", { min: 1 })}
                  {...inputStyle}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontFamily={"Poppins"}>Holiday type</FormLabel>
                <Select
                  {...register("type", { required: true })}
                  {...inputStyle}
                >
                  <option>Public Holiday</option>
                  <option>Company Holiday</option>
                </Select>
              </FormControl>

              {/* Applicable To */}
              {/* <FormControl isRequired>
                <FormLabel fontFamily={"Poppins"}>Applicable to</FormLabel>
                <Controller
                  name="applicable"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <HStack spacing={6}>
                        <Radio
                          value="all"
                          sx={{
                            "&[data-checked]": {
                              borderColor: "#243b66",
                              bg: "#243b66",
                            },
                            "&[data-checked]::before": {
                              bg: "white",
                            },
                          }}
                        >
                          All employees
                        </Radio>
                        <Radio
                          value="location"
                          sx={{
                            "&[data-checked]": {
                              borderColor: "#243b66",
                              bg: "#243b66",
                            },
                            "&[data-checked]::before": {
                              bg: "white",
                            },
                          }}
                          fontFamily={"Poppins"}
                        >
                          By location
                        </Radio>
                        <Radio
                          value="department"
                          sx={{
                            "&[data-checked]": {
                              borderColor: "#243b66",
                              bg: "#243b66",
                            },
                            "&[data-checked]::before": {
                              bg: "white",
                            },
                          }}
                          fontFamily={"Poppins"}
                        >
                          By department
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  )}
                />
              </FormControl> */}
              {/* Applicable To */}
              <FormControl isRequired>
                <FormLabel fontFamily="Poppins">Applicable to</FormLabel>

                <Controller
                  name="applicable"
                  control={control}
                  render={({ field: { value = [], onChange } }) => {
                    const selected = Array.isArray(value) ? value : [];

                    // const handleAll = () => {
                    //   onChange(["all"]);
                    //   setValue("locations", []);
                    //   setValue("departments", []);
                    // };
                    const handleAll = () => {
                      onChange(selected.includes("all") ? [] : ["all"]);
                      setValue("locations", []);
                      setValue("departments", []);
                    };

                    const handleCheckbox = (option) => {
                      const current = selected.filter((item) => item !== "all");

                      const updated = current.includes(option)
                        ? current.filter((item) => item !== option)
                        : [...current, option];

                      if (option === "location" && current.includes(option)) {
                        setValue("locations", []);
                      }

                      if (option === "department" && current.includes(option)) {
                        setValue("departments", []);
                      }

                      // onChange(updated.length ? updated : ["all"]);
                      onChange(updated);
                    };

                    return (
                      <HStack spacing={6} flexWrap="wrap">
                        {/* <Radio
                          isChecked={selected.includes("all")}
                          onChange={handleAll}
                          colorScheme="blue"
                        >
                          All employees
                        </Radio> */}

                        <Checkbox
                          isChecked={selected.includes("all")}
                          onChange={handleAll}
                          colorScheme="blue"
                        >
                          All employees
                        </Checkbox>

                        <Checkbox
                          isChecked={selected.includes("location")}
                          isDisabled={selected.includes("all")}
                          onChange={() => handleCheckbox("location")}
                          colorScheme="blue"
                        >
                          By location
                        </Checkbox>

                        <Checkbox
                          isChecked={selected.includes("department")}
                          isDisabled={selected.includes("all")}
                          onChange={() => handleCheckbox("department")}
                          colorScheme="blue"
                        >
                          By department
                        </Checkbox>
                      </HStack>
                    );
                  }}
                />
              </FormControl>

              {/* Locations */}
              {/* {applicable === "location" &&  */}
              {applicable?.includes("location") && (
                <Box
                  border="1px solid #e6e6e6"
                  p={3}
                  borderRadius="md"
                  fontFamily={"Poppins"}
                >
                  <Text fontWeight="600" mb={2}>
                    Locations
                  </Text>

                  {loadingLocations ? (
                    <Text fontSize="sm">Loading locations...</Text>
                  ) : (
                    <Controller
                      name="locations"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <VStack align="start">
                          {locations.map((loc) => (
                            <Checkbox
                              key={loc._id}
                              isChecked={value?.includes(loc._id)}
                              onChange={() =>
                                value?.includes(loc._id)
                                  ? onChange(value.filter((v) => v !== loc._id))
                                  : onChange([...(value || []), loc._id])
                              }
                            >
                              {loc.location_name}
                            </Checkbox>
                          ))}
                        </VStack>
                      )}
                    />
                  )}
                </Box>
              )}

              {/* Departments */}
              {/* {applicable === "department" &&  */}
              {applicable?.includes("department") && (
                <Box
                  border="1px solid #e6e6e6"
                  p={3}
                  borderRadius="md"
                  fontFamily={"Poppins"}
                >
                  <Text fontWeight="600" mb={2}>
                    Departments
                  </Text>

                  {loadingDepartments ? (
                    <Text fontSize="sm">Loading departments...</Text>
                  ) : (
                    <Controller
                      name="departments"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <VStack align="start">
                          {departments.map((dept) => (
                            <Checkbox
                              key={dept._id}
                              isChecked={value?.includes(dept._id)}
                              onChange={() =>
                                value?.includes(dept._id)
                                  ? onChange(
                                      value.filter((v) => v !== dept._id),
                                    )
                                  : onChange([...(value || []), dept._id])
                              }
                            >
                              {dept.department_name}
                            </Checkbox>
                          ))}
                        </VStack>
                      )}
                    />
                  )}
                </Box>
              )}

              <FormControl>
                <FormLabel fontFamily={"Poppins"}>Notes</FormLabel>
                <Textarea {...register("notes")} {...inputStyle} />
              </FormControl>
            </Stack>
          </ModalBody>

          <Flex justify="space-between" p={4} pt={0}>
            <Button
              variant="ghost"
              mr={3}
              color={"#757575"}
              onClick={onClose}
              fontFamily={"Poppins"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              bg="#274167"
              color="white"
              isLoading={isSubmitting}
              _hover={{
                bg: "blue.700",
              }}
              fontFamily={"Poppins"}
            >
              Update
            </Button>
          </Flex>
        </form>
      </ModalContent>
    </Modal>
  );
}
