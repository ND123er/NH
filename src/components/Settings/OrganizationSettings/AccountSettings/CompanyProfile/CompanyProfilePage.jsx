import React, { useEffect } from "react";
import {
  Box,
  Icon,
  VStack,
  HStack,
  Text,
  Divider,
  Spacer,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";

const Row = ({ label, onClick }) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      as="button"
      onClick={onClick}
      textAlign="left"
      w="100%"
      _hover={{ bg: hoverBg }}
      px={{ base: 4, md: 6 }}
      py={5}
      borderBottom="1px solid"
      borderColor="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
    >
      <Text /*fontSize="md"*/ fontSize={{ base: 'sm', sm: 'sm', md: 'md', lg: 'md' }} >{label}</Text>
      <Icon as={ChevronRightIcon} boxSize={5} />
    </Box>
  );
};

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <Box
      bg="white"
      borderRadius="14px"
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      boxShadow="sm"
      w="100%"
      // mt={2}
      border="1px solid #e1e8f0"
      fontFamily={'Poppins'}
      mt={{ base: '9.1vh', sm: '7.4vh', md: '6.3vh', lg: 3 }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
    >
      <BreadcrumbsNav />

      {/* Inner card */}
      <Box
        borderRadius="10px"
        border="1px solid #e0e0e0"
        p={{ base: 4, md: 8 }}
        mt={4}
        bg="white"
      >
        {/* Header row with title */}
        <HStack justifyContent="space-between" alignItems="center" mb={2}>
          <Text fontWeight="bold" /*fontSize="xl"*/ fontSize={{ base: 'sm', sm: 'md', md: 'xl', lg: 'xl' }} fontFamily='poppins'>
            Company Profile
          </Text>
        </HStack>

        {/* dashed divider like the screenshot */}
        <Divider borderStyle="dashed" borderColor="gray.200" my={4} />

        {/* The list of sections */}
        <VStack spacing={0} align="stretch">
          <Row
            label="General details"
              // fontSize="16px"
            onClick={() => navigate("add-general-details")}
          />
          <Row
            label="Subscription details"
            onClick={() => navigate("add-subscription-details")}
          />
          <Row
            label="Address details"
            onClick={() => navigate("add-address-details")}
          />
        </VStack>
      </Box>
    </Box>
  );
}

