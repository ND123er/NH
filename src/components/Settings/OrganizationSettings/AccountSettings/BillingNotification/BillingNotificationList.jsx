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
  Text,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import { useEffect } from "react";

const billingNotifications = [
  { firstName: "Kumkum", lastName: "Dutta", mail: "delo@gmail.com", phone: "9876543210", number: 2 },
  { firstName: "Kumkum", lastName: "Dutta", mail: "delo@gmail.com", phone: "9876543210", number: 2 },
  { firstName: "Kumkum", lastName: "Dutta", mail: "delo@gmail.com", phone: "9876543210", number: 2 },
];

export default function BillingNotificationList() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

  }, []);

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" w={'100%'} mt={2} border={'1px solid #e1e8f0'}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: '78vh', sm: '79vh', md: '80vh', lg: '85.5vh' }}
      mt={{ base: '9.1vh', sm: '7.5vh', md: '6.3vh', lg: 3 }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}>
      <BreadcrumbsNav />
      <Box
        borderRadius={"10px"}
        border={"1px solid #e0e0e0"}
        p={{ base: 2, sm: 2, md: 3, lg: 8 }}
        h={{ base: "68vh", sm: "72vh", md: "68vh", lg: "72vh" }}
        display="flex"
        flexDirection="column"
      >
        <Box
          display={{ base: 'block', md: 'flex' }}
          justifyContent={{ md: 'space-between' }}
          alignItems={{ md: 'center' }}
          mb={4}
          flexShrink={0}
        >
          <Box fontWeight="bold" fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins' mb={{ base: 3, md: 0 }}>
            Billing Notifications
          </Box>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="full"
            _hover={{ bg: "blue.800" }}
            size="md"
            onClick={() => navigate("add-billing-notification")}
            width={{ base: '100%', md: 'auto' }}
          >
            Add
          </Button>
        </Box>

        <Box flex="1" overflowY="auto">
          <Box display={{ base: 'block', md: 'none' }}>
            {billingNotifications.map((m, idx) => (
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
                <IconButton
                  icon={<span>•••</span>}
                  size="sm"
                  variant="ghost"
                  aria-label="actions"
                  position="absolute"
                  top={2}
                  right={2}

                />
                <Flex justify="space-between" align="center" mt={5} mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    First Name:
                  </Text>
                  <Text fontSize="sm">
                    {m.firstName}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Last Name:
                  </Text>
                  <Text fontSize="sm">
                    {m.lastName}
                  </Text>
                </Flex>
                {/* <Text fontSize="sm" mb={1}>
                  <Text as="span" fontWeight="600">Email ID:&nbsp;</Text>
                  {m.mail}
                </Text> */}
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Email ID:
                  </Text>
                  <Text fontSize="sm">
                    {m.mail}
                  </Text>
                </Flex>
                {/* <Text fontSize="sm" mb={1}>
                  <Text as="span" fontWeight="600">Phone number:&nbsp;</Text>
                  {m.phone}
                </Text> */}
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Phone number:
                  </Text>
                  <Text fontSize="sm">
                    {m.phone}
                  </Text>
                </Flex>
                {/* <Text fontSize="sm" mb={3}>
                  <Text as="span" fontWeight="600">Number:&nbsp;</Text>
                  {m.number}
                </Text> */}
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="600">
                    Number:
                  </Text>
                  <Text fontSize="sm">
                    {m.number}
                  </Text>
                </Flex>

              </Box>
            ))}
          </Box>

          <TableContainer display={{ base: 'none', md: 'block' }} maxH="100%" overflowY="auto">
            <Table
              variant="simple"
              sx={{
                thead: {
                  position: 'sticky',
                  top: 0,
                  background: 'white',
                  zIndex: 1,
                },
              }}
            >
              <Thead>
                <Tr>
                  {/* <Th></Th> */}
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Email ID</Th>
                  <Th>Phone number</Th>
                  <Th>Number</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {billingNotifications?.map((m, idx) => (
                  <Tr key={idx}>
                    {/* <Td>
                      <IconButton
                        icon={<span>&#8801;</span>}
                        size="sm"
                        variant="ghost"
                        aria-label="drag"
                      />
                    </Td> */}
                    <Td>{m.firstName}</Td>
                    <Td>{m.lastName}</Td>
                    <Td>{m.mail}</Td>
                    <Td>{m.phone}</Td>
                    <Td>{m.number}</Td>
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
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
