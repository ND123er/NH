import React from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";

export default function AddContactStatusForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    // TODO: API call here
    reset();
  };

  return (
    <Box bg="white" borderRadius="lg" p={6} boxShadow="sm" w={'100%'} mt={2} border={'1px solid #e1e8f0'}>      <BreadcrumbsNav />
      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add Emergency Contacts
        </Box>
        <Flex gap={4}>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="full"
            _hover={{ bg: "blue.800" }}
            size="md"
            type="submit"
            form="add-contact-form"
            mr={2}
          >
            Save
          </Button>
          <Button
            bg="White"
            borderRadius="full"
            _hover={{ bg: "blue.800", color: "white" }}
            border={"1px solid #1A365D"}
            size="md"
            variant="outline"
            type="button"
            mr={2}
            onClick={() => { reset(); }}
          >
            Save & new
          </Button>
          <Button type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Flex>
      </Flex>
      <form id="add-contact-form" onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={4} mb={4}>
          <FormControl>
            <FormLabel>Emergency contact relationship*</FormLabel>
            <Input
              placeholder="Enter emergency contact relationship"
              {...register("emergencyContactStatus", { required: true })}
            />
          </FormControl>
        </Flex>
      </form>
    </Box>
  );
}