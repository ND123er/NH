import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  IconButton,
  Image,
  FormErrorMessage,
  Progress,
  useToast,
} from "@chakra-ui/react";
import useAuthReadOnly from "../../utils/useAuthReadOnly";
import { markCompletedAuthPage } from "../../utils/authBrowserHistory";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { useState, useMemo } from "react";
import { ViewIcon } from "@chakra-ui/icons";
import hide from "../../assets/hide.png";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk } from "../../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";
import Cookies from "js-cookie";

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export default function LoginForm({ onSubmitSuccess } = {}) {
  const readOnly = useAuthReadOnly();
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // const { loading, error } = useSelector((state) => state.auth);
  const { loading, error, nextStep } = useSelector((state) => state.auth);
  const token = Cookies.get("auth_token");

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

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // react-hook-form config
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // watch input values
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  // helper checks for "field is valid" used for progress calculation
  const isEmailValid = useMemo(
    () => EMAIL_REGEX.test(emailValue),
    [emailValue],
  );
  const isPasswordValidForProgress = useMemo(
    () => passwordValue && passwordValue.length >= 8,
    [passwordValue],
  );

  // compute progress percent (2 inputs: email + password)
  const progressPct = useMemo(() => {
    const total = 2;
    const completed =
      (isEmailValid ? 1 : 0) + (isPasswordValidForProgress ? 1 : 0);
    return Math.round((completed / total) * 100);
  }, [isEmailValid, isPasswordValidForProgress]);

  // const navigateAfterLogin = (destination) => {
  //   navigate(location.pathname, {
  //     replace: true,
  //     state: {
  //       completedAuthPage: location.pathname,
  //       completedAuthStage: "login",
  //     },

  //   });

  //   navigate(destination, {
  //     replace: false,
  //   });
  // };

  const navigateAfterLogin = (destination) => {
    navigate(destination, { replace: false });
  };

  const onSubmit = async (data) => {
    try {
      const loginData = { email: data.email, password: data.password };
      markCompletedAuthPage("/", "login");
      const result = await dispatch(loginUserThunk(loginData));
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Credentials verified",
          description: "Continue with the required security step.",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        reset();

        // const token =
        //   result.payload?.token ||
        //   result.payload?.data?.token ||
        //   result.payload;

        const decodeJwtPayload = (t) => {
          try {
            if (!t || typeof t !== "string") return null;
            const base64Url = t.split(".")[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
            const jsonPayload = decodeURIComponent(
              atob(padded)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
            );
            return JSON.parse(jsonPayload);
          } catch (e) {
            return null;
          }
        };

        // if (token && typeof token === "string") {
        //   try {
        //     localStorage.setItem("token", token);
        //   } catch (e) {
        //     console.error("Failed to store token in localStorage:", e);
        //   }

        //   const decoded = decodeJwtPayload(token);
        //   const isOrgPresent =
        //     decoded?.is_org_present ?? decoded?.isOrgPresent ?? false;
        //   const isAdmin = decoded?.is_admin ?? decoded?.isAdmin ?? false;

        //   if (isOrgPresent) {
        //     navigate("/dashboard", { replace: true });
        //   } else {
        //     if (isAdmin) {
        //       import("../../pages/Dashboard");
        //       import("../../layouts/AppLayout");
        //       import("../../pages/OrganizationRegister");
        //       navigate("/orgRegister", { replace: true });
        //     } else {
        //       navigate("/dashboard", { replace: true });
        //     }
        //   }
        // } else {
        //   navigate("/orgRegister");
        // }
        const nextStep = result.payload?.next_step;

        switch (nextStep) {
          case "enrollment":
            navigateAfterLogin("/enrollment");
            // navigate("/enrollment", { replace: true });
            break;

          case "mfa":
            navigateAfterLogin("/mfa");
            // navigate("/mfa", { replace: true });
            break;

          case "password_setup":
          case "password_reset":
            navigateAfterLogin("/password");
            break;
          // navigate("/password", { replace: true });
          // break;

          case "organization_setup":
            navigateAfterLogin("/orgRegister");
            // navigate("/orgRegister", { replace: true });
            break;

          case "recovery_codes":
            // navigate("/recovery-codes", { replace: true });
            navigateAfterLogin("/recovery-codes");
            break;

          case "full":
            // navigateAfterLogin("/dashboard");
             navigate("/dashboard", { replace: true });
            // navigate("/dashboard", { replace: true });
            break;

          default:
            toast({
              title: "Unexpected login response",
              description: `Unrecognized next step: ${nextStep || "missing"}`,
              status: "error",
              duration: 3500,
              isClosable: true,
            });
        }

        if (onSubmitSuccess) onSubmitSuccess(result.payload);
      } else {
        toast({
          title: "Login failed",
          description:
            result.payload?.msg ||
            result.payload?.message ||
            "Invalid credentials.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Login failed",
        description:
          err?.response?.data?.code === "TEMPORARY_PASSWORD_EXPIRED"
            ? "Your temporary password expired. Use Forgot Password to request a reset email."
            : "Something went wrong. Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      flexDirection="column"
      justify="center"
      align="flex-start"
      w="100%"
      fontFamily={"Poppins"}
    >
      {/* Previously there was a progress bar here but we are currently not rendering it.. */}
      <Box
        bg="white"
        mt="25px"
        px={{ base: 6, md: 75 }}
        w="100%"
        borderRadius="8px"
        boxSizing="border-box"
      >
        {/* Use a real <form> so Enter submits */}
        <form
          // onSubmit={handleSubmit(onSubmit)}
          onSubmit={
            readOnly
              ? (event) => event.preventDefault()
              : handleSubmit(onSubmit)
          }
        >
          {readOnly && (
            <Text mb={3} color="gray.600">
              Login completed — credentials hidden.
            </Text>
          )}
          <fieldset
            disabled={readOnly}
            style={{
              border: 0,
              padding: 0,
              margin: 0,
              minWidth: 0,
            }}
          >
            <Stack spacing={4}>
              <Box>
                <Heading
                  // fontSize={["20px", "22px", "24px"]}
                  fontSize="30px"
                  mb={1}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight={700}
                  color="#000000"
                  lineHeight="40px"
                >
                  Welcome!
                </Heading>
                <Text
                  color="#757575"
                  fontSize="sm"
                  fontFamily="'Poppins', sans-serif"
                >
                  Let's discover the HR solutions in a Snap.
                </Text>
              </Box>

              {/* Email */}
              <FormControl id="email" isInvalid={!!errors.email} mt={0}>
                <FormLabel
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="500"
                  fontSize="14px"
                  color="#000000"
                >
                  Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  borderRadius={4}
                  fontSize="14px"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_REGEX,
                      message: "Enter a valid email address",
                    },
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                  {...inputStyle}
                />
                <FormErrorMessage
                  fontSize="12px"
                  fontFamily={"poppins"}
                  fontWeight={"500"}
                >
                  {errors.email?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Password */}
              <FormControl id="password" isInvalid={!!errors.password} mt={3}>
                <FormLabel
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="500"
                  fontSize="14px"
                  color="#000000"
                >
                  Password
                </FormLabel>

                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    borderRadius={4}
                    fontSize="14px"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    aria-invalid={errors.password ? "true" : "false"}
                    {...inputStyle}
                  />
                  <InputRightElement h="full">
                    <IconButton
                      type="button" // prevent this icon from submitting the form
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <LuEyeOff /> : <LuEye />}
                      onClick={() => setShowPassword((s) => !s)}
                      variant="ghost"
                      size="sm"
                      _hover={{ bg: "transparent" }}
                      _active={{ bg: "transparent" }}
                    />
                  </InputRightElement>
                </InputGroup>

                {/* Password hint / errors */}
                {errors.password?.types ? (
                  <Box mt={2}>
                    {Object.values(errors.password.types).map((msg, idx) => (
                      <Text
                        key={idx}
                        color="red.500"
                        fontSize="12px"
                        fontFamily={"poppins"}
                        fontWeight={"500"}
                      >
                        {msg}
                      </Text>
                    ))}
                  </Box>
                ) : (
                  <FormErrorMessage
                    fontSize={"12px"}
                    fontFamily={"poppins"}
                    fontWeight={"500"}
                  >
                    {errors.password?.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              {/* Remember + Forgot */}
              <Flex justify="space-between" align="center">
                <Checkbox
                  colorScheme="blue"
                  {...register("remember")}
                  sx={{
                    ".chakra-checkbox__control": {
                      w: "20px",
                      h: "20px",
                    },
                  }}
                >
                  <Text
                    fontSize="13px"
                    fontFamily="'Poppins', sans-serif"
                    fontWeight="500"
                    color="#274167"
                  >
                    Remember me
                  </Text>
                </Checkbox>

                <Link
                  as={RouterLink}
                  to="/forgot-password"
                  color="#274167"
                  fontSize="13px"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="500"
                  textDecoration="underline"
                >
                  Forgot Password?
                </Link>
              </Flex>

              {/* Button */}
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  bg="#274167"
                  color="white"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="500"
                  fontSize="14px"
                  _active={{ bg: "#1f3143" }}
                  _hover={{ bg: "#1f3143" }}
                  rightIcon={<span>→</span>}
                  isLoading={loading}
                  isDisabled={!isValid || loading}
                  aria-disabled={!isValid || loading}
                  mt={6}
                  mb={-4}
                >
                  Log In
                </Button>
              </Box>
            </Stack>
          </fieldset>
        </form>
      </Box>
    </Flex>
  );
}
