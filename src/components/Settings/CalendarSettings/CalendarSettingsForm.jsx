// CalendarSettingsForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Input,
  Select,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function CalendarSettingsForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontSize: "12px",
      opacity: 0.8,
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
    px: 4,
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      location: "",
      fiscalYearSame: true,
      fiscalYearFrom: "",
      fiscalYearTo: "",
      leaveYearSame: true,
      leaveYearFrom: "",
      leaveYearTo: "",
    },
  });

  const fiscalYearSame = watch("fiscalYearSame");
  const leaveYearSame = watch("leaveYearSame");

  useEffect(() => {
    fetchLocations();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to produce YYYY-01-01 and YYYY-12-31 for the given year
  const makeCalendarYearRange = (year) => {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    return { from, to };
  };

  // When fiscalYearSame toggles, auto-fill or clear
  useEffect(() => {
    if (fiscalYearSame) {
      const nowYear = new Date().getFullYear();
      const { from, to } = makeCalendarYearRange(nowYear);
      setValue("fiscalYearFrom", from);
      setValue("fiscalYearTo", to);
    } else {
      setValue("fiscalYearFrom", "");
      setValue("fiscalYearTo", "");
    }
  }, [fiscalYearSame, setValue]);

  // When leaveYearSame toggles, auto-fill or clear
  useEffect(() => {
    if (leaveYearSame) {
      const nowYear = new Date().getFullYear();
      const { from, to } = makeCalendarYearRange(nowYear);
      setValue("leaveYearFrom", from);
      setValue("leaveYearTo", to);
    } else {
      setValue("leaveYearFrom", "");
      setValue("leaveYearTo", "");
    }
  }, [leaveYearSame, setValue]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const org_id = getOrgCode();
      const res = await api.get("/department/get_all_departments", {
        params: { organisation_id: org_id },
      });
      const depts = res?.data?.data ?? [];
      setLocations(Array.isArray(depts) ? depts : []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const org_id = getOrgCode();
      if (!org_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Basic validation: if custom fiscal/leave years are used, ensure to/from present and valid
      if (!data.fiscalYearSame) {
        if (!data.fiscalYearFrom || !data.fiscalYearTo) {
          toast({
            title: "Validation error",
            description: "Please provide both fiscal year start and end dates",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        if (new Date(data.fiscalYearTo) < new Date(data.fiscalYearFrom)) {
          toast({
            title: "Validation error",
            description: "Fiscal year end cannot be before start",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      if (!data.leaveYearSame) {
        if (!data.leaveYearFrom || !data.leaveYearTo) {
          toast({
            title: "Validation error",
            description: "Please provide both leave year start and end dates",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        if (new Date(data.leaveYearTo) < new Date(data.leaveYearFrom)) {
          toast({
            title: "Validation error",
            description: "Leave year end cannot be before start",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      setSaving(true);

      // API shape
      const payload = {
        organisation_id: org_id,
        financial_year_start: data.fiscalYearSame
          ? data.fiscalYearFrom
          : data.fiscalYearFrom,
        financial_year_end: data.fiscalYearSame
          ? data.fiscalYearTo
          : data.fiscalYearTo,
        leave_year_start: data.leaveYearSame
          ? data.leaveYearFrom
          : data.leaveYearFrom,
        leave_year_end: data.leaveYearSame
          ? data.leaveYearTo
          : data.leaveYearTo,
      };

      // POST API
      await api.post("/settings/add_company_calendar", payload);

      toast({
        title: "Success",
        description: "Calendar setting saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/settings/leave-tracker/calendar-settings");
    } catch (err) {
      console.error("Error saving calendar setting:", err);
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save calendar setting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNew = async (data) => {
    try {
      const org_id = getOrgCode();
      if (!org_id) {
        toast({
          title: "Error",
          description: "Organization not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSaving(true);

      const payload = {
        organisation_id: org_id,
        financial_year_start: data.fiscalYearSame
          ? data.fiscalYearFrom
          : data.fiscalYearFrom,
        financial_year_end: data.fiscalYearSame
          ? data.fiscalYearTo
          : data.fiscalYearTo,
        leave_year_start: data.leaveYearSame
          ? data.leaveYearFrom
          : data.leaveYearFrom,
        leave_year_end: data.leaveYearSame
          ? data.leaveYearTo
          : data.leaveYearTo,
      };

      await api.post("/settings/add_company_calendar", payload);

      toast({
        title: "Success",
        description: "Calendar setting saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form for a new entry, keep defaults
      reset({
        location: "",
        fiscalYearSame: true,
        fiscalYearFrom: new Date().getFullYear() + "-01-01",
        fiscalYearTo: new Date().getFullYear() + "-12-31",
        leaveYearSame: true,
        leaveYearFrom: new Date().getFullYear() + "-01-01",
        leaveYearTo: new Date().getFullYear() + "-12-31",
      });
    } catch (err) {
      console.error("Error saving calendar setting:", err);
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save calendar setting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* top wrapper to mimic AddLeaveForm layout */}
      <Box
        bg="white"
        borderRadius="14px"
        pt={6}
        boxShadow="sm"
        w="100%"
        mt={3}
        border="1px solid #cccccc"
        fontFamily="Poppins, sans-serif"
      >
        <Box pl={6} pr={6}>
          <BreadcrumbsNav extraSegments={["Add Calendar Settings"]} />
        </Box>

        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
          pr={6}
          pl={6}
        >
          <Heading fontSize="22px" fontWeight={700} fontFamily="Poppins">
            Add Calendar Settings
          </Heading>

          <HStack spacing={3}>
            <Button
              bg="#274167"
              color="white"
              fontWeight={500}
              _hover={{ bg: "#1f3143" }}
              borderRadius="14px"
              px={6}
              height="38px"
              width="100px"
              onClick={handleSubmit(onSubmit)}
              isLoading={isSubmitting || saving}
            >
              Save
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/settings/leave-tracker")}
              height="38px"
              width="100px"
              color="#757575"
              fontWeight={500}
              border="1px solid #cccccc"
              _hover={{ bg: "#f5f5f5" }}
              borderRadius="14px"
            >
              Cancel
            </Button>
          </HStack>
        </Box>

        {/* dashed divider */}
        {/* <Box
          h="1px"
          w="100%"
          bgImage={`repeating-linear-gradient(
            to right,
            #C7C7C7 0,
            #C7C7C7 4px,
            transparent 4px,
            transparent 8px
          )`}
          mb={2}
        /> */}

        <Box
          w="100%"
          h="2px"
          bgImage="repeating-linear-gradient(
            to right,
            #C7C7C7 0 6px,
            transparent 6px 14px
          )"
          mb={2}
        />

        {/* Main Card (form) */}
        <Box
          borderRadius="10px"
          border="1px solid #ececec"
          p={6}
          m={6}
          bg="white"
          overflow="visible"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid templateColumns="1fr" gap={6}>
              {/* Fiscal year section */}
              <Box>
                <HStack spacing={4} mb={4}>
                  <Text fontWeight="500" fontFamily="Poppins" fontSize="16px">
                    Fiscal year
                  </Text>

                  <Controller
                    name="fiscalYearSame"
                    control={control}
                    render={({ field }) => (
                      <HStack spacing={2}>
                        <Switch
                          {...field}
                          isChecked={field.value}
                          size="md"
                          onChange={(e) => field.onChange(e.target.checked)}
                          sx={{
                            "& .chakra-switch__track[data-checked]": {
                              backgroundColor: "#1a355c",
                            },
                          }}
                        />
                        <Text
                          fontFamily="Poppins"
                          fontSize="sm"
                          color="gray.600"
                        >
                          Same as the calendar year
                        </Text>
                      </HStack>
                    )}
                  />
                </HStack>
                {/* 
                <Text
                  fontFamily="Poppins"
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  Note: The financial-based calculation will consider the
                  selected period as one year
                </Text> */}
                <Text
                  fontFamily="Poppins"
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  <Text as="span" fontWeight="600" color="black">
                    Note:
                  </Text>{" "}
                  The financial-based calculation will consider the selected period as one year
                </Text>

                {/* From / To — disabled when fiscalYearSame === true */}
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                  mb={4}
                >
                  <FormControl isInvalid={!!errors.fiscalYearFrom}>
                    <FormLabel fontFamily="Poppins" fontSize="13px">
                      From
                    </FormLabel>
                    <Input
                      type="date"
                      {...register("fiscalYearFrom", {
                        validate: (v) => {
                          if (fiscalYearSame) return true; // auto-filled and allowed
                          return v ? true : "Fiscal year start is required";
                        },
                      })}
                      {...inputStyle}
                      placeholder="dd/mm/yyyy"
                      isDisabled={fiscalYearSame}
                      onChange={(e) => {
                        if (!fiscalYearSame)
                          setValue("fiscalYearFrom", e.target.value);
                      }}
                    />
                    <FormErrorMessage fontFamily="Poppins" fontSize="sm">
                      {errors.fiscalYearFrom?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.fiscalYearTo}>
                    <FormLabel fontFamily="Poppins" fontSize="13px" fontWeight={'500'}>
                      To
                    </FormLabel>
                    <Input
                      type="date"
                      {...register("fiscalYearTo", {
                        validate: (v) => {
                          if (fiscalYearSame) return true;
                          if (!v) return "Fiscal year end is required";

                          const from = watch("fiscalYearFrom");
                          if (!from) return "Fiscal year start is required";

                          if (v <= from)
                            return "Fiscal year end must be after start date";

                          return true;
                        },
                      })}
                      {...inputStyle}
                      isDisabled={fiscalYearSame}
                    />
                    <FormErrorMessage>
                      {errors.fiscalYearTo?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>
              </Box>

              {/* Divider */}
              <Box h="1px" bg="#EDEDED" />

              {/* Leave year section */}
              <Box>
                <HStack spacing={4} mb={4}>
                  <Text fontWeight="500" fontFamily="Poppins" fontSize="16px">
                    Leave year
                  </Text>

                  <Controller
                    name="leaveYearSame"
                    control={control}
                    render={({ field }) => (
                      <HStack spacing={2}>
                        <Switch
                          {...field}
                          isChecked={field.value}
                          size="md"
                          onChange={(e) => field.onChange(e.target.checked)}
                          sx={{
                            "& .chakra-switch__track[data-checked]": {
                              backgroundColor: "#1a355c",
                            },
                          }}
                        />
                        <Text
                          fontFamily="Poppins"
                          fontSize="sm"
                          color="gray.600"
                        >
                          Same as the calendar year
                        </Text>
                      </HStack>
                    )}
                  />
                </HStack>

                {/* <Text
                  fontFamily="Poppins"
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  Note: The leave based calculation will consider the selected
                  period as one year
                </Text> */}
                <Text
                  fontFamily="Poppins"
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  <Text as="span" fontWeight="600" color="black">
                    Note:
                  </Text>{" "}
                  The leave based calculation will consider the selected
                  period as one year
                </Text>

                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                  mb={4}
                >
                  <FormControl isInvalid={!!errors.leaveYearFrom}>
                    <FormLabel fontFamily="Poppins" fontSize="13px" fontWeight={'500'}>
                      From
                    </FormLabel>
                    <Input
                      type="date"
                      {...register("leaveYearFrom", {
                        validate: (v) => {
                          if (leaveYearSame) return true;
                          return v ? true : "Leave year start is required";
                        },
                      })}
                      {...inputStyle}
                      placeholder="dd/mm/yyyy"
                      isDisabled={leaveYearSame}
                      onChange={(e) => {
                        if (!leaveYearSame)
                          setValue("leaveYearFrom", e.target.value);
                      }}
                    />
                    <FormErrorMessage fontFamily="Poppins" fontSize="sm">
                      {errors.leaveYearFrom?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.leaveYearTo}>
                    <FormLabel fontFamily="Poppins" fontSize="13px" fontWeight={'500'}>
                      To
                    </FormLabel>
                    <Input
                      type="date"
                      {...register("leaveYearTo", {
                        validate: (v) => {
                          if (leaveYearSame) return true;
                          if (!v) return "Leave year end is required";

                          const from = watch("leaveYearFrom");
                          if (!from) return "Leave year start is required";

                          if (v <= from)
                            return "Leave year end must be after start date";

                          return true;
                        },
                      })}
                      {...inputStyle}
                      isDisabled={leaveYearSame}
                    />
                    <FormErrorMessage>
                      {errors.leaveYearTo?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>
              </Box>
            </Grid>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
