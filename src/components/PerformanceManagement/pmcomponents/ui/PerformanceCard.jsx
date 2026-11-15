import { Box, Flex, Text } from "@chakra-ui/react";

export const PerformanceCard = ({
  icon: CardIcon,
  title,
  count,
  period,
  onViewList,
}) => {
  return (
    <Box
      w="100%"
      h="184px"
      border="1px solid #d5d5d5"
      borderRadius="16px"
      bg="white"
      fontFamily="Poppins"
    >
      <Flex align="center" justify="space-between" px={2} pt={2.5}>
        <Flex align="center" gap={1.5} minW={0}>
          {CardIcon && (
            <Box
              as={CardIcon}
              boxSize="20px"
              color="#444"
              strokeWidth={1.5}
              flexShrink={0}
            />
          )}
          <Text
            fontSize={{ base: "15px", md: "16px" }}
            fontWeight={600}
            lineHeight="1.2"
            color="#111"
            noOfLines={1}
          >
            {title}
          </Text>
        </Flex>

        {onViewList && (
          <Text
            as="button"
            type="button"
            onClick={onViewList}
            ml={2}
            color="#777"
            fontSize="13px"
            textDecoration="underline"
            whiteSpace="nowrap"
            _hover={{ color: "#222" }}
          >
            View List
          </Text>
        )}
      </Flex>

      <Flex align="flex-end" justify="space-between" h="calc(100% - 45px)" px={2} pb={1.5}>
        <Text
          fontFamily="Arial, sans-serif"
          fontSize={{ base: "56px", md: "62px" }}
          fontWeight={500}
          lineHeight="0.9"
          color="#050505"
        >
          {count}
        </Text>
        <Text
          mb={0.5}
          color="#777"
          fontSize="13px"
          whiteSpace="nowrap"
        >
          {period}
        </Text>
      </Flex>
    </Box>
  );
};
export default PerformanceCard;
