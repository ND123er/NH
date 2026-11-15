import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Flex, Text } from "@chakra-ui/react";

const COLORS = [
  "#ffdef3",
  "#def0ff",
  "#fcecb1",
  "#c3f7df",
  "#e6c7ff",
  "#ffdfbd",
];

export default function ExitDistributionChart({ data }) {
  return (
    <Box
      bg="white"
      borderRadius="14px"
      // p={6}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      // mt={6}
      mt={{ base: "1vh", sm: "1vh", md: "3vh", lg: 3 }}
      mb={{ base: "9vh", sm: "5vh", md: "3vh", lg: 3 }}
      border="1px solid #e1e8f0"
      fontFamily="Poppins"
      h={{ base: "35vh", sm: "28vh", md: "40vh", lg: "50vh" }}
      sx={{
        overflowY: "auto",
        scrollbarWidth: "none !important",
        "&::-webkit-scrollbar": {
          display: "none !important",
        },
      }}
      // sx={{
      //   overflowY: "scroll",
      //   scrollbarWidth: "none !important",
      //   msOverflowStyle: "none",
      //   "&::-webkit-scrollbar": {
      //     width: "0 !important",
      //     height: "0 !important",
      //     display: "none !important",
      //     background: "transparent",
      //   },
      //   "&::-webkit-scrollbar-thumb": {
      //     background: "transparent",
      //   },
      // }}
    >
      <Text fontWeight="600" fontSize="lg" mb={4}>
        Distribution
      </Text>
      {data.length !== 0 ? (
        <Flex align="center" gap={{ base: 6, sm: 6, md: 10, lg: 10 }}>
          {/* PIE CHART */}
          <Box
            w="40%"
            /*w={{ base: "80%", sm: "30%", md: "30%", lg: "40%" }}*/ /*h="280px"*/ h={{
              base: "100px",
              sm: "200px",
              md: "250px",
              lg: "280px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="employees"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  //  outerRadius={110}
                  outerRadius={{ base: 80, sm: 110, md: 100, lg: 110 }}
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* CUSTOM LEGEND */}
          <Flex direction="column" gap={6}>
            {data.map((item, index) => (
              <Flex key={index} align="center" gap={4}>
                <Box
                  w="64px"
                  h="24px"
                  bg={COLORS[index % COLORS.length]}
                  borderRadius="4px"
                />
                <Text fontSize="14px" fontWeight="500" color="#000">
                  {item.name}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      ) : (
        <Text
          fontSize="18px"
          fontWeight="500"
          textAlign="center"
          color="#7D7D7D"
          fontFamily="poppins"
        >
          {/* {data.length !== 0 ? "NO data found" : null} */}
          No data found
        </Text>
      )}
    </Box>
  );
}
