import { Button, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confirmation from "../../assets/confirmation.png";

export default function SuccessStep() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (timer === 0) {
      navigate("/");
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, navigate]);

  return (
    <VStack spacing={4} py={12}>
      <Image
        src= {confirmation}
        alt="Success"
        // boxSize="150px"
      />

      <Text fontSize="20px" fontWeight="700">
        Password updated Successful!
      </Text>

      <Text fontSize="13px">
        You will be redirected to login page in {timer} sec(s)
      </Text>

      <Button bg="#274167" color="white" onClick={() => navigate("/")}>
        Go to Login
      </Button>
    </VStack>
  );
}
