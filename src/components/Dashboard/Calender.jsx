import { isAdminUser } from "../../utils/roles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getHolidayList } from "../../api/holidays";
import { getOrgCode } from "../../utils/token";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Divider,
  VStack,
  HStack,
  Avatar,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../style/calender.css";
import { useSelector, useDispatch } from "react-redux";

const Calender = ({ isCollapsed }) => {
  const navBg = useColorModeValue("#fff", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  // month label state
  const [currentMonthLabel, setCurrentMonthLabel] = useState("");
  // holiday dates state
  const [holidayDates, setHolidayDates] = useState([]);
  // full holiday objects state
  const [holidays, setHolidays] = useState([]);

  const calendarRef = useRef(null);
  const { user, token, loading } = useSelector((state) => state.auth);

  // Utility: expand date range into array of date strings (YYYY-MM-DD)
  const expandDateRange = (startISO, endISO) => {
    const dates = [];
    const start = new Date(startISO.slice(0, 10) + "T00:00:00");
    const end = new Date(endISO.slice(0, 10) + "T00:00:00");
    let current = new Date(start);
    while (current <= end) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Fetch holidays once
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const organisationId = getOrgCode?.(); /*|| "HRMS000017"*/
        const res = await getHolidayList(organisationId);
        const dateSet = new Set();
        (res.data || []).forEach((holiday) => {
          const dates = expandDateRange(
            holiday.start_date,
            holiday.end_date || holiday.start_date,
          );
          dates.forEach((d) => dateSet.add(d));
        });
        setHolidayDates([...dateSet]);
        setHolidays(res.data || []);

        setTimeout(() => {
          markHolidayDatesForVisibleRange();
        }, 0);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      }
    };

    fetchHolidays();
  }, []);

  // Utility: remove existing holiday classes
  const clearMarkedHolidays = () => {
    document.querySelectorAll(".fc-daygrid-day.has-holiday").forEach((el) => {
      el.classList.remove("has-holiday");
    });
  };

  // Mark holiday td cells that are currently visible in the calendar view
  const markHolidayDatesForVisibleRange = (arg) => {
    if (!holidayDates || holidayDates.length === 0) return;

    // find visible range
    let viewStart = null;
    let viewEnd = null;
    if (arg?.view) {
      viewStart = arg.view.activeStart;
      viewEnd = arg.view.activeEnd; // exclusive
    } else if (calendarRef.current?.getApi) {
      const api = calendarRef.current.getApi();
      if (api?.view) {
        viewStart = api.view.activeStart;
        viewEnd = api.view.activeEnd;
      }
    }

    // if we don't have range info, do nothing
    if (!viewStart || !viewEnd) return;

    // clear previous marks (so we don't leave stale classes)
    clearMarkedHolidays();

    // for each holiday date, if within visible range, add class to the <td data-date="">
    holidayDates.forEach((dateStr) => {
      // convert date string to Date for comparison
      const d = new Date(dateStr + "T00:00:00");
      // activeEnd is exclusive; include start, exclude end
      if (d >= viewStart && d < viewEnd) {
        const td = document.querySelector(`td[data-date="${dateStr}"]`);
        if (td) td.classList.add("has-holiday");
      }
    });
  };

  // handler when view changes (navigation, month change, initial render)
  const handleDatesSet = (arg) => {
    const date = arg.view.currentStart;
    const label = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    setCurrentMonthLabel(label);
    setTimeout(() => {
      markHolidayDatesForVisibleRange(arg);
    }, 0);
  };

  const visibleMonthHolidays = useMemo(() => {
    if (!currentMonthLabel) return [];
    const [monthName, yearStr] = currentMonthLabel.split(" ");
    const year = Number(yearStr);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    return holidays.filter((h) => {
      const start = new Date(h.start_date);
      return start.getMonth() === monthIndex && start.getFullYear() === year;
    });
  }, [holidays, currentMonthLabel]);

  // debug
  return (
    <Box
      // bg="white"
      bg={navBg}
      borderRadius="14px"
      border="1px solid #cccccc"
      boxShadow="md"
      pt={6}
      pb={6}
      // w="100%"
      // w={481}
      // w={isAdminUser(user) ? 484 : 379}
      // w={380}
      // mt={2}
      w={{
        base: "100%",
        md: "100%",
        // lg: isAdminUser(user) ? "32.36vw" : "32.36vw",
        // lg: isAdminUser(user) ? "32.91vw" : "31.19vw",
        //old
        // lg: isAdminUser(user) ? "100%" : "31.19vw",
        //new
        lg: isAdminUser(user) ? "100%" : isCollapsed ? "100%" : "31.19vw",
      }}
      mt={{
        base: 3,
        lg: isAdminUser(user) ? 2 : 3,
      }}
      // mt={isAdminUser(user) ? 2 : 3}
      mb={3}
    >
      <Heading
        size="md"
        color={textClr}
        fontWeight={600}
        letterSpacing="-3%"
        fontFamily="'Poppins', sans-serif"
        pb={6}
        pl={4}
      >
        Events
      </Heading>

      {/* Divider */}
      <Box
        w="100%"
        h="1px"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* Month Label */}
      <Text
        textAlign="left"
        fontSize="16px"
        fontWeight="500"
        color="#757575"
        fontFamily="'Poppins', sans-serif"
        pl={4}
        mb={2}
      >
        {currentMonthLabel}
      </Text>

      {/* Full-Calender component */}
      {/* <Box borderRadius="10px" bg={navBg} mb={3} p={2} style={{
        "--fc-bg": navBg,
        "--fc-text": textClr,

      }}>
        <style>
          {`
      .calendar-wrapper .fc-scrollgrid-section-header td {
        background-color: var(--fc-bg) !important;
      }

      .calendar-wrapper .fc-col-header-cell {
        background-color: var(--fc-bg) !important;
        border: none !important;
      }

      .calendar-wrapper .fc-col-header-cell-cushion {
        color: var(--fc-text) !important;
        font-weight: 600;
      }

      .calendar-wrapper .fc-theme-standard th {
        background-color: var(--fc-bg) !important;
      }

      .calendar-wrapper .fc-scrollgrid {
        background-color: var(--fc-bg) !important;
      }

      .calendar-wrapper .fc-daygrid-day-frame {
        background-color: var(--fc-bg) !important;
      }

      .calendar-wrapper .fc-daygrid-day-number {
        color: var(--fc-text) !important;
      }
    `}
        </style>

        <FullCalendar
          key={holidayDates.join("|")}
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          firstDay={1}
          dayHeaderFormat={{ weekday: "short" }}
          displayEventTime={false}
          events={[]}
          datesSet={handleDatesSet}
        />
      </Box>  */}
      <Box
        borderRadius="10px"
        bg={navBg}
        mb={3}
        p={2}
        style={{
          "--fc-bg": navBg,
          "--fc-text": textClr,
        }}
        className="
          calendar-wrapper
        "
      >
        <style>
          {`
      /* Header row background */
      .calendar-wrapper .fc-scrollgrid-section-header td {
        background-color: var(--fc-bg) !important;
      }

      /* Weekday name cell */
      .calendar-wrapper .fc-col-header-cell {
        background-color: var(--fc-bg) !important;
        border: none !important;
      }

      /* Weekday text */
      .calendar-wrapper .fc-col-header-cell-cushion {
        color: var(--fc-text) !important;
        font-weight: 400;
        font-size: 14px !important;
      }

      /* Remove white strip */
      .calendar-wrapper .fc-theme-standard th {
        background-color: var(--fc-bg) !important;
      }

      /* Full table bg */
      .calendar-wrapper .fc-scrollgrid {
        background-color: var(--fc-bg) !important;
      }

      /* Day cell background */
      .calendar-wrapper .fc-daygrid-day-frame {
        background-color: var(--fc-bg) !important;
      }

      /* Date number */
      .calendar-wrapper .fc-daygrid-day-number {
        color: var(--fc-text) !important;
      }
    `}
        </style>
        {/* <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          firstDay={1}
          dayHeaderFormat={{ weekday: "short" }}
          displayEventTime={false}
          events={[]}
          datesSet={handleDatesSet}
        /> */}
        <FullCalendar
          key={holidayDates.join("|")}
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          firstDay={1}
          dayHeaderFormat={{ weekday: "short" }}
          displayEventTime={false}
          events={[]}
          datesSet={handleDatesSet}
        />
      </Box>

      {/* Icon-Buttons */}
      <Flex justify="center" gap={6} mb={3}>
        <IconButton
          aria-label="Previous month"
          icon={<Text fontSize="22px">‹</Text>}
          variant="ghost"
          onClick={() => calendarRef.current?.getApi().prev()}
        />
        <IconButton
          aria-label="Next month"
          icon={<Text fontSize="22px">›</Text>}
          variant="ghost"
          onClick={() => calendarRef.current?.getApi().next()}
        />
      </Flex>

      {/* Holiday Tiles */}
      <Box
        p={2}
        maxH="256px"
        overflow={"auto"}
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
        className="
          holiday-scroll
        "
      >
        <VStack align="stretch" spacing={3}>
          {visibleMonthHolidays.length === 0 ? (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
              No holidays this month
            </Text>
          ) : (
            visibleMonthHolidays.map((h, idx) => (
              <Flex
                key={h.id}
                align="center"
                justify="space-between"
                p={3}
                borderRadius="xl"
                border="1px solid #cccccc"
                borderColor="gray.200"
                // bg="white"
                bg={navBg}
              >
                <HStack spacing={3}>
                  <Avatar
                    size="md"
                    name={h.holiday_name}
                    bg={
                      h.holiday_type === "Company Holiday"
                        ? "purple.600"
                        : "blue.700"
                    }
                    color={textClr}
                    fontSize="sm"
                  />
                  <Box>
                    <Text
                      fontWeight="semibold"
                      fontFamily="'Poppins', sans-serif"
                      fontSize="sm"
                    >
                      {h.holiday_name}
                    </Text>

                    {(() => {
                      const startIso = h.start_date;
                      const endIso = h.end_date || h.start_date;
                      const start = new Date(startIso);
                      const end = new Date(endIso);
                      // compare YYYY-MM-DD from ISO to avoid timezone issues
                      const isoStart = String(startIso).slice(0, 10);
                      const isoEnd = String(endIso).slice(0, 10);

                      const fmtMD = (d) =>
                        d.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      const fmtMDY = (d) =>
                        d.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      const fmtWeekShort = (d) =>
                        d.toLocaleString("en-US", { weekday: "short" });
                      const fmtWeekLong = (d) =>
                        d.toLocaleString("en-US", { weekday: "long" });

                      let dateLabel = "";
                      let dayLabel = "";

                      if (isoStart === isoEnd) {
                        // single day
                        dateLabel = fmtMDY(start);
                        dayLabel = fmtWeekLong(start);
                      } else {
                        // multi-day
                        if (start.getFullYear() === end.getFullYear()) {
                          // same year -> show year once after end
                          dateLabel = `${fmtMD(start)} - ${fmtMDY(end)}`;
                        } else {
                          // different years -> show both years
                          dateLabel = `${fmtMDY(start)} - ${fmtMDY(end)}`;
                        }
                        dayLabel = `${fmtWeekShort(start)} - ${fmtWeekShort(
                          end,
                        )}`;
                      }

                      return (
                        <HStack
                          spacing={3}
                          color="gray.500"
                          fontSize="xs"
                          mt={1}
                          fontFamily="'Poppins', sans-serif"
                        >
                          <Text>
                            • {dateLabel}
                            <Text
                              as="span"
                              ml={2}
                              color="gray.500"
                              fontSize="xs"
                            >
                              • {dayLabel}
                            </Text>
                          </Text>

                          {/* <Text>
                            • {h.no_of_days} day{h.no_of_days > 1 ? "s" : ""}
                          </Text> */}
                        </HStack>
                      );
                    })()}
                  </Box>
                </HStack>
              </Flex>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Calender;
