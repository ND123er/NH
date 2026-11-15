// import {
//   Box,
//   Flex,
//   Heading,
//   Icon,
//   Image,
//   Text,
// } from "@chakra-ui/react";
// import { ShieldCheck } from "lucide-react";
// import nav_logo from "../../assets/nav_logo.png";

// export default function AuthLayout({
//   children,
//   contentMaxW = "400px",
//   contentPx = { base: 5, sm: 8, lg: 10 },
//   contentPy = { base: 8, md: 4 },
// }) {
//   return (
//     <Flex
//       width="100%"
//       height={{ base: "auto", md: "100vh" }}
//       minH={{ base: "100dvh", md: "100vh" }}
//       overflow={{ base: "visible", md: "hidden" }}
//       direction={{ base: "column", md: "row" }}
//       bg="white"
//     >
//       {/* Shared left sidebar */}
//       <Flex
//         as="aside"
//         direction="column"
//         justify="space-between"
//         flexShrink={0}
//         width={{ base: "100%", md: "34%" }}
//         height={{ base: "auto", md: "100vh" }}
//         bg="#1A365D"
//         color="white"
//         px={{ base: 5, md: 7, lg: 8 }}
//         py={{ base: 4, md: 6 }}
//       >
//         <Image
//           src={nav_logo}
//           alt="HRMSnap Logo"
//           w="160px"
//           objectFit="contain"
//         />

//         <Box my={{ base: 5, md: "auto" }} py={{ base: 1, md: 5 }}>
//           <Flex
//             align="center"
//             justify="center"
//             boxSize={{ base: "58px", md: "76px" }}
//             border="1px solid"
//             borderColor="#49406F"
//             borderRadius="2xl"
//             mb={{ base: 4, md: 6 }}
//             bg="#2A2355"
//           >
//             <Icon
//               as={ShieldCheck}
//               boxSize={{ base: 7, md: 9 }}
//               color="#BBA7FF"
//               strokeWidth={1.5}
//             />
//           </Flex>

//           <Heading
//             fontSize={{ base: "2xl", md: "2xl", lg: "3xl" }}
//             lineHeight="1.35"
//             letterSpacing="-0.03em"
//           >
//             Your workspace.
//             <br />
//             Securely yours.
//           </Heading>

//           <Text
//             mt={3}
//             color="#C8C1E8"
//             fontSize={{ base: "sm", md: "md" }}
//             lineHeight="1.8"
//             maxW="320px"
//           >
//             A little extra protection for your people and
//             their information.
//           </Text>
//         </Box>

//         <Text fontSize="sm" color="#B8B0DF" mt={2}>
//           Employee access · Account security
//         </Text>
//       </Flex>

//       {/* Right-side content changes for each screen */}
//       {/* <Flex
//         flex="1"
//         minW={0}
//         minH={0}
//         height={{ base: "auto", md: "100vh" }}
//         overflow={{ base: "visible", md: "hidden" }}
//         justify="center"
//         align="center"
//         px={contentPx}
//         py={contentPy}
//       > */}
//       <Flex
//         flex="1"
//         minW={0}
//         minH={0}
//         height={{ base: "auto", md: "100vh" }}
//         maxH={{ base: "none", md: "100vh" }}
//         overflowX="hidden"
//         overflowY="auto"
//         justify="center"
//         align={{ base: "flex-start", md: "center" }}
//         px={contentPx}
//         py={contentPy}
//       >
//         <Box width="100%" maxW={contentMaxW}>
//           {children}
//         </Box>
//       </Flex>
//     </Flex>
//   );
// }


import {
  Box,
  Flex,
  Heading,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { ShieldCheck } from "lucide-react";
import nav_logo from "../../assets/nav_logo.png";

export default function AuthLayout({
  children,
  contentMaxW = "400px",
  contentPx = { base: 5, sm: 8, lg: 10 },
  contentPy = { base: 8, md: 4 },
}) {
  return (
    <Flex
      width="100%"
      minH="100dvh"
      height="auto"
      direction={{ base: "column", md: "row" }}
      bg="white"
      align="stretch"
    >
      {/* Left Sidebar */}
      <Flex
        as="aside"
        direction="column"
        justify="space-between"
        flexShrink={0}
        width={{ base: "100%", md: "34%" }}
        minH={{ base: "auto", md: "100dvh" }}
        bg="#1A365D"
        color="white"
        px={{ base: 5, md: 7, lg: 8 }}
        py={{ base: 4, md: 6 }}
      >
        <Image
          src={nav_logo}
          alt="HRMSnap Logo"
          w="160px"
          objectFit="contain"
        />

        <Box my={{ base: 5, md: "auto" }} py={{ base: 1, md: 5 }}>
          <Flex
            align="center"
            justify="center"
            boxSize={{ base: "58px", md: "76px" }}
            border="1px solid"
            borderColor="#49406F"
            borderRadius="2xl"
            mb={{ base: 4, md: 6 }}
            bg="#2A2355"
          >
            <Icon
              as={ShieldCheck}
              boxSize={{ base: 7, md: 9 }}
              color="#BBA7FF"
              strokeWidth={1.5}
            />
          </Flex>

          <Heading
            fontSize={{ base: "2xl", md: "2xl", lg: "3xl" }}
            lineHeight="1.35"
            letterSpacing="-0.03em"
          >
            Your workspace.
            <br />
            Securely yours.
          </Heading>

          <Text
            mt={3}
            color="#C8C1E8"
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.8"
            maxW="320px"
          >
            A little extra protection for your people and
            their information.
          </Text>
        </Box>

        <Text fontSize="sm" color="#B8B0DF" mt={2}>
          Employee access · Account security
        </Text>
      </Flex>

      {/* Right Content - Full Vertical Scroll */}
      <Flex
        flex="1"
        minW={0}
        width={{ base: "100%", md: "66%" }}
        minH="100dvh"
        height="auto"
        overflow="visible"
        justify="center"
        align="flex-start"
        px={contentPx}
        py={contentPy}
      >
        <Box
          width="100%"
          maxW={contentMaxW}
          mx="auto"
          py={2}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
