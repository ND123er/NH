
import React from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const PerformanceTableHeader = ({
  title,
  searchPlaceholder,
  onSearch,
  children,
}) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      flexWrap="wrap"
      gap={3}
      p={4}
    >
      <Text fontSize="20px" fontWeight="700" color="#000">
        {title}
      </Text>

      <Flex align="center" gap={3} flexWrap="wrap">
        <InputGroup size="sm" w={{ base: "100%", md: "230px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>

          <Input
            placeholder={searchPlaceholder}
            borderRadius="8px"
            borderColor="#cccccc"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </InputGroup>
        {children}
      </Flex>
    </Flex>
  );
};

export default PerformanceTableHeader;
