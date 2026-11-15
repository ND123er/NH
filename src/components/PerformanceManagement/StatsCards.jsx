// import React from "react";
// import { Grid, Box, Text } from "@chakra-ui/react";

// const stats = [
//   { title: "Completion Rate", value: "94.2%" },
//   { title: "Avg. Feedback Score", value: "4.2 / 5.0" },
//   { title: "Avg. Goal Progress", value: "71%" },
//   { title: "Pending Reviews", value: "23" },
// ];

// const StatsCards = () => {
//   return (
//     <Grid templateColumns="repeat(4,1fr)" gap={4}>
//       {stats.map((item, index) => (
//         <Box key={index} p={5} border="1px solid #ddd" borderRadius="lg">
//           <Text>{item.title}</Text>
//           <Text fontSize="2xl" fontWeight="bold">
//             {item.value}
//           </Text>
//         </Box>
//       ))}
//     </Grid>
//   );
// };

// export default StatsCards;



import React from "react";
import {
    Grid,
    Box,
    Text,
    Flex,
    Icon,
} from "@chakra-ui/react";
import {
    CheckSquare,
    Users,
    Hourglass,
    Clock3,
    ArrowUp,
} from "lucide-react";

const stats = [
    {
        title: "Completion Rate",
        value: "94.2%",
        icon: CheckSquare,
        status: "+2.5%",
        subText: "vs last cycle",
        statusColor: "#16A34A",
    },
    {
        title: "Avg. Feedback Score",
        value: "4.2",
        extra: "/ 5.0",
        icon: Users,
        status: "+0.3%",
        subText: "vs last cycle",
        statusColor: "#16A34A",
    },
    {
        title: "Avg. Goal Progress",
        value: "71%",
        icon: Hourglass,
        status: "On Track",
        statusColor: "#16A34A",
    },
    {
        title: "Pending Reviews",
        value: "23",
        icon: Clock3,
        status: "3 Overdue",
        statusColor: "#DC2626",
    },
];

const StatsCards = () => {
    return (
        <Grid templateColumns="repeat(4,1fr)" gap={5}>
            {stats.map((item, index) => (
                <Box
                    key={index}
                    bg="white"
                    border="1px solid #E5E7EB"
                    borderRadius="20px"
                    p={3}
                    minH="180px"
                >
                    {/* Top */}
                    <Flex align="center" gap={2} mb={6}>
                        <Icon as={item.icon} boxSize={5} color="gray.500" />
                        <Text
                            fontSize="16px"
                            fontWeight="500"
                            color="#6B7280"
                        >
                            {item.title}
                        </Text>
                    </Flex>

                    {/* Value */}
                    <Flex align="baseline" gap={1}>
                        <Text
                            fontSize="30px"
                            fontWeight="600"
                            color="#111827"
                            lineHeight="1"
                        >
                            {item.value}
                        </Text>

                        {item.extra && (
                            <Text
                                fontSize="20px"
                                fontWeight="600"
                                color="#6B7280"
                            >
                                {item.extra}
                            </Text>
                        )}
                    </Flex>

                    {/* Divider */}
                    <Box
                        borderBottom="1px dashed #D1D5DB"
                        my={6}
                    />

                    {/* Bottom Status */}
                    <Flex align="center" gap={2}>
                        {item.statusColor === "#16A34A" && (
                            <Flex
                                align="center"
                                justify="center"
                                w="20px"
                                h="20px"
                                border="1px solid #16A34A"
                                borderRadius="full"
                            >
                                <ArrowUp size={10} color="#16A34A" />
                            </Flex>
                        )}

                        <Text
                            fontSize="16px"
                            fontWeight="600"
                            color={item.statusColor}
                        >
                            {item.status}
                        </Text>

                        {item.subText && (
                            <Text fontSize="14px" color="#6B7280">
                                {item.subText}
                            </Text>
                        )}
                    </Flex>
                </Box>
            ))}
        </Grid>
    );
};

export default StatsCards;