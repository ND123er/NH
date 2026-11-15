// import { Flex, Select } from "@chakra-ui/react";

// const TimePicker = ({ value, onChange }) => {
//   return (
//     <Flex
//       gap={2}
//       border="1px solid #E5E7EB"
//       borderRadius="8px"
//       px={2}
//       py={0}
//       align="center"
//       w="130px"
//       h='45px'
//       bg="white"
//     >
//       {/* Hour */}
//       <Select variant="unstyled" w="50px"  color="#757575" 
//         _focus={{ color: "#757575" }} sx={{
//           "& option": { color: "#000" },
//           "& svg": { color: "#000" }, 
//         }}>
//         {[...Array(12)].map((_, i) => (
//           <option key={i} value={i + 1}>
//             {String(i + 1).padStart(2, "0")}
//           </option>
//         ))}
//       </Select>

//       {/* AM / PM */}
//       <Select variant="unstyled" w="60px"  color="#757575"
//         _focus={{ color: "#757575" }} sx={{
//           "& option": { color: "#000" },
//           "& svg": { color: "#000" },
//         }}>
//       <option style={{ color: "#737373" }}>AM</option>
//         <option style={{ color: "#737373" }}>PM</option>
//       </Select>
//     </Flex>
//   );
// };

// export default TimePicker;

// import { Flex, Select } from "@chakra-ui/react";
// import { useEffect, useState } from "react";

// const TimePicker = ({ value, onChange }) => {
//   const [hour, setHour] = useState("09");
//   const [ampm, setAmPm] = useState("AM");

//   useEffect(() => {
//     let h = parseInt(hour, 10);

//     if (ampm === "PM" && h !== 12) h += 12;
//     if (ampm === "AM" && h === 12) h = 0;

//     const formatted = `${String(h).padStart(2, "0")}:00`;
//     onChange(formatted);
//   }, [hour, ampm]);

//   return (
//     <Flex
//       gap={2}
//       border="1px solid #E5E7EB"
//       borderRadius="8px"
//       px={2}
//       align="center"
//       w="130px"
//       h="45px"
//       bg="white"
//     >
//       <Select
//         variant="unstyled"
//         w="50px"
//         value={hour}
//         onChange={(e) => setHour(e.target.value)}
//       >
//         {[...Array(12)].map((_, i) => (
//           <option key={i} value={String(i + 1).padStart(2, "0")}>
//             {String(i + 1).padStart(2, "0")}
//           </option>
//         ))}
//       </Select>

//       <Select
//         variant="unstyled"
//         w="60px"
//         value={ampm}
//         onChange={(e) => setAmPm(e.target.value)}
//       >
//         <option value="AM">AM</option>
//         <option value="PM">PM</option>
//       </Select>
//     </Flex>
//   );
// };

// export default TimePicker;


import { Flex, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const TimePicker = ({ value, onChange }) => {
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(h);
      setMinute(m);
    }
  }, []);
  useEffect(() => {
    const formatted = `${hour}:${minute}`;
    onChange(formatted);
  }, [hour, minute]);

  return (
    <Flex
      gap={2}
      border="1px solid #E5E7EB"
      borderRadius="8px"
      px={2}
      align="center"
      w="150px"
      h="45px"
      bg="white"
    >
      {/* Hour */}
      <Select
        variant="unstyled"
        w="60px"
        value={hour}
        onChange={(e) => setHour(e.target.value)}
      >
        {[...Array(24)].map((_, i) => (
          <option key={i} value={String(i).padStart(2, "0")}>
            {String(i).padStart(2, "0")}
          </option>
        ))}
      </Select>

      <span>:</span>

      {/* Minute */}
      <Select
        variant="unstyled"
        w="60px"
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
      >
        {[...Array(60)].map((_, i) => (
          <option key={i} value={String(i).padStart(2, "0")}>
            {String(i).padStart(2, "0")}
          </option>
        ))}
      </Select>
    </Flex>
  );
};

export default TimePicker;


