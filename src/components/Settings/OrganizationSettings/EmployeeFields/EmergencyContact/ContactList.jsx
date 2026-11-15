// src/pages/DepartmentsList.jsx
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { useEffect } from "react";

const ContactStatus = [
  { name: "father", employees: 0 },
  { name: "son", employees: 2 },
  { name: "mother", employees: 3 },
];

export default function ContactStatusList() {
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
      borderRadius="12px"
      // p={6}
      boxShadow="sm"
      // w={"100%"}
      // mt={3}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
      mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      border={"1px solid #cccccc"}
    >
      <BreadcrumbsNav />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
          Emergency Contacts
        </Box>
        {/* <Button
          bg="blue.900"
          color="white"
          borderRadius="full"
          _hover={{ bg: "blue.800" }}
          size="md"
          onClick={() => navigate("add-emergency-contact")}
        >
          Add
        </Button> */}
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            {/* <Th></Th> */}
            <Th
              fontFamily="Poppins, sans-serif"
              fontWeight={600}
              fontSize="14px"
              textTransform="none"
              color="black"
              pb="12px"
            >
              Emergency Contact
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
          {ContactStatus.map((m, idx) => (
            <Tr key={idx}>
              {/* <Td>
                <IconButton
                  icon={<span>&#8801;</span>}
                  size="sm"
                  variant="ghost"
                  aria-label="drag"
                />
              </Td> */}
              <Td>{m.name}</Td>
              <Td>{m.employees}</Td>
              <Td>
                <IconButton
                  icon={<span>•••</span>}
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
  );
}
