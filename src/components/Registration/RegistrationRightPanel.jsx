import { Box, useToast } from "@chakra-ui/react";
import { useState } from "react";
// import { Progressbar } from "../Authentication/Progressbar";
// import RegistrationStepOne from "./RegistrationStepOne";
import RegistrationStepTwo from "./RegistrationStepTwo";
import { useDispatch, useSelector } from "react-redux";
import { registerAdminThunk } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { markCompletedAuthPage } from "../../utils/authBrowserHistory";

export default function RegistrationRightPanel() {
  const [step, setStep] = useState(1);

  //Centralized registration data state
  const [registrationData, setRegistrationData] = useState({
    // Step 1 fields
    // companyName: "",
    // industry: "",
    // no_of_employees: "",
    // address: "",

    // Step 2 fields
    firstName: "",
    middleName: "",
    lastName: "",
    // contact: { phone: "", email: "" },
    phone: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  const { loading, error, registered } = useSelector((state) => state.auth);

  //navigation and data collection
  // const handleNext = (stepOneData) => {
  //   setRegistrationData((prev) => ({
  //     ...prev,
  //     ...stepOneData,
  //   }));
  //   setStep(2);
  // };

  const handleBack = () => setStep(1);

  //Final registration submit
  const handleRegister = (stepTwoData) => {
    // Combine all data for API
    const apiBody = {
      // user: {
      ...registrationData,
      ...stepTwoData,
      phone: stepTwoData.phone,
      email: stepTwoData.email,
      // If address is a string, have to split it into an object here
      // address: { ... }
      // },
    };

    markCompletedAuthPage("/register", "registration");
    dispatch(registerAdminThunk(apiBody)).then((res) => {
      // Check if the request was rejected (API returned an error)
      if (res.meta.requestStatus === "rejected") {
        toast({
          title: "Registration failed",
          description: res.payload?.msg || "Please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else if (res.meta.requestStatus === "fulfilled") {
        // Request was successful
        toast({
          title: "Registration successful!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // navigate("/", { replace: false });
        const nextStep = res.payload?.next_step;

        if (nextStep === "organization_setup") {
          navigate("/orgRegister", {
            replace: false,
            state: { orgStep: 1 },
          });
        } else {
          toast({
            title: "Unexpected registration stage",
            description: `Received: ${nextStep || "missing"}`,
            status: "error",
          });
        }
      }
    });
  };

  const progress = step === 1 ? 0 : 50;

  return (
    <Box
      as="main"
      display="flex"
      flexDirection="column"
      flex="1 1 auto"
      border="1px solid #cccccc"
      borderRadius="8px"
      bg="white"
      boxSizing="border-box"
      overflow="auto"
      mt={2}
      mb={2}
      mr={2}
      sx={{
        /* Chrome, Edge, Safari */
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#c1c1c1",
          borderRadius: "8px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#a8a8a8",
        },

        /* Firefox */
        scrollbarWidth: "thin",
        scrollbarColor: "#c1c1c1 transparent",
      }}
    >
      <Box width="100%" maxW="100%" mx="0">
        {/* <Progressbar value={progress} mb={6} /> */}
        {
          // step === 1 ? (
          //   <RegistrationStepOne
          //     data={registrationData}
          //     onNext={handleNext}
          //     loading={loading}
          //   />
          // ) :

          // (
          <RegistrationStepTwo
            data={registrationData}
            onBack={handleBack}
            onRegister={handleRegister}
            loading={loading}
          />
          // )
        }
      </Box>
    </Box>
  );
}
