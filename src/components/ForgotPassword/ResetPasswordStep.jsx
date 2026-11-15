// import {
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Text,
//   InputGroup,
//   InputRightElement,
//   Progress,
//   useToast,
// } from "@chakra-ui/react";
// import { useMemo, useState } from "react";
// import { LuEye, LuEyeOff } from "react-icons/lu";
// import api from "../../api/axios";
// import { getEmpCode } from "../../utils/token";

// export default function ResetPasswordStep({ onSubmit, employeeId }) {
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const toast = useToast();

//   const employeeID = employeeId || getEmpCode();

//   const inputStyle = {
//     fontFamily: "Poppins",
//     fontSize: "15px",
//     _placeholder: {
//       color: "gray.400",
//       fontFamily: "Poppins",
//       fontSize: "14px",
//     },
//     h: "55px",
//     borderWidth: "1.5px",
//     borderColor: "#D0D5DD",
//     borderRadius: "8px",
//   };

//   /* ---------------- PASSWORD RULES ---------------- */
//   const rules = {
//     length: password.length >= 8,
//     lower: /[a-z]/.test(password),
//     upper: /[A-Z]/.test(password),
//     special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
//   };

//   /* ---------------- PASSWORD STRENGTH ---------------- */
//   const passwordStrength = useMemo(() => {
//     const passed = Object.values(rules).filter(Boolean).length;

//     if (!password) return { pct: 0, label: "Weak", color: "red" };
//     if (passed <= 2) return { pct: 35, label: "Weak", color: "red" };
//     if (passed === 3) return { pct: 65, label: "Medium", color: "yellow" };

//     return { pct: 100, label: "Strong", color: "green" };
//   }, [password]);

//   const isPasswordValid = Object.values(rules).every(Boolean);
//   const isConfirmValid = confirm && confirm === password;

//   const handleReset = async () => {
//     if (!isPasswordValid || !isConfirmValid) return;

//     try {
//       setLoading(true);
//       const payload = { employee_id: employeeID, new_password: password };
//       const res = await api.post("/auth/reset_password", payload);

//       toast({
//         title: res?.data?.msg || "Password updated",
//         status: "success",
//         duration: 2500,
//       });

//       if (onSubmit) onSubmit();
//     } catch (err) {
//       console.error("Reset password failed", err);
//       toast({
//         title: "Password update failed",
//         description: err?.response?.data?.msg || err?.message || "",
//         status: "error",
//         duration: 3500,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box maxW="720px">
//       <Text fontSize="22px" fontWeight="700" mb={4}>
//         Reset Password
//       </Text>

//       {/* PASSWORD */}
//       <FormControl mb={4} isRequired>
//         <FormLabel fontSize="12px">Enter new password</FormLabel>

//         <InputGroup>
//           <Input
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter new password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             {...inputStyle}
//           />

//           <InputRightElement
//             width="3rem"
//             cursor="pointer"
//             onClick={() => setShowPassword((s) => !s)}
//             mt={2}
//           >
//             {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
//           </InputRightElement>
//         </InputGroup>

//         {/* STRENGTH BAR */}
//         <Box mt={2}>
//           <Progress
//             value={passwordStrength.pct}
//             size="xs"
//             borderRadius="md"
//             colorScheme={
//               passwordStrength.color === "green"
//                 ? "green"
//                 : passwordStrength.color === "yellow"
//                 ? "yellow"
//                 : "red"
//             }
//           />
//           <Text fontSize="12px" mt={1} color="gray.600">
//             Strength: <b>{passwordStrength.label}</b>
//           </Text>
//         </Box>

//         {/* PASSWORD RULES */}
//         {password && (
//           <Box as="ul" pl={4} mt={2}>
//             <Text
//               as="li"
//               fontSize="12px"
//               color={rules.length ? "green.500" : "red.500"}
//             >
//               At least 8 characters
//             </Text>
//             <Text
//               as="li"
//               fontSize="12px"
//               color={rules.lower ? "green.500" : "red.500"}
//             >
//               At least one lowercase letter
//             </Text>
//             <Text
//               as="li"
//               fontSize="12px"
//               color={rules.upper ? "green.500" : "red.500"}
//             >
//               At least one uppercase letter
//             </Text>
//             <Text
//               as="li"
//               fontSize="12px"
//               color={rules.special ? "green.500" : "red.500"}
//             >
//               At least one special character
//             </Text>
//           </Box>
//         )}
//       </FormControl>

//       {/* CONFIRM PASSWORD */}
//       <FormControl mb={6} isRequired>
//         <FormLabel fontSize="12px">Re-enter new password</FormLabel>

//         <InputGroup>
//           <Input
//             type={showConfirm ? "text" : "password"}
//             placeholder="Re-enter new password"
//             value={confirm}
//             onChange={(e) => setConfirm(e.target.value)}
//             {...inputStyle}
//           />

//           <InputRightElement
//             width="3rem"
//             cursor="pointer"
//             onClick={() => setShowConfirm((s) => !s)}
//             mt={2}
//           >
//             {showConfirm ? <LuEyeOff size={20} /> : <LuEye size={20} />}
//           </InputRightElement>
//         </InputGroup>

//         {confirm && !isConfirmValid && (
//           <Text fontSize="12px" color="red.500" mt={1}>
//             Passwords do not match
//           </Text>
//         )}
//       </FormControl>

//       {/* SUBMIT */}
//       <Button
//         float="right"
//         bg="#274167"
//         color="white"
//         _hover={{ bg: "#1F3B5A" }}
//         isDisabled={!isPasswordValid || !isConfirmValid || loading}
//         isLoading={loading}
//         onClick={handleReset}
//       >
//         Update
//       </Button>
//     </Box>
//   );
// }

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  InputGroup,
  InputRightElement,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import api from "../../api/axios";
import { getSessionThunk } from "../../slices/authSlice";

export default function ResetPasswordStep({ onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const dispatch = useDispatch();

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

  // const rules = {
  //   length: password.length >= 12,
  //   lower: /[a-z]/.test(password),
  //   upper: /[A-Z]/.test(password),
  //   special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  //   maxBytes: new TextEncoder().encode(password).length <= 72,
  // };

  const rules = {
    length: password.length >= 12,
    // maxBytes: new TextEncoder().encode(password).length <= 72,
    maxBytes:
  password.length > 0 && new TextEncoder().encode(password).length <= 72,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  // const passwordStrength = useMemo(() => {
  //   const passed = Object.values(rules).filter(Boolean).length;

  //   if (!password) return { pct: 0, label: "Weak", color: "red" };
  //   if (passed <= 2) return { pct: 35, label: "Weak", color: "red" };
  //   if (passed <= 4) {
  //     return { pct: 65, label: "Medium", color: "yellow" };
  //   }

  //   return { pct: 100, label: "Strong", color: "green" };
  // }, [password]);

  const passwordStrength = useMemo(() => {
    const score = [
      rules.length,
      rules.upper,
      rules.lower,
      rules.number,
      rules.special,
    ].filter(Boolean).length;

    if (!password) {
      return { pct: 0, label: "Weak", color: "red" };
    }

    if (!rules.maxBytes) {
      return { pct: (score / 5) * 100, label: "Invalid", color: "red" };
    }

    if (score <= 2) {
      return { pct: (score / 5) * 100, label: "Weak", color: "red" };
    }

    if (score <= 4) {
      return { pct: (score / 5) * 100, label: "Medium", color: "yellow" };
    }

    return { pct: 100, label: "Strong", color: "green" };
  }, [password]);

  const isPasswordValid = Object.values(rules).every(Boolean);
  const isConfirmValid = Boolean(confirm) && confirm === password;

  const handleReset = async () => {
    if (!isPasswordValid || !isConfirmValid || loading) return;

    try {
      setLoading(true);

      // API contract: POST /password with { new_password }.
      const response = await api.post("/password", {
        new_password: password,
      });

      const data = response.data;

      // Replace the current token whenever the API issues a new one.
      if (data?.token) {
        const options = {
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        };

        if (data.expires_at) {
          const expires = new Date(data.expires_at);
          if (!Number.isNaN(expires.getTime())) {
            options.expires = expires;
          }
        }

        Cookies.set("auth_token", data.token, options);

        if (data.user) {
          Cookies.set("auth_user", JSON.stringify(data.user), options);
        }
      }

      // This response explicitly invalidates the current session.
      if (data?.next_step === "recovery_link") {
        Cookies.remove("auth_token");
        Cookies.remove("auth_user");

        toast({
          title:
            data.msg || "Check your email for the replacement recovery link.",
          status: "info",
          duration: 3500,
          isClosable: true,
        });

        return;
      }

      // The password endpoint should return a session transition.
      if (!data?.next_step) {
        throw new Error("The server did not return next_step.");
      }

      // Restore the latest server-side session in Redux.
      // GET /session reports the current stage; it does not issue a token.
      const session = await dispatch(getSessionThunk()).unwrap();

      if (onSubmit) {
        onSubmit(session);
      }
    } catch (err) {
      toast({
        title: "Password update failed",
        description:
          err?.response?.data?.msg || err?.message || "Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="720px">
      <Text fontSize="22px" fontWeight="700" mb={4}>
        Set New Password
      </Text>

      <FormControl mb={4} isRequired>
        <FormLabel fontSize="12px">Enter new password</FormLabel>

        <InputGroup>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            {...inputStyle}
          />

          <InputRightElement
            width="3rem"
            cursor="pointer"
            onClick={() => setShowPassword((value) => !value)}
            mt={2}
          >
            {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </InputRightElement>
        </InputGroup>

        <Box mt={2}>
          <Progress
            value={passwordStrength.pct}
            size="xs"
            borderRadius="md"
            colorScheme={passwordStrength.color}
          />
          <Text fontSize="12px" mt={1} color="gray.600">
            Strength: <b>{passwordStrength.label}</b>
          </Text>
        </Box>

       
          <Box mt={3}>
            {[
              { label: "At least 12 characters", valid: rules.length },
              { label: "At most 72 characters", valid: rules.maxBytes },
              { label: "One uppercase letter (A-Z)", valid: rules.upper },
              { label: "One lowercase letter (a-z)", valid: rules.lower },
              { label: "One numeric digit (0-9)", valid: rules.number },
              { label: "One special character (!@#$%)", valid: rules.special },
            ].map((item) => (
              <Text
                key={item.label}
                fontSize="xs"
                mb={1}
                color={
                  !password ? "gray.500" : item.valid ? "green.600" : "red.600"
                }
              >
                {/* {item.valid ? "✓" : "○"} {item.label} */}
                {password.length > 0 && item.valid ? "✓" : "○"} {item.label}
               
              </Text>
            ))}
          </Box>
        
      </FormControl>

      <FormControl mb={6} isRequired>
        <FormLabel fontSize="12px">Confirm new password</FormLabel>

        <InputGroup>
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            {...inputStyle}
          />

          <InputRightElement
            width="3rem"
            cursor="pointer"
            onClick={() => setShowConfirm((value) => !value)}
            mt={2}
          >
            {showConfirm ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </InputRightElement>
        </InputGroup>

        {/* {confirm && !isConfirmValid && (
          <Text fontSize="12px" color="red.500" mt={1}>
            Passwords do not match
          </Text>
        )} */}
        {confirm.length > 0 && (
          <Text
            mt={2}
            fontSize="xs"
            color={isConfirmValid ? "green.600" : "red.600"}
          >
            {isConfirmValid ? "✓ Passwords match" : "○ Passwords do not match"}
          </Text>
        )}
      </FormControl>

      <Button
        float="right"
        bg="#274167"
        color="white"
        _hover={{ bg: "#1F3B5A" }}
        isDisabled={!isPasswordValid || !isConfirmValid || loading}
        isLoading={loading}
        onClick={handleReset}
      >
        Update Password
      </Button>
    </Box>
  );
}
