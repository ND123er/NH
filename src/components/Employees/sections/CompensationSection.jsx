import React, { useState } from "react";
import { Box, Flex, Heading, Collapse, IconButton, Divider } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import PrevExperience from "./components/PrevExperience";
import BankAccDetails from "./components/BankAccDetails";
import CompensationDetails from "./components/CompensationDetails";

const sections = [
  { key: "bankAccount", label: "Bank Account Details", component: <BankAccDetails /> },
  { key: "compensationDetails", label: "Compensation Details", component: <CompensationDetails /> },
];

export default function CompensationSection() {
  const [open, setOpen] = useState("bankAccount");

  const handleToggle = (key) => {
    setOpen((prev) => (prev === key ? null : key));
  };

  return (
    <Box>
      {sections.map((section) => (
        <Box key={section.key} mb={4}>
          <Flex
            align="center"
            justify="space-between"
            py={3}
            px={2}
            borderTopRadius={"10px"}
            bg="#ffffff"
            cursor="pointer"
            onClick={() => handleToggle(section.key)}
          >
            <Heading fontSize="lg">{section.label}</Heading>
            <IconButton
              icon={open === section.key ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              aria-label="Toggle section"
            />
          </Flex>
          <Collapse in={open === section.key} animateOpacity>
            <Box p={4}>{section.component}</Box>
          </Collapse>
          <Divider />
        </Box>
      ))}
    </Box>
  );
}