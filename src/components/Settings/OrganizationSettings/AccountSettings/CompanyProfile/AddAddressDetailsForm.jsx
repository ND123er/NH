import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Image,
  IconButton,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useForm, useFormContext, Controller, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import api from "../../../../../api/axios";
import { EditIcon } from "@chakra-ui/icons";
import { getEmpCode, getOrgCode } from "../../../../../utils/token";
import National_Flag from "../../../../../assets/National_Flag.png";

export default function AddAddressDetailsForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const orgId = getOrgCode();

  // fetch helper
  const fetchOrgData = async () => {
    if (!orgId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/organization/get_org_details/${orgId}`);
      const org = res?.data?.organisation || null;

      if (org) {
        setOrgData(org);

        setValue("addLineOne", org.address_line1 || org.address1 || "");
        setValue("addLineTwo", org.address_line2 || org.address2 || "");
        setValue("cityrName", org.city || "");
        setValue("stateName", org.state || "");
        setValue("countryName", org.country || "");
        setValue("postCode", org.postal_code || org.postalCode || "");
        setValue("phoneNumber", org.phone || org.contact_number || "");
        setValue("timezone", org.timezone || "");
      }
    } catch (err) {
      console.error("Failed to fetch org address details", err);
      toast({
        title: "Failed to load address details",
        status: "error",
        duration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, [orgId]);

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

  const onSubmit = (data) => {
    if (!orgId || !orgData) {
      toast({ title: "Missing org id", status: "error", duration: 2500 });
      return;
    }

    const body = {
      ...orgData,
      city: data.cityrName || "",
      state: data.stateName || "",
      country: data.countryName || "",
      postal_code: data.postCode || "",
      phone: data.phoneNumber || "",
      timezone: data.timezone || "",
      address_line1: data.addLineOne || "",
      address_line2: data.addLineTwo || "",
      // created_by:getOrgCode()
    };
    console.log("body****************", body);
    setIsLoading(true);
    api
      .put(`/organization/update_org_details/${orgId}`, body)
      .then((res) => {
        toast({ title: "Address updated", status: "success", duration: 2000 });
        setIsEditing(false);
        fetchOrgData();
        navigate(-1);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Update failed",
          description: err?.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  const postCode = watch("postCode");

  // Postal code fetch
  useEffect(() => {
    if (!isEditing) return;

    if (!postCode || postCode.length !== 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${postCode}`,
        );
        const data = await res.json();

        if (
          !Array.isArray(data) ||
          data[0]?.Status !== "Success" ||
          !data[0]?.PostOffice?.length
        ) {
          return;
        }

        const postOffice =
          data[0].PostOffice.find((po) => po.DeliveryStatus === "Delivery") ||
          data[0].PostOffice[0];

        // Auto-fill fields
        setValue("cityrName", postOffice.Division || "");
        setValue("stateName", postOffice.State || "");
        setValue("countryName", postOffice.Country || "India");
      } catch (err) {
        console.error("Postal code lookup failed", err);
      }
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [postCode, isEditing, setValue]);

  return (
    <Box
      bg="white"
      borderRadius="14px"
      // p={6}
      boxShadow="sm"
      // w={"100%"}
      // mt={2}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
      w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
      ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      border={"1px solid #e1e8f0"}
    >
      <BreadcrumbsNav />
      <Box
        borderRadius={"10px"}
        border={"1px solid #e0e0e0"}
        p={{ base: 2, md: 8 }}
      >
        <Flex align="center" justify="space-between" mb={4}>
          <Flex align="center" gap={3}>
            <Box
              fontWeight="bold"
              fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
              fontFamily="poppins"
              mb={{ base: 0, md: 0 }}
            >
              Add Address Details
            </Box>
            <IconButton
              aria-label="Edit address"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            />
          </Flex>
          <Flex gap={4}>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              _hover={{ bg: "blue.800" }}
              size="md"
              type="submit"
              form="add-address-details"
              mr={2}
              isLoading={isLoading}
              isDisabled={!isEditing || isLoading}
            >
              Save
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  fetchOrgData();
                } else {
                  navigate(-1);
                }
              }}
              bg={"white"}
              color={"#757575"}
            >
              {isEditing ? "Cancel" : "Back"}
            </Button>
          </Flex>
        </Flex>
        <form
          id="add-address-details"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Flex gap={4} mb={4}>
            <FormControl isRequired isInvalid={!!errors.addLineOne}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Address line 1
              </FormLabel>
              <Input
                placeholder="Enter address line 1"
                isDisabled={!isEditing}
                {...register("addLineOne", {
                  required: "Address line 1 is required",
                  pattern: {
                    value: /^[A-Za-z0-9\s]+$/,
                    message: "Special characters are not allowed",
                  },
                  validate: (value) =>
                    value.trim().length > 0 || "Address cannot be empty",
                })}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");

                  setValue("addLineOne", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />
              {errors.addLineOne && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.addLineOne.message}
                </Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Address line 2
              </FormLabel>
              <Input
                placeholder="Enter address line 2"
                {...register("addLineTwo")}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {/* {errors.addLineTwo && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.addLineTwo.message}
                </Text>
              )} */}
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* <FormControl isRequired>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                City
              </FormLabel>
              <Input
                placeholder="Enter city"
                {...register("cityrName", { required: true })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
            </FormControl> */}
            <FormControl isRequired isInvalid={!!errors.cityrName}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                City
              </FormLabel>

              <Input
                placeholder="Enter city"
                {...register("cityrName", {
                  required: "City is required",
                })}
                onChange={(e) => {
                  const value = e.target.value;

                  setValue("cityrName", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {errors.cityrName && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.cityrName.message}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.stateName}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                letterSpacing="-0.3px"
              >
                State
              </FormLabel>

              <Input
                placeholder="Enter State"
                isDisabled={!isEditing}
                {...register("stateName", {
                  required: "State is required",
                })}
                onChange={(e) => {
                  setValue("stateName", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.stateName && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.stateName.message}
                </Text>
              )}
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired isInvalid={!!errors.countryName}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                letterSpacing="-0.3px"
              >
                Country
              </FormLabel>

              <Input
                placeholder="Enter country"
                isDisabled={!isEditing}
                {...register("countryName", {
                  required: "Country is required",
                })}
                onChange={(e) => {
                  setValue("countryName", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.countryName && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.countryName.message}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.postCode}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Postal Code
              </FormLabel>

              <Input
                placeholder="Enter Post code"
                maxLength={6}
                {...register("postCode", {
                  required: "Postal code is required",
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                {...inputStyle}
                isDisabled={!isEditing}
              />

              {errors.postCode && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.postCode.message}
                </Text>
              )}
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* <FormControl isRequired>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Phone Number
              </FormLabel>
              
              <Input
                placeholder="Enter Phone number"
                maxLength={10}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                onInput={(e) => {
                  // Only allow digits
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {errors.phoneNumber && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.phoneNumber.message}
                </Text>
              )}
            </FormControl> */}
            <FormControl isRequired isInvalid={!!errors?.phoneNumber}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
              >
                Phone Number
              </FormLabel>
              <InputGroup
                display="flex"
                alignItems="center"
                border="1px solid"
                borderColor="#D0D5DD"
                borderRadius="8px"
              >
                <Flex
                  pointerEvents="none"
                  height="100%"
                  display="flex"
                  alignItems="center"
                  px={4}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Image
                      src={National_Flag}
                      alt="India Flag"
                      // boxSize="22px"
                    />
                    <Text fontSize="14px" fontWeight="500" color="gray.700">
                      +91
                    </Text>
                  </Box>
                </Flex>
                <Input
                  border="none"
                  _focus={{
                    boxShadow: "none",
                  }}
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]+$/, // Fallback validation
                      message: "Only numeric digits are allowed",
                    },
                    validate: {
                      lengthCheck: (v) =>
                        v.length === 10 ||
                        "Phone number must be exactly 10 digits",
                    },
                  })}
                  maxLength={10}
                  placeholder="Enter Phone Number"
                  {...inputStyle}
                  onChange={(e) => {
                    // Remove all non-numeric characters as user types
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    e.target.value = numericValue.slice(0, 10); // keep max 10 digits
                    setValue("phoneNumber", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  isDisabled={!isEditing}
                />
              </InputGroup>
              {errors?.phoneNumber && (
                <Text
                  fontFamily={"Poppins"}
                  color="red.500"
                  fontSize="14px"
                  mt={1}
                >
                  {errors.phoneNumber.message}
                </Text>
              )}
            </FormControl>
            {/* <FormControl isRequired>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
                // mr={250}
              >
                Timezone
              </FormLabel>
              <Select
                placeholder="Select timezone"
                {...register("timezone")}
                {...inputStyle}
                isDisabled={!isEditing}
              >
                <option value="UTC-12:00">
                  (UTC-12:00) International Date Line West
                </option>
                <option value="UTC-08:00">
                  (UTC-08:00) Pacific Time (US & Canada)
                </option>
                <option value="UTC-05:00">
                  (UTC-05:00) Eastern Time (US & Canada)
                </option>
                <option value="UTC+00:00">
                  (UTC+00:00) Greenwich Mean Time
                </option>
                <option value="UTC+01:00">
                  (UTC+01:00) Central European Time
                </option>
                <option value="UTC+05:30">
                  (UTC+05:30) India Standard Time
                </option>
                <option value="UTC+08:00">
                  (UTC+08:00) China Standard Time
                </option>
                <option value="UTC+10:00">
                  (UTC+10:00) Australian Eastern Time
                </option>
              </Select>
            </FormControl> */}
            <FormControl isRequired isInvalid={!!errors.timezone}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Timezone
              </FormLabel>

              {/* <Select
                placeholder="Select timezone"
                {...register("timezone", {
                  required: "Timezone is required",
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              > */}
              {/* <Select
                placeholder="Select timezone"
                {...register("timezone", {
                  required: "Timezone is required",
                  validate: (v) =>
                    (v && v.trim() !== "") || "Timezone is required",
                })}
                onChange={(e) => {
                  setValue("timezone", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
                isDisabled={!isEditing}
              >
                <option value="UTC-12:00">
                  (UTC-12:00) International Date Line West
                </option>
                <option value="UTC-08:00">
                  (UTC-08:00) Pacific Time (US & Canada)
                </option>
                <option value="UTC-05:00">
                  (UTC-05:00) Eastern Time (US & Canada)
                </option>
                <option value="UTC+00:00">
                  (UTC+00:00) Greenwich Mean Time
                </option>
                <option value="UTC+01:00">
                  (UTC+01:00) Central European Time
                </option>
                <option value="UTC+05:30">
                  (UTC+05:30) India Standard Time
                </option>
                <option value="UTC+08:00">
                  (UTC+08:00) China Standard Time
                </option>
                <option value="UTC+10:00">
                  (UTC+10:00) Australian Eastern Time
                </option>
              </Select> */}

              <Select
                placeholder="Select timezone"
                {...register("timezone", {
                  required: "Timezone is required",
                  validate: (v) =>
                    (v && v.trim() !== "") || "Timezone is required",
                })}
                onChange={(e) => {
                  setValue("timezone", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
                isDisabled={!isEditing}
              >
                <option value="Asia/Kolkata">India</option>
                <option value="Asia/Dubai">UAE</option>
                <option value="Asia/Riyadh">Saudi Arabia</option>
                <option value="Asia/Karachi">Pakistan</option>
                <option value="Asia/Dhaka">Bangladesh</option>
                <option value="Asia/Kathmandu">Nepal</option>
                <option value="Asia/Colombo">Sri Lanka</option>
                <option value="Asia/Singapore">Singapore</option>
                <option value="Asia/Shanghai">China</option>
                <option value="Asia/Tokyo">Japan</option>
                <option value="Asia/Seoul">South Korea</option>
                <option value="Asia/Bangkok">Thailand</option>
                <option value="Asia/Jakarta">Indonesia — Jakarta</option>
                <option value="Europe/London">United Kingdom</option>
                <option value="Europe/Paris">France</option>
                <option value="Europe/Berlin">Germany</option>
                <option value="Africa/Johannesburg">South Africa</option>
                <option value="America/New_York">US — Eastern</option>
                <option value="America/Chicago">US — Central</option>
                <option value="America/Denver">US — Mountain (Denver)</option>
                <option value="America/Los_Angeles">US — Pacific</option>
                <option value="America/Toronto">Canada — Toronto</option>
                <option value="America/Sao_Paulo">Brazil — São Paulo</option>
                <option value="Australia/Sydney">Australia — Sydney</option>
                <option value="Australia/Perth">Australia — Perth</option>
                <option value="Pacific/Auckland">New Zealand — Auckland</option>
                <option value="UTC">UTC</option>
              </Select>

              {errors.timezone && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.timezone.message}
                </Text>
              )}
            </FormControl>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
