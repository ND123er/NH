import React from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmployeeCard = ({ icon, title, count, percentage, status }) => {
  const raw = percentage ?? "0%";
  const num = parseFloat(String(raw).replace(/[^0-9.-]+/g, "")) || 0;

  const isUp = status === "up" && num > 0;
  const isDown = status === "down" && num < 0;
  const isNoChange = status === "no-change" || num === 0;
  
  const navigate = useNavigate();
  const getPercentageText = () => {
    if (isNoChange) return "0%";
    return `${isUp ? "+" : "-"}${Math.abs(num)}%`;
  };

  const getPercentageColor = () => {
    if (isUp) return "green.500";
    if (isDown) return "red.500";
    return "gray.500";
  };

  return (
    <Box
      w="100%"
      // p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderRadius="14px"
      boxShadow="sm"
      bg="white"
      border="1px solid #cccccc"
    // mt={'7.8vh'}
    // mt={{ base: "7.8vh", sm: "9vh", md: "0vh" ,lg: '0vh' }}
    // mb={{base:'2vh'}}
    >
      {/* Title + icon */}
      <Flex align="center" mb={{ base: 2, md: 3 }} gap={2} mt={4} mr={2} ml={4} >
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
          color={'#000'}
        >
          {title}
        </Text>
        {title === "Resigned Employees" && (
          <Text
            fontFamily="Poppins"
            fontSize="14px"
            fontWeight={600}
            color="#1F3661"
            // ml={12}
            ml={{ base: 20, sm: 4, md: 6, lg: 12 }}
            cursor="pointer"
            _hover={{
              textDecoration: "underline",
            }}
            whiteSpace="nowrap"
            onClick={() => navigate("/employee/resigned")}
          >
            View List
          </Text>
        )}
      </Flex>

      <Flex align="center" justify="space-between" pt={3} mr={2} ml={4} mb={2}>
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
          {/* Arrow icon only if there is an actual change */}
          {!isNoChange && (
            <Box
              as={isUp ? TrendingUp : TrendingDown}
              size={22}
              color={isUp ? "#16a34a" : "#ef4444"}
            />
          )}

          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="medium"
            color={getPercentageColor()}
          >
            {getPercentageText()}
          </Text>

          <Text fontSize={{ base: "xs", md: "sm" }} color="#000000">
            than last month
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};
