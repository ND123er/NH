
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Flex,
  Spinner,
  Text,
} from "@chakra-ui/react";
import PerformanceTableHeader from "./PerformanceTableHeader";
import PerformanceTableActions from "./PerformanceTableActions";

// import PerformanceTableHeader from "./PerformanceTableHeader";
// import PerformanceTableActions from "./PerformanceTableActions";
// import PerformanceStatusBadge from "./PerformanceStatusBadge";

const PerformanceManagementTable = ({
  title = "Appraisals",
  data = [],
  columns = [],
  searchPlaceholder = "Search employees...",
  onSearch,
  actions = [],
  rowActions = [],
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  emptyMessage = "No records found",
  showHeader = true,
  striped = false,
  rowHeight = 30,
  actionColumnWidth = "56px",
  actionHeaderAlign = "center",
  cellPadding = 8,
}) => {
  const handleSelectAll = (checked) => {
    onSelectionChange?.(checked ? data.map((item) => item.id) : []);
  };

  const handleSelectRow = (id) => {
    const updated = selectedRows.includes(id)
      ? selectedRows.filter((item) => item !== id)
      : [...selectedRows, id];

    onSelectionChange?.(updated);
  };

  const allSelected =
    data.length > 0 && data.every((item) => selectedRows.includes(item.id));

  return (
    <Box
      bg="white"
      fontFamily="Arial, sans-serif"
      overflowX="auto"
    >
      {showHeader && (
        <>
          <PerformanceTableHeader
            title={title}
            searchPlaceholder={searchPlaceholder}
            onSearch={onSearch}
          >
            <PerformanceTableActions actions={actions} />
          </PerformanceTableHeader>
          <Box w="100%" h="1px" bg="#E2E8F0" />
        </>
      )}

      <Box>
        <Table
          variant="unstyled"
          size="sm"
          width="100%"
          minWidth="790px"
          sx={{
            "& th": {
              height: "32px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#111",
              textTransform: "none",
              whiteSpace: "nowrap",
              paddingInline: `${cellPadding}px`,
              paddingTop: "4px",
              paddingBottom: "4px",
              borderBottom: "1px solid #e7e7e7",
            },
            "& td": {
              height: `${rowHeight}px`,
              fontSize: "11px",
              paddingInline: `${cellPadding}px`,
              paddingTop: "5px",
              paddingBottom: "5px",
              whiteSpace: "nowrap",
              borderBottom: "0",
              verticalAlign: "middle",
            },
          }}
        >
          <Thead bg="white">
            <Tr>
              {selectable && (
                <Th>
                  <Checkbox
                    isChecked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </Th>
              )}

              {columns.map((column) => (
                <Th
                  key={column.key}
                  width={column.width}
                  textAlign={column.align || "left"}
                >
                  {column.label}
                </Th>
              ))}

              {rowActions.length > 0 && (
                <Th width={actionColumnWidth} textAlign={actionHeaderAlign}>
                  Action
                </Th>
              )}
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length ? 1 : 0)}>
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                </Td>
              </Tr>
            ) : data.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length ? 1 : 0)}>
                  <Text textAlign="center" py={8} color="gray.500">
                    {emptyMessage}
                  </Text>
                </Td>
              </Tr>
            ) : (
              data.map((row, index) => (
                <Tr
                  key={row.id}
                  bg={striped && index % 2 === 0 ? "#f0f2f4" : "white"}
                  _hover={{ bg: "#e9edf0" }}
                >
                  {selectable && (
                    <Td>
                      <Checkbox
                        isChecked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </Td>
                  )}

                  {columns.map((column) => (
                    <Td
                      key={column.key}
                      width={column.width}
                      textAlign={column.align || "left"}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? "-"}
                    </Td>
                  ))}

                  {rowActions.length > 0 && (
                    <Td textAlign="center">
                      <PerformanceTableActions
                        actions={rowActions}
                        row={row}
                      />
                    </Td>
                  )}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default PerformanceManagementTable;
