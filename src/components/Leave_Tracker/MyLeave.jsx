import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  Badge,
  useDisclosure,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import LeaveHistory from "./LeaveHistory";
import ApplyLeaveModal from "./ApplyLeaveModal";
import api from "../../api/axios";
import { getEmpCode, getOrgCode } from "../../utils/token";

export default function MyLeave() {
  const [showHistory, setShowHistory] = useState(false);
  const applyModal = useDisclosure();

  const [summary, setSummary] = useState({
    total_utilized: 0,
    leaves: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const emp = getEmpCode();
        const org = getOrgCode();
        const res = await api.get(
          `/leave/get_my_leave_summary?employee_id=${emp}&organisation_id=${org}`,
        );
        const data = res?.data ?? res;

        if (!mounted) return;

        setSummary({
          total_utilized: data?.total_utilized ?? 0,
          leaves: Array.isArray(data?.leaves) ? data.leaves : [],
        });
      } catch (err) {
        console.error("Failed to fetch leave summary:", err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();

    return () => {
      mounted = false;
    };
  }, []);

  if (showHistory) {
    return <LeaveHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <Box
      bg="white"
      border="1px solid #cccccc"
      borderRadius="12px"
      fontFamily="Poppins"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4} pl={4} pr={4} pt={4}>
        <Flex align="center" gap={3}>
          <Text fontSize="22px" fontWeight={600} letterSpacing="-0.03em">
            My Leaves
          </Text>
          <Badge
            border="1px solid #ccc"
            bg="white"
            p={3}
            borderRadius="6px"
            fontWeight={650}
            fontSize="12px"
            letterSpacing="-0.03em"
          >
            Total Utilized: {summary.total_utilized}
          </Badge>
        </Flex>

        <Flex gap={3}>
          <Button
            variant="outline"
            p={3}
            fontSize="14px"
            color="#757575"
            fontWeight={500}
            onClick={() => setShowHistory(true)}
          >
            View leave history
          </Button>
          <Button
            bg="#274167"
            color="white"
            p={3}
            fontSize="14px"
            fontWeight={500}
            _hover={{ bg: "blue.700" }}
            onClick={applyModal.onOpen}
          >
            Apply for Leave
          </Button>
        </Flex>
      </Flex>

      <Box
        h="1.5px"
        w="100%"
        bgImage="repeating-linear-gradient(
          to right,
          #C7C7C7 0 6px,
          transparent 6px 14px
        )"
        mb={4}
      />

      {/* Cards */}
      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner size="lg" />
        </Flex>
      ) : error ? (
        <Flex justify="center" py={8}>
          <Text color="red.500">Failed to load leave summary.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} pl={4} pr={4} pb={4}>
          {summary.leaves.map((l) => {
            const showTooltip =
              (l.locked_for_next_year ?? 0) > 0 || (l.encashed_days ?? 0) > 0;

            const card = (
              <Box
                key={l.leave_type_id || l.leave_name}
                bg="white"
                border="1.5px solid #D0D5DD"
                borderRadius="20px"
                overflow="hidden"
                transition="all 0.2s ease"
                _hover={{
                  boxShadow: showTooltip ? "md" : "none",
                  transform: showTooltip ? "translateY(-1px)" : "none",
                }}
              >
                <Box p={6}>
                  <Text fontSize="20px" fontWeight={500} color="#6B6B6B">
                    {l.leave_name}
                  </Text>

                  <Text fontSize="40px" fontWeight={600} lineHeight="1" mt={3}>
                    {l.available_now}
                  </Text>
                </Box>

                <Box h="1px" bg="#E5E7EB" />

                <Flex align="center" gap={4} p={5}>
                  <Box w="6px" h="36px" bg="#1A365D" borderRadius="full" />
                  <Text fontSize="md" color="#7A7A7A">
                    Accrued so far :
                    <Text as="span" fontWeight={700} color="black" ml={2}>
                      {l.accrued_so_far}
                    </Text>
                  </Text>
                </Flex>
              </Box>
            );

            if (!showTooltip) return card;

            return (
              <Tooltip
                key={l.leave_type_id || l.leave_name}
                placement="right" // preferred side
                hasArrow
                openDelay={200}
                closeDelay={100}
                gutter={12}
                bg="white"
                color="black"
                border="1px solid #E2E8F0"
                borderRadius="12px"
                boxShadow="lg"
                p={3}
                label={
                  <Box>
                    <Text fontSize="sm" fontWeight={600} mb={1}>
                      Leave Details
                    </Text>

                    {(l.locked_for_next_year ?? 0) > 0 && (
                      <Text fontSize="sm" color="gray.700">
                        Leaves Locked for Next Year:{" "}
                        <Text as="span" fontWeight={700} color="black">
                          {l.locked_for_next_year}
                        </Text>
                      </Text>
                    )}

                    {(l.encashed_days ?? 0) > 0 && (
                      <Text fontSize="sm" color="gray.700">
                        Encahsed Leaves:{" "}
                        <Text as="span" fontWeight={700} color="black">
                          {l.encashed_days}
                        </Text>
                      </Text>
                    )}
                  </Box>
                }
              >
                {card}
              </Tooltip>
            );
          })}
        </SimpleGrid>
      )}

      <ApplyLeaveModal
        isOpen={applyModal.isOpen}
        onClose={applyModal.onClose}
      />
    </Box>
  );
}
