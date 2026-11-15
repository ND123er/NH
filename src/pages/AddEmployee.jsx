import { Box } from "@chakra-ui/react";
import AddEmployeeForm from "../components/Employees/AddEmployeeForm";

export default function AddEmployee() {
  return (
    <Box px={0} fontFamily="Poppins" w={{ base: "120%", md: "100%" }}>
        <AddEmployeeForm />
    </Box>
  );
}