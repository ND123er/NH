import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { useEffect } from "react";

const documentStatus = [
  { name: "Joe", employees: 2 },
  { name: "Joe", employees: 3 },
  { name: "Joe", employees: 4 },
];

export default function EmpDocumentList() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
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
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <BreadcrumbsNav />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box
          fontWeight="bold"
          fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
          fontFamily="poppins"
          mb={{ base: 3, md: 0 }}
        >
          Employee Documents
        </Box>
        <Button
          bg="blue.900"
          color="white"
          borderRadius="full"
          _hover={{ bg: "blue.800" }}
          size="md"
          onClick={() => navigate("add-document")}
        >
          Add
        </Button>
      </Box>

      <Box flex="1" minH="0" overflowY="auto">
        <Box display={{ base: "block", md: "none" }}>
          {documentStatus.map((m, idx) => (
            <Box
              key={idx}
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
                <Box fontSize="sm" fontWeight="600" mb={1}>
                  Employee Document
                </Box>
                <Box fontSize="sm" color="gray.700">
                  {m.name}
                </Box>
              </Box> */}
              <Flex justify="space-between" align="center" mt={5} mb={1}>
                <Text fontSize="sm" fontWeight="600">
                  Employee Document:
                </Text>
                <Text fontSize="sm">
                  {m.name}
                </Text>
              </Flex>

              {/* <Box mt={4}>
                <Box fontSize="sm" fontWeight="600" mb={1}>
                  Number of employees
                </Box>
                <Box fontSize="sm" color="gray.700">
                  {m.employees}
                </Box>
              </Box> */}
              <Flex justify="space-between" align="center" mt={1} mb={1}>
                <Text fontSize="sm" fontWeight="600">
                  Number of employees:
                </Text>
                <Text fontSize="sm">
                  {m.employees}
                </Text>
              </Flex>
            </Box>
          ))}
        </Box>

        <Box display={{ base: "none", md: "block" }}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Employee Document</Th>
                <Th>Number of employees</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {documentStatus.map((m, idx) => (
                <Tr key={idx}>
                  <Td>{m.name}</Td>
                  <Td>{m.employees}</Td>
                  <Td>
                    <IconButton
                      icon={<span>&#8226;&#8226;&#8226;</span>}
                      size="sm"
                      variant="ghost"
                      aria-label="actions"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
