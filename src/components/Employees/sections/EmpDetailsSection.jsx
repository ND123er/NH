import React from "react";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Avatar,
  Button,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

export default function EmpDetailsSection() {
  const methods = useFormContext();
  const { register, getValues, resetField } = methods;
  const toast = useToast();

  const sectionFields = [
    "jobTitle",
    "department",
    "joiningDate",
    "empType",
    "manager",
    "probetion",
    "workLocation"
  ];

  const handleClear = () => {
    sectionFields.forEach((field) => resetField(field));
  };

  const handleSave = () => {
    const values = getValues(sectionFields);
    // can call an API or just show a toast/console log
    toast({
      title: "Employee Details Saved!",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Box>
        <SimpleGrid columns={2} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Job Title</FormLabel>
            <Input
              {...register("jobTitle", { required: true })}
              placeholder="Enter Job Title"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Department</FormLabel>
            <Input {...register("department")} placeholder="Enter Department" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Date Of Joining</FormLabel>
            <Input
              type="date"
              {...register("joiningDate", { required: true })}
              placeholder="dd/mm/yyyy"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Employement Type</FormLabel>
            <Input {...register("empType", { required: true })} placeholder="Enter Employment Type" />
          </FormControl>
          <FormControl>
            <FormLabel>Reporting Manager</FormLabel>
            <Input
              {...register("manager")}
              placeholder="Enter phone number"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Probation Period End Date</FormLabel>
            <Input
              {...register("probetion")}
              placeholder="Enter Probation Period End Date"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Work Location</FormLabel>
            <Input
              {...register("workLocation", { required: true })}
              placeholder="Enter Work Location"
            />
          </FormControl>
        </SimpleGrid>
      </Box>
      <Flex justify="flex-end" gap={2} mt={4}>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button color="white" backgroundColor="#1A365D" _hover={{ bg: '#153e75' }} onClick={handleSave}>
          Save
        </Button>
      </Flex>
    </Box>
  );
}
