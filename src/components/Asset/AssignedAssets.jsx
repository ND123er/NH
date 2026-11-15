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
  HStack,
  Spinner,
  Icon,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  MenuDivider,
  Box as ChakraBox,
  Image,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots, BsPencil, BsTrash } from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaFileExcel } from "react-icons/fa";
import { AiOutlineFile } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import FilterDropdownAssets from "./Filters/FilterDropdownAssets";
import SortDropdownAssets from "./Filters/SortDropdownAssets";

import api from "../../api/axios";
import { getOrgCode, getEmpCode, getOrgIdFromReduxOrStorage } from "../../utils/token";

import revoke from "../../assets/revoke.png";
import edit from "../../assets/edit.png";
import calendar_filter from "../../assets/calendar_filter.svg";

export default function AssignedAssets() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  // date menu control
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const onCalendarOpen = () => setIsCalendarOpen(true);
  const onCalendarClose = () => setIsCalendarOpen(false);

  // date default display and ISO helpers
  const todayISO = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  })();

  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });

  const [assignedRaw, setAssignedRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // debounce ref for search
  const searchDebounceRef = useRef(null);

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

  // filter drop-down (stores arrays of IDs)
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

  // sort state
  const [sortState, setSortState] = useState({
    value: "",
    sortBy: null,
    sortOrder: null,
  });

  // track whether a date range has been applied
  const appliedRangeRef = useRef(false);

  // Build & call API
  const fetchAssignedAssets = async (opts = {}) => {
    const {
      from = null,
      to = null,
      q = null,
      filters = null,
      sortBy = null,
      sortOrder = null,
      page = null,
      limit = null,
    } = opts;

    try {
      setLoading(true);
      setError(null);

      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      if (!orgId) {
        setAssignedRaw([]);
        setError("Organization not found");
        return;
      }

      const params = new URLSearchParams();
      params.append("org_id", orgId);

      if (q && String(q).trim() !== "")
        params.append("search", String(q).trim());
      if (from) params.append("from_date", from);
      if (to) params.append("to_date", to);

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

      if (page) params.append("page", String(page));
      if (limit) params.append("limit", String(limit));
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder !== null && sortOrder !== undefined)
        params.append("sortOrder", String(sortOrder));

      const url = `/assets/assigned_asset_list?${params.toString()}`;
      const res = await api.get(url);
      const result = res?.data?.data ?? res?.data?.result ?? [];
      setAssignedRaw(result);
    } catch (err) {
      console.error("Failed to fetch assigned assets", err);
      setError(err?.message || "Failed to load assigned assets");
      setAssignedRaw([]);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch
  useEffect(() => {
    fetchAssignedAssets({
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call API when filters change
  useEffect(() => {
    fetchAssignedAssets({
      from: appliedRangeRef.current ? fromDate : null,
      to: appliedRangeRef.current ? toDate : null,
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });
  }, [selectedFilters]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchAssignedAssets({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // handle sort apply from SortDropdownAssets
  const handleSortApply = ({ sortBy, sortOrder } = {}) => {
    const next = {
      value:
        sortBy && String(sortBy).toLowerCase().includes("asset")
          ? sortOrder === 1
            ? "name_asc"
            : "name_desc"
          : sortBy
          ? "modified"
          : "",
      sortBy: sortBy || null,
      sortOrder: sortOrder !== undefined ? sortOrder : null,
    };
    setSortState(next);

    // fetch right away with new sort
    fetchAssignedAssets({
      from: appliedRangeRef.current ? fromDate : null,
      to: appliedRangeRef.current ? toDate : null,
      q: search,
      filters: selectedFilters,
      sortBy: next.sortBy,
      sortOrder: next.sortOrder,
    });
  };

  const handleSortClear = () => {
    setSortState({ value: "", sortBy: null, sortOrder: null });
    // fetch without sort params
    fetchAssignedAssets({
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
      assigned_to: item.assigned_to || "-",
      assigned_on: item.assigned_on || item.assinged_on || null,
      raw: item,
    };
  };

  const displayItems = assignedRaw.map((a, i) => normalizeItem(a, i));

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // filtered: client-side search on already fetched list (keeps server-side search too)
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return displayItems;
    return displayItems.filter((it) => {
      return (
        (it.name || "").toLowerCase().includes(q) ||
        (it.assetId || "").toLowerCase().includes(q) ||
        (it.assigned_to || "").toLowerCase().includes(q) ||
        (it.serialNumber || "").toLowerCase().includes(q) ||
        (it.category || "").toLowerCase().includes(q) ||
        formatDate(it.assigned_on).toLowerCase().includes(q)
      );
    });
  }, [displayItems, search]);

  // calendar apply / clear handlers (calls API)
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

    // fetch with date filter and current search & filters & sort
    await fetchAssignedAssets({
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

    // fetch without date filters but keep current search & filters & sort
    await fetchAssignedAssets({
      q: search,
      filters: selectedFilters,
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder,
    });

    onCalendarClose();
  };

  // --- REVOKE HANDLER (same logic style as AssetList) ---
  const handleRevoke = async (asset) => {
    try {
      const orgId =
        getOrgIdFromReduxOrStorage(user) ||
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      const assetIdParam =
        asset.raw?.asset_id ||
        asset.raw?._id ||
        asset.raw?.asset_code ||
        asset.assetId ||
        asset.id ||
        "";

      const extractAssignedToFromObj = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj.trim();
        const candidates = [obj.employee_id];
        for (const c of candidates) {
          if (!c && c !== 0) continue;
          if (typeof c === "string") {
            const s = c.trim();
            if (s) return s;
          }
          if (typeof c === "number") return String(c);
          if (typeof c === "object") {
            const innerCandidates = [
              c.employee_emp_code,
              c.emp_code,
              c.empCode,
              c.employee_code,
              c.employeeId,
              c.id,
              c._id,
              c.code,
            ];
            for (const ic of innerCandidates) {
              const iv = val[ic];
              if (iv === undefined || iv === null) continue;
              if (typeof iv === "string") {
                const s = iv.trim();
                if (s && s !== "0") return s;
              }
              if (typeof iv === "number") {
                if (iv === 0) continue;
                return String(iv);
              }
            }
          }
        }
        return "";
      };

      let revoked_from =
        extractAssignedToFromObj(asset) ||
        extractAssignedToFromObj(asset.raw || {});

      if (!revoked_from) {
        const findInRaw = assignedRaw.find((r) => {
          const rid =
            r.asset_id ||
            r.assetId ||
            r._id ||
            r.asset_code ||
            r.assetCode ||
            r.asset_code;
          const aid = assetIdParam;
          if (!rid || !aid) return false;
          return String(rid) === String(aid);
        });
        if (findInRaw) {
          revoked_from = extractAssignedToFromObj(findInRaw) || "";
        }
      }

      const revoked_by =
        (typeof window !== "undefined" &&
          localStorage.getItem("employee_emp_code")) ||
        getEmpCode() ||
        "unknown";

      const qs = `asset_id=${encodeURIComponent(
        assetIdParam
      )}&revoked_from=${encodeURIComponent(
        revoked_from
      )}&revoked_by=${encodeURIComponent(revoked_by)}&organisation_id=${encodeURIComponent(
        orgId
      )}`;

      await api.put(`/assets/revoke_asset?${qs}`);

      // Update local state: remove this asset from the assigned list
      setAssignedRaw((prev) =>
        prev.filter((a) => {
          const codeFromList =
            a.asset_id || a._id || a.asset_code || a.id || a.assetId;
          if (!codeFromList || !assetIdParam) return true;
          return String(codeFromList) !== String(assetIdParam);
        })
      );

      toast({ title: "Asset revoked", status: "success" });
    } catch (err) {
      console.error("Revoke failed", err);
      toast({
        title: "Failed to revoke",
        description: err?.message || "",
        status: "error",
      });
    }
  };

  return (
    <Box
      fontFamily={"Poppins"}
      bg="white"
      p={4}
      shadow="sm"
      mt={4}
      borderColor="gray.100"
      border="1px solid #cccccc"
      borderRadius={"14px"}
    >
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
          <Heading size="md" fontFamily={'Poppins'}>Assigned Assets</Heading>

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
            <ChakraBox>
              <FilterDropdownAssets
                onApply={(f) => {
                  handleFilterApply(f);
                  // Immediately fetch with new filters keeping current search/date/sort
                  fetchAssignedAssets({
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
                  fetchAssignedAssets({
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
            </ChakraBox>

            {/* Sort Button */}
            <ChakraBox>
              <SortDropdownAssets
                defaultSort={{
                  sortBy: sortState.sortBy,
                  sortOrder: sortState.sortOrder,
                }}
                onApply={(sortObj) => {
                  // sortObj contains sortBy & sortOrder (as implemented in your SortDropdownAssets)
                  handleSortApply(sortObj);
                }}
                onClear={() => {
                  handleSortClear();
                }}
              />
            </ChakraBox>

            {/* Date input with calendar popup */}
            <ChakraBox>
              <Menu
                isOpen={isCalendarOpen}
                onClose={onCalendarClose}
                closeOnSelect={false}
              >
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
            </ChakraBox>

            {/* More menu */}
            <ChakraBox overflow="hidden">
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
                      <ChakraBox
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
                      </ChakraBox>
                      <ChakraBox>
                        <Text fontSize="sm" fontWeight={600}>
                          Export as .csv
                        </Text>
                      </ChakraBox>
                    </HStack>
                  </MenuItem>

                  <MenuDivider />

                  <MenuItem px={4} py={3}>
                    <HStack spacing={3} align="center" w="100%">
                      <ChakraBox
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
                      </ChakraBox>

                      <ChakraBox flex="1">
                        <Text fontSize="sm" fontWeight={600} color="gray.800">
                          Export as .xls
                        </Text>
                      </ChakraBox>

                      <Icon
                        as={AiOutlineCheckCircle}
                        boxSize={5}
                        color="green.500"
                      />
                    </HStack>
                  </MenuItem>

                  <MenuDivider />

                  <MenuItem px={4} py={3}>
                    <HStack spacing={3}>
                      <ChakraBox
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
                      </ChakraBox>
                      <ChakraBox>
                        <Text fontSize="sm" fontWeight={600}>
                          Import
                        </Text>
                      </ChakraBox>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            </ChakraBox>
          </Flex>
        </Flex>
      </Box>

      {/* Table or loader / empty / error */}
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
          >No assigned assets found</Text>
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
                  "Serial number",
                  "Asset Name",
                  "Asset Category Code",
                  "Category",
                  "Assigned to",
                  "Assigned on",
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
                  <Td>{it.assigned_to}</Td>
                  <Td>{formatDate(it.assigned_on)}</Td>
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
                          icon={<Image src={revoke} boxSize={4} />}
                          onClick={() => handleRevoke(it)}
                        >
                          <HStack spacing={3}>
                            <Text fontSize="sm">Revoke</Text>
                          </HStack>
                        </MenuItem>

                        {/* <MenuDivider /> */}

                        {/* <MenuItem
                          icon={<Image src={edit} boxSize={4} />}
                          onClick={() => {
                            console.log("edit", it);
                          }}
                        >
                          Edit
                        </MenuItem> */}

                        {/* <MenuDivider />

                        <MenuItem
                          icon={<BsTrash />}
                          color="red.500"
                          onClick={() => {
                            console.log("delete", it);
                          }}
                        >
                          Delete
                        </MenuItem> */}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
