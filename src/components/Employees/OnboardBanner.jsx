// import React from "react";
// import { Box, Flex, Text, Button, Avatar } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";

// const OnboardBanner = () => {
//   const navigate = useNavigate();

//   return (
//     <Box
//       w="100%"
//       bg={"white"}
//       borderRadius="10px"
//       p={2}
//       px={4}
//       boxShadow="sm"
//       mb={2}
//     >
//       <Flex align="center" justify="space-between">
//         {/* Left side with avatar and text */}
//         <Flex align="center" gap={4}>
//           <Avatar
//             size="lg"
//             name="Employee"
//             src="https://via.placeholder.com/150" // replace with image url
//           />
//           <Text fontSize="md" fontWeight="semibold" color="black">
//             Quickly onboard new team members to keep your directory up to date.
//           </Text>
//         </Flex>

//         {/* Right side button */}
//         <Button
//           borderRadius="md"
//           bg="#274167"
//           color="white"
//           _hover={{ bg: "#1f3143" }}
//           fontFamily="'Poppins', sans-serif"
//           onClick={() => navigate("/employee/add")}
//         >
//           Add employee
//         </Button>
//       </Flex>
//     </Box>
//   );
// };

// export default OnboardBanner;

// mobile responsiveness checking ----
import React from "react";
import { Box, Flex, Text, Button, Avatar, Image, useBreakpointValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
// import add_employee from "../../assets/add_employee.png";
import bgImgemp from "../../assets/bgImgemp2.png";
import add_employee from "../../assets/circleicon.svg";


const OnboardBanner = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      w="100%"
      // w={isMobile ? "98%" : "100%"}
      // w={{ base: "97%",sm:'98%', md: "100%",lg:'100%' }}
      borderRadius="14px"
      p={{ base: 3, md: 4 }}
      pt={{ base: 0, md: 0 }}
      pb={{ base: 0, md: 0 }}
      boxShadow="md"
      border={'1px solid #cccccc'}
      fontFamily={'Poppins'}
      backgroundImage={`url(${bgImgemp})`}
      bgPosition="right center"
      bgRepeat="no-repeat"
        // ml={{ base: 2.5, sm: 2.5, md: 0 ,lg: 0 }}
        // mr={{ base: 2.5, sm: 2.5, md: 0 ,lg: 0 }}
        // ml={isMobile ?2.5 : 0}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={{ base: 3, md: 4 }}
       
      >
        <Flex align="center" gap={3}>
          {/* <Avatar
            size="lg"
            name="Employee"
            src={add_employee}
          /> */}
          <Image src={add_employee} w="100px" opacity={'80%'}
            objectFit='cover'
          />
          <Text
            fontSize={{ base: "sm", md: "22px" }}
            fontWeight="600"
            color="#000000"
            fontFamily={'Poppins'}
            letterSpacing={"-0.3px"}
            ml={4}
          >
            Quickly onboard new team members to keep your directory up to date.
          </Text>
        </Flex>
        <Button
          w={{ base: "100%", md: "auto" }}
          borderRadius="md"
          bg="#274167"
          color="white"
          _hover={{ bg: "#1f3143" }}
          fontFamily={'Poppins'}
          fontWeight={'500'}
          onClick={() => {
            try {
              if (typeof window !== "undefined") {
                localStorage.removeItem("employee_emp_code");
                localStorage.removeItem("employee_db_id");
                localStorage.removeItem("employee_contact");
                localStorage.removeItem("employee_work");
                localStorage.removeItem("employee_prev_experience");
                localStorage.removeItem("employee_education");
                localStorage.removeItem("employee_emergency_contacts");
              }
            } catch (e) {
              console.warn("Failed to clear preloaded employee data", e);
            }
            navigate("/employee/add");
          }}
          size={{ base: "sm", md: "md" }}
        >
          Add employee
        </Button>
      </Flex>
    </Box>
  );
};

export default OnboardBanner;
