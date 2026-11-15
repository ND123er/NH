import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Alert,
  AlertIcon,
  Stack,
  Select,
  Checkbox,
  Divider,
  Link,
  Flex,
  SimpleGrid,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import {
  reauthenticate,
  beginReplacement,
  cancelReplacement,
  resetEmployeeMfa,
  updateAdminPermissions,
} from "../api/auth";
import {
  verifyReplacementThunk,
  submitPasswordThunk,
  signOutThunk,
} from "../slices/authSlice";
import { clearOrganizationSetup } from "../slices/organizationSetupSlice";

const nextRoutes = {
  mfa: "/mfa",
  enrollment: "/enrollment",
  recovery_codes: "/recovery-codes",
  password_setup: "/password",
  password_reset: "/password",
  full: "/dashboard",
};
const field = (label, value, set, type = "text") => (
  <FormControl>
    <FormLabel fontSize="12px" fontWeight="600" color="#344054" mb={2}>
      {label}
    </FormLabel>
    <Input
      aria-label={label}
      placeholder={`Enter ${label.toLowerCase()}`}
      type={type}
      value={value}
      onChange={(e) => set(e.target.value)}
      h="44px"
      borderRadius="8px"
      borderColor="#D9DEE7"
      bg="white"
      fontSize="13px"
      _placeholder={{ color: "#98A2B3" }}
      _hover={{ borderColor: "#AAB5C5" }}
      _focus={{ borderColor: "#274167", boxShadow: "0 0 0 1px #274167" }}
    />
  </FormControl>
);

const panelProps = {
  bg: "white",
  border: "1px solid #E7EAF0",
  borderRadius: "14px",
  p: { base: 5, md: 7 },
  boxShadow: "0 2px 10px rgba(16, 24, 40, 0.035)",
};

const primaryButtonProps = {
  bg: "#274167",
  color: "white",
  borderRadius: "8px",
  h: "42px",
  px: 6,
  fontSize: "13px",
  fontWeight: "600",
  _hover: { bg: "#1B3151" },
  _active: { bg: "#152942" },
};

const outlineButtonProps = {
  variant: "outline",
  borderColor: "#D9DEE7",
  color: "#344054",
  borderRadius: "8px",
  h: "42px",
  px: 6,
  fontSize: "13px",
  fontWeight: "600",
  _hover: { bg: "#F7F9FC" },
};

const sectionHeading = (title, description) => (
  <Box mb={5}>
    <Heading fontSize="17px" fontWeight="600" color="#202B3B" mb={1}>
      {title}
    </Heading>
    {description && <Text fontSize="12px" color="#788596" lineHeight="1.7">{description}</Text>}
  </Box>
);

export default function AccountSecurity() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.user?.role);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [qr, setQr] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [method, setMethod] = useState("in_person");
  const [evidence, setEvidence] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [targetRole, setTargetRole] = useState("admin");
  const [mfaReset, setMfaReset] = useState(false);
  const [manageAdmins, setManageAdmins] = useState(false);
  const [recent, setRecent] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const run = async (fn) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(
        e?.response?.data?.msg || e?.msg || e?.message || "Request failed",
      );
    } finally {
      setBusy(false);
    }
  };
  const signOut = (all) =>
    run(async () => {
      await dispatch(signOutThunk(all));
      dispatch(clearOrganizationSetup());
      navigate("/", { replace: true });
    });
  const changePassword = () =>
    run(async () => {
      if (
        new TextEncoder().encode(newPassword).length > 72 ||
        newPassword.length < 12
      )
        throw new Error(
          "Password must be at least 12 characters and at most 72 characters.",
        );
      const data = await dispatch(
        submitPasswordThunk({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      ).unwrap();
      setOldPassword("");
      setNewPassword("");
      setRecent(false);
      if (data.next_step === "recovery_link") {
        setMessage(
          data.msg || "Follow the replacement link sent to your email.",
        );
        navigate("/", { replace: true });
        return;
      }
      navigate(nextRoutes[data.next_step] || "/", { replace: true });
    });
  const reauth = () =>
    run(async () => {
      await reauthenticate(password, code);
      setPassword("");
      setCode("");
      setRecent(true);
      setVerifiedAt(Date.now());
      setMessage(
        "Identity verified for five minutes. You can now perform a sensitive action.",
      );
    });
  const replace = () =>
    run(async () => {
      const data = await beginReplacement();
      console.log('dshgd', data);
      if (!data.otpauth_uri) throw new Error("Missing pairing details");
      setQr(data);
      setMessage(
        "Scan the QR using your new authenticator. The old phone remains active until verification succeeds.",
      );
    });
  const verify = () =>
    run(async () => {
      if (!/^\d{6}$/.test(newCode)) throw new Error("Enter a six-digit code");
      const data = await dispatch(verifyReplacementThunk(newCode)).unwrap();
      if (data.next_step !== "recovery_codes")
        throw new Error("Unexpected stage");
      setQr(null);
      setRecent(false);
      navigate("/recovery-codes", {
        state: { recoveryCodes: data.recovery_codes },
        replace: true,
      });
    });
  const cancel = () =>
    run(async () => {
      await cancelReplacement();
      setQr(null);
      setMessage(
        "Replacement cancelled. Your existing authenticator remains active.",
      );
    });
  const adminReset = () =>
    run(async () => {
      if (!recent || Date.now() - verifiedAt > 300000)
        throw new Error(
          "Reauthenticate again; verification expires after five minutes",
        );
      if (!verified || !contactVerified)
        throw new Error(
          "Complete independent identity and contact verification first",
        );
      const data = await resetEmployeeMfa({
        employee_id: employeeId,
        identity_method: method,
        identity_evidence: evidence,
        identity_verified: true,
        contact_verified: true,
        reason,
        reference,
      });
      setRecent(false);
      setMessage(data.msg);
    });
  const permissions = () =>
    run(async () => {
      if (!recent || Date.now() - verifiedAt > 300000)
        throw new Error(
          "Reauthenticate again; verification expires after five minutes",
        );
      const data = await updateAdminPermissions({
        employee_id: employeeId,
        role: targetRole,
        permissions:
          targetRole === "employee"
            ? []
            : [
                ...(mfaReset ? ["mfa_reset"] : []),
                ...(manageAdmins ? ["manage_admins"] : []),
              ],
      });
      setRecent(false);
      setMessage(data.msg);
    });
  return (
    <Box bg="#F7F8FA" minH="100%" py={{ base: 5, md: 8 }} px={{ base: 4, md: 8 }} fontFamily="Poppins, sans-serif">
      <Box maxW="1080px" mx="auto">
        <Flex align={{ base: "start", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={3} mb={7}>
          <Box>
            <Heading fontSize={{ base: "22px", md: "26px" }} fontWeight="600" color="#202B3B">Account Security</Heading>
            <Text fontSize="13px" color="#788596" mt={2}>
              Manage your password, authenticator, and account sessions securely.
            </Text>
          </Box>
          <Link href="/dashboard" fontSize="13px" fontWeight="600" color="#274167" _hover={{ textDecoration: "underline" }}>
            Return to dashboard
          </Link>
        </Flex>

        {error && (
          <Alert status="error" mb={5} borderRadius="10px" fontSize="13px">
            <AlertIcon />{error}
          </Alert>
        )}
        {message && (
          <Alert status="success" mb={5} borderRadius="10px" fontSize="13px">
            <AlertIcon />{message}
          </Alert>
        )}

        <Stack spacing={5}>
          <Box {...panelProps}>
            {sectionHeading("Verify your identity again", "Sensitive operations require your current password and a fresh code from your existing authenticator.")}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={5}>
              {field("Current password", password, setPassword, "password")}
              {field("Current authenticator code", code, setCode)}
            </SimpleGrid>
            <Button {...primaryButtonProps} isLoading={busy} onClick={reauth} isDisabled={!password || !/^\d{6}$/.test(code)}>
              Reauthenticate
            </Button>
          </Box>

          <Box {...panelProps}>
            {sectionHeading("Change password", "Update your password to keep your HRMSnap account protected.")}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={5}>
              {field("Old password", oldPassword, setOldPassword, "password")}
              {field("New password (12–72 UTF-8 bytes)", newPassword, setNewPassword, "password")}
            </SimpleGrid>
            <Button {...primaryButtonProps} isLoading={busy} onClick={changePassword} isDisabled={!oldPassword || newPassword.length < 12}>
              Change password
            </Button>
          </Box>

          <Box {...panelProps}>
            {sectionHeading("Replace authenticator", "First complete reauthentication. Your old authenticator stays active until the new one is verified.")}
            {!qr ? (
              <Button {...primaryButtonProps} isDisabled={!recent || busy || Date.now() - verifiedAt > 300000} onClick={replace}>
                Start authenticator replacement
              </Button>
            ) : (
              <Box>
                <Box display="inline-block" border="1px solid #E7EAF0" borderRadius="12px" p={4} bg="white" mb={4}>
                  <QRCodeSVG value={qr.otpauth_uri} size={200} />
                </Box>
                <Text fontSize="12px" color="#667085" mb={4} overflowWrap="anywhere">Manual key: {qr.manual_key}</Text>
                <Box maxW="400px" mb={4}>
                  {field("Code from new authenticator", newCode, setNewCode)}
                </Box>
                <HStack spacing={3} flexWrap="wrap">
                  <Button {...primaryButtonProps} isLoading={busy} onClick={verify}>Verify new phone</Button>
                  <Button {...outlineButtonProps} onClick={cancel}>Cancel replacement</Button>
                </HStack>
              </Box>
            )}
          </Box>

          {(role === "admin" || role === "owner") && (
            <Box {...panelProps}>
              {sectionHeading("Administrator recovery and permissions", "Backend permissions control access. Admin status alone does not grant MFA reset or permission-management rights. Confirm identity independently before approving an MFA reset.")}
              <Box maxW="520px" mb={6}>
                {field("Target employee ID", employeeId, setEmployeeId)}
              </Box>
              <Box border="1px solid #EEF0F4" borderRadius="12px" p={{ base: 4, md: 5 }} mb={5}>
                <Heading fontSize="14px" fontWeight="600" color="#202B3B" mb={4}>Identity-verified MFA reset</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="600" color="#344054">Identity verification method</FormLabel>
                    <Select aria-label="Identity verification method" value={method} onChange={(e) => setMethod(e.target.value)} h="44px" borderRadius="8px" borderColor="#D9DEE7" fontSize="13px">
                      <option value="in_person">In person</option>
                      <option value="verified_video_call">Verified video call</option>
                      <option value="established_hr_identity_process">Established HR identity process</option>
                    </Select>
                  </FormControl>
                  {field("Completed independent identity checks (no identity documents)", evidence, setEvidence)}
                  {field("Reason", reason, setReason)}
                  {field("Reference", reference, setReference)}
                </SimpleGrid>
                <Stack spacing={3} mb={5}>
                  <Checkbox colorScheme="blue" isChecked={verified} onChange={(e) => setVerified(e.target.checked)}>
                    <Text fontSize="12px" color="#344054">I completed the independent identity verification</Text>
                  </Checkbox>
                  <Checkbox colorScheme="blue" isChecked={contactVerified} onChange={(e) => setContactVerified(e.target.checked)}>
                    <Text fontSize="12px" color="#344054">Verified contact using established records</Text>
                  </Checkbox>
                </Stack>
                <Button {...primaryButtonProps} onClick={adminReset} isDisabled={!recent || busy || Date.now() - verifiedAt > 300000 || !employeeId || !evidence || !reason || !reference || !verified || !contactVerified}>
                  Approve employee MFA reset
                </Button>
              </Box>

              <Box border="1px solid #EEF0F4" borderRadius="12px" p={{ base: 4, md: 5 }}>
                <Heading fontSize="14px" fontWeight="600" color="#202B3B" mb={2}>Update administrator permissions</Heading>
                <Text fontSize="12px" color="#788596" mb={4} lineHeight="1.7">
                  Existing permissions cannot be prefilled because the backend does not provide a permission read endpoint. This operation replaces the entire permission list.
                </Text>
                <FormControl maxW="360px" mb={4}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#344054">Target role</FormLabel>
                  <Select aria-label="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} h="44px" borderRadius="8px" borderColor="#D9DEE7" fontSize="13px">
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </Select>
                </FormControl>
                <Stack spacing={3} mb={5}>
                  <Checkbox colorScheme="blue" isDisabled={targetRole !== "admin"} isChecked={mfaReset} onChange={(e) => setMfaReset(e.target.checked)}>
                    <Text fontSize="12px" color="#344054">MFA reset permission</Text>
                  </Checkbox>
                  <Checkbox colorScheme="blue" isDisabled={targetRole !== "admin"} isChecked={manageAdmins} onChange={(e) => setManageAdmins(e.target.checked)}>
                    <Text fontSize="12px" color="#344054">Manage admins permission</Text>
                  </Checkbox>
                </Stack>
                <Button {...primaryButtonProps} isDisabled={!recent || busy || Date.now() - verifiedAt > 300000 || !employeeId} onClick={permissions}>
                  Replace target role and permissions
                </Button>
              </Box>
            </Box>
          )}

          <Box {...panelProps}>
            {sectionHeading("Sessions", "Sign out from this device or revoke your sessions across all devices.")}
            <Flex gap={3} direction={{ base: "column", sm: "row" }} align="start">
              <Button {...outlineButtonProps} onClick={() => signOut(false)} isLoading={busy}>
                Sign out of this session
              </Button>
              <Button variant="outline" colorScheme="red" borderRadius="8px" h="42px" px={6} fontSize="13px" fontWeight="600" onClick={() => signOut(true)} isLoading={busy}>
                Sign out everywhere
              </Button>
            </Flex>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
