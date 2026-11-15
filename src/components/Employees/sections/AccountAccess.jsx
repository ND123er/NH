import React from "react";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  useToast,
  Switch,
} from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

export default function AccountAccess() {
  const methods = useFormContext();
  const { register, getValues, resetField } = methods;
  const toast = useToast();

  const sectionFields = ["userName", "password", "role", "status"];

  const handleClear = () => {
    sectionFields.forEach((field) => resetField(field));
  };

  const handleSave = () => {
    const values = getValues(sectionFields);
    // can call an API or just show a toast/console log
    toast({
      title: "Account Details Saved!",
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
              {...register("userName", { required: true })}
              placeholder="Username"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              {...register("password", { required: true })}
              placeholder="Enter Temporary Password"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Role / Access Level</FormLabel>
            <Input
              {...register("role", { required: true })}
              placeholder="Enter Role"
            />
          </FormControl>
          <br />
          <FormControl isRequired>
            <Flex align="center" justify="space-between">
              <Box>
                <FormLabel>Status</FormLabel>
                <Box fontSize="sm" color="gray.500">
                  Enable to activate the employee's account and grant access to
                  the system.
                </Box>
              </Box>
              <Switch
                {...register("status", { required: true })}
                colorScheme="green"
                onChange={(e) =>
                  methods.setValue(
                    "status",
                    e.target.checked ? "Active" : "Inactive"
                  )
                }
              />
            </Flex>
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
