import React, { useEffect } from "react";
import {
    Box,
    Flex,
    Text,
    VStack,
    Divider,
    Icon,
    Container,
    Heading,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const AttendanceSettings = [
    { label: "Check-in / Check-out Settings", path: "/settings/AttendanceTrackerSetting/CheckInCheckOutSettings" },
    { label: "Employee Check-in / Check-out", path: "/settings/AttendanceTrackerSetting/EmployeecheckInCheckOutSettings" },
    { label: "Shift Settings", path: "/settings/AttendanceTrackerSetting/shiftSetting" },
];



const SectionCard = ({ title, items, onRowClick }) => {
    return (
        <Box
            bg="white"
            border="1px solid #e1e8f0"
            borderRadius="14px"
            overflow="hidden"
            boxShadow="sm"
        >
            <Box px={4} py={3}>
                <Text fontSize="md" fontWeight="600" fontFamily='poppins'>
                    {title}
                </Text>
            </Box>

            <Divider />

            <VStack spacing={0} align="stretch">
                {items.map((it, idx) => (
                    <Flex
                        key={it.label + idx}
                        align="center"
                        justify="space-between"
                        px={4}
                        py={3}
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        borderBottom={
                            idx === items.length - 1 ? "none" : "1px solid #EDF2F7"
                        }
                        onClick={() => onRowClick && onRowClick(it)}
                    >
                        <Text fontSize="sm" fontFamily='poppins'>{it.label}</Text>
                        <Icon as={ChevronRightIcon} w={5} h={5} color="gray.400" />
                    </Flex>
                ))}
            </VStack>
        </Box>
    );
}

const AttendanceSiftSetting = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    }, []);

    const handleRowClick = (item) => {
        if (item.path) {
            navigate(item.path);
        } else {
            // fallback action
            console.warn("No path defined for this item:", item);
        }
    };

    return (
        <Box minH="100vh" py={3} mt={{ base: '7.7vh', sm: '6.3vh', md: '6.3vh', lg: '0vh' }}
            w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
            ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
            mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}>
            <Container maxW="100vw" px={-4}>
                <VStack spacing={3} align="stretch">
                    <SectionCard
                        title="Attendance tracker settings"
                        items={AttendanceSettings}
                        onRowClick={handleRowClick}
                    />
                </VStack>
            </Container>
        </Box>
    );
}
export default AttendanceSiftSetting;
