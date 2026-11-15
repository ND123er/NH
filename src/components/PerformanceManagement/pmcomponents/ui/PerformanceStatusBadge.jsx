
import React from "react";
import { Badge } from "@chakra-ui/react";

const statusColors = {
  Upcoming: "blue",
  Pending: "orange",
  Submitted: "green",
  Approved: "green",
  Overdue: "red",
  Expired: "red",
  "Feedback Pending": "orange",
  Completed: "green",
};

const PerformanceStatusBadge = ({ status }) => {
  return (
    <Badge
      colorScheme={statusColors[status] || "gray"}
      borderRadius="full"
      px={3}
      py={1}
      textTransform="capitalize"
      fontWeight={500}
    >
      {status || "Unknown"}
    </Badge>
  );
};

export default PerformanceStatusBadge;
