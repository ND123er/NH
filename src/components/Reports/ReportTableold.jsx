import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  CloseButton,
  Flex,
  Text,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Badge,
} from "@chakra-ui/react";

import moment from "moment";

import { SearchIcon } from "@chakra-ui/icons";

export default function ReportTable({
  columns = [],
  data = [],
  loading = false,
  hiddenColumns = [],
  onExportDataChange,
}) {
  const [search, setSearch] = useState("");
  const [searchExpand, setSearchExpand] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = ["Search by Full Name", "Search by Employee ID"];

  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // const normalizedColumns = useMemo(
  //   () =>
  //     columns
  //       .map((column) => {
  //         if (typeof column === "string") {
  //           return {
  //             key: column,
  //             label: column
  //               .replace(/_/g, " ")
  //               .replace(/\b\w/g, (char) => char.toUpperCase()),
  //           };
  //         }

  //         return {
  //           key: column?.key || column?.field || column?.name,
  //           label:
  //             column?.label ||
  //             column?.title ||
  //             column?.key ||
  //             column?.field ||
  //             column?.name ||
  //             "",
  //           render: column?.render,
  //         };
  //       })
  //       .filter((column) => column.key && !hiddenColumns.includes(column.key)),
  //   [columns, hiddenColumns],
  // );

  const customHeadings = {
    employee_name: "Employee",
    employee_code: "Employee Id",
    department: "Department",
    joining_date: "Joining date",
    employment_status: "Status",
    scheduled_start: "Start Date",
    scheduled_end: "End Date",
    // manager_id: "Reporting Manager",
  };

  const normalizedColumns = useMemo(() => {
    const result = columns
      .map((column) => {
        if (typeof column === "string") {
          return {
            key: column,
            label:
              customHeadings[column] ||
              column
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase()),
          };
        }

        return {
          key: column?.key || column?.field || column?.name,
          label:
            customHeadings[column?.key] ||
            column?.label ||
            column?.title ||
            column?.key ||
            column?.field ||
            column?.name ||
            "",
          render: column?.render,
        };
      })
      .filter((column) => column.key && !hiddenColumns.includes(column.key));

    const employeeNameIndex = result.findIndex(
      (column) => column.key === "employee_name",
    );

    const employeeCodeIndex = result.findIndex(
      (column) => column.key === "employee_code",
    );

    if (employeeNameIndex !== -1 && employeeCodeIndex !== -1) {
      const [employeeCode] = result.splice(employeeCodeIndex, 1);

      result.splice(
        result.findIndex((column) => column.key === "employee_name") + 3,
        0,
        employeeCode,
      );
    }

    return result;
  }, [columns, hiddenColumns]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return data;

    return data.filter((row) =>
      Object.values(row || {}).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, search]);

  useEffect(() => {
    if (typeof onExportDataChange !== "function") return;

    onExportDataChange({
      columns: normalizedColumns,
      data: filteredData,
    });
  }, [normalizedColumns, filteredData, onExportDataChange]);

  return (
    <>
      <style>
        {`
    @keyframes slideFade {
      0% {
        opacity: 0;
        transform: translateY(-18px);
      }
      30% {
        opacity: 1;
        transform: translateY(-50%);
      }
      70% {
        opacity: 1;
        transform: translateY(-50%);
      }
      100% {
        opacity: 0;
        transform: translateY(18px);
      }
    }
  `}
      </style>
      <Box
        w="100%"
        minW={0}
        maxW="100%"
        bg="white"
        overflow="hidden"
        fontFamily="Poppins"
        mt={3}
      >
        <Box py={0} px={0}>
          <Flex
            justify="space-between"
            align="start"
            gap={3}
            wrap="wrap"
            px={4}
            pb={3}
          >
            <Text fontSize="22px" fontWeight="700" color="#000000">
              Report Results
            </Text>

            {/* <Input
              placeholder="Search Results"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              w={{ base: "100%", md: "230px" }}
              h="39px"
              fontFamily="Poppins"
              fontSize="14px"
              borderWidth="1.5px"
              borderColor="#cccccc"
              borderRadius="10px"
              _focus={{
                borderColor: "#cccccc",
                boxShadow: "none",
              }}
            /> */}
            <Box
              position="relative"
              w={{
                base: searchExpand ? "200px" : "170px",
                md: searchExpand ? "220px" : "220px",
                lg: searchExpand ? "320px" : "210px",
              }}
              overflow="hidden"
              _focusWithin={{
                borderColor: "#cccccc",
                boxShadow: "none",
              }}
            >
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="#757575" mt={2} />
                </InputLeftElement>

                {!search && (
                  <Text
                    key={`${placeholderIndex}-${searchExpand}`}
                    position="absolute"
                    left="30px"
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize={{
                      base: "12px",
                      sm: "12px",
                      md: "11px",
                      lg: "14px",
                    }}
                    fontFamily="Poppins"
                    fontWeight="400"
                    color="#757575"
                    pointerEvents="none"
                    animation="slideFade 3s ease-in-out"
                    whiteSpace="nowrap"
                  >
                    {searchExpand
                      ? placeholderexpandsearch[placeholderIndex]
                      : placeholders[placeholderIndex]}
                  </Text>
                )}

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchExpand(true)}
                  onBlur={() => {
                    if (!search) setSearchExpand(false);
                  }}
                  fontFamily="Poppins"
                  h="39px"
                  borderWidth="1.5px"
                  borderColor="#cccccc"
                  borderRadius="10px"
                  pl="30px"
                  _focus={{
                    borderColor: "#cccccc",
                    boxShadow: "none",
                  }}
                />

                {search && (
                  <InputRightElement>
                    <CloseButton
                      size="sm"
                      mt={1}
                      onClick={() => setSearch("")}
                    />
                  </InputRightElement>
                )}
              </InputGroup>
            </Box>
          </Flex>
          <Flex
            px={{ base: 4, md: 5 }}
            // pt={3}
            justify="space-between"
            align="center"
            // borderBottom="1px solid #E2E8F0"
            mb="12px"
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "2px",
              backgroundImage:
                "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
            }}
          ></Flex>
        </Box>

        <Box
          // overflowX="auto"
          // overflowY="auto"
          // maxH={{ base: "55vh", md: "60vh", xl: "65vh" }}
          // sx={{
          //   scrollbarWidth: "none",
          //   "&::-webkit-scrollbar": {
          //     display: "none",
          //   },
          // }}
          w="100%"
          minW={0}
          maxW="100%"
          overflowX="auto"
          overflowY="auto"
          maxH={{ base: "55vh", md: "60vh", xl: "350px" }}
          sx={{
            "&::-webkit-scrollbar": {
              height: "8px", // horizontal visible
              width: "0px", // vertical hidden
            },
            "&::-webkit-scrollbar:vertical": {
              width: "0px",
            },
            "&::-webkit-scrollbar:horizontal": {
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb:horizontal": {
              background: "#AAB4C3",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-track:horizontal": {
              background: "#F1F3F6",
            },
          }}
        >
          {loading ? (
            <Flex justify="center" align="center" minH="250px">
              <Spinner />
            </Flex>
          ) : data.length === 0 ? (
            <Flex justify="center" align="center" minH="250px">
              <Text fontFamily="Poppins" color="#757575">
                No data available
              </Text>
            </Flex>
          ) : (
            <Table
              // variant="striped"
              // size="sm"
              // minW="max-content"
              // sx={{
              //   "& tbody tr:nth-of-type(odd) td": {
              //     background: "#f0f2f5",
              //   },
              //   "& tbody tr:nth-of-type(even) td": {
              //     background: "white",
              //   },
              //   "& td, & th": {
              //     border: "none !important",
              //   },
              //   "& tr": {
              //     border: "none !important",
              //   },
              //   "& thead th": {
              //     paddingBottom: "14px",
              //   },
              //   "& tbody tr:first-of-type td": {
              //     paddingTop: "12px",
              //   },
              // }}
              variant="striped"
              size="sm"
              width="100%"
              minW="100%"
              maxW="none"
              sx={{
                tableLayout: "fixed",

                "& tbody tr:nth-of-type(odd) td": {
                  background: "#f0f2f5",
                },
                "& tbody tr:nth-of-type(even) td": {
                  background: "white",
                },
                "& td, & th": {
                  border: "none !important",
                  // whiteSpace: "nowrap",
                },
                "& tr": {
                  border: "none !important",
                },
                "& thead th": {
                  paddingBottom: "12px",
                  whiteSpace: "nowrap",
                },
                "& tbody tr:first-of-type td": {
                  paddingTop: "12px",
                },
              }}
            >
              <Thead
                position="sticky"
                top={0}
                zIndex={2}
                bg="white"
                sx={{
                  th: {
                    fontSize: "13px",
                    textTransform: "none",
                    fontWeight: "600",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#000000",
                  },
                }}
              >
                <Tr>
                  {normalizedColumns.map((column) => (
                    <Th key={column.key}>{column.label}</Th>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {filteredData.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan={normalizedColumns.length || 1}
                      textAlign="center"
                      py={8}
                    >
                      <Text
                        fontFamily="Poppins"
                        color="#757575"
                        fontSize="13px"
                      >
                        No matching results
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredData.map((row, index) => (
                    <Tr key={row._id || row.employee_id || index}>
                      {normalizedColumns.map((column) => (
                        // <Td
                        //   key={column.key}
                        //   fontFamily="Poppins"
                        //   fontSize="13px"
                        // >
                        //   {column.render
                        //     ? column.render(row)
                        //     : (row[column.key] ?? "-")}
                        // </Td>
                        // <Td
                        //   key={column.key}
                        //   fontFamily="Poppins"
                        //   fontSize="11px"
                        // >
                        //   {column.key === "email" ?
                        //   (
                        //     <Text
                        //       noOfLines={1}
                        //       maxW="100px"
                        //       title={row[column.key]}
                        //     >
                        //       {row[column.key] ?? "-"}
                        //     </Text>
                        //   ) : column.render ? (
                        //     column.render(row)
                        //   ) : (
                        //     (row[column.key] ?? "-")
                        //   )}
                        // </Td>
                        // <Td
                        //   key={column.key}
                        //   fontFamily="Poppins"
                        //   fontSize="11px"
                        // >
                        //   {column.key === "employment_status" ? (
                        //     <Badge
                        //       bg="#E8F5EE"
                        //       color="#4F9F73"
                        //       fontSize="10px"
                        //       fontWeight="500"
                        //       borderRadius="6px"
                        //       px={3}
                        //       py={1}
                        //     >
                        //       {row[column.key] ?? "-"}
                        //     </Badge>
                        //   ) : column.key === "email" ? (
                        //     <Text
                        //       noOfLines={1}
                        //       maxW="100px"
                        //       title={row[column.key]}
                        //     >
                        //       {row[column.key] ?? "-"}
                        //     </Text>
                        //   ) : column.render ? (
                        //     column.render(row)
                        //   ) : (
                        //     (row[column.key] ?? "-")
                        //   )}
                        // </Td>
                        <Td
                          key={column.key}
                          fontFamily="Poppins"
                          fontSize="11px"
                        >
                          {column.key === "employee_name" ? (
                            <Flex align="center" gap={2}>
                              <Flex
                                w="28px"
                                h="28px"
                                minW="28px"
                                borderRadius="full"
                                bg="#cfd6de"
                                align="center"
                                justify="center"
                                fontSize="10px"
                                fontWeight="600"
                                color="#274167"
                              >
                                {String(row[column.key] || "")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((name) => name[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </Flex>

                              <Box>
                                <Text
                                  fontSize="11px"
                                  // noOfLines={1}
                                >
                                  {row[column.key] ?? "-"}
                                </Text>

                                {/* <Text
                                  fontSize="9px"
                                  color="#98A2B3"
                                  noOfLines={1}
                                >
                                  {row.employee_code ?? "-"}
                                </Text> */}
                              </Box>
                            </Flex>
                          ) : column.key === "employment_status" ? (
                            <Badge
                              bg="#E8F5EE"
                              color="#4F9F73"
                              fontSize="10px"
                              fontWeight="500"
                              borderRadius="6px"
                              px={3}
                              py={1}
                            >
                              {row[column.key] ?? "-"}
                            </Badge>
                          ) : column.key === "email" ? (
                            <Text
                              noOfLines={1}
                              maxW="100px"
                              title={row[column.key]}
                            >
                              {row[column.key] ?? "-"}
                            </Text>
                          ) : column.render ? (
                            column.render(row)
                          ) : // (row[column.key] ?? "-")
                          ["scheduled_start", "scheduled_end"].includes(
                              column.key,
                            ) ? (
                            row[column.key] ? (
                              moment(row[column.key]).format("DD/MM/YYYY")
                            ) : (
                              "-"
                            )
                          ) : (
                            (row[column.key] ?? "-")
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
    </>
  );
}
