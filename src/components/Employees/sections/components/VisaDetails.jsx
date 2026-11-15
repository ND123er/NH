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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useForm, FormProvider } from "react-hook-form";
import { updateEmployee } from "../../../../api/employee";
import { useFormContext } from "react-hook-form";

export default function VisaDetails() {
  const [visa, setVisa] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm();
  const { register, handleSubmit, reset } = methods;
  const methods2 = useFormContext();
  const { getValues } = methods2;

  const onSubmit = (data) => {
    const newList = [...visa, data];

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
          "Please save basic information before adding visa details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    updateEmployee(idToUse, { visa_details: newList }, opts)
      .then(() => {
        setVisa(newList);
        toast({
          title: "Visa Details Added",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        reset();
        onClose();
      })
      .catch((err) => {
        console.error("Add visa failed", err);
        toast({
          title: "Add failed",
          description: err?.message || "Unable to add visa details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  //Delete functionality -
  const handleDelete = (index) => {
    const newList = visa.filter((_, i) => i !== index);

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
          "Please save basic information before deleting visa details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    crossOriginIsolated.log(
      "dbId from VisaDetails:--->",
      dbId,
      "empCode from VisaDetails:--->:",
      empCode
    );

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    updateEmployee(idToUse, { visa_details: newList }, opts)
      .then(() => {
        setVisa(newList);
        toast({
          title: "Visa Deleted",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Delete visa failed", err);
        toast({
          title: "Delete failed",
          description: err?.message || "Unable to delete visa",
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

      {/* Visa Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Visa Type</Th>
            <Th>Issue In Country</Th>
            <Th>Issue Date</Th>
            <Th>Expiration Date</Th>
            <Th>Visa Number</Th>
            <Th>Passport Number</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {visa.map((v, idx) => (
            <Tr key={idx} justifyContent={"center"}>
              <Td>{v.visaType}</Td>
              <Td>{v.country}</Td>
              <Td>{v.issueDate}</Td>
              <Td>{v.expiryDate}</Td>
              <Td>{v.visaNumber}</Td>
              <Td>{v.passportNumber}</Td>
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

      {/* Add Visa Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader>Add Visa Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired mb={3}>
                  <FormLabel>Visa type</FormLabel>
                  <Input
                    {...register("visaType", { required: true })}
                    placeholder="Enter Visa Type"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Issue In Country</FormLabel>
                  <Input
                    {...register("country", { required: true })}
                    placeholder="Enter Issue In Country"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Issue Date</FormLabel>
                  <Input
                    type="date"
                    {...register("issueDate", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Expiration Date</FormLabel>
                  <Input
                    type="date"
                    {...register("expiryDate", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Visa Number</FormLabel>
                  <Input
                    {...register("visaNumber", { required: true })}
                    placeholder="Enter Visa Number"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Passport Number</FormLabel>
                  <Input
                    {...register("passportNumber", { required: true })}
                    placeholder="Enter Passport Number"
                  />
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
