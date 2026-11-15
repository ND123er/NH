import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";
import CalendarEditModal from "./CalendarEditModal";

export default function CalendarSettingsList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [calendarSettings, setCalendarSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // edit modal
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // delete dialog
  const [settingToDelete, setSettingToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCalendarSettings();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatRange = (start, end) => {
    if (!start || !end) return "-";

    const format = (d) => {
      const date = new Date(d);
      const day = date.getDate();
      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
            ? "nd"
            : day % 10 === 3 && day !== 13
              ? "rd"
              : "th";

      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();

      return `${day}${suffix} ${month}, ${year}`;
    };

    return `${format(start)} - ${format(end)}`;
  };

  const fetchCalendarSettings = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const org_id = getOrgCode();
      const res = await axios.get(`/settings/get_company_calendar/${org_id}`);
      const data = res?.data?.data;

      if (!data) {
        setCalendarSettings([]);
        setMessage("Currently no calendar settings are available");
        return;
      }

      const list = [
        {
          id: data._id,
          financial_year_start: data.financial_year_start,
          financial_year_end: data.financial_year_end,
          leave_year_start: data.leave_year_start,
          leave_year_end: data.leave_year_end,
          fiscal_year_range: formatRange(
            data.financial_year_start,
            data.financial_year_end,
          ),
          leave_year_range: formatRange(
            data.leave_year_start,
            data.leave_year_end,
          ),
        },
      ];

      setCalendarSettings(list);
    } catch (err) {
      const status = err?.response?.status;

      // 404 = no calendar configured yet (EMPTY STATE)
      if (status === 404) {
        setCalendarSettings([]);
        setMessage("Currently No Calendar Settings is available");
        setError(null);
        return;
      }

      // real error (network / 500 / auth / etc.)
      console.error("Error fetching calendar settings:", err);
      setError("Failed to fetch calendar settings. Please try again later.");
      setCalendarSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => navigate("add");

  const handleEditClick = (setting) => {
    setSelectedCalendar(setting);
    onEditOpen();
  };

  const handleDeleteClick = (setting) => {
    setSettingToDelete(setting);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(
        `/settings/delete_company_calendar/${settingToDelete.id}`,
      );

      toast({
        title: "Calendar setting deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchCalendarSettings();
    } catch (err) {
      console.error("Error deleting calendar setting:", err);
      toast({
        title: "Failed to delete",
        description: "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
      onDeleteClose();
      setSettingToDelete(null);
    }
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="14px"
        p={6}
        boxShadow="sm"
        w={"100%"}
        mt={3}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
      >
        <BreadcrumbsNav />
        {/* <BreadcrumbsNav extraSegments={["calenderSettings"]} /> */}

        <Box borderRadius={"10px"} border={"1px solid #e0e0e0"} pt={6}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            pr={6}
            pl={6}
          >
            <Box fontWeight="bold" fontSize="xl">
              Calendar Settings
            </Box>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="10px"
              width="110px"
              height='40px'
              size="md"
              onClick={handleAddClick}
              isDisabled={calendarSettings.length > 0}
              _hover={
                calendarSettings.length > 0
                  ? { cursor: "not-allowed" }
                  : { bg: "blue.700" }
              }
            >
              Add
            </Button>
          </Box>

          {/* <Box
            h="1px"
            w="100%"
            bgImage={`repeating-linear-gradient(
              to right,
              #C7C7C7 0,
              #C7C7C7 4px,
              transparent 4px,
              transparent 8px
            )`}
            mb={2}
          /> */}
          <Box
            w="100%"
            h="1.5px"
            bgImage="repeating-linear-gradient(
                      to right,
                      #C7C7C7 0 6px,
                      transparent 6px 14px
                    )"
            mb={2}
          />


          {loading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : error ? (
            <Center py={6}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : message ? (
            <Center py={6}>
              <Text color="gray.800" fontSize="sm">
                {message}
              </Text>
            </Center>
          ) : (
            <Table variant="simple" mt={4}>
              <Thead>
                <Tr>
                  {["Fiscal year", "Leave year", "Action"].map((label) => (
                    <Th
                      key={label}
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      textTransform="none"
                      letterSpacing="-0.42px"
                      color="black"
                      whiteSpace="nowrap"
                      py={2.5}
                      textAlign="center"
                    >
                      {label}
                    </Th>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {calendarSettings.length === 0 ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Text textAlign="center" py={4}>
                        No calendar settings found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  calendarSettings.map((s) => (
                    <Tr key={s.id}>
                      <Td textAlign="center" fontSize="14px">
                        {s.fiscal_year_range}
                      </Td>
                      <Td textAlign="center" fontSize="14px">
                        {s.leave_year_range}
                      </Td>
                      <Td textAlign="center" fontSize="14px">
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<span>•••</span>}
                            size="sm"
                            variant="ghost"
                            aria-label="actions"
                          />
                          <MenuList fontFamily={"Poppins"}>
                            <MenuItem
                              icon={<EditIcon />}
                              onClick={() => handleEditClick(s)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(s)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>

      <CalendarEditModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedCalendar(null);
        }}
        calendarId={selectedCalendar?.id}
        initialData={selectedCalendar}
        onUpdated={fetchCalendarSettings}
      />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(2px)">
          <AlertDialogContent fontFamily="Poppins">
            <AlertDialogHeader fontWeight="600">
              Delete Calendar Setting
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this calendar setting?
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
