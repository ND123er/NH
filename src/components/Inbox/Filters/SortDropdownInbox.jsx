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
} from "@chakra-ui/react";
import sort from "../../../assets/sort.svg";

export default function SortDropdownInbox({
  onApply,
  onClear,
  defaultSort = {},
}) {
  // value: 'latest' => sortOrder -1 (newest first), 'oldest' => sortOrder 1
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!defaultSort?.sortBy) return;
    const { sortBy = "", sortOrder } = defaultSort;
    const s = String(sortBy).toLowerCase();
    if (s.includes("created")) {
      setValue(Number(sortOrder) === -1 ? "latest" : "oldest");
    }
  }, [defaultSort]);

  const apply = () => {
    if (!onApply) return;
    if (value === "latest") {
      onApply({ sortBy: "created_at", sortOrder: -1 });
    } else if (value === "oldest") {
      onApply({ sortBy: "created_at", sortOrder: 1 });
    } else {
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
        size="sm"
        leftIcon={
          <Image src={sort} boxSize={{ base: "14px", sm: "14px" }} alt="sort" />
        }
        borderRadius="10px"
        bg="white"
        border="1px solid #cccccc"
        color={"#757575"}
        fontFamily={"Poppins"}
        fontSize={"14px"}
        fontWeight={"400"}
        height={"37px"}
      >
        Sort
      </MenuButton>

      <MenuList minW="240px" borderRadius="10px" p={3} boxShadow="lg">
        <VStack align="start" spacing={3}>
          <RadioGroup onChange={setValue} value={value}>
            <VStack align="start" spacing={2}>
              <Radio
                value="latest"
                _checked={{
                  bg: "#243b66",
                  borderColor: "#243b66",
                  color: "white",
                }}
              >
                Latest
              </Radio>

              <Radio
                value="oldest"
                _checked={{
                  bg: "#243b66",
                  borderColor: "#243b66",
                  color: "white",
                }}
              >
                Oldest
              </Radio>
            </VStack>
          </RadioGroup>
        </VStack>

        <MenuDivider />

        <HStack justify="space-between" w="full">
          <Box>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </Box>

          <Box>
            <Button
              size="sm"
              onClick={apply}
              _hover={{ bg: "blue.800", color: "white" }}
              bg="#1A365D"
              color="white"
            >
              Apply
            </Button>
          </Box>
        </HStack>
      </MenuList>
    </Menu>
  );
}
