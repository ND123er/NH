// src/components/Dashboard/employee/MyTasks.jsx
import React from "react";
import { Box, Text, Checkbox, VStack, Button, Flex } from "@chakra-ui/react";

const sampleTasks = [
  { id: 1, text: "Approve asset handover" },
  { id: 2, text: "Submit weekly timesheet" },
  { id: 3, text: "Complete performance self-review" },
  { id: 4, text: "Approve asset handover" },
];

export default function MyTasks() {
  return (
    <Box
    
      pb={5}
      borderWidth="1px"
      borderRadius="16px"
      bg="white"
      border="1px solid #cccccc"
      // height={'300px'}
    >
      <Flex justify="space-between" align="center" pb={3} pl={5} pr={5} pt={3} >
        <Text fontWeight="600" fontSize={'18px'}>My Tasks</Text>
        {/* <Button size="sm" variant="ghost">
          More
        </Button> */}
        <Button borderRadius={'10px'} borderWidth={'0px'} variant="outline" bg={'#274167'} color={'white'} _hover={{ bg: '#1F3661' }} width={'142px'} height={'36px'} fontSize={'14px'} fontWeight={400}>
          View All Tasks
        </Button>
      </Flex>
      <Box
        w="100%"
        h="1px"
        bgImage="repeating-linear-gradient(
          to right,
          #C7C7C7 0 6px,
          transparent 6px 14px
        )"
        mb={4}
      />

      {/* <VStack align="stretch" spacing={3} pl={5} pr={5}>
        {sampleTasks.map((t) => (
          <Checkbox key={t.id}>{t.text}</Checkbox>
        ))}
      </VStack> */}
      <VStack align="stretch" spacing={3} pl={5} pr={5}>
        {sampleTasks.map((t) => (
          <Checkbox
            key={t.id}
            sx={{
              ".chakra-checkbox__label": {
                fontSize: "16px",
                fontFamily: "Poppins",
                fontWeight: 400,
              },
            }}
          >
            {t.text}
          </Checkbox>
        ))}
      </VStack>


      {/* <Flex justify="flex-end" mt={4}>
        <Button size="sm" variant="outline">
          View All Tasks
        </Button>
      </Flex> */}
    </Box>
  );
}
