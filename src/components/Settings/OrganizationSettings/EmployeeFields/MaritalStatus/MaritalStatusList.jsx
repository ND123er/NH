import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Text,
  Tfoot,
  Flex,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function MaritalStatusList() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const orgId =
    (typeof getOrgCode === "function" && getOrgCode()) ||
    (typeof window !== "undefined" && localStorage.getItem("org_code"))

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      // API: /api/v1/hrm/settings/get_marital_status?org_id=HRMS000017
      const res = await api.get(`/settings/get_marital_status`, {
        params: { org_id: orgId },
      });

      // response shape: { success: true, count: 5, data: [ ... ] }
      const data = res?.data?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch marital status list", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load marital status list"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        boxShadow="sm"
        p={{ base: 2, sm: 2, md: 3, lg: 6 }}
        h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
        mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
        w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
        ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
        border={"1px solid #cccccc"}
        fontFamily={'Poppins'}
        display="flex"
        flexDirection="column"
      >
        <BreadcrumbsNav />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          flexShrink={0}
        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Marital Status
          </Box>
        </Box>

        <Box flex="1" overflowY="auto" sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
        }}>
          {loading ? (
            <Center py={12}>
              <Spinner size="lg" />
            </Center>
          ) : error ? (
            <Box py={6}>
              <Text color="red.500">Error: {error}</Text>
            </Box>
          ) : items.length === 0 ? (
            <Box py={6}>
              <Text color="gray.600">No marital statuses found.</Text>
            </Box>
          ) : (
            <TableContainer h="100%" overflowY="auto" sx={{
              "&::-webkit-scrollbar": {
                width: "0px",
              },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}>
              <Table variant="simple">
                <Thead
                  sx={{
                    th: {
                      fontSize: "14px",
                      textTransform: "none",
                      fontWeight: "600",
                      fontFamily: "'Poppins', sans-serif",
                      color: "#000000",
                    },
                  }}
                >
                  <Tr>
                    {/* <Th></Th> */}
                    <Th>Marital Status</Th>
                    <Th>Number of employees</Th>
                    {/* <Th>Action</Th> */}
                  </Tr>
                </Thead>
                <Tbody>
                  {items?.map((m) => (
                    <Tr key={m._id}>
                      {/* <Td>
                  <IconButton
                    icon={<span>&#8801;</span>}
                    size="sm"
                    variant="ghost"
                    aria-label="drag"
                  />
                </Td> */}
                      <Td>{m.name || "-"}</Td>
                      <Td>{typeof m.employee_count !== "undefined" ? m.employee_count : 0}</Td>
                      {/* <Td>
                  <Flex gap={2}>
                    <IconButton
                      aria-label="edit"
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`edit-marital-status/${m._id}`)}
                      icon={<EditIcon />}
                    />
                    <IconButton
                      aria-label="delete"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        // simple confirm before delete — you'll want to replace with a proper modal
                        window.confirm("Are you sure you want to delete this status?") &&
                        // placeholder - replace with actual delete API call
                      }
                      icon={<DeleteIcon />}
                    />
                    <IconButton
                      icon={<span>•••</span>}
                      size="sm"
                      variant="ghost"
                      aria-label="more"
                      onClick={() => navigate(`view-marital-status/${m._id}`)}
                    />
                  </Flex>
                </Td> */}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
}
