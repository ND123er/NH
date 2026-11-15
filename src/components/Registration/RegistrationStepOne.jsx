//Backup - Registration step one form
// import { ArrowBackIcon } from "@chakra-ui/icons";
// import {
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   IconButton,
//   Input,
//   Select,
//   Text,
// } from "@chakra-ui/react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";

// export default function RegistrationStepOne({ onNext }) {
//   const navigate = useNavigate();

//   //Added validation for required fields
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       companyName: "",
//       industryType: "",
//       orgSize: "",
//       companyLocation: "",
//     },
//   });

//   const onSubmit = () => {
//     onNext();
//   };

//   // CHANGED: Watch required fields for button disable
//   const companyName = watch("companyName");
//   const orgSize = watch("orgSize");

//   return (
//     <Box px={12} pt={6}>
//       <IconButton
//         aria-label="Back"
//         icon={<ArrowBackIcon />}
//         onClick={() => navigate("/login")}
//         size="md"
//         borderRadius="full"
//         bg="#274167"
//         color="white"
//         boxShadow="sm"
//         border="1px solid #E2E8F0"
//         mb={4}
//         _hover={{ bg: "#274167", color: "white" }}
//       />
//       <Text
//         fontFamily="'Poppins', sans-serif"
//         fontWeight="700"
//         fontSize="24px"
//         mb={1}
//       >
//         Let's Get Started
//       </Text>
//       <Text
//         color="gray.600"
//         fontFamily="'Poppins', sans-serif"
//         fontSize="14px"
//         mb={6}
//       >
//         A few details and you'll be ready to go.
//       </Text>

//       <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
//         Enter organizational details
//       </Text>

//       <Box as="form" onSubmit={handleSubmit(onSubmit)}>
//         <FormControl mb={4} isRequired>
//           <FormLabel>
//             Company name
//           </FormLabel>
//           <Input
//             placeholder="Enter Company name"
//             {...register("companyName", { required: true })}
//           />
//           {errors.companyName && (
//             <Text color="red.500" fontSize="12px" mt={1}>
//               Company Name is required
//             </Text>
//           )}
//         </FormControl>

//         <FormControl mb={4}>
//           <FormLabel>Industry type</FormLabel>
//           <Select
//             placeholder="Enter industry type"
//             iconColor="gray.600"
//             {...register("industryType")}
//           >
//             <option>Information Technology & Services</option>
//             <option>Software & SaaS</option>
//             <option>Finance & Banking</option>
//             <option>Insurance</option>
//             <option>Healthcare & Pharmaceuticals</option>
//             <option>Education & Training</option>
//             <option>Manufacturing</option>
//             <option>Retail & E-commerce</option>
//             <option>Hospitality & Travel</option>
//             <option>Real Estate & Construction</option>
//             <option>Transportation & Logistics</option>
//             <option>Energy & Utilities</option>
//             <option>Media & Entertainment</option>
//             <option>Marketing & Advertising</option>
//             <option>Professional Services (Consulting, Legal, HR, etc.)</option>
//             <option>Government & Non-Profit</option>
//             <option>Telecommunications</option>
//             <option>Agriculture & Food Processing</option>
//             <option>Automotive</option>
//             <option>Others (Custom input option)</option>
//           </Select>
//         </FormControl>

//         <FormControl mb={4} isRequired>
//           <FormLabel>
//             Company Size
//           </FormLabel>
//           <Select
//             placeholder="Enter no of employees"
//             {...register("orgSize", { required: true })}
//           >
//             <option>1-10</option>
//             <option>11-50</option>
//             <option>51-200</option>
//             <option>200+</option>
//           </Select>
//           {errors.orgSize && (
//             <Text color="red.500" fontSize="12px" mt={1}>
//               Company Size is required
//             </Text>
//           )}
//         </FormControl>

//         <FormControl mb={4}>
//           <FormLabel>Company location(s)</FormLabel>
//           <Input
//             placeholder="Enter Company location"
//             {...register("companyLocation")}
//           />
//         </FormControl>

//         <Box display="flex" justifyContent="flex-end">
//           <Button
//             colorScheme="blue"
//             bg="#274167"
//             type="submit"
//             isDisabled={!companyName || !orgSize}
//           >
//             Next 🠆
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// }




//Setting the company info for next step API call
// import { ArrowBackIcon } from "@chakra-ui/icons";
// import {
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   IconButton,
//   Input,
//   Select,
//   Text,
// } from "@chakra-ui/react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";

// export default function RegistrationStepOne({ data, onNext, loading }) {
//   //Use defaultValues from parent data
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       companyName: data.companyName,
//       industryType: data.industry,
//       orgSize: data.no_of_employees,
//       companyLocation: data.address,
//     },
//   });

//   //Map form fields to API keys and pass up
//   const onSubmit = (formData) => {
//     const mapped = {
//       companyName: formData.companyName,
//       industry: formData.industryType,
//       no_of_employees: formData.orgSize,
//       address: formData.companyLocation,
//     };
//     onNext(mapped);
//   };

//   const companyName = watch("companyName");
//   const orgSize = watch("orgSize");
//   const navigate = useNavigate();

//   return (
//     <Box px={12} pt={6}>
//       <IconButton
//         aria-label="Back"
//         icon={<ArrowBackIcon />}
//         onClick={() => navigate("/login")}
//         size="md"
//         borderRadius="full"
//         bg="#274167"
//         color="white"
//         boxShadow="sm"
//         border="1px solid #E2E8F0"
//         mb={4}
//         _hover={{ bg: "#274167", color: "white" }}
//       />
//       <Text
//         fontFamily="'Poppins', sans-serif"
//         fontWeight="700"
//         fontSize="24px"
//         mb={1}
//       >
//         Let's Get Started
//       </Text>
//       <Text
//         color="gray.600"
//         fontFamily="'Poppins', sans-serif"
//         fontSize="14px"
//         mb={6}
//       >
//         A few details and you'll be ready to go.
//       </Text>
//       <Text fontWeight="600" fontFamily="'Poppins', sans-serif" mb={2}>
//         Enter organizational details
//       </Text>
//       <Box as="form" onSubmit={handleSubmit(onSubmit)}>
//         <FormControl mb={4} isRequired>
//           <FormLabel>Company name</FormLabel>
//           <Input
//             placeholder="Enter Company name"
//             {...register("companyName", { required: true })}
//           />
//           {errors.companyName && (
//             <Text color="red.500" fontSize="12px" mt={1}>
//               Company Name is required
//             </Text>
//           )}
//         </FormControl>
//         <FormControl mb={4}>
//           <FormLabel>Industry type</FormLabel>
//           <Select
//             placeholder="Enter industry type"
//             iconColor="gray.600"
//             {...register("industryType")}
//           >
//             {/* ...options... */}
//             <option>Information Technology & Services</option>
//             <option>Software & SaaS</option>
//             <option>Finance & Banking</option>
//             <option>Insurance</option>
//             <option>Healthcare & Pharmaceuticals</option>
//             <option>Education & Training</option>
//             <option>Manufacturing</option>
//             <option>Retail & E-commerce</option>
//             <option>Hospitality & Travel</option>
//             <option>Real Estate & Construction</option>
//             <option>Transportation & Logistics</option>
//             <option>Energy & Utilities</option>
//             <option>Media & Entertainment</option>
//             <option>Marketing & Advertising</option>
//             <option>Professional Services (Consulting, Legal, HR, etc.)</option>
//             <option>Government & Non-Profit</option>
//             <option>Telecommunications</option>
//             <option>Agriculture & Food Processing</option>
//             <option>Automotive</option>
//             <option>Others (Custom input option)</option>
//           </Select>
//         </FormControl>
//         <FormControl mb={4} isRequired>
//           <FormLabel>Company Size</FormLabel>
//           <Select
//             placeholder="Enter no of employees"
//             {...register("orgSize", { required: true })}
//           >
//             <option>1-10</option>
//             <option>11-50</option>
//             <option>51-200</option>
//             <option>200+</option>
//           </Select>
//           {errors.orgSize && (
//             <Text color="red.500" fontSize="12px" mt={1}>
//               Company Size is required
//             </Text>
//           )}
//         </FormControl>
//         <FormControl mb={4}>
//           <FormLabel>Company location(s)</FormLabel>
//           <Input
//             placeholder="Enter Company location"
//             {...register("companyLocation")}
//           />
//         </FormControl>
//         <Box display="flex" justifyContent="flex-end">
//           <Button
//             colorScheme="blue"
//             bg="#274167"
//             type="submit"
//             isDisabled={!companyName || !orgSize || loading}
//           >
//             Next 🠆
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// }
