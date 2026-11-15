
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Switch,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Divider,
  IconButton,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../api/axios";
import { getOrgIdFromReduxOrStorage } from "../../../utils/token";

const LATE_MODE_API_MAP = {
  none: "NONE",
  grace: "AFTER_GRACE",
  any: "ANY_LATE",
};

const LATE_MODE_UI_MAP = {
  NONE: "none",
  AFTER_GRACE: "grace",
  ANY_LATE: "any",
};
const CheckInCheckOutSettings = () => {
  const [allowWeb, setAllowWeb] = useState(false);
  const [mandatoryCheckout, setMandatoryCheckout] = useState(false);
  const [lateMode, setLateMode] = useState("none");

  const { user, token, loading } = useSelector((state) => state.auth);
  const [settingsData, setSettingsData] = useState(null);
  const toast = useToast();
  // useEffect(() => {
  //   fetchSettings();
  // }, []);
  
  useEffect(() => {
  if (user?.organisation_id) {
    fetchSettings();
  }
}, [user?.organisation_id]);

  const fetchSettings = async () => {
    try {
      const orgId = getOrgIdFromReduxOrStorage(user);
      // const url = `attendance/get_attendance_setting?organisation_id=${orgId}`;
      const url = `attendance/get_attendance_setting?organisation_id=${user?.organisation_id}`;
      console.log('sgd', url);
      const res = await api.get(url);
      setSettingsData(res.data?.data);
      setAllowWeb(res.data?.data?.allow_web_checkin);
      setMandatoryCheckout(res.data?.data?.mandatory_checkout);
      // setLateMode(res.data?.data?.late_mark_mode);
      setLateMode(LATE_MODE_UI_MAP[res.data?.data?.late_mark_mode]);
    } catch (err) {
      console.error("Error fetching attendance settings:", err);
    }
  }

  const updateAttendanceSetting = async (changedField) => {
    const orgId = getOrgIdFromReduxOrStorage(user);
    const payload = {
      organisation_id: orgId,
      ...changedField,
    };
    try {
      const apiResponse = await api.post("/attendance/update_attendance_setting", payload);
      toast({
        title: "Setting updated",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="#f5f6f8" minH="100vh" /*p={6}*/ p={0} pt={0} pl={0} mt={3}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={0}>
        <BreadcrumbsNav extraSegments={[
          // 'attendacen_tracker_setting',
          'checkInCheckOutSettings',
          "check-in_Check-out",
        ]} />
      </Flex>

      {/* CARD 1 */}
      <Box bg="white" borderRadius="12px" p={6} mb={5}>
        <Heading fontSize={'18px'} fontWeight={'700'} mb={3} fontFamily='poppins'>
          Allow web check-in / check-out
        </Heading>
        <Divider borderStyle="dashed" mb={4} />
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600" fontFamily='poppins'>
            Employees have to click on the check-in / check-out button manually
          </Text>
          <Switch
            size="lg"
            isChecked={allowWeb}
            onChange={(e) => {
              const value = e.target.checked;
              setAllowWeb(value);
              updateAttendanceSetting({
                allow_web_checkin: value,
              });
            }}
            sx={{
              ".chakra-switch__track[data-checked]": {
                backgroundColor: "#274066",
              },
              ".chakra-switch__thumb": {
                backgroundColor: "white",
              },
            }}
          />
        </Flex>
      </Box>

      {/* CARD 2 */}
      <Box bg="white" borderRadius="12px" p={6} mb={5}>
        <Heading fontSize={'18px'} fontWeight={'700'} mb={3} fontFamily='poppins'>
          Make check-out mandatory every day
        </Heading>

        <Divider borderStyle="dashed" mb={4} />

        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600" maxW="80%" fontFamily='poppins'>
            If no checkout found, the checkout time will be determined either by
            auto-checkout or the shift end time or the day end time.
          </Text>
          <Switch
            size="lg"
            isChecked={mandatoryCheckout}
            onChange={(e) => {
              const value = e.target.checked;
              setMandatoryCheckout(value);

              updateAttendanceSetting({
                mandatory_checkout: value,
              });
            }}
            sx={{
              ".chakra-switch__track[data-checked]": {
                backgroundColor: "#274066",
              },
              ".chakra-switch__thumb": {
                backgroundColor: "white",
              },
            }}
          />

        </Flex>
      </Box>

      {/* CARD 3 */}
      <Box bg="white" borderRadius="12px" p={6}>
        <Heading fontSize={'18px'} fontWeight={'700'} mb={3} fontFamily='poppins'>
          Late mark display mode
        </Heading>
        <Divider borderStyle="dashed" mb={4} />
        <RadioGroup value={lateMode} onChange={setLateMode}>
          <Stack direction="row" spacing={6}>
            <Checkbox
              isChecked={lateMode === "none"}
              onChange={() => {
                setLateMode("none");
                updateAttendanceSetting({
                  late_mark_mode: LATE_MODE_API_MAP.none,
                });
              }}
              sx={{
                ".chakra-checkbox__control": {
                  border: "1px solid #cccccc",
                },
                ".chakra-checkbox__control[data-checked]": {
                  bg: "#274066",
                  borderColor: "#274066",
                  color: "white",
                },
                fontFamily: "poppins",
              }}
            >
              Don’t show late mark
            </Checkbox>

            <Checkbox
              isChecked={lateMode === "grace"}
              onChange={() => {
                setLateMode("grace");
                updateAttendanceSetting({
                  late_mark_mode: LATE_MODE_API_MAP.grace,
                });
              }}
              sx={{
                ".chakra-checkbox__control": {
                  border: "1px solid #cccccc",
                },
                ".chakra-checkbox__control[data-checked]": {
                  bg: "#274066",
                  borderColor: "#274066",
                  color: "white",
                },
                fontFamily: "poppins",
              }}
            >
              Show only after grace period is violated
            </Checkbox>

            <Checkbox
              isChecked={lateMode === "any"}
              onChange={() => {
                setLateMode("any");
                updateAttendanceSetting({
                  late_mark_mode: LATE_MODE_API_MAP.any,
                });
              }}
              sx={{
                ".chakra-checkbox__control": {
                  border: "1px solid #cccccc",
                },
                ".chakra-checkbox__control[data-checked]": {
                  bg: "#274066",
                  borderColor: "#274066",
                  color: "white",
                },
                fontFamily: "poppins",
              }}
            >
              Show for any late punch
            </Checkbox>
          </Stack>
        </RadioGroup>
        {lateMode === "none" && (
          <Text fontSize="xs" color="gray.500" mt={4} fontFamily='poppins'>
            No late-icon is displayed, even when punches are after shift start
          </Text>
        )}
        {lateMode === "grace" && (
          <Text fontSize="xs" color="gray.500" mt={4} fontFamily='poppins'>
            Displays the icon only when an employee checks in past the allotted grace time
          </Text>)}
        {lateMode === "any" && (
          <Text fontSize="xs" color="gray.500" mt={4} fontFamily='poppins'>
            Displays the icon for all punches after shift start, regardless of grace
          </Text>
        )}
      </Box>
      {lateMode === "grace" && (
        <Text fontSize="xs" color="gray.500" mt={4} ml={7} fontFamily='poppins'>
          <Text as="span" color="#000" fontWeight="600" fontFamily='poppins'>
            Note:
          </Text> If a shift has no grace period configured, any late check-in will display the late icon
        </Text>
      )}
    </Box>
  );
};

export default CheckInCheckOutSettings;