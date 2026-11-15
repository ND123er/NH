import React, { useState } from "react";
import { Box, Flex, Heading, Collapse, IconButton, Divider } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, EditIcon } from "@chakra-ui/icons";
import EducationDetails from "./components/EducationDetails";
import PrevExperience from "./components/PrevExperience";

// store component references so we can inject props when rendering
const sections = [
  { key: "education", label: "Education Details", component: EducationDetails },
  { key: "experience", label: "Previous Experience", component: PrevExperience },
];

export default function EducationDetailSection({ isViewMode = false, isEditing = true, setIsEditing = () => { } }) {
  const [open, setOpen] = useState("education");

  const handleToggle = (key) => {
    setOpen((prev) => (prev === key ? null : key));
  };

  return (
    <Box height="70vh"
      overflowY="auto"
      pb={10}
      // py={2}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}>
      {sections.map((section) => (
        <Box
          key={section.key}
          mb={4}
          fontFamily={"Poppins"}
          borderRadius={"14px"}
          bg={"white"}
          borderWidth="1.5px"
          borderColor="#e1e8f0"
          overflow="hidden"
        >
          <Flex
            align="center"
            justify="space-between"
            py={3}
            px={2}
            borderRadius={0}
            bg="transparent"
            cursor="pointer"
            onClick={() => handleToggle(section.key)}
          >
            <Flex align="center" gap={2} ml={4} pt={2}>
              <Heading fontSize="23px" fontFamily="Poppins, sans-serif" fontWeight={'600'} color={'#000'}>{section.label}</Heading>
              {/* show edit icon when viewing existing employee */}
              {isViewMode && (
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  aria-label={`Edit ${section.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                />
              )}
            </Flex>
            <IconButton
              icon={open === section.key ? <ChevronUpIcon boxSize={7} /> : <ChevronDownIcon boxSize={7} />}
              size="lg"
              variant="ghost"
              aria-label="Toggle section"
            />
          </Flex>
          <Collapse in={open === section.key} animateOpacity>
            <Box p={4}>{React.createElement(section.component, { isViewMode, isEditing, setIsEditing })}</Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}