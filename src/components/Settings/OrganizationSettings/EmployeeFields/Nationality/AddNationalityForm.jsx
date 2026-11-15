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

export default function AddNationalityStatusForm() {
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
      nationality_name: data.nationlityStatus,
      org_id: getOrgCode(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post("/settings/add_nationality", payload);
      // You can adjust success detection based on your API's response shape
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Nationality created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Nationality may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating Nationality:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create Nationality Title";
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
      fontFamily={'Poppins'}
      p={6}
      boxShadow="sm"
      w={"100%"}
      mt={3}
      border={"1px solid #cccccc"}
    >
      <BreadcrumbsNav />
      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add Nationality
        </Box>
        <Flex gap={4}>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width={'100px'}
            _hover={{ bg: "blue.800" }}
            size="md"
            type="submit"
            form="add-nationality-form"
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
          <Button type="button" onClick={() => navigate(-1)} bg={"white"} color={"#757575"}>
            Cancel
          </Button>
        </Flex>
      </Flex>
      <form id="add-nationality-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          <FormControl isRequired>
            <FormLabel>Nationality Name</FormLabel>
            <Input
              placeholder="Enter Nationality name"
              // {...register("nationlityStatus", { required: true })}
              {...register("nationlityStatus", {
                required: true,
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
          </FormControl>
        </Flex>
      </form>
    </Box>
  );
}
