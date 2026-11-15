// // import React, { useState } from "react";
// // import {
// //   Box,
// //   Flex,
// //   Text,
// //   Switch,
// //   VStack,
// //   HStack,
// //   Divider,
// //   IconButton,
// // } from "@chakra-ui/react";
// // import RoleTabsNavbar from "./RoleTabsNavbar";
// // import BreadcrumbsNav from "../../../../../BreadCrumbsNav/BreadCrumbsNav";

// // //This component need to be change on tab basis indivisual components for each tab

// // function PermissionRow({ label, checked, onChange }) {
// //   return (
// //     <HStack justifyContent="space-between" w="100%">
// //       <Text fontSize="sm">{label}</Text>
// //       <Switch isChecked={checked} onChange={onChange} />
// //     </HStack>
// //   );
// // }

// // function PermissionsCard({ title, permissions }) {
// //   return (
// //     <Box
// //       bg="white"
// //       borderRadius="md"
// //       p={6}
// //       boxShadow="sm"
// //       border="1px solid #e6e9ef"
// //       w="100%"
// //       mb={4}
// //     >
// //       <Flex align="center" justify="space-between" mb={4}>
// //         <Text fontWeight="600">{title}</Text>
// //       </Flex>
// //       <VStack spacing={3} align="stretch">
// //         {permissions.map((p) => (
// //           <PermissionRow
// //             key={p.key}
// //             label={p.label}
// //             checked={p.checked}
// //             onChange={p.onChange}
// //           />
// //         ))}
// //       </VStack>
// //     </Box>
// //   );
// // }

// // export default function SetRoles() {
// //   const [activeTab, setActiveTab] = useState("settings");

// //   // simple local state to demonstrate switches — replace with real state/api as needed
// //   const [toggles, setToggles] = useState({
// //     editCompany: false,
// //     viewCompany: false,
// //     viewSettingsMenu: false,
// //     addOffice: false,
// //     editOffice: false,
// //     deleteOffice: false,
// //     addBilling: false,
// //     editBilling: false,
// //     deleteBilling: false,
// //     addRole: false,
// //     editRole: false,
// //     deleteRole: false,
// //     editEmail: false,
// //     viewEmail: false,
// //   });

// //   const toggle = (key) => {
// //     setToggles((s) => ({ ...s, [key]: !s[key] }));
// //   };

// //   // permissions lists matching the screenshot for the Account Settings tab
// //   const companyPerms = [
// //     { key: "editCompany", label: "Edit company profile", checked: toggles.editCompany, onChange: () => toggle("editCompany") },
// //     { key: "viewCompany", label: "View company profile", checked: toggles.viewCompany, onChange: () => toggle("viewCompany") },
// //     { key: "viewSettingsMenu", label: "View settings menu", checked: toggles.viewSettingsMenu, onChange: () => toggle("viewSettingsMenu") },
// //   ];

// //   const officePerms = [
// //     { key: "addOffice", label: "Add office location", checked: toggles.addOffice, onChange: () => toggle("addOffice") },
// //     { key: "editOffice", label: "Edit office location", checked: toggles.editOffice, onChange: () => toggle("editOffice") },
// //     { key: "deleteOffice", label: "Delete office location", checked: toggles.deleteOffice, onChange: () => toggle("deleteOffice") },
// //   ];

// //   const billingPerms = [
// //     { key: "addBilling", label: "Add billing notification", checked: toggles.addBilling, onChange: () => toggle("addBilling") },
// //     { key: "editBilling", label: "Edit billing notification", checked: toggles.editBilling, onChange: () => toggle("editBilling") },
// //     { key: "deleteBilling", label: "Delete billing notification", checked: toggles.deleteBilling, onChange: () => toggle("deleteBilling") },
// //   ];

// //   const rolePerms = [
// //     { key: "addRole", label: "Add role", checked: toggles.addRole, onChange: () => toggle("addRole") },
// //     { key: "editRole", label: "Edit role", checked: toggles.editRole, onChange: () => toggle("editRole") },
// //     { key: "deleteRole", label: "Delete role", checked: toggles.deleteRole, onChange: () => toggle("deleteRole") },
// //   ];

// //   const emailPerms = [
// //     { key: "editEmail", label: "Edit Email Notification", checked: toggles.editEmail, onChange: () => toggle("editEmail") },
// //     { key: "viewEmail", label: "View Email Notification", checked: toggles.viewEmail, onChange: () => toggle("viewEmail") },
// //   ];

// //   return (
// //     <Box w="100%">
// //       <Box mt={4}>
// //         <BreadcrumbsNav />
// //       </Box>
// //       <RoleTabsNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

// //       <Box mt={4}>
// //         {activeTab === "settings" && (
// //           <Box>
// //             <PermissionsCard
// //               title="Company Profile"
// //               permissions={companyPerms}
// //             />
// //             <PermissionsCard
// //               title="Office location"
// //               permissions={officePerms}
// //             />
// //             <PermissionsCard
// //               title="Billing Notification"
// //               permissions={billingPerms}
// //             />
// //             <PermissionsCard title="Role" permissions={rolePerms} />
// //             <PermissionsCard title="email" permissions={emailPerms} />
// //           </Box>
// //         )}

// //         {/* Placeholder content for other tabs — expand later */}
// //         {/* All Other tabs are pending */}
// //         {activeTab !== "settings" && (
// //           <Box p={6} bg="white" borderRadius="md" border="1px solid #e6e9ef">
// //             <Text>
// //               Content for <strong>{activeTab}</strong> will go here.
// //             </Text>
// //           </Box>
// //         )}
// //       </Box>
// //     </Box>
// //   );
// // }

// import React, { useState } from "react";
// import {
//   Box,
//   Flex,
//   Text,
//   Switch,
//   VStack,
//   HStack,
//   Divider,
//   Accordion,
//   AccordionItem,
//   AccordionButton,
//   AccordionPanel,
//   AccordionIcon,
//   SimpleGrid,
//   Button
// } from "@chakra-ui/react";
// import RoleTabsNavbar from "./RoleTabsNavbar";
// import BreadcrumbsNav from "../../../../../BreadCrumbsNav/BreadCrumbsNav";

// /* Small permission row component */
// function PermissionRow({ label, checked, onChange }) {
//   return (
//     <HStack justify="space-between" w="100%">
//       <Text fontSize="sm">{label}</Text>
//       <Switch isChecked={checked} onChange={onChange} />
//     </HStack>
//   );
// }

// /* Card that contains group of permissions. Uses a SimpleGrid to create columns */
// function PermissionsCard({ title, permissions }) {
//   return (
//     <Box
//       bg="white"
//       borderRadius="md"
//       p={6}
//       boxShadow="sm"
//       border="1px solid #e6e9ef"
//       w="100%"
//       mb={4}
//     >
//       <Flex align="center" justify="space-between" mb={4}>
//         <Text fontWeight="600">{title}</Text>
//       </Flex>

//       {/* Use a 3-column grid on wide screens, fallback on small screens */}
//       <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} alignItems="start">
//         {permissions.map((p) => (
//           <Box key={p.key}>
//             <PermissionRow label={p.label} checked={p.checked} onChange={p.onChange} />
//           </Box>
//         ))}
//       </SimpleGrid>
//     </Box>
//   );
// }

// export default function SetRoles() {
//   const [activeTab, setActiveTab] = useState("settings");

//   // centralized toggles state - keys must correspond to permissions keys
//   const [toggles, setToggles] = useState({
//     editCompany: false,
//     viewCompany: false,
//     viewSettingsMenu: false,
//     addOffice: false,
//     editOffice: false,
//     deleteOffice: false,
//     addBilling: false,
//     editBilling: false,
//     deleteBilling: false,
//     addRole: false,
//     editRole: false,
//     deleteRole: false,
//     editEmail: false,
//     viewEmail: false,
//     // asset related
//     addAsset: false,
//     editAsset: false,
//     viewAsset: false,
//     searchAsset: false,
//     assignAsset: false,
//     revokeAsset: false,
//     viewAssetHistory: false,
//     deleteAsset: false,
//   });

//   const toggle = (key) => setToggles((s) => ({ ...s, [key]: !s[key] }));

//   /* Data-driven tab config: each tab maps to an array of cards */
//   const tabsConfig = {
//     settings: [
//       {
//         title: "Company Profile",
//         permissions: [
//           { key: "editCompany", label: "Edit company profile" },
//           { key: "viewCompany", label: "View company profile" },
//           { key: "viewSettingsMenu", label: "View settings menu" },
//         ],
//       },
//       {
//         title: "Office location",
//         permissions: [
//           { key: "addOffice", label: "Add office location" },
//           { key: "editOffice", label: "Edit office location" },
//           { key: "deleteOffice", label: "Delete office location" },
//           { key: "viewOffice", label: "View office location" }, // optional
//           { key: "searchOffice", label: "Search office location" },
//         ],
//       },
//       {
//         title: "Billing Notification",
//         permissions: [
//           { key: "addBilling", label: "Add billing notification" },
//           { key: "editBilling", label: "Edit billing notification" },
//           { key: "deleteBilling", label: "Delete billing notification" },
//           { key: "viewBilling", label: "View billing notification" },
//           { key: "searchBilling", label: "Search billing notification" },
//         ],
//       },
//       {
//         title: "Role",
//         permissions: [
//           { key: "addRole", label: "Add role" },
//           { key: "editRole", label: "Edit role" },
//           { key: "deleteRole", label: "Delete role" },
//           { key: "viewRole", label: "View role" },
//           { key: "searchRole", label: "Search role" },
//         ],
//       },
//       {
//         title: "Email notifications",
//         permissions: [
//           { key: "editEmail", label: "Edit Email notifications" },
//           { key: "viewEmail", label: "View Email notifications" },
//         ],
//       },
//     ],

//     // example Asset tab based on your screenshot
//     asset: [
//       {
//         title: "Asset",
//         permissions: [
//           { key: "addAsset", label: "Add asset" },
//           { key: "editAsset", label: "Edit asset" },
//           { key: "viewAsset", label: "View asset" },
//           { key: "searchAsset", label: "Search asset" },
//           { key: "assignAsset", label: "Assign asset" },
//           { key: "revokeAsset", label: "Revoke asset" },
//           { key: "viewAssetHistory", label: "View asset history" },
//           { key: "deleteAsset", label: "Delete asset" },
//         ],
//       },
//     ],

//     // you can define more tabs like assetFields, attendance etc the same way
//   };

//   // helper to create permission objects with checked/onChange bound
//   const createPerms = (permArray) =>
//     permArray.map((p) => ({
//       key: p.key,
//       label: p.label,
//       checked: !!toggles[p.key],
//       onChange: () => toggle(p.key),
//     }));

//   const handleSave = () => {
//     // TODO: persist toggles to backend
//   };

//   const handleCancel = () => {
//     // TODO: reset or navigate back
//   };

//   const currentCards = tabsConfig[activeTab] || [];

//   return (
//     <Box w="100%" p={4}>
//       <Box mb={4}>
//         <BreadcrumbsNav />
//       </Box>

//       <RoleTabsNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

//       <Box mt={4}>
//         <Accordion allowMultiple defaultIndex={[0]}>
//           {currentCards.map((card, idx) => (
//             <Box>
//             <AccordionItem key={card.title + idx} border="none" mb={2}>
//               <h3>
//                 <AccordionButton
//                   bg="white"
//                   _expanded={{ bg: "gray.50" }}
//                   borderRadius="md"
//                   p={4}
//                   border="1px solid #e6e9ef"
//                 >
//                     <Text fontWeight="600">{card.title}</Text>
//                   <AccordionIcon />
//                 </AccordionButton>
//               </h3>
//               <AccordionPanel pb={4} pt={4}>
//                 <PermissionsCard
//                 //   title={card.title}
//                   permissions={createPerms(card.permissions)}
//                 />
//               </AccordionPanel>
//             </AccordionItem>
//             </Box>
//           ))}
//         </Accordion>

//         {/* placeholder for tabs with no config */}
//         {currentCards.length === 0 && (
//           <Box p={6} bg="white" borderRadius="md" border="1px solid #e6e9ef">
//             <Text>No permissions defined for this tab yet.</Text>
//           </Box>
//         )}
//       </Box>

//       {/* sticky footer bar with Save / Cancel aligned right */}
//       <Box
//         position="sticky"
//         bottom="0"
//         // bg="white"
//         // borderTop="1px solid #e6e9ef"
//         py={4}
//         mt={6}
//       >
//         <Flex justify="flex-end" gap={3}>
//           <Button
//             bg="#1F3661"
//             color="white"
//             borderRadius="8px"
//             onClick={handleSave}
//             _hover={{ bg: "#162843" }}
//           >
//             Save
//           </Button>
//           <Button variant="outline" onClick={handleCancel}>
//             Cancel
//           </Button>
//         </Flex>
//       </Box>
//     </Box>
//   );
// }

//------------------------------------------------------------------------------------

import React, { useState, useMemo } from "react";
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
} from "@chakra-ui/react";

import RoleTabsNavbar from "./RoleTabsNavbar";

import { useForm, FormProvider } from "react-hook-form";

import PermissionsCard from "./RolePermissions/PermissionsCard";
import PermissionSwitch from "./RolePermissions/PermissionSwitch";

import { settingsCards } from "./tabs/config/settingsConfig";
import { assetCards } from "./tabs/config/assetConfig";
import { assetFieldsCards } from "./tabs/config/assetFieldsConfig";
import { employeeCards } from "./tabs/config/employeeConfig";
import BreadcrumbsNav from "../../../../../BreadCrumbsNav/BreadCrumbsNav";
import { attendanceCards } from "./tabs/config/attendanceConfig";
import { employeeFieldsCards } from "./tabs/config/employeeFieldsConfig";
import { leaveCards } from "./tabs/config/leaveConfig";
import { announcementCards } from "./tabs/config/announecementsConfig";

const tabConfigs = {
  settings: settingsCards,
  asset: assetCards,
  assetFields: assetFieldsCards,
  attendance: attendanceCards,
  employee: employeeCards,
  employeeFields: employeeFieldsCards,
  leave: leaveCards,
  announcement: announcementCards
  // add new tabKey: cards here when you create new tab config files
};

export default function SetRoles() {
  // keep shouldUnregister:false if values preserved when components unmount
  // const methods = useForm({
  //   mode: "onChange",
  //   defaultValues: {},
  //   shouldUnregister: false,
  // });
  const methods = useForm({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      settings: {},
      asset: {},
      assetFields: {},
      attendance: {},
      employee: {},
    },
  });

  const { handleSubmit } = methods;

  const [activeTab, setActiveTab] = useState("settings");

  // current tab's cards (data)
  const currentCards = useMemo(() => tabConfigs[activeTab] || [], [activeTab]);

  const onSave = (data) => {
    // data will be an object with dotted keys resolved by react-hook-form:
    // because we used names like 'settings.editCompany' react-hook-form will transform them to nested objects.
    // For safety, access the active tab payload:
    const payload = data[activeTab] ?? {};
    // TODO: call your API to save payload
    // e.g. api.post('/roles/save', { tab: activeTab, permissions: payload })
  };

  return (
    <Box w="100%" pl={0} pr={0}>
      <Box mb={4}>
        <BreadcrumbsNav />
      </Box>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSave)}>
          <RoleTabsNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <Box mt={4}
            maxH="55vh"
            overflowY="auto"
            sx={{
              "&::-webkit-scrollbar": {
                width: "0px",
              },
            }}
          >
            {/* Parent-controlled Accordion: render each card as an AccordionItem */}
            <Accordion allowMultiple defaultIndex={[0]}>
              {currentCards.map((card, idx) => (
                <AccordionItem
                  key={`${card.title}-${idx}`}
                  mb={2}
                  border="none"
                >
                  <h3>
                    <AccordionButton
                      bg="white"
                      _expanded={{ bg: "gray.50" }}
                      borderRadius="md"
                      p={4}
                      border="1px solid #e6e9ef"
                    >
                      <Box flex="1" textAlign="left" fontWeight="700">
                        {card.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel pb={4} pt={4}>
                    {/* render a PermissionsCard that uses PermissionSwitch controllers */}
                    <PermissionsCard
                      fields={card.fields}
                      FieldComponent={PermissionSwitch}
                    />
                  </AccordionPanel>
                </AccordionItem>
              ))}

              {currentCards.length === 0 && (
                <Box
                  p={6}
                  bg="white"
                  borderRadius="md"
                  border="1px solid #e6e9ef"
                >
                  No permissions defined for this tab yet.
                </Box>
              )}
            </Accordion>
          </Box>

          {/* Save/Cancel */}
          <Box py={4} mt={6}>
            <Flex justify="flex-end" gap={3}>
              <Button
                bg="#1F3661"
                color="white"
                borderRadius="8px"
                type="submit"
                _hover={{ bg: "#162843" }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log("Cancel clicked")}
              >
                Cancel
              </Button>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
}

