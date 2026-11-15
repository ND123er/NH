import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddJobTitleStatusForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({ mode: "onChange" });
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  // const onSubmit = async (data) => {
  //   const payload = {
  //     position_name: data.jobTitleStatus,
  //     organisation_id: getOrgCode(),
  //   };

  //   setIsSubmitting(true);
  //   try {
  //     const res = await axios.post("/settings/create_job_title", payload);
  //     if (res && (res.status === 200 || res.status === 201)) {
  //       toast({
  //         title: "Job Title created",
  //         status: "success",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //       reset();
  //     } else {
  //       toast({
  //         title: "Unexpected response",
  //         description: "Job Title may not have been created.",
  //         status: "warning",
  //         duration: 4000,
  //         isClosable: true,
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Error creating Job Title:", err);
  //     const message =
  //       err?.response?.data?.message ||
  //       err.message ||
  //       "Failed to create Job Title";
  //     toast({
  //       title: "Error",
  //       description: message,
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const onSubmit = async (data) => {
    const value = data.jobTitleStatus?.trim() || "";

    if (!value) {
      setErrors({
        jobTitleStatus: "Designation name is required.",
      });
      return;
    }

    if (!/^[A-Za-z0-9 ]+$/.test(value)) {
      setErrors({
        jobTitleStatus:
          "Special characters are not allowed. Only letters, numbers and spaces are permitted.",
      });
      return;
    }

    setErrors({});

    const payload = {
      position_name: value,
      organisation_id: getOrgCode(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post("/settings/create_job_title", payload);
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Job Title created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Job Title may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating Job Title:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create Job Title";
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
      fontFamily={"Poppins"}
      p={6}
      boxShadow="sm"
      w={"100%"}
      mt={3}
      border={"1px solid #cccccc"}
    >
      <BreadcrumbsNav />
      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add Designation
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
            form="add-jobTitle-form"
            mr={2}
          >
            Save
          </Button>
          {/* <Button
            bg="White"
            borderRadius="full"
            _hover={{ bg: "blue.800", color: "white" }}
            border={"1px solid #1A365D"}
            size="md"
            variant="outline"
            type="button"
            mr={2}
            onClick={() => {
              reset();
            }}
          >
            Save & new
          </Button> */}
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
      <form id="add-jobTitle-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          {/* <FormControl isRequired>
            <FormLabel>Designation name</FormLabel>
            <Input
              placeholder="Enter job title name"
              {...register("jobTitleStatus", {
                required: true,
                pattern: {
                  value: /^[A-Za-z0-9]+([ -\/&.][A-Za-z0-9]+)*$/,
                  message:
                    "Only alphabets, numbers, and spaces are allowed. '-' is permitted between words.",
                },
                validate: (value) => {
                  if (!value.trim()) {
                    return "Designation name is required.";
                  }

                  if (!/^[A-Za-z0-9 ]+$/.test(value)) {
                    return "Special characters are not allowed. Only letters, numbers and spaces are permitted.";
                  }

                  return true;
                },
              })}
              onChange={(e) => {
                let v = e.target.value;
                v = v.replace(/[^A-Za-z0-9 -\/&.]/g, "");
                v = v.replace(/\s+/g, " ");
                const i = v.indexOf("-");
                if (i !== -1) {
                  v = v.slice(0, i + 1) + v.slice(i + 1).replace(/-/g, "");
                }

                e.target.value = v;
              }}
              {...inputStyle}
            />
          </FormControl> */}
          <FormControl isRequired isInvalid={!!errors.jobTitleStatus}>
            <FormLabel>Designation name</FormLabel>

            <Input
              placeholder="Enter job title name"
              {...register("jobTitleStatus")}
              {...inputStyle}
              onChange={(e) => {
                const value = e.target.value;

                if (!value.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    jobTitleStatus: "Designation name is required.",
                  }));
                } else if (!/^[A-Za-z0-9 ]+$/.test(value)) {
                  setErrors((prev) => ({
                    ...prev,
                    jobTitleStatus:
                      "Special characters are not allowed. Only letters, numbers and spaces are permitted.",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    jobTitleStatus: "",
                  }));
                }
              }}
              borderColor={errors.jobTitleStatus ? "red.500" : "#D0D5DD"}
              _hover={{
                borderColor: errors.jobTitleStatus ? "red.500" : "#D0D5DD",
              }}
              _focus={{
                borderColor: errors.jobTitleStatus ? "red.500" : "#D0D5DD",
                boxShadow: errors.jobTitleStatus ? "0 0 0 1px #E53E3E" : "none",
              }}
            />

            <FormErrorMessage
              color="red.500"
              fontSize="12px"
              fontFamily="Poppins"
              mt={1}
            >
              {errors.jobTitleStatus}
            </FormErrorMessage>
          </FormControl>
        </Flex>
      </form>
    </Box>
  );
}
