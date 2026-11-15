import { Box, Flex, HStack, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";

export default function ForgotPasswordLayout({ step, onBack, children }) {
  return (
    <Box minH="100vh" bg="#F5F5F5" py={90}>
      <Box
        maxW="780px"
        mx="auto"
        bg="white"
        borderRadius="14px"
        minH="550px"
        border="1px solid #cccccc"
        boxShadow="md"
        // border={'1px solid red'}
      >
        {/* Header */}
        <Box borderBottom="1px solid #E5E7EB" p={4}>
          <Flex align="center">
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={onBack}
              borderRadius="full"
              bg="#274167"
              color="white"
              _hover={{ bg: "#1F3B5A" }}
            />
            <HStack ml={4} spacing={4} flex={1}>
              {[1, 2, 3].map((s) => (
                <Box
                  key={s}
                  flex={1}
                  h="10px"
                  borderRadius="20px"
                  bg={step >= s ? "#274167" : "#E5E7EB"}
                />
              ))}
            </HStack>
          </Flex>
        </Box>

        {/* Content */}
        <Box pt={6} pl={8}>{children}</Box>
      </Box>
    </Box>
  );
}
