import { useState } from "react";
import { Flex, Text, Image, Box } from "@chakra-ui/react";
import active_admin from "../../assets/active_admin.png";
import employee_inactive from "../../assets/employee_inactive.png";
import inactive_admin from "../../assets/inactive_admin.png";
import employee_active2 from "../../assets/employee_active2.png";

export default function ToggleButton() {
  const [active, setActive] = useState("admin");

  return (
    <Flex
      bg="#f4f4f4"
      borderRadius="md"
      p="4px"
      w="100%"
      align="center"
      boxSizing="border-box"
    >
      {/* Admin */}
      <Flex
        flex="1"
        align="center"
        justify={"center"}
        gap={3}
        px={[3, 4, 6]}
        py={[2, 3]}
        borderRadius="md"
        cursor="pointer"
        bg={active === "admin" ? "white" : "transparent"}
        boxShadow={active === "admin" ? "sm" : "none"}
        onClick={() => setActive("admin")}
        minH="48px"
      >
        <Box flexShrink={0}>
          <Image
            src={active === "admin" ? active_admin : inactive_admin}
            alt="admin"
            boxSize="18px"
          />
        </Box>
        <Text
          fontSize="13px"
          fontWeight={active === "admin" ? "600" : "600"}
          color={active === "admin" ? "#274167" : "#838FA2"}
          fontFamily="Poppins, sans-serif"
          letterSpacing="-0.5px"
        >
          Admin
        </Text>
      </Flex>

      {/* Employee */}
      <Flex
        flex="1"
        align="center"
        justify={"center"}
        gap={3}
        px={[3, 4, 6]}
        py={[2, 3]}
        borderRadius="md"
        cursor="pointer"
        bg={active === "employee" ? "white" : "transparent"}
        boxShadow={active === "employee" ? "sm" : "none"}
        onClick={() => setActive("employee")}
        minH="48px"
      >
        <Box flexShrink={0}>
          <Image
            src={active === "employee" ? employee_active2 : employee_inactive}
            alt="employee"
            boxSize="18px"
          />
        </Box>
        <Text
          fontSize="13px"
          fontWeight={active === "employee" ? "600" : "600"}
          color={active === "employee" ? "#274167" : "#838FA2"}
          fontFamily="Poppins, sans-serif"
          letterSpacing="-0.5px"
        >
          Employee
        </Text>
      </Flex>
    </Flex>
  );
}

