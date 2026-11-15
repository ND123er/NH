// src/pages/Dashboard.jsx
import {
  Box,
  SimpleGrid,
  useBreakpointValue,
  Spinner,
  Center,
  Grid,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState, lazy, Suspense } from "react";
const EmployeeStrengthChart = lazy(
  () => import("../components/Dashboard/Chart"),
);
const Calender = lazy(() => import("../components/Dashboard/Calender"));
import Dashboard_tab from "../components/Dashboard/Dashboard_tab";
import AnnouncementsBoard from "../components/Announcements/AnnouncementsBoard";
import { useOutletContext } from "react-router-dom";
import { DashboardCards } from "../components/Dashboard/DashboardCards";
import New_Joiners from "../assets/New_Joiners.svg";
import Attendance from "../assets/Attendance.svg";
import Employee_Strength from "../assets/Employee_Strength.svg";
const PendingApprovals = lazy(
  () => import("../components/Dashboard/PendingApprovals"),
);
import api from "../api/axios";
import { getOrgCode, getEmpCode } from "../utils/token";
// import { decodeTokenPayload } from "../utils/token";
import { useSelector } from "react-redux";
//new
import { useSearchParams } from "react-router-dom";

const EmployeeDashboard = lazy(
  () => import("../components/Dashboard/Employee_Dashboard/EmployeeDashboard"),
);

export const Dashboard = () => {
  const navBg = useColorModeValue("#f4f7fb", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  const { sidebarWidth, isCollapsed } = useOutletContext();
  //old
  // const [activeTab, setActiveTab] = useState("Dashboard");
  //new
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const announcementId = searchParams.get("announcementId");

  const [activeTab, setActiveTab] = useState(
    tabFromUrl === "Announcements" ? "Announcements" : "Dashboard",
  );

  useEffect(() => {
    if (tabFromUrl === "Announcements") {
      setActiveTab("Announcements");
    }
  }, [tabFromUrl]);
  const [attendanceSummary, setAttendanceSummary] = useState("");
  const { user, token, loading } = useSelector((state) => state.auth);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [pageLoading, setPageLoading] = useState(true);

  // determine role
  // const payload = decodeTokenPayload();
  // const isAdmin = Boolean(payload?.is_admin);
  const isAdmin = ["owner", "admin"].includes(
    String(user?.role || "").toLowerCase(),
  );
  // Stats state (only used by admin view)
  const [totalStats, setTotalStats] = useState({
    count: 0,
    percentage: 0,
    status: "up",
  });

  const [newJoinersStats, setNewJoinersStats] = useState({
    count: 0,
    percentage: 0,
    status: "up",
  });

  // parseStats uses same logic as your Employee component
  const parseStats = (res) => {
    if (!res || !res.data) return { count: 0, percentage: 0, status: "up" };
    const d = res.data;
    const count = d.currentCount ?? d.count ?? 0;
    const pctString = d.percentageChange ?? d.percentage ?? "0%";
    const pct = parseFloat(String(pctString).replace("%", "")) || 0;
    const status =
      d.changeType === "increase" || d.status === "up" ? "up" : "down";
    return { count, percentage: pct, status };
  };

  useEffect(
    () => {
      let mounted = true;
      const loadDashboardData = async () => {
        try {
          const promises = [];
          const orgId = getOrgCode();
          const empId = getEmpCode();

          // ---------- Admin APIs ----------
          if (isAdmin) {
            if (orgId) {
              const totalUrl = `/employee/get_employee_count?org_id=${encodeURIComponent(orgId)}`;
              const newJoinersUrl = `/employee/get_new_joinees_count?org_id=${encodeURIComponent(orgId)}`;

              promises.push(
                api
                  .get(totalUrl)
                  .then((res) => {
                    if (mounted) setTotalStats(parseStats(res));
                  })
                  .catch(() => null),

                api
                  .get(newJoinersUrl)
                  .then((res) => {
                    if (mounted) setNewJoinersStats(parseStats(res));
                  })
                  .catch(() => null),
              );
            }
          }

          const today = new Date().toISOString().split("T")[0];
          //old
          // promises.push(
          //   api
          //     .get(
          //       `attendance/get_today_attendance_summary?date=${today}&organisation_id=${user?.employee_id}`,
          //     )
          //     .then((res) => {
          //       if (mounted) setAttendanceSummary(res?.data || {});
          //     })
          //     .catch(() => null),
          // );

          // if (orgId) {
          //   promises.push(
          //     api
          //       .get("/attendance/get_today_attendance_summary", {
          //         params: {
          //           date: today,
          //           organisation_id: orgId,
          //         },
          //       })
          //       .then((res) => {
          //         if (mounted) {
          //           setAttendanceSummary(res?.data || {});
          //         }
          //       })
          //       .catch((err) => {
          //         console.error("Failed to fetch attendance summary:", err);
          //       }),
          //   );
          // }

          if (orgId && (isAdmin || empId)) {
            promises.push(
              api
                .get("/attendance/get_today_attendance_summary", {
                  params: {
                    date: today,
                    organisation_id: orgId,
                    ...(!isAdmin && { employee_id: empId }),
                  },
                })
                .then((res) => {
                  if (mounted) {
                    setAttendanceSummary(res?.data || {});
                  }
                })
                .catch((err) => {
                  console.error("Failed to fetch attendance summary:", err);
                }),
            );
          }

          await Promise.all(promises);
        } catch (err) {
          console.error("Dashboard load failed", err);
        } finally {
          if (mounted) setPageLoading(false);
        }
      };

      loadDashboardData();

      return () => {
        mounted = false;
      };
    },
    // [isAdmin, user?.employee_id]
    // [isAdmin, user?.organisation_id, user?.org_id],
    [
      isAdmin,
      user?.organisation_id,
      user?.org_id,
      user?.employee_id,
      user?.emp_code,
    ],
  );
  if (pageLoading) {
    return (
      <Center h="100vh">
        <Spinner size="md" thickness="2px" />
      </Center>
    );
  }

  const PageLoader = () => (
    <Center h="70vh">
      <Spinner size="md" thickness="2px" />
    </Center>
  );
  if (pageLoading) {
    return <PageLoader />;
  }
  return (
    <Box
      w={isMobile ? "120%" : "100%"}
      maxW={isMobile ? `` : `calc(100vw - ${sidebarWidth})`}
      height="100vh"
      overflow="hidden"
      fontFamily="Poppins"
      marginRight={isMobile ? "1.9vw" : 0}
      marginLeft={isMobile ? "1.9vw" : 0}
    >
      <Box
        height="100%"
        overflowY="auto"
        // sx={{
        //   scrollbarWidth: "none",
        //   "&::-webkit-scrollbar": { display: "none" },
        // }}
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "transparent",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Top tab bar */}
        <Box
          mr={{ base: isMobile ? 0 : -2, md: 0 }}
          position="sticky"
          // overflow={"hidden"}
          top={0}
          // zIndex="10"
          zIndex="1000"
          // bg={'#f4f7fb'}
          bg={navBg}
          // marginTop={isMobile ? '9vh' : '0vh'}
          mt={{ base: "9vh", sm: "7.4vh", md: "0vh" }}
        >
          {/* <Dashboard_tab activeTab={activeTab} setActiveTab={setActiveTab} /> */}
          <Dashboard_tab
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);

              if (tab === "Announcements") {
                setSearchParams({ tab: "Announcements" });
              } else {
                setSearchParams({ tab: "Dashboard" });
              }
            }}
          />
        </Box>
        <Suspense fallback={<PageLoader />}>
          {activeTab === "Dashboard" ? (
            isAdmin ? (
              // ------------------ Admin (UNCHANGED) ------------------
              // <Box mr={{ base: -2, md: 0, }}  >
              <Box mr={{ base: isMobile ? 0 : -2, md: 0 }}>
                {/* ---------- TOP CARDS ---------- */}
                <SimpleGrid
                  mt={3}
                  columns={{ base: 1, md: 3 }}
                  // spacing={{ base: 3, md: 4 }}
                  spacing={3}
                  mb={1}
                >
                  <DashboardCards
                    icon={New_Joiners}
                    title="New Joiners"
                    count={newJoinersStats.count}
                    percentage={newJoinersStats.percentage}
                    status={newJoinersStats.status}
                  />
                  <DashboardCards
                    icon={Attendance}
                    title="Attendance (Today)"
                    count={attendanceSummary.present_count}
                    // percentage={2.5}
                    percentage={attendanceSummary.percentage_change}
                    // status="down"
                    status={attendanceSummary?.trend === "UP" ? "up" : "down"}
                  />
                  <DashboardCards
                    icon={Employee_Strength}
                    title="Employee Strength"
                    count={totalStats.count}
                    percentage={totalStats.percentage}
                    status={totalStats.status}
                  />
                </SimpleGrid>

                {/* ---------- MAIN GRID: CHART + CALENDAR ---------- */}
                <SimpleGrid
                  columns={{ base: 1, lg: 1 }}
                  spacing={4}
                  alignItems="flex-start"
                >
                  <Grid
                    templateColumns={{
                      base: "5fr",
                      lg: "minmax(0, 1fr) minmax(0, 1fr)",
                      // lg: "5fr 5fr",
                    }}
                    gap={3}
                    alignItems="flex-start"
                  >
                    {/* Left column: chart + pending approvals */}
                    <Box /*gridColumn={{ base: "1 / -1", lg: "span 2" }}*/>
                      {/* <Suspense fallback={<Center><Spinner size="sm" /></Center>}> */}
                      <EmployeeStrengthChart />
                      {/* </Suspense> */}

                      <Box mt={2}>
                        {/* <Suspense fallback={<Center><Spinner size="sm" /></Center>}> */}
                        <PendingApprovals />
                        {/* </Suspense> */}
                      </Box>
                    </Box>

                    {/* Right column: calendar + plans (or any other widget) */}
                    <Box>
                      {/* <Suspense fallback={<Center><Spinner size="sm" /></Center>}> */}
                      <Calender />
                      {/* </Suspense> */}
                    </Box>
                  </Grid>
                </SimpleGrid>
              </Box>
            ) : (
              // ------------------ Employee view ------------------
              // <Suspense fallback={<Center><Spinner size="sm" /></Center>}>
              <EmployeeDashboard isCollapsed={isCollapsed} />
              // </Suspense>
            )
          ) : (
            // <AnnouncementsBoard />
            <AnnouncementsBoard />
          )}
        </Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard;
