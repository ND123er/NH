import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Text,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@chakra-ui/react";
import { InputGroup, InputLeftElement, Image } from "@chakra-ui/react";
import searchImg from "../../assets/search_icon2.svg";
import { FiClock } from "react-icons/fi";
import {
  ViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import api from "../../api/axios";
import { LuEye } from "react-icons/lu";
import { useSelector } from "react-redux";

const ShiftSettingsSection = ({ title }) => {
  const [cycleLength, setCycleLength] = useState();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [cycleDays, setCycleDays] = useState([]);
  const [patternSearch, setPatternSearch] = useState("");
  const [searchExpand, setSearchExpand] = useState(false);
  const placeholders = ["Search by Full Name", "Search by Employee ID"];
  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const navigate = useNavigate();
  const {
    // register,
    // setValue,
    // watch,
    // formState: { errors },
    register,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      cycleLength: "",
    },
  });

  const watchedCycleLength = watch("cycleLength");
  //new

  // Added only for saved patterns/calendar
  const [patterns, setPatterns] = useState([]);
  const [patternLoading, setPatternLoading] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isPatternCalendarOpen, setIsPatternCalendarOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);
  const [deletingPatternId, setDeletingPatternId] = useState(null);
  const [patternCalendarMonth, setPatternCalendarMonth] = useState(
    new Date(2026, 8, 1),
  );
  const shiftColors = [
    "#48bb78a2",
    "#ecc730",
    "#4f32d28f",
    "#DCFCE7",
    "#ed8936",
    "#FEE2E2",
    "#CCFBF1",
    "#FFEDD5",
  ];

  const [shiftColorMap, setShiftColorMap] = useState({});

  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  // Fetch shifts when component loads
  useEffect(() => {
    fetchShiftList();
    fetchPatterns();
  }, []);

  // Same API implementation as AttendanceTrackerSetting
  const fetchShiftList = async () => {
    try {
      setLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const url = `/settings/get_company_shift_list?org_id=${orgId}`;

      const res = await api.get(url);

      setShifts(res.data?.list || []);
    } catch (error) {
      console.error("Error fetching shifts", error);

      toast({
        title: "Failed to fetch shifts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved shift patterns
  const fetchPatterns = async () => {
    try {
      setPatternLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(
        `/schedules/patterns?organisation_id=${encodeURIComponent(
          orgId || "",
        )}`,
      );

      setPatterns(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);

      toast({
        title: "Failed to fetch patterns",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPatternLoading(false);
    }
  };

  // const deletePattern = async () => {
  //   if (!patternToDelete?._id || deletingPatternId) return;

  //   const patternId = patternToDelete._id;

  //   try {
  //     setDeletingPatternId(patternId);

  //     await api.delete(
  //       `/settings/delete_shift_data/${encodeURIComponent(patternId)}`,
  //     );

  //     toast({
  //       title: "Shift pattern deleted successfully",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });

  //     setPatternToDelete(null);

  //     // Close the view modal if this pattern is currently open
  //     if (selectedPattern?._id === patternId) {
  //       setSelectedPattern(null);
  //       setIsPatternCalendarOpen(false);
  //     }

  //     // Refresh the list from backend
  //     await fetchPatterns();
  //   } catch (error) {
  //     console.error("Error deleting shift pattern:", error);

  //     toast({
  //       title: "Failed to delete shift pattern",
  //       description:
  //         error.response?.data?.message ||
  //         error.response?.data?.msg ||
  //         "Something went wrong while deleting the pattern.",
  //       status: "error",
  //       duration: 4000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setDeletingPatternId(null);
  //   }
  // };

  const deletePattern = async () => {
    const patternId = patternToDelete?._id;
    const orgId = getOrgIdFromReduxOrStorage(user);

    if (!patternId || !orgId || deletingPatternId) return;

    try {
      setDeletingPatternId(patternId);

      await api.delete(`/schedules/patterns/${encodeURIComponent(patternId)}`, {
        params: {
          organisation_id: orgId,
        },
      });

      toast({
        title: "Shift pattern deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Close confirmation modal
      setPatternToDelete(null);

      // Close calendar modal if the deleted pattern is open
      if (selectedPattern?._id === patternId) {
        setSelectedPattern(null);
        setIsPatternCalendarOpen(false);
      }

      // Refresh list
      await fetchPatterns();
    } catch (error) {
      console.error("Delete error:", error);

      toast({
        title: "Failed to delete shift pattern",
        description:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "Something went wrong while deleting the pattern.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeletingPatternId(null);
    }
  };

  const savePattern = async () => {
    //new

    //new
    try {
      const orgId = getOrgIdFromReduxOrStorage(user);

      const payload = {
        organisation_id: orgId,
        name: patternName,
        days: cycleDays.map((day) => day.shiftId),
      };

      console.log("Pattern payload:", payload);

      await api.post("/schedules/patterns", payload);

      toast({
        title: "Pattern saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh saved patterns after save
      await fetchPatterns();
      clearPatternForm();
    } catch (error) {
      console.error("Error saving pattern:", error);

      toast({
        title: "Failed to save pattern",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open calendar for selected pattern
  // const openPatternCalendar = (pattern) => {
  //   setSelectedPattern(pattern);
  //   setPatternCalendarMonth(new Date(2026, 8, 1));
  //   setIsPatternCalendarOpen(true);
  // };
  // const clearPatternForm = () => {
  //   setPatternName("");
  //   setCycleLength("");
  //   setCycleDays([]);
  //   clearErrors();
  // };
  const clearPatternForm = () => {
    setPatternName("");
    setValue("cycleLength", "", {
      shouldValidate: false,
      shouldDirty: false,
    });
    setCycleDays([]);
    clearErrors();
  };
  const openPatternCalendar = async (pattern) => {
    try {
      const orgId = getOrgIdFromReduxOrStorage(user);

      const res = await api.get(
        `/schedules/patterns?organisation_id=${encodeURIComponent(
          orgId || "",
        )}`,
      );

      const patternList = res.data?.data || [];

      // Find the pattern that was clicked
      const selected = patternList.find((item) => item._id === pattern._id);
      const newColorMap = { ...shiftColorMap };

      selected.days?.forEach((day) => {
        if (!day?.shift_id || newColorMap[day.shift_id]) return;

        const usedColors = Object.values(newColorMap);
        const availableColor =
          shiftColors.find((color) => !usedColors.includes(color)) ||
          shiftColors[0];

        newColorMap[day.shift_id] = availableColor;
      });

      setShiftColorMap(newColorMap);
      if (!selected) {
        toast({
          title: "Pattern not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedPattern(selected);
      setIsPatternCalendarOpen(true);
    } catch (error) {
      console.error("Error fetching pattern:", error);

      toast({
        title: "Failed to fetch pattern",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get the pattern shift for a particular calendar date.
  // The first calendar date represents cycle day 1,
  // then the response days repeat according to their order.
  const getPatternShiftForDate = (date) => {
    if (!selectedPattern?.days?.length) {
      return null;
    }

    const patternDays = selectedPattern.days;

    const referenceDate = new Date(2026, 8, 1);
    referenceDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    const difference = Math.floor(
      (currentDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const cycleIndex =
      ((difference % patternDays.length) + patternDays.length) %
      patternDays.length;

    return patternDays[cycleIndex];
  };

  // Calendar cells
  const getPatternCalendarDays = () => {
    const year = patternCalendarMonth.getFullYear();
    const month = patternCalendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let index = 0; index < firstDay; index++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const calendarDays = getPatternCalendarDays();

  const monthName = patternCalendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // const filteredPatterns = patterns.filter((pattern) =>
  //   String(pattern?.name || "")
  //     .toLowerCase()
  //     .includes(patternSearch.toLowerCase()),
  // );
  const filteredPatterns = patterns.filter((pattern) =>
    String(pattern?.name || "")
      .toLowerCase()
      .includes(patternSearch.trim().toLowerCase())
  );

  const isSearchActive = patternSearch.trim().length > 0;
  const noSearchResults =
    !patternLoading &&
    isSearchActive &&
    filteredPatterns.length === 0;

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
      {/* <Box
        w="100%"
        h="2px"
        bgImage="repeating-linear-gradient(to right,#C7C7C7 0 6px,transparent 6px 14px)"
        mb={4}
      /> */}

      <Box pt={0}>
        <Box
          // borderBottom="1px solid #cccccc"
          // borderRadius="14px"
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          BorderTop="unset"
          bg="#FFFFFF"
          position="relative"
          _after={{
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "-29px",
            width: "100%",
            height: "28px",
            background: "#f4f7fb",
            zIndex: 0,
          }}
        >
          <Grid
            templateColumns="1fr 1fr"
            gap={4}
            mb={5}
            p={6}
            pb={0}
            position="sticky"
            bg="white"
            zIndex="11"
            top="-26px"
          >
            <FormControl isInvalid={!!errors.patternName} mb={5}>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="gray.800"
                mb={1}
              >
                Pattern Name
              </FormLabel>

              <Input
                value={patternName}
                // onChange={(e) => setPatternName(e.target.value)}
                onChange={(e) => {
                  const value = e.target.value;
                  setPatternName(value);

                  const normalizedName = value
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLowerCase();

                  if (!normalizedName) {
                    setError("patternName", {
                      type: "manual",
                      message: "Pattern name is required.",
                    });
                    return;
                  }

                  if (value !== value.trim()) {
                    setError("patternName", {
                      type: "manual",
                      message: "Pattern name cannot start or end with spaces.",
                    });
                    return;
                  }

                  if (/\s{2,}/.test(value)) {
                    setError("patternName", {
                      type: "manual",
                      message: "Pattern name cannot contain multiple spaces.",
                    });
                    return;
                  }

                  // Check against patterns already fetched from API
                  const duplicatePattern = patterns.some((pattern) => {
                    const existingName = String(pattern?.name || "")
                      .trim()
                      .replace(/\s+/g, " ")
                      .toLowerCase();

                    return existingName === normalizedName;
                  });

                  if (duplicatePattern) {
                    setError("patternName", {
                      type: "manual",
                      message: "Pattern name already exists.",
                    });
                    return;
                  }

                  clearErrors("patternName");
                }}
                placeholder="Enter pattern name"
                h="55px"
                borderColor="#D0D5DD"
                borderRadius="8px"
                fontSize="16px"
              />
              {errors.patternName && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.patternName.message}
                </Text>
              )}
            </FormControl>

            {/* Cycle Length */}
            <FormControl mb={5}>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="gray.800"
                mb={1}
              >
                Pattern length
              </FormLabel>

              {/* <Input
                type="number"
                min={1}
                h="55px"
                max={366}
                value={cycleLength ?? ""}
                placeholder="Enter cycle length"
                fontSize="16px"
                borderColor="#D0D5DD"
                borderRadius="8px"
                onChange={(e) => {
                  const rawValue = e.target.value;

                  if (rawValue === "") {
                    setCycleLength("");
                    return;
                  }

                  const value = Number(rawValue);

                  if (value > 366) {
                    setCycleLength(366);
                  } else {
                    setCycleLength(value);
                  }
                }}
              /> */}

              {/* <NumberInput
                min={1}
                max={366}
                h="55px"
                value={cycleLength ?? ""}
                onChange={(valueAsString, valueAsNumber) => {
                  if (valueAsString === "") {
                    setCycleLength("");
                    return;
                  }

                  if (valueAsNumber > 366) {
                    setCycleLength(366);
                  } else {
                    setCycleLength(valueAsNumber);
                  }
                }}
              >
                <NumberInputField
                  h="55px"
                  placeholder="Enter cycle length"
                  fontSize="16px"
                  borderColor="#D0D5DD"
                  borderRadius="8px"
                />

                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput> */}
              <NumberInput
                min={0}
                value={watchedCycleLength ?? ""}
                clampValueOnBlur={false}
                onChange={(valueAsString) => {
                  const value = valueAsString.replace(/[^0-9]/g, "");
                  setValue("cycleLength", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                <NumberInputField
                  {...register("cycleLength", {
                    required: "Pattern length is required.",
                    validate: (value) => {
                      const number = Number(value);

                      if (number < 1 || number > 366) {
                        return "Cycle length must be between 1 and 366 days.";
                      }

                      return true;
                    },
                  })}
                  h="55px"
                  placeholder="Enter pattern length"
                  fontSize="16px"
                  borderColor={errors.cycleLength ? "red.500" : "#D0D5DD"}
                  borderRadius="8px"
                />

                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              {errors.cycleLength && (
                <Text mt={1} fontSize="12px" color="red.500">
                  {errors.cycleLength.message}
                </Text>
              )}
            </FormControl>
          </Grid>
          {/* Cycle Table */}
          {/* <Box
          border="1px solid #D0D5DD"
          borderRadius="8px"
          overflow="hidden"
          height="auto"
          minH="100px"
        >
          <Grid
            templateColumns="1fr 1fr 1fr"
            bg="#f0f2f5"
            borderBottom="1px solid #D0D5DD"
          >
            <Box
              p={2}
              fontSize="16px"
              fontWeight="600"
              color="gray.800"
              textAlign="center"
            >
              Cycle day
            </Box>

            <Box
              p={2}
              fontSize="16px"
              fontWeight="600"
              color="gray.800"
              textAlign="center"
            >
              Shift
            </Box>

            <Box
              p={2}
              fontSize="16px"
              fontWeight="600"
              color="gray.800"
              textAlign="center"
            >
              Hours
            </Box>
          </Grid>

          <Box height="100%" overflowY="auto" textAlign="center">
            {Array.from({ length: cycleLength || 0 }, (_, index) => {
              const day = index + 1;

              return (
                <Grid
                  key={day}
                  templateColumns="1fr 1fr 1fr"
                  borderBottom="1px solid #E2E8F0"
                  minH="44px"
                  alignItems="center"
                >
                  <Box
                    p={2.1}
                    fontSize="14px"
                    color="gray.800"
                    fontFamily="Poppins"
                  >
                    Day {day}
                  </Box>

                  <Box p={1.2}>
                    <Select
                      size="sm"
                      // value={cycleDays[index]?.shiftId || ""}
                      value={
                        cycleDays[index]?.shiftId === null
                          ? "OFF_DAY"
                          : cycleDays[index]?.shiftId || ""
                      }
                      placeholder={
                        loading ? "Loading shifts..." : "Select shift"
                      }
                      bg="white"
                      borderWidth="1.5px"
                      borderColor="#cccccc"
                      borderRadius="10px"
                      fontWeight={500}
                      height="40px"
                      textAlign="center"
                      color="black"
                      fontSize="14px"
                      onChange={(e) => {
                        const updatedDays = [...cycleDays];

                        updatedDays[index] = {
                          shiftId:
                            e.target.value === "OFF_DAY"
                              ? null
                              : e.target.value,
                        };

                        setCycleDays(updatedDays);
                      }}
                    >
                      {shifts.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.shift_name}
                        </option>
                      ))}

                      <option value="OFF_DAY">Off day</option>
                    </Select>
                  </Box>
                  <Box
                    p={2.1}
                    fontSize="14px"
                    color="gray.800"
                    fontFamily="Poppins"
                  >
                   
                    {cycleDays[index]?.shiftId === null
                      ? "Off day"
                      : (() => {
                          const selectedShift = shifts.find(
                            (shift) => shift._id === cycleDays[index]?.shiftId,
                          );

                          return selectedShift?.start && selectedShift?.end
                            ? `${selectedShift.start} – ${selectedShift.end}`
                            : "";
                        })()}
                  </Box>
                </Grid>
              );
            })}
          </Box>
        </Box> */}
          {/* Cycle Table New*/}
          {/* Cycle Table */}
          {/* Cycle Table */}
          {/* {cycleLength > 0 && */}
          {Number(watchedCycleLength) >= 1 &&
            Number(watchedCycleLength) <= 366 && (
              <Box overflow="hidden" height="auto" minH="100px" mt={2}>
                {/* Table Header */}
                <Grid
                  templateColumns="1fr 1fr 1fr"
                // bg="#EDF2F7"
                // borderBottom="1px solid #D9E0E7"
                >
                  <Box
                    py={3}
                    px={4}
                    fontSize="14px"
                    fontWeight="600"
                    color="#111827"
                    textAlign="center"
                    fontFamily="Poppins"
                  >
                    Cycle day
                  </Box>

                  <Box
                    py={3}
                    px={4}
                    fontSize="14px"
                    fontWeight="600"
                    color="#111827"
                    textAlign="center"
                    fontFamily="Poppins"
                  >
                    Shift
                  </Box>

                  <Box
                    py={3}
                    px={4}
                    fontSize="14px"
                    fontWeight="600"
                    color="#111827"
                    textAlign="center"
                    fontFamily="Poppins"
                  >
                    Hours
                  </Box>
                </Grid>

                {/* Rows */}
                <Box overflowY="auto">
                  {/* {Array.from({ length: cycleLength }, (_, index) */}
                  {Array.from(
                    { length: Number(watchedCycleLength) },
                    (_, index) => {
                      const day = index + 1;

                      return (
                        <Grid
                          key={day}
                          templateColumns="1fr 1fr 1fr"
                          minH="58px"
                          maxH="420px"
                          overflowY="auto"
                          alignItems="center"
                          bg={index % 2 === 0 ? "#EDF2F7" : "white"}
                        >
                          {/* Cycle Day */}
                          <Box
                            px={4}
                            fontSize="14px"
                            color="#0F2942"
                            fontFamily="Poppins"
                            fontWeight="500"
                            textAlign="center"
                          >
                            Day {day}
                          </Box>

                          {/* Shift */}
                          <Box px={4}>
                            <Select
                              size="sm"
                              boxShadow="0 4px #7984ca2b"
                              border="unset"
                              _focus={{
                                borderColor: "unset",
                                boxShadow: "none",
                              }}
                              value={
                                cycleDays[index]?.shiftId === null
                                  ? "OFF_DAY"
                                  : cycleDays[index]?.shiftId || ""
                              }
                              placeholder={
                                loading ? "Loading shifts..." : "Select shift"
                              }
                              // bg="white"
                              bg={
                                cycleDays[index]?.shiftId === null
                                  ? "#F1F5F9"
                                  : shiftColorMap[cycleDays[index]?.shiftId] ||
                                  "white"
                              }
                              borderWidth="1px"
                              borderColor="#D1D5DB"
                              borderRadius="8px"
                              fontWeight={500}
                              height="36px"
                              textAlign="left"
                              color="#334155"
                              fontSize="13px"
                              fontFamily="Poppins"
                              onChange={(e) => {
                                const selectedShiftId = e.target.value;

                                if (
                                  selectedShiftId !== "OFF_DAY" &&
                                  !shiftColorMap[selectedShiftId]
                                ) {
                                  const usedColors =
                                    Object.values(shiftColorMap);
                                  const availableColor = shiftColors.find(
                                    (color) => !usedColors.includes(color),
                                  );

                                  if (availableColor) {
                                    setShiftColorMap((prev) => ({
                                      ...prev,
                                      [selectedShiftId]: availableColor,
                                    }));
                                  }
                                }
                                const updatedDays = [...cycleDays];

                                updatedDays[index] = {
                                  shiftId:
                                    e.target.value === "OFF_DAY"
                                      ? null
                                      : e.target.value,
                                };

                                setCycleDays(updatedDays);
                              }}
                            >
                              {shifts.map((shift) => (
                                <option key={shift._id} value={shift._id}>
                                  {shift.shift_name}
                                </option>
                              ))}

                              <option value="OFF_DAY">Off day</option>
                            </Select>
                          </Box>

                          {/* Hours */}
                          <Flex
                            // px={4}
                            // fontSize="14px"
                            // color="#0F2942"
                            // fontFamily="Poppins"
                            // fontWeight="500"
                            // textAlign="center"
                            mx={4}
                            px={4}
                            h="44px"
                            align="center"
                            justify="center"
                            gap="8px"
                            // bg="white"
                            // border="1px solid #E2E8F0"
                            // borderRadius="10px"
                            color="#0F2942"
                            fontSize="14px"
                            fontWeight="500"
                          >
                            <FiClock size={17} />
                            <Text>

                              {cycleDays[index]?.shiftId === null
                                ? "Off day"
                                : (() => {
                                  const selectedShift = shifts.find(
                                    (shift) =>
                                      shift._id === cycleDays[index]?.shiftId,
                                  );

                                  return selectedShift?.start &&
                                    selectedShift?.end
                                    ? `${selectedShift.start} – ${selectedShift.end}`
                                    : "";
                                })()}
                            </Text>

                          </Flex>
                        </Grid>
                      );
                    },
                  )}
                </Box>
              </Box>
            )}
          <Flex
            justify="flex-end"
            gap={3}
            mt={0}
            px="24px"
            py="10px"
            position="sticky"
            bottom="-29px"
            left="0"
            bg="white"
            zIndex={10}
          >
            {/* <Button
              bg="white"
              color="#757575"
              border="1px solid #D0D5DD"
              borderRadius="14px"
              width="100px"
              onClick={clearPatternForm}
            >
              Clear
            </Button> */}
            <Button
              bg="blue.900"
              color="white"
              borderRadius="6"
              width={"100px"}
              _hover={{ bg: "blue.800" }}
              size="md"
              p="16px"
              onClick={savePattern}
            >
              Save
            </Button>

            <Button
              bg={"#EDF2F7"}
              borderRadius="6"
              fontSize="16px"
              fontWeight="600"
              color={"#757575"}
              // onClick={() => {
              //   navigate("/settings/AttendanceTrackerSetting/");
              // }}
              onClick={clearPatternForm}
            >
              Cancel
            </Button>
          </Flex>
        </Box>
        <Box
          mt={7}
          // p={5}
          // border="1px solid #cccccc"
          // borderRadius="14px"
          bg="#FFFFFF"
          position="relative"
          _after={{
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "-29px",
            width: "100%",
            height: "28px",
            background: "#f4f7fb",
            zIndex: 0,
          }}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            gap={3}
            mb={7}
            px={7}
            pt={7}
          >
            <Heading
              fontSize="22px"
              fontWeight="700"
              fontFamily="poppins"
              color="#000000"
            >
              Shift Pattern List
            </Heading>
            {/* <Box px={3} mb={4}>
            <Input
              value={patternSearch}
              onChange={(e) => setPatternSearch(e.target.value)}
              placeholder="Search pattern name"
              h="45px"
              maxW="350px"
              borderColor="#D0D5DD"
              borderRadius="8px"
              fontSize="14px"
            />
          </Box> */}
            {/* <Box
            position="relative"
            w={{
              base: searchExpand ? "170px" : "140px",
              md: searchExpand ? "320px" : "210px",
            }}
            overflow="hidden"
          >
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Image src={searchImg} alt="search" boxSize="16px" mt={2} />
              </InputLeftElement>

              {!patternSearch && (
                <Text
                  position="absolute"
                  left="38px"
                  top="50%"
                  transform="translateY(-50%)"
                  fontSize={{ base: "11px", md: "14px" }}
                  fontFamily="Poppins"
                  fontWeight="400"
                  color="#757575"
                  pointerEvents="none"
                  whiteSpace="nowrap"
                >
                  Search pattern name
                </Text>
              )}

              <Input
                value={patternSearch}
                onChange={(e) => setPatternSearch(e.target.value)}
                onFocus={() => setSearchExpand(true)}
                onBlur={() => {
                  if (!patternSearch) setSearchExpand(false);
                }}
                fontFamily="Poppins"
                h={{ base: "35px", md: "39px" }}
                fontSize={{ base: "12px", md: "14px" }}
                borderWidth="1.5px"
                borderColor="#cccccc"
                borderRadius="10px"
                pl="30px"
                _focus={{
                  borderColor: "#cccccc",
                  boxShadow: "none",
                }}
              />
            </InputGroup>
          </Box> */}
            <Box
              position="relative"
              w={{
                base: searchExpand ? "170px" : "140px",
                md: searchExpand ? "320px" : "210px",
              }}
              overflow="hidden"
              _focusWithin={{
                borderColor: "#cccccc",
                boxShadow: "none",
              }}
            >
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Image src={searchImg} alt="search" boxSize="16px" mt={2} />
                </InputLeftElement>

                {!patternSearch && (
                  <Text
                    key={`${placeholderIndex}-${searchExpand}`}
                    position="absolute"
                    left="38px"
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize={{ base: "11px", md: "14px" }}
                    fontFamily="Poppins"
                    fontWeight={"400"}
                    color="#757575"
                    pointerEvents="none"
                    animation="slideFade 3s ease-in-out"
                    whiteSpace="nowrap"
                  >
                    Search pattern name
                  </Text>
                )}

                <Input
                  value={patternSearch}
                  onChange={(e) => setPatternSearch(e.target.value)}
                  onFocus={() => setSearchExpand(true)}
                  onBlur={() => {
                    if (!patternSearch) setSearchExpand(false);
                  }}
                  fontFamily="Poppins"
                  h={{ base: "35px", md: "39px" }}
                  fontSize={{ base: "12px", md: "14px" }}
                  borderWidth="1.5px"
                  borderColor="#cccccc"
                  borderRadius="10px"
                  pl="30px"
                  _focus={{
                    borderColor: "#cccccc",
                    boxShadow: "none",
                  }}
                />
              </InputGroup>
            </Box>
          </Flex>
          <Box
            w="100%"
            h="1.5px"
            bgImage="repeating-linear-gradient(to right,#C7C7C7 0 6px,transparent 6px 14px)"
            mb="16px"
          />
          <Box
            // border="1px solid #E2E8F0"
            // borderRadius="8px"
            overflow="hidden"
          >
            {/* Table Header */}
            <Grid
              templateColumns="1fr 1fr 80px 80px"
              textAlign="left"
            // bg="#f0f2f5"
            // borderBottom="1px solid #E2E8F0"
            >
              <Box
                pt={0}
                px={3}
                pb="14px"
                fontSize="14px"
                fontWeight="600"
                fontFamily="'Poppins', sans-serif"
                color="#000000"
              >
                Pattern Name
              </Box>
              <Box
                pt={0}
                px={3}
                pb="14px"
                fontSize="14px"
                fontWeight="600"
                fontFamily="'Poppins', sans-serif"
                color="#000000"
              >
                Pattern Length
              </Box>
              <Box
                pt={0}
                px={3}
                pb="14px"
                fontSize="14px"
                fontWeight="600"
                fontFamily="'Poppins', sans-serif"
                color="#000000"
              >
                Action
              </Box>
              <Box
                pt={0}
                px={3}
                pb="14px"
                fontSize="14px"
                fontWeight="600"
                fontFamily="'Poppins', sans-serif"
                color="#000000"
              >
                Delete
              </Box>
            </Grid>

            {/* Loading */}
            {/* {patternLoading ? (
              <Box p={4}>
                <Text fontSize="12px" color="#718096">
                  Loading patterns...
                </Text>
              </Box>
            ) : patterns.length === 0 ? (
              <Box p={4}>
                <Text fontSize="12px" color="#718096">
                  No saved patterns found.
                </Text>
              </Box>
            ) : (
             
              filteredPatterns.map((pattern, index) => (
                <Grid
                  key={pattern._id}
                  templateColumns="1fr 1fr 80px 80px"
                  minH="44px"
                  textAlign="left"
                  alignItems="center"
                  bg={index % 2 === 0 ? "#EDF2F7" : "white"}
                >
                  <Box px={3}>
                    <Text
                      fontSize="14px"
                      fontFamily="'Poppins', sans-serif"
                      color="#000000"
                    >
                      {pattern.name}
                    </Text>
                  </Box>
                  <Box px={3}>
                    <Text
                      fontSize="14px"
                      fontFamily="'Poppins', sans-serif"
                      color="#000000"
                    >
                      {pattern.days.length}
                    </Text>
                  </Box>
                  <Flex justify="center" align="center" gap={2}>
                    <IconButton
                      aria-label={`View ${pattern.name}`}
                      icon={<LuEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openPatternCalendar(pattern)}
                    />
                  </Flex>
                  <Flex justify="center" align="center" gap={2}>
                    <IconButton
                      aria-label={`Delete ${pattern.name}`}
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      color="red.500"
                      _hover={{
                        bg: "red.50",
                        color: "red.600",
                      }}
                      isDisabled={!!deletingPatternId}
                      isLoading={deletingPatternId === pattern._id}
                      // onClick={() => deletePattern(pattern)}
                      onClick={() => setPatternToDelete(pattern)}
                    />
                  </Flex>
                </Grid>
              ))
            )} */}


            {/* Loading */}
            {patternLoading ? (
              <Box p={4}>
                <Text fontSize="12px" color="#718096">
                  Loading patterns...
                </Text>
              </Box>
            ) : patternSearch.trim() !== "" &&
              filteredPatterns.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontSize="14px" color="#718096">
                  No data found.
                </Text>
              </Box>
            ) : patterns.length === 0 ? (
              <Box p={4}>
                <Text fontSize="12px" color="#718096" textAlign="center">
                  No saved patterns found.
                </Text>
              </Box>
            ) : (
              filteredPatterns.map((pattern, index) => (
                <Grid
                  key={pattern._id}
                  templateColumns="1fr 1fr 80px 80px"
                  minH="44px"
                  textAlign="left"
                  alignItems="center"
                  bg={index % 2 === 0 ? "#EDF2F7" : "white"}
                >
                  <Box px={3}>
                    <Text fontSize="14px" color="#000000">
                      {pattern.name}
                    </Text>
                  </Box>

                  <Box px={3}>
                    <Text fontSize="14px" color="#000000">
                      {pattern.days.length}
                    </Text>
                  </Box>

                  <Flex justify="center" align="center" gap={2}>
                    <IconButton
                      aria-label={`View ${pattern.name}`}
                      icon={<LuEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openPatternCalendar(pattern)}
                    />
                  </Flex>

                  <Flex justify="center" align="center" gap={2}>
                    <IconButton
                      aria-label={`Delete ${pattern.name}`}
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      color="red.500"
                      isDisabled={!!deletingPatternId}
                      isLoading={deletingPatternId === pattern._id}
                      // onClick={() => deletePattern(pattern)}
                      onClick={() => setPatternToDelete(pattern)}
                    />
                  </Flex>
                </Grid>
              ))
            )}

          </Box>
        </Box>

        {/* =====================================================
    PATTERN CALENDAR MODAL
====================================================== */}
        {/* <Modal
          isOpen={isPatternCalendarOpen}
          onClose={() => setIsPatternCalendarOpen(false)}
          size="xl"
          isCentered
        >
          <ModalOverlay />

          <ModalContent
            fontFamily="Poppins"
            maxW="900px"
            w="calc(100% - 32px)"
            maxH="90vh"
            overflow="hidden"
          >
            <ModalHeader fontSize="16px" fontWeight="600" color="gray.800">
              {selectedPattern?.name || "Pattern"}
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody pb={6} overflowY="auto" overflowX="hidden">
              <Flex align="center" justify="space-between" mb={4}>
                <IconButton
                  aria-label="Previous month"
                  icon={<ChevronLeftIcon />}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPatternCalendarMonth(
                      new Date(
                        patternCalendarMonth.getFullYear(),
                        patternCalendarMonth.getMonth() - 1,
                        1,
                      ),
                    );
                  }}
                />

                <Text fontSize="14px" fontWeight="600" color="gray.800">
                  {monthName}
                </Text>

                <IconButton
                  aria-label="Next month"
                  icon={<ChevronRightIcon />}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPatternCalendarMonth(
                      new Date(
                        patternCalendarMonth.getFullYear(),
                        patternCalendarMonth.getMonth() + 1,
                        1,
                      ),
                    );
                  }}
                />
              </Flex>

              <Grid
                templateColumns="repeat(7, minmax(0, 1fr))"
                borderTop="1px solid #E2E8F0"
                borderLeft="1px solid #E2E8F0"
                minW="0"
                w="100%"
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <Box
                      key={day}
                      p={2}
                      minW="0"
                      textAlign="center"
                      bg="#f0f2f5"
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.800"
                    >
                      {day}
                    </Box>
                  ),
                )}
              </Grid>

              <Grid
                templateColumns="repeat(7, minmax(0, 1fr))"
                borderLeft="1px solid #E2E8F0"
                minW="0"
                w="100%"
              >
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <Box
                        key={`empty-${index}`}
                        minH="95px"
                        minW="0"
                        maxW="100%"
                        borderRight="1px solid #E2E8F0"
                        borderBottom="1px solid #E2E8F0"
                        bg="#FAFAFA"
                      />
                    );
                  }

                  const patternDay = getPatternShiftForDate(date);

                  return (
                    <Box
                      key={date.toISOString()}
                      minH="95px"
                      minW="0"
                      maxW="100%"
                      p={2}
                      borderRight="1px solid #E2E8F0"
                      borderBottom="1px solid #E2E8F0"
                      bg="#fff"
                      overflow="hidden"
                    >
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.800"
                        mb={2}
                      >
                        {date.getDate()}
                      </Text>

                      {patternDay ? (
                        <Box
                          bg="#E0F0FF"
                          borderRadius="5px"
                          p={2}
                          minW="0"
                          maxW="100%"
                          overflow="hidden"
                        >
                          <Text
                            fontSize="10px"
                            fontWeight="600"
                            color="#1769E0"
                            noOfLines={2}
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {patternDay.shift_name}
                          </Text>

                          <Text
                            mt={1}
                            fontSize="9px"
                            color="#475569"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {patternDay.start} – {patternDay.end}
                          </Text>
                        </Box>
                      ) : (
                        <Box
                          bg="#F1F5F9"
                          borderRadius="5px"
                          p={2}
                          minW="0"
                          maxW="100%"
                        >
                          <Text
                            fontSize="10px"
                            fontWeight="500"
                            color="#64748B"
                          >
                            Off day
                          </Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Grid>
            </ModalBody>
          </ModalContent>
        </Modal> */}
        {/* =====================================================
    PATTERN CYCLE VIEW MODAL
====================================================== */}
        <Modal
          isOpen={isPatternCalendarOpen}
          onClose={() => setIsPatternCalendarOpen(false)}
          size="xl"
          isCentered
        >
          <ModalOverlay />

          <ModalContent
            fontFamily="Poppins"
            maxW="700px"
            w="calc(100% - 32px)"
            maxH="90vh"
            overflow="hidden"
          >
            <ModalHeader fontSize="18px" fontWeight="600" color="gray.800">
              {selectedPattern?.name || "Pattern"}
            </ModalHeader>
            <Box
              w="100%"
              h="2px"
              bgImage="repeating-linear-gradient(to right,#C7C7C7 0 6px,transparent 6px 14px)"
              mb="16px"
            />

            <ModalCloseButton />

            <ModalBody pb={6} overflowY="auto" pl={0} pr={0} pt="0">
              {/* Header */}
              <Box
                // border="1px solid #E2E8F0"
                // borderRadius="10px"
                overflow="hidden"
              >
                <Grid
                  templateColumns="1fr 1fr 1fr"
                  textAlign="center"
                  pb="16px"
                // bg="#f0f2f5"
                // borderBottom="1px solid #E2E8F0"
                >
                  <Box
                    textTransform="none"
                    fontWeight="600"
                    fontFamily="'Poppins', sans-serif"
                    color="black"
                    fontSize="14px"
                  >
                    Cycle day
                  </Box>

                  <Box
                    textTransform="none"
                    fontWeight="600"
                    fontFamily="'Poppins', sans-serif"
                    color="black"
                    fontSize="14px"
                  >
                    Shift
                  </Box>

                  <Box
                    textTransform="none"
                    fontWeight="600"
                    fontFamily="'Poppins', sans-serif"
                    color="black"
                    fontSize="14px"
                  >
                    Hours
                  </Box>
                </Grid>

                {/* Cycle Days */}
                {selectedPattern?.days?.map((day, index) => {
                  const isOffDay = day === null;
                  return (
                    <Grid
                      key={index}
                      templateColumns="1fr 1fr 1fr"
                      minH="52px"
                      textAlign="center"
                      alignItems="center"
                      bg={index % 2 === 0 ? "#EDF2F7" : "white"}
                      borderBottom={
                        index === selectedPattern.days.length - 1
                          ? "none"
                          : "1px solid #E2E8F0"
                      }
                    >
                      {/* Day */}
                      <Box px={3}>
                        <Text fontSize="14px" color="#000000">
                          Day {index + 1}
                        </Text>
                      </Box>

                      {/* Shift */}
                      {/* <Box px={3}>
                        <Box
                          bg={isOffDay ? "#F1F5F9" : "#E0F0FF"}
                          borderRadius="7px"
                          px={3}
                          py={2}
                          display="inline-block"
                        >
                          <Text
                            fontSize="12px"
                            fontWeight="600"
                            color={isOffDay ? "#64748B" : "#1769E0"}
                          >
                            {isOffDay ? "Off day" : day?.shift_name || ""}
                          </Text>
                        </Box>
                      </Box> */}
                      {/* Shift */}
                      <Box px={3}>
                        <Box
                          bg={
                            isOffDay
                              ? "#F1F5F9"
                              : shiftColorMap[day?.shift_id] || "#E0F0FF"
                            // : shiftColorMap[day?._id] || "#E0F0FF"
                          }
                          borderRadius="7px"
                          px={3}
                          py={2}
                          display="inline-block"
                        >
                          <Text
                            fontSize="14px"
                            // fontWeight="600"
                            color={isOffDay ? "#64748B" : "#000000"}
                          >
                            {isOffDay ? "Off day" : day?.shift_name || ""}
                          </Text>
                        </Box>
                      </Box>

                      {/* Hours */}
                      <Box px={3}>
                        <Text fontSize="14px" color="#000000">
                          {/* {isOffDay
                            ? "Off day"
                            : selectedShift?.start && selectedShift?.end
                              ? `${selectedShift.start} – ${selectedShift.end}`
                              : ""} */}
                          {isOffDay
                            ? "Off day"
                            : day?.start && day?.end
                              ? `${day.start} – ${day.end}`
                              : ""}
                        </Text>
                      </Box>
                    </Grid>
                  );
                })}
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
        {/* Delete Pattern Confirmation Modal */}
        <Modal
          isOpen={!!patternToDelete}
          onClose={() => {
            if (!deletingPatternId) {
              setPatternToDelete(null);
            }
          }}
          isCentered
          size="md"
          closeOnOverlayClick={!deletingPatternId}
          closeOnEsc={!deletingPatternId}
        >
          <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />

          <ModalContent fontFamily="Poppins" borderRadius="12px" mx={4}>
            <ModalHeader fontSize="18px" fontWeight="600">
              Delete Shift Pattern
            </ModalHeader>

            <ModalCloseButton isDisabled={!!deletingPatternId} />

            <ModalBody pb={5}>
              <Text fontSize="16px" color="gray.700">
                Are you sure you want to delete the shift pattern{" "}
                <Text as="span" fontWeight="600">
                  "{patternToDelete?.name}"
                </Text>
                ?
              </Text>

              {/* <Text mt={2} fontSize="13px" color="red.500">
                This action cannot be undone.
              </Text> */}
            </ModalBody>

            <ModalFooter gap={3}>
              <Button
                variant="outline"
                borderRadius="8px"
                onClick={() => setPatternToDelete(null)}
                isDisabled={!!deletingPatternId}
              >
                Cancel
              </Button>

              <Button
                bg="red.500"
                color="white"
                borderRadius="8px"
                _hover={{ bg: "red.600" }}
                onClick={deletePattern}

                isLoading={!!deletingPatternId}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default ShiftSettingsSection;
