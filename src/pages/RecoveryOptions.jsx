import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Heading, Text, Input, Button, Alert, AlertIcon, Link, VStack } from "@chakra-ui/react";
import AuthLayout from "../components/Auth/AuthLayout";
import { recoverWithCodeThunk } from "../slices/authSlice";

export default function RecoveryOptions() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const [code, setCode] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const data = await dispatch(recoverWithCodeThunk(code.trim())).unwrap();
      if (data.next_step !== "enrollment") throw new Error("Unexpected recovery stage");
      navigate("/enrollment", { replace: true });
    } catch (err) { setError(err?.msg || err?.message || (typeof err === "string" ? err : "Recovery failed")); }
    finally { setBusy(false); }
  };
  return <AuthLayout><Box maxW="480px" w="100%">
    <Heading size="lg" mb={4}>Lost your authenticator?</Heading>
    <Text mb={5}>Enter one unused saved recovery code. This revokes your old authenticator and sessions. You will enroll a new authenticator before accessing the dashboard.</Text>
    <Box as="form" onSubmit={submit}><VStack align="stretch" spacing={4}>
      <Input aria-label="Saved recovery code" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="Saved recovery code" />
      <Button type="submit" colorScheme="blue" isLoading={busy} isDisabled={!code.trim()}>Recover and enroll a new phone</Button>
    </VStack></Box>
    {error && <Alert status="error" mt={4}><AlertIcon />{error}</Alert>}
    <Text mt={6}>No recovery code? Contact an authorized organization administrator for an identity-verified MFA reset.</Text>
    <Link as={RouterLink} to="/mfa" display="block" mt={4}>Back to authenticator verification</Link>
  </Box></AuthLayout>;
}
