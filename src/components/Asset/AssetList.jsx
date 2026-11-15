import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  SimpleGrid,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tag,
  CloseButton,
  InputRightElement,
  Icon,
  HStack,
  useToast,
  useBreakpointValue,
  useMediaQuery,
  Avatar,
  MenuItem,
  Divider,
  useDisclosure,
  Stack,
  Image,
  Menu,
  MenuButton,
  MenuList,
  VisuallyHidden,
  Tooltip,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { SearchIcon } from "@chakra-ui/icons";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { AiOutlineFile, AiOutlineCheckCircle } from "react-icons/ai";
import AssignAssetModal from "./AssignAssetModal";
import EditAssetModal from "./EditAssetModal";
import AsseetTabsNavbar from "./AsseetTabsNavbar";
import AssignedAssets from "./AssignedAssets";
import RevokedAssets from "./RevokedAssets";
import Reports from "./Reports";
import api from "../../api/axios";
import { getEmpCode, getOrgCode, getOrgIdFromReduxOrStorage } from "../../utils/token";
import { FaFileExcel } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import FilterDropdownAssets from "./Filters/FilterDropdownAssets";
import SortDropdownAssets from "./Filters/SortDropdownAssets";
import edit from "../../assets/edit.png";
import assign from "../../assets/assign.png";
import revoke from "../../assets/revoke.png";
import deleteAsset from "../../assets/deleteAsset.png";

export default function AssetList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  // API data
  const [assetsRaw, setAssetsRaw] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });

  // calendar popup
  const {
    isOpen: isCalendarOpen,
    onOpen: onCalendarOpen,
    onClose: onCalendarClose,
  } = useDisclosure();
  const todayISO = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  })();
  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);

  // tabs & modals
  const [activeTab, setActiveTab] = useState("list");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const placeholders = ["Asset Name ", "Asset Category Code"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);


  // Filter-dropdown selections (IDs arrays)
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    vendors: [],
    brands: [],
    locations: [],
  });

  // Sort selection (keeps current sort for reuse)
  const [selectedSort, setSelectedSort] = useState({
    sortBy: null,
    sortOrder: null,
  });

  // search debounce ref
  const searchDebounceRef = useRef(null);

  // status palette used in UI
  const statusList = [
    { label: "In-Use", color: "#66AF6E", bg: '#dbf3de' },
    { label: "In-stock", color: "blue", bg: '#ebebeb' },
    // { label: "In-transit", color: "cyan" },
    { label: "Under maintenance", color: "#C1C41C", bg: '#f9faef' },
    { label: "Missing", color: "#FE8383", bg: '#fcf2f2' },
    { label: "Retired", color: "#C93A3A", bg: '#ffd6d6' },
  ];

  // pagination state (offset/limit)
  const limit = 20; // first load and subsequent loads
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  // container & sentinel refs for IntersectionObserver
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  // request guard to prevent stale responses
  const reqIdRef = useRef(0);

  const inFlightRef = useRef(new Set());
  // track the timestamp of the last pagination request to avoid firing too frequently
  const lastPaginationTimeRef = useRef(0);
  const paginationDebounceMs = 500; // minimum ms between pagination requests
  // mark when the initial fetch (mount) has been triggered so other effects don't duplicate
  const initialFetchDoneRef = useRef(false);

  // responsive helpers
  const isMobileBp = useBreakpointValue({ base: true, md: false });
  const [isMobileMq] = useMediaQuery("(max-width: 767px)");
  const isMobile = typeof isMobileBp === "boolean" ? isMobileBp : isMobileMq;

  const fetchAssets = useCallback(
    async (statusArray = [], filters = {}, opts = {}) => {
      const optsSafe = opts || {};
      const q = typeof optsSafe.q !== "undefined" ? optsSafe.q : "";
      const offsetOpt =
        typeof optsSafe.offset !== "undefined" ? optsSafe.offset : 0;
      const limitOpt =
        typeof optsSafe.limit !== "undefined" ? optsSafe.limit : limit;
      const append =
        typeof optsSafe.append !== "undefined" ? optsSafe.append : false;
      const from_date = optsSafe.from_date;
      const to_date = optsSafe.to_date;
      const page = optsSafe.page;
      const sortBy = optsSafe.sortBy;
      const sortOrder = optsSafe.sortOrder;

      let thisReqId = reqIdRef.current;

      try {
        if (append) setLoadingMore(true);
        else setLoadingInitial(true);

        setError(null);

        const orgId =
          getOrgCode?.() ||
          (typeof window !== "undefined" && localStorage.getItem("org_code"));
        if (!orgId) {
          console.error("Organization id not found — aborting fetch.");
          setError("There is no asset");
          setHasMore(false);
          if (!append) setAssetsRaw([]);
          return;
        }

        // build params & final URL
        const params = new URLSearchParams();
        params.append("org_id", orgId);

        if (q && String(q).trim() !== "")
          params.append("search", String(q).trim());
        if (statusArray && statusArray.length > 0)
          params.append("status", statusArray.join(","));
        if (from_date) params.append("from_date", from_date);
        if (to_date) params.append("to_date", to_date);

        params.append("offset", String(offsetOpt));
        params.append("limit", String(limitOpt));
        if (page) params.append("page", String(page));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", String(sortOrder));

        if (filters) {
          if (filters.categories && filters.categories.length > 0)
            params.append("category", filters.categories.join(","));
          if (filters.vendors && filters.vendors.length > 0)
            params.append("vendor", filters.vendors.join(","));
          if (filters.brands && filters.brands.length > 0)
            params.append("brand", filters.brands.join(","));
          if (filters.locations && filters.locations.length > 0)
            params.append("location", filters.locations.join(","));
        }

        const url = `/assets/get_company_asset_list?${params.toString()}`;

        // DEBUG: helpful logs while fixing
        // console.debug("fetchAssets -> url:", url, { append, offsetOpt, limitOpt });

        // DEDUPE: skip issuing another request if same url already in-flight
        if (inFlightRef.current.has(url)) {
          // console.debug("Duplicate request skipped:", url);
          return;
        }
        thisReqId = ++reqIdRef.current;
        // mark in-flight
        inFlightRef.current.add(url);

        // perform request
        const res = await api.get(url);

        // Accept either res.data.data or res.data.result
        const result = res?.data?.data ?? res?.data?.result ?? [];

        // ignore stale responses
        if (thisReqId !== reqIdRef.current) {
          return;
        }

        // update state
        setAssetsRaw((prev) => {
          if (append) {
            const existingIds = new Set(
              prev.map((p) => p._id || p.id || p.asset_code)
            );
            const newItems = Array.isArray(result)
              ? result.filter(
                (it) => !existingIds.has(it._id || it.id || it.asset_code)
              )
              : [];
            return [...prev, ...newItems];
          } else {
            return Array.isArray(result) ? result : [];
          }
        });

        // determine hasMore
        if (!Array.isArray(result) || result.length < limitOpt) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setOffset(offsetOpt);
      } catch (err) {
        console.error("Failed to fetch assets", err);
        setError("There is no asset");
        setHasMore(false);
        if (!append) setAssetsRaw([]);
      } finally {
        // remove the URL from in-flight set by rebuilding it
        try {
          const params = new URLSearchParams();
          const orgId =
            getOrgCode?.() ||
            (typeof window !== "undefined" && localStorage.getItem("org_code"));
          if (orgId) params.append("org_id", orgId);
          if (q && String(q).trim() !== "")
            params.append("search", String(q).trim());
          if (statusArray && statusArray.length > 0)
            params.append("status", statusArray.join(","));
          if (from_date) params.append("from_date", from_date);
          if (to_date) params.append("to_date", to_date);
          params.append("offset", String(offsetOpt));
          params.append("limit", String(limitOpt));
          if (page) params.append("page", String(page));
          if (sortBy) params.append("sortBy", sortBy);
          if (sortOrder) params.append("sortOrder", String(sortOrder));
          if (filters) {
            if (filters.categories && filters.categories.length > 0)
              params.append("category", filters.categories.join(","));
            if (filters.vendors && filters.vendors.length > 0)
              params.append("vendor", filters.vendors.join(","));
            if (filters.brands && filters.brands.length > 0)
              params.append("brand", filters.brands.join(","));
            if (filters.locations && filters.locations.length > 0)
              params.append("location", filters.locations.join(","));
          }
          const urlToRemove = `/assets/get_company_asset_list?${params.toString()}`;
          inFlightRef.current.delete(urlToRemove);
        } catch (e) {
          // ignore cleanup errors
        }

        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    let isCancelled = false;

    const loadInitialAssets = async () => {
      setOffset(0);
      setHasMore(true);
      await fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
      if (!isCancelled) {
        // mark initial fetch done after first request completes
        initialFetchDoneRef.current = true;
      }
    };

    loadInitialAssets();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    // skip search-triggered fetch on initial mount
    if (!initialFetchDoneRef.current) return;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      setOffset(0);
      setHasMore(true);
      fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
    }, 500);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // when selectedFilters or sort changes -> replace list (reset pagination)
  useEffect(() => {
    // avoid double-fetch on mount; initial fetch already triggered
    if (!initialFetchDoneRef.current) return;

    setOffset(0);
    setHasMore(true);

    fetchAssets(selectedStatuses, selectedFilters, {
      q: search,
      offset: 0,
      limit,
      append: false,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, selectedSort]);

  useEffect(() => {
    if (!initialFetchDoneRef.current) return;

    setOffset(0);
    setHasMore(true);
    fetchAssets(selectedStatuses, selectedFilters, {
      q: search,
      offset: 0,
      limit,
      append: false,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    });
  }, [selectedStatuses]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  // load next page
  const loadNextPage = useCallback(() => {
    if (error) return;
    if (loadingMore || loadingInitial || !hasMore) return;

    try {
      const now = Date.now();
      if (now - lastPaginationTimeRef.current < paginationDebounceMs) return;
      lastPaginationTimeRef.current = now;
    } catch (e) {
      console.error("Pagination time tracking error", e);
    }

    const nextOffset = offset + limit;
    fetchAssets(selectedStatuses, selectedFilters, {
      q: search,
      offset: nextOffset,
      limit,
      append: true,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    });
  }, [
    offset,
    limit,
    loadingMore,
    loadingInitial,
    hasMore,
    selectedStatuses,
    selectedFilters,
    search,
    selectedSort,
    fetchAssets,
    error,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current || document;
    if (!sentinel || !container) return;

    if (loadingInitial) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!loadingMore && !loadingInitial && hasMore && !error) {
              loadNextPage();
            }
          }
        });
      },
      {
        root: container === document ? null : container,
        rootMargin: "0px",
        threshold: 0.25,
      }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadNextPage, loadingMore, loadingInitial, hasMore, error,]);

  const handleFilterApply = (filters) => {
    const normalized = {
      categories: filters?.categories || [],
      vendors: filters?.vendors || [],
      brands: filters?.brands || [],
      locations: filters?.locations || [],
    };
    setSelectedFilters(normalized);
  };

  const handleFilterClear = () => {
    const reset = { categories: [], vendors: [], brands: [], locations: [] };
    setSelectedFilters(reset);
  };

  // Sort handlers
  const handleSortApply = (sortObj = {}) => {
    const s =
      sortObj && sortObj.sortBy
        ? { sortBy: sortObj.sortBy, sortOrder: sortObj.sortOrder }
        : { sortBy: null, sortOrder: null };
    setSelectedSort(s);
  };

  const handleSortClear = () => {
    setSelectedSort({ sortBy: null, sortOrder: null });
  };

  const normalizeItem = (item, idx) => {
    return {
      id: item._id || item.id || String(idx),
      name: item.asset_name || item.name || "-",
      assetId: item.asset_code || item.assetId || "-",
      serialNumber: item.serial_number || item.serialNumber || "-",
      category: item.category || item.category_name || "-",
      location: item.location || item.location_name || "-",
      brand: item.brand || item.brand_name || "-",
      vendor: item.vendor || "-",
      status: item.status || "-",
      createdAt: item.created_at || item.createdAt || null,
      raw: item,
    };
  };

  // ONLY API assets
  const displayAssets = assetsRaw.map((a, i) => normalizeItem(a, i));
  const filteredAssets = useMemo(() => displayAssets, [displayAssets]);

  // assign and edit handlers - keep behavior but call paginated fetch to refresh (replace)
  const handleAssign = async (assignPayload) => {
    try {
      const orgIdLocal =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));

      // locally update list (optimistic)
      setAssetsRaw((prev) =>
        prev.map((a) => {
          const codeFromList =
            a.asset_code || a.assetCode || a.asset_id || a.assetId || a.assetId;
          const codeFromPayload =
            assignPayload.asset_code ||
            assignPayload.assetCode ||
            assignPayload.asset_id ||
            assignPayload.assetId ||
            assignPayload.asset_id;
          if (!codeFromList || !codeFromPayload) return a;
          if (String(codeFromList) !== String(codeFromPayload)) return a;
          const raw = { ...(a.raw || {}), status: "In-Use" };
          if (assignPayload.assigned_to)
            raw.assigned_to = assignPayload.assigned_to;
          return { ...a, status: "In-Use", raw };
        })
      );
    } catch (err) {
      toast({ title: err?.message || "Failed to assign", status: "error" });
    } finally {
      setAssignModalOpen(false);
      setSelectedAsset(null);
      // refresh first page to reflect authoritative server state
      setOffset(0);
      fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
    }
  };

  const handleRevoke = async (asset) => {
    try {
      const orgIdLocal =
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
        // Prefer the raw API object if a normalized wrapper was passed
        if (obj && typeof obj === "object" && obj.raw) obj = obj.raw;

        // Robust extraction of assigned employee identifier from various shapes
        // Treat "0" and numeric 0 as absent
        if (!obj) return "";
        if (typeof obj === "string") {
          const s = obj.trim();
          if (s && s !== "0") return s;
          return "";
        }
        if (typeof obj === "number") {
          if (obj === 0) return "";
          return String(obj);
        }

        // Check common direct fields first (including assigned_to)
        // IMPORTANT: do not treat asset's own `id`/_id as employee identifier here
        const directFields = [
          "assigned_to",
          "assignedTo",
          "employee_id",
          "emp_code",
          "employee_emp_code",
          "empCode",
          "employee_code",
          "employeeId",
          "code",
        ];

        for (const field of directFields) {
          const val = obj[field];
          if (val === undefined || val === null) continue;
          if (typeof val === "string") {
            const s = val.trim();
            if (s && s !== "0") return s;
          }
          if (typeof val === "number") {
            if (val === 0) continue;
            return String(val);
          }
          if (typeof val === "object") {
            // nested object: try common identifier keys inside
            const innerCandidates = [
              "employee_emp_code",
              "emp_code",
              "empCode",
              "employee_code",
              "employeeId",
              "id",
              "_id",
              "code",
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
        const findInRaw = assetsRaw.find((r) => {
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
        if (findInRaw) revoked_from = extractAssignedToFromObj(findInRaw) || "";
      }

      const revoked_by =
        (typeof window !== "undefined" &&
          localStorage.getItem("employee_emp_code")) ||
        getEmpCode() ||
        "unknown";

      const orgId = getOrgIdFromReduxOrStorage(user);

      const qs = `asset_id=${encodeURIComponent(
        assetIdParam
      )}&revoked_from=${encodeURIComponent(
        revoked_from
      )}&revoked_by=${encodeURIComponent(revoked_by)}&organisation_id=${encodeURIComponent(
        orgId
      )}`;

      await api.put(`/assets/revoke_asset?${qs}`);

      // optimistic local update
      setAssetsRaw((prev) =>
        prev.map((a) => {
          const codeFromList =
            a.asset_code || a.assetCode || a.asset_id || a.assetId || a.id;
          const codeFromTarget =
            asset.raw?.asset_code ||
            asset.assetId ||
            asset.id ||
            asset.raw?._id;
          if (!codeFromList || !codeFromTarget) return a;
          if (String(codeFromList) !== String(codeFromTarget)) return a;
          const raw = { ...(a.raw || {}), status: "In-stock" };
          return { ...a, status: "In-stock", raw };
        })
      );

      toast({ title: "Asset revoked", status: "success" });
      // refresh first page
      setOffset(0);
      fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
    } catch (err) {
      console.error("Revoke failed", err);
      toast({
        title: "Failed to revoke",
        description: err?.message || "",
        status: "error",
      });
    }
  };

  const handleEdit = async (formData) => {
    try {
      toast({ title: "Update Successfully", status: "success" });
    } catch (err) {
      toast({ title: err?.message || "Failed to update", status: "error" });
    } finally {
      setEditModalOpen(false);
      setSelectedAsset(null);
      // refresh first page after edit
      setOffset(0);
      fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
    }
  };

  const handleDelete = async (asset) => {
    try {
      const assetIdParam =
        asset.raw?.asset_id ||
        asset.raw?._id ||
        asset.raw?.asset_code ||
        asset.assetId ||
        asset.id ||
        "";

      if (!assetIdParam) {
        toast({
          title: "Error",
          description: "Asset ID not found",
          status: "error",
        });
        return;
      }

      await api.delete(`/assets/delete_asset/${assetIdParam}`);

      // optimistic local update - remove from list
      setAssetsRaw((prev) =>
        prev.filter((a) => {
          const codeFromList =
            a.asset_code || a.assetCode || a.asset_id || a.assetId || a.id;
          const codeFromTarget =
            asset.raw?.asset_code ||
            asset.assetId ||
            asset.id ||
            asset.raw?._id;
          if (!codeFromList || !codeFromTarget) return true;
          return String(codeFromList) !== String(codeFromTarget);
        })
      );

      toast({ title: "Asset deleted successfully", status: "success" });
      // refresh first page
      setOffset(0);
      fetchAssets(selectedStatuses, selectedFilters, {
        q: search,
        offset: 0,
        limit,
        append: false,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      });
    } catch (err) {
      console.error("Delete failed", err);
      toast({
        title: "Failed to delete",
        description: err?.message || "",
        status: "error",
      });
    }
  };

  // status filter helpers (unchanged behaviour, but now they reset pagination by virtue of the effect watching selectedStatuses)
  const toggleStatus = (statusLabel) => {
    setSelectedStatuses((prev) =>
      prev[0] === statusLabel ? [] : [statusLabel]
    );
  };

  const clearSingleStatus = (statusLabel, e) => {
    if (e) e.stopPropagation();
    setSelectedStatuses((prev) => prev.filter((s) => s !== statusLabel));
  };

  const clearAllStatus = () => {
    setSelectedStatuses([]);
  };

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("in-use")) return "#74D27E";
    if (s.includes("in-stock")) return "blue";
    if (s.includes("maintenance")) return "orange";
    if (s.includes("missing")) return "red";
    if (s.includes("retired")) return "red";
    return "gray";
  };

  // calendar apply / clear handlers (call paginated fetch)
  const onApplyDateRange = () => {
    const toDisplay = (iso) => {
      if (!iso) return "";
      const [y, m, d] = iso.split("-");
      return `${d}-${m}-${y}`;
    };
    setDate(`${toDisplay(fromDate)} - ${toDisplay(toDate)}`);
    // fetch first page with date range
    setOffset(0);
    setHasMore(true);
    fetchAssets(selectedStatuses, selectedFilters, {
      q: search,
      offset: 0,
      limit,
      append: false,
      from_date: fromDate,
      to_date: toDate,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    });
    onCalendarClose();
    toast({
      title: "Date range applied",
      description: `${toDisplay(fromDate)} → ${toDisplay(toDate)}`,
      status: "info",
      duration: 2000,
    });
  };

  const onClearDateRange = () => {
    setFromDate(todayISO);
    setToDate(todayISO);
    const [y, m, d] = todayISO.split("-");
    setDate(() => `${d}-${m}-${y}`);
    // clear date range and reload first page
    setOffset(0);
    setHasMore(true);
    fetchAssets(selectedStatuses, selectedFilters, {
      q: search,
      offset: 0,
      limit,
      append: false,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    });
    onCalendarClose();
  };

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
      <Box fontFamily={"Poppins"} marginLeft={{ base: '2vw', sm: '2vw', md: '0vw', lg: '0vw' }} marginRight={{ base: '2vw', sm: '2vw', md: '0vw', lg: '0vw' }} width={{ base: '96vw', sm: '96vw', md: '100%', lg: '100%' }} mt={{ base: '9vh', sm: '16vw', md: '0vh', lg: '0vh' }}>
        <Box
          position="sticky"
          top="0"
          zIndex="10"
        >
          <AsseetTabsNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </Box>

        {activeTab === "list" ? (
          <Box
            bg="white"
            p={4}
            shadow="sm"
            // mt={4}
            borderColor="gray.100"
            border="1px solid #cccccc"
            borderRadius={"14px"}
          >
            {/* Header */}
            <Box
              mx={-4}
              mb={4}
              pr={4}
              pl={4}
              borderBottom="2px dashed transparent"
              sx={{
                borderImage:
                  "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
              }}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" fontFamily={'Poppins'}>Asset List</Heading>

                <Flex gap={3} align="center">
                  <Button
                    bg="#274167"
                    color="white"
                    _hover={{ bg: "#1f3143" }}
                    onClick={() => navigate("/asset-management/add")}
                    fontWeight={500}
                    fontSize={"14px"}
                    letterSpacing="-0.03em"
                    borderRadius={"10px"}

                  >
                    Add Asset
                  </Button>
                </Flex>
              </Flex>
            </Box>

            <Box
              mx={-4}
              mb={4}
              pr={4}
              pl={4}
              borderBottom="2px dashed transparent"
              sx={{
                borderImage:
                  "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
              }}

            >
              <Flex
                mb={4}
                justifyContent={{ base: "flex-start", md: "space-between" }}
                borderColor="gray.200"
                align={"center"}
                flexWrap={{ base: "wrap", md: "nowrap" }}
                gap={{ base: 3, md: 2 }}
              >
                <Flex gap={2} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Text fontWeight="600" mt={"2px"} whitespace="nowrap">
                    Status
                  </Text>
                  {statusList.map((s) => {
                    const active = selectedStatuses.includes(s.label);
                    const anySelected = selectedStatuses.length > 0;
                    const faded = anySelected && !active;

                    return (
                      <Button
                        key={s.label}
                        size="sm"
                        onClick={() => toggleStatus(s.label)}
                        position="relative"
                        borderRadius="full"
                        px={{ base: 2, md: 3 }}
                        py={1.5}
                        h="30px"
                        _focus={{ boxShadow: "none" }}
                        borderWidth="1px"
                        borderColor={
                          active
                            ? `${s.color}`
                            : faded
                              ? "gray.200"
                              : "#cccccc"
                        }
                        bg={active ? `${s.bg}` : "transparent"}
                        color={active ? `${s.color}` : "gray.700"}
                        opacity={faded ? 0.45 : 1}
                        _hover={{
                          bg: active
                            ? `${s.bg}`
                            : faded
                              ? "transparent"
                              : "gray.50",
                        }}
                      >
                        <Text
                          fontSize="13px"
                          fontWeight={600}
                          letterSpacing="-0.03em"
                        >
                          {s.label}
                        </Text>

                        {active && (
                          <Box
                            position="absolute"
                            top="-7px"
                            right="-7px"
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            // bg={`${s.color}.400`}
                            bg={`${s.color}`}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            // border="2px solid white"
                            border={`2px solid ${s.color}`}
                            onClick={(e) => clearSingleStatus(s.label, e)}
                            cursor="pointer"
                          >
                            <Icon
                              viewBox="0 0 24 24"
                              boxSize="11px"
                              color="gray.900"
                            >
                              <path
                                fill="currentColor"
                                d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                              />
                            </Icon>
                          </Box>
                        )}
                      </Button>
                    );
                  })}
                </Flex>

                {/* {selectedStatuses.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllStatus}
                  ml={3}
                  color="gray.600"
                >
                  Clear
                </Button>
              )} */}

                <Flex
                  gap={2}
                  flexDirection={{ base: "column", md: "row" }}
                  w={{ base: "100%", md: "auto" }}
                  ml={{ base: 0, md: selectedStatuses.length > 0 ? 6 : 10 }}
                  transition="margin-left 200ms ease"
                >
                  {/* Search input */}
                  {/* <InputGroup
                    size="sm"
                    w="170px"
                  // border="1px solid #cccccc"
                  // borderRadius={"5px"}
                  >
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      fontFamily="poppins"
                      fontWeight="12px"
                      // placeholder="Search by Asset"
                      placeholder={placeholders[placeholderIndex]}

                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      {...searchInputStyle}

                    />
                    {search && (
                      <InputRightElement>
                        <CloseButton
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            reqIdRef.current += 1;
                            setOffset(0);
                            setHasMore(true);
                            fetchAssets(selectedStatuses, selectedFilters, {
                              q: "",
                              offset: 0,
                              limit,
                              append: false,
                              sortBy: selectedSort.sortBy,
                              sortOrder: selectedSort.sortOrder,
                            });
                          }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup> */}
                  <Box
                    position="relative"
                    w={{ base: "100%", md: "190px" }}
                    overflow="hidden"
                    _focusWithin={{
                      borderColor: "#cccccc",
                      boxShadow: "none",
                    }}
                  >
                    <InputGroup size="sm" w="100%" position="relative">
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" mt={2} />
                      </InputLeftElement>

                      {/* Animated Placeholder Text */}
                      {!search && (
                        <Text
                          key={placeholderIndex}
                          position="absolute"
                          left="30px"
                          top="50%"
                          transform="translateY(-50%)"
                          fontSize="13px"
                          fontFamily="poppins"
                          color="gray.600"
                          pointerEvents="none"
                          animation="slideFade 3s ease-in-out"
                          whiteSpace="nowrap"

                        >
                          {placeholders[placeholderIndex]}
                        </Text>
                      )}

                      {/* Actual Input */}
                      {/* <Input
                        fontFamily="poppins"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        pl="30px"
                        h="39px"
                      /> */}
                      <Input
                        fontFamily="poppins"
                        fontWeight="12px"
                        // placeholder="Search by Asset"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        {...searchInputStyle}
                        h="36px"
                      //  w={"250px"}
                      />
                    </InputGroup>
                  </Box>

                  {/* Filter dropdown */}
                  <Box w={{ base: "100%", md: "auto" }}>
                    <FilterDropdownAssets
                      onApply={handleFilterApply}
                      onClear={handleFilterClear}
                      defaultSelected={selectedFilters}
                    />
                  </Box>

                  {/* Sort dropdown */}
                  <Box w={{ base: "100%", md: "auto" }}>
                    <SortDropdownAssets
                      onApply={handleSortApply}
                      onClear={handleSortClear}
                      defaultSort={selectedSort}
                    />
                  </Box>

                  {/* Menu dropdown */}
                  <Box overflow="hidden" w={{ base: "100%", md: "auto" }}>
                    <Menu>
                      <MenuButton
                        as={Button}
                        w={{ base: "100%", md: "35px" }}
                        h="35px"
                        minW={{ base: "100%", md: "35px" }}
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

                      <MenuList
                        minW="220px"
                        borderRadius="8px"
                        boxShadow="lg"
                        py={0}
                      >
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
                              <Icon
                                as={AiOutlineFile}
                                boxSize={5}
                                color="gray.700"
                              />
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight={500}>
                                Export as .csv
                              </Text>
                            </Box>
                          </HStack>
                        </MenuItem>

                        <Divider /*m={4} p={4} */ m={4} mt={0} p={4} pt={0} pb={0} />

                        <MenuItem px={4} py={3} pt={0}>
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
                              <Icon
                                as={FaFileExcel}
                                boxSize={5}
                                color="green.600"
                              />
                            </Box>

                            <Box flex="1">
                              <Text
                                fontSize="sm"
                                fontWeight={500}
                                color="gray.800"
                              >
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

                        <Divider m={0} />

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
                              <Text fontSize="sm" fontWeight={500}>
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

            {/* List area: fixed-height scroll container with sentinel for infinite scroll */}
            <Box
              ref={containerRef}
              // border="1px solid red"
              // borderRadius="md"
              // overflowY="auto"
              // maxH="70vh"
              mx={-4}
              // p={3}
              maxH="50vh"
              overflowY="auto"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "0px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "transparent",
                },
              }}
            // pb={'2vh'}
            >
              {loadingInitial ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : error ? (
                <Text>{error}</Text>
              ) : displayAssets?.length === 0 ? (
                <Text textAlign={'center'}>No assets available</Text>
              ) : isMobile ? (
                <SimpleGrid columns={1} spacing={3} mt={2}>
                  {filteredAssets?.map((a, idx) => {
                    const statusColor = getStatusColor(a.status || "");
                    const statusNormalizedMobile = (a.status || "").toLowerCase();
                    const isInUseMobile =
                      statusNormalizedMobile.includes("in-use");
                    const isMissingOrRetiredMobile =
                      statusNormalizedMobile.includes("missing") ||
                      statusNormalizedMobile.includes("retired");
                    const isInStockOrInTransitMobile =
                      statusNormalizedMobile.includes("in-stock") ||
                      statusNormalizedMobile.includes("in transit") ||
                      statusNormalizedMobile.includes("in-transit");
                    const isUnderMaintenanceMobile =
                      statusNormalizedMobile.includes("maintenance") ||
                      statusNormalizedMobile.includes("under maintenance") ||
                      statusNormalizedMobile.includes("under-maintenance");

                    const assignDisabledMobile =
                      isInUseMobile ||
                      isMissingOrRetiredMobile ||
                      isUnderMaintenanceMobile;
                    const revokeDisabledMobile =
                      isInStockOrInTransitMobile ||
                      isMissingOrRetiredMobile ||
                      isUnderMaintenanceMobile;
                    const editDisabledMobile =
                      isInUseMobile ||
                      isMissingOrRetiredMobile ||
                      isUnderMaintenanceMobile;
                    const deleteDisabledMobile =
                      isInUseMobile ||
                      isMissingOrRetiredMobile ||
                      isUnderMaintenanceMobile;

                    return (
                      <Box
                        key={a.id || idx}
                        bg="white"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.100"
                        p={4}
                        boxShadow="sm"
                        ml={{ base: 2, sm: 2, md: 0, lg: 0 }}
                        mr={{ base: 2, sm: 2, md: 0, lg: 0 }}
                      >
                        <Flex justify="space-between" align="start">
                          <Flex gap={3} align="center">
                            <Avatar size="md" name={a.name} />
                            <Box>
                              <Text fontWeight={600}>{a.name}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {a.category || "-"}
                              </Text>
                            </Box>
                          </Flex>

                          <Box textAlign="right">
                            <Tag size="sm" colorScheme={statusColor}>
                              {a.status || "-"}
                            </Tag>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<BsThreeDots />}
                                variant="ghost"
                                size="sm"
                                aria-label="Actions"
                                ml={2}
                              />
                              <MenuList>
                                <Box
                                  px={4}
                                  py={2}
                                  onClick={() => {
                                    if (!assignDisabledMobile) {
                                      setSelectedAsset(a);
                                      setAssignModalOpen(true);
                                    }
                                  }}
                                  style={{
                                    cursor: assignDisabledMobile
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: assignDisabledMobile ? 0.6 : 1,
                                  }}
                                >
                                  <Text>Assign</Text>
                                </Box>
                                <Divider />
                                <Box
                                  px={4}
                                  py={2}
                                  onClick={() => {
                                    if (!revokeDisabledMobile) handleRevoke(a);
                                  }}
                                  style={{
                                    cursor: revokeDisabledMobile
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: revokeDisabledMobile ? 0.6 : 1,
                                  }}
                                >
                                  <Text>Revoke</Text>
                                </Box>
                                <Divider />
                                <Box
                                  px={4}
                                  py={2}
                                  onClick={() => {
                                    if (!editDisabledMobile) {
                                      setSelectedAsset(a);
                                      setEditModalOpen(true);
                                    }
                                  }}
                                  style={{
                                    cursor: editDisabledMobile
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: editDisabledMobile ? 0.6 : 1,
                                  }}
                                >
                                  <Text>Edit</Text>
                                </Box>
                                <Divider />
                                <Box
                                  px={4}
                                  py={2}
                                  onClick={() => {
                                    if (!deleteDisabledMobile) handleDelete(a);
                                  }}
                                  style={{
                                    color: "red",
                                    cursor: deleteDisabledMobile
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: deleteDisabledMobile ? 0.6 : 1,
                                  }}
                                >
                                  <Text>Delete</Text>
                                </Box>
                              </MenuList>
                            </Menu>
                          </Box>
                        </Flex>

                        <Divider my={3} />

                        <Flex justify="space-between">
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Asset Category Code
                            </Text>
                            <Text fontWeight={600}>{a.assetId || "-"}</Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontSize="sm" color="gray.500">
                              Serial
                            </Text>
                            <Text fontWeight={600}>{a.serialNumber || "-"}</Text>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Table
                  variant="striped"
                  size="sm"
                // sx={{
                //   "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
                //   "& tbody tr:nth-of-type(even) td": { background: "white" },
                //   // "&::-webkit-scrollbar": {
                //   //   width: "0px",
                //   // },
                //   // "&::-webkit-scrollbar-thumb": {
                //   //   background: "transparent",
                //   // },
                // }}
                // maxH="90vh"
                // overflowY="auto"
                >
                  <Thead>
                    <Tr>
                      {[
                        "Serial number",
                        "Asset Name",
                        "Asset Category Code",
                        "Category",
                        "Brand",
                        "Vendor",
                        "Location",
                        "Status",
                        "Action",
                      ].map((label) => (
                        <Th
                          key={label}
                          w="109px"
                          h="21px"
                          fontFamily="Poppins, sans-serif"
                          fontWeight={600}
                          fontSize="14px"
                          lineHeight="100%"
                          letterSpacing="-0.42px"
                          whiteSpace="nowrap"
                          px={3}
                          py={4}
                          // textAlign="left"
                          textTransform="none"
                          color={"black"}
                          pb="12px"
                          textAlign={"center"}
                        >
                          {label}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAssets?.map((a, idx) => {
                      const statusNormalized = (a.status || "").toLowerCase();
                      const isInUse = statusNormalized.includes("in-use");
                      const isMissingOrRetired =
                        statusNormalized.includes("missing") ||
                        statusNormalized.includes("retired");
                      const isInStockOrInTransit =
                        statusNormalized.includes("in-stock") ||
                        statusNormalized.includes("in transit") ||
                        statusNormalized.includes("in-transit");
                      const isUnderMaintenance =
                        statusNormalized.includes("maintenance") ||
                        statusNormalized.includes("under maintenance") ||
                        statusNormalized.includes("under-maintenance");

                      const assignDisabled =
                        isInUse || isMissingOrRetired || isUnderMaintenance;
                      const revokeDisabled =
                        isInStockOrInTransit ||
                        isMissingOrRetired ||
                        isUnderMaintenance;

                      return (
                        <Tr key={a.id || idx}>
                          <Td textAlign={"center"}>{a.serialNumber || "-"}</Td>
                          <Td textAlign={"center"}>{a.name || "-"}</Td>
                          <Td textAlign={"center"}>{a.assetId || "-"}</Td>
                          <Td textAlign={"center"}>{a.category || "-"}</Td>
                          <Td textAlign={"center"}>{a.brand || "-"}</Td>
                          <Td textAlign="center">
                            <Tooltip
                              label={a.vendor}
                              isDisabled={!a.vendor || a.vendor.length <= 10}
                              placement="top"
                              hasArrow
                            >
                              <Text
                                maxW="10ch"
                                isTruncated
                                mx="auto"
                                cursor={
                                  a.vendor && a.vendor.length > 10
                                    ? "pointer"
                                    : "default"
                                }
                              >
                                {a.vendor || "-"}
                              </Text>
                            </Tooltip>
                          </Td>
                          <Td textAlign={"center"}>{a.location || "-"}</Td>
                          <Td textAlign={"center"}>
                            <Tag
                              size="md"
                              variant="unstyled"
                              fontWeight={500}
                              color={
                                (a.status || "").toLowerCase().includes("in-use")
                                  ? "#6A9E70"
                                  : (a.status || "")
                                    .toLowerCase()
                                    .includes("in-stock")
                                    ? "blue.500"
                                    : (a.status || "")
                                      .toLowerCase()
                                      .includes("maintenance")
                                      ? "#C1C41C"
                                      : (a.status || "")
                                        .toLowerCase()
                                        .includes("missing")
                                        ? "#FE8383"
                                        : (a.status || "")
                                          .toLowerCase()
                                          .includes("retired")
                                          ? "#C93A3A"
                                          : "gray.600"
                              }
                            >
                              {a.status || "-"}
                            </Tag>
                          </Td>
                          <Td textAlign={"center"}>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<BsThreeDots />}
                                variant="ghost"
                                size="sm"
                                aria-label="Actions"
                              />

                              <MenuList
                                minW="180px"
                                borderRadius="md"
                                boxShadow="sm"
                                py={1}
                                px={4}
                                overflow="hidden"
                              >
                                {/* Assign */}
                                <Box
                                  px={3}
                                  py={2}
                                  onClick={() =>
                                    !assignDisabled &&
                                    (setSelectedAsset(a),
                                      setAssignModalOpen(true))
                                  }
                                  style={{
                                    cursor: assignDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: assignDisabled ? 0.6 : 1,
                                  }}
                                >
                                  <HStack spacing={3} align="center">
                                    <Image
                                      src={assign}
                                      alt="Assign"
                                      boxSize="20px"
                                      objectFit="contain"
                                    />
                                    <Text fontSize="sm">Assign</Text>
                                  </HStack>
                                </Box>

                                <Divider borderBottomWidth="1px" borderColor="#757575" />

                                {/* Revoke */}
                                <Box
                                  px={3}
                                  py={2}
                                  onClick={() =>
                                    !revokeDisabled && handleRevoke(a)
                                  }
                                  style={{
                                    cursor: revokeDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: revokeDisabled ? 0.6 : 1,
                                  }}
                                >
                                  <HStack spacing={3} align="center">
                                    <Image
                                      src={revoke}
                                      alt="Revoke"
                                      boxSize="20px"
                                      objectFit="contain"
                                    />
                                    <Text fontSize="sm" color="green.500">
                                      Revoke
                                    </Text>
                                  </HStack>
                                </Box>

                                <Divider borderBottomWidth="1px" borderColor="#757575" />

                                {/* Edit */}
                                <Box
                                  px={3}
                                  py={2}
                                  onClick={() => {
                                    if (!isInUse) {
                                      setSelectedAsset(a);
                                      setEditModalOpen(true);
                                    }
                                  }}
                                  style={{
                                    cursor: isInUse ? "not-allowed" : "pointer",
                                    opacity: isInUse ? 0.6 : 1,
                                  }}
                                >
                                  <HStack spacing={3} align="center">
                                    <Image
                                      src={edit}
                                      alt="Edit"
                                      boxSize="20px"
                                      objectFit="contain"
                                    />
                                    <Text fontSize="sm">Edit</Text>
                                  </HStack>
                                </Box>

                                <Divider borderBottomWidth="1px" borderColor="#757575" />

                                {/* Delete */}
                                <Box
                                  px={3}
                                  py={2}
                                  onClick={() => {
                                    if (!isInUse) handleDelete(a);
                                  }}
                                  style={{
                                    cursor: isInUse ? "not-allowed" : "pointer",
                                    opacity: isInUse ? 0.6 : 1,
                                  }}
                                >
                                  <HStack spacing={3} align="center">
                                    <Image
                                      src={deleteAsset}
                                      alt="Delete"
                                      boxSize="20px"
                                      objectFit="contain"
                                    />
                                    <Text fontSize="sm" color="red.500">
                                      Delete
                                    </Text>
                                  </HStack>
                                </Box>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}

              {/* Sentinel area */}
              <Box ref={sentinelRef} mt={3}>
                {loadingMore && (
                  <Flex justify="center" py={3}>
                    <Spinner size="sm" />
                    <VisuallyHidden>Loading more</VisuallyHidden>
                  </Flex>
                )}
                {/* {!hasMore && !loadingMore && (
                <Flex justify="center" py={3} color="gray.500">
                  <Text fontSize="sm">No more assets</Text>
                </Flex>
              )} */}
              </Box>
            </Box>
          </Box>
        ) : activeTab === "assigned" ? (
          <Box mt={4}>
            <AssignedAssets />
          </Box>
        ) : activeTab === "revoked" ? (
          <Box mt={4}>
            <RevokedAssets />
          </Box>
        ) : (
          <Box mt={4}>
            <Reports />
          </Box>
        )}

        {/* Assign modal */}
        <AssignAssetModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onAssign={handleAssign}
        />

        {/* Edit modal */}
        <EditAssetModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onAssign={handleEdit}
        />
      </Box>
    </>
  );
}
