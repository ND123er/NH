import React, { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

import ShiftSettingsSection from "./ShiftSettingsSection";
import ShiftTab from "./ShiftTab";

const ROSTER_GROUPS = [
  {
    type: "shift",
    id: "MORN",
    title: "Morning Shift",
    meta: "06:00 AM - 02:00 PM",
    status: "Published",
    employees: [
      { name: "Amit Kumar", id: "EMP001", department: "Engineering" },
      { name: "Neha Verma", id: "EMP004", department: "Sales" },
    ],
  },
  {
    type: "shift",
    id: "EVE",
    title: "Evening Shift",
    meta: "02:00 PM - 10:00 PM",
    status: "Published",
    employees: [
      { name: "Rahul Sharma", id: "EMP002", department: "Operations" },
      { name: "Sonia Das", id: "EMP005", department: "Support" },
    ],
  },
  {
    type: "shift",
    id: "NIGHT",
    title: "Night Shift",
    meta: "10:00 PM - 06:00 AM",
    status: "Published",
    employees: [
      { name: "Priya Singh", id: "EMP003", department: "HR" },
    ],
  },
  {
    type: "pattern",
    id: "PAT001",
    title: "3-Shift Weekly Rotation",
    meta: "21-day cycle • Morning / Evening / Night",
    status: "Draft",
    employees: [
      { name: "Amit Kumar", id: "EMP001", department: "Engineering" },
      { name: "Rahul Sharma", id: "EMP002", department: "Operations" },
      { name: "Priya Singh", id: "EMP003", department: "HR" },
    ],
    pattern: [
      { date: "Sep 14", day: "Mon", value: "Morning Shift", code: "M" },
      { date: "Sep 15", day: "Tue", value: "Morning Shift", code: "M" },
      { date: "Sep 16", day: "Wed", value: "Evening Shift", code: "E" },
      { date: "Sep 17", day: "Thu", value: "Evening Shift", code: "E" },
      { date: "Sep 18", day: "Fri", value: "Night Shift", code: "N" },
      { date: "Sep 19", day: "Sat", value: "OFF", code: "OFF" },
      { date: "Sep 20", day: "Sun", value: "OFF", code: "OFF" },
    ],
  },
];

const RosterCalendar = () => {
  const [viewMode, setViewMode] = useState("month");
  const [department, setDepartment] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [published, setPublished] = useState(false);

  const employees = useMemo(() => {
    const map = new Map();
    ROSTER_GROUPS.forEach((group) => {
      group.employees.forEach((person) => map.set(person.id, person));
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        ROSTER_GROUPS.flatMap((group) => group.employees.map((person) => person.department)),
      ),
    ).sort();
  }, []);

  const filteredGroups = useMemo(() => {
    return ROSTER_GROUPS.map((group) => ({
      ...group,
      employees: group.employees.filter((person) => {
        const matchesDepartment = department === "all" || person.department === department;
        const matchesEmployee = employee === "all" || person.id === employee;
        const matchesStatus = status === "all" || group.status.toLowerCase() === status;
        return matchesDepartment && matchesEmployee && matchesStatus;
      }),
    })).filter((group) => group.employees.length > 0);
  }, [department, employee, status]);

  const clearFilters = () => {
    setDepartment("all");
    setEmployee("all");
    setStatus("all");
  };

  return (
    <Box p={0} mt={3} fontFamily="poppins">
      <Box bg="white" borderRadius="14px" boxShadow="sm" overflow="hidden" minH="78vh">
        <ShiftTab />

        <Box px={{ base: 5, md: 7 }} py={6}>
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4} mb={5} flexWrap="wrap">
            <Box>
              <Text fontSize="20px" fontWeight="600" color="#274066">
                Roster Calendar
              </Text>
              <Text fontSize="12px" color="#667085" mt={1}>
                View the generated roster by shift or shift pattern without scrolling through every date.
              </Text>
            </Box>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant={viewMode === "month" ? "solid" : "outline"}
                bg={viewMode === "month" ? "#274066" : "white"}
                color={viewMode === "month" ? "white" : "#344054"}
                borderColor="#D0D5DD"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
              <Button
                size="sm"
                variant={viewMode === "week" ? "solid" : "outline"}
                bg={viewMode === "week" ? "#274066" : "white"}
                color={viewMode === "week" ? "white" : "#344054"}
                borderColor="#D0D5DD"
                onClick={() => setViewMode("week")}
              >
                Week
              </Button>
            </HStack>
          </Flex>

          <Box border="1px solid #E4E7EC" borderRadius="12px" p={4} mb={6}>
            <Flex gap={3} align="center" flexWrap="wrap">
              <Select value="September 2026" isReadOnly maxW="190px" size="sm" fontSize="12px">
                <option>September 2026</option>
              </Select>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)} maxW="190px" size="sm" fontSize="12px">
                <option value="all">All Departments</option>
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select value={employee} onChange={(e) => setEmployee(e.target.value)} maxW="220px" size="sm" fontSize="12px">
                <option value="all">All Employees</option>
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} maxW="160px" size="sm" fontSize="12px">
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
              <Button size="sm" variant="ghost" color="#667085" onClick={clearFilters}>
                Clear
              </Button>
              <Box ml="auto">
                <Button size="sm" variant="outline" borderColor="#D0D5DD" mr={2}>
                  Export
                </Button>
                <Button size="sm" bg="#274066" color="white" _hover={{ bg: "#1F3454" }} onClick={() => setPublished((value) => !value)}>
                  {published ? "Published" : "Publish Roster"}
                </Button>
              </Box>
            </Flex>
          </Box>

          <Flex gap={5} mb={5} align="center" flexWrap="wrap">
            <Text fontSize="12px" color="#475467">Roster view • {viewMode === "month" ? "Month" : "Week"}</Text>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="#3182CE" />
              <Text fontSize="11px" color="#667085">Assigned Shift</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="#98A2B3" />
              <Text fontSize="11px" color="#667085">OFF</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="#9F7AEA" />
              <Text fontSize="11px" color="#667085">Leave</Text>
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
            {filteredGroups.map((group) => (
              <Box key={group.id} border="1px solid #E4E7EC" borderRadius="14px" overflow="hidden" bg="white">
                <Flex justify="space-between" align="flex-start" gap={4} px={5} py={4}>
                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Text fontSize="15px" fontWeight="600" color="#274066">
                        {group.title}
                      </Text>
                      <Badge
                        fontSize="10px"
                        borderRadius="6px"
                        px={2}
                        py={0.5}
                        bg={group.status === "Published" ? "#ECFDF3" : "#FFFAEB"}
                        color={group.status === "Published" ? "#027A48" : "#B54708"}
                      >
                        {group.status}
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="#667085">{group.meta}</Text>
                  </Box>

                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#D0D5DD"
                    color="#344054"
                    onClick={() => setSelectedRoster(group)}
                  >
                    View
                  </Button>
                </Flex>

                <Divider />

                <Box px={5} py={4}>
                  <Text fontSize="11px" color="#98A2B3" mb={3}>
                    {group.employees.length} {group.employees.length === 1 ? "employee" : "employees"} assigned
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {group.employees.map((person) => (
                      <Flex key={person.id} align="center" justify="space-between" gap={3}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={person.name} />
                          <Box>
                            <Text fontSize="12px" fontWeight="600" color="#344054">{person.name}</Text>
                            <Text fontSize="10px" color="#98A2B3">{person.id} • {person.department}</Text>
                          </Box>
                        </HStack>
                        <Badge fontSize="10px" bg="#F8FAFC" color="#475467" border="1px solid #E4E7EC" borderRadius="6px">
                          {group.type === "pattern" ? "Pattern" : "Fixed"}
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>

          {filteredGroups.length === 0 && (
            <Box border="1px dashed #D0D5DD" borderRadius="12px" p={10} textAlign="center">
              <Text fontSize="13px" fontWeight="600" color="#344054">No roster entries found</Text>
              <Text fontSize="11px" color="#667085" mt={1}>Try clearing one or more filters.</Text>
            </Box>
          )}
        </Box>
      </Box>

      <Drawer isOpen={!!selectedRoster} placement="right" onClose={() => setSelectedRoster(null)} size="md">
        <DrawerOverlay />
        <DrawerContent fontFamily="poppins">
          <DrawerCloseButton />
          <DrawerHeader fontSize="17px" fontWeight="600" color="#274066" borderBottom="1px solid #E4E7EC">
            {selectedRoster?.title}
          </DrawerHeader>
          <DrawerBody py={5}>
            {selectedRoster && (
              <>
                <Box mb={5} p={4} bg="#F8FAFC" borderRadius="10px">
                  <Text fontSize="11px" color="#667085">Assigned employees</Text>
                  <Stack spacing={2} mt={3}>
                    {selectedRoster.employees.map((person) => (
                      <Flex key={person.id} justify="space-between" align="center">
                        <Text fontSize="12px" color="#344054" fontWeight="600">{person.name}</Text>
                        <Text fontSize="10px" color="#98A2B3">{person.department}</Text>
                      </Flex>
                    ))}
                  </Stack>
                </Box>

                {selectedRoster.pattern ? (
                  <>
                    <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Date-wise pattern</Text>
                    <VStack align="stretch" spacing={0} border="1px solid #E4E7EC" borderRadius="10px" overflow="hidden">
                      {selectedRoster.pattern.map((entry, index) => (
                        <Flex
                          key={`${entry.date}-${entry.value}`}
                          px={4}
                          py={3}
                          justify="space-between"
                          align="center"
                          bg={index % 2 === 0 ? "white" : "#FBFCFE"}
                          borderBottom={index === selectedRoster.pattern.length - 1 ? "none" : "1px solid #F0F2F5"}
                        >
                          <Box>
                            <Text fontSize="11px" color="#98A2B3">{entry.day}</Text>
                            <Text fontSize="12px" fontWeight="600" color="#344054">{entry.date}</Text>
                          </Box>
                          <HStack spacing={2}>
                            <Badge
                              borderRadius="6px"
                              px={2}
                              py={1}
                              fontSize="10px"
                              bg={entry.value === "OFF" ? "#F2F4F7" : "#EEF4FF"}
                              color={entry.value === "OFF" ? "#667085" : "#274066"}
                            >
                              {entry.code}
                            </Badge>
                            <Text fontSize="11px" color="#475467">{entry.value}</Text>
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                    <Text fontSize="10px" color="#98A2B3" mt={3}>
                      The roster detail is shown here date-wise; the main calendar stays grouped by shift or pattern.
                    </Text>
                  </>
                ) : (
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#344054" mb={3}>Roster details</Text>
                    <Box border="1px solid #E4E7EC" borderRadius="10px" p={4}>
                      <Text fontSize="11px" color="#667085">Shift</Text>
                      <Text fontSize="14px" fontWeight="600" color="#344054" mt={1}>{selectedRoster.title}</Text>
                      <Text fontSize="11px" color="#98A2B3" mt={1}>{selectedRoster.meta}</Text>
                    </Box>
                  </Box>
                )}

                <Flex justify="flex-end" mt={6}>
                  <Button size="sm" variant="outline" onClick={() => setSelectedRoster(null)}>
                    Close
                  </Button>
                </Flex>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default RosterCalendar;
