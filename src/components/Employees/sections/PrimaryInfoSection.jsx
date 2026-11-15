import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Collapse,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import BasicInfoSection from "./components/BasicInfoSection";
import ContactInfo from "./components/ContactInfo";
import DependentDetails from "./components/DependentDetails";
import VisaDetails from "./components/VisaDetails";

// store component reference (not JSX) so we can inject props when rendering
const sections = [
  { key: "basic", label: "Basic Information", component: BasicInfoSection },
  { key: "contact", label: "Contact Information", component: ContactInfo },
  // {
  //   key: "dependent",
  //   label: "Dependent Details",
  //   component: <DependentDetails />,
  // },
  // { key: "visa", label: "Visa Details", component: <VisaDetails /> },
];

export default function PrimaryInfoSection({
  isViewMode = false,
  isEditing = true,
}) {
  // allow multiple sections to be opened independently
  const [open, setOpen] = useState(["basic"]);

  // manage per-subsection editing locally so Basic and Contact act independently
  const [editingState, setEditingState] = useState({
    basic: Boolean(isEditing),
    contact: Boolean(isEditing),
  });

  const handleToggle = (key) => {
    setOpen((prev) => {
      if (!Array.isArray(prev)) prev = prev ? [prev] : [];
      return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    });
  };

  return (
    <Box
      // height="68vh"
      height={{ base: '50vh', sm: '62vh', md: '60vh', lg: '68Vh' }}
      overflowY="auto"
      // py={2}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
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
            px={{ base: 0, md: 2 }}
            borderTopRadius={"10px"}
            bg="#ffffff"
            cursor="pointer"
            onClick={() => handleToggle(section.key)}
            borderBottom={open.includes(section.key) ? "1px solid transparent" : "none"}
            sx={
              open.includes(section.key)
                ? {
                  borderImage:
                    "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
                }
                : {}
            }
          >
            <Flex align="center" gap={2}>
              <Heading fontSize="23px" fontFamily="Poppins, sans-serif" pl={4} fontWeight={'600'} color={'#000'}>
                {section.label}
              </Heading>

              {(section.key === "basic" || section.key === "contact") &&
                isViewMode && (
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    aria-label={
                      section.key === "basic"
                        ? "Edit Basic Information"
                        : "Edit Contact Information"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingState((prev) => ({ ...prev, [section.key]: true }));
                    }}
                  />
                )}
            </Flex>

            <IconButton
              icon={open.includes(section.key) ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="lg"
              variant="ghost"
              aria-label="Toggle section"
            />
          </Flex>
          <Collapse in={open.includes(section.key)} animateOpacity >
            <Box p={4}>
              {React.createElement(section.component, {
                isViewMode,
                isEditing: editingState[section.key],
                setIsEditing: (val) => setEditingState((prev) => ({ ...prev, [section.key]: val })),
              })}
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}
