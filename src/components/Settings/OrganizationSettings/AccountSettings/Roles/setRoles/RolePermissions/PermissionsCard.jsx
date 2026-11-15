import React from "react";
import {
  Box,
  Flex,
  Text,
  Switch,
  Select,
  Divider,
  VStack,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export default function PermissionsCard({
  title,
  description,
  fields = [],
  FieldComponent,
  values = {},
  onToggle,
  onPrivilegeChange,
}) {
  return (
    <Box
      bg="white"
      borderRadius="md"
      p={6}
      boxShadow="sm"
      border="1px solid #e6e9ef"
      w="100%"
      mb={4}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontWeight="600" fontSize="md">
          {title}
        </Text>
      </Flex>

      {description && (
        <Text fontSize="xs" color="gray.500" mb={4}>
          {description}
        </Text>
      )}

      <Divider mb={4} />

      {/* Permission rows */}
      <VStack align="stretch" spacing={4}>
        {fields.map((field) => {
          if (FieldComponent) {
            const Field = FieldComponent;
            return (
              <Flex
                key={field.name}
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Box flex="1" minW={{ base: "100%", md: "40%" }} pr={4}>
                  <Field
                    name={field.name}
                    label={field.label}
                    defaultValue={field.defaultValue}
                    {...field}
                  />
                </Box>

                {field.type === "toggle+select" && field.privilegeOptions && (
                  <Box flex="1" minW={{ base: "100%", md: "40%" }}>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                      fontWeight="500"
                    >
                      Privileges
                    </Text>
                    {/* Controller to bind the select to react-hook-form */}
                    <Controller
                      name={`${field.name}_privilege`}
                      defaultValue={field.defaultPrivilege ?? ""}
                      render={({ field: controllerField }) => (
                        <Select
                          placeholder="Select"
                          size="sm"
                          bg="white"
                          {...controllerField}
                        >
                          {field.privilegeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </Box>
                )}
              </Flex>
            );
          }

          // const isToggleOnly = field.type === "toggle";
          const isToggleSelect = field.type === "toggle+select";
          const currentValue = values[field.name] ?? false;
          const currentPrivilege = values[`${field.name}_privilege`] ?? "";

          return (
            <Flex
              key={field.name}
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={4}
            >
              {/* Left: label + toggle */}
              <Flex
                align="center"
                justify="space-between"
                flex="1"
                minW={{ base: "100%", md: "40%" }}
                pr={4}
              >
                <Text fontSize="sm" fontWeight="500">
                  {field.label}
                </Text>
                <Switch
                  isChecked={currentValue}
                  onChange={(e) =>
                    onToggle && onToggle(field.name, e.target.checked)
                  }
                />
              </Flex>

              {/* Right: optional privilege select(s) */}
              {isToggleSelect && (
                <Box
                  flex="1"
                  minW={{ base: "100%", md: "40%" }}
                  display="flex"
                  flexDirection="column"
                  gap={2}
                >
                  {field.privilegeOptions && (
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        mb={1}
                        fontWeight="500"
                      >
                        Privileges
                      </Text>
                      <Select
                        placeholder="Select"
                        size="sm"
                        value={currentPrivilege}
                        onChange={(e) =>
                          onPrivilegeChange &&
                          onPrivilegeChange(field.name, e.target.value)
                        }
                        bg="white"
                      >
                        {field.privilegeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </Box>
                  )}
                </Box>
              )}
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
}
