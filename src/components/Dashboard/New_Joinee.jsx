import React from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const rows = [
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
  {
    employeeId: "1004859",
    fullName: "David Scotland",
    location: "London",
    jobTitle: "HR Admin",
    department: "Human Resources",
    role: "Admin",
    employmentType: "Trainee",
  },
];

const New_Joinee = () => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={4}  mt={3}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" fontFamily="'Poppins', sans-serif">
          New Joinees
        </Text>
        <IconButton
          aria-label="More"
          icon={<HamburgerIcon />}
          size="sm"
          variant="ghost"
        />
      </Flex>
      <Divider borderStyle="dashed" mb={3} />

      {/* Table */}
      <TableContainer
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
      >
        <Table size="sm" variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Employee ID
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Full Name
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Location
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Job Title
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Department
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Role
              </Th>
              <Th color="gray.600" fontSize="xs" fontFamily="'Poppins', sans-serif">
                Employment Type
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r, idx) => (
              <Tr key={`${r.employeeId}-${idx}`}>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.employeeId}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.fullName}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.location}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.jobTitle}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.department}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.role}
                </Td>
                <Td fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {r.employmentType}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default New_Joinee;
