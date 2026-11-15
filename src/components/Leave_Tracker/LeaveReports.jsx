import React from "react";
import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";

const LeaveReports = () => {
   return (
          <Flex
              minH="70vh"
              align="center"
              justify="center"
              // bg="gray.50"
              px={2}
                width={{ base: '100vw', sm: '100vw', md: '100%', lg: '100%' }}
          >
              <Box
                  textAlign="center"
                  // bg="white"
                  // p={10}
                  // borderRadius="lg"
                  // boxShadow="lg"
                  // maxW="700px"
                  // height='250px'
                  w="100%"
              >
                  <Icon
                      as={TimeIcon}
                      w={12}
                      h={12}
                      color="#233A63"
                      mb={4}
                  />
  
                  <Heading size="lg" mb={2}>
                      Coming Soon
                  </Heading>
  
                  <Text fontSize="md" color="gray.600">
                      Welcome! This section will be available soon.
                      We’re working to bring you new features.
                  </Text>
              </Box>
          </Flex>
      );
};

export default LeaveReports;
