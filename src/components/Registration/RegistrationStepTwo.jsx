import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Progress,
  IconButton,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Image,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import National_Flag from "../../assets/National_Flag.png";

export default function RegistrationStepTwo({
  data,
  onBack,
  onRegister,
  loading,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      phone: data?.phone,
      email: data?.email,
      password: data.password,
      confirmPassword: "",
    },
  });

  const navigate = useNavigate();

  // State for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirm = () => setShowConfirm((prev) => !prev);

  // Capitalization helper
  const capitalize = (str = "") => {
    const s = String(str).trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const onSubmit = (formData) => {
    const normalized = {
      ...formData,
      firstName: capitalize(formData.firstName),
      middleName: capitalize(formData.middleName),
      lastName: capitalize(formData.lastName),
    };
    onRegister(normalized);
  };

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontWeight: "400",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const rules = {
    length: (password || "").length >= 12,
    // maxBytes: new TextEncoder().encode(password || "").length <= 72,
    maxBytes: !!password && new TextEncoder().encode(password).length <= 72,
    upper: /[A-Z]/.test(password || ""),
    lower: /[a-z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
    special: /[^a-zA-Z0-9]/.test(password || ""),
  };

  // const passwordStrength = useMemo(() => {
  //   let score = 0;
  //   if (password?.length >= 8) score++;
  //   if (/[a-z]/.test(password)) score++;
  //   if (/[A-Z]/.test(password)) score++;
  //   if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  //   let label = "Weak";
  //   let color = "red";
  //   if (score >= 4) {
  //     label = "Strong";
  //     color = "green";
  //   } else if (score === 3) {
  //     label = "Medium";
  //     color = "yellow";
  //   }

  //   return { score, label, color, pct: (score / 4) * 100 };
  // }, [password]);

  const passwordStrength = useMemo(() => {
    const score = [
      rules.length,
      rules.upper,
      rules.lower,
      rules.number,
      rules.special,
    ].filter(Boolean).length;

    let label = "Weak";
    let color = "red";

    if (!password) {
      label = "Weak";
    } else if (!rules.maxBytes) {
      label = "Invalid";
    } else if (score === 5) {
      label = "Strong";
      color = "green";
    } else if (score >= 3) {
      label = "Medium";
      color = "yellow";
    }

    return {
      score,
      label,
      color,
      pct: (score / 5) * 100,
    };
  }, [password]);

  return (
    <Box px={12} pt={6} m={4}>
      <IconButton
        aria-label="Back"
        icon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        size="md"
        borderRadius="full"
        bg="#274167"
        color="white"
        boxShadow="sm"
        border="1px solid #E2E8F0"
        mb={4}
        _hover={{ bg: "#274167", color: "white" }}
      />

      <Text
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        fontSize="24px"
        mb={1}
      >
        Let's Get Started
      </Text>
      <Text
        color="#757575"
        fontFamily="'Poppins', sans-serif"
        fontSize="14px"
        mb={6}
      >
        A Few details and you'll be ready to go.
      </Text>

      <Text
        color="#000"
        fontFamily="'Poppins', sans-serif"
        fontSize="16px"
        mb={6}
        fontWeight={500}
      >
        Enter Details
      </Text>

      {/* Header */}
      <Box
        mb={4}
        pr={6}
        pl={6}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 10px, transparent 5px 22px) 1",
        }}
      ></Box>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl mb={4} isRequired isInvalid={!!errors.firstName}>
          <FormLabel>First name</FormLabel>

          <Input
            placeholder="Enter First name"
            {...register("firstName", {
              required: "First name is required",
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: "Only letters are allowed",
              },
            })}
            onChange={(e) => {
              // allow only letters and spaces while typing
              const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              setValue("firstName", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onBlur={(e) => {
              setValue("firstName", capitalize(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            {...inputStyle}
          />

          {errors.firstName && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.firstName.message}
            </Text>
          )}
        </FormControl>

        <FormControl mb={4} isInvalid={!!errors.middleName}>
          <FormLabel>Middle name</FormLabel>

          <Input
            placeholder="Enter Middle name"
            {...register("middleName", {
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: "Only letters are allowed",
              },
            })}
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              setValue("middleName", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onBlur={(e) => {
              if (!e.target.value) return;

              setValue("middleName", capitalize(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            {...inputStyle}
          />

          {errors.middleName && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.middleName.message}
            </Text>
          )}
        </FormControl>

        <FormControl mb={4} isRequired isInvalid={!!errors.lastName}>
          <FormLabel>Last name</FormLabel>

          <Input
            placeholder="Enter Last name"
            {...register("lastName", {
              required: "Last name is required",
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: "Only letters are allowed",
              },
            })}
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              setValue("lastName", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            onBlur={(e) => {
              setValue("lastName", capitalize(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            {...inputStyle}
          />

          {errors.lastName && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.lastName.message}
            </Text>
          )}
        </FormControl>

        <FormControl mb={6} isRequired>
          <FormLabel>Phone</FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              height="100%"
              display="flex"
              alignItems="center"
              px={4}
              ml={4}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Image
                  src={National_Flag}
                  alt="India Flag"
                  // boxSize="22px"
                />
                <Text fontSize="14px" fontWeight="500" color="gray.700">
                  +91
                </Text>
              </Box>
            </InputLeftElement>

            <Input
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              pl="90px" // IMPORTANT: Add padding so text does not overlap the prefix
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Only numeric digits are allowed",
                },
                validate: {
                  lengthCheck: (v) =>
                    v.length === 10 || "Phone number must be exactly 10 digits",
                },
              })}
              {...inputStyle}
            />
          </InputGroup>
          {errors.phone && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.phone.message}
            </Text>
          )}
        </FormControl>

        {/* EMAIL */}
        <FormControl mb={4} isRequired>
          <FormLabel>Work email</FormLabel>
          {/* <Input
            type="email"
            placeholder="Enter your work email"
            {...register("email", {
              required: "Work Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            // onChange={(e) => {
            //   e.target.value = e.target.value.toLowerCase();
            // }}
            onChange={(e) => {
              const lower = e.target.value.toLowerCase();
              setValue("email", lower, { shouldValidate: true });
            }}
            {...inputStyle}
          /> */}
          <Input
            type="email"
            placeholder="Enter your work email"
            {...register("email", {
              required: "Work Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            onChange={(e) => {
              const lower = e.target.value.toLowerCase();
              setValue("email", lower, { shouldValidate: true });
            }}
            {...inputStyle}
          />
          {errors.email && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.email.message}
            </Text>
          )}
        </FormControl>

        {/* PASSWORD WITH SHOW/HIDE EYE */}
        <FormControl mb={4} isRequired>
          <FormLabel>Password</FormLabel>

          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              // {...register("password", {
              //   required: "Password is required",
              //   validate: {
              //     minLength: (v) => v.length >= 8 || "At least 8 characters",
              //     hasLower: (v) =>
              //       /[a-z]/.test(v) || "At least one lowercase letter",
              //     hasUpper: (v) =>
              //       /[A-Z]/.test(v) || "At least one uppercase letter",
              //     hasSpecial: (v) =>
              //       /[!@#$%^&*(),.?\":{}|<>]/.test(v) ||
              //       "At least one special character",
              //   },
              // })}
              {...register("password", {
                required: "Password is required",
                validate: {
                  minLength: (v) => v.length >= 12 || "At least 12 characters",

                  // maxBytes: (v) =>
                  //   new TextEncoder().encode(v).length <= 72 ||
                  //   "At most 72 UTF-8 bytes",
                  // maxBytes:
                  //   !!password &&
                  //   new TextEncoder().encode(password).length <= 72,
                  maxBytes: (v) =>
                    new TextEncoder().encode(v || "").length <= 72 ||
                    "At most 72 characters",

                  hasUpper: (v) =>
                    /[A-Z]/.test(v) || "One uppercase letter (A-Z)",

                  hasLower: (v) =>
                    /[a-z]/.test(v) || "One lowercase letter (a-z)",

                  hasNumber: (v) =>
                    /[0-9]/.test(v) || "One numeric digit (0-9)",

                  hasSpecial: (v) =>
                    /[^a-zA-Z0-9]/.test(v) || "One special character (!@#$%)",
                },
              })}
              {...inputStyle}
            />

            <InputRightElement
              width="3rem"
              cursor="pointer"
              onClick={togglePassword}
              mt={2}
            >
              {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </InputRightElement>
          </InputGroup>

          {/* PASSWORD STRENGTH */}
          <Box mt={2}>
            <Progress
              value={passwordStrength.pct}
              size="xs"
              borderRadius="md"
              colorScheme={
                passwordStrength.color === "green"
                  ? "green"
                  : passwordStrength.color === "yellow"
                    ? "yellow"
                    : "red"
              }
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
              {
                label: "One special character (!@#$%)",
                valid: rules.special,
              },
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
                {password?.length > 0 && item.valid ? "✓" : "○"} {item.label}
              </Text>
            ))}
          </Box>

          {errors.password && (
            <Box mt={1}>
              {
                errors.password.types &&
                  Object.values(errors.password.types).map((msg, idx) => (
                    <Text key={idx} color="red.500" fontSize="12px">
                      {msg}
                    </Text>
                  ))
                // : (
                //   <Text color="red.500" fontSize="12px">
                //     {errors.password.message}
                //   </Text>
                // )
              }
            </Box>
          )}
        </FormControl>

        {/* CONFIRM PASSWORD WITH EYE */}
        <FormControl mb={4} isRequired>
          <FormLabel>Re-enter password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Re-enter Password is required",
                validate: (v) => v === password || "Passwords do not match",
              })}
              {...inputStyle}
            />

            <InputRightElement
              width="3rem"
              cursor="pointer"
              onClick={toggleConfirm}
              mt={2}
            >
              {showConfirm ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </InputRightElement>
          </InputGroup>

          {/* {errors.confirmPassword && (
            <Text color="red.500" fontSize="12px" mt={1}>
              {errors.confirmPassword.message}
            </Text>
          )} */}
          {confirmPassword?.length > 0 && (
            <Text
              mt={2}
              fontSize="xs"
              color={confirmPassword === password ? "green.600" : "red.600"}
            >
              {confirmPassword === password
                ? "✓ Passwords match"
                : "○ Passwords do not match"}
            </Text>
          )}
        </FormControl>

        <Box display="flex" justifyContent="flex-end">
          <Button
            colorScheme="blue"
            bg="#274167"
            type="submit"
            rightIcon={<span>➜</span>}
            // isDisabled={
            //   !watch("firstName") ||
            //   !watch("lastName") ||
            //   !watch("email") ||
            //   !watch("password") ||
            //   !watch("confirmPassword") ||
            //   !!errors.password ||
            //   !!errors.confirmPassword ||
            //   loading
            // }
            isDisabled={
              !watch("firstName") ||
              !watch("lastName") ||
              !watch("email") ||
              !watch("password") ||
              !watch("confirmPassword") ||
              !Object.values(rules).every(Boolean) ||
              confirmPassword !== password ||
              !!errors.password ||
              !!errors.confirmPassword ||
              loading
            }
          >
            Create account
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
