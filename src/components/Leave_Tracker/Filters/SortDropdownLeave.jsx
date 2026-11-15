import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  VStack,
  HStack,
  MenuDivider,
  Box,
  Image,
  Checkbox,
} from "@chakra-ui/react";
import sort from "../../../assets/sort.svg";

export default function SortDropdownLeave({
  onApply,
  onClear,
  defaultSort = {},
  sortByKey = "from", // 👈 Added this prop with a fallback default for your leaves page
}) {
  const [value, setValue] = useState("");

  // hydrate initial value from defaultSort prop
  useEffect(() => {
    if (!defaultSort || !defaultSort.sortBy) {
      setValue("");
      return;
    }
    const { sortBy = "", sortOrder } = defaultSort;
    const s = String(sortBy).toLowerCase();
    
    // Updated to dynamically check for 'date', 'from', or whatever custom key you passed
    if (s.includes("date") || s.includes(sortByKey.toLowerCase())) {
      setValue(Number(sortOrder) === 1 ? "date_asc" : "date_desc");
    } else {
      setValue("date_desc");
    }
  }, [defaultSort, sortByKey]); // Added dependencies for safety

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        h="38px"
        bg="white"
        fontFamily="Poppins"
        fontSize="14px"
        color="#757575"
        borderWidth="1.5px"
        borderColor="#cccccc"
        borderRadius="8px"
        fontWeight={400}
        leftIcon={<Image src={sort} boxSize="14px" alt="sort" />}
        _hover={{
          bg: "white",
          borderColor: "#bdbdbd",
        }}
        _active={{
          bg: "white",
          borderColor: "#1A365D",
        }}
        _focusVisible={{
          boxShadow: "0 0 0 1px #1A365D",
        }}
      >
        Sort
      </MenuButton>

      <MenuList minW="220px" borderRadius="8px" p={3} boxShadow="lg">
        <VStack align="start" spacing={3}>
          <VStack align="start" spacing={2} w="full">
            <Checkbox
              isChecked={value === "date_desc"}
              onChange={() => {
                const next = value === "date_desc" ? "" : "date_desc";
                setValue(next);
                if (next === "date_desc") {
                  // 👇 Uses dynamic key and standard -1 sort direction
                  onApply?.({ sortBy: sortByKey, sortOrder: -1 });
                } else {
                  onClear?.(); // Fires clear if unchecked
                }
              }}
              sx={{
                ".chakra-checkbox__control": {
                  borderColor: "#cccccc",
                },
                ".chakra-checkbox__control[data-checked]": {
                  bg: "#274066",
                  borderColor: "#274066",
                  color: "white",
                },
              }}
            >
              Date (Descending)
            </Checkbox>

            <Checkbox
              isChecked={value === "date_asc"}
              onChange={() => {
                const next = value === "date_asc" ? "" : "date_asc";
                setValue(next);
                if (next === "date_asc") {
                  // 👇 Uses dynamic key and standard 1 sort direction
                  onApply?.({ sortBy: sortByKey, sortOrder: 1 });
                } else {
                  onClear?.(); // Fires clear if unchecked
                }
              }}
              sx={{
                ".chakra-checkbox__control": {
                  borderColor: "#cccccc",
                },
                ".chakra-checkbox__control[data-checked]": {
                  bg: "#274066",
                  borderColor: "#274066",
                  color: "white",
                },
              }}
            >
              Date (Ascending)
            </Checkbox>
          </VStack>
        </VStack>

        <MenuDivider />

        <HStack justify="center" w="full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setValue("");
              onClear?.();
            }}
            color={"#274066"}
            fontWeight={500}
          >
            Clear all
          </Button>
        </HStack>
      </MenuList>
    </Menu>
  );
}