
import { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Divider,
  Icon,
  Image,
} from "@chakra-ui/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyMfaThunk, logout } from "../slices/authSlice";
import nav_logo from "../assets/nav_logo.png";
import AuthLayout from "../components/Auth/AuthLayout";

export default function Mfa() {
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.auth
  );


  const handleSwitchAccount = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) return;

    setSubmitError("");

    try {
      const result = await dispatch(
        verifyMfaThunk(code)
      ).unwrap();

      if (result.next_step === "full") {
        navigate("/dashboard", { replace: true });
      } else if (result.next_step === "recovery_codes") {
        navigate("/recovery-codes", {
          state: {
            recoveryCodes: result.recovery_codes,
          },
        });
      } else {
        setSubmitError(
          `Unexpected authentication stage: ${result.next_step || "unknown"
          }`
        );
      }
    } catch (err) {
      setSubmitError(
        typeof err === "string"
          ? err
          : err?.msg ||
          err?.message ||
          "Verification failed. Please try a fresh code."
      );
    }
  };

  const errorMessage =
    submitError ||
    (typeof error === "string"
      ? error
      : error?.msg || error?.message || "");

  return (
    <AuthLayout
    >
      <Flex justify="flex-start" mb={4}>
        {/* <Button
          variant="ghost"
          leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
          color="#475569"
          fontSize="sm"
          fontWeight="600"
          onClick={handleSwitchAccount}
          _hover={{ bg: "#F1F5F9" }}
          _active={{ bg: "#E2E8F0" }}
        >
          Back to login
        </Button> */}
      </Flex>

      {/* <Text
        color="#7358BA"
        fontSize="xs"
        fontWeight="750"
        letterSpacing="0.14em"
        textTransform="uppercase"
        mb={3}
      >
        Second verification step
      </Text> */}

      <Heading
        color="#18203C"
        fontSize={{ base: "2xl", md: "3xl" }}
        letterSpacing="-0.035em"
        lineHeight="1.25"
      >
        Enter authenticator code
      </Heading>

      <Text
        mt={3}
        color="#69728B"
        fontSize="sm"
        lineHeight="1.8"
      >
        Unlock HRMSnap Authenticator and enter the current
        code for your work account.
      </Text>

      <Box as="form" onSubmit={handleSubmit} mt={7}>
        <VStack align="stretch" spacing={4}>
          <FormControl isRequired>
            <FormLabel
              color="#18203C"
              fontSize="sm"
              fontWeight="650"
            >
              6-digit verification code
            </FormLabel>

            <Input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                );
                setSubmitError("");
              }}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              textAlign="center"
              letterSpacing="0.3em"
              fontSize="2xl"
              fontWeight="650"
              height="64px"
              color="#18203C"
              borderColor="#DADDE7"
              borderRadius="lg"
              _placeholder={{
                color: "#A0A6B8",
                opacity: 1,
              }}
              _focus={{
                borderColor: "#1A365D",
                boxShadow: "0 0 0 1px #1A365D",
              }}
            />
          </FormControl>

          {errorMessage && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {errorMessage}
              </Text>
            </Alert>
          )}

          <Button
            type="submit"
            width="100%"
            height="50px"
            bg="#1A365D"
            color="white"
            fontSize="sm"
            fontWeight="650"
            borderRadius="lg"
            _hover={{ bg: "#1A365D" }}
            _active={{ bg: "#1A365D" }}
            isLoading={loading}
            loadingText="Verifying..."
            isDisabled={
              code.length !== 6 || loading
            }
          >
            Verify and sign in
          </Button>
        </VStack>
      </Box>

      <Box textAlign="center" mt={5}>
        <Button
          variant="link"
          color="#1A365D"
          fontSize="sm"
          fontWeight="500"
          textDecoration="underline"
          onClick={() => navigate("/recovery-options")}
        >
          Can't access your authenticator?
        </Button>
        <Button
          variant="outline"
          width="100%"
          mt={4}
          onClick={handleSwitchAccount}
          isDisabled={loading}
        >
          Cancel and sign in with another account
        </Button>
      </Box>

      <Divider my={5} borderColor="#E5E8F0" />

      <Text
        color="#69728B"
        fontSize="sm"
        lineHeight="1.8"
      >
        Codes change every 30 seconds. If you just used a
        code, wait for the next one.
      </Text>

    </AuthLayout>

  );
}
