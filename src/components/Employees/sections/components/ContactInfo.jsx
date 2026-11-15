import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Switch,
  Text,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useFormContext, useWatch } from "react-hook-form";
import { updateContactInformation } from "../../../../api/employee";
import api from "../../../../api/axios";

export default function ContactInfo({
  isViewMode = false,
  isEditing = true,
  setIsEditing = () => {},
}) {
  const methods = useFormContext();
  const {
    register,
    getValues,
    resetField,
    setValue,
    watch,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  const toast = useToast();

  
  const [isSaving, setIsSaving] = useState(false);

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

  const permFields = [
    "permAddressLine1",
    "permAddressLine2",
    "permCity",
    "permDistrict",
    "permCountry",
    "permPostalCode",
    "permState",
  ];

  const commFields = [
    "commAddressLine1",
    "commAddressLine2",
    "commCity",
    "commDistrict",
    "commCountry",
    "commPostalCode",
    "commState",
  ];

  const toggleField = "sameAsPermanent";
  const viewDisabled = isViewMode && !isEditing;

  const sameAsPermanent = watch(toggleField);
  const permValues = useWatch({ control, name: permFields });

  /* ---------------- PINCODE LOOKUP ---------------- */

  const fetchAddressByPincode = async (pincode, type) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
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

      setValue(`${type}State`, postOffice.State || "");
      setValue(`${type}District`, postOffice.District || "");
      setValue(`${type}City`, postOffice.Division || ""); // ✅ Division → City
      setValue(`${type}Country`, postOffice.Country || "India");
    } catch (err) {
      console.error("Pincode lookup failed", err);
    }
  };

  const permPostalCode = watch("permPostalCode");
  const commPostalCode = watch("commPostalCode");

  useEffect(() => {
    if (permPostalCode?.length === 6) {
      const timer = setTimeout(() => {
        fetchAddressByPincode(permPostalCode, "perm");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [permPostalCode]);

  useEffect(() => {
    if (commPostalCode?.length === 6 && !sameAsPermanent) {
      const timer = setTimeout(() => {
        fetchAddressByPincode(commPostalCode, "comm");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [commPostalCode, sameAsPermanent]);

  /* -------- SAME AS PERMANENT SYNC -------- */

  useEffect(() => {
    if (sameAsPermanent) {
      permFields.forEach((pname, i) => {
        setValue(commFields[i], permValues?.[i] || "");
      });
    }
  }, [sameAsPermanent, JSON.stringify(permValues)]);

  /* ---------------- CLEAR ---------------- */

  const handleClear = () => {
    [...permFields, ...commFields, toggleField].forEach((field) =>
      resetField(field),
    );
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    const vals = getValues();

    const permanent_address = {
      address_line1: vals.permAddressLine1 || "",
      address_line2: vals.permAddressLine2 || "",
      city: vals.permCity || "",
      district: vals.permDistrict || "",
      state: vals.permState || "",
      country: vals.permCountry || "",
      postal_code: vals.permPostalCode || "",
    };

    const communication_address = sameAsPermanent
      ? { ...permanent_address }
      : {
          address_line1: vals.commAddressLine1 || "",
          address_line2: vals.commAddressLine2 || "",
          city: vals.commCity || "",
          district: vals.commDistrict || "",
          state: vals.commState || "",
          country: vals.commCountry || "",
          postal_code: vals.commPostalCode || "",
        };

    const empCode =
      vals.employee_emp_code || localStorage.getItem("employee_emp_code");

    if (!empCode) {
      toast({
        title: "Save basic info first",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateContactInformation({
        permanent_address: { ...permanent_address, employee_id: empCode },
        communication_address: {
          ...communication_address,
          employee_id: empCode,
        },
      });

      toast({
        title: "Contact Information Saved!",
        status: "success",
        duration: 1500,
      });

      if (isViewMode && isEditing) setIsEditing(false);
    } catch (err) {
      toast({
        title: "Save failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- UPDATE ---------------- */

  const handleUpdateContact = async () => {
    const vals = getValues();
    const empCode =
      vals.employee_emp_code || localStorage.getItem("employee_emp_code");
    const dbId = vals.employee_db_id || localStorage.getItem("employee_db_id");

    if (!empCode && !dbId) {
      toast({
        title: "Save basic info first",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    try {
      setIsSaving(true);
      await api.put("/employee/edit_contact_information", {
        permanent_address: {
          address_line1: vals.permAddressLine1 || "",
          address_line2: vals.permAddressLine2 || "",
          city: vals.permCity || "",
          district: vals.permDistrict || "",
          state: vals.permState || "",
          country: vals.permCountry || "",
          postal_code: vals.permPostalCode || "",
          employee_id: empCode,
        },
        communication_address: sameAsPermanent
          ? {
              address_line1: vals.permAddressLine1 || "",
              address_line2: vals.permAddressLine2 || "",
              city: vals.permCity || "",
              district: vals.permDistrict || "",
              state: vals.permState || "",
              country: vals.permCountry || "",
              postal_code: vals.permPostalCode || "",
              employee_id: empCode,
            }
          : {
              address_line1: vals.commAddressLine1 || "",
              address_line2: vals.commAddressLine2 || "",
              city: vals.commCity || "",
              district: vals.commDistrict || "",
              state: vals.commState || "",
              country: vals.commCountry || "",
              postal_code: vals.commPostalCode || "",
              employee_id: empCode,
            },
        emp_code: empCode,
        id: dbId,
      });

      toast({
        title: "Contact Information Updated!",
        status: "success",
        duration: 1500,
      });

      if (isViewMode && isEditing) setIsEditing(false);
    } catch (err) {
      toast({
        title: "Update failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box mt={-4} p={4} bg="white" borderBottomRadius={"10px"}>
      <Box mb={3} mt={2}>
        <SimpleGrid columns={2} spacing={10}>
          <Box>
            <FormLabel fontWeight="600" mb={12}>
              Permanent Address
            </FormLabel>
            <FormControl isRequired isInvalid={!!errors.permAddressLine1}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Address Line 1
              </FormLabel>
              <Input
                {...register("permAddressLine1", {
                  required: "Address Line 1 is required",
                })}
                placeholder="Enter Address Line 1"
                isDisabled={viewDisabled || isSaving}
                {...inputStyle}
              />
              {errors.permAddressLine1 && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.permAddressLine1.message}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Address Line 2
              </FormLabel>
              <Input
                {...register("permAddressLine2")}
                placeholder="Enter Address Line 2"
                isDisabled={viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.permCity}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                City
              </FormLabel>

              <Input
                placeholder="Enter City"
                isDisabled={viewDisabled || isSaving}
                {...register("permCity", {
                  required: "City is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters are allowed",
                  },
                })}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setValue("permCity", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.permCity && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.permCity.message}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.permDistrict}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                District
              </FormLabel>

              <Input
                placeholder="Enter District"
                isDisabled={viewDisabled || isSaving}
                {...register("permDistrict", {
                  required: "District is required",
                  pattern: {
                    value: /^[A-Za-z0-9\s]+$/,
                    message: "Special characters are not allowed",
                  },
                })}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
                  setValue("permDistrict", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.permDistrict && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.permDistrict.message}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.permState}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                State
              </FormLabel>

              <Input
                placeholder="Enter State"
                isDisabled={viewDisabled || isSaving}
                {...register("permState", {
                  required: "State is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters are allowed",
                  },
                })}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setValue("permState", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.permState && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.permState.message}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.permCountry}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Country
              </FormLabel>

              <Input
                placeholder="Enter Country"
                isDisabled={viewDisabled || isSaving}
                {...register("permCountry", {
                  required: "Country is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters are allowed",
                  },
                })}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setValue("permCountry", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                {...inputStyle}
              />

              {errors.permCountry && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.permCountry.message}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.permPostalCode}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Postal Code
              </FormLabel>

              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter Postal Code"
                maxLength={6}
                isDisabled={viewDisabled || isSaving}
                {...register("permPostalCode", {
                  required: "Postal code is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Postal code must be exactly 6 digits",
                  },
                })}
                {...inputStyle}
              />

              <FormErrorMessage>
                {errors.permPostalCode?.message}
              </FormErrorMessage>
            </FormControl>
          </Box>

          {/* Communication Address */}
          <Box>
            <FormLabel fontWeight="600" mb={2.5}>
              Communication Address
            </FormLabel>
            <Flex align="center" gap={2} mb={4}>
              <Box fontSize="sm" color="gray.500">
                Communication address is same as permanent address
              </Box>
              <Switch
                {...register(toggleField)}
                colorScheme="blue"
                onChange={(e) => {
                  if (viewDisabled) return;
                  setValue(toggleField, e.target.checked);
                }}
                isChecked={!!watch(toggleField)}
                isDisabled={viewDisabled || isSaving}
                sx={{
                  ".chakra-switch__track[data-checked]": {
                    bg: "#1F3661",
                  },
                  ".chakra-switch__thumb[data-checked]": {
                    bg: "#ffffff",
                  },
                  ".chakra-switch__thumb[data-disabled]": {
                    bg: "#E0E0E0",
                  },
                  ".chakra-switch__track": {
                    width: "38px",
                    height: "18px",
                    bg: "#EAEAEA",
                  },

                  /* Thumb size */
                  ".chakra-switch__thumb": {
                    width: "18px",
                    height: "18px",
                    bg: "#9E9E9E",
                  },
                  ".chakra-switch__track[data-checked] .chakra-switch__thumb": {
                    transform: "translateX(20px)",
                  },
                }}
              />
            </Flex>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Address Line 1
              </FormLabel>
              <Input
                {...register("commAddressLine1")}
                placeholder="Enter Address Line 1"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Address Line 2
              </FormLabel>
              <Input
                {...register("commAddressLine2")}
                placeholder="Enter Address Line 2"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                City
              </FormLabel>
              <Input
                {...register("commCity")}
                placeholder="Enter City"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                District
              </FormLabel>
              <Input
                {...register("commDistrict")}
                placeholder="Enter District"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                State
              </FormLabel>
              <Input
                {...register("commState")}
                placeholder="Enter State"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Country
              </FormLabel>
              <Input
                {...register("commCountry")}
                placeholder="Enter Country"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="-0.3px"
                mt={3}
              >
                Postal Code
              </FormLabel>
              <Input
                {...register("commPostalCode")}
                placeholder="Enter Postal Code"
                isDisabled={sameAsPermanent || viewDisabled || isSaving}
                {...inputStyle}
              />
            </FormControl>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Buttons */}
      <Flex justifyContent={"space-between"} p={4} pl={0} pr={0}>
        <Button
          variant="outline"
          onClick={handleClear}
          fontWeight={"500"}
          color={"#757575"}
          border={"white"}
          isDisabled={viewDisabled || isSaving}
        >
          Clear form
        </Button>

        <Box>
          {isViewMode ? (
            isEditing ? (
              <>
                <Button
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  // onClick={handleSubmit(handleUpdateContact)}
                  // onClick={handleSubmit(handleUpdateContact, (errors) => {
                  //   console.log(
                  //     "CONTACT UPDATE BLOCKED BY VALIDATION:",
                  //     errors,
                  //   );
                  // })}
                  onClick={async () => {
                    const isValid = await trigger([
                      "permAddressLine1",
                      "permAddressLine2",
                      "permCity",
                      "permDistrict",
                      "permState",
                      "permCountry",
                      "permPostalCode",
                      "commAddressLine1",
                      "commAddressLine2",
                      "commCity",
                      "commDistrict",
                      "commState",
                      "commCountry",
                      "commPostalCode",
                    ]);

                    if (isValid) {
                      await handleUpdateContact();
                    }
                  }}
                  fontWeight={"500"}
                  isLoading={isSaving}
                  loadingText="Updating"
                  isDisabled={isSaving}
                >
                  Update
                </Button>

                <Button
                  variant="outline"
                  ml={2}
                  onClick={() => setIsEditing(false)}
                  isDisabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : null
          ) : (
            <Button
              color="white"
              backgroundColor="#1A365D"
              _hover={{ bg: "#153e75" }}
              onClick={handleSubmit(handleSave)}
              fontWeight={"500"}
              isLoading={isSaving}
              loadingText="Saving"
              w={121}
              borderRadius={10}
            >
              Save
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
