import { Box } from "@chakra-ui/react";
import { Leftpanel } from "../components/Authentication/LeftPanel";
import RegistrationRightPanel from "../components/Registration/RegistrationRightPanel";

export default function RegistrationPage() {
  return (
    <Box h={"100vh"} w="100vw" border="1px solid gray" display={"flex"}>
      <Leftpanel />
      <RegistrationRightPanel />
    </Box>
  );
}


