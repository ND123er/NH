import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useDisclosure,
  Text,
  Portal,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

const startOfDay = (d) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

const formatDateValue = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // value saved in the form
};

const formatDateDisplay = (date) => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const parseValueToDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const s = String(value).trim();

  // Handle ISO datetime like "2025-12-15T07:19:28.877Z" or "2025-12-15 07:19:28"
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const yi = Number(y);
    const mi = Number(m) - 1;
    const di = Number(d);
    if (!Number.isNaN(yi) && !Number.isNaN(mi) && !Number.isNaN(di)) {
      return new Date(yi, mi, di);
    }
  }

  // Fallback for plain YYYY-MM-DD without time
  const parts = s.split("-");
  if (parts.length === 3) {
    const yi = Number(parts[0]);
    const mi = Number(parts[1]) - 1;
    const di = Number(parts[2]);
    if (!Number.isNaN(yi) && !Number.isNaN(mi) && !Number.isNaN(di)) {
      return new Date(yi, mi, di);
    }
  }

  // Final fallback: try Date constructor (handles some other formats)
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthShortNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function DatePicker({
  label,
  placeholder = "dd/mm/yyyy",
  value,
  onChange,
  minDate,
  maxDate,
  error,
  iconMarginTop = 2,
  inputProps = {},
  ...rest
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const selectedDate = parseValueToDate(value);
  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;

  const [monthCursor, setMonthCursor] = useState(selectedDate || today);
  const [viewMode, setViewMode] = useState("day"); // 'day' | 'month' | 'year'

  // --------- DAY VIEW DATA ---------
  const monthStart = useMemo(
    () => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1),
    [monthCursor]
  );
  const monthEnd = useMemo(
    () => new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0),
    [monthCursor]
  );
  const leadingEmpty = monthStart.getDay(); // 0-6

  const days = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= monthEnd.getDate(); i++) {
      arr.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i));
    }
    return arr;
  }, [monthCursor, monthEnd]);

  // --------- YEAR VIEW DATA ---------
  const year = monthCursor.getFullYear();
  // show 12-year block, e.g. 2020-2031
  const yearBlockStart = Math.floor(year / 12) * 12;
  const yearBlock = Array.from({ length: 12 }, (_, i) => yearBlockStart + i);

  const handleDayClick = (day) => {
    const dayStart = startOfDay(day);
    if (min && dayStart < min) return;
    if (max && dayStart > max) return;

    const newValue = formatDateValue(dayStart);
    onChange?.(newValue);
    setViewMode("day");
    onClose();
  };

  const handleMonthSelect = (monthIndex) => {
    const newCursor = new Date(monthCursor.getFullYear(), monthIndex, 1);
    setMonthCursor(newCursor);
    setViewMode("day");
  };

  const handleYearSelect = (yearValue) => {
    const newCursor = new Date(yearValue, monthCursor.getMonth(), 1);
    setMonthCursor(newCursor);
    setViewMode("month"); // after picking year, show months
  };

  const goPrev = () => {
    if (viewMode === "day") {
      setMonthCursor(
        new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
      );
    } else if (viewMode === "month") {
      setMonthCursor(
        new Date(monthCursor.getFullYear() - 1, monthCursor.getMonth(), 1)
      );
    } else if (viewMode === "year") {
      // previous block of 12 years
      setMonthCursor(
        new Date(monthCursor.getFullYear() - 12, monthCursor.getMonth(), 1)
      );
    }
  };

  const goNext = () => {
    if (viewMode === "day") {
      setMonthCursor(
        new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
      );
    } else if (viewMode === "month") {
      setMonthCursor(
        new Date(monthCursor.getFullYear() + 1, monthCursor.getMonth(), 1)
      );
    } else if (viewMode === "year") {
      // next block of 12 years
      setMonthCursor(
        new Date(monthCursor.getFullYear() + 12, monthCursor.getMonth(), 1)
      );
    }
  };

  const monthLabel = monthStart.toLocaleString("default", {
    month: "long",
  });
  const yearLabel = monthStart.getFullYear();

  return (
    <Box w="100%">
      {label && (
        <Text mb={1} fontFamily="Poppins" fontSize="14px" fontWeight="500">
          {label}
        </Text>
      )}

      <Popover
        isOpen={isOpen}
        onOpen={() => {
          // sync view with current value on open
          setMonthCursor(selectedDate || today);
          setViewMode("day");
          onOpen();
        }}
        onClose={onClose}
        placement="bottom-start"
        isLazy
      >
        <PopoverTrigger>
          <InputGroup onClick={onOpen} cursor="pointer" mt="10px">
            <InputLeftElement pointerEvents="none" mt={iconMarginTop}>
              <CalendarIcon color="gray.400" />
            </InputLeftElement>
            <Input
              readOnly
              placeholder={placeholder}
              value={selectedDate ? formatDateDisplay(selectedDate) : ""}
              bg="white"
              {...inputProps} 
              // borderRadius="5px"
              boxShadow="sm"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #274066",
              }}
              {...rest}
            />
          </InputGroup>
        </PopoverTrigger>

        <Portal>
          <PopoverContent
            w="320px"
            borderRadius="xl"
            boxShadow="xl"
            overflow="hidden"
          >
            <PopoverBody p={3}>
              {/* Header: prev / month / year / next */}
              <Flex justify="space-between" align="center" mb={3}>
                <IconButton
                  size="sm"
                  aria-label="Previous"
                  icon={<ChevronLeftIcon />}
                  variant="ghost"
                  onClick={goPrev}
                />

                <Flex gap={1} align="center">
                  <Button
                    variant="ghost"
                    size="sm"
                    fontSize="sm"
                    px={2}
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === "month" ? "day" : "month"
                      )
                    }
                  >
                    {monthLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fontSize="sm"
                    px={2}
                    onClick={() =>
                      setViewMode((prev) => (prev === "year" ? "day" : "year"))
                    }
                  >
                    {yearLabel}
                  </Button>
                </Flex>

                <IconButton
                  size="sm"
                  aria-label="Next"
                  icon={<ChevronRightIcon />}
                  variant="ghost"
                  onClick={goNext}
                />
              </Flex>

              {/* VIEW: YEARS */}
              {viewMode === "year" && (
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {yearBlock.map((y) => (
                    <GridItem key={y}>
                      <Button
                        size="sm"
                        w="100%"
                        borderRadius="full"
                        variant={
                          y === monthCursor.getFullYear() ? "solid" : "ghost"
                        }
                        colorScheme={
                          y === monthCursor.getFullYear() ? "blue" : "gray"
                        }
                        fontSize="xs"
                        onClick={() => handleYearSelect(y)}
                      >
                        {y}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              )}

              {/* VIEW: MONTHS */}
              {viewMode === "month" && (
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {monthShortNames.map((m, index) => (
                    <GridItem key={m}>
                      <Button
                        size="sm"
                        w="100%"
                        borderRadius="full"
                        variant={
                          index === monthCursor.getMonth() ? "solid" : "ghost"
                        }
                        colorScheme={
                          index === monthCursor.getMonth() ? "blue" : "gray"
                        }
                        fontSize="xs"
                        onClick={() => handleMonthSelect(index)}
                      >
                        {m}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              )}

              {/* VIEW: DAYS */}
              {viewMode === "day" && (
                <>
                  {/* Week days */}
                  <Grid templateColumns="repeat(7, 1fr)" mb={2}>
                    {weekDays.map((d) => (
                      <GridItem key={d}>
                        <Text
                          textAlign="center"
                          fontSize="xs"
                          fontWeight="600"
                          color="gray.500"
                        >
                          {d}
                        </Text>
                      </GridItem>
                    ))}
                  </Grid>

                  {/* Days grid */}
                  <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                    {Array.from({ length: leadingEmpty }).map((_, i) => (
                      <GridItem key={`empty-${i}`} />
                    ))}

                    {days.map((day) => {
                      const dayStart = startOfDay(day);
                      const isSelected =
                        selectedDate &&
                        startOfDay(selectedDate).getTime() ===
                          dayStart.getTime();
                      const isToday = dayStart.getTime() === today.getTime();
                      const isDisabled =
                        (min && dayStart < min) || (max && dayStart > max);

                      let bg = "transparent";
                      let color = "gray.700";
                      if (isSelected) {
                        bg = "blue.500";
                        color = "white";
                      } else if (isToday) {
                        bg = "blue.50";
                        color = "blue.600";
                      }

                      return (
                        <GridItem key={day.toISOString()}>
                          <Button
                            size="sm"
                            w="100%"
                            h="32px"
                            variant="ghost"
                            borderRadius="full"
                            fontSize="xs"
                            bg={bg}
                            color={color}
                            _hover={
                              !isDisabled && !isSelected
                                ? { bg: "gray.100" }
                                : undefined
                            }
                            isDisabled={isDisabled}
                            onClick={() => handleDayClick(day)}
                          >
                            {day.getDate()}
                          </Button>
                        </GridItem>
                      );
                    })}
                  </Grid>
                </>
              )}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>

      {error && (
        <Text mt={1} fontSize="xs" color="red.500">
          {error}
        </Text>
      )}
    </Box>
  );
}
