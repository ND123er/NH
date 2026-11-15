import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  useToast,
  Text,
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import api from "../../../../../api/axios";
import { EditIcon } from "@chakra-ui/icons";
import { getEmpCode, getOrgCode } from "../../../../../utils/token";
import { setOrgId } from "../../../../../slices/authSlice";

export default function AddGeneralDetailsForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverOrgCode, setServerOrgCode] = useState(null);
  const orgId = getOrgCode();
  const today = new Date().toISOString().split("T")[0];

  // fetch get data
  const fetchOrgData = async () => {
    if (!orgId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/organization/get_org_details/${orgId}`);
      const org = res?.data?.organisation || null;
      if (org) {
        setValue("companyName", org.organisation_name || "");
        setValue("size", org.company_size || "");
        setValue("regNumber", org.registration_number || "");
        setValue("taxId", org.tax_id || "");
        setValue("gstNumber", org.gst_number || "");
        setValue("email", org.email || org.company_email || "");
        setValue("description", org.description || "");
        setValue("businessType", org.business_type || "");
        setValue("estdDate", org.establish_date || org.establish_date || "");
        const codeVal = org.organisation_id || org.organisation_id || orgId || "";
        setValue("code", codeVal);
        setServerOrgCode(org.organisation_id || null);
        setValue("domailUrl", org.website || "");
      }
      else {
        // if no org returned, allow immediate editing so user can create
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Failed to fetch org details", err);
      toast({
        title: "Failed to load organization details",
        status: "error",
        duration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrg = async () => await fetchOrgData();
    fetchOrg();
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
    _invalid: {
      borderColor: "red.500",
      boxShadow: "0 0 0 1px red",
    },
  };

  const onSubmit = (data) => {
    const body = {
      organisation_name: data.companyName || "",
      company_size: data.size || "",
      email: data.email || "",
      business_type: data.businessType || "",
      registration_number: data.regNumber || "",
      tax_id: data.taxId || "",
      gst_number: data.gstNumber || "",
      establish_date: data.estdDate || "",
      website: data.domailUrl || "",
      description: data.description || "",
      organisation_id: data.code || orgId,
      // created_by: getEmpCode()
    };

    // allow submitting even if there's no orgId — choose create vs update
    setIsLoading(true);

    const targetOrgId = data.code || orgId || null;

    const doUpdate = !!targetOrgId;

    const request = doUpdate
      ? api.put(`/organization/update_org_details/${targetOrgId}`, body)
      : api.post(`/organization/register_org`, { ...body, organisation_id: null });

    request
      .then((res) => {
        toast({
          title: doUpdate ? "Organization updated" : "Organization created",
          status: "success",
          duration: 2000,
        });
        setIsEditing(false);

        const org = res?.data?.organisation || res?.data || null;
        // Extract org_id from POST response (new org creation)
        const newOrgId = res?.data?.org_id || (org && org.organisation_id);

        if (newOrgId) {
          // Update Redux state with the new org_id
          dispatch(setOrgId(newOrgId));
        }

        if (org) {
          setValue("companyName", org.organisation_name || "");
          setValue("regNumber", org.registration_number || "");
          setValue("taxId", org.tax_id || "");
          setValue("gstNumber", org.gst_number || "");
          setValue("email", org.email || org.company_email || "");
          setValue("estdDate", org.establish_date || org.establish_date || "");
          setValue("code", org.organisation_id || newOrgId || targetOrgId || "");
          setValue("domailUrl", org.website || "");
          setValue("description", org.description || "");
          setServerOrgCode(org.organisation_id || newOrgId || serverOrgCode);
        }
        navigate(-1);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: doUpdate ? "Update failed" : "Create failed",
          description: err?.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Box
      bg="white"
      borderRadius="14px"
      // p={6}
      boxShadow="sm"
      // w={"100%"}
      // mt={3}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
      w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
      ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      border={"1px solid #cccccc"}
    >
      <BreadcrumbsNav />
      <Box borderRadius={"10px"} border={"1px solid #e0e0e0"}   p={{ base: 2, md: 8 }} h="70vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}>
        <Flex align="center" justify="space-between" mb={4}>
          <Flex align="center" gap={3}>
            <Box
              fontWeight="bold"
              fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
              fontFamily="poppins"
              mb={{ base: 0, md: 0 }}
            >
              Add General Details
            </Box>
            <IconButton
              aria-label="Edit organization"
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
              form="add-general-details"
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
        <form id="add-general-details" onSubmit={handleSubmit(onSubmit, (errs) => {
          const first = errs && Object.values(errs)[0];
          const msg = first?.message || "Please fix the highlighted fields";
          toast({ title: "Validation error", description: msg, status: "error", duration: 2500 });
        })} noValidate>
          <Flex gap={4} mb={4}>
            {/* Company Name */}
            <FormControl isRequired isInvalid={!!errors.companyName}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Company name
              </FormLabel>
              <Input
                placeholder="Enter company name"
                // {...register("companyName", { required: true })}
                {...register("companyName", {
                  required: "Company name is required",
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  },
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              <FormErrorMessage color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">{errors.companyName?.message}</FormErrorMessage>

            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Company Email */}
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Company Email
              </FormLabel>
              <Input
                type="email"
                placeholder="Enter company email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9.@]+$/,
                    message: "Only letters, numbers, @ and . are allowed",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9.@]/g, "");
                  },
                  validate: {
                    validEmailFormat: (value) =>
                      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                        value
                      ) || "Enter a valid email address",
                  },
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              <FormErrorMessage color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">{errors.email?.message}</FormErrorMessage>
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Company Size */}
            <FormControl isRequired isInvalid={!!errors.size}>
              <FormLabel
                fontFamily="Poppins"
                fontSize="14px"
                letterSpacing="-0.3px"
              >
                Company Size
              </FormLabel>

              <Select
                placeholder="Select Company Size"
                {...register("size", {
                  required: "Company Size is required",
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              >
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="200+">200+</option>
              </Select>

              {errors.size && (
                <Text color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">
                  {errors.size.message}
                </Text>
              )}
            </FormControl>

            {/* Registration Number */}
            <FormControl isRequired isInvalid={!!errors.regNumber}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Registration Number
              </FormLabel>
              <Input
                // maxLength={15}
                placeholder="Enter Registration Number"
                // {...register("regNumber", { required: true })}
                {...register("regNumber", {
                  required: "Registration number is required",
                  pattern: {
                    value: /^[A-Za-z0-9-]+$/,
                    message:
                      "Registration number can only contain letters, numbers, and hyphens",
                  },
                  // maxLength: {
                  //   value: 15,
                  //   message: "Registration number cannot exceed 15 characters",
                  // },
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, "");
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Registration number cannot be empty",
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {errors.regNumber && (
                <Text color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">
                  {errors.regNumber.message}
                </Text>
              )}
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Tax ID */}
            <FormControl isRequired isInvalid={!!errors.taxId}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Tax ID
              </FormLabel>
              <Input
                placeholder="Enter Tax ID"
                maxLength={15}
                {...register("taxId", {
                  required: "Tax ID is required",
                  pattern: {
                    value: /^[A-Za-z0-9-]+$/,
                    message:
                      "Tax ID can only contain letters, numbers, and hyphens",
                  },
                  maxLength: {
                    value: 15,
                    message: "Tax ID cannot exceed 15 characters",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, "");
                  },
                  validate: (value) =>
                    value.trim().length > 0 || "Tax ID cannot be empty",
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {errors.taxId && (
                <Text color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">
                  {errors.taxId.message}
                </Text>
              )}
            </FormControl>

            {/* GST Number */}
            <FormControl isInvalid={!!errors.gstNumber}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                GST Number
              </FormLabel>
              <Input
                placeholder="Enter GST Number"
                // {...register("gstNumber", { required: true })}
                maxLength={15}
                {...register("gstNumber", {
                  // required: "GST number is required",
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
                isDisabled={!isEditing}
              />
              <FormErrorMessage color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">{errors.gstNumber?.message}</FormErrorMessage>

            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Description */}
            <FormControl>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Short description
              </FormLabel>
              <Input
                placeholder="Enter Short description"
                {...register("description")}
                {...inputStyle}
                isDisabled={!isEditing}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Business Type */}
            <FormControl isRequired isInvalid={!!errors.businessType}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Business type
              </FormLabel>
              <Input
                placeholder="Enter Business type"
                {...register("businessType", {
                  required: "Business type is required",
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              <FormErrorMessage color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">{errors.businessType?.message}</FormErrorMessage>

            </FormControl>

            {/* Establishment Date */}
            <FormControl>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Company Establishment Date
              </FormLabel>

              <Input
                type="date"
                placeholder="Enter Company Establishment Date"
                max={today}
                {...inputStyle}
                isDisabled={!isEditing}
                {...register("estdDate", {
                  required: "Establishment date is required",
                  validate: (value) =>
                    value <= today || "Future date is not allowed",
                })}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            {/* Company Code */}
            <FormControl>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Company Code
              </FormLabel>
              <Input
                placeholder="Enter Company Code"
                {...register("code")}
                {...inputStyle}
                isDisabled={true}
                cursor="not-allowed"
              />
            </FormControl>

            {/* Domail URL */}
            <FormControl isRequired isInvalid={!!errors.domailUrl}>
              <FormLabel
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Domain URL
              </FormLabel>

              <Input
                placeholder="Enter Domain URL"
                {...register("domailUrl", {
                  required: "Domain URL is required",

                  pattern: {
                    value:
                      /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/,
                    message:
                      "Enter a valid URL starting with http:// or https://",
                  },
                })}
                {...inputStyle}
                isDisabled={!isEditing}
              />
              {errors.domailUrl && (
                <Text color="red.500" fontSize="sm" mt={1} fontFamily="Poppins">
                  {errors.domailUrl.message}
                </Text>
              )}
            </FormControl>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
