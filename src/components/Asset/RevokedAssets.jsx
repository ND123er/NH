import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  CloseButton,
  IconButton,
  Button,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  HStack,
  Stack,
  useToast,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { FaClipboardList, FaFileExcel } from "react-icons/fa";
import { AiOutlineFile, AiOutlineCheckCircle } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";

import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";
import FilterDropdown from "./Filters/FilterDropdownAssets";
import SortDropdownAssets from "./Filters/SortDropdownAssets";
import AssignAssetModal from "./AssignAssetModal";
import assign from "../../assets/assign.png";
import calendar_filter from "../../assets/calendar_filter.svg";

export default function RevokedAssets() {
  const toast = useToast();
  const {
    isOpen: isCalendarOpen,
    onOpen: onCalendarOpen,
    onClose: onCalendarClose,
  } = useDisclosure();

  // date default display and ISO helper
  const todayISO = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  })();

  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState(() => {
    const t = new Date();
    const dd = String(t.getDate()).padStart(2, "0");
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const yyyy = t.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });

  const [revokedRaw, setRevokedRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    vendors: [],
    brands: [],
    locations: [],
  });
  const handleFilterApply = (filters) =>
    setSelectedFilters(
      filters || { categories: [], vendors: [], brands: [], locations: [] }
    );
  const handleFilterClear = () =>
    setSelectedFilters({
      categories: [],
      vendors: [],
      brands: [],
      locations: [],
    });

  // search debounce
  const searchDebounceRef = useRef(null);

  // if date range applied
  const appliedRangeRef = useRef(false);

  // sort state
  const [sortState, setSortState] = useState({
    sortBy: null,
    sortOrder: null,
  });

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const searchInputStyle = {
    fontFamily: "Poppins",
    fontSize: "14px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "35px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "8px",
  };

  // Build and call API for revoked assets with optional filters/search/date/sort
  const fetchRevokedAssets = async (opts = {}) => {
    const {
      from = null,
      to = null,
      q = null,
      filters = null,
      sortBy = null,
      sortOrder = null,
    } = opts;
    try {
      setLoading(true);
      setError(null);

      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      if (!orgId) {
        setRevokedRaw([]);
        setError("Organization id not found");
        return;
      }

      const params = new URLSearchParams();
      params.append("org_id", orgId);
      if (q && String(q).trim() !== "")
        params.append("search", String(q).trim());
      if (from) params.append("from_date", from);
      if (to) params.append("to_date", to);

      // filters: arrays of mongo _id strings
      const f = filters || selectedFilters;
      if (f) {
        if (f.categories && f.categories.length > 0)
          params.append("category", f.categories.join(","));
        if (f.vendors && f.vendors.length > 0)
          params.append("vendor", f.vendors.join(","));
        if (f.brands && f.brands.length > 0)
          params.append("brand", f.brands.join(","));
        if (f.locations && f.locations.length > 0)
          params.append("location", f.locations.join(","));
      }

      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder !== null && sortOrder !== undefined)
        params.append("sortOrder", String(sortOrder));

      const url = `/assets/revoked_asset_list?${params.toString()}`;
      const res = await api.get(url);
      const result = res?.data?.data ?? res?.data?.result ?? [];
      setRevokedRaw(result);
    } catch (err) {
      console.error("Failed to fetch revoked assets", err);
      setError(err?.message || "Failed to load revoked assets");
      setRevokedRaw([]);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch (no filters)
  useEffect(() => {
    fetchRevokedAssets({
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });
  }, []);

  // refetch when filters change include sort
  useEffect(() => {
    fetchRevokedAssets({
      from: appliedRangeRef.current ? fromDate : null,
      to: appliedRangeRef.current ? toDate : null,
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });
  }, [selectedFilters]);

  // call API when user types (debounced) + sort & filters
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      fetchRevokedAssets({
        from: appliedRangeRef.current ? fromDate : null,
        to: appliedRangeRef.current ? toDate : null,
        q: search,
        filters: selectedFilters,
        sortBy: sortState.sortBy,
        sortOrder: sortState.sortOrder,
      });
    }, 500);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  // handle sort apply and clear (used by SortDropdownAssets)
  const handleSortApply = ({ sortBy, sortOrder } = {}) => {
    setSortState({ sortBy: sortBy || null, sortOrder: sortOrder ?? null });
    // fetch immediately with new sort
    fetchRevokedAssets({
      from: appliedRangeRef.current ? fromDate : null,
      to: appliedRangeRef.current ? toDate : null,
      q: search,
      filters: selectedFilters,
      sortBy: sortBy || null,
      sortOrder: sortOrder ?? null,
    });
  };

  const handleSortClear = () => {
    setSortState({ sortBy: null, sortOrder: null });
    fetchRevokedAssets({
      from: appliedRangeRef.current ? fromDate : null,
      to: appliedRangeRef.current ? toDate : null,
      q: search,
      filters: selectedFilters,
    });
  };

  // normalize API item -> display item
  const normalizeItem = (item, idx) => {
    return {
      id: item.asset_id || item._id || String(idx),
      name: item.asset_name || "-",
      assetId: item.asset_code || item.asset_id || "-",
      serialNumber: item.serial_number || "-",
      category: item.category || item.category_name || "-",
      vendor: item.vendor || item.vendor_name || "-",
      brand: item.brand || item.brand_name || "-",
      location: item.location || item.location_name || "-",
      revoked_from: item.revoked_from || item.revokedFrom || "-",
      revoked_on: item.revoked_on || item.revokedOn || null,
      raw: item,
    };
  };

  const displayItems = revokedRaw.map((a, i) => normalizeItem(a, i));

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // client-side safety filter for quick search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return displayItems;
    return displayItems.filter((it) => {
      return (
        (it.name || "").toLowerCase().includes(q) ||
        (it.assetId || "").toLowerCase().includes(q) ||
        (it.serialNumber || "").toLowerCase().includes(q) ||
        (it.category || "").toLowerCase().includes(q) ||
        (it.vendor || "").toLowerCase().includes(q) ||
        (it.brand || "").toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q) ||
        (it.revoked_from || "").toLowerCase().includes(q) ||
        formatDate(it.revoked_on).toLowerCase().includes(q)
      );
    });
  }, [displayItems, search]);

  // calendar apply / clear handlers
  const onApplyDateRange = async () => {
    if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      toast({
        title: "Invalid date range",
        description: "From date cannot be after To date.",
        status: "error",
      });
      return;
    }

    appliedRangeRef.current = true;

    const toDisplay = (iso) => {
      if (!iso) return "";
      const [y, m, d] = iso.split("-");
      return `${d}-${m}-${y}`;
    };
    setDate(`${toDisplay(fromDate)} - ${toDisplay(toDate)}`);

    // fetch with date filter + current search/filters/sort
    await fetchRevokedAssets({
      from: fromDate,
      to: toDate,
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });

    onCalendarClose();
    toast({
      title: "Date range applied",
      description: `${toDisplay(fromDate)} → ${toDisplay(toDate)}`,
      status: "info",
      duration: 2000,
    });
  };

  const onClearDateRange = async () => {
    appliedRangeRef.current = false;

    setFromDate(todayISO);
    setToDate(todayISO);
    const [y, m, d] = todayISO.split("-");
    setDate(`${d}-${m}-${y}`);

    // fetch without date filters (but keep search, filters, sort)
    await fetchRevokedAssets({
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });

    onCalendarClose();
  };

  // Open assign modal for selected item
  const openAssignModalFor = (item) => {
    setSelectedAsset(item);
    setAssignModalOpen(true);
  };

  // Called by AssignAssetModal after a successful assignment
  const handleAssignConfirm = async (payload) => {
    try {
      // remove assigned asset from revoked list
      setRevokedRaw((prev) =>
        prev.filter((r) => {
          const codeFromList =
            r.asset_id || r._id || r.asset_code || r.assetId || "";
          const payloadId = payload?.asset_id || payload?.asset_id || "";
          const payloadCode = payload?.asset_code || payload?.asset_code || "";
          // compare by id or code (string compare)
          const matchById =
            payloadId && String(codeFromList) === String(payloadId);
          const matchByCode =
            payloadCode && String(codeFromList) === String(payloadCode);
          // If it matches the assigned asset, remove it from revoked list
          return !(matchById || matchByCode);
        })
      );
    } catch (err) {
      console.error("Optimistic update failed", err);
    } finally {
      try {
        await fetchRevokedAssets({
          from: appliedRangeRef.current ? fromDate : null,
          to: appliedRangeRef.current ? toDate : null,
          q: search,
          filters: selectedFilters,
          sortBy: sortState.sortBy,
          sortOrder: sortState.sortOrder,
        });
      } catch (e) {
        console.error("Re-fetch after assign failed", e);
      }
    }
  };

  return (
    <Box
      bg="white"
      p={4}
      shadow="sm"
      mt={4}
      borderColor="gray.100"
      border="1px solid #cccccc"
      fontFamily="Poppins"
      borderRadius={"14px"}
    >
      {/* Header: Title + controls */}
      <Box
        mx={-4}
        mb={2}
        pr={4}
        pl={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
        }}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" fontFamily={'Poppins'}>Revoked Assets</Heading>

          <Flex gap={3} align="center">
            {/* Search */}
            <InputGroup size="sm" w="130px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                {...searchInputStyle}
              />
              {search && (
                <InputRightElement>
                  <CloseButton size="sm" onClick={() => setSearch("")} />
                </InputRightElement>
              )}
            </InputGroup>

            {/* Filter Button */}
            <Box>
              <FilterDropdown
                onApply={(f) => {
                  handleFilterApply(f);
                  // immediate fetch with applied filters + current sort/search/date
                  fetchRevokedAssets({
                    from: appliedRangeRef.current ? fromDate : null,
                    to: appliedRangeRef.current ? toDate : null,
                    q: search,
                    filters: f,
                    sortBy: sortState.sortBy,
                    sortOrder: sortState.sortOrder,
                  });
                }}
                onClear={() => {
                  handleFilterClear();
                  fetchRevokedAssets({
                    from: appliedRangeRef.current ? fromDate : null,
                    to: appliedRangeRef.current ? toDate : null,
                    q: search,
                    filters: {
                      categories: [],
                      vendors: [],
                      brands: [],
                      locations: [],
                    },
                    sortBy: sortState.sortBy,
                    sortOrder: sortState.sortOrder,
                  });
                }}
                defaultSelected={selectedFilters}
              />
            </Box>

            {/* Sort Button */}
            <Box>
              <SortDropdownAssets
                defaultSort={{
                  sortBy: sortState.sortBy,
                  sortOrder: sortState.sortOrder,
                }}
                onApply={(sortObj) => {
                  // sortObj: { sortBy, sortOrder } as implemented in SortDropdownAssets
                  handleSortApply(sortObj);
                }}
                onClear={() => {
                  handleSortClear();
                }}
              />
            </Box>

            {/* Calendar button (From/To popup) */}
            <Box>
              <Menu isOpen={isCalendarOpen} onClose={onCalendarClose}>
                <MenuButton
                  as={Button}
                  onClick={onCalendarOpen}
                  w="35px"
                  h="35px"
                  minW="35px"
                  p={0}
                  bg="white"
                  borderRadius="8px"
                  border="1.5px solid #cccccc"
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
                  <Flex w="100%" h="100%" align="center" justify="center">
                    <Image
                      src={calendar_filter}
                      alt="Assign"
                      boxSize="18px"
                      objectFit="contain"
                    />
                  </Flex>
                </MenuButton>

                <MenuList minW="260px" p={3}>
                  <Stack spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        From
                      </Text>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          {/* <IoMdCalendar style={{ opacity: 0.8 }} /> */}
                          <Image
                            src={calendar_filter}
                            opacity={0.8}
                            color="#858585"
                          />
                        </InputLeftElement>
                        <Input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        To
                      </Text>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          {/* <IoMdCalendar style={{ opacity: 0.8 }} /> */}
                          <Image
                            src={calendar_filter}
                            opacity={0.8}
                            color="#858585"
                          />
                        </InputLeftElement>
                        <Input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    <Flex gap={2} justify="space-between" pt={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearDateRange}
                        color={"#757575"}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        _hover={{ bg: "blue.800", color: "white" }}
                        border={"1px solid #1A365D"}
                        bg={"#1A365D"}
                        color="white"
                        onClick={onApplyDateRange}
                      >
                        Apply
                      </Button>
                    </Flex>
                  </Stack>
                </MenuList>
              </Menu>
            </Box>

            {/* Menu Button */}
            <Box overflow="hidden">
              <Menu>
                <MenuButton
                  as={Button}
                  w="35px"
                  h="35px"
                  minW="35px"
                  p={0}
                  bg="white"
                  borderRadius="8px"
                  border="1.5px solid #cccccc"
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
                  <Flex w="100%" h="100%" align="center" justify="center">
                    <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                  </Flex>
                </MenuButton>

                <MenuList minW="220px" borderRadius="8px" boxShadow="lg" py={0}>
                  <MenuItem px={4} py={3}>
                    <HStack spacing={3}>
                      <Box
                        borderRadius="md"
                        p={2}
                        bg="gray.50"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="36px"
                        minH="36px"
                      >
                        <Icon as={AiOutlineFile} boxSize={5} color="gray.700" />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          Export as .csv
                        </Text>
                      </Box>
                    </HStack>
                  </MenuItem>

                  <MenuDivider m={0} />

                  <MenuItem px={4} py={3}>
                    <HStack spacing={3} align="center" w="100%">
                      <Box
                        borderRadius="md"
                        p={2}
                        bg="gray.50"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="36px"
                        minH="36px"
                      >
                        <Icon as={FaFileExcel} boxSize={5} color="green.600" />
                      </Box>

                      <Box flex="1">
                        <Text fontSize="sm" fontWeight={600} color="gray.800">
                          Export as .xls
                        </Text>
                      </Box>

                      <Icon
                        as={AiOutlineCheckCircle}
                        boxSize={5}
                        color="green.500"
                      />
                    </HStack>
                  </MenuItem>

                  <MenuDivider m={0} />

                  <MenuItem px={4} py={3}>
                    <HStack spacing={3}>
                      <Box
                        borderRadius="md"
                        p={2}
                        bg="gray.50"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="36px"
                        minH="36px"
                      >
                        <Icon as={FiUpload} boxSize={5} color="gray.700" />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          Import
                        </Text>
                      </Box>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Table */}
      <Box mx={-4}>
        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner />
          </Flex>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : filtered.length === 0 ? (
          <Text
          textAlign="center"
          >No revoked assets found</Text>
        ) : (
          <Table
            variant="striped"
            size="sm"
            sx={{
              "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
              "& tbody tr:nth-of-type(even) td": { background: "white" },
            }}
          >
            <Thead>
              <Tr>
                {[
                  "Serial Number",
                  "Asset Name",
                  "Asset Category Code",
                  "Category",
                  "Revoked from",
                  "Revoked on",
                  "Action",
                ].map((label) => (
                  <Th
                    key={label}
                    fontFamily="Poppins, sans-serif"
                    fontWeight={600}
                    fontSize="14px"
                    textTransform="none"
                    letterSpacing="-0.42px"
                    color="black"
                    whiteSpace="nowrap"
                    px={4}
                    py={2.5}
                  >
                    {label}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((it) => (
                <Tr key={it.id}>
                  <Td>{it.serialNumber}</Td>
                  <Td>{it.name}</Td>
                  <Td>{it.assetId}</Td>
                  <Td>{it.category}</Td>
                  <Td>{it.revoked_from}</Td>
                  <Td>{formatDate(it.revoked_on)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<BsThreeDots />}
                        variant="ghost"
                        size="sm"
                        aria-label="Actions"
                      />
                      <MenuList>
                        <MenuItem
                          icon={
                            <Image
                              src={assign}
                              alt="Assign"
                              boxSize="20px"
                              objectFit="contain"
                            />
                          }
                          onClick={() => openAssignModalFor(it)}
                        >
                          <Text fontSize="sm">Assign</Text>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Assign modal */}
      <AssignAssetModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onAssign={handleAssignConfirm}
      />
    </Box>
  );
}
