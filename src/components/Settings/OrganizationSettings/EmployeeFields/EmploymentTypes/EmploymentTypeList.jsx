import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Center,
  Text,
  Alert,
  AlertIcon,
  Flex,
} from "@chakra-ui/react";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { getOrgCode } from "../../../../../utils/token";
import api from "../../../../../api/axios";

export default function EmploymentTypeList() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmploymentTypes = async () => {

    try {
      setLoading(true);
      setError(null);
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      const url = `/settings/get_employment_types?org_id=${encodeURIComponent(
        orgId,
      )}`;
      const res = await api.get(url);
      const data = res?.data?.data || [];
      setTypes(data);
    } catch (err) {
      console.error("Failed to fetch employment types", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load employment types",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    fetchEmploymentTypes();
  }, []);

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: "78vh", sm: "70vh", md: "80vh", lg: "85.5vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
      w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
      ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      border="1px solid #e1e8f0"
      fontFamily="Poppins"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <BreadcrumbsNav />

      <Box
        borderRadius="10px"
        border="1px solid #e0e0e0"
        p={{ base: 4, md: 8 }}
        flex="1"
        minH="0"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Box
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ base: "stretch", md: "center" }}
          gap={3}
          mb={4}
        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Employment Types
          </Box>
        </Box>

        {loading ? (
          <Center py={10}>
            <Spinner size="lg" />
            <Text ml={3}>Loading employment types...</Text>
          </Center>
        ) : error ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box flex="1" minH="0" overflowY="auto">
            <Box display={{ base: "block", md: "none" }}>
              {types.length === 0 ? (
                <Box p={4} textAlign="center">
                  No employment types found.
                </Box>
              ) : (
                types.map((t) => (
                  <Box
                    key={t._id}
                    p={4}
                    mb={4}
                    border="1px solid #e0e0e0"
                    borderRadius="14px"
                    boxShadow="sm"
                    bg="white"
                    position="relative"
                  >
                    <Box position="absolute" top={2} right={2}>
                      <IconButton
                        icon={<span>&#8226;&#8226;&#8226;</span>}
                        size="sm"
                        variant="ghost"
                        aria-label="actions"
                      />
                    </Box>

                    {/* <Box mt={5}>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Employment type name
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {t.name || t.type || t.id || "-"}
                      </Text>
                    </Box> */}
                    <Flex justify="space-between" align="center" mt={5} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Employment type name:
                      </Text>
                      <Text fontSize="sm">
                        {t.name || t.type || t.id || "-"}
                      </Text>
                    </Flex>

                    {/* <Box mt={4}>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Number of employees
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {typeof t.employee_count === "number"
                          ? t.employee_count
                          : t.employee_count || 0}
                      </Text>
                    </Box> */}
                    <Flex justify="space-between" align="center" mt={1} mb={1}>
                      <Text fontSize="sm" fontWeight="600">
                        Number of employees:
                      </Text>
                      <Text fontSize="sm">
                        {typeof t.employee_count === "number"
                          ? t.employee_count
                          : t.employee_count || 0}
                      </Text>
                    </Flex>
                  </Box>
                ))
              )}
            </Box>

            <Box display={{ base: "none", md: "block" }}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      textTransform="none"
                      color="black"
                      pb="12px"
                    >
                      Employment type name
                    </Th>
                    <Th
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      textTransform="none"
                      color="black"
                      pb="12px"
                    >
                      Number of employees
                    </Th>
                    <Th
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      textTransform="none"
                      color="black"
                      pb="12px"
                    >
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {types.length === 0 ? (
                    <Tr>
                      <Td colSpan={3}>
                        <Text textAlign="center" py={4}>
                          No employment types found.
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    types.map((t) => (
                      <Tr key={t._id}>
                        <Td>{t.name || t.type || t.id || "-"}</Td>
                        <Td>
                          {typeof t.employee_count === "number"
                            ? t.employee_count
                            : t.employee_count || 0}
                        </Td>
                        <Td>
                          <IconButton
                            icon={<span>&#8226;&#8226;&#8226;</span>}
                            size="sm"
                            variant="ghost"
                            aria-label="actions"
                          />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
