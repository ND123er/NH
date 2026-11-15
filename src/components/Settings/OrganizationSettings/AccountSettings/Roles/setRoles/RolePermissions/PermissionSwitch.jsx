// import React from "react";
// import { HStack, Text, Switch } from "@chakra-ui/react";
// import { Controller, useFormContext } from "react-hook-form";

// export default function PermissionSwitch({
//   name,
//   label,
//   defaultValue = false,
// }) {
//   const { control } = useFormContext();

//   return (
//     <Controller
//       control={control}
//       name={name}
//       defaultValue={defaultValue}
//       render={({ field: { value, onChange } }) => (
//         <HStack justify="space-between" w="100%">
//           <Text fontSize="sm">{label}</Text>
//           <Switch
//             isChecked={!!value}
//             onChange={(e) => onChange(e.target.checked)}
//           />
//         </HStack>
//       )}
//     />
//   );
// }

import React from "react";
import { HStack, Text, Switch } from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";

export default function PermissionSwitch({
  name,
  label,
  defaultValue = false,
}) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => (
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm">{label}</Text>
          <Switch
            isChecked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        </HStack>
      )}
    />
  );
}
