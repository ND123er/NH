import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import AuthLayout from "../components/Auth/AuthLayout";
import { requestPasswordResetThunk } from "../slices/authSlice";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function ForgotPassword() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function requestReset(event) {
    event.preventDefault();
    if (!EMAIL.test(email) || sending) return;
    setSending(true);
    setError("");
    try {
      await dispatch(requestPasswordResetThunk(email.trim())).unwrap();
      setSent(true);
    } catch (err) {
      setError(
        err?.msg ||
          err?.message ||
          (typeof err === "string" ? err : "Unable to send recovery email."),
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <AuthLayout>
      <Box
        w="100%"
        maxW="480px"
        h="100%"
        display="flex"
        justifyContent="center"
        flexDirection="column"
      >
        <Text
          color="#111827"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.12em"
          textTransform="uppercase"
          mb={3}
        >
          Account recovery
        </Text>
        <Heading color="#18203C" fontSize={{ base: "2xl", md: "3xl" }} mb={3}>
          Forgot your password?
        </Heading>
        {location.state?.recoveryLinkRequired && (
          <Alert status="info" borderRadius="md" mb={5}>
            <AlertIcon />
            Your session was replaced by an emailed recovery link. Open the
            newest email to continue.
          </Alert>
        )}
        {sent ? (
          <VStack align="stretch" spacing={5}>
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              If this address is eligible, an email with a secure link has been
              sent.
            </Alert>
            <Text color="gray.600" fontSize="sm">
              Check your inbox and spam folder. Open the link on this website to
              continue. Password-reset links expire after 15 minutes. You can
              request another link if necessary.
            </Text>
            <Button variant="outline" onClick={() => setSent(false)}>
              Resend or use another email
            </Button>
            <Button
              as={RouterLink}
              to="/"
              bg="#274167"
              color="white"
              _hover={{ bg: "#1F3B5A" }}
            >
              Back to login
            </Button>
          </VStack>
        ) : (
          <Box as="form" onSubmit={requestReset}>
            <Text color="gray.600" fontSize="sm" mb={6}>
              Enter your registered email address. We'll send a password-reset
              link; no email OTP is needed.
            </Text>
            <FormControl
              isRequired
              isInvalid={Boolean(email && !EMAIL.test(email))}
              mb={5}
            >
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                minH="52px"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !EMAIL.test(email) && (
                <Text fontSize="xs" color="red.600" mt={1}>
                  Enter a valid email address.
                </Text>
              )}
            </FormControl>
            {error && (
              <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              w="full"
              minH="48px"
              bg="#274167"
              color="white"
              _hover={{ bg: "#1F3B5A" }}
              isLoading={sending}
              isDisabled={!EMAIL.test(email) || sending}
            >
              Send reset link
            </Button>
            <Link
              as={RouterLink}
              to="/"
              display="block"
              textAlign="center"
              fontSize="sm"
              fontWeight="500"
              textDecoration="underline"
              mt={5}
              color="#1A365D"
            >
              Return to login
            </Link>
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
}
