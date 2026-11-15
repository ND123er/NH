import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Checkbox,
  Flex,
  useToast,
  Spinner,
  Text,
  Box,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import calendar_filter from "../../assets/calendar_filter.svg";
import { decodeTokenPayload, getOrgCode } from "../../utils/token";
import api from "../../api/axios";

export default function ApplyLeaveModal({ isOpen, onClose }) {
  const toast = useToast();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

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

  // const {
  //   register,
  //   handleSubmit,
  //   control,
  //   reset,
  //   watch,
  //   setError,
  //   formState: { isSubmitting, errors },
  // } = useForm({
  //   defaultValues: {
  //     leaveTypeId: "",
  //     from: "",
  //     to: "",
  //     isHalfDay: false,
  //     reason: "",
  //   },
  // });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      leaveTypeId: "",
      from: "",
      to: "",
      isHalfDay: false,
      reason: "",
    },
  });

  const fromDate = watch("from");
  const toDate = watch("to");
  const isHalfDay = watch("isHalfDay");

  const isSingleDay =
    fromDate &&
    toDate &&
    new Date(fromDate).toDateString() === new Date(toDate).toDateString();

  /* ================= DERIVED NUMBER OF DAYS ================= */
  const numberOfDays = useMemo(() => {
    if (isHalfDay) return 0.5;

    if (!fromDate || !toDate) return "";

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (isNaN(start) || isNaN(end)) return "";

    if (end < start) return "";

    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return diff;
  }, [fromDate, toDate, isHalfDay]);

  /* ================= FETCH LEAVE TYPES ================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaveTypes = async () => {
      try {
        setLoadingLeaveTypes(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/leave/get_all_leave_policies?organisation_id=${orgId}`,
        );

        if (res?.data?.data) {
          setLeaveTypes(res.data.data.filter((l) => l.is_active));
        }
      } catch (err) {
        toast({
          title: "Failed to load leave types",
          description:
            err?.response?.data?.message ||
            "Unable to fetch leave types. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, [isOpen, toast]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // useEffect(() => {
  //   if (!isSingleDay) {
  //     reset({ ...watch(), isHalfDay: false }, { keepValues: true });
  //   }
  // }, [isSingleDay]);

  useEffect(() => {
    if (!isSingleDay) {
      setValue("isHalfDay", false);
    }
  }, [isSingleDay, setValue]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    try {
      const tokenPayload = decodeTokenPayload();
      const employeeId = tokenPayload?.employee_id;

      if (!employeeId) throw new Error("Employee ID not found");

      const payload = {
        employee_id: employeeId,
        leave_type_id: data.leaveTypeId,
        start_date: data.from,
        end_date: data.to,
        is_half_day: !!data.isHalfDay,
        number_of_days: numberOfDays === "" ? null : numberOfDays,
        reason: data.reason,
      };

      await api.post("/leave/apply_leave", payload);

      toast({
        title: "Leave applied successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      reset();
      onClose();
    } catch (err) {
      // Prefer backend message if present
      const backendMsg =
        err?.response?.data?.msg || err?.response?.data?.message || null;

      // Map known backend messages to user-friendly text
      let userMessage = "Failed to apply leave";

      if (backendMsg) {
        if (backendMsg.toLowerCase().includes("leave days mismatch")) {
          userMessage =
            "You don't have enough leave balance for the selected dates.";
        } else {
          // show backend message as-is
          userMessage = backendMsg;
        }
      }

      toast({
        title: "Leave application failed",
        description: userMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="14px">
        <ModalHeader fontFamily={"Poppins"} fontWeight={600}>
          Apply for leave
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Leave Type */}
            <FormControl mb={4} isRequired isInvalid={!!errors.leaveTypeId}>
              <FormLabel fontFamily="Poppins">Leave Type</FormLabel>

              {loadingLeaveTypes ? (
                <Flex align="center" gap={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm">Loading leave types...</Text>
                </Flex>
              ) : (
                <Select
                  placeholder="Select leave type"
                  {...register("leaveTypeId", {
                    required: "Please select a leave type",
                  })}
                  {...inputStyle}
                >
                  {leaveTypes.map((leave) => (
                    <option key={leave._id} value={leave._id}>
                      {leave.leave_name}
                    </option>
                  ))}
                </Select>
              )}

              <Text color="red.500" fontSize="sm">
                {errors.leaveTypeId?.message}
              </Text>
            </FormControl>

            {/* From / To */}
            <Flex gap={2}>
              <FormControl mb={4} isRequired isInvalid={!!errors.from}>
                <FormLabel fontFamily="Poppins">From</FormLabel>

                <InputGroup>
                  <Input
                    type="date"
                    {...register("from", { required: "From date is required" })}
                    max={toDate || undefined}
                    {...inputStyle}
                    sx={{
                      "&::-webkit-calendar-picker-indicator": {
                        opacity: 0, // hide native icon
                        position: "absolute",
                        right: 0,
                        width: "100%",
                        cursor: "pointer",
                      },
                    }}
                  />

                  <InputRightElement pointerEvents="none" pr={3} pt={3}>
                    <img
                      src={calendar_filter}
                      alt="calendar"
                      width={16}
                      height={16}
                    />
                  </InputRightElement>
                </InputGroup>

                <Text color="red.500" fontSize="sm">
                  {errors.from?.message}
                </Text>
              </FormControl>

              <FormControl mb={4} isRequired isInvalid={!!errors.to}>
                <FormLabel fontFamily="Poppins">To</FormLabel>

                <InputGroup>
                  <Input
                    type="date"
                    {...register("to", {
                      required: "To date is required",
                      validate: (v) =>
                        !fromDate ||
                        v >= fromDate ||
                        "To date cannot be before From date",
                    })}
                    min={fromDate || undefined}
                    {...inputStyle}
                    sx={{
                      "&::-webkit-calendar-picker-indicator": {
                        opacity: 0,
                        position: "absolute",
                        right: 0,
                        width: "100%",
                        cursor: "pointer",
                      },
                    }}
                  />

                  <InputRightElement pointerEvents="none" pr={3} pt={3}>
                    <img
                      src={calendar_filter}
                      alt="calendar"
                      width={16}
                      height={16}
                    />
                  </InputRightElement>
                </InputGroup>
                <Text color="red.500" fontSize="sm">
                  {errors.to?.message}
                </Text>
              </FormControl>
            </Flex>

            {/* Number of days */}
            <FormControl mb={4}>
              <FormLabel fontFamily={"Poppins"}>Number of days</FormLabel>
              <Input
                value={numberOfDays}
                isReadOnly
                placeholder="Number of days"
                {...inputStyle}
              />
            </FormControl>

            {/* Half Day */}
            <FormControl mb={4} fontFamily={"Poppins"}>
              <Controller
                control={control}
                name="isHalfDay"
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    isChecked={value}
                    isDisabled={!isSingleDay}
                    onChange={(e) => onChange(e.target.checked)}
                    sx={{
                      "& .chakra-checkbox__control": {
                        borderColor: "#757575",

                        borderRadius: "4px",
                      },
                      "& .chakra-checkbox__control[data-checked]": {
                        backgroundColor: "#1a355c",
                        borderColor: "#757575",
                      },
                    }}
                  >
                    Half Day
                  </Checkbox>
                )}
              />
            </FormControl>

            {/* Reason */}
            <FormControl mb={4} isRequired isInvalid={!!errors.reason}>
              <FormLabel fontFamily="Poppins">Reason</FormLabel>

              <Textarea
                placeholder="Give your reason"
                {...register("reason", {
                  required: "Reason is required",
                  validate: (v) =>
                    v.trim().length > 0 || "Reason cannot be empty",
                })}
                {...inputStyle}
              />

              <Text color="red.500" fontSize="sm">
                {errors.reason?.message}
              </Text>
            </FormControl>

            {/* Footer */}
            <Flex justify="space-between" gap={3} mt={4}>
              <Button
                variant="ghost"
                color="#757575"
                onClick={handleClose}
                isDisabled={isSubmitting}
                fontFamily={"Poppins"}
                fontWeight={500}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                bg="#274167"
                color="white"
                isLoading={isSubmitting}
                _hover={{ bg: "#1f3143" }}
                fontFamily={"Poppins"}
                fontWeight={500}
                pr={8}
                pl={8}
              >
                Apply
              </Button>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
