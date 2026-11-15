import React, { useEffect, useState } from "react";
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
import filter from '../../assets/filter.svg';
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";

export default function DeleteTeamAttendance({
    onApply,
    onClear,
    defaultSelected = {},
}) {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
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
                // const base = api.defaults.baseURL?.replace(/\/$/, "") || "";

                const endpoints = {
                    departments: `/organization/get_departments/${encodeURIComponent(
                        orgId || ""
                    )}`,
                    positions: `/organization/get_org_job_titles/${encodeURIComponent(
                        orgId || ""
                    )}`,
                    roles: `/organization/get_org_roles/${encodeURIComponent(
                        orgId || ""
                    )}`,
                    locations: `/organization/get_locations/${encodeURIComponent(
                        orgId || ""
                    )}`,
                };

                const [departmentRes, positionRes, roleRes, locationRes] =
                    await Promise.allSettled([
                        api.get(endpoints.departments),
                        api.get(endpoints.positions),
                        api.get(endpoints.roles),
                        api.get(endpoints.locations),
                    ]);

                // robust extractor: try standard expected keys, else return first array found
                const extractList = (res) => {
                    if (!res || res.status !== "fulfilled") return [];
                    const payload = res.value?.data ?? {};

                    // If payload itself is an array, return it
                    if (Array.isArray(payload)) return payload;

                    // common keys we've seen in API responses
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

                    // fallback: find first array value inside payload
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

                // Map to unified shape { id, label, raw }
                const departments = departmentRaw.map((it) => ({
                    id: it._id,
                    // API uses department_name
                    label:
                        it.department_name ||
                        it.name ||
                        it.category_name ||
                        String(it._id || ""),
                    raw: it,
                }));

                const positions = positionRaw.map((it) => ({
                    id: it._id,
                    // API uses position_name
                    label:
                        it.position_name || it.job_title || it.name || String(it._id || ""),
                    raw: it,
                }));

                const rules = rolesRaw.map((it) => ({
                    id: it._id,
                    // API uses role_name
                    label: it.role_name || it.name || String(it._id || ""),
                    raw: it,
                }));

                const locations = locationsRaw.map((it) => ({
                    id: it._id,
                    label: it.location_name || it.location || it.name || "-",
                    raw: it,
                }));

                setOptions({ departments, positions, rules, locations });
            } catch (err) {
                console.error("Delete options fetch failed", err);
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

        // only fetch if orgId exists
        if (orgId) {
            fetchAll();
        } else {
            setLoading(false);
            setOptions({ departments: [], positions: [], rules: [], locations: [] });
        }
    }, [orgId, toast]);

    const toggle = (group, id) => {
        setSelected((prev) => {
            const setOf = new Set(prev[group] || []);
            if (setOf.has(id)) setOf.delete(id);
            else setOf.add(id);
            return { ...prev, [group]: Array.from(setOf) };
        });
    };

    const clearAll = () => {
        const empty = { departments: [], positions: [], rules: [], locations: [] };
        setSelected(empty);
        if (onClear) onClear();
    };

    const apply = () => {
        if (onApply) onApply(selected);
    };

    const Group = ({ title, itemsKey, items }) => (
        <Box>
            <Text fontSize="sm" fontWeight={700} mb={2}>
                {title}
            </Text>

            <Box maxH="130px" overflowY="auto" pr={2}>
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
        <Menu closeOnSelect={false}>
            <MenuButton
                as={Button}
                size="sm"
                bg="white"
                leftIcon={
                    <Image
                        src={filter}
                        boxSize={{ base: "14px", sm: "16px" }}
                        alt="delete"
                    />
                }
                border="1px solid #cccccc"
                borderRadius="5px"
                color={'#757575'}
            >
                Delete
            </MenuButton>

            {/* <MenuList
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
                        <Box maxH="320px" overflowY="auto" pr={2} mb={3}>
                            <Stack spacing={4}>
                                <Group
                                    title="Departments"
                                    itemsKey="departments"
                                    items={options.departments}
                                />
                                <Divider />
                                <Group
                                    title="Positions"
                                    itemsKey="positions"
                                    items={options.positions}
                                />
                                <Divider />
                                <Group title="Roles" itemsKey="rules" items={options.rules} />
                                <Divider />
                                <Group
                                    title="Locations"
                                    itemsKey="locations"
                                    items={options.locations}
                                />
                            </Stack>
                        </Box>

                        <MenuDivider />

                        <HStack justify="space-between" mt={2}>
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
                        </HStack>
                    </>
                )}
            </MenuList> */}
        </Menu>
    );
}
