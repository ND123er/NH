import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddDepartmentForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Head of Department search state
  const [hodQuery, setHodQuery] = useState("");
  const [hodOptions, setHodOptions] = useState([]);
  const [hodLoading, setHodLoading] = useState(false);
  const [showHodDropdown, setShowHodDropdown] = useState(false);
  const [selectedHodId, setSelectedHodId] = useState("");
  const [error, setError] = useState(null);
  const [existingDep, setExistingDep] = useState([]);

  useEffect(() => {
    const fetchDep = async () => {
      try {
        const orgId =
          getOrgCode?.() ||
          (typeof window !== "undefined" && localStorage.getItem("org_code"));

        const org = orgId;

        const url = `/settings/get_company_departments?org_id=${encodeURIComponent(
          org,
        )}`;

        const res = await axios.get(url);
        const data = res?.data?.data || [];

        setExistingDep(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch departments", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load departments",
        );
      }
    };

    fetchDep();
  }, []);

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

  // =========================
  // API: search employees
  // =========================
  const fetchEmployees = async (search) => {
    if (!search || search.trim().length < 3) return;

    setHodLoading(true);
    try {
      const orgId = getOrgCode();
      const res = await axios.get("employee/get_employees_list", {
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

  // handle HOD input change
  const handleHodChange = (e) => {
    const value = e.target.value;
    setHodQuery(value);

    // reset selected id
    setSelectedHodId("");
    setValue("head_of_department", "");

    if (value.trim().length >= 3) {
      fetchEmployees(value);
    } else {
      setHodOptions([]);
      setShowHodDropdown(false);
    }
  };

  const handleSelectEmployee = (emp) => {
    // show name in input
    setHodQuery(emp.full_name);

    // store id for backend
    setSelectedHodId(emp.employee_id);
    setValue("head_of_department", emp.employee_id, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setShowHodDropdown(false);
  };

  // =========================
  // Submit handler
  // =========================
  const onSubmit = async (data) => {
    // if (
    //   !data.departmentName ||
    //   !data.email ||
    //   !data.description
    // ) {
    //   toast({
    //     title: "All fields are mandatory",
    //     status: "error",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    //   return; // ❌ API call STOP
    // }
    //new
    // const enteredDepName = data.departmentName.trim().toLowerCase();

    // const deptAlreadyExists = existingDep.some(
    //   (department) => department?.department_name?.trim().toLowerCase() === enteredDepName,
    // );

    // if (deptAlreadyExists) {
    //   toast({
    //     title: "Department name already exists",
    //     // description: "A role with this name already exists.",
    //     status: "error",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    //   return;
    // }
    const payload = {
      department_name: data.departmentName,
      head_of_department: data.head_of_department,
      email: data.email,
      description: data.description,
      org_id: getOrgCode(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        "organization/add_company_department",
        payload,
      );
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Department created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
        setHodQuery("");
        setHodOptions([]);
        setShowHodDropdown(false);
        setSelectedHodId("");
      } else {
        toast({
          title: "Unexpected response",
          description: "Department may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating Department Title:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create Department Title";
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="14px"
      p={6}
      boxShadow="sm"
      w={"100%"}
      mt={3}
      border={"1px solid #cccccc"}
      fontFamily={"Poppins"}
    >
      <BreadcrumbsNav extraSegments={["Add Departments"]} />
      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add departments
        </Box>
        <Flex gap={4}>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            _hover={{ bg: "blue.800" }}
            size="md"
            type="submit"
            form="add-dept-form"
            mr={2}
            isLoading={isSubmitting}
          >
            Save
          </Button>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            bg={"white"}
            color={"#757575"}
          >
            Cancel
          </Button>
        </Flex>
      </Flex>

      <form id="add-dept-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          <FormControl isRequired isInvalid={!!errors.departmentName}>
            <FormLabel>Department name</FormLabel>
            <Input
              placeholder="Enter Department name"
              {...inputStyle}
              {...register("departmentName", {
                required: "Department name is required",
                // validate: (value) => {
                //   if (value.trim().length === 0) {
                //     return "Department name cannot be empty";
                //   }

                //   const enteredName = value.trim().toLowerCase();

                //   const exists = existingDep.some(
                //     (department) =>
                //       department?.department_name?.trim().toLowerCase() ===
                //       enteredName,
                //   );

                //   return !exists || "Department name already exists";
                // },
                validate: (value) => {
                  if (value.trim().length === 0) {
                    return "Department name cannot be empty";
                  }

                  if (value !== value.trim()) {
                    return "Spaces at the beginning or end are not allowed";
                  }

                  if (/\s{2,}/.test(value)) {
                    return "Only one space is allowed between words";
                  }

                  const enteredName = value.toLowerCase();

                  const exists = existingDep.some(
                    (department) =>
                      department?.department_name?.trim().toLowerCase() ===
                      enteredName,
                  );

                  return !exists || "Department name already exists";
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])[A-Za-z\s]+$/,
                  message: "Only alphabets are allowed",
                },
                onChange: (e) => {
                  // remove non-alphabets
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                },
                setValueAs: (value) => value.trim(), // 🔥 auto trim
              })}
            />
            {errors.departmentName && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.departmentName.message}
              </Text>
            )}
          </FormControl>

          <FormControl
            position="relative"
            isInvalid={!!errors.head_of_department}
          >
            <FormLabel>Head of the department</FormLabel>
            <Box position="relative">
              <Input
                placeholder="Head of the department"
                value={hodQuery}
                onChange={handleHodChange}
                {...inputStyle}
                autoComplete="off"
                onFocus={() => {
                  if (hodOptions.length > 0) setShowHodDropdown(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowHodDropdown(false), 150);
                }}
                // {...register("head_of_department", {
                //   required: "Head of department is required",
                // })}
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
                      <Text fontSize="sm" color="gray.500">
                        Searching...
                      </Text>
                    </Box>
                  ) : hodOptions.length === 0 ? (
                    <Box px={3} py={2}>
                      <Text fontSize="sm" color="gray.500">
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
            {errors.head_of_department && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.head_of_department.message}
              </Text>
            )}
          </FormControl>
        </Flex>

        <Flex gap={4} mb={4}>
          {/* <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Enter email address"
              {...register("email")}
              {...inputStyle}
            />
          </FormControl> */}
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Enter email address"
              {...inputStyle}
              {...register("email", {
                // required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              onChange={(e) => {
                e.target.value = e.target.value.toLowerCase();
              }}
            />

            {errors.email && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.email.message}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            {/* <Input
              placeholder="Enter Description"
              {...register("description")}
              {...inputStyle}
            /> */}
            <Input
              placeholder="Enter Description"
              {...inputStyle}
              {...register("description", {
                // required: "Description is required",
              })}
            />
            {errors.description && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.description.message}
              </Text>
            )}
          </FormControl>
        </Flex>

        {/* hidden field hooked to react-hook-form, stores employee_id */}
        <input type="hidden" {...register("head_of_department")} />
      </form>
    </Box>
  );
}
