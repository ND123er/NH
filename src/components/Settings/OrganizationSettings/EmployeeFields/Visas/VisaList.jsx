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

const visaStatus = [
  { name: "Joe", employees: "04/01/1975" },
  { name: "Joe", employees: "04/01/1975" },
  { name: "Joe", employees: "04/01/1975" },
];

export default function VisaStatusList() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

  }, []);

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" border={'1px solid #e1e8f0'} p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
      mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}>
      <BreadcrumbsNav />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
          Visas
        </Box>
        <Button
          bg="blue.900"
          color="white"
          borderRadius="full"
          _hover={{ bg: "blue.800" }}
          size="md"
          onClick={() => navigate("add-visa")}
        >
          Add
        </Button>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            {/* <Th></Th> */}
            <Th>Type of Visa</Th>
            <Th>Number of employees</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {visaStatus.map((m, idx) => (
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
