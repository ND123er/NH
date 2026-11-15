import React, { useEffect } from "react";
import { Flex, Button, Text } from "@chakra-ui/react";
import revoked_asset_active from "../../assets/Asset_icons/revoked_asset_active.svg";
import revoked_asset_inactive from "../../assets/Asset_icons/revoked_asset_inactive.svg";
import assigned_asset_active from "../../assets/Asset_icons/assigned_asset_active.svg";
import assigned_asset_inactive from "../../assets/Asset_icons/assigned_asset_inactive.svg";
import asset_list_active from "../../assets/Asset_icons/asset_list_active.svg";
import asset_list_inactive from "../../assets/Asset_icons/asset_list_inactive.svg";

// Define tabs
const tabList = [
  {
    key: "list",
    label: "Asset List",
    activeIcon: asset_list_active,
    inactiveIcon: asset_list_inactive,
  },
  {
    key: "assigned",
    label: "Assigned Assets",
    activeIcon: assigned_asset_active,
    inactiveIcon: assigned_asset_inactive,
  },
  {
    key: "revoked",
    label: "Revoked Assets",
    activeIcon: revoked_asset_active,
    inactiveIcon: revoked_asset_inactive,
  },
];

export default function AssetTabsNavbar({ activeTab, setActiveTab }) {
  return (
    <Flex
      bg="#243B66"
      p={2}
      borderRadius="14px"
      align="center"
      w="100%"
      mb={3}
      gap={2}
      wrap="wrap"
      justify="flex-start"
      mt={3}
      h="auto"
    >
      {tabList.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconSrc = isActive ? tab.activeIcon : tab.inactiveIcon;

        return (
          <Button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              try {
                window.localStorage.setItem("asset_active_tab", tab.key);
              } catch (e) {}
            }}
            // flex={{
            //   base: "1 1 calc(50% - 8px)",
            //   sm: "1 1 calc(33.33% - 8px)",
            //   md: "1 1 calc(25% - 8px)",
            //   lg: "1 1 calc(14.28% - 8px)",
            // }}
            // minW="0"
            // w="100%"
            flex="0 0 220px"
            minW="220px"
            w="220px"
            h={{ base: "44px", md: "56px" }}
            bg={isActive ? "white" : "#2F4A7A"}
            color={isActive ? "#274167" : "white"}
            borderRadius="md"
            _hover={{ bg: isActive ? "white" : "#3b5c92" }}
            boxShadow={isActive ? "md" : "none"}
            justifyContent="center"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            gap={2}
            fontWeight={"600"}
            borderWidth={"1px"}
            borderColor={"#637691"}
          >
            <img
              src={iconSrc}
              alt=""
              style={{
                width: 18,
                height: 18,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />

            <Text
              as="span"
              fontFamily={"Poppins"}
              noOfLines={1}
              fontSize={{ base: "0.55rem", sm: "0.7rem", md: "0.85rem" }}
              fontWeight="700"
              letterSpacing={"-0.02em"}
            >
              {tab.label}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
}

// Restore saved tab on mount if present
// (keeps behaviour consistent with LeaveTabsNavbar)
// eslint-disable-next-line react/prop-types
function _useRestoreAssetTab(setActiveTab) {
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("asset_active_tab");
      if (saved && tabList.some((t) => t.key === saved)) {
        setActiveTab(saved);
      }
    } catch (e) {
      // ignore
    }
  }, [setActiveTab]);
}
