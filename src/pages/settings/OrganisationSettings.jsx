// Settings.jsx
import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Divider,
  Icon,
  Container,
  Heading,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const AccountSettings = [
  { label: "Company Profile", path: "/settings/organization/account/company-profile" },
  { label: "Office Locations", path: "/settings/organization/account/office-locations" },
  { label: "Billing Notifications", path: "/settings/organization/account/billing-notifications" },
  { label: "Theme Settings", path: "/settings/organization/account/theme" },
  { label: "Roles", path: "/settings/organization/account/roles" },
  { label: "Email Notifications", path: "/settings/organization/account/email-notifications" },
];

const EmployeeFields = [
  { label: "Department", path: "/settings/organization/employee/department" },
  { label: "Marital Status", path: "/settings/organization/employee/marital-status" },
  { label: "Visas", path: "/settings/organization/employee/visas" },
  { label: "Qualifications", path: "/settings/organization/employee/qualifications" },
  { label: "Divisions", path: "/settings/organization/employee/divisions" },
  {
    label: "Emergency Contacts",
    path: "/settings/organization/employee/emergency-contacts",
  },
  { label: "Designation", path: "/settings/organization/employee/designation" },
  { label: "Nationalities", path: "/settings/organization/employee/nationalities" },
  { label: "Reason for exit", path: "/settings/organization/employee/reason-for-exit" },
  { label: "Employment types", path: "/settings/organization/employee/employment-types" },
  {
    label: "Dependency relationship",
    path: "/settings/organization/employee/dependency-relationship",
  },
  { label: "Bands", path: "/settings/organization/employee/bands" },
  {
    label: "Compensation Change reasons",
    path: "/settings/organization/employee/comp-change-reasons",
  },
  { label: "Employee Documents", path: "/settings/organization/employee/documents" },
];

const AssetFields = [
  { label: "Asset categories", path: "/settings/organization/asset-fields/categories" },
  { label: "Vendors", path: "/settings/organization/asset-fields/vendors" },
  { label: "Brands", path: "/settings/organization/asset-fields/brands" },
];

const AnnouncementFields = [
  { label: "Announcements", path: "/settings/organization/announcements/announcements" },
];

function SectionCard({ title, items, onRowClick }) {
  return (
    <Box
      bg="white"
      border="1px solid #e1e8f0"
      borderRadius="14px"
      overflow="hidden"
      boxShadow="sm"
    >
      <Box px={4} py={3}>
        <Text fontSize="md" fontWeight="600" fontFamily='poppins'>
          {title}
        </Text>
      </Box>

      <Divider />

      <VStack spacing={0} align="stretch">
        {items.map((it, idx) => (
          <Flex
            key={it.label + idx}
            align="center"
            justify="space-between"
            px={4}
            py={3}
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            borderBottom={
              idx === items.length - 1 ? "none" : "1px solid #EDF2F7"
            }
            onClick={() => onRowClick && onRowClick(it)}
          >
            <Text fontSize="sm" fontFamily='poppins'>{it.label}</Text>
            <Icon as={ChevronRightIcon} w={5} h={5} color="gray.400" />
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const handleRowClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      console.warn("No path defined for this item:", item);
    }
  };

  return (
    <Box
      height="100%"
      overflowY="auto"
      py={3}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "transparent",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none"

      }}
      mt={{ base: '7.7vh', sm: '6.3vh', md: '6.3vh', lg: '0vh' }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
    >

      <Container maxW="100vw" px={-4}>
        <VStack spacing={3} align="stretch">
          <SectionCard
            title="Account settings"
            items={AccountSettings}
            onRowClick={handleRowClick}
          />

          <SectionCard
            title="Employee fields"
            items={EmployeeFields}
            onRowClick={handleRowClick}
          />

          <SectionCard
            title="Asset fields"
            items={AssetFields}
            onRowClick={handleRowClick}
          />

          <SectionCard
            title="Announcements"
            items={AnnouncementFields}
            onRowClick={handleRowClick}
          />
        </VStack>
      </Container>
    </Box>
  );
}
