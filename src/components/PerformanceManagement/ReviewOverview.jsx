
import React from "react";
import { Box, Heading, Grid } from "@chakra-ui/react";
import StatsCards from "./StatsCards";
import ActiveReviewCycles from "./ActiveReviewCycles";
import GoalsOverview from "./GoalsOverview";

const ReviewOverview = () => {
    return (
        <Box mb={10}>
            <p mb={3} fontSize="2px" fontWeight="400">
                Performance Management / Overview
            </p>
            <Heading mb={6} fontSize="28px" fontWeight="600">
                Review Cycles Overview
            </Heading>

            <StatsCards />

            <Grid templateColumns="2fr 1fr" gap={6} mt={6}>
                <ActiveReviewCycles />
                <GoalsOverview />
            </Grid>
        </Box>
    );
};

export default ReviewOverview;