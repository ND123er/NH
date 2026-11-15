import React from "react";
import { Box, Flex, Text, Image, useColorModeValue } from "@chakra-ui/react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const DashboardCards = ({ icon, title, count, percentage, status }) => {
  const isUp = status === "up";
  // const isUp = status === "up";

   const navBg = useColorModeValue("white", "#000");
    const borderClr = useColorModeValue("#cccccc", "gray.700");
    const textClr = useColorModeValue("black", "white");
    const subTextClr = useColorModeValue("#757575", "gray.400");
  const raw = percentage ?? 0;
  const num =
    parseFloat(String(raw).replace(/[^0-9.-]+/g, "")) || 0;


  const display = Math.abs(num);
  const isZero = display === 0;
  return (
    <Box
      w="100%"
      // p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderRadius="14px"
      boxShadow="sm"
      // bg="white"
      bg={navBg}
      border={"1px solid #cccccc"}
    >
      {/* Title + icon */}
      <Flex align="center" mb={{ base: 2, md: 3 }} gap={2} mt={4} mr={2} ml={4}>
        <Image src={icon} alt={title} boxSize={{ base: "20px", md: "24px" }} />
        <Text
          width="191px"
          height="36px"
          opacity={1}
          fontFamily="Poppins"
          fontWeight={600}
          fontSize="18px"
          lineHeight="100%"
          letterSpacing="-3%"
          display="flex"
          alignItems="center"
        >
          {(() => {
            const match = title.match(/^(.*?)(\s*\(.*\))$/);
            if (!match) return title;

            return (
              <>
                {match[1]}
                <Text
                  as="span"
                  color="#757575"
                  ml="1"
                  fontWeight={400}
                  fontSize={"16px"}
                >
                  {match[2]}
                </Text>
              </>
            );
          })()}
        </Text>
      </Flex>

      <Flex align="center" justify="space-between" pt={6} mr={2} ml={4} mb={2}>
        <Text
          width="90px"
          height="65px"
          opacity={1}
          fontFamily="Poppins"
          fontWeight={500}
          fontSize="54.12px"
          lineHeight="100%"
          letterSpacing="-3%"
          display="flex"
          alignItems="center"
        >
          {count}
        </Text>
        <Flex align="center" gap={1} mt={{ base: 0.5, md: 4 }} mr={3}>
          {isZero ? null : (
            <Box
              as={isUp ? TrendingUp : TrendingDown}
              size={22}
              color={isUp ? "#16a34a" : "#E00808"}
            />)
          }

          <Text
            fontSize={{ base: "sm", md: "md" }}
            // color={isUp ? "green.500" : "red.500"}
            color={
              isZero
                ? "gray.500"
                : isUp
                  ? "green.500"
                  : "red.500"
            }
            fontWeight="medium"
          >
            {(() => {
              const raw = percentage ?? 0;
              const num =
                parseFloat(String(raw).replace(/[^0-9.-]+/g, "")) || 0;
              const display = Math.abs(num);
              // return `${isUp ? "+" : "-"}${display}%`;
              return display === 0 ? "0%" : `${isUp ? "+" : "-"}${display}%`;
            })()}
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }} color={textClr}>
            than last month
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};
