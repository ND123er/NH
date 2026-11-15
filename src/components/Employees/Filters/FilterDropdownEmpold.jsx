import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  memo,
} from "react";
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
} from "@chakra-ui/react";
import filter from "../../../assets/filter.svg";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function FilterDropdownEmp({
  onApply,
  onClear,
  defaultSelected = {},
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const scrollPositionsRef = useRef({});
  const [options, setOptions] = useState({
    departments: [],
    positions: [],
    rules: [],
    locations: [],
  });

  // selected stores IDs (arrays)
  const [selected, setSelected] = useState({
    departments: defaultSelected.departments || [],
    positions: defaultSelected.positions || [],
    rules: defaultSelected.rules || [],
    locations: defaultSelected.locations || [],
  });

  // org id fallback
  const orgId =
    (typeof getOrgCode === "function" && getOrgCode()) ||
    (typeof window !== "undefined" && localStorage.getItem("org_code"));

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const base = api.defaults.baseURL?.replace(/\/$/, "") || "";

        const endpoints = {
          departments: `${base}/organization/get_departments/${encodeURIComponent(
            orgId || "",
          )}`,
          positions: `${base}/organization/get_org_job_titles/${encodeURIComponent(
            orgId || "",
          )}`,
          roles: `${base}/organization/get_org_roles/${encodeURIComponent(
            orgId || "",
          )}`,
          locations: `${base}/organization/get_locations/${encodeURIComponent(
            orgId || "",
          )}`,
        };

        const [departmentRes, positionRes, roleRes, locationRes] =
          await Promise.allSettled([
            api.get(endpoints.departments),
            api.get(endpoints.positions),
            api.get(endpoints.roles),
            api.get(endpoints.locations),
          ]);

        const extractList = (res) => {
          if (!res || res.status !== "fulfilled") return [];
          const payload = res.value?.data ?? {};

          if (Array.isArray(payload)) return payload;
          const candidates = [
            "departments",
            "department_ids",
            "positions",
            "position_ids",
            "roles",
            "role_ids",
            "locations",
            "location_ids",
            "data",
          ];

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
        const positionRaw = extractList(positionRes);
        const rolesRaw = extractList(roleRes);
        const locationsRaw = extractList(locationRes);

        const departments = departmentRaw.map((it) => ({
          id: it._id,
          label:
            it.department_name ||
            it.name ||
            it.category_name ||
            String(it._id || ""),
          raw: it,
        }));

        const positions = positionRaw.map((it) => ({
          id: it._id,
          label:
            it.position_name || it.job_title || it.name || String(it._id || ""),
          raw: it,
        }));

        const rules = rolesRaw.map((it) => ({
          id: it?._id,
          label: it?.role_name || it?.name || String(it?._id || ""),
          raw: it,
        }));

        const locations = locationsRaw.map((it) => ({
          id: it._id,
          label: it.location_name || it.location || it.name || "-",
          raw: it,
        }));

        const newOptions = { departments, positions, rules, locations };

        // -------- OPTION A: Prevent unnecessary re-render ----------
        const sameById = (a = [], b = []) => {
          if (a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++) {
            if ((a[i]?.id ?? a[i]) !== (b[i]?.id ?? b[i])) {
              return false;
            }
          }
          return true;
        };

        setOptions((prev) => {
          if (
            sameById(prev.departments, newOptions.departments) &&
            sameById(prev.positions, newOptions.positions) &&
            sameById(prev.rules, newOptions.rules) &&
            sameById(prev.locations, newOptions.locations)
          ) {
            // Data unchanged → prevent re-render → scroll preserved
            return prev;
          }
          return newOptions;
        });
        // ------------------------------------------------------------
      } catch (err) {
        console.error("Filter options fetch failed", err);
        toast({ title: "Failed to load filters", status: "error" });

        setOptions({
          departments: [],
          positions: [],
          rules: [],
          locations: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchAll();
    } else {
      setLoading(false);
      setOptions({
        departments: [],
        positions: [],
        rules: [],
        locations: [],
      });
    }
  }, [orgId]); // removed toast dependency to prevent unnecessary reruns

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
    const empty = { departments: [], positions: [], rules: [], locations: [] };
    setSelected(empty);
    if (onClear) onClear();
  };

  // const apply = () => {
  //   if (onApply) onApply(selected);
  // };

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

  // const Group = ({ title, itemsKey, items }) => {
  //   const boxRef = useRef(null);
  //   // Save scroll position when it changes
  //   useLayoutEffect(() => {
  //     console.log('11111111')
  //     if (boxRef.current) {
  //       console.log('222222222')
  //       scrollPositionsRef.current[itemsKey] = boxRef.current.scrollTop;
  //     }
  //   }, [selected, itemsKey]);

  //   // Restore scroll position after render
  //   useLayoutEffect(() => {
  //     console.log('333333333333333')

  //     if (boxRef.current && scrollPositionsRef.current[itemsKey] !== undefined) {
  //       console.log('44444444444444444')
  //       boxRef.current.scrollTop = scrollPositionsRef.current[itemsKey];
  //     }
  //   }, [itemsKey]);

  //   return (
  //     <Box>
  //       <Text fontSize="sm" fontWeight={700} mb={2}>
  //         {title}
  //       </Text>

  //       <Box
  //         ref={boxRef}
  //         maxH="130px"
  //         overflowY="auto"
  //         pr={2}
  //         sx={thinScrollbar}
  //       >
  //         <VStack align="start" spacing={2}>
  //           {items.length === 0 ? (
  //             <Text fontSize="xs" color="gray.500">
  //               No options
  //             </Text>
  //           ) : (
  //             items.map((it) => (
  //               <Checkbox
  //                 key={it.id}
  //                 isChecked={(selected[itemsKey] || []).includes(it.id)}
  //                 onChange={() => toggle(itemsKey, it.id)}
  //                 fontSize="sm"
  //                 sx={{
  //                   ".chakra-checkbox__control": {
  //                     borderColor: "#cccccc",
  //                   },
  //                   ".chakra-checkbox__control[data-checked]": {
  //                     bg: "#274066",
  //                     borderColor: "#274066",
  //                     color: "white",
  //                   },
  //                 }}
  //               >
  //                 {it.label}
  //               </Checkbox>
  //             ))
  //           )}
  //         </VStack>
  //       </Box>
  //     </Box>
  //   );
  // };

  const Group = memo(({ title, itemsKey, items, selected, toggle }) => {
    const boxRef = useRef(null);

    // Restore scroll once after items mount
    useLayoutEffect(() => {
      const el = boxRef.current;
      if (el && scrollPositionsRef.current[itemsKey] !== undefined) {
        el.scrollTop = scrollPositionsRef.current[itemsKey];
      }
    }, [items]);

    // Save scroll on user scroll
    useEffect(() => {
      const el = boxRef.current;
      if (!el) return;

      const handleScroll = () => {
        scrollPositionsRef.current[itemsKey] = el.scrollTop;
      };

      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }, [itemsKey]);

    return (
      <Box>
        <Text fontSize="sm" fontWeight={700} mb={2}>
          {title}
        </Text>
        <Box
          ref={boxRef}
          maxH="130px"
          overflowY="auto"
          pr={2}
          sx={thinScrollbar}
        >
          <VStack align="start" spacing={2}>
            {items.length === 0 ? (
              <Text fontSize="xs" color="gray.500">
                No options
              </Text>
            ) : (
              items.map((it) => (
                <Checkbox
                  key={it.id}
                  isChecked={selected[itemsKey]?.includes(it.id)}
                  onChange={() => toggle(itemsKey, it.id)}
                  fontSize="sm"
                  sx={{
                    ".chakra-checkbox__control": { borderColor: "#cccccc" },
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
  });

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
        pt={3}
        px={3}
        pb="0px"
        boxShadow="lg"
      >
        {loading ? (
          <Flex align="center" justify="center" py={6}>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Box maxH="280px" overflowY="auto" pr={2} mb={0} sx={thinScrollbar}>
              <Stack spacing={4}>
                <Group
                  title="Departments"
                  itemsKey="departments"
                  items={options.departments}
                  selected={selected}
                  toggle={toggle}
                />
                <Divider />
                <Group
                  title="Designation"
                  itemsKey="positions"
                  items={options.positions}
                  selected={selected}
                  toggle={toggle}
                />
                <Divider />
                <Group
                  title="Roles"
                  itemsKey="rules"
                  items={options.rules}
                  selected={selected}
                  toggle={toggle}
                />
                <Divider />
                <Group
                  title="Locations"
                  itemsKey="locations"
                  items={options.locations}
                  selected={selected}
                  toggle={toggle}
                />
              </Stack>
              {/* <MenuDivider /> */}

              <HStack
                position="sticky"
                bottom="0"
                left="0"
                right="0"
                justify="center"
                bg="#fff"
                py="10px"
                borderTop="1px solid"
                borderColor="gray.300"
                mt={2}
              >
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </HStack>
            </Box>
          </>
        )}
      </MenuList>
    </Menu>
  );
}
