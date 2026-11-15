import React from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";

export default function AddSubscriptionDetailsForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontWeight: "400",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  const onSubmit = (data) => {
    // TODO: API call here
    reset();
    // navigate(-1);
  };

  return (
    <Box
      bg="white"
      borderRadius="14px"
      // p={6}
      boxShadow="sm"
      // w={"100%"}
      // mt={2}
      p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 3 }}
      w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
      ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      border={"1px solid #e1e8f0"}
    >
      <BreadcrumbsNav />
      <Box borderRadius={"10px"} border={"1px solid #e0e0e0"} p={{ base: 2, md: 8 }} h="70vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}>
        <Flex align="center" justify="space-between" mb={4}>
          <Box
            fontWeight="bold"
            fontSize={{ base: "sm", sm: "md", md: "xl", lg: "xl" }}
            fontFamily="poppins"
            mb={{ base: 0, md: 0 }}
          >
            Add Subscription Details
          </Box>
          <Flex gap={4}>
            <Button
              bg="blue.900"
              color="white"
              borderRadius="14px"
              _hover={{ bg: "blue.800" }}
              size="md"
              type="submit"
              form="add-subscription-details"
              mr={2}
            >
              Save
            </Button>
            <Button type="button" onClick={() => navigate(-1)} bg={'white'} color={'#757575'}>
              Cancel
            </Button>
          </Flex>
        </Flex>
        <form id="add-subscription-details" onSubmit={handleSubmit(onSubmit)}>
          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Subscription plan type</FormLabel>
              <Input
                placeholder="Enter Subscription plan type"
                {...register("subsPlan", { required: true })}
                {...inputStyle}

              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Billing</FormLabel>
              <Input
                placeholder="Enter Billing"
                {...register("bill", { required: true })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Maximum storage</FormLabel>
              <Input
                placeholder="Enter Maximum storage"
                {...register("maxStorage", { required: true })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Currency</FormLabel>
              <Input
                placeholder="Enter currency"
                {...register("currency", { required: true })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4} >
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Monthly price per user</FormLabel>
              <Input
                placeholder="Enter Monthly price per user"
                {...register("monthlyPrice", { required: true })}
                h={{ base: "6.5vh", sm: "5.3vh", md: "6.5vh", lg: "7.5vh" }}
                _placeholder={{
                  fontSize: { base: "14px", sm: "14px", md: "14px", lg: "14px" },
                  color: "gray.400", // optional
                }}

              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Yearly price per user</FormLabel>
              <Input
                placeholder="Enter Yearly price per user"
                {...register("yearlyPrice", { required: true })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>No of lisences</FormLabel>
              <Input
                placeholder="Enter No of lisences"
                {...register("numLisences", { required: true })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Total lisences</FormLabel>
              <Input
                placeholder="Enter Total lisences"
                {...register("totalLisence", { required: true })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Purchased lisences</FormLabel>
              <Input
                placeholder="Enter Purchased lisences"
                {...register("purchasedLisence")}
                {...inputStyle}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Remaining lisences</FormLabel>
              <Input
                placeholder="Enter Remaining lisences"
                {...register("remainingLisence")}
                {...inputStyle}
              />
            </FormControl>
          </Flex>

          <Flex gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Subscription Start date</FormLabel>
              <Input
                type="date"
                placeholder="Enter Subscription Start date"
                {...register("subsStart", { required: true })}
                {...inputStyle}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontFamily={'Poppins'} fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px" }} letterSpacing={'-0.3px'}>Subscription End date</FormLabel>
              <Input
                type="date"
                placeholder="Enter Subscription End date"
                {...register("subsEnd", { required: true })}
                {...inputStyle}
              />
            </FormControl>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
