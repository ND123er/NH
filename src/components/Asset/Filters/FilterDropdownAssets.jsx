// src/components/filters/FilterDropdownAssets.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

export default function FilterDropdownAssets({
  onApply,
  onClear,
  defaultSelected = {},
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    categories: [],
    vendors: [],
    brands: [],
    locations: [],
  });
  const scrollPositionsRef = useRef({});

  // selected stores IDs (arrays)
  const [selected, setSelected] = useState({
    categories: defaultSelected.categories || [],
    vendors: defaultSelected.vendors || [],
    brands: defaultSelected.brands || [],
    locations: defaultSelected.locations || [],
  });

  // org id fallback
  const orgId = getOrgCode && getOrgCode();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // const base = api.defaults.baseURL?.replace(/\/$/, "");

        const endpoints = {
          categories: `/organization/get_asset_categories/${encodeURIComponent(
            orgId
          )}`,
          vendors: `/organization/get_asset_vendors/${encodeURIComponent(
            orgId
          )}`,
          brands: `/organization/get_asset_brands/${encodeURIComponent(
            orgId
          )}`,
          locations: `/organization/get_locations/${encodeURIComponent(
            orgId
          )}`,
        };

        const [cRes, vRes, bRes, lRes] = await Promise.allSettled([
          api.get(endpoints.categories),
          api.get(endpoints.vendors),
          api.get(endpoints.brands),
          api.get(endpoints.locations),
        ]);

        const safeData = (res, key) => {
          if (!res || res.status !== "fulfilled") return [];
          const data = res.value?.data ?? {};
          const list = data[key] ?? [];
          return list;
        };

        const categoriesRaw = safeData(cRes, "asset_categories");
        const vendorsRaw = safeData(vRes, "vendors");
        const brandsRaw = safeData(bRes, "brands");
        const locationsRaw = safeData(lRes, "locations");

        const categories = categoriesRaw.map((it) => ({
          id: it._id,
          label: it.category_name,
          raw: it,
        }));
        const vendors = vendorsRaw.map((it) => ({
          id: it._id,
          label: it.vendor_name,
          raw: it,
        }));
        const brands = brandsRaw.map((it) => ({
          id: it._id,
          label: it.brand_name,
          raw: it,
        }));
        const locations = locationsRaw.map((it) => ({
          id: it._id,
          label: it.location_name || it.location || "-",
          raw: it,
        }));

        setOptions({ categories, vendors, brands, locations });
      } catch (err) {
        console.error("Filter options fetch failed", err);
        toast({ title: "Failed to load filters", status: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // const toggle = (group, id) => {
  //   setSelected((prev) => {
  //     const setOf = new Set(prev[group] || []);
  //     if (setOf.has(id)) setOf.delete(id);
  //     else setOf.add(id);
  //     return { ...prev, [group]: Array.from(setOf) };
  //   });
  // };

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
    const empty = { categories: [], vendors: [], brands: [], locations: [] };
    setSelected(empty);
    if (onClear) onClear();
  };

  // const apply = () => {
  //   if (onApply) onApply(selected);
  // };

  // const Group = ({ title, itemsKey, items }) => (
  //   <Box>
  //     <Text fontSize="sm" fontWeight={700} mb={2}>
  //       {title}
  //     </Text>

  //     <Box maxH="130px" overflowY="auto" pr={2} sx={thinScrollbar}>
  //       <VStack align="start" spacing={2}>
  //         {items.length === 0 ? (
  //           <Text fontSize="xs" color="gray.500">
  //             No options
  //           </Text>
  //         ) : (
  //           items.map((it) => (
  //             <Checkbox
  //               key={it.id}
  //               isChecked={(selected[itemsKey] || []).includes(it.id)}
  //               onChange={() => toggle(itemsKey, it.id)}
  //               fontSize="sm"
  //                sx={{
  //               ".chakra-checkbox__control": {
  //                 borderColor: "#cccccc",
  //               },
  //               ".chakra-checkbox__control[data-checked]": {
  //                 bg: "#274066",
  //                 borderColor: "#274066",
  //                 color: "white",
  //               },
  //             }}
  //             >
  //               {it.label}
  //             </Checkbox>
  //           ))
  //         )}
  //       </VStack>
  //     </Box>
  //   </Box>
  // );

  const Group = React.memo(({ title, itemsKey, items, selected, toggle }) => {
    const boxRef = useRef(null);

    // Restore scroll after items render
    useLayoutEffect(() => {
      const el = boxRef.current;
      if (el && scrollPositionsRef.current[itemsKey] !== undefined) {
        el.scrollTop = scrollPositionsRef.current[itemsKey];
      }
    }, [items]);

    // Save scroll position on scroll
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
  });


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
                  title="Asset Categories"
                  itemsKey="categories"
                  items={options?.categories}
                  selected={selected}
                  toggle={toggle}
                />
                <Divider />
                <Group
                  title="Vendors"
                  itemsKey="vendors"
                  items={options?.vendors}
                  selected={selected}
                  toggle={toggle}
                />
                <Divider />
                <Group
                  title="Brands"
                  itemsKey="brands"
                  items={options?.brands}
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
            </Box>

            <MenuDivider />

            {/* <HStack justify="space-between" mt={2}>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={apply}
                _hover={{ bg: "blue.800", color: "white" }}
                bg={"#1A365D"}
                color={"white"}
              >
                Apply
              </Button>
            </HStack> */}
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
