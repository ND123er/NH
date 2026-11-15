import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
  Box,
  Switch,
  FormErrorMessage,
} from "@chakra-ui/react";
import axios from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function LeaveEditModal({
  isOpen,
  onClose,
  leaveId,
  onUpdated,
  isViewMode = false,
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    leave_name: "",
    display: "",
    pay_type: "PAID",
    units: "Days",
    leave_code: "",
    description: "",
    cycle_pattern: "monthly",
    monthly_date: 1,
    is_carry_forward: false,
    max_carry_forward_day: 0,
    is_carry_forward_expires: false,
    carry_forward_expiry: 0,
    valid_from: "",
    valid_to: "",
    is_active: true,
    applicable_to: 1,
    number_of_days: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  // helper to format date to yyyy-mm-dd for input[type=date]
  const toDateInput = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!isOpen || !leaveId) return;

    const fetchSingle = async () => {
      setLoading(true);
      setError(null);
      try {
        const organisation_id = getOrgCode();
        const res = await axios.get(
          `/leave/get_single_leave_policy/${leaveId}`,
          {
            params: { organisation_id },
          },
        );

        const data = res?.data?.data;
        if (data) {
          setForm({
            leave_name: data.leave_name || "",
            display: data.display_name || "",
            pay_type: data.pay_type || "PAID",
            units: data.units || "Days",
            leave_code: data.leave_code || "",
            description: data.description || "",
            cycle_pattern: data.cycle_pattern || "monthly",
            monthly_date: data.monthly_date ?? 1,
            // is_carry_forward: !!data.carry_forward.allowed,
            // max_carry_forward_day: data.carry_forward.max_days ?? 0,

            // is_carry_forward_expires: data.carry_forward.expiry_days
            //   ? true
            //   : false,
            // carry_forward_expiry: data.carry_forward.expiry_days ?? 0,
            is_carry_forward: !!data.carry_forward?.allowed,
            max_carry_forward_day: data.carry_forward?.max_days ?? 0,

            is_carry_forward_expires: !!data.carry_forward?.expiry_days,

            carry_forward_expiry: data.carry_forward?.expiry_days ?? 0,

            // valid_from: toDateInput(data.validity.from),
            // valid_to: toDateInput(data.validity.to),
            valid_from: toDateInput(data.validity?.from),
            valid_to: toDateInput(data.validity?.to),
            is_active: data.is_active ?? true,
            applicable_to: data.applicable_to ?? 1,
            number_of_days: data.credit?.amount ?? 0,
            is_half_day_applicable: !!data.half_day?.allowed,
            accrual_period: data.credit?.frequency || "",
            accrual_day: data.credit?.day_of_month ?? "",
          });
        } else {
          setError("Failed to load leave policy");
        }
      } catch (err) {
        console.error("Failed to fetch leave policy", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load leave policy",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, leaveId]);

  const handleChange = (field) => (e) => {
    const v =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: v }));
  };

  const handleNumberChange = (field) => (e) => {
    const v = e.target.value;
    setForm((p) => ({ ...p, [field]: v === "" ? "" : Number(v) }));
  };

  const handleUpdate = async () => {
    if (isViewMode) return;
    // basic validation
    if (!form.leave_name.trim()) {
      toast({ title: "Leave name is required", status: "error" });
      return;
    }

    setSaving(true);
    try {
      const organisation_id = getOrgCode();
      const payload = {
        leave_name: form.leave_name,
        display: form.display,
        pay_type: form.pay_type,
        units: form.units,
        leave_code: form.leave_code,
        description: form.description,
        half_day: {
          allowed: !!form.is_half_day_applicable,
          value: form.is_half_day_applicable ? 0.5 : 0,
        },
        credit: {
          frequency: form.accrual_period,
          amount: Number(form.number_of_days || 0),
          day_of_month: Number(form.accrual_day),
        },
        cycle_pattern: form.cycle_pattern,
        monthly_date: Number(form.monthly_date || 1),
        is_carry_forward: !!form.is_carry_forward,
        max_carry_forward_day: Number(form.max_carry_forward_day || 0),
        is_carry_forward_expires: !!form.is_carry_forward_expires,
        carry_forward_expiry: Number(form.carry_forward_expiry || 0),
        valid_from: form.valid_from
          ? new Date(form.valid_from).toISOString()
          : null,
        valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
        is_active: !!form.is_active,
        applicable_to: Number(form.applicable_to || 1),
        number_of_days: Number(form.number_of_days || 0),
      };

      await axios.put(`/leave/update_leave_policy/${leaveId}`, payload, {
        params: { organisation_id },
      });

      toast({
        title: "Leave policy updated",
        status: "success",
        duration: 3000,
      });
      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update leave policy", err);
      toast({
        title: "Failed to update",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const nameRegex = /^[A-Za-z\s]*$/;
  // const displayRegex = /^[A-Za-z]*$/;
  const displayRegex = /^[A-Za-z ]*$/;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent fontFamily="Poppins">
        {/* <ModalHeader>Edit Leave Policy</ModalHeader> */}
        <ModalHeader>
          {isViewMode ? "View Leave Policy" : "Edit Leave Policy"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading leave policy...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box>
              <fieldset disabled={isViewMode}>
                <FormControl mb={3} isRequired>
                  <FormLabel>Leave name</FormLabel>
                  <Input
                    value={form.leave_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (nameRegex.test(value)) {
                        handleChange("leave_name")(e);
                      }
                    }}
                    placeholder="Enter leave name"
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Display</FormLabel>
                  <Input
                    value={form.display}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (displayRegex.test(value)) {
                        handleChange("display")(e);
                      }
                    }}
                    placeholder="Display name (e.g. CL)"
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Pay type</FormLabel>
                  <Select
                    value={form.pay_type}
                    onChange={handleChange("pay_type")}
                    {...inputStyle}
                  >
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Units</FormLabel>
                  <Select
                    value={form.units}
                    onChange={handleChange("units")}
                    {...inputStyle}
                  >
                    <option>Days</option>
                    <option>Hours</option>
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Leave code</FormLabel>
                  <Input
                    value={form.leave_code}
                    onChange={handleChange("leave_code")}
                    placeholder="Code"
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl mb={3} isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Description"
                    {...inputStyle}
                    rows={3}
                  />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Is Half day Applicable?</FormLabel>
                  <Select
                    value={form.is_half_day_applicable ? "yes" : "no"}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        is_half_day_applicable: e.target.value === "yes",
                      }))
                    }
                    {...inputStyle}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Accrual period</FormLabel>
                  <Select
                    value={form.accrual_period}
                    onChange={handleChange("accrual_period")}
                    {...inputStyle}
                  >
                    <option value="MONTHLY">Monthly</option>
                    {/* <option value="YEARLY">Yearly</option> */}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Accrual day of the month</FormLabel>

                  <Select
                    value={form.accrual_day}
                    onChange={handleChange("accrual_day")}
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
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Valid from</FormLabel>
                  <Input
                    type="date"
                    value={form.valid_from}
                    max={form.valid_to || undefined}
                    onChange={(e) => {
                      const value = e.target.value;

                      // if "from" becomes greater than "to", clear "to"
                      setForm((p) => ({
                        ...p,
                        valid_from: value,
                        valid_to:
                          p.valid_to && value && value > p.valid_to
                            ? ""
                            : p.valid_to,
                      }));
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Valid to</FormLabel>
                  <Input
                    type="date"
                    value={form.valid_to}
                    min={form.valid_from || undefined}
                    onChange={(e) => {
                      const value = e.target.value;

                      // block selecting a date before "from"
                      if (form.valid_from && value < form.valid_from) return;

                      handleChange("valid_to")(e);
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl
                  mb={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <FormLabel mb={0}>Carry Forward</FormLabel>
                    <Text fontSize="sm" color="gray.600">
                      Allow carry forward of unused leaves
                    </Text>
                  </Box>
                  <Switch
                    isChecked={form.is_carry_forward}
                    onChange={handleChange("is_carry_forward")}
                    sx={{
                      "& .chakra-switch__track": {
                        backgroundColor: "#e2e8f0", // unchecked (optional)
                      },
                      "& .chakra-switch__track[data-checked]": {
                        backgroundColor: "#1a355c",
                      },
                    }}
                  />
                </FormControl>

                {form.is_carry_forward && (
                  <FormControl
                    mb={3}
                    isInvalid={Number(form.max_carry_forward_day) < 0}
                  >
                    <FormLabel>Max carry forward days</FormLabel>
                    <Input
                      type="number"
                      value={form.max_carry_forward_day}
                      onChange={handleNumberChange("max_carry_forward_day")}
                      {...inputStyle}
                    />
                    <FormErrorMessage>
                      {Number(form.max_carry_forward_day) < 0 && "Must be >= 0"}
                    </FormErrorMessage>
                  </FormControl>
                )}

                <FormControl
                  mb={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <FormLabel mb={0}>Carry forward expires</FormLabel>
                  </Box>
                  <Switch
                    isChecked={form.is_carry_forward_expires}
                    onChange={handleChange("is_carry_forward_expires")}
                    sx={{
                      "& .chakra-switch__track": {
                        backgroundColor: "#e2e8f0", // unchecked (optional)
                      },
                      "& .chakra-switch__track[data-checked]": {
                        backgroundColor: "#1a355c",
                      },
                    }}
                  />
                </FormControl>

                {form.is_carry_forward_expires && (
                  <FormControl
                    mb={3}
                    isInvalid={Number(form.carry_forward_expiry) < 0}
                  >
                    <FormLabel>Carry forward expiry (days)</FormLabel>
                    <Input
                      type="number"
                      value={form.carry_forward_expiry}
                      onChange={handleNumberChange("carry_forward_expiry")}
                      {...inputStyle}
                    />
                    <FormErrorMessage>
                      {Number(form.carry_forward_expiry) < 0 && "Must be >= 0"}
                    </FormErrorMessage>
                  </FormControl>
                )}

                <FormControl mb={3}>
                  <FormLabel>Applicable to</FormLabel>
                  <Select
                    value={String(form.applicable_to)}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        applicable_to: Number(e.target.value),
                      }))
                    }
                    {...inputStyle}
                  >
                    <option value={1}>All employees</option>
                    <option value={2}>Based on probation/experience</option>
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Number of days</FormLabel>
                  <Input
                    type="number"
                    value={form.number_of_days}
                    onChange={handleNumberChange("number_of_days")}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl
                  mb={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <FormLabel mb={0}>Active</FormLabel>
                  <Switch
                    isChecked={form.is_active}
                    onChange={handleChange("is_active")}
                    sx={{
                      "& .chakra-switch__track": {
                        backgroundColor: "#e2e8f0",
                      },
                      "& .chakra-switch__track[data-checked]": {
                        backgroundColor: "#1a355c",
                      },
                    }}
                  />
                </FormControl>
              </fieldset>
            </Box>
          )}
        </ModalBody>

        <Flex p={4} justify="space-between">
          <Button
            onClick={handleClose}
            size="sm"
            color={"#757575"}
            bg={"white"}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              bg="blue.900"
              color="white"
              _hover={{ bg: "blue.800" }}
              size="sm"
              onClick={handleUpdate}
              isLoading={saving}
              isDisabled={loading}
            >
              Update
            </Button>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
}
