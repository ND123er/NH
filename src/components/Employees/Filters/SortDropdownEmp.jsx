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
  CheckboxGroup,
} from "@chakra-ui/react";
import sort from "../../../assets/sort.svg";

export default function SortDropdownEmp({
  onApply,
  onClear,
  defaultSort = {},
  lastModifiedOption,
}) {
  const [value, setValue] = useState("");
  // hydrate initial value from defaultSort prop
  // useEffect(() => {
  //   if (!defaultSort || !defaultSort.sortBy) {
  //     setValue("");
  //     return;
  //   }
  //   const { sortBy = "", sortOrder } = defaultSort;
  //   const s = String(sortBy).toLowerCase();
  //   if (s.includes("first")) {
  //     setValue(Number(sortOrder) === 1 ? "first_asc" : "first_desc");
  //   } else if (s.includes("last")) {
  //     setValue(Number(sortOrder) === 1 ? "last_asc" : "last_desc");
  //   } else {
  //     // fallback -> modified
  //     setValue("modified");
  //   }
  // }, [defaultSort]);
  // useEffect(() => {
  //   if (!defaultSort || !defaultSort.sortBy) {
  //     setValue("");
  //     return;
  //   }

  //   const { sortBy = "", sortOrder } = defaultSort;
  //   const s = String(sortBy).toLowerCase();

  //   if (s.includes("first")) {
  //     setValue(Number(sortOrder) === 1 ? "first_asc" : "first_desc");
  //   }
  //   else if (s.includes("last")) {
  //     setValue(Number(sortOrder) === 1 ? "last_asc" : "last_desc");
  //   }
  //   else if (s.includes("created") && lastModifiedOption) {
  //     setValue("modified");
  //   }
  //   else {
  //     setValue("");
  //   }
  // }, [defaultSort, lastModifiedOption]);
  useEffect(() => {
    if (!defaultSort?.sortBy) return;

    const { sortBy = "", sortOrder } = defaultSort;
    const s = String(sortBy).toLowerCase();

    if (s.includes("first")) {
      setValue(Number(sortOrder) === 1 ? "first_asc" : "first_desc");
    } else if (s.includes("last")) {
      setValue(Number(sortOrder) === 1 ? "last_asc" : "last_desc");
    } else if (s.includes("created") && lastModifiedOption) {
      setValue("modified");
    }
  }, [defaultSort, lastModifiedOption]);


  // const apply = (selectedValue) => {
  //   if (!onApply) return;
  //   if (value === "modified") {
  //     // sort by newest first
  //     onApply({ sortBy: "created_at", sortOrder: -1 });
  //   } else if (value === "first_asc") {
  //     onApply({ sortBy: "first_name", sortOrder: 1 });
  //   } else if (value === "first_desc") {
  //     onApply({ sortBy: "first_name", sortOrder: -1 });
  //   } else if (value === "last_asc") {
  //     onApply({ sortBy: "last_name", sortOrder: 1 });
  //   } else if (value === "last_desc") {
  //     onApply({ sortBy: "last_name", sortOrder: -1 });
  //   } else {
  //     onApply({});
  //   }
  // };

  const apply = (selectedValue) => {
    if (!onApply) return;

    const v = selectedValue ?? value;

    if (v === "modified") {
      onApply({ sortBy: "created_at", sortOrder: -1 });
    } else if (v === "first_asc") {
      onApply({ sortBy: "first_name", sortOrder: 1 });
    } else if (v === "first_desc") {
      onApply({ sortBy: "first_name", sortOrder: -1 });
    } else if (v === "last_asc") {
      onApply({ sortBy: "last_name", sortOrder: 1 });
    } else if (v === "last_desc") {
      onApply({ sortBy: "last_name", sortOrder: -1 });
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
        color={'#757575'}
        fontFamily={'Poppins'}
        fontSize={'14px'}
        fontWeight={'400'}
        height={'37px'}

      >
        Sort
      </MenuButton>

      <MenuList minW="240px" borderRadius="10px" p={3} boxShadow="lg">
        {/* <VStack align="start" spacing={3}>
          <RadioGroup onChange={setValue} value={value}>
            <VStack align="start" spacing={2}>
              {lastModifiedOption !== false && (
                <Radio value="modified">Last modified</Radio>
              )}
              <Radio value="first_asc">First name (A - Z)</Radio>
              <Radio value="first_desc">First name (Z - A)</Radio>
            </VStack>
          </RadioGroup>
        </VStack> */}

        {/* <VStack align="start" spacing={3}>
          <CheckboxGroup value={value} onChange={setValue} >
            <VStack align="start" spacing={2} sx={{
              ".chakra-checkbox__control": {
                w: "20px",
                h: "20px",
                borderRadius: "4px",
                border: "1px solid #cccccc",
              },
              ".chakra-checkbox__control[data-checked]": {
                bg: "#274066",
                borderColor: "#274066",
                color: "white",
              },
            }}>
              {lastModifiedOption !== false && (
                <Checkbox value="modified" >Last modified</Checkbox>
              )}
              <Checkbox value="first_asc">First name (A - Z)</Checkbox>
              <Checkbox value="first_desc">First name (Z - A)</Checkbox>
            </VStack>
          </CheckboxGroup>
        </VStack> */}

        <VStack align="start" spacing={3}>
          <VStack
            align="start"
            spacing={2}
            sx={{
              ".chakra-checkbox__control": {
                w: "20px",
                h: "20px",
                borderRadius: "4px",
                border: "1px solid #cccccc",
              },
              ".chakra-checkbox__control[data-checked]": {
                bg: "#274066",
                borderColor: "#274066",
                color: "white",
              },
            }}
          >
            {lastModifiedOption !== false && (
              <Checkbox
                isChecked={value === "modified"}
                // onChange={() =>
                //   setValue(value === "modified" ? "" : "modified")
                // }
                onChange={() => {
                  const newValue = value === "modified" ? "" : "modified";
                  setValue(newValue);
                  apply(newValue);
                }}
              >
                Last modified
              </Checkbox>
            )}

            <Checkbox
              isChecked={value === "first_asc"}
              // onChange={() =>
              //   setValue(value === "first_asc" ? "" : "first_asc")
              // }
              onChange={() => {
                const newValue = value === "first_asc" ? "" : "first_asc";
                setValue(newValue);
                apply(newValue);
              }}

            >
              First name (A - Z)
            </Checkbox>

            <Checkbox
              isChecked={value === "first_desc"}
              // onChange={() =>
              //   setValue(value === "first_desc" ? "" : "first_desc")
              // }
              onChange={() => {
                const newValue = value === "first_desc" ? "" : "first_desc";
                setValue(newValue);
                apply(newValue);
              }}
            >
              First name (Z - A)
            </Checkbox>
          </VStack>
        </VStack>

        <MenuDivider />

        <HStack justify="center" w="full">
          <Box>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </Box>

          {/* <Box>
            <Button
              size="sm"
              onClick={apply}
              _hover={{ bg: "blue.800", color: "white" }}
              bg="#1A365D"
              color="white"
            >
              Apply
            </Button>
          </Box> */}
        </HStack>
      </MenuList>
    </Menu>
  );
}
