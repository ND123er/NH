// components/Reports/ReportPagination.jsx

import React from "react";
import {
  Flex,
  Select,
  Text,
  Button,
} from "@chakra-ui/react";

export default function ReportPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}) {
  // No data = no pagination controls
  if (!total || totalPages <= 1) {
    return null;
  }

  return (
    <Flex
      justify="space-between"
      align="center"
      mt={3}
      px={2}
      py={2}
      fontFamily="Poppins"
      wrap="wrap"
      gap={3}
    >
      <Text
        fontSize="13px"
        color="#757575"
      >
        Total Records: {total}
      </Text>

      <Flex align="center" gap={2}>
        <Text fontSize="13px">
          Rows
        </Text>

        <Select
          value={limit}
          onChange={(e) =>
            onLimitChange(Number(e.target.value))
          }
          w="80px"
          h="35px"
          fontSize="13px"
          borderRadius="8px"
          borderColor="#cccccc"
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </Select>

        <Button
          size="sm"
          variant="outline"
          isDisabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Text fontSize="13px">
          {page} / {totalPages}
        </Text>

        <Button
          size="sm"
          variant="outline"
          isDisabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
}