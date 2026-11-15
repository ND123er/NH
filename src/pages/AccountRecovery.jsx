import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, AlertIcon, Box, Button, Heading, Link, Spinner, Text, VStack } from "@chakra-ui/react";
import AuthLayout from "../components/Auth/AuthLayout";
import { redeemRecoveryLink } from "../api/auth";
import { logout, redeemAuthLinkThunk, acceptAuthTransition } from "../slices/authSlice";

const routes = {
  password_setup: "/password", password_reset: "/password",
  enrollment: "/enrollment", mfa: "/mfa", recovery_codes: "/recovery-codes",
  organization_setup: "/orgRegister", full: "/dashboard",
};

export default function AccountRecovery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const attempted = useRef(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(true);
  const [adminToken, setAdminToken] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const fragment = window.location.hash.slice(1);
    // Remove the one-time secret from the address bar before any network request.
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    const params = new URLSearchParams(fragment);
    const token = params.get("token");
    const purpose = params.get("purpose");
    if (!token) {
      setError("This recovery link is missing its token. Request a new email link.");
      setWorking(false);
      return;
    }
    // An email-link session must not inherit a prior user's bearer token.
    dispatch(logout());
    if (purpose === "admin_recovery" || purpose === "mfa_recovery") {
      setAdminToken(token);
      setWorking(false);
      return;
    }
    dispatch(redeemAuthLinkThunk(token)).unwrap().then((data) => {
      const destination = routes[data?.next_step];
      if (!data?.token || !destination) throw new Error("Unexpected link redemption response. Please request another link.");
      navigate(destination, { replace: true });
    }).catch((err) => {
      setError(err?.msg || err?.message || (typeof err === "string" ? err : "This link is invalid, expired, or already used."));
      setWorking(false);
    });
  }, [dispatch, navigate]);
  const submitAdminLink = async (e) => {
    e.preventDefault(); setWorking(true); setError("");
    try {
      const data = await redeemRecoveryLink(adminToken, password);
      dispatch(acceptAuthTransition(data));
      navigate(routes[data.next_step] || "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Could not redeem recovery link");
      setWorking(false);
    }
  };
  return (
    <AuthLayout>
      <Box w="100%" maxW="480px">
        <Heading color="#18203C" fontSize={{ base: "2xl", md: "3xl" }} mb={4}>Account recovery</Heading>
        {adminToken && !working ? <Box as="form" onSubmit={submitAdminLink} mb={5}>
          <Text mb={3}>Confirm your account password to redeem the administrator-approved recovery link.</Text>
          <input aria-label="Account password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ border: "1px solid #CBD5E0", padding: 12, width: "100%", borderRadius: 6 }} />
          <Button mt={4} type="submit" colorScheme="blue">Continue recovery</Button>
          {error && <Alert status="error" mt={4}><AlertIcon />{error}</Alert>}
        </Box> : working ? <VStack spacing={4} align="start"><Spinner color="#274167" /><Text>Verifying your secure email link…</Text></VStack> : <>
          <Alert status="error" borderRadius="md" mb={5}><AlertIcon />{error}</Alert>
          <Text fontSize="sm" color="gray.600" mb={4}>Reset links can only be used once and expire after 15 minutes.</Text>
          <Button as={RouterLink} to="/forgot-password" bg="#274167" color="white" _hover={{ bg: "#1F3B5A" }}>Request a new link</Button>
          <Link as={RouterLink} to="/" display="block" mt={5}>Back to login</Link>
        </>}
      </Box>
    </AuthLayout>
  );
}
