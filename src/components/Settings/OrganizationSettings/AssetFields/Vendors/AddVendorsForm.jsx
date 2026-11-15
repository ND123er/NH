import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  SimpleGrid,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddAssetVendorsForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange", reValidateMode: "onChange" });
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
    if (new Date(data.contractEndDate) <= new Date(data.contractStartDate)) {
      toast({
        title: "Invalid contract dates",
        description: "Contract end date must be after contract start date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      organisation_id: getOrgCode(),
      vendor_id: data.vendorId,
      vendor_name: data.vendorName,
      contact_person: data.contactPerson,
      address: data.address,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      gst_number: data.gstNumber,
      contract_start_date: data.contractStartDate,
      contract_end_date: data.contractEndDate,
      payment_terms: data.paymentTerms,
      warranty_terms: data.warrantyTerms,
      support_contact: data.supportContact,
      rating: data.rating,
    };
    setIsSubmitting(true);
    try {
      const res = await axios.post("/settings/add_asset_vendor", payload);
      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Vendor created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Failed to create vendor",
        status: "error",
        duration: 4000,
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
      fontFamily="Poppins"
      p={6}
      boxShadow="sm"
      w="100%"
      mt={3}
      border="1px solid #cccccc"
    >
      <BreadcrumbsNav />

      <Box border="1px solid #e0e0e0" borderRadius="10px" p={8} maxH="75vh"
        overflowY="auto"
     
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}>
        {/* Header */}
        <Flex align="center" justify="space-between" mb={6}>
          <Box fontWeight="600" fontSize="xl">
            Add Vendors
          </Box>
          <Flex gap={4}>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              width="100px"
              _hover={{ bg: "blue.800" }}
              type="submit"
              form="add-vendors-form"
              isLoading={isSubmitting}
            >
              Save
            </Button>
            <Button bg="white" color="#757575" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Flex>
        </Flex>

        {/* Form */}
        <form id="add-vendors-form" onSubmit={handleSubmit(onSubmit)}>
          <SimpleGrid columns={2} spacing={6}>
            <FormControl isRequired>
              <FormLabel>Vendor ID</FormLabel>
              <Input
                placeholder="Vendor ID"
                // {...register("vendorId", { required: true })}
                {...register("vendorId", {
                  required: "Vendor ID is required",
                  pattern: {
                    value: /^[a-zA-Z0-9]+$/,
                    message: "Only alphabets and numbers are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                  },
                })}
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Vendor name</FormLabel>
              <Input
                placeholder="Vendor name"
                // {...register("vendorName", { required: true })}
                {...register("vendorName", {
                  required: "Vendor name is required",
                  pattern: {
                    value: /^[a-zA-Z\s]*$/,
                    message: "Only alphabets are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  },
                })}
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contact person</FormLabel>
              <Input
                placeholder="Contact person name"
                // {...register("contactPerson", { required: true })}
                {...register("contactPerson", {
                  required: "Contact person name is required",
                  pattern: {
                    value: /^[a-zA-Z\s]*$/,
                    message: "Only alphabets are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  },
                })}
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                placeholder="Address"
                {...register("address", { required: true })}
                {...inputStyle}
              />
            </FormControl>

            {/* <FormControl isRequired isInvalid={!!errors.contactEmail}>
              <FormLabel>Contact email</FormLabel>
              <Input
                type="email"
                placeholder="Contact email"
                {...register("contactEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                {...inputStyle}
              />
              <FormErrorMessage>
                {errors.contactEmail?.message}
              </FormErrorMessage>
            </FormControl> */}
            <FormControl isRequired isInvalid={!!errors.contactEmail}>
              <FormLabel>Contact email</FormLabel>
              <Input
                type="email"
                placeholder="Contact email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                style={{ textTransform: "none" }}
                {...register("contactEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                  },
                })}
                {...inputStyle}
              />
              <FormErrorMessage>{errors.contactEmail?.message}</FormErrorMessage>
            </FormControl>


            <FormControl isRequired isInvalid={!!errors.contactPhone}>
              <FormLabel>Contact phone</FormLabel>
              <Input
                placeholder="Contact phone"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                {...register("contactPhone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  },
                })}
                {...inputStyle}
              />
              <FormErrorMessage>
                {errors.contactPhone?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contract start date</FormLabel>
              {/* <Input
                type="date"
                {...register("contractStartDate", { required: true })}
                {...inputStyle}
              /> */}
              <Input
                type="date"
                {...register("contractStartDate", { required: true })}
                {...inputStyle}
                onChange={(e) => {
                  handleChange("contractStartDate")(e);
                  setValue("contractEndDate", "");
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contract end date</FormLabel>
              {/* <Input
                type="date"
                {...register("contractEndDate", { required: true })}
                {...inputStyle}
              /> */}
              <Input
                type="date"
                {...register("contractEndDate", { required: true })}
                min={
                  getValues("contractStartDate")
                    ? new Date(
                      new Date(getValues("contractStartDate")).setDate(
                        new Date(getValues("contractStartDate")).getDate() + 1
                      )
                    ).toISOString().split("T")[0]
                    : undefined
                }
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.gstNumber}>
              <FormLabel>GST number</FormLabel>
              <Input
                placeholder="GST number"
                // {...register("gstNumber", { required: true })}
                maxLength={15}
                {...register("gstNumber", {
                  required: "GST number is required",
                  pattern: {
                    value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
                    message: "Invalid GST number format",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                  },
                })}
                {...inputStyle}
              />
              <FormErrorMessage>
                {errors.gstNumber?.message}
              </FormErrorMessage>
            </FormControl>


            <FormControl isRequired>
              <FormLabel>Payment terms</FormLabel>
              <Input
                placeholder="Payment terms"
                // {...register("paymentTerms", { required: true })}
                {...register("paymentTerms", {
                  required: "Payment terms are required",
                  pattern: {
                    value: /^[a-zA-Z0-9\s]*$/,
                    message: "Only alphabets and numbers are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                  },
                })}
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Warranty terms</FormLabel>
              <Textarea
                placeholder="Enter terms"
                // {...register("warrantyTerms", { required: true })}

                {...register("warrantyTerms", {
                  required: "Warranty terms are required",
                  pattern: {
                    value: /^[a-zA-Z0-9\s]*$/,
                    message: "Only alphabets and numbers are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                  },
                })}
                borderWidth="1.5px"
                borderColor="#D0D5DD"
                borderRadius="8px"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Support contact</FormLabel>
              <Input
                placeholder="Support contact"
                {...register("supportContact")}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Rating</FormLabel>
              <Select
                placeholder="Rating"
                {...register("rating")}
                {...inputStyle}
              >
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </form>
      </Box>
    </Box>
  );
}