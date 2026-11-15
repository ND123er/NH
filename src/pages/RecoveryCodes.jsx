// import { useState } from "react";
// // import { useSelector } from "react-redux";
// import {
//   Box,
//   Heading,
//   Text,
//   VStack,
//   SimpleGrid,
//   Code,
//   Alert,
//   AlertIcon,
//   Checkbox,
//   Button,
// } from "@chakra-ui/react";

// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { acknowledgeRecoveryCodesThunk } from "../slices/authSlice";

// export default function RecoveryCodes() {
//   const recoveryCodes = useSelector((state) => state.auth.recoveryCodes);
//   const [saved, setSaved] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   //   const handleContinue = async () => {
//   //     if (!saved) return;

//   //     setLoading(true);
//   //     setError("");

//   //     try {
//   //       await dispatch(acknowledgeRecoveryCodesThunk()).unwrap();
//   //       navigate("/dashboard", { replace: true });
//   //     } catch (err) {
//   //       setError(
//   //         typeof err === "string"
//   //           ? err
//   //           : err?.message || "Could not confirm recovery codes.",
//   //       );
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   const handleContinue = async () => {
//     if (!saved) return;

//     setLoading(true);
//     setError("");

//     try {
//       const result = await dispatch(acknowledgeRecoveryCodesThunk()).unwrap();

//       if (result.next_step === "full") {
//         navigate("/dashboard", { replace: true });
//       } else {
//         setError(
//           `Unexpected authentication stage: ${result.next_step || "unknown"}`,
//         );
//       }
//     } catch (err) {
//       setError(
//         typeof err === "string"
//           ? err
//           : err?.msg || err?.message || "Could not confirm recovery codes.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <Box minH="100vh" p={6} bg="gray.50">
//       <VStack spacing={6} maxW="xl" mx="auto" pt={10}>
//         <Heading size="xl" textAlign="center">
//           Save Your Recovery Codes
//         </Heading>

//         <Text textAlign="center" color="gray.600">
//           Store these codes somewhere safe. You can use them if you lose access
//           to your authenticator app.
//         </Text>

//         <Alert status="warning" borderRadius="md">
//           <AlertIcon />
//           Each recovery code should be treated as sensitive information.
//         </Alert>

//         <SimpleGrid columns={2} spacing={3} w="100%">
//           {recoveryCodes.map((code, index) => (
//             <Code
//               key={`${index}-${code}`}
//               p={3}
//               textAlign="center"
//               fontSize="md"
//             >
//               {code}
//             </Code>
//           ))}
//         </SimpleGrid>

//         {recoveryCodes.length === 0 && (
//           <Text color="red.500">
//             No recovery codes found. Please complete enrollment again.
//           </Text>
//         )}
//         {recoveryCodes.length > 0 && (
//           <Checkbox
//             isChecked={saved}
//             onChange={(event) => setSaved(event.target.checked)}
//           >
//             I have saved my recovery codes in a safe place.
//           </Checkbox>
//         )}
//         {error && (
//           <Alert status="error" borderRadius="md">
//             <AlertIcon />
//             {error}
//           </Alert>
//         )}

//         <Button
//           colorScheme="blue"
//           width="100%"
//           isDisabled={!saved || recoveryCodes.length === 0 || loading}
//           isLoading={loading}
//           loadingText="Confirming..."
//           onClick={handleContinue}
//         >
//           I've saved my codes — Continue
//         </Button>
//       </VStack>
//     </Box>
//   );
// }



import { useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/Auth/AuthLayout";
import {
  acknowledgeRecoveryCodesThunk,
  reissueRecoveryCodesThunk,
} from "../slices/authSlice";

export default function RecoveryCodes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const storedCodes = useSelector(
    (state) => state.auth.recoveryCodes
  );

  const [replacementCodes, setReplacementCodes] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reissuing, setReissuing] = useState(false);
  const [error, setError] = useState("");

  const routeCodes = location.state?.recoveryCodes;

  const recoveryCodes =
    replacementCodes ??
    (Array.isArray(routeCodes) && routeCodes.length > 0
      ? routeCodes
      : Array.isArray(storedCodes)
        ? storedCodes
        : []);

  const getErrorMessage = (err, fallback) => {
    if (typeof err === "string") return err;
    return (
      err?.msg ||
      err?.message ||
      err?.error ||
      fallback
    );
  };

  const handleDownload = () => {
    if (recoveryCodes.length === 0) return;

    const content = [
      "HRMSnap Recovery Codes",
      "",
      "Store these codes somewhere safe, separate from your phone.",
      "Each code can only be used once.",
      "",
      ...recoveryCodes.map(
        (code, index) => `${index + 1}. ${code}`
      ),
      "",
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "HRMSnap-recovery-codes.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleContinue = async () => {
    if (!saved || recoveryCodes.length === 0 || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await dispatch(
        acknowledgeRecoveryCodesThunk()
      ).unwrap();

      if (result.next_step === "full") {
        navigate("/dashboard", { replace: true });
      } else {
        setError(
          `Unexpected authentication stage: ${result.next_step || "unknown"
          }`
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not confirm that your recovery codes were saved."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReissue = async () => {
    if (reissuing || loading) return;

    setReissuing(true);
    setError("");

    try {
      const result = await dispatch(
        reissueRecoveryCodesThunk()
      ).unwrap();

      if (
        result.next_step !== "recovery_codes" ||
        !Array.isArray(result.recovery_codes) ||
        result.recovery_codes.length === 0
      ) {
        setError(
          "The server did not return a valid new recovery-code set."
        );
        return;
      }

      setReplacementCodes(result.recovery_codes);
      setSaved(false);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not generate a new recovery-code set."
        )
      );
    } finally {
      setReissuing(false);
    }
  };

  return (
    <AuthLayout>
      <VStack align="stretch" spacing={3}>
        <Text
          color="#7358BA"
          fontSize="xs"
          fontWeight="750"
          letterSpacing="0.14em"
        >
          PROTECT YOUR ACCESS
        </Text>

        <Heading
          color="#18203C"
          fontSize={{ base: "2xl", md: "2xl" }}
          letterSpacing="-0.035em"
          lineHeight="1.25"
        >
          Save your recovery codes
        </Heading>

        <Text
          color="#69728B"
          fontSize="sm"
          lineHeight="1.7"
        >
          Save these somewhere safe, separate from your phone.
          Each code can only be used once.
        </Text>

        {recoveryCodes.length > 0 ? (
          <SimpleGrid columns={2} spacing={2} mt={1}>
            {recoveryCodes.map((code, index) => (
              // <Box
              //   key={`${index}-${code}`}
              //   bg="#F7F6FB"
              //   borderRadius="md"
              //   px={2}
              //   py={2.5}
              //   textAlign="center"
              //   fontFamily="mono"
              //   fontSize="sm"
              //   color="#18203C"
              //   overflowWrap="anywhere"
              // >
              
              <Box
                maxH="80vh"
                overflowY="auto"
                overflowX="hidden"
                pr={2}
                pb={3}
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#C4B5FD",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#F7F6FB",
                  },
                }}
              >
                {code}
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Recovery codes are not available in this view.
            Generate a new set to continue.
          </Alert>
        )}

        <Text
          color="#69728B"
          fontSize="xs"
          lineHeight="1.6"
          pt={1}
        >
          Live codes are shown once. Download or save them before
          continuing.
        </Text>

        <Button
          width="100%"
          height="46px"
          bg="#F4F2FA"
          color="#645478"
          fontSize="sm"
          fontWeight="650"
          borderRadius="lg"
          onClick={handleDownload}
          isDisabled={recoveryCodes.length === 0 || reissuing}
          _hover={{ bg: "#E9E4F7" }}
        >
          Download recovery codes
        </Button>

        <Checkbox
          isChecked={saved}
          onChange={(event) => setSaved(event.target.checked)}
          isDisabled={recoveryCodes.length === 0 || reissuing}
          colorScheme="purple"
          size="md"
          sx={{
            ".chakra-checkbox__control": {
              borderColor: "#A0A6B8",
              borderRadius: "3px",
            },
          }}
        >
          <Text color="#18203C" fontSize="sm">
            I have saved my recovery codes in a safe place.
          </Text>
        </Checkbox>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <Button
          width="100%"
          height="46px"
          bg="#1A365D"
          color="white"
          fontSize="sm"
          fontWeight="700"
          borderRadius="lg"
          onClick={handleContinue}
          isLoading={loading}
          loadingText="Confirming..."
          isDisabled={
            !saved ||
            recoveryCodes.length === 0 ||
            loading ||
            reissuing
          }
          _hover={{ bg: "#184079" }}
          _active={{ bg: "#184079" }}
        >
          Continue to dashboard
        </Button>

        <Text
          textAlign="center"
          color="#69728B"
          fontSize="sm"
          pt={1}
        >
          Lost the displayed codes?{" "}
          <Button
            variant="link"
            color="#1A365D"
            fontSize="sm"
            fontWeight="500"
            onClick={handleReissue}
            isLoading={reissuing}
            loadingText="Generating..."
            isDisabled={loading}
          >
            Generate a new set
          </Button>
        </Text>
      </VStack>
    </AuthLayout>
  );
}

