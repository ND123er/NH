import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  VStack,
  RadioGroup,
  Radio,
  HStack,
  MenuDivider,
  Box,
  Image,
  Checkbox,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import sort from "../../../assets/sort.svg";

export default function SortDropdownAssets({
  onApply,
  onClear,
  defaultSort = {},
}) {
  // key values: 'modified', 'name_asc', 'name_desc', or '' (none)
  const [value, setValue] = useState("");

  // hydrate initial value from defaultSort
  useEffect(() => {
    if (!defaultSort || !defaultSort.sortBy) {
      setValue("");
      return;
    }
    const { sortBy, sortOrder } = defaultSort;
    if (
      String(sortBy).toLowerCase().includes("asset") &&
      Number(sortOrder) === 1
    ) {
      setValue("name_asc");
    } else if (
      String(sortBy).toLowerCase().includes("asset") &&
      Number(sortOrder) === -1
    ) {
      setValue("name_desc");
    } else {
      // fallback treat as last modified (uses created_at / updated_at)
      setValue("modified");
    }
  }, [defaultSort]);

  const apply = () => {
    if (!onApply) return;
    if (value === "modified") {
      onApply({ sortBy: "created_at", sortOrder: -1 });
    } else if (value === "name_asc") {
      onApply({ sortBy: "asset_name", sortOrder: 1 });
    } else if (value === "name_desc") {
      onApply({ sortBy: "asset_name", sortOrder: -1 });
    } else {
      // no selection -> call clear
      onApply({});
    }
  };

  const handleClear = () => {
    setValue("");
    if (onClear) onClear();
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        h="35px"
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
              isChecked={value === "modified"}
              onChange={() => {
                const next = value === "modified" ? "" : "modified";
                setValue(next);
                if (next === "modified") {
                  onApply?.({ sortBy: "created_at", sortOrder: -1 });
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
              Last modified
            </Checkbox>

            <Checkbox
              isChecked={value === "name_asc"}
              onChange={() => {
                const next = value === "name_asc" ? "" : "name_asc";
                setValue(next);
                if (next === "name_asc") {
                  onApply?.({ sortBy: "asset_name", sortOrder: 1 });
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
              Asset name (A - Z)
            </Checkbox>

            <Checkbox
              isChecked={value === "name_desc"}
              onChange={() => {
                const next = value === "name_desc" ? "" : "name_desc";
                setValue(next);
                if (next === "name_desc") {
                  onApply?.({ sortBy: "asset_name", sortOrder: -1 });
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
              Asset name (Z - A)
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
