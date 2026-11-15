import React from "react";
import { Grid } from "@chakra-ui/react";
import PIPOverview from "./PIPOverview";
import Calibration from "./Calibration";

const GrowthReview = () => {
    return (
        <Grid templateColumns="2fr 1fr" gap={6} mt={8}>
            <PIPOverview />
            <Calibration />
        </Grid>
    );
};

export default GrowthReview;