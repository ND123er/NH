import React, { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Box,
  Button,
  VStack,
  Text,
  Checkbox,
  HStack,
  Divider,
  Stack,
  Spinner,
  Flex,
  MenuDivider,
  useToast,
  Image,
  position,
} from "@chakra-ui/react";
import filter from "../../../assets/filter.svg";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function FilterDropdownLeave({
  onApply,
  onClear,
  defaultSelected = {},
  showHolidayType
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    departments: [],
    locations: [],
    positions: [],
  });

  // selected stores IDs (arrays)
  const [selected, setSelected] = useState({
    departments: defaultSelected.departments || [],
    locations: defaultSelected.locations || [],
    holidayType: defaultSelected.holidayType || [],
  });
  // org id fallback
  const orgId =
    (typeof getOrgCode === "function" && getOrgCode()) ||
    (typeof window !== "undefined" && localStorage.getItem("org_code"));

  // Holiday type options (static)
  const holidayTypeOptions = [
    { id: "PUBLIC", label: "Public Holiday" },
    { id: "COMPANY", label: "Company Holiday" },
  ];

  // Lazy load departments and locations on menu open
  const fetchData = async () => {
    if (options.departments.length > 0) return; // only fetch once
    try {
      setLoading(true);
      // const base = api.defaults.baseURL?.replace(/\/$/, "") || "";

      const endpoints = {
        departments: `/organization/get_departments/${encodeURIComponent(
          orgId || ""
        )}`,
        locations: `/organization/get_locations/${encodeURIComponent(
          orgId || ""
        )}`,
        position: `/organization/get_org_job_titles/${encodeURIComponent(
          orgId || ""
        )}`,
      };
      // const url = `/settings/get_job_titles?org_id=${encodeURIComponent(org)}`;

      const [departmentRes, locationRes, positionRes] = await Promise.allSettled([
        api.get(endpoints.departments),
        api.get(endpoints.locations),
        api.get(endpoints.position),
      ]);

      // robust extractor
      const extractList = (res) => {
        if (!res || res.status !== "fulfilled") return [];
        const payload = res.value?.data ?? {};
        if (Array.isArray(payload)) return payload;
        const candidates = ["departments", "locations", "data"];
        for (const k of candidates) {
          if (Array.isArray(payload[k])) return payload[k];
        }
        const vals = Object.values(payload);
        for (const v of vals) {
          if (Array.isArray(v)) return v;
        }
        return [];
      };

      const departmentRaw = extractList(departmentRes);
      const locationsRaw = extractList(locationRes);
      const positionRaw = extractList(positionRes);


      const departments = departmentRaw.map((it) => ({
        id: it._id,
        label: it.department_name || it.name || String(it._id || ""),
        raw: it,
      }));

      const locations = locationsRaw.map((it) => ({
        id: it._id,
        label: it.location_name || it.location || it.name || "-",
        raw: it,
      }));
      const positions = positionRaw.map((it) => ({
        id: it._id,
        label: it.position_name || it.name || "-",
        raw: it,
      }));

      setOptions({ departments, locations, positions });
    } catch (err) {
      console.error("Filter options fetch failed", err);
      toast({ title: "Failed to load filters", status: "error" });
      setOptions({ departments: [], locations: [], positions: [] });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (group, id) => {
    setSelected((prev) => {
      const setOf = new Set(prev[group] || []);
      if (setOf.has(id)) setOf.delete(id);
      else setOf.add(id);

      const next = { ...prev, [group]: Array.from(setOf) };

      // trigger API immediately
      if (onApply) onApply(next);

      return next;
    });
  };

  const clearAll = () => {
    const empty = { departments: [], locations: [], holidayType: [], positions: [] };
    setSelected(empty);
    if (onClear) onClear();
  };

  const thinScrollbar = {
    scrollbarWidth: "thin",
    scrollbarColor: "#c1c1c1 transparent",

    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "4px",
    },
  };

  const Group = ({ title, itemsKey, items }) => (
    <Box>
      <Text fontSize="sm" fontWeight={700} mb={2}>
        {title}
      </Text>

      <Box maxH="130px" overflowY="auto" pr={2} sx={thinScrollbar}>
        <VStack align="start" spacing={2}>
          {items.length === 0 ? (
            <Text fontSize="xs" color="gray.500">
              No options
            </Text>
          ) : (
            items.map((it) => (
              <Checkbox
                key={it.id}
                isChecked={(selected[itemsKey] || []).includes(it.id)}
                onChange={() => toggle(itemsKey, it.id)}
                fontSize="sm"
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
                {it.label}
              </Checkbox>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );

  return (
    <Menu closeOnSelect={false} onOpen={fetchData}>
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
        leftIcon={<Image src={filter} boxSize="14px" alt="filter" />}
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
        Filter
      </MenuButton>

      <MenuList
        minW="300px"
        maxW="360px"
        borderRadius="8px"
        p={3}
        boxShadow="lg"
      >
        {loading ? (
          <Flex align="center" justify="center" py={6}>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Box maxH="320px" overflowY="auto" pr={2} mb={3} sx={thinScrollbar}>
              <Stack spacing={4}>
                <Group
                  title="Departments"
                  itemsKey="departments"
                  items={options.departments}
                />
                <Divider />
                <Group
                  title="Locations"
                  itemsKey="locations"
                  items={options.locations}
                />
                {/* <Divider /> */}
                {showHolidayType && (
                  <>
                    <Divider />
                    <Group
                      title="Holiday Type"
                      itemsKey="holidayType"
                      items={holidayTypeOptions}
                    />
                  </>
                )}
              </Stack>
            </Box>

            <MenuDivider />

            <HStack justify="center" mt={2}>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </HStack>
          </>
        )}
      </MenuList>
    </Menu>
  );
}
