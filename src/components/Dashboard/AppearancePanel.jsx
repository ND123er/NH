// import React, { useState } from "react";
// import {
//   Box,
//   Flex,
//   VStack,
//   HStack,
//   Text,
//   RadioGroup,
//   Radio,
//   Button,
//   Stack,
//   useRadioGroup,
//   useRadio,
//   Icon,
// } from "@chakra-ui/react";
// import { SunIcon, MoonIcon } from "@chakra-ui/icons";

// function PreviewRadio({ value, children, isChecked, onChange }) {
//   return (
//     <Box
//       as="label"
//       cursor="pointer"
//       onClick={() => onChange(value)}
//       borderRadius="8px"
//       px={3}
//       py={2}
//       border={isChecked ? "2px solid #274167" : "1px solid #E6E6E6"}
//       boxShadow={isChecked ? "md" : "none"}
//       bg={isChecked ? "white" : "transparent"}
//       _hover={{ borderColor: "#274167" }}
//       minW="160px"
//     >
//       {children}
//     </Box>
//   );
// }

// function ThemePreview({ variant = "system" }) {
//   const sideBg =
//     variant === "dark"
//       ? "#111827"
//       : variant === "light"
//         ? "#F7FAFC"
//         : "#ffffff";
//   const contentBg =
//     variant === "dark"
//       ? "#0B1220"
//       : variant === "light"
//         ? "#FFFFFF"
//         : "#F6F8FA";

//   const sideColor = variant === "dark" ? "#1f2937" : "#E6EEF8";

//   return (
//     <Box borderRadius="8px" overflow="hidden" border="1px solid #E6E6E6">
//       <Flex h="72px" w="220px">
//         <Box w="68px" bg={sideBg} borderRight="1px solid #E6E6E6" />
//         <Box flex="1" bg={contentBg} px={3} py={1}>
//           <Box h="10px" bg={sideColor} w="64%" borderRadius="6px" mb={2} />
//           <Box h="8px" bg={sideColor} w="40%" borderRadius="6px" />
//         </Box>
//       </Flex>
//     </Box>
//   );
// }

// export default function AppearancePanel({
//   currentTheme = "system",
//   onApply,
//   onCancel,
// }) {
//   const [theme, setTheme] = useState(currentTheme);

//   return (
//     <VStack align="stretch" spacing={6}>
//       <Text fontSize="lg" fontWeight="600">
//         Interface theme
//       </Text>

//       <Text fontSize="sm" color="gray.600">
//         Select or customize your UI theme.
//       </Text>

//       <HStack spacing={4} align="start">
//         <Stack direction="row" spacing={3}>
//           {/* System preference */}
//           <PreviewRadio
//             value="system"
//             isChecked={theme === "system"}
//             onChange={setTheme}
//           >
//             <VStack align="start" spacing={2}>
//               <ThemePreview variant="system" />
//               <Text fontWeight={600} fontSize="sm">
//                 System preference
//               </Text>
//               <Text fontSize="xs" color="gray.500">
//                 Follow device settings
//               </Text>
//             </VStack>
//           </PreviewRadio>

//           {/* Light */}
//           <PreviewRadio
//             value="light"
//             isChecked={theme === "light"}
//             onChange={setTheme}
//           >
//             <VStack align="start" spacing={2}>
//               <ThemePreview variant="light" />
//               <Text fontWeight={600} fontSize="sm">
//                 Light
//               </Text>
//               <Text fontSize="xs" color="gray.500">
//                 Light theme for brighter UI
//               </Text>
//             </VStack>
//           </PreviewRadio>

//           {/* Dark */}
//           <PreviewRadio
//             value="dark"
//             isChecked={theme === "dark"}
//             onChange={setTheme}
//           >
//             <VStack align="start" spacing={2}>
//               <ThemePreview variant="dark" />
//               <Text fontWeight={600} fontSize="sm">
//                 Dark
//               </Text>
//               <Text fontSize="xs" color="gray.500">
//                 Reduce eye strain in low light
//               </Text>
//             </VStack>
//           </PreviewRadio>
//         </Stack>
//       </HStack>

//       {/* controls */}
//       <Flex justify="flex-end" gap={3}>
//         <Button variant="ghost" onClick={() => onCancel?.()}>
//           Cancel
//         </Button>
//         <Button
//           bg="#274167"
//           color="white"
//           _hover={{ bg: "#1f3143" }}
//           onClick={() => onApply?.(theme)}
//         >
//           Save changes
//         </Button>
//       </Flex>
//     </VStack>
//   );
// }


import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Stack,
  useColorMode,
} from "@chakra-ui/react";

function PreviewRadio({ value, children, isChecked, onChange }) {
  return (
    <Box
      as="label"
      cursor="pointer"
      onClick={() => onChange(value)}
      borderRadius="8px"
      px={3}
      py={2}
      border={isChecked ? "2px solid #274167" : "1px solid #E6E6E6"}
      boxShadow={isChecked ? "md" : "none"}
      bg={isChecked ? "white" : "transparent"}
      _hover={{ borderColor: "#274167" }}
      minW="160px"
    >
      {children}
    </Box>
  );
}

function ThemePreview({ variant = "system" }) {
  const sideBg =
    variant === "dark"
      ? "#111827"
      : variant === "light"
      ? "#F7FAFC"
      : "#ffffff";

  const contentBg =
    variant === "dark"
      ? "#0B1220"
      : variant === "light"
      ? "#FFFFFF"
      : "#F6F8FA";

  const sideColor = variant === "dark" ? "#1f2937" : "#E6EEF8";

  return (
    <Box borderRadius="8px" overflow="hidden" border="1px solid #E6E6E6">
      <Flex h="72px" w="220px">
        <Box w="68px" bg={sideBg} borderRight="1px solid #E6E6E6" />
        <Box flex="1" bg={contentBg} px={3} py={1}>
          <Box h="10px" bg={sideColor} w="64%" borderRadius="6px" mb={2} />
          <Box h="8px" bg={sideColor} w="40%" borderRadius="6px" />
        </Box>
      </Flex>
    </Box>
  );
}

export default function AppearancePanel({ onCancel }) {
  const { colorMode, setColorMode } = useColorMode();

  const [theme, setTheme] = useState(colorMode);

  // ✅ Apply Theme when Save clicked
  const handleApply = () => {
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setColorMode(systemPrefersDark ? "dark" : "light");
    } else {
      setColorMode(theme);
    }

    localStorage.setItem("chakra-theme", theme);
  };

  // ✅ Load saved theme on open
  useEffect(() => {
    const savedTheme = localStorage.getItem("chakra-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme !== "system") {
        setColorMode(savedTheme);
      }
    }
  }, []);

  return (
    <VStack align="stretch" spacing={6}>
      <Text fontSize="lg" fontWeight="600">
        Interface theme
      </Text>

      <Text fontSize="sm" color="gray.600">
        Select your UI theme.
      </Text>

      <HStack spacing={4} align="start">
        <Stack direction="row" spacing={3}>
          {/* System */}
          <PreviewRadio
            value="system"
            isChecked={theme === "system"}
            onChange={setTheme}
          >
            <VStack align="start" spacing={2}>
              <ThemePreview variant="system" />
              <Text fontWeight={600} fontSize="sm">
                System preference
              </Text>
              <Text fontSize="xs" color="gray.500">
                Follow device settings
              </Text>
            </VStack>
          </PreviewRadio>

          {/* Light */}
          <PreviewRadio
            value="light"
            isChecked={theme === "light"}
            onChange={setTheme}
          >
            <VStack align="start" spacing={2}>
              <ThemePreview variant="light" />
              <Text fontWeight={600} fontSize="sm">
                Light
              </Text>
            </VStack>
          </PreviewRadio>

          {/* Dark */}
          <PreviewRadio
            value="dark"
            isChecked={theme === "dark"}
            onChange={setTheme}
          >
            <VStack align="start" spacing={2}>
              <ThemePreview variant="dark" />
              <Text fontWeight={600} fontSize="sm">
                Dark
              </Text>
            </VStack>
          </PreviewRadio>
        </Stack>
      </HStack>

      {/* Buttons */}
      <Flex justify="flex-end" gap={3}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          bg="#274167"
          color="white"
          _hover={{ bg: "#1f3143" }}
          onClick={handleApply}
        >
          Save changes
        </Button>
      </Flex>
    </VStack>
  );
}