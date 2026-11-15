import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Progress,
} from "@chakra-ui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import AuthLayout from "../components/Auth/AuthLayout";
import { submitPasswordThunk } from "../slices/authSlice";
import { markCompletedAuthPage } from "../utils/authBrowserHistory";

const nextRoute = {
  enrollment: "/enrollment",
  mfa: "/mfa",
  recovery_codes: "/recovery-codes",
  full: "/dashboard",
  password_setup: "/password",
  password_reset: "/password",
};

export default function PasswordSetup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nextStep, loading } = useSelector((state) => state.auth);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  // const length = password.length >= 12;
  const bytes = new TextEncoder().encode(password).length;
  // const maxBytes = bytes <= 72;
  const maxBytes = bytes > 0 && bytes <= 72;
  // const valid = length && maxBytes && password === confirm && confirm.length > 0;
  // const strength = Math.round((Number(length) + Number(maxBytes) + Number(/[a-z]/.test(password)) + Number(/[A-Z]/.test(password)) + Number(/[^a-zA-Z0-9]/.test(password))) / 5 * 100);

  const length = password.length >= 12;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^a-zA-Z0-9]/.test(password);

  // const valid =
  //   length &&
  //   uppercase &&
  //   lowercase &&
  //   number &&
  //   special &&
  //   password === confirm &&
  //   confirm.length > 0;

  const passwordValid =
    length && maxBytes && uppercase && lowercase && number && special;

  const passwordsMatch = confirm.length > 0 && password === confirm;

  const valid = passwordValid && passwordsMatch;

  const strengthScore =
    Number(length) +
    Number(uppercase) +
    Number(lowercase) +
    Number(number) +
    Number(special);

  const strength = (strengthScore / 5) * 100;

  // const strengthLabel =
  //   !password ? "" :
  //     strengthScore <= 2 ? "Weak" :
  //       strengthScore <= 4 ? "Medium" :
  //         "Strong";

  // const strengthColor =
  //   strengthLabel === "Weak" ? "red" :
  //     strengthLabel === "Medium" ? "orange" :
  //       "green";

  const strengthLabel = !password
    ? ""
    : !maxBytes
      ? "Invalid"
      : strengthScore <= 2
        ? "Weak"
        : strengthScore <= 4 || !length
          ? "Medium"
          : "Strong";

  const strengthColor =
    strengthLabel === "Weak" || strengthLabel === "Invalid"
      ? "red"
      : strengthLabel === "Medium"
        ? "orange"
        : "green";

  async function submit(event) {
    event.preventDefault();
    if (!valid || loading) return;
    setError("");
    try {
      // The restricted password_setup/password_reset token authorizes this request.
      // The thunk replaces the token before navigating to the next stage.
      markCompletedAuthPage("/password", nextStep);
      const result = await dispatch(
        submitPasswordThunk({ new_password: password }),
      ).unwrap();
      setPassword("");
      setConfirm("");
      if (result.next_step === "recovery_link") {
        navigate("/forgot-password", {
          replace: true,
          state: { recoveryLinkRequired: true },
        });
        return;
      }
      const destination = nextRoute[result.next_step];
      if (!destination || destination === "/password") {
        setError(
          `Unexpected authentication stage: ${result.next_step || "missing"}`,
        );
        return;
      }
      navigate(destination, { replace: false });
    } catch (err) {
      setError(
        err?.msg ||
          err?.message ||
          "Unable to update password. Please try again.",
      );
    }
  }

  return (
    <AuthLayout>
      <Box w="100%" maxW="480px">
        <Text
          color="#7358BA"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.12em"
          textTransform="uppercase"
          mb={3}
        >
          Account security
        </Text>
        <Heading color="#18203C" fontSize={{ base: "2xl", md: "3xl" }} mb={3}>
          {nextStep === "password_reset"
            ? "Reset your password"
            : "Create your password"}
        </Heading>

        <Text color="#69728B" fontSize="sm" mb={7} lineHeight="1.8">
          {nextStep === "password_reset"
            ? "Choose a new password to regain access to your account."
            : "You signed in with a temporary password. Create a permanent password before setting up your authenticator."}
        </Text>
        <Box as="form" onSubmit={submit}>
          <VStack align="stretch" spacing={5}>
            <FormControl isRequired>
              <FormLabel>New password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                  minH="52px"
                />
                <InputRightElement h="52px">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>

              {/* <Progress mt={3} size="xs" borderRadius="md" value={password ? strength : 0} colorScheme={strength === 100 ? "green" : "orange"} /> */}
              <Progress
                mt={3}
                size="xs"
                borderRadius="md"
                value={password ? strength : 0}
                colorScheme={
                  !maxBytes ? "red" : strength === 100 ? "green" : "orange"
                }
              />
              {password.length > 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  fontWeight="semibold"
                  color={`${strengthColor}.600`}
                >
                  Password: {strengthLabel}
                </Text>
              )}
              {/* <Text
                mt={2}
                fontSize="xs"
                color={length ? "green.600" : "gray.600"}
              >
                At least 12 characters
              </Text>
              <Text fontSize="xs" color={maxBytes ? "green.600" : "red.600"}>
                At most 72 UTF-8 bytes
              </Text> */}
              <VStack align="stretch" spacing={1} mt={3}>
                {[
                  { label: "At least 12 characters", valid: length },
                  { label: "At most 72 characters", valid: maxBytes },
                  { label: "One uppercase letter (A-Z)", valid: uppercase },
                  { label: "One lowercase letter (a-z)", valid: lowercase },
                  { label: "One numeric digit (0-9)", valid: number },
                  { label: "One special character (!@#$%)", valid: special },
                ].map((item) => (
                  <Text
                    key={item.label}
                    fontSize="xs"
                    color={
                      !password
                        ? "gray.500"
                        : item.valid
                          ? "green.600"
                          : "red.600"
                    }
                  >
                    {/* {item.valid ? "✓" : "○"} {item.label} */}
                    {password.length > 0 && item.valid ? "✓" : "○"} {item.label}
                  </Text>
                ))}
              </VStack>
            </FormControl>
            <FormControl
              isRequired
              // isInvalid={Boolean(confirm && confirm !== password)}
              isInvalid={confirm.length > 0 && !passwordsMatch}
            >
              <FormLabel>Confirm new password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  minH="52px"
                />
                <InputRightElement h="52px">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={
                      showConfirm ? "Hide confirmation" : "Show confirmation"
                    }
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <LuEyeOff /> : <LuEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {/* {confirm && confirm !== password && (
                <Text color="red.600" fontSize="xs" mt={1}>
                  Passwords do not match
                </Text>
              )} */}
              {confirm.length > 0 && (
                <Text
                  mt={2}
                  fontSize="xs"
                  color={passwordsMatch ? "green.600" : "red.600"}
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "○ Passwords do not match"}
                </Text>
              )}
            </FormControl>
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              bg="#274167"
              color="white"
              _hover={{ bg: "#1F3B5A" }}
              isLoading={loading}
              isDisabled={!valid || loading}
              minH="48px"
            >
              {nextStep === "password_reset"
                ? "Reset Password"
                : "Create password"}
            </Button>
          </VStack>
        </Box>
      </Box>
    </AuthLayout>
  );
}
