import { useMemo } from "react";
import { Flex, Text, Image, useColorModeValue } from "@chakra-ui/react";
import dashboard_active from "../../assets/dashboard_active.svg";
import dashboard_inactive from "../../assets/dashboard_inactive.svg";
import announcement_inactive from "../../assets/announcement_inactive.png";
import announcement_active from "../../assets/announcement_active.png";

export default function Dashboard_tab({ activeTab, setActiveTab }) {
  const tabs = useMemo(
    () => [
      {
        name: "Dashboard",
        activeIcon: dashboard_active,
        inactiveIcon: dashboard_inactive,
      },
      {
        name: "Announcements",
        activeIcon: announcement_active,
        inactiveIcon: announcement_inactive,
      },
    ],
    [],
  );
  const activeBg = useColorModeValue("white", "#000");
  const inactiveBg = useColorModeValue("#2F4A7A", "#2F4A7A");

  const activeColor = useColorModeValue("black", "white");
  const inactiveColor = useColorModeValue("#DFDFDF", "white");
  const hoverTextActive = useColorModeValue("black", "white");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const hoverTextInactive = useColorModeValue("white", "yellow");
  return (
    <Flex
      bg="#274066"
      p={2}
      borderRadius="14px"
      align="center"
      w="100%"
      mt={3}
      gap={2}
      wrap="wrap"
      justify="space-between"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Flex
            key={tab.name}
            align="center"
            bg={isActive ? activeBg : inactiveBg}
            color={isActive ? activeColor : inactiveColor}
            px={4}
            py={2}
            borderRadius="7px"
            cursor="pointer"
            h={{ base: "44px", md: "50px" }}
            _hover={{
              bg: isActive ? activeBg : "#3b5c92",
              color: isActive ? hoverTextActive : hoverTextInactive,
            }}
            // onClick={() => setActiveTab(tab.name)}
            onClick={() => handleTabClick(tab.name)}
            flex={{
              base: "1 1 calc(50% - 8px)",
              sm: "1 1 calc(33.33% - 8px)",
              md: "1 1 calc(25% - 8px)",
              lg: "1 1 calc(14.28% - 8px)",
            }}
            minW={0}
            w="100%"
            justifyContent="center"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            gap={{ base: 2, md: 3 }}
            borderWidth={"1px"}
            borderColor={"#637691"}
          >
            <Image
              // src={tab.icon}
              src={isActive ? tab.activeIcon : tab.inactiveIcon}
              alt={tab.name}
              boxSize={{ base: "16px", md: "20px" }}
              flexShrink={0}
            />
            <Text
              fontWeight="semibold"
              fontSize={{ base: "0.65rem", sm: "0.75rem", md: "0.85rem" }}
              fontFamily="'Poppins', sans-serif"
              noOfLines={1}
            >
              {tab.name}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}
