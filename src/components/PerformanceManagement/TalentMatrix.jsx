import React from "react";
import { Box, Grid, Heading } from "@chakra-ui/react";
import HistoricalTrends from "./HistoricalTrends";

const TalentMatrix = () => {
    return (
        <Grid templateColumns="2fr 1fr" gap={6} mt={8}>
            <Box p={5} border="1px solid #ddd" borderRadius="lg">
                <Heading size="md">9-Box Talent Matrix</Heading>
            </Box>

            <HistoricalTrends />
        </Grid>
    );
};

export default TalentMatrix;