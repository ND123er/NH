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
import { useFormContext } from "react-hook-form";
import { updateEmployee } from "../../../../api/employee";

export default function CompensationDetails() {
  const [compensation, setCompensation] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm();
  const { register, handleSubmit, reset } = methods;
  const methods2 = useFormContext();
  const { getValues } = methods2;

  const onSubmit = (data) => {
    const newList = [...compensation, data];

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
          "Please save basic information before adding education details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    // update employee api call
    updateEmployee(idToUse, { compensation_details: newList }, opts)
      .then(() => {
        setCompensation(newList);
        toast({
          title: "Compensation Details Added",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        reset();
        onClose();
      })
      .catch((err) => {
        console.error("Adding Compensation Details failed", err);
        toast({
          title: "Add failed",
          description: err?.message || "Unable to add Compensation Details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  //Delete functionality -
  const handleDelete = (index) => {
    const newList = compensation.filter((_, i) => i !== index);
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
          "Please save basic information before deleting education details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };

    updateEmployee(idToUse, { compensation_details: newList }, opts)
      .then(() => {
        setCompensation(newList);
        toast({
          title: "Compensation Details Deleted",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Delete Compensation Details failed", err);
        toast({
          title: "Delete failed",
          description: err?.message || "Unable to delete Compensation Details",
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

      {/* Compensation Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Effective from</Th>
            <Th>Pay rate</Th>
            <Th>Pay Schedule</Th>
            <Th>Pay type</Th>
            <Th>Overtime</Th>
            <Th>Reason</Th>
            <Th>Comment</Th>
          </Tr>
        </Thead>
        <Tbody>
          {compensation.map((v, idx) => (
            <Tr key={idx} justifyContent={"center"}>
              <Td>{v.effective}</Td>
              <Td>{v.rate}</Td>
              <Td>{v.schedule}</Td>
              <Td>{v.type}</Td>
              <Td>{v.overtime}</Td>
              <Td>{v.reason}</Td>
              <Td>{v.comment}</Td>
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

      {/* Add compensation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader>Add compensation Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired mb={3}>
                  <FormLabel>Effective from</FormLabel>
                  <Input
                    type="date"
                    {...register("effective", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Currency</FormLabel>
                  <Input
                    {...register("currency", { required: true })}
                    placeholder="Enter Currency"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Pay rate</FormLabel>
                  <Input
                    {...register("rate", { required: true })}
                    placeholder="pay rate"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Duration</FormLabel>
                  <Input
                    {...register("duration", { required: true })}
                    placeholder="Duration"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Pay Schedule</FormLabel>
                  <Input
                    {...register("schedule", { required: true })}
                    placeholder="Pay Schedule"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Pay Type</FormLabel>
                  <Input
                    {...register("type", { required: true })}
                    placeholder="Pay Type"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Overtime</FormLabel>
                  <Input
                    {...register("overtime", { required: true })}
                    placeholder="Overtime"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Compensation Reason</FormLabel>
                  <Input
                    {...register("reason", { required: true })}
                    placeholder="Enter compensation Reason"
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Comment</FormLabel>
                  <Input
                    {...register("comment", { required: true })}
                    placeholder="Enter Your Comment"
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
