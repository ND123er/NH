import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
  FormErrorMessage,
  Text,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
// fallback collection constant in case a shared constant file isn't available
const constant_file = {
  collection: {
    location: "locations",
  },
};

export default function AddOfficeLocationForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- PINCODE LOOKUP ---------------- */

  const fetchAddressByPincode = async (pincode) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
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

      setValue("stateName", postOffice.State || "");
      setValue("cityrName", postOffice.Division || "");
      setValue("countryName", postOffice.Country || "India");
    } catch (err) {
      console.error("Pincode lookup failed", err);
    }
  };

  const pinCode = watch("pinCode");

  useEffect(() => {
    if (pinCode?.length === 6) {
      const timer = setTimeout(() => {
        fetchAddressByPincode(pinCode);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pinCode]);

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

  //handleSubmit for office location form
  const onSubmit = async (data) => {
    // Map form fields to backend's expected location_info shape
    const location_info = {
      organisation_id: getOrgCode(),
      branch_name: data.vendorName,
      address_line_1: data.addLineOne,
      address_line_2: data.addLineTwo,
      city: data.cityrName,
      state: data.stateName,
      country: data.countryName,
      postal_code: data.pinCode,
      phone: data.phoneNumber,
      timezone: data.timezone,
    };

    const payload = {
      org_id: location_info.organisation_id,
      location_name: location_info.branch_name,
      address_line_1: location_info.address_line_1,
      address_line_2: location_info.address_line_2,
      city: location_info.city,
      state: location_info.state,
      country: location_info.country,
      postal_code: location_info.postal_code,
      phone: location_info.phone,
      timezone: location_info.timezone,
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        "/organization/add_company_location",
        payload
      );
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Location created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      } else {
        toast({
          title: "Unexpected response",
          description: "Location may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating Location:", err);
      const message =
        err?.response?.data?.msg ||
        err.msg ||
        "Failed to create Location";
      toast({
        title: "Failed to add Location",
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
      <Box borderRadius={"10px"} border={"1px solid #cccccc"} p={8} h="75vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}>
        <Flex align="center" justify="space-between" mb={4}>
          <Box fontWeight="bold" fontSize="xl">
            Add Office Location
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
              form="add-office-location"
              mr={2}
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
        <form id="add-office-location" onSubmit={handleSubmit(onSubmit)}>
          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Location name</FormLabel>
              <Input
                placeholder="Enter office location name"
                // {...register("vendorName", { required: true })}
                {...register("vendorName", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
            {/* <FormControl isRequired>
              <FormLabel>Mail</FormLabel>
              <Input
                placeholder="Enter mail"
                {...register("mail", { required: true })}
              />
            </FormControl> */}
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Address line 1</FormLabel>
              <Input
                placeholder="Enter address line 1"
                // {...register("addLineOne", { required: true })}
                {...register("addLineOne", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Address line 2</FormLabel>
              <Input
                placeholder="Enter address line 2"
                {...register("addLineTwo", {
                  // required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="Enter city"
                {...register("cityrName", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>State</FormLabel>
              <Input
                placeholder="Enter State"
                {...register("stateName", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Country</FormLabel>
              <Input
                placeholder="Enter country"
                {...register("countryName", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^a-zA-Z0-9 ]/g,
                      ""
                    );
                  },
                })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Pin Code</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter Pin code"
                {...register("pinCode", {
                  required: "Pin Code is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Pin Code must be exactly 6 digits",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                })}
                {...inputStyle}
              />
              {errors.pinCode && (
                <Text
                  color="red.500"
                  fontSize="12px"
                  mt={1}
                  fontFamily={"poppins"}
                >
                  {errors.pinCode.message}
                </Text>
              )}
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Timezone</FormLabel>
              <Select
                placeholder="Select timezone"
                {...register("timezone", { required: true })}
                {...inputStyle}
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
            </FormControl>

            <FormControl isRequired isInvalid={errors.phoneNumber}>
              <FormLabel>Phone Number</FormLabel>

              <Input
                type="text"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter Phone number"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  validate: (value) =>
                    /^[0-9]{10}$/.test(value) ||
                    "Phone number must be 10 digits",
                })}
                onInput={(e) => {
                  // Removes non-numeric characters in case of paste
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                {...inputStyle}
              />

              <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
            </FormControl>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}