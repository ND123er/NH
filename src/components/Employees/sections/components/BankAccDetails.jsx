import React, { useState } from "react";
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
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { updateEmployee } from "../../../../api/employee";

export default function BankAccDetails() {
  const methods = useFormContext();
  const { register, getValues, resetField } = methods;
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const sectionFields = [
    "bankName",
    "branch",
    "ifscCode",
    "accountNumber",
    "holderName",
    "accountType",
  ];

  const handleClear = () => {
    sectionFields.forEach((field) => resetField(field));
  };

  const handleSave = () => {
    // gather values for this section
    const values = getValues();

    const bankInfo = {};
    sectionFields.forEach((f) => {
      bankInfo[f] = values[f];
    });

    const dbId =
      getValues("employee_db_id") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null);
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before saving bank details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    const body = { bank_account_details: bankInfo };

    setIsSaving(true);

    // update employee api call
    updateEmployee(idToUse, body, opts)
      .then((res) => {
        toast({
          title: "Bank Account Details Saved!",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Bank account update error", err);
        const message =
          err?.message || err?.error || "Failed to update bank details";
        toast({
          title: "Save failed",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <Box mt={-4} mr={-4} ml={-4} p={4} bg="white" borderBottomRadius={'10px'}>
      <Box display="flex" gap={4}></Box>
      <Box>
        <SimpleGrid columns={2} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Bank name</FormLabel>
            <Select
              {...register("bankName", { required: true })}
              placeholder="Enter Bank name"
            >
              <option>SBI</option>
              <option>Bank Of India</option>
              <option>Axis Bank</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Branch</FormLabel>
            <Input {...register("branch", { required: true })} placeholder="Enter Branch" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>IFSC code</FormLabel>
            <Input
              {...register("ifscCode", { required: true })}
              placeholder="Enter ifsc code"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Account Number</FormLabel>
            <Input
              {...register("accountNumber", { required: true })}
              placeholder="Enter account number"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Account holder name</FormLabel>
            <Input
              {...register("holderName", { required: true })}
              placeholder="Account holder name"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Account Type</FormLabel>
            <RadioGroup>
              <Stack direction="row">
                <Radio
                  value="savings"
                  {...register("accountType", { required: true })}
                >
                  Savings Account
                </Radio>
                <Radio
                  value="current"
                  {...register("accountType", { required: true })}
                >
                  Current Account
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </SimpleGrid>
      </Box>
      <Flex justify="flex-end" gap={2} mt={4}>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button
          color="white"
          backgroundColor="#1A365D"
          _hover={{ bg: "#153e75" }}
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving"
        >
          Save
        </Button>
      </Flex>
    </Box>
  );
}
