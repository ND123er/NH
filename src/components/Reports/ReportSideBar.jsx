

import React, { useState } from "react";
import { Box, Text, VStack, Button, Input, Flex } from "@chakra-ui/react";

export default function ReportSidebar({
  groups = [],
  selectedReport,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      reports: group.reports.filter((report) =>
        report.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.reports.length > 0);

  const totalReports = groups.reduce(
    (total, group) => total + group.reports.length,
    0
  );

  return (
    <Box
      w="100%"
      h="76vh"
      bg="white"
      border="1px solid #cccccc"
      borderRadius="12px"
      p={1.5}
      fontFamily="Poppins"
      flexShrink={0}
    >
      {/* Header */}
      <Flex
        px={1.5}
        pt={0.5}
        pb={2}
        align="center"
        gap={2}
      >
        <Text
          fontSize="14px"
          fontWeight="600"
          color="#334155"
        >
          Report Library
        </Text>

        <Box
          bg="#F1F5F9"
          border="1px solid #D8E0E8"
          borderRadius="4px"
          px="5px"
          py="1px"
        >
          <Text
            fontSize="14px"
            fontWeight="500"
            color="#64748B"
          >
            {totalReports}
          </Text>
        </Box>
      </Flex>

      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Find a report..."
        h="30px"
        px={2}
        mb={2.5}
        border="1px solid #D9E0E8"
        borderRadius="6px"
        fontFamily="Poppins"
        fontSize="10px"
        color="#334155"
        _placeholder={{
          color: "#94A3B8",
        }}
        _focus={{
          borderColor: "#CBD5E1",
          boxShadow: "none",
        }}
      />

      {/* Reports */}
      <Box
        maxH="calc(76vh - 85px)"
        overflowY="auto"
        overflowX="hidden"
        sx={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <VStack align="stretch" spacing={0}>
          {filteredGroups.map((group) => (
            <React.Fragment key={group.key}>
              {/* Group heading */}
              <Flex
                px={1.5}
                pt={1.5}
                pb={1}
                justify="space-between"
                align="center"
              >
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color="#64748B"
                  letterSpacing="0.5px"
                  textTransform="uppercase"
                  mb={3}
                >
                  {group.label || group.name || group.key}
                </Text>

                <Text
                  fontSize="8px"
                  fontWeight="600"
                  color="#64748B"
                >
                  {group.reports.length} REPORTS
                </Text>
              </Flex>

              {group.reports.map((report) => {
                const active =
                  selectedReport === `${group.key}/${report.key}`;

                return (
                  <Button
                    key={report.key}
                    justifyContent="flex-start"
                    textAlign="left"
                    whiteSpace="normal"
                    h="27px"
                    minH="27px"
                    mb="10px"
                    px={1.5}
                    borderRadius="5px"
                    borderLeft={active ? "3px solid #3B73B9" : "3px solid transparent"}
                    fontFamily="Poppins"
                    fontSize="13px"
                    lineHeight="1.3"
                    fontWeight={active ? "600" : "400"}
                    bg={active ? "#EAF2FB" : "transparent"}
                    color={active ? "#315F91" : "#475569"}
                    _hover={{
                      bg: "#F1F5F9",
                    }}
                    onClick={() =>
                      onSelect(`${group.key}/${report.key}`)
                    }
                  >
                    {report.label}
                  </Button>
                );
              })}
            </React.Fragment>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}