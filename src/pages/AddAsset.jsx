import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate, Link } from "react-router-dom";
import AddAssetForm from "../components/Asset/AddAssetForm";

export default function AddAsset() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        bg="white"
        borderRadius="12px"
        pt={4}
        pb={4}
        px={4}
        boxShadow="sm"
        w="100%"
        mt={3}
        border={"1px solid #cccccc"}
        fontFamily={"Poppins"}
      >
        {/* Back + Breadcrumb */}
        <Flex align="center" mb={4} gap={4}>
          <IconButton
            icon={<ChevronLeftIcon />}
            aria-label="Go Back"
            onClick={() => navigate("/asset-management")}
            bg="blue.900"
            color="white"
            borderRadius="full"
            _hover={{ bg: "blue.800" }}
            size="md"
          />

          <Breadcrumb
            spacing="8px"
            separator={<ChevronRightIcon color="gray.500" />}
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/asset-management">
                Asset List
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontWeight={600}>Add Asset</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Flex>

        {/* Asset Form */}
        <Box
          border="1px solid #e1e8f0"
          height="75vh"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
          borderRadius="10px"
          p={4}
        >
          {/* Page heading */}
          <Heading
            fontSize={"24px"}
            mb={4}
            fontWeight={700}
            letterSpacing={"-0.02em"}
            fontFamily={"Poppins"}
          >
            Add asset
          </Heading>
          <Box
            mx={-4}
            mb={4}
            pr={4}
            pl={4}
            borderBottom="2px dashed transparent"
            sx={{
              borderImage:
                "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
            }}
          ></Box>
          <AddAssetForm />
        </Box>
      </Box>
    </Box>
  );
}
