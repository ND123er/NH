import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
} from "@chakra-ui/react";

export default function TestTabs() {
  return (
    <Box p={4}>
      <Tabs position="relative" variant="unstyled">
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Appraisals</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabIndicator
          mt="-2px"
          height="3px"
          bg="blue.500"
          borderRadius="full"
        />

        <TabPanels>
          <TabPanel>
            Hello Dashboard
          </TabPanel>

          <TabPanel>
            Hello Appraisals
          </TabPanel>

          <TabPanel>
            Hello Settings
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}