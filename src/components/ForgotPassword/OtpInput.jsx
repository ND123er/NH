import { HStack, Input } from "@chakra-ui/react";
import { useRef } from "react";

export default function OtpInput({ value, setValue }) {
  const refs = useRef([]);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;

    const otp = value.split("");
    otp[i] = v;
    setValue(otp.join(""));

    if (v && refs.current[i + 1]) {
      refs.current[i + 1].focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key !== "Backspace") return;

    const otp = value.split("");

    if (otp[i]) {
      // Case 1: clear current digit
      otp[i] = "";
      setValue(otp.join(""));
    } else if (i > 0) {
      // Case 2: move back & clear previous
      otp[i - 1] = "";
      setValue(otp.join(""));
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <HStack spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          maxLength={1}
          textAlign="center"
          w="50px"
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
        />
      ))}
    </HStack>
  );
}
