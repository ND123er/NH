import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddQualificationForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data) => {
    const payload = {
      name: data.qualificationStatus,
      org_id: getOrgCode(),
    };

    setIsSubmitting(true);

    try {
      const res = await axios.post("/settings/add_qualification", payload);

      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Qualification created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Qualification may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating qualification:", err);

      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create qualification";

      toast({
        title: "Qualification addition failed",
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
          Add Qualification
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
            form="add-qualification-form"
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

      <form id="add-qualification-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          <FormControl isRequired>
            <FormLabel>Qualification</FormLabel>
            <Input
              placeholder="Enter qualification"
              // {...register("qualificationStatus", { required: true })}
              {...register("qualificationStatus", {
                required: "Qualification is required",
                pattern: {
                  value: /^[a-zA-Z0-9\s]+$/, // allows letters, numbers, and spaces
                  message: "Only letters, numbers, and spaces are allowed",
                },
                validate: (value) =>
                  value.trim() !== "" || "Qualification cannot be blank",
              })}
              onChange={(e) => {
                // optional: remove invalid characters as user types
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
              }}
              {...inputStyle}
            />
          </FormControl>
        </Flex>
      </form>
    </Box>
  );
}
