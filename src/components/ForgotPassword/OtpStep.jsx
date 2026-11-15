import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import OtpInput from "./OtpInput";
import api from "../../api/axios";
import { getEmpCode } from "../../utils/token";

export default function OtpStep({ otp, setOtp, onNext, employeeId }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const employeeID = employeeId || getEmpCode();

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setLoading(true);
      const payload = { employee_id: employeeID, otp };
      const res = await api.post("/auth/verify_otp", payload);
      toast({
        title: res?.data?.msg || "OTP verified",
        status: "success",
        duration: 2500,
      });
      if (onNext) onNext();
    } catch (err) {
      console.error("Verify OTP failed", err);
      toast({
        title: "OTP verification failed",
        description: err?.response?.data?.msg || err?.message || "",
        status: "error",
        duration: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text fontSize="22px" fontWeight="700" mb={4}>
        Verify OTP
      </Text>

      <Text fontSize="13px" mb={3}>
        Enter your 6-digit OTP
      </Text>

      <OtpInput value={otp} setValue={setOtp} />

      <Flex justify="flex-end" pr={8}>
        <Button
          mt={6}
          bg="#274167"
          _hover={{ bg: "blue.700" }}
          color="white"
          onClick={handleVerify}
          isLoading={loading}
          isDisabled={otp.length !== 6 || loading}
        >
          Verify
        </Button>
      </Flex>
    </Box>
  );
}
