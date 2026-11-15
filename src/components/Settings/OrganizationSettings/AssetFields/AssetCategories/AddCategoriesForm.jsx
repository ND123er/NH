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

export default function AddAssetCategoriesForm() {
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
      category_name: data.assetCategory,
      category_code: data.code,
      organisation_id: getOrgCode(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post("/settings/add_asset_category", payload);
      // You can adjust success detection based on your API's response shape
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Asset Categories created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Asset Categories may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating Asset Categories Title:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create Asset Categories Title";
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
      <Box
        borderRadius={"10px"}
        border={"1px solid #e0e0e0"}
        p={8}
      // ml={-5}
      // mr={-5}
      >
        <Flex align="center" justify="space-between" mb={4}>
          <Box fontWeight="700" fontSize="22px">
            Add asset category
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
              form="add-asset-category-form"
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
            <Button type="button" onClick={() => navigate(-1)} bg={'white'} color={'#757575'}>
              Cancel
            </Button>
          </Flex>
        </Flex>
        <form id="add-asset-category-form" onSubmit={handleSubmit(onSubmit)}>
          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Asset category name</FormLabel>
              <Input
                maxLength={32}
                placeholder="Enter Asset category"
                {...register("assetCategory", {
                  required: "Asset category name is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Asset category name cannot be empty",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only alphabets are allowed",
                  },
                })}
                // onChange={(e) => {
                //   e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                // }}
                onChange={(e) => {
                  const cleanedValue = e.target.value
                    .replace(/[^A-Za-z\s]/g, "")
                    .replace(/^\s+/, "");

                  e.target.value = cleanedValue;
                }}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category Code</FormLabel>
              {/* <Input
                maxLength={32}
                placeholder="Enter Code"
                // {...register("code", { required: true })}
                {...register("code", {
                  required: true,
                  minLength: {
                    value: 1,
                    message: "Minimum 1 character is required",
                  },
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: "Only letters and numbers are allowed",
                  },
                })}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                }}
                {...inputStyle}
              /> */}
              <Input
                maxLength={32}
                placeholder="Enter Code"
                {...register("code", {
                  required: "Category code is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Category code cannot be empty",
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: "Only letters and numbers are allowed",
                  },
                })}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                }}
                {...inputStyle}
              />
            </FormControl>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
