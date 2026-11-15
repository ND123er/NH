import { isAdminUser } from "../utils/roles";
import { Box, Alert, AlertIcon, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";

import Reports from "../components/Reports/ReportTab";
// import MyReports from "../components/Reports/MyReports"; // add later

export default function ReportsPage() {
  const { user } = useSelector((state) => state.auth);

  const isAdmin = isAdminUser(user);

  return (
    <Box
      // bg="#F6F7FB"
      borderRadius="16px"
      overflow="hidden"
      p={0}
      pr={0}
      pl={{ base: 2, sm: 2, md: 0, lg: 0 }}
      mt={{ base: "7.6vh", sm: "6.3vh", md: "0vh", lg: "0vh" }}
      w={{ base: "98vw", sm: "98vw", md: "100%", lg: "100%" }}
    >
      {isAdmin ? (
        <Reports />
      ) : (
        // <MyReports />
        // null
        <Alert status="info" borderRadius="md" mt={4}>
          <AlertIcon />
          <Text>
            Reports are available to administrators only. Contact your
            administrator if you need access.
          </Text>
        </Alert>
      )}
    </Box>
  );
}
