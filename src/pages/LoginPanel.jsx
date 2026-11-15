import { Flex } from "@chakra-ui/react";
import { Leftpanel } from "../components/Authentication/LeftPanel";
import { RightPanel } from "../components/Authentication/RightPanel";

export default function LoginPage() {
  return (
    <Flex
      as="main"
      h="100vh"
      w="100vw"
      overflow="hidden"
      alignItems="stretch"
    >
      <Leftpanel />
      <RightPanel />
    </Flex>
  );
}

