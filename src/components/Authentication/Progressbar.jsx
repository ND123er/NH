import { Box, Progress } from "@chakra-ui/react";

export const Progressbar = ({ value }) => {
  return (
    <Box
      width="97%"
      mt={4}
      ml={4}
      bg="#F0EEEE"
      borderRadius="full"
      p="6px"
      h="14px"
      boxSizing="border-box"
    >
      <Progress
        value={value}
        h="10px"
        borderRadius="full"
        mt={-1}
        sx={{
          "&": { backgroundColor: "transparent" },
          "& > div": {
            backgroundColor: "#274167",
            borderRadius: "9999px",
          },
        }}
      />
    </Box>
  );
};

