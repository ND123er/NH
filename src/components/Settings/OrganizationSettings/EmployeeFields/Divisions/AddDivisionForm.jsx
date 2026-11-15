import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddDivisionsForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange", // validate on change so errors appear while typing
    reValidateMode: "onChange",
  });
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchEmployees = async (search) => {
    if (!search || search.trim().length < 3) return;

    setDivisionHeadLoading(true);

    try {
      const res = await axios.get("/employee/get_employees_list", {
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
          err.message ||
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

    // Clear the previously selected employee ID.
    setValue("divisionalHead", "");

    if (value.trim().length >= 3) {
      fetchEmployees(value);
    } else {
      setDivisionHeadOptions([]);
      setShowDivisionHeadDropdown(false);
    }
  };

  const handleSelectDivisionHead = (emp) => {
    // Display employee name.
    setDivisionHeadQuery(emp.full_name);

    // Store employee ID for the existing payload.
    setValue("divisionalHead", emp.employee_id, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setShowDivisionHeadDropdown(false);
  };

  const onSubmit = async (data) => {
    const payload = {
      organisation_id: getOrgCode(),
      division_name: data.divisionStatus,
      division_code: data.divisionCode,
      description: data.description || "",
      divisional_head: data.divisionalHead || "",
      email: data.mail || "",
    };

    setIsSubmitting(true);

    try {
      const res = await axios.post("/organization/register_division", payload);

      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          // title: "Division created successfully",
          title: res?.data?.msg || res?.msg,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Division may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      // console.error("Error creating Division:", err);
      const message =
        err?.response?.data?.msg || err.msg || "Failed to create Division";

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
      fontFamily="Poppins"
    >
      <BreadcrumbsNav />

      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add Divisions
        </Box>

        <Flex gap={4}>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width={"100px"}
            _hover={{ bg: "blue.800" }}
            size="md"
            type="submit"
            form="add-division-form"
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

      <form id="add-division-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          <FormControl isRequired isInvalid={!!errors.divisionStatus}>
            <FormLabel>Division Name</FormLabel>
            <Input
              placeholder="Enter Division Name"
              // {...register("divisionStatus", {
              //   required: "Division name is required",
              //   maxLength: {
              //     value: 100,
              //     message: "Division name is too long",
              //   },
              // })}
              {...register("divisionStatus", {
                required: "Division name is required",
                maxLength: {
                  value: 100,
                  message: "Division name is too long",
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only alphabets are allowed",
                },
              })}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              }}
              {...inputStyle}
            />
            <FormErrorMessage>
              {errors.divisionStatus && errors.divisionStatus.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.divisionCode}>
            <FormLabel>Division Code</FormLabel>
            <Input
              placeholder="Enter Division Code"
              // {...register("divisionCode", {
              //   required: "Division code is required",
              //   maxLength: {
              //     value: 20,
              //     message: "Division code is too long",
              //   },
              // })}
              {...register("divisionCode", {
                required: "Division code is required",
                maxLength: {
                  value: 20,
                  message: "Division code is too long",
                },
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: "Special characters are not allowed",
                },
              })}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
              }}
              {...inputStyle}
            />
            <FormErrorMessage>
              {errors.divisionCode && errors.divisionCode.message}
            </FormErrorMessage>
          </FormControl>
        </Flex>

        <Flex gap={4} mb={4}>
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Input
              placeholder="Enter Description"
              {...register("description", {
                maxLength: { value: 500, message: "Description is too long" },
              })}
              {...inputStyle}
            />
            <FormErrorMessage>
              {errors.description && errors.description.message}
            </FormErrorMessage>
          </FormControl>

          {/* <FormControl isInvalid={!!errors.divisionalHead}>
            <FormLabel>Divisional Head</FormLabel>
            <Input
              placeholder="Enter Divisional Head"
              {...register("divisionalHead", {
                maxLength: { value: 100, message: "Name is too long" },
              })}
              {...inputStyle}
            />
            <FormErrorMessage>
              {errors.divisionalHead && errors.divisionalHead.message}
            </FormErrorMessage>
          </FormControl> */}
          <FormControl position="relative" isInvalid={!!errors.divisionalHead}>
            <FormLabel>Divisional Head</FormLabel>

            <Box position="relative">
              <Input
                placeholder="Enter Divisional Head"
                value={divisionHeadQuery}
                onChange={handleDivisionHeadChange}
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

            <FormErrorMessage>
              {errors.divisionalHead?.message}
            </FormErrorMessage>
          </FormControl>
        </Flex>

        <Flex gap={4} mb={4}>
          <FormControl isRequired isInvalid={!!errors.mail}>
            <FormLabel>Mail</FormLabel>
            <Input
              placeholder="Enter Mail"
              type="email"
              {...register("mail", {
                required: "Email is required",
                setValueAs: (value) => value.toLowerCase(),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Enter a proper email address",
                },
              })}
              {...inputStyle}
            />
            <FormErrorMessage>
              {errors.mail && errors.mail.message}
            </FormErrorMessage>
          </FormControl>

          {/* Empty column for half-width alignment */}
          <Box flex="1" />
        </Flex>
      </form>
    </Box>
  );
}
