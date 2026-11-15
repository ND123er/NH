import { Box, SimpleGrid, Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { EmployeeCard } from "../components/Employees/Employeecard";
import Total_employee_icon from "../assets/Total_employee_icon.svg";
import new_employee_icon from "../assets/new_employee_icon.svg";
import resigned_employee_icon from "../assets/resigned_employee_icon.svg";
import OnboardBanner from "../components/Employees/OnboardBanner";
import EmployeeTable from "../components/Employees/EmployeeTable";
import api from "../api/axios";
import { getOrgCode } from "../utils/token";

export const Employee = () => {
  const [totalStats, setTotalStats] = useState({
    count: 0,
    percentage: 0,
    status: "up",
  });

  const [newStats, setNewStats] = useState({
    count: 0,
    percentage: 0,
    status: "up",
  });

  const [resignedStats, setResignedStats] = useState({
    count: 0,
    percentage: 0,
    status: "down",
  });

  useEffect(() => {
    let mounted = true;
    const orgId = getOrgCode();
    if (!orgId) return;

    const parseStats = (res) => {
      if (!res?.data) return { count: 0, percentage: 0, status: "up" };

      const d = res.data;

      const count = d.currentCount ?? 0;
      const pctString = d.percentageChange || "0%"; // e.g. "100%"
      const pct = parseFloat(pctString.replace("%", "")) || 0;

      const status = d.changeType === "increase" ? "up" : "down";

      return { count, percentage: pct, status };
    };

    const fetchCounts = async () => {
      try {
        const urls = [
          `/employee/get_employee_count?org_id=${orgId}`,
          `/employee/get_new_joinees_count?org_id=${orgId}`,
          `/employee/resigned_employees_count?org_id=${orgId}`,
        ];

        const [totalRes, newRes, resignedRes] = await Promise.all(
          urls.map((u) => api.get(u).catch(() => null))
        );

        if (!mounted) return;

        setTotalStats(parseStats(totalRes));
        setNewStats(parseStats(newRes));
        setResignedStats(parseStats(resignedRes));
      } catch (e) {
        console.error("Fetch failed", e);
      }
    };

    fetchCounts();
    return () => (mounted = false);
  }, []);

  return (
    <Box px={0} fontFamily="Poppins" w={{ base: "122%", md: "100%" }} height={'100vh'} paddingBottom={'0px'} overflowY="auto"

      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "transparent",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}>
      {/* KPI cards */}
      <SimpleGrid
        // mt={3}
        mt={{ base: "9vh", sm: "7.4vh", md: "0vh" ,lg: 3 }}
        mb={3}
        columns={{ base: 1, md: 3 }}
        // spacing={{ base: 3, md: 4 }}
        spacing={3}
        ml={{base:2.5,sm:2.5,md:0,lg:0}}
      >
        <EmployeeCard
          icon={Total_employee_icon}
          title="Total Employees"
          count={totalStats.count}
          percentage={totalStats.percentage}
          status={totalStats.status}
        />

        <EmployeeCard
          icon={new_employee_icon}
          title="New Employees"
          count={newStats.count}
          percentage={newStats.percentage}
          status={newStats.status}
        />

        <EmployeeCard
          icon={resigned_employee_icon}
          title="Resigned Employees"
          count={resignedStats.count}
          percentage={resignedStats.percentage}
          status={resignedStats.status}
        />
      </SimpleGrid>

      {/* <Stack spacing={{ base: 3, md: 4 }}> */}
      <Stack spacing={3} ml={{ base: 2.5, md: 3,lg:0 }}>
        <OnboardBanner />
        <EmployeeTable />
      </Stack>
    </Box>
  );
};
