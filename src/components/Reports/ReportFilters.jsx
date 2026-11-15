import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Text,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { FiUser } from "react-icons/fi";
import { DatePicker } from "../../layouts/DatePicker";
import { Upload, RefreshCw } from "lucide-react";
import moment from "moment";

const fieldStyle = {
  fontFamily: "Poppins, sans-serif",
  fontSize: "14px",
  h: "40px",
  border: "1px solid #CCCCCC",
  borderRadius: "9px",
  bg: "#FFFFFF",
  color: "#222222",
  _focus: { borderColor: "#274167", boxShadow: "0 0 0 1px #274167" },
};

export default function ReportFilters({
  filters,
  onChange,
  onReset,
  onGenerate,
  generating = false,
  departments = [],
  employees = [],
  loadingDepartments = false,
  loadingEmployees = false,
  showDateRange = false,
  dateErrors = {},
  showEmployeeSearch = true,
  showDepartmentFilter = true,
  allowFutureDates = false,
}) {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  const employeeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const ALL_EMPLOYEES = "__ALL_EMPLOYEES__";

  const selectedIds = filters.employee_ids || [];
  const isAllEmployeesSelected = selectedIds.includes(ALL_EMPLOYEES);

  const showAllEmployeesOption =
    !isAllEmployeesSelected &&
    (employeeSearch.trim() === "" ||
      "all employees".includes(employeeSearch.trim().toLowerCase()));

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const selectedEmployees = useMemo(() => {
    const ids = filters.employee_ids || [];
    return employees.filter((employee) =>
      ids.some((id) => String(id) === String(employee.value)),
    );
  }, [employees, filters.employee_ids]);

  const filteredEmployees = useMemo(() => {
    const search = employeeSearch.trim().toLowerCase();
    const selectedIds = filters.employee_ids || [];

    return employees.filter((employee) => {
      const alreadySelected = selectedIds.some(
        (id) => String(id) === String(employee.value),
      );

      const matchesSearch = String(employee.label || "")
        .toLowerCase()
        .includes(search);

      return !alreadySelected && matchesSearch;
    });
  }, [employees, employeeSearch, filters.employee_ids]);

  const addEmployee = (employee) => {
    const ids = (filters.employee_ids || []).filter(
      (id) => id !== ALL_EMPLOYEES,
    );

    if (!ids.some((id) => String(id) === String(employee.value))) {
      update("employee_ids", [...ids, employee.value]);
    }

    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
  };

  const selectAllEmployees = () => {
    update("employee_ids", [ALL_EMPLOYEES]);
    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
  };

  const removeAllEmployees = () => {
    update("employee_ids", []);
  };

  const removeEmployee = (employeeId) => {
    update(
      "employee_ids",
      (filters.employee_ids || []).filter(
        (id) => String(id) !== String(employeeId),
      ),
    );
  };

  return (
    <Box
      bg="#FFFFFF"
      p={{ base: 3, md: 3 }}
      fontFamily="Poppins, sans-serif"
      borderBottom="1px solid #cccccc"
    >
      <SimpleGrid
        columns={
          showDateRange ? { base: 1, md: 2, xl: 4 } : { base: 1, md: 2, xl: 2 }
        }
        spacing={{ base: 3, md: 4 }}
        alignItems="start"
      >
        {showDateRange && (
          <>
            {/* From Date */}
            <Box flex="1 1 170px" minW={{ base: "100%", sm: "160px" }}>
              <Text fontSize="12px" fontWeight="600" color="#4B4A4A" mb={1.5}>
                From Date{" "}
                <Text as="span" color="red.500">
                  *
                </Text>
              </Text>

              <DatePicker
                value={filters.start_date || ""}
                // maxDate={new Date()}
                maxDate={allowFutureDates ? undefined : new Date()}
                selected={
                  filters.start_date ? new Date(filters.start_date) : null
                }
                onChange={(date) =>
                  update(
                    "start_date",
                    date ? moment(date).format("YYYY-MM-DD") : "",
                  )
                }
                placeholderText="dd/mm/yyyy"
                iconMarginTop={0}
                inputProps={{
                  ...fieldStyle,
                  borderColor: dateErrors.start_date ? "#E53E3E" : "#CCCCCC",
                  _focus: {
                    borderColor: dateErrors.start_date ? "#E53E3E" : "#274167",
                    boxShadow: dateErrors.start_date
                      ? "0 0 0 1px #E53E3E"
                      : "0 0 0 1px #274167",
                  },
                }}
              />
              <Box minH="18px" mt={1}>
                {dateErrors.start_date && (
                  <Text color="red.500" fontSize="11px" mt={1}>
                    {dateErrors.start_date}
                  </Text>
                )}
              </Box>
            </Box>

            {/* To Date */}
            <Box flex="1 1 170px" minW={{ base: "100%", sm: "160px" }}>
              <Text fontSize="12px" fontWeight="600" color="#4B4A4A" mb={1.5}>
                To Date{" "}
                <Text as="span" color="red.500">
                  *
                </Text>
              </Text>

              <DatePicker
                // maxDate={new Date()}
                maxDate={allowFutureDates ? undefined : new Date()}
                value={filters.end_date || ""}
                selected={filters.end_date ? new Date(filters.end_date) : null}
                onChange={(date) =>
                  update(
                    "end_date",
                    date ? moment(date).format("YYYY-MM-DD") : "",
                  )
                }
                placeholderText="dd/mm/yyyy"
                iconMarginTop={0}
                inputProps={{
                  ...fieldStyle,
                  borderColor: dateErrors.end_date ? "#E53E3E" : "#CCCCCC",
                  _focus: {
                    borderColor: dateErrors.end_date ? "#E53E3E" : "#274167",
                    boxShadow: dateErrors.end_date
                      ? "0 0 0 1px #E53E3E"
                      : "0 0 0 1px #274167",
                  },
                }}
              />
              <Box minH="18px" mt={1}>
                {dateErrors.end_date && (
                  <Text color="red.500" fontSize="11px" mt={1}>
                    {dateErrors.end_date}
                  </Text>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Department */}
        {showDepartmentFilter && (
          <Box flex="1 1 210px" minW={{ base: "100%", sm: "190px" }}>
            <Text fontSize="12px" fontWeight="600" color="#4B4A4A" mb={1.5}>
              Department
            </Text>

            <Select
              mt="10px"
              placeholder={
                loadingDepartments
                  ? "Loading departments..."
                  : "Select Department"
              }
              value={filters.department_id || ""}
              onChange={(e) => update("department_id", e.target.value)}
              {...fieldStyle}
              isDisabled={loadingDepartments}
            >
              <option value="all">All Departments</option>
              {departments.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {/* Employee */}
        {showEmployeeSearch && (
          <Box
            ref={employeeDropdownRef}
            flex="1 1 210px"
            minW={{ base: "100%", sm: "190px" }}
            position="relative"
          >
            <Text fontSize="12px" fontWeight="600" color="#4B4A4A" mb={1.5}>
              Employee
            </Text>

            <Box
              border="1.5px solid #cccccc"
              borderRadius="10px"
              minH="40px"
              px={2}
              mt="10px"
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
              bg="#FFFFFF"
            >
              {isAllEmployeesSelected && (
                <Box
                  bg="#E7F0FC"
                  color="#334155"
                  px={1.5}
                  py={1}
                  borderRadius="5px"
                  fontSize="12px"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiUser} boxSize="12px" color="#1769E0" mr={1.5} />
                  All Employees
                  <Text
                    as="span"
                    ml={2}
                    color="#64748B"
                    cursor="pointer"
                    onClick={removeAllEmployees}
                  >
                    ×
                  </Text>
                </Box>
              )}

              {selectedEmployees.map((employee) => (
                <Box
                  key={employee.value}
                  bg="#E7F0FC"
                  color="#334155"
                  px={1.5}
                  py={1}
                  borderRadius="5px"
                  fontSize="12px"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiUser} boxSize="12px" color="#1769E0" mr={1.5} />
                  {employee.label.length > 12
                    ? `${employee.label.slice(0, 12)}...`
                    : employee.label}
                  <Text
                    as="span"
                    ml={2}
                    color="#64748B"
                    cursor="pointer"
                    onClick={() => removeEmployee(employee.value)}
                  >
                    ×
                  </Text>
                </Box>
              ))}

              <Input
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                placeholder={
                  selectedEmployees.length > 0 || isAllEmployeesSelected
                    ? "Search employees"
                    : "Search by Full Name or Employee ID"
                }
                border="none"
                boxShadow="none"
                flex="1"
                minW="150px"
                h="32px"
                fontFamily="Poppins"
                fontSize="13px"
                _focus={{
                  border: "none",
                  boxShadow: "none",
                }}
              />
            </Box>

            {showEmployeeDropdown && (
              <Box
                position="absolute"
                top="75px"
                left="0"
                right="0"
                bg="white"
                border="1px solid #CBD5E1"
                borderRadius="6px"
                boxShadow="lg"
                zIndex={20}
                maxH="200px"
                overflowY="auto"
              >
                {showAllEmployeesOption && (
                  <Box
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg="#F8FAFC"
                    _hover={{ bg: "#E7F0FC" }}
                    onClick={selectAllEmployees}
                  >
                    <Flex alignItems="center" gap={2}>
                      <Icon as={FiUser} boxSize="14px" color="#1769E0" />
                      <Text fontSize="13px" fontWeight="600" color="#274167">
                        All Employees
                      </Text>
                    </Flex>
                  </Box>
                )}

                {loadingEmployees ? (
                  <Text px={3} py={2} fontSize="11px" color="#64748B">
                    Searching employees...
                  </Text>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <Box
                      key={employee.value}
                      px={3}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "#F1F5F9" }}
                      onClick={() => addEmployee(employee)}
                    >
                      <Text fontSize="13px" color="#334155">
                        {employee.label}
                      </Text>
                    </Box>
                  ))
                ) : !showAllEmployeesOption ? (
                  <Text px={3} py={2} fontSize="11px" color="#64748B">
                    No employee found
                  </Text>
                ) : null}
              </Box>
            )}
          </Box>
        )}
      </SimpleGrid>

      <Flex
        gap={2}
        ml={{ base: 0, xl: "auto" }}
        justifyContent="flex-end"
        pt="12px"
      >
        <Button
          h="40px"
          px={4}
          variant="outline"
          borderColor="#C9CED8"
          borderRadius="9px"
          fontFamily="Poppins, sans-serif"
          fontSize="13px"
          fontWeight="500"
          color="#4B4A4A"
          onClick={onReset}
          _hover={{ bg: "#F7F8FA" }}
        >
          Reset Filters
        </Button>

        <Button
          h="40px"
          px={5}
          bg="#274167"
          color="white"
          borderRadius="9px"
          fontFamily="Poppins, sans-serif"
          fontSize="13px"
          fontWeight="500"
          onClick={onGenerate}
          isLoading={generating}
          loadingText="Generating"
          _hover={{ bg: "#1F3454" }}
          leftIcon={<RefreshCw size={16} />}
        >
          Generate Report
        </Button>
      </Flex>
    </Box>
  );
}
