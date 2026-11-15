import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Input,
  Select,
  Textarea,
  Switch,
  Heading,
  HStack,
  Divider,
  Text,
  InputGroup,
  InputRightElement,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function AddLeaveForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const getLocalToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [today, setToday] = useState(getLocalToday);

  useEffect(() => {
    const updateToday = () => {
      setToday(getLocalToday());
    };

    updateToday();

    const interval = setInterval(updateToday, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      displayName: "",
      payType: "Paid",
      units: "Days",
      description: "",
      validFrom: "",
      validTo: "",
      accrualPeriod: "monthly",
      accrualDays: "",
      numberOfDays: 0,
      carryForward: false,
      carryForwardDays: "",
      carryForwardExpires: false,
      carryForwardExpiresDays: "",
      carryForwardWindowDays: "",
      serviceWillGetDays: 0,
      encashmentEnabled: false,
      encashmentType: "",
      encashmentMaxOption: "",
      encashmentDays: "",
    },
  });

  // Track applicable option in component state so it is NOT part of form data sent to API
  const [applicableTo, setApplicableTo] = useState("all");

  // const isAfter = (a, b) => new Date(a) > new Date(b);
  // const isSame = (a, b) => new Date(a).getTime() === new Date(b).getTime();

  const isAfter = (a, b) => a > b;
const isSame = (a, b) => a === b;

  const carryForward = watch("carryForward");
  const carryForwardExpires = watch("carryForwardExpires");
  const validFrom = watch("validFrom");
  const validTo = watch("validTo");

useEffect(() => {
  if (validFrom && validTo) {
    trigger(["validFrom", "validTo"]);
  }
}, [validFrom, validTo, trigger]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    try {
      const org_id = getOrgCode();
      if (!org_id) return;

      const isAllEmployees = applicableTo === "all";

      const payload = {
        organisation_id: org_id,

        leave_name: data.name,
        display_name: data.displayName,
        description: data.description,

        // pay_type -> PAID | UNPAID
        pay_type: data.payType === "Paid" ? "PAID" : "UNPAID",

        // unit -> DAY | HOUR
        unit: data.units === "Days" ? "DAY" : "HOUR",

        validity: {
          from: data.validFrom,
          to: isAllEmployees ? data.validTo : null,
        },

        // credit: monthly when ALL employees; yearly-based amount when probation-based
        credit: isAllEmployees
          ? {
              frequency: "MONTHLY",
              amount: Number(data.numberOfDays || 0),
              day_of_month: Number(data.accrualDays || 1),
            }
          : {
              frequency: "YEARLY",
              amount: Number(data.serviceWillGetDays || 0),
            },

        // eligibility: type + probation_days (null for ALL)
        eligibility: isAllEmployees
          ? { type: "ALL", probation_days: null }
          : {
              type: "PROBATION_BASED",
              probation_days: Number(data.serviceWillGetDays || 0),
            },

        carry_forward: {
          allowed: !!data.carryForward,
          max_days: Number(data.carryForwardDays || 0),
          expiry_days: data.carryForwardExpires
            ? Number(data.carryForwardExpiresDays || 0)
            : 0,
          carry_forward_window_days: Number(data.carryForwardWindowDays || 0),
        },

        half_day: {
          allowed: data.halfDay === "yes",
          value: data.halfDay === "yes" ? 0.5 : 0,
        },
      };

      // --- Encashment mapping ---
      // If encashment is enabled include the object with pay_basis + max_days ('ALL' or number).
      if (data.encashmentEnabled) {
        const payBasis =
          data.encashmentType === "full_pay" ? "FULL_PAY" : "BASIC_PAY";

        const maxDays =
          data.encashmentMaxOption === "all_remaining"
            ? "ALL"
            : // when specific, ensure numeric
              Number(data.encashmentDays || 0);

        payload.encashment = {
          enabled: true,
          pay_basis: payBasis,
          max_days: maxDays,
        };
      } else {
        // include disabled encashment object (optional). You may omit this block if your API prefers absence.
        payload.encashment = {
          enabled: false,
          pay_basis: null,
          max_days: 0,
        };
      }

      await api.post(`/leave/add_leave_policy`, payload);

      toast({
        title: "Leave policy created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(-1);
    } catch (err) {
      toast({
        title: "Failed to create leave policy",
        // description:
        //   err?.response?.data?.message ||
        //   err?.message || err?.msg||
        //   "Something went wrong",

        description: err?.response?.data?.msg || "Something went wrong",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (!carryForward) {
      setValue("carryForwardExpires", false);
      setValue("carryForwardExpiresDays", "");
      setValue("carryForwardWindowDays", "");
    }
  }, [carryForward, setValue]);

  useEffect(() => {
    if (!carryForward) {
      setValue("encashmentEnabled", false);
      setValue("encashmentType", "");
      setValue("encashmentMaxOption", "");
      setValue("encashmentDays", "");
      clearErrors([
        "encashmentEnabled",
        "encashmentType",
        "encashmentMaxOption",
        "encashmentDays",
      ]);
    }
  }, [carryForward, setValue, clearErrors]);

  return (
    <Box
      bg="white"
      borderRadius="14px"
      pt={6}
      boxShadow="sm"
      w="100%"
      mt={3}
      border="1px solid #cccccc"
      fontFamily="Poppins, sans-serif"
      h="100vh"
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
      <Box pl={6} pr={6}>
        <BreadcrumbsNav />
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
        <Heading fontSize={"22px"} fontWeight={700} fontFamily={"Poppins"}>
          Add Leave type
        </Heading>

        <HStack spacing={3}>
          <Button
            bg="blue.900"
            color="white"
            fontWeight={500}
            _hover={{ bg: "blue.700" }}
            borderRadius="14px"
            px={6}
            height="38px"
            width="100px"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Save
          </Button>

          {/* <Button
            variant="outline"
            borderRadius="md"
            height="38px"
            onClick={() => {
              handleSubmit(onSubmit)();
              reset();
            }}
          >
            Save & new
          </Button> */}

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
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

      <Box
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
      />

      {/* Main Card */}
      <Box borderRadius="10px" border="1px solid #ececec" p={6} m={6}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Leave name */}
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Leave name</FormLabel>

                <Input
                  {...register("name", {
                    required: "Leave name is required",
                    pattern: {
                      value: /^[A-Za-z ]+$/,
                      message: "Only alphabets and spaces are allowed",
                    },
                    validate: (v) =>
                      v.trim().length > 0 || "Leave name cannot be empty",
                  })}
                  placeholder="Enter leave name"
                  {...inputStyle}
                  onKeyDown={(e) => {
                    if (
                      !/^[a-zA-Z ]$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight" &&
                      e.key !== "Tab"
                    ) {
                      e.preventDefault();
                    }
                  }}
                />

                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>
            {/* Display name */}
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.displayName}>
                <FormLabel>Display name</FormLabel>

                <Input
                  {...register("displayName", {
                    required: "Display name is required",
                    pattern: {
                      value: /^[A-Za-z ]+$/,
                      message: "Only alphabets and spaces are allowed",
                    },
                    validate: (v) =>
                      v.trim().length > 0 || "Display name cannot be empty",
                  })}
                  placeholder="Enter display name"
                  {...inputStyle}
                  onKeyDown={(e) => {
                    if (
                      !/^[a-zA-Z ]$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight" &&
                      e.key !== "Tab"
                    ) {
                      e.preventDefault();
                    }
                  }}
                />

                <FormErrorMessage>
                  {errors.displayName?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            {/* Pay type */}
            <GridItem>
              <FormControl>
                <FormLabel>Pay type</FormLabel>
                <Select {...register("payType")} {...inputStyle}>
                  <option>Paid</option>
                  <option>Unpaid</option>
                </Select>
              </FormControl>
            </GridItem>
            {/* Units */}
            <GridItem>
              <FormControl>
                <FormLabel>Units</FormLabel>
                <Select {...register("units")} {...inputStyle}>
                  <option>Days</option>
                  <option>Hours</option>
                </Select>
              </FormControl>
            </GridItem>
            {/* Description full width */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl isRequired isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register("description", {
                    required: "Description is required",
                    validate: (v) =>
                      v.trim().length > 0 || "Description cannot be empty",
                  })}
                  placeholder="Enter description"
                  {...inputStyle}
                />
                <FormErrorMessage>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Valid from */}
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.validFrom}>
                <FormLabel>Valid from</FormLabel>
                {/* <Input
                  type="date"
                  {...register("validFrom", {
                    required: "Valid from date is required",
                    validate: (v) => {
                      const to = watch("validTo");
                      if (!to) return true;
                      if (isSame(v, to))
                        return "Valid from and Valid to cannot be the same";
                      if (!isAfter(to, v))
                        return "Valid from must be before Valid to";
                      return true;
                    },
                  })}
                  {...inputStyle}
                /> */}
                <Input
                  type="date"
                  min={today}
                  {...register("validFrom", {
                    required: "Valid from date is required",
                    validate: (v) => {
                      if (v < getLocalToday()) {
                        return "Past dates are not allowed";
                      }

                      const to = watch("validTo");

                      if (!to) return true;

                      if (isSame(v, to)) {
                        return "Valid from and Valid to cannot be the same";
                      }

                      if (!isAfter(to, v)) {
                        return "Valid from must be before Valid to";
                      }

                      return true;
                    },
                  })}
                  {...inputStyle}
                />
                <FormErrorMessage>{errors.validFrom?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Valid to */}
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.validTo}>
                <FormLabel>Valid to</FormLabel>
                {/* <Input
                  type="date"
                  {...register("validTo", {
                    required: "Valid to date is required",
                    validate: (v) => {
                      const from = watch("validFrom");
                      if (!from) return true;
                      if (isSame(from, v))
                        return "Valid from and Valid to cannot be the same";
                      if (!isAfter(v, from))
                        return "Valid to must be after Valid from";
                      return true;
                    },
                  })}
                  {...inputStyle}
                /> */}
                <Input
                  type="date"
                  // min={validFrom && validFrom > today ? validFrom : today}
                  min={
                    validFrom
                      ? (() => {
                          const [year, month, day] = validFrom
                            .split("-")
                            .map(Number);
                          const nextDay = new Date(year, month - 1, day + 1);

                          const yyyy = nextDay.getFullYear();
                          const mm = String(nextDay.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const dd = String(nextDay.getDate()).padStart(2, "0");

                          const minimumDate = `${yyyy}-${mm}-${dd}`;

                          return minimumDate > today ? minimumDate : today;
                        })()
                      : today
                  }
                  {...register("validTo", {
                    required: "Valid to date is required",
                    validate: (v) => {
                      if (v < getLocalToday()) {
                        return "Past dates are not allowed";
                      }

                      const from = watch("validFrom");

                      if (!from) return true;

                      if (isSame(from, v)) {
                        return "Valid from and Valid to cannot be the same";
                      }

                      if (!isAfter(v, from)) {
                        return "Valid to must be after Valid from";
                      }

                      return true;
                    },
                  })}
                  {...inputStyle}
                />
                <FormErrorMessage>{errors.validTo?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Half day */}
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.halfDay}>
                <FormLabel>Is Half day Applicable?</FormLabel>

                <Select
                  placeholder="Select option"
                  {...register("halfDay", {
                    required: "Please select an option",
                  })}
                  {...inputStyle}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>

                <FormErrorMessage>{errors.halfDay?.message}</FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem />
            {/* placeholder */}
          </Grid>

          {/* Leave Accrual */}
          <Box
            mt={6}
            borderWidth="1.5px"
            borderColor="#D0D5DD"
            borderRadius="8px"
          >
            <Heading
              size="md"
              fontWeight={600}
              fontFamily={"Poppins"}
              mb={4}
              pt={4}
              pl={4}
            >
              Leave Accrual
            </Heading>

            <Box
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
            />

            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={6}
              pt={4}
              pr={4}
              pl={4}
            >
              <GridItem>
                {/* Accrual Period */}
                <FormControl isRequired>
                  <FormLabel>Accrual period</FormLabel>
                  <Select {...register("accrualPeriod")} {...inputStyle}>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                {/* Accrual Days */}
                <FormControl isRequired isInvalid={!!errors.accrualDays}>
                  <FormLabel>Accrual day of the month</FormLabel>

                  <Select
                    {...register("accrualDays", {
                      required: "Accrual day of the month is required",
                      valueAsNumber: true,
                    })}
                    {...inputStyle}
                  >
                    <option value="" disabled>
                      Select accrual day
                    </option>

                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </Select>

                  <FormErrorMessage>
                    {errors.accrualDays?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Divider */}
            <Box h="1px" bg="#EDEDED" mt={4} mr={4} ml={4} />

            {/* Applicable to control */}
            <Box mt={6} pr={4} pl={4}>
              <FormControl>
                <FormLabel>Applicable to</FormLabel>
                <HStack spacing={3}>
                  <Button
                    flex="1"
                    size="md"
                    borderRadius="8px"
                    variant={applicableTo === "all" ? "solid" : "outline"}
                    bg={applicableTo === "all" ? "blue.900" : "transparent"}
                    color={applicableTo === "all" ? "white" : "black"}
                    borderColor={
                      applicableTo === "all" ? "blue.900" : "gray.300"
                    }
                    _hover={{
                      bg: applicableTo === "all" ? "blue.800" : "gray.100",
                      color: applicableTo === "all" ? "white" : "black",
                    }}
                    onClick={() => setApplicableTo("all")}
                    fontWeight={500}
                    fontSize={"14px"}
                  >
                    All employees
                  </Button>

                  <Button
                    flex="1"
                    size="md"
                    borderRadius="8px"
                    variant={
                      applicableTo === "experience" ? "solid" : "outline"
                    }
                    bg={
                      applicableTo === "experience" ? "blue.900" : "transparent"
                    }
                    color={applicableTo === "experience" ? "white" : "black"}
                    borderColor={
                      applicableTo === "experience" ? "blue.900" : "gray.300"
                    }
                    _hover={{
                      bg:
                        applicableTo === "experience" ? "blue.800" : "gray.100",
                      color: applicableTo === "experience" ? "white" : "black",
                    }}
                    onClick={() => setApplicableTo("experience")}
                    fontWeight={500}
                    fontSize={"14px"}
                  >
                    Based on Probation Period
                  </Button>
                </HStack>
              </FormControl>
            </Box>

            {/* When user selects "Based on experience" show the dashed service period panel */}
            {applicableTo === "experience" && (
              <Box
                mt={6}
                borderRadius="8px"
                border="2px dashed #d9d9d9"
                p={4}
                mr={4}
                ml={4}
                mb={4}
              >
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "220px 120px 120px 1fr 140px",
                  }}
                  alignItems="center"
                  gap={4}
                  pr={4}
                  pl={4}
                >
                  {/* Center text "Will get" */}
                  <GridItem>
                    <Text
                      textAlign="center"
                      fontSize="md"
                      color="#000000"
                      fontWeight="500"
                    >
                      Will get
                    </Text>
                  </GridItem>

                  {/* Will get -> days */}
                  <GridItem>
                    <FormControl
                      isRequired
                      isInvalid={!!errors.serviceWillGetDays}
                    >
                      <FormLabel fontSize="xs">Day(s)</FormLabel>
                      <Input
                        type="number"
                        {...register("serviceWillGetDays", {
                          required: "Days are required",
                          valueAsNumber: true,
                          validate: (v) =>
                            v > 0 || "Days must be greater than 0",
                        })}
                        {...inputStyle}
                      />
                      <FormErrorMessage>
                        {errors.serviceWillGetDays?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>
            )}

            {/* Number of Days — ONLY for All employees */}
            {applicableTo === "all" && (
              <Box mt={4} pr={4} pl={4} pb={4}>
                <FormControl isRequired isInvalid={!!errors.numberOfDays}>
                  <FormLabel>Number of day(s)</FormLabel>

                  <Input
                    type="number"
                    min={0}
                    {...register("numberOfDays", {
                      required: "Required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      validate: (v) =>
                        v > 0 || "Number of days must be greater than 0",
                    })}
                    {...inputStyle}
                    onWheel={(e) => e.target.blur()} // prevent scroll change
                    onKeyDown={(e) => {
                      if (
                        e.key === "-" ||
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />

                  <FormErrorMessage>
                    {errors.numberOfDays?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
            )}
          </Box>

          {/* Divider */}
          <Box h="1px" bg="#EDEDED" mt={6} />

          <Box>
            {/* Carry Forward */}
            <Box mt={6} pb={6} borderBottom="1px solid #e6e6e6">
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontSize="lg" fontWeight={700}>
                    Carry Forward
                  </Text>
                  <Text fontSize="sm" color="#000000" mt={2} maxW="900px">
                    Number of unused leaves of an employee can be carry
                    forwarded.
                  </Text>
                </Box>

                <Controller
                  control={control}
                  name="carryForward"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      size="lg"
                      isChecked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      sx={{
                        "& .chakra-switch__track": {
                          transition: "background-color 0.2s ease",
                        },
                        "& .chakra-switch__track[data-checked]": {
                          backgroundColor: "#1a355c",
                        },
                      }}
                    />
                  )}
                />
              </Flex>

              <Text fontSize="xs" color="#000000" mt={3}>
                The specified leave count will be automatically carried forward
                to the next year's leave balance at the end of each year :
              </Text>

              <Box mt={4}>
                <FormControl isInvalid={!!errors.carryForwardDays}>
                  <FormLabel srOnly>Carry forward days</FormLabel>
                  <Input
                    placeholder="Maximum number of day(s) can be carry forwarded"
                    {...register("carryForwardDays", {
                      valueAsNumber: true,
                      validate: (v) => {
                        if (!carryForward) return true;
                        if (!v) return "Carry forward days are required";
                        if (v <= 0)
                          return "Carry forward days must be greater than 0";
                        return true;
                      },
                    })}
                    {...inputStyle}
                    isDisabled={!carryForward}
                  />
                  <FormErrorMessage>
                    {errors.carryForwardDays?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
            </Box>

            {/* Carry forward window */}
            <Box mt={6} pb={6} borderBottom="1px solid #e6e6e6">
              <Box>
                <Text fontSize="lg" fontWeight={700}>
                  Carry forward Window
                </Text>
                <Text fontSize="sm" color="#000000" mt={2} maxW="900px">
                  Number of days for which CF Window will remain active till end
                  of the year.
                </Text>
              </Box>

              <Text fontSize="xs" color="#000000" mt={3}>
                Maximum of 90 days period can be allocated for this window
              </Text>

              <Box mt={4}>
                <FormControl isInvalid={!!errors.carryForwardWindowDays}>
                  <FormLabel srOnly>Carry forward Window Days</FormLabel>
                  <Input
                    placeholder="Maximum number of day(s) before the end of year"
                    {...register("carryForwardWindowDays", {
                      valueAsNumber: true,
                      validate: (v) => {
                        if (!carryForward) return true;
                        if (!v) return "Window days are required";
                        if (v < 1 || v > 90)
                          return "Carry forward window must be between 1 and 90 days";
                        return true;
                      },
                    })}
                    {...inputStyle}
                    isDisabled={!carryForward}
                  />
                  <FormErrorMessage>
                    {errors.carryForwardWindowDays?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
            </Box>

            {/* Carry forward expires */}
            <Box mt={6} pt={6}>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontSize="lg" fontWeight={700}>
                    Carry forward expires
                  </Text>
                  <Text fontSize="sm" color="#000000" mt={2} maxW="900px">
                    The expiry days for unused carry forwarded leave(s) will be
                    calculated from the beginning of the leave year.
                  </Text>
                </Box>

                <Controller
                  control={control}
                  name="carryForwardExpires"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      size="lg"
                      isChecked={value}
                      isDisabled={!carryForward}
                      onChange={(e) => onChange(e.target.checked)}
                      sx={{
                        "& .chakra-switch__track[data-checked]": {
                          backgroundColor: "#1a355c",
                        },
                      }}
                    />
                  )}
                />
              </Flex>

              <Box mt={4}>
                <FormControl isInvalid={!!errors.carryForwardExpiresDays}>
                  <FormLabel srOnly>Carry forward expires days</FormLabel>
                  <Input
                    placeholder="Expires in day(s)"
                    {...register("carryForwardExpiresDays", {
                      valueAsNumber: true,
                      validate: (v) => {
                        if (!carryForward || !carryForwardExpires) return true;
                        if (!v) return "Expiry days are required";
                        if (v <= 0) return "Expiry days must be greater than 0";
                        return true;
                      },
                    })}
                    {...inputStyle}
                    isDisabled={!carryForward || !carryForwardExpires}
                  />
                  <FormErrorMessage>
                    {errors.carryForwardExpiresDays?.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
            </Box>

            {/* Divider */}
            <Box h="1px" bg="#EDEDED" mt={6} />

            {/* Encashments */}
            <Box mt={6} pt={6}>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontSize="lg" fontWeight={700}>
                    Encashments
                  </Text>
                  <Text fontSize="sm" color="#000000" mt={2} maxW="900px">
                    Number of unused leaves of an employee can be encashed.
                  </Text>
                </Box>

                <Controller
                  control={control}
                  name="encashmentEnabled"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      size="lg"
                      isChecked={value}
                      isDisabled={!carryForward}
                      onChange={(e) => {
                        const next = e.target.checked;
                        onChange(next);

                        if (!next) {
                          setValue("encashmentType", "");
                          setValue("encashmentMaxOption", "");
                          setValue("encashmentDays", "");
                          clearErrors([
                            "encashmentType",
                            "encashmentMaxOption",
                            "encashmentDays",
                          ]);
                        }
                      }}
                      sx={{
                        "& .chakra-switch__track[data-checked]": {
                          backgroundColor: "#1a355c",
                        },
                      }}
                    />
                  )}
                />
              </Flex>

              <Box mt={4}>
                {/* Row 1 */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <FormControl isInvalid={!!errors.encashmentType}>
                    <FormLabel srOnly>Encashment type</FormLabel>

                    <Controller
                      control={control}
                      name="encashmentType"
                      rules={{
                        validate: (v) => {
                          if (!watch("encashmentEnabled")) return true;
                          return !v ? "Encashment type is required" : true;
                        },
                      }}
                      render={({ field }) => (
                        <Select
                          placeholder="Encashment type"
                          {...field}
                          {...inputStyle}
                          isDisabled={!watch("encashmentEnabled")}
                        >
                          <option value="basic_pay">Basic Pay</option>
                          <option value="full_pay">Full Pay</option>
                        </Select>
                      )}
                    />

                    <FormErrorMessage>
                      {errors.encashmentType?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Box />
                </SimpleGrid>

                {/* Row 2 */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={!!errors.encashmentMaxOption}>
                    <FormLabel srOnly>
                      Maximum number of days that can be encashed
                    </FormLabel>

                    <Controller
                      control={control}
                      name="encashmentMaxOption"
                      rules={{
                        validate: (v) => {
                          if (!watch("encashmentEnabled")) return true;
                          return !v ? "Please select an option" : true;
                        },
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          placeholder="Select maximum days option"
                          value={value}
                          onChange={(e) => {
                            onChange(e.target.value);
                            if (e.target.value === "all_remaining") {
                              setValue("encashmentDays", "");
                              clearErrors("encashmentDays");
                            }
                          }}
                          {...inputStyle}
                          isDisabled={!watch("encashmentEnabled")}
                        >
                          <option value="specific">
                            Specific number of days
                          </option>
                          <option value="all_remaining">
                            All the remaining days
                          </option>
                        </Select>
                      )}
                    />

                    <FormErrorMessage>
                      {errors.encashmentMaxOption?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.encashmentDays}>
                    <FormLabel srOnly>Number of day(s)</FormLabel>

                    <Controller
                      control={control}
                      name="encashmentDays"
                      rules={{
                        validate: (v) => {
                          if (
                            !watch("encashmentEnabled") ||
                            watch("encashmentMaxOption") !== "specific"
                          ) {
                            return true;
                          }
                          const n = Number(v);
                          return (
                            (n && Number.isFinite(n) && n > 0) ||
                            "Enter valid days"
                          );
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          placeholder="Number of day(s)"
                          type="number"
                          min={1}
                          {...field}
                          {...inputStyle}
                          isDisabled={
                            !watch("encashmentEnabled") ||
                            watch("encashmentMaxOption") !== "specific"
                          }
                        />
                      )}
                    />

                    <FormErrorMessage>
                      {errors.encashmentDays?.message}
                    </FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
