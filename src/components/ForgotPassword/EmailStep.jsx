import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import api from "../../api/axios";
import { getEmpCode } from "../../utils/token";

export default function EmailStep({
  email,
  setEmail,
  onNext,
  isLoading,
  setEmployeeId,
}) {
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // email validity
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return EMAIL_REGEX.test(email);
  }, [email]);

  const toast = useToast();
  const [localLoading, setLocalLoading] = useState(false);
  const loading = typeof isLoading !== "undefined" ? isLoading : localLoading;

  const handleSendOtp = async () => {
    if (!isEmailValid) return;
    try {
      setLocalLoading(true);
      const payload = { email };
      const res = await api.post("/auth/send_otp", payload);

      toast({
        title: res?.data?.msg || "OTP sent",
        status: "success",
        duration: 2500,
      });
      const empId = res?.data?.employee_id;
      if (empId && setEmployeeId) setEmployeeId(empId);
      if (onNext) onNext();
    } catch (err) {
      console.error("Send OTP failed", err);
      toast({
        title: "Failed to send OTP",
        description: err?.response?.data?.msg || err?.message || "",
        status: "error",
        duration: 3500,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Box maxW="720px">
      <Text fontSize="22px" fontWeight="700" mb={4}>
        Reset Password
      </Text>

      <FormControl mb={2} isRequired isInvalid={email && !isEmailValid}>
        <FormLabel fontSize="12px">Enter Registered Email ID</FormLabel>

        <Input
          placeholder="Enter Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          {...inputStyle}
        />

        {email && !isEmailValid && (
          <FormErrorMessage fontSize="12px">
            Please enter a valid email address
          </FormErrorMessage>
        )}
      </FormControl>

      <Text fontSize="12px" color="gray.500" mb={6}>
        You will receive a 6-digit OTP in your registered email address.
      </Text>

      <Button
        float="right"
        bg="#274167"
        color="white"
        isLoading={loading}
        onClick={handleSendOtp}
        isDisabled={!isEmailValid || loading}
        _hover={{ bg: "blue.700" }}
      >
        Send OTP
      </Button>
    </Box>
  );
}
