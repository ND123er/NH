import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  Flex,
  useToast,
  Progress,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { getEmpCode } from "../utils/token";

const constant_file = {
  collection: {
    organization: "organization",
  },
};

/** ---------- Helper: safe useFormContext ---------- */
import { useFormContext } from "react-hook-form";
function useFormContextSafe() {
  const ctx = useFormContext();
  if (!ctx) throw new Error("Used outside FormProvider");
  return ctx;
}

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

/** ---------- Step 1 - Organization ---------- */
function OrgStep() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContextSafe();
  const [isFocused, setIsFocused] = useState(false);
  const [showHelperAsError, setShowHelperAsError] = useState(false);

  const [cityFocused, setCityFocused] = useState(false);
  const [cityErrorHelper, setCityErrorHelper] = useState(false);

  const [stateFocused, setStateFocused] = useState(false);
  const [stateErrorHelper, setStateErrorHelper] = useState(false);

  const [countryFocused, setCountryFocused] = useState(false);
  const [countryErrorHelper, setCountryErrorHelper] = useState(false);

  const [postalFocused, setPostalFocused] = useState(false);
  const [postalErrorHelper, setPostalErrorHelper] = useState(false);

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [phoneErrorHelper, setphoneErrorHelper] = useState(false);

  // const [emailFocused, setEmailFocused] = useState(false);
  // const [emailErrorHelper, setEmailErrorHelper] = useState(true);

  const [emailFocused, setEmailFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [websiteFocused, setWebsiteFocused] = useState(false);
  const [websiteErrorHelper, setWebsiteErrorHelper] = useState(false);
  const [taxIdFocused, setTaxIdFocused] = useState(false);
  const [taxIdTouched, setTaxIdTouched] = useState(false);
  const [gstFocused, setGstFocused] = useState(false);
  const [gstTouched, setGstTouched] = useState(false);
  const [regFocused, setRegFocused] = useState(false);
  const [regTouched, setRegTouched] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const postalCode = watch("org.postal_code");
  const gstValue = watch("org.gst_number") || "";
  const regValue = watch("org.registration_number") || "";

  // 🔹 PINCODE LOOKUP (Organization)
  useEffect(() => {
    
    if (!postalCode || postalCode.length !== 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${postalCode}`,
        );
        const data = await res.json();

        if (
          !Array.isArray(data) ||
          data[0]?.Status !== "Success" ||
          !data[0]?.PostOffice?.length
        ) {
          return;
        }

        const postOffice =
          data[0].PostOffice.find((po) => po.DeliveryStatus === "Delivery") ||
          data[0].PostOffice[0];

        // ✅ Auto-fill organization address fields
        setValue("org.city", postOffice.Division || "");
        setValue("org.state", postOffice.State || "");
        setValue("org.country", postOffice.Country || "India");
      } catch (err) {
        console.error("Org pincode lookup failed", err);
      }
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [postalCode, setValue]);

  return (
    <div style={{ padding: "20px" }}>
      <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
        Enter organizational details
      </Text>
      {/* Header */}
      <Box
        mb={4}
        mt={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 8px, transparent 5px 22px) 1",
        }}
      ></Box>

      <FormControl
        mb={4}
        isInvalid={!!errors?.org?.organisation_name}
        isRequired
      >
        <FormLabel>Company name</FormLabel>

        <Input
          placeholder="Enter Company name"
          {...register("org.organisation_name", {
            required: "Company name is required",
            pattern: {
              value: /^[A-Za-z0-9 ]+$/,
              message: "Only letters, numbers, and spaces are allowed",
            },
            onChange: (e) => {
              const value = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
              e.target.value = value;

              // Helper text turns red if invalid
              setShowHelperAsError(
                value.length > 0 && !/^[A-Za-z0-9 ]+$/.test(value),
              );
            },
            onBlur: () => {
              setIsFocused(false);
              trigger("org.organisation_name");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setIsFocused(true);
            setShowHelperAsError(false);
          }}
        />

        {/* Helper Text */}
        {isFocused && !errors?.org?.organisation_name && (
          <FormHelperText
            fontFamily="poppins"
            color={showHelperAsError ? "red.500" : "#274167"}
          >
            Only letters, numbers, and spaces are allowed
          </FormHelperText>
        )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.organisation_name?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors?.org?.company_size} mb={4} isRequired>
        <FormLabel>Company Size</FormLabel>
        <Select
          placeholder="Select Company Size"
          color={isSelected ? "black" : "#000"}
          {...register("org.company_size", {
            required: "Company size is required",
          })}
          {...inputStyle}
          onChange={(e) => {
            setIsSelected(!!e.target.value);
          }}
          // {...register("org.company_size", {
          //   required: "Company size is required",
          // })}
          // {...inputStyle}
        >
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="200+">200+</option>
        </Select>

        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.company_size?.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.city}>
        <FormLabel>City</FormLabel>

        <Input
          placeholder="Enter City"
          {...register("org.city", {
            required: "City is required",
            pattern: {
              value: /^[A-Za-z ]+$/,
              message: "Only letters and spaces are allowed",
            },
            onChange: (e) => {
              const value = e.target.value.replace(/[^A-Za-z ]/g, "");
              e.target.value = value;
              setCityErrorHelper(
                value.length > 0 && !/^[A-Za-z ]+$/.test(value),
              );
            },
            onBlur: () => {
              setCityFocused(false);
              trigger("org.city");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setCityFocused(true);
            setCityErrorHelper(false);
          }}
        />

        {/* Helper Text */}
        {cityFocused && !errors?.org?.city && (
          <FormHelperText
            fontFamily="poppins"
            color={cityErrorHelper ? "red.500" : "#274167"}
          >
            Only letters and spaces are allowed
          </FormHelperText>
        )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.city?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.state}>
        <FormLabel>State</FormLabel>

        <Input
          placeholder="Enter State"
          {...register("org.state", {
            required: "State is required",
            pattern: {
              value: /^[A-Za-z0-9\s]+$/,
              message: "Special characters are not allowed",
            },
            onChange: (e) => {
              const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
              setValue("org.state", value, { shouldValidate: true });
              setStateErrorHelper(
                value.length > 0 && !/^[A-Za-z0-9\s]+$/.test(value),
              );
            },
            onBlur: () => {
              setStateFocused(false);
              trigger("org.state");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setStateFocused(true);
            setStateErrorHelper(false);
          }}
        />

        {/* Helper Text */}
        {stateFocused && !errors?.org?.state && (
          <FormHelperText
            fontFamily="poppins"
            color={stateErrorHelper ? "red.500" : "#274167"}
          >
            Only letters, numbers, and spaces are allowed
          </FormHelperText>
        )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.state?.message}
        </FormErrorMessage>
      </FormControl>

      {/* <FormControl mb={4} isRequired>
        <FormLabel>Country</FormLabel>
        <Input
          placeholder="Enter Country"
          {...register("org.country", {
            required: "Country is required",
            pattern: {
              value: /^[A-Za-z0-9\s]+$/,
              message: "Special characters are not allowed",
            },
            onChange: (e) => {
              const cleanedValue = e.target.value.replace(
                /[^A-Za-z0-9\s]/g,
                ""
              );
              setValue("org.country", cleanedValue, {
                shouldValidate: true,
              });
            },
          })}
          {...inputStyle}
        />
        {errors?.org?.country && (
          <Text fontSize="xs" color="red.500" fontFamily={"poppins"}>
            {errors.org.country.message}
          </Text>
        )}
      </FormControl> */}
      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.country}>
        <FormLabel>Country</FormLabel>
        <Input
          placeholder="Enter Country"
          {...register("org.country", {
            required: "Country is required",
            pattern: {
              value: /^[A-Za-z0-9\s]+$/,
              message: "Special characters are not allowed",
            },
            onChange: (e) => {
              const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
              setValue("org.country", value, { shouldValidate: true });
              setCountryErrorHelper(
                value.length > 0 && !/^[A-Za-z0-9\s]+$/.test(value),
              );
            },
            onBlur: () => {
              setCountryFocused(false);
              trigger("org.country");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setCountryFocused(true);
            setCountryErrorHelper(false);
          }}
        />

        {/* Helper Text */}
        {countryFocused && !errors?.org?.country && (
          <FormHelperText
            color={countryErrorHelper ? "red.500" : "#274167"}
            fontFamily="poppins"
          >
            Only letters, numbers, and spaces are allowed
          </FormHelperText>
        )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.country?.message}
        </FormErrorMessage>
      </FormControl>

      {/* <FormControl mb={4} isRequired>
        <FormLabel>Postal Code</FormLabel>
        <Input
          placeholder="Enter Postal Code"
          maxLength={6}
          {...register("org.postalCode", { required: true })}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          {...inputStyle}
        />
      </FormControl> */}
      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.postal_code}>
        <FormLabel>Postal Code</FormLabel>
        <Input
          placeholder="Enter Postal Code"
          maxLength={6}
          {...register("org.postal_code", {
            required: "Postal Code is required",
            pattern: {
              value: /^[0-9]{6}$/,
              message: "Enter a valid 6-digit Postal Code",
            },
            onChange: (e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setValue("org.postal_code", value, { shouldValidate: true });
              setPostalErrorHelper(value.length > 0 && value.length !== 6);
            },
            onBlur: () => {
              setPostalFocused(false);
              trigger("org.postal_code");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setPostalFocused(true);
            setPostalErrorHelper(false);
          }}
        />

        {/* Helper Text */}
        {postalFocused &&
          !errors?.org?.postal_code &&
          watch("org.postal_code").length < 6 && (
            <FormHelperText
              color={postalErrorHelper ? "red.500" : "#274167"}
              fontFamily="poppins"
            >
              Enter exactly 6 digits
            </FormHelperText>
          )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.postal_code?.message}
        </FormErrorMessage>
      </FormControl>

      {/* <FormControl mb={4} isRequired>
        <FormLabel>Phone number</FormLabel>
        <Input
          placeholder="Enter phone number"
          maxLength={10}
          {...register("org.phoneNumber", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Enter a valid 10-digit phone number",
            },
          })}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          {...inputStyle}
        />
        {errors?.org?.phoneNumber && (
          <Text color="red.500" fontSize="12px" fontFamily="poppins">
            {errors.org.phoneNumber.message}
          </Text>
        )}
      </FormControl> */}
      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.phone}>
        <FormLabel>Phone number</FormLabel>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            h="100%"
            w="108px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Flex align="center" h="100%" w="100%" justify="center" gap={4}>
              <Text
                color="#667085"
                fontFamily="'Poppins', sans-serif"
                fontSize="14px"
                lineHeight="1"
                fontWeight="400"
              >
                +91
              </Text>
              <Box h="34px" borderLeft="1.5px solid #98A2B3" />
            </Flex>
          </InputLeftElement>
          <Input
            placeholder="Enter phone number"
            maxLength={10}
            pl="108px"
            {...register("org.phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
              onChange: (e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setValue("org.phone", value, { shouldValidate: true });

                // Update helper state: hide helper when exactly 10 digits
                setphoneErrorHelper(value.length === 10 ? false : true);
              },
              onBlur: () => {
                setPhoneFocused(false);
                trigger("org.phone");
              },
            })}
            {...inputStyle}
            onFocus={() => {
              setPhoneFocused(true);
              setphoneErrorHelper(true); // show helper initially
            }}
          />
        </InputGroup>

        {/* Helper Text */}
        {phoneFocused && phoneErrorHelper && !errors?.org?.phone && (
          <FormHelperText fontFamily="poppins" color="#274167">
            Enter exactly 10 digits
          </FormHelperText>
        )}

        {/* Error Message */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.phone?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Company Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter email"
          {...register("org.email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9.@]+$/,
              message: "Only letters, numbers, @ and . are allowed",
            },
            onChange: (e) => {
              // allow only a-z A-Z 0-9 @ .
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9.@]/g, "");
            },
            validate: {
              validEmailFormat: (value) =>
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                  value,
                ) || "Enter a valid email address",
            },
          })}
          {...inputStyle}
        />
        {errors?.org?.email && (
          <Text color="red.500" fontSize="14px" fontFamily="poppins">
            {errors.org.email.message}
          </Text>
        )}
      </FormControl>

      {/* <FormControl mb={4} isRequired isInvalid={!!errors?.org?.email}>
        <FormLabel>Company Email</FormLabel>

        <Input
          type="email"
          placeholder="Enter email"
          {...register("org.email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9.@]+$/,
              message: "Only letters, numbers, @ and . are allowed",
            },
            validate: (value) =>
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ||
              "Enter a valid email address",
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9.@]/g, "");
            },
          })}
          {...inputStyle}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => {
            setEmailFocused(false);
            setEmailTouched(true);
            trigger("org.email");
          }}
        />

        {emailFocused && !errors?.org?.email && (
          <FormHelperText
            fontFamily="poppins"
            color={emailTouched && errors?.org?.email ? "red.500" : "#274167"}
          >
            Format: name@domain.com
          </FormHelperText>
        )}

        {emailTouched && errors?.org?.email && (
          <FormErrorMessage fontFamily="poppins">
            {errors?.org?.email?.message}
          </FormErrorMessage>
        )}

      </FormControl> */}

      {/* <FormControl mb={4}>
        <FormLabel>Website</FormLabel>
        <Input
          placeholder="Enter website url"
          {...register("org.website")}
          {...inputStyle}
        />
      </FormControl> */}

      <FormControl mb={4} isInvalid={!!errors?.org?.website}>
        <FormLabel>Website</FormLabel>
        <Input
          placeholder="Enter website url"
          {...register("org.website", {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/,
              message: "Enter a valid URL",
            },
            onChange: (e) => {
              const value = e.target.value;
              e.target.value = value;
              // Show helper in red if invalid format while typing
              setWebsiteErrorHelper(
                value.length > 0 &&
                  !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/.test(
                    value,
                  ),
              );
            },
            onBlur: () => {
              setWebsiteFocused(false);
              trigger("org.website");
            },
          })}
          {...inputStyle}
          onFocus={() => {
            setWebsiteFocused(true);
            setWebsiteErrorHelper(false);
          }}
        />

        {/* Helper Text */}
        {websiteFocused && !errors?.org?.website && (
          <FormHelperText
            fontFamily="poppins"
            color={websiteErrorHelper ? "red.500" : "#274167"}
          >
            Enter a valid website URL (e.g., https://example.com)
          </FormHelperText>
        )}

        {/* Error Message */}
        {errors?.org?.website && (
          <FormErrorMessage fontFamily="poppins">
            {errors.org.website.message}
          </FormErrorMessage>
        )}
      </FormControl>

      {/* <FormControl mb={4} isRequired>
        <FormLabel>Tax ID</FormLabel>
        <Input
          placeholder="Enter Tax ID"
          {...register("org.taxId")}
          {...inputStyle}
        />
      </FormControl> */}

      <FormControl mb={4} isRequired isInvalid={!!errors?.org?.tax_id}>
        <FormLabel>Tax ID</FormLabel>

        <Input
          placeholder="Enter Tax ID"
          {...register("org.tax_id", {
            required: "Tax ID is required",
          })}
          {...inputStyle}
        />

        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.tax_id?.message}
        </FormErrorMessage>
      </FormControl>

      {/* <FormControl mb={4} isRequired isInvalid={!!errors?.org?.taxId}>
  <FormLabel>Tax ID</FormLabel>
  <Input
    placeholder="Enter Tax ID"
    {...register("org.taxId", {
      required: "Tax ID is required",
    })}
    {...inputStyle}
    onFocus={() => setTaxIdFocused(true)}
    onBlur={() => {
      setTaxIdFocused(false);
      setTaxIdTouched(true); 
      trigger("org.taxId");   
    }}
  />

  {(!errors?.org?.taxId || taxIdFocused) && (
    <FormHelperText
      fontFamily="poppins"
      color={taxIdTouched && errors?.org?.taxId ? "red.500" : "#274167"}
    >
      Enter your Tax ID
    </FormHelperText>
  )}
  {taxIdTouched && errors?.org?.taxId && (
    <FormErrorMessage fontFamily="poppins">
      {errors?.org?.taxId?.message}
    </FormErrorMessage>
  )}
</FormControl> */}

      {/* <FormControl mb={4}>
        <FormLabel>GST number</FormLabel>
        <Input
          placeholder="Enter GST number"
          {...register("org.gstNumber")}
          {...inputStyle}
        />
      </FormControl> */}

      <FormControl mb={4} /*isRequired*/ isInvalid={!!errors?.org?.gst_number}>
        <FormLabel fontFamily="Poppins" fontSize="16px" letterSpacing="-0.3px">
          GST Number
        </FormLabel>

        <Input
          placeholder="Enter GST Number"
          maxLength={15}
          {...register("org.gst_number", {
            required: "GST number is required",
            pattern: {
              value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
              message: "Invalid GST number format",
            },
            onChange: (e) => {
              e.target.value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
            },
          })}
          {...inputStyle}
          onFocus={() => setGstFocused(true)}
          onBlur={() => {
            setGstFocused(false);
            setGstTouched(true);
            trigger("org.gst_number");
          }}
        />

        {/* Helper Text */}
        {/* {(!errors?.org?.gstNumber || gstFocused) && (
          <FormHelperText
            fontFamily="Poppins"
            color={gstTouched && errors?.org?.gstNumber ? "red.500" : "#274167"}
          >
            Format: 22AAAAA0000A1Z5
          </FormHelperText>
        )} */}
        {gstFocused &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
            gstValue,
          ) && (
            <FormHelperText
              fontFamily="Poppins"
              color={
                gstTouched && errors?.org?.gst_number ? "red.500" : "#274167"
              }
            >
              Format: 22AAAAA0000A1Z5
            </FormHelperText>
          )}

        {/* Error Message */}
        {/* {gstTouched && errors?.org?.gstNumber && ( */}
        {/* {gstTouched && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(watch("org.gstNumber") || "") && (
          <FormErrorMessage fontFamily="Poppins">
            {errors?.org?.gstNumber?.message}
          </FormErrorMessage>
        )} */}
        <FormErrorMessage fontFamily="Poppins">
          {errors?.org?.gst_number?.message}
        </FormErrorMessage>
      </FormControl>
      {/* 
      <FormControl
        mb={4}
        isRequired
        isInvalid={!!errors?.org?.registrationNumber}
      >
        <FormLabel>Registration number</FormLabel>

        <Input
          placeholder="Enter Registration Number"
          maxLength={20}
          {...register("org.registrationNumber", {
            required: "Registration number is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters required",
            },
            maxLength: {
              value: 20,
              message: "Maximum 20 characters allowed",
            },
            pattern: {
              value: /^[A-Za-z0-9-]+$/,
              message: "Only letters, numbers and '-' are allowed",
            },
            onChange: (e) => {
              // convert to uppercase & remove invalid characters
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, "");

              e.target.value = value;
            },
          })}
          {...inputStyle}
        />

        {errors?.org?.registrationNumber && (
          <Text fontSize="xs" color="red.500" mt={1} fontFamily="poppins">
            {errors.org.registrationNumber.message}
          </Text>
        )}
      </FormControl> */}
      <FormControl
        mb={4}
        isRequired
        isInvalid={!!errors?.org?.registration_number}
      >
        <FormLabel>Registration number</FormLabel>

        <Input
          placeholder="Enter Registration Number"
          maxLength={20}
          {...register("org.registration_number", {
            required: "Registration number is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters required",
            },
            maxLength: {
              value: 20,
              message: "Maximum 20 characters allowed",
            },
            pattern: {
              value: /^[A-Z0-9-]+$/,
              message: "Only letters, numbers and '-' are allowed",
            },
            onChange: (e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9-]/g, "");

              setValue("org.registration_number", value, {
                shouldValidate: true, // 🔥 revalidate on typing
              });
            },
          })}
          {...inputStyle}
          onFocus={() => setRegFocused(true)}
          onBlur={() => {
            setRegFocused(false);
            setRegTouched(true);
            trigger("org.registration_number");
          }}
        />

        {/* ✅ Helper Text (hide when valid) */}
        {regFocused && !/^[A-Z0-9-]{6,20}$/.test(regValue) && (
          <FormHelperText fontFamily="poppins" color="#274167">
            Format: ABC-123456 or AB123456
          </FormHelperText>
        )}

        {/* ❌ Error (hide automatically when corrected) */}
        {/* {regTouched &&
          !/^[A-Z0-9-]{6,20}$/.test(regValue) && (
            <FormErrorMessage fontFamily="poppins">
              {errors?.org?.registrationNumber?.message}
            </FormErrorMessage>
          )} */}
        <FormErrorMessage fontFamily="poppins">
          {errors?.org?.registration_number?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={4} isInvalid={!!errors?.org?.establish_date} isRequired>
        <FormLabel>Established date</FormLabel>

        <Input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("org.establish_date", {
            required: "Established date is required",
            validate: (value) => {
              const selected = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              return selected < today || "Future date is not allowed";
            },
          })}
          {...inputStyle}
        />

        {errors?.org?.establish_date && (
          // <Text fontSize="xs" color="red.500" mt={1}>
          //   {errors.org.establishedDate.message}
          // </Text>
          <FormErrorMessage fontFamily="poppins">
            {errors?.org?.establish_date?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  );
}

/** ---------- Step 2 - Division ---------- */
function DivisionStep() {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();

  return (
    <div style={{ padding: "20px" }}>
      <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
        Enter Division details.
      </Text>

      {/* Header */}
      <Box
        mb={4}
        mt={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 8px, transparent 5px 22px) 1",
        }}
      ></Box>

      <Box
        mb={6}
        borderRadius="md"
        p={3}
        borderWidth={1}
        borderColor="gray.100"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="2xl" fontFamily="Poppins', sans-serif" fontWeight={600}>
            Division 1
          </Text>
        </Flex>

        <FormControl
          mb={4}
          isRequired
          isInvalid={!!errors?.divisions?.[0]?.division_name}
        >
          <FormLabel fontFamily="Poppins', sans-serif">Division name</FormLabel>

          <Input
            placeholder="Enter Division name"
            {...register(`divisions.0.division_name`, {
              required: "Division name is required",
              pattern: {
                value: /^[A-Za-z ]+$/,
                message: "Only alphabets are allowed",
              },
            })}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage>
            {errors?.divisions?.[0]?.division_name?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel fontFamily="Poppins', sans-serif">Division code</FormLabel>
          <Input
            placeholder="Enter Division code"
            {...register(`divisions.0.division_code`, {
              required: "Division code is required",
              pattern: {
                value: /^[A-Za-z0-9]+$/,
                message: "Special characters are not allowed",
              },
            })}
            onChange={(e) => {
              // block special characters while typing
              e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
            }}
            {...inputStyle}
          />
          {errors?.divisions?.[0]?.division_code && (
            <Text color="red.500" fontFamily="Poppins', sans-serif" fontSize="12px">
              Division code is required
            </Text>
          )}
        </FormControl>

        <FormControl mb={4}>
          <FormLabel fontFamily="Poppins', sans-serif">Description</FormLabel>
          <Input
            placeholder="Enter description"
            {...register(`divisions.0.description`)}
            {...inputStyle}
          />
        </FormControl>
      </Box>
    </div>
  );
}

/** ---------- Step 3 - Work Location ---------- */
function LocationStep() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContextSafe();

  const postalCode = watch("locations.0.postal_code");

  // PINCODE LOOKUP
  useEffect(() => {
    if (!postalCode || postalCode.length !== 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${postalCode}`,
        );
        const data = await res.json();

        if (
          !Array.isArray(data) ||
          data[0]?.Status !== "Success" ||
          !data[0]?.PostOffice?.length
        ) {
          return;
        }

        // Prefer Delivery office, fallback to first
        const postOffice =
          data[0].PostOffice.find((po) => po.DeliveryStatus === "Delivery") ||
          data[0].PostOffice[0];

        // Auto-fill fields
        setValue("locations.0.city", postOffice.Division || "");
        setValue("locations.0.state", postOffice.State || "");
        setValue("locations.0.country", postOffice.Country || "India");
      } catch (err) {
        console.error("Pincode lookup failed", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [postalCode, setValue]);

  return (
    <div style={{ padding: "20px" }}>
      <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
        Enter work location details
      </Text>

      {/* Header */}
      <Box
        mb={4}
        mt={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 8px, transparent 5px 22px) 1",
        }}
      ></Box>

      <Box
        mb={6}
        borderRadius="md"
        p={3}
        borderWidth={1}
        borderColor="gray.100"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="2xl" fontFamily="Poppins', sans-serif" fontWeight={600}>
            Location 1
          </Text>
        </Flex>
        <FormControl
          mb={4}
          isRequired
          isInvalid={!!errors?.locations?.[0]?.location_name}
        >
          <FormLabel fontFamily="Poppins', sans-serif">Office Location</FormLabel>

          <Input
            placeholder="Enter location name"
            {...register(`locations.0.location_name`, {
              required: "Location name is required",
              pattern: {
                value: /^[A-Za-z0-9 ]+$/,
                message: "Special characters are not allowed",
              },
            })}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.location_name?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl
          mb={4}
          isRequired
          isInvalid={!!errors?.locations?.[0]?.address_line_1}
        >
          <FormLabel fontFamily="Poppins', sans-serif">Address Line 1</FormLabel>

          <Input
            placeholder="Enter address line 1"
            fontFamily="Poppins', sans-serif"
            {...register(`locations.0.address_line_1`, {
              required: "Address Line 1 is required",
              pattern: {
                value: /^[A-Za-z0-9 ]+$/,
                message: "Special characters are not allowed",
              },
            })}
            onChange={(e) => {
              // restrict special characters while typing
              e.target.value = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.address_line_1?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel fontFamily="Poppins', sans-serif">Address Line 2</FormLabel>
          <Input
            fontFamily="Poppins', sans-serif"
            placeholder="Enter address line 2"
            {...register(`locations.0.address_line_2`)}
            {...inputStyle}
          />
        </FormControl>
        <FormControl
          mb={4}
          isInvalid={!!errors?.locations?.[0]?.city}
          isRequired
        >
          <FormLabel fontFamily="Poppins', sans-serif">City</FormLabel>

          <Input
            placeholder="Enter city"
            {...register(`locations.0.city`, {
              required: "City is required",
              pattern: {
                value: /^[A-Za-z ]+$/,
                message: "Only alphabets are allowed",
              },
            })}
            onChange={(e) => {
              // block numbers & special characters while typing
              e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.city?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl
          mb={4}
          isInvalid={!!errors?.locations?.[0]?.state}
          isRequired
        >
          <FormLabel fontFamily="Poppins', sans-serif">State</FormLabel>
          <Input
            placeholder="Enter state"
            {...register(`locations.0.state`, {
              required: "State is required",
              pattern: {
                value: /^[A-Za-z ]+$/,
                message: "Only alphabets are allowed",
              },
            })}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.state?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl
          mb={4}
          isInvalid={!!errors?.locations?.[0]?.country}
          isRequired
        >
          <FormLabel fontFamily="Poppins', sans-serif">Country</FormLabel>
          <Input
            placeholder="Enter country"
            fontFamily="Poppins', sans-serif"
            {...register(`locations.0.country`, {
              required: "Country is required",
              pattern: {
                value: /^[A-Za-z ]+$/,
                message: "Only alphabets are allowed",
              },
            })}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^A-Za-z ]/g, "");
              setValue(`locations.0.country`, sanitized, {
                shouldValidate: true,
              });
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.country?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl
          mb={4}
          isInvalid={!!errors?.locations?.[0]?.postal_code}
          isRequired
        >
          <FormLabel fontFamily="Poppins', sans-serif">Postal Code</FormLabel>
          <Input
            placeholder="Enter postal code"
            fontFamily="Poppins', sans-serif"
            maxLength={6}
            {...register(`locations.0.postal_code`, {
              required: "Postal code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Postal code must be 6 digits",
              },
            })}
            onChange={(e) => {
              // allow only numbers
              const sanitized = e.target.value.replace(/[^0-9]/g, "");
              setValue(`locations.0.postal_code`, sanitized, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.locations?.[0]?.postal_code?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel>Phone number</FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              h="100%"
              w="108px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Flex align="center" h="100%" w="100%" justify="center" gap={4}>
                <Text
                  color="#667085"
                  fontFamily="'Poppins', sans-serif"
                  fontSize="32px"
                  lineHeight="1"
                  fontWeight="400"
                >
                  +91
                </Text>
                <Box h="34px" borderLeft="1.5px solid #98A2B3" />
              </Flex>
            </InputLeftElement>
            <Input
              placeholder="Enter phone number"
              maxLength={10}
              pl="108px"
              {...register("locations[0].phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              {...inputStyle}
            />
          </InputGroup>
          {errors?.locations?.[0]?.phone && (
            <Text color="red.500" fontSize="14px" fontFamily="poppins">
              {errors.locations[0].phone.message}
            </Text>
          )}
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel fontFamily="Poppins', sans-serif">Is this your organization's headquarters?</FormLabel>
          <Select
            placeholder="Select"
            {...register(`locations.0.is_headquarters`)}
            {...inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormControl>

        <FormControl mb={0} isRequired>
          <FormLabel fontFamily="Poppins', sans-serif">Timezone</FormLabel>
          <Select
            placeholder="Select timezone"
            {...register("locations.0.timezone")}
            {...inputStyle}
          >
            <option value="UTC-12:00">
              (UTC-12:00) International Date Line West
            </option>
            <option value="UTC-08:00">
              (UTC-08:00) Pacific Time (US & Canada)
            </option>
            <option value="UTC-05:00">
              (UTC-05:00) Eastern Time (US & Canada)
            </option>
            <option value="UTC+00:00">(UTC+00:00) Greenwich Mean Time</option>
            <option value="UTC+01:00">(UTC+01:00) Central European Time</option>
            <option value="UTC+05:30">(UTC+05:30) India Standard Time</option>
            <option value="UTC+08:00">(UTC+08:00) China Standard Time</option>
            <option value="UTC+10:00">
              (UTC+10:00) Australian Eastern Time
            </option>
          </Select>
        </FormControl>
      </Box>
    </div>
  );
}

/** ---------- Step 4 - Department ---------- */
function DepartmentStep() {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();

  return (
    <div style={{ padding: "20px" }}>
      <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
        Enter department details.
      </Text>

      {/* Header */}
      <Box
        mb={4}
        mt={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 8px, transparent 5px 22px) 1",
        }}
      ></Box>

      <Box
        mb={6}
        borderRadius="md"
        p={3}
        borderWidth={1}
        borderColor="gray.100"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="2xl" fontWeight={600} fontFamily="Poppins', sans-serif">
            Department 1
          </Text>
        </Flex>
        <FormControl
          mb={4}
          isRequired
          isInvalid={!!errors?.departments?.[0]?.department_name}
        >
          <FormLabel fontFamily="Poppins', sans-serif">Department name</FormLabel>
          <Input
            placeholder="Enter department name"
            {...register(`departments.0.department_name`, {
              required: "Department name is required",
              pattern: {
                value: /^[A-Za-z ]+$/,
                message: "Only letters and spaces are allowed",
              },
            })}
            onChange={(e) => {
              // Remove anything that is not a letter or space
              e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
            }}
            {...inputStyle}
          />

          <FormErrorMessage fontFamily="poppins">
            {errors?.departments?.[0]?.department_name?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel fontFamily="Poppins', sans-serif">Description</FormLabel>
          <Input
            placeholder="Enter description"
            {...register(`departments.0.description`)}
            {...inputStyle}
          />
        </FormControl>
      </Box>
    </div>
  );
}

/** ---------- Main Component - 4-step wizard (Organization -> Division -> Location -> Department) ---------- */
export default function OrganizationRegister() {
  const methods = useForm({
    // mode: "onChange",
    mode: "onTouched",
    defaultValues: {
      org: {
        organisation_name: "",
        organisation_id: "",
        company_size: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        phone: "",
        email: "",
        website: "",
        tax_id: "",
        gst_number: "",
        registration_number: "",
        establish_date: "",
        created_by: "",
      },
      // single division as index 0
      divisions: [
        {
          division_name: "",
          division_code: "",
          description: "",
          // head: "",
          // email: "",
        },
      ],
      // single location as index 0
      locations: [
        {
          location_name: "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
          phone: "",
          is_headquarters: false,
          timezone: "",
        },
      ],
      // single department as index 0
      departments: [
        {
          department_name: "",
          description: "",
        },
      ],
    },
  });

  const steps = useMemo(
    () => ["Organization", "Division", "Location", "Department"],
    [],
  );
  const [step, setStep] = useState(0);

  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orgCodeState, setOrgCodeState] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const requiredByStep = {
    0: [
      "org.organisation_name",
      "org.email",
      "org.phone",
      "org.company_size",
      "org.city",
      "org.state",
      "org.country",
      "org.postal_code",
      "org.tax_id",
      "org.registration_number",
      "org.establish_date",
    ],
    1: ["divisions.0.division_name", "divisions.0.division_code"],
    2: [
      "locations.0.location_name",
      "locations.0.address_line_1",
      "locations.0.city",
      "locations.0.state",
      "locations.0.country",
      "locations.0.postal_code",
      "locations.0.phone",
    ],
  };

  const progressValue = ((step + 1) / steps.length) * 100;

  const handleNext = async () => {
    const ok = await methods.trigger(requiredByStep[step]);
    if (!ok) return;

    // Step 0: register organization via API, capture org_id
    if (step === 0) {
      try {
        setLoading(true);
        setError(null);
        const values = methods.getValues();
        const org = values.org || {};
        const empCode = getEmpCode();
        const org_id =
          orgCodeState ||
          (typeof window !== "undefined" && localStorage.getItem("org_code")) ||
          null;
        const orgPayload = {
          organisation_name: org.organisation_name,
          organisation_id: org_id,
          city: org.city,
          state: org.state,
          company_size: org.company_size,
          country: org.country,
          postal_code: org.postal_code,
          phone: org.phone,
          email: org.email,
          website: org.website,
          tax_id: org.tax_id,
          gst_number: org.gst_number,
          registration_number: org.registration_number,
          establish_date: org.establish_date,
          created_by: empCode || org.created_by || null,
          is_active: true,
          collection: constant_file.collection.organization,
          created_at: new Date(),
          updated_at: new Date(),
        };
        const res = await api.post("/organization/register_org", orgPayload);

        // try to find org code in response
        const orgCode =
          res?.data?.org_code ||
          res?.data?.data?.org_code ||
          res?.data?.orgId ||
          res?.data?.org_id ||
          null;

        if (orgCode) {
          setOrgCodeState(orgCode);
          try {
            if (typeof window !== "undefined")
              localStorage.setItem("org_code", orgCode);
          } catch (e) {
            console.warn("Failed to persist org_code", e);
          }
          setStep(1); // go to Division step
          toast({
            title: "Organization registered",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        } else {
          setError("Organization registered but org_id not returned");
          toast({
            title: "Registration incomplete",
            description: "org_id not returned by server",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Registration failed");
        toast({
          title: "Registration failed",
          description: err?.response?.data?.msg || "Please try again.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 1: register division via API (stamp org_id)
    if (step === 1) {
      try {
        setLoading(true);
        setError(null);
        const values = methods.getValues();
        const division = (values.divisions && values.divisions[0]) || {};
        const empCode = getEmpCode();
        const orgCode =
          orgCodeState ||
          (typeof window !== "undefined" && localStorage.getItem("org_code"));

        if (!orgCode) {
          setError(
            "Missing org_id. Please complete organization registration first.",
          );
          toast({
            title: "Missing org_id",
            description:
              "Organization ID not found. Please register organization first.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const payload = { organisation_id: orgCode, ...division };
        if (empCode) payload.created_by = empCode;

        const res = await api.post("/organization/register_division", payload);

        toast({
          title: "Division added",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setStep(2); // move to Location step
      } catch (err) {
        console.error("register_division error", err?.response || err);
        setError(err?.response?.data?.message || "Adding division failed");
        toast({
          title: "Adding division failed",
          description: err?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 2: add company location via API (stamp org_id)
    if (step === 2) {
      try {
        setLoading(true);
        setError(null);
        const values = methods.getValues();
        const location = (values.locations && values.locations[0]) || {};
        // Normalize is_headquarters to boolean (select returns string 'true'/'false')
        const normalizedLocation = {
          ...location,
          is_headquarters:
            location.is_headquarters === true ||
            location.is_headquarters === "true"
              ? true
              : false,
        };
        const empCode = getEmpCode();
        const orgCode =
          orgCodeState ||
          (typeof window !== "undefined" && localStorage.getItem("org_code"));

        if (!orgCode) {
          setError(
            "Missing org_id. Please complete organization registration first.",
          );
          toast({
            title: "Missing org_id",
            description:
              "Organization ID not found. Please register organization first.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const payload = { org_id: orgCode, ...normalizedLocation };
        if (empCode) payload.created_by = empCode;

        const res = await api.post(
          "/organization/add_company_location",
          payload,
        );
        // optional: check res status
        toast({
          title: "Location added",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setStep(3); // move to Department step
      } catch (err) {
        console.error("add_company_location error", err?.response || err);
        setError(err?.response?.data?.message || "Adding location failed");
        toast({
          title: "Adding location failed",
          description: err?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (allData) => {
    // Final submit: add department (stamp org_id) then finish
    try {
      setSubmitting(true);
      setError(null);
      const empCode = getEmpCode();
      const orgCode =
        orgCodeState ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      if (!orgCode) {
        toast({
          title: "Missing org_id",
          description:
            "Organization ID not found. Please complete organization registration first.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const dept = (allData.departments && allData.departments[0]) || {};
      const payload = { org_id: orgCode, ...dept };
      if (empCode) payload.created_by = empCode;

      const res = await api.post(
        "/organization/add_company_department",
        payload,
      );

      toast({
        title: "Department added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // optionally persist org_code (already done earlier)
      try {
        if (orgCode && typeof window !== "undefined")
          localStorage.setItem("org_code", orgCode);
      } catch (e) {}

      methods.reset();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" direction="column" justify="flex-start" pt={2}>
      <Box m={4} bg="white" border="1px solid #E2E8F0" borderRadius={10} p={8}>
        {/* Progress bar */}
        <Progress
          value={progressValue}
          size="sm"
          borderRadius="md"
          mb={6}

          sx={{
            "& > div": {
              backgroundColor: "#1a355c",
            },
          }}
        />

        {/* Title + Skip (only step 0) */}
        <Flex
          justify={step === 0 ? "space-between" : "flex-start"}
          align="center"
          mb={6}
        >
          <Box pl={"20px"} pr={"20px"}>
            <Text
              fontFamily="Poppins', sans-serif"
              fontWeight="700"
              fontSize="24px"
              mb={1}
            >
              {step === 0 && "Set Up Your Company Profile"}
              {step === 1 && "Add your division details"}
              {step === 2 && "Add your work location"}
              {step === 3 && "Add your department details"}
            </Text>
            <Text
              color="gray.600"
              fontFamily="Poppins', sans-serif"
              fontSize="14px"
            >
              Provide few details to personalize your workspace and get your
              team started.
            </Text>
          </Box>

          {/* {step === 0 && (
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard", { replace: true })}
              color="#1A365D"
              backgroundColor="white"
              _hover={{ bg: "#153e75", color: "white" }}
              border={"1px solid #cccccc"}
              mr={"20px"}
              pl={8}
              pr={8}
            >
              Skip
            </Button>
          )} */}
        </Flex>

        {/* Form body */}
        <FormProvider {...methods}>
          <Box as="form" onSubmit={methods.handleSubmit(onSubmit)}>
            {step === 0 && <OrgStep />}
            {step === 1 && <DivisionStep />}
            {step === 2 && <LocationStep />}
            {step === 3 && <DepartmentStep />}

            {error && (
              <Text color="red.500" fontFamily="Poppins', sans-serif" fontSize="14px" mb={2}>
                {typeof error === "string" ? error : "Registration failed."}
              </Text>
            )}

            {/* Wizard controls */}
            <Flex justify="space-between" mt={2}>
              <Button
                variant="outline"
                onClick={handleBack}
                isDisabled={step === 0 || loading}
                ml={"20px"}
                  pl={8}
                  pr={8}
              >
                Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  onClick={handleNext}
                  isLoading={loading}
                  mr={"20px"}
                  pl={8}
                  pr={8}
                >
                  Next
                </Button>
              ) : (
                <Button
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  type="submit"
                  isLoading={submitting}
                  mr={"20px"}
                  pl={8}
                  pr={8}
                >
                  Submit
                </Button>
              )}
            </Flex>
          </Box>
        </FormProvider>
      </Box>
    </Flex>
  );
}
