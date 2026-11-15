import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useForm, FormProvider } from "react-hook-form";
import { updateEmployee } from "../../../../api/employee";
import { useFormContext } from "react-hook-form";

export default function DependentDetails() {
  const [dependents, setDependents] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm();
  const { register, handleSubmit, reset } = methods;
  const methods2 = useFormContext();
  const { getValues } = methods2;

  const onSubmit = (data) => {
    const newList = [...dependents, data];

    // determine employee identifier
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description: "Please save basic information before adding dependents.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    // call update API with full dependents array
    updateEmployee(idToUse, { dependent_details: newList }, opts)
      .then((res) => {
        setDependents(newList);
        toast({
          title: "Dependent Added",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        reset(); // clear form
        onClose(); // close modal
      })
      .catch((err) => {
        console.error("Add dependent failed", err);
        toast({
          title: "Add failed",
          description: err?.message || "Unable to add dependent",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  //Delete functionality -
  const handleDelete = (index) => {
    const newList = dependents.filter((_, i) => i !== index);

    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;

    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before deleting dependents.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    updateEmployee(idToUse, { dependent_details: newList }, opts)
      .then(() => {
        setDependents(newList);
        toast({
          title: "Dependent Deleted",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Delete dependent failed", err);
        toast({
          title: "Delete failed",
          description: err?.message || "Unable to delete dependent",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box p={4} border="1px solid #e2e8f0" borderRadius="md">
      <Flex justify="flex-end" align="center" mb={4}>
        <Button
          onClick={onOpen}
          color="white"
          backgroundColor="#1A365D"
          _hover={{ bg: "#153e75" }}
        >
          Add
        </Button>
      </Flex>

      {/* Dependents Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Relationship</Th>
            <Th>Gender</Th>
            <Th>Date of Birth</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dependents.map((dep, idx) => (
            <Tr key={idx} justifyContent={"center"}>
              <Td>{dep.name}</Td>
              <Td>{dep.relationship}</Td>
              <Td>{dep.gender}</Td>
              <Td>{dep.dob}</Td>
              <Td>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="ghost">
                    ...
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        /* TODO: Edit functionality */
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem color="red.500" onClick={() => handleDelete(idx)}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add Dependent Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader>Add Dependent</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired mb={3}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    {...register("name", { required: true })}
                    placeholder="Enter name"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Relationship</FormLabel>
                  <Input
                    {...register("relationship", { required: true })}
                    placeholder="Enter relationship"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input type="date" {...register("dob", { required: true })} />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    {...register("gender", { required: true })}
                    placeholder="Select gender"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </Select>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => reset()}>
                  Clear
                </Button>
                <Button
                  type="submit"
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </Box>
  );
}
