
import { useEffect, useState } from "react";
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
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import nav_logo from "../assets/nav_logo.png";
import AuthQRCode from "../components/Auth/AuthQRCode";
import AuthLayout from "../components/Auth/AuthLayout";
import {
  startEnrollmentThunk,
  verifyEnrollmentThunk,
} from "../slices/authSlice";

export default function Enrollment({ onVerify }) {
  const [code, setCode] = useState("");
  const [showManualKey, setShowManualKey] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    otpauthUri,
    manualKey,
    enrollmentLoading,
    enrollmentError,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(startEnrollmentThunk());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) return;

    try {
      const result = await dispatch(
        verifyEnrollmentThunk(code)
      ).unwrap();

      if (result.next_step === "recovery_codes") {
        navigate("/recovery-codes", {
          state: {
            recoveryCodes: result.recovery_codes,
          },
        });
      }
    } catch {
      // Redux stores the verification error.
    }
  };

  const errorMessage =
    typeof enrollmentError === "string"
      ? enrollmentError
      : enrollmentError?.msg ||
      enrollmentError?.message ||
      "";

  return (

    <AuthLayout
      // contentMaxW="none"
      // contentPx={{ base: 4, sm: 6, lg: 8 }}
      // contentPy={{ base: 6, md: 3 }}
    >

      {/* RIGHT ENROLLMENT PANEL */}
      
        
          {/* HEADER */}
          <Text
            color="#7050D8"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.13em"
            mb={2}
          >
            STEP 2 · CONNECT YOUR PHONE
          </Text>

          <Heading
            color="#111827"
            fontSize={{ base: "2xl", md: "2xl", lg: "3xl" }}
            letterSpacing="-0.035em"
            lineHeight="1.2"
          >
            Set up your authenticator
          </Heading>

          <Text
            mt={2}
            color="#64748B"
            fontSize="sm"
            lineHeight="1.6"
          >
            Open your authenticator app on your phone and scan
            this QR code.
          </Text>

          {/* REAL QR CODE */}
          <Flex justify="center" mt={4}>
            <Flex
              align="center"
              justify="center"
              boxSize="216px"
              p={2}
              bg="white"
              border="1px solid"
              borderColor="#E0E4EE"
              borderRadius="xl"
            >
              {otpauthUri ? (
                <AuthQRCode otpauthUri={otpauthUri} />
              ) : (
                <VStack spacing={2}>
                  <Icon
                    as={Smartphone}
                    boxSize={8}
                    color="gray.400"
                  />
                  <Text
                    color="gray.500"
                    fontSize="sm"
                    textAlign="center"
                  >
                    {enrollmentLoading
                      ? "Preparing QR code..."
                      : "QR code unavailable"}
                  </Text>
                </VStack>
              )}
            </Flex>
          </Flex>

          <Text
            textAlign="center"
            mt={2}
            color="#64748B"
            fontSize="xs"
          >
            Scan using your authenticator app.
          </Text>

          {/* COLLAPSIBLE MANUAL SETUP */}
          {manualKey && (
            <Box mt={3}>
              <Button
                variant="link"
                color="#7050D8"
                fontWeight="500"
                fontSize="sm"
                height="auto"
                whiteSpace="normal"
                onClick={() =>
                  setShowManualKey((previous) => !previous)
                }
                leftIcon={
                  <Icon
                    as={
                      showManualKey
                        ? ChevronDown
                        : ChevronRight
                    }
                    boxSize={4}
                  />
                }
              >
                Can't scan? Use a setup key
              </Button>

              {showManualKey && (
                <Box
                  mt={2}
                  p={3}
                  bg="#F8FAFC"
                  border="1px solid"
                  borderColor="#D9DFEB"
                  borderRadius="lg"
                >
                  <Flex align="center" gap={2} mb={1}>
                    <Icon
                      as={KeyRound}
                      color="#7050D8"
                      boxSize={4}
                    />
                    <Text fontSize="sm" fontWeight="600">
                      Enter setup key manually
                    </Text>
                  </Flex>

                  <Text color="#64748B" fontSize="xs" mb={2}>
                    Enter this key into your authenticator app.
                  </Text>

                  <Text
                    fontFamily="mono"
                    fontSize="sm"
                    fontWeight="600"
                    wordBreak="break-all"
                    userSelect="all"
                  >
                    {manualKey}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          <Divider my={3} borderColor="#E2E8F0" />

          {/* VERIFICATION FORM */}
          <Box as="form" onSubmit={handleSubmit}>
            <VStack align="stretch" spacing={3}>
              <FormControl isRequired>
                <FormLabel
                  fontWeight="600"
                  fontSize="sm"
                  color="#111827"
                  mb={2}
                >
                  6-digit verification code
                </FormLabel>

                <Input
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="0 0 0 0 0 0"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  textAlign="center"
                  letterSpacing="0.3em"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="600"
                  height="64px"
                  borderColor="#D5DCEC"
                  borderRadius="lg"
                  color="#334155"
                  _placeholder={{
                    color: "#8793A7",
                    opacity: 1,
                  }}
                  _focus={{
                    borderColor: "#7654E8",
                    boxShadow: "0 0 0 1px #7654E8",
                  }}
                  isDisabled={!otpauthUri || enrollmentLoading}
                />
              </FormControl>

              {errorMessage && (
                <Alert status="error" borderRadius="md" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">{errorMessage}</Text>
                </Alert>
              )}

              <Button
                type="submit"
                width="100%"
                height="52px"
                bg="#7351E5"
                color="white"
                fontWeight="700"
                fontSize="sm"
                borderRadius="lg"
                _hover={{ bg: "#1A365D" }}
                _active={{ bg: "#1A365D" }}
                isLoading={enrollmentLoading}
                loadingText="Verifying..."
                isDisabled={
                  !otpauthUri ||
                  code.length !== 6 ||
                  enrollmentLoading
                }
              >
                Verify and continue
              </Button>
            </VStack>
          </Box>

          <Divider my={3} borderColor="#E2E8F0" />

          <Text
            color="#64748B"
            fontSize="xs"
            lineHeight="1.6"
          >
            Saving the account on your phone is only the first
            step. Enter its code here to complete pairing.
          </Text>
        
      
    </AuthLayout>

  );
}
