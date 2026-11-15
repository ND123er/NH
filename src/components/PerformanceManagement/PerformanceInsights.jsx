import React from "react";
import { Box, Heading, Grid } from "@chakra-ui/react";
import KPIScores from "./KPIScores";
import KPIFormula from "./KPIFormula";
import Achievements from "./Achievements";


const PerformanceInsights = () => {
  return (
    <Box>
      <Heading mb={6}>Performance Insights</Heading>

      <Grid templateColumns="2fr 1fr" gap={6}>
        <KPIScores />

        <Box>
          <Achievements />
          <KPIFormula />
        </Box>
      </Grid>
    </Box>
  );
};

export default PerformanceInsights;