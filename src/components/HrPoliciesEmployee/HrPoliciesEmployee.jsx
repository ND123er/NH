import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Text,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Flex,
    VStack,
    SimpleGrid,
    Input,
    Menu, MenuButton, MenuList, MenuItem, IconButton,
    useToast
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ListTool from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const HrPoliciesEmployee = () => {
    const editorRef = useRef(null);
    const addModal = useDisclosure();
    const titleModal = useDisclosure();
    const detailModal = useDisclosure();
    const [policies, setPolicies] = useState([]);
    const [tempPolicy, setTempPolicy] = useState(null);
    const [customTitle, setCustomTitle] = useState("");
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();
    const { user, token, loading } = useSelector((state) => state.auth);
    // ---------- INIT EDITOR ----------
    useEffect(() => {
        if (!addModal.isOpen) return;
        editorRef.current = new EditorJS({
            holder: "editorjs",
            placeholder: "Write HR policy here...",
            tools: {
                header: Header,
                list: ListTool,
                paragraph: Paragraph,
            },
        });

        return () => {
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, [addModal.isOpen]);

    useEffect(() => {
        fetchPolicies();
    }, []);
    const fetchPolicies = async () => {
        if (!user?.organisation_id) return;
        try {
            const res = await api.get("/policy/get_hr_policies", {
                params: { organisation_id: user.organisation_id },
            });
            if (res?.data) {
                setPolicies(res.data);
            }
        } catch (err) {
            toast({
                title: "Error fetching policies",
                description: err?.response?.data?.message || err.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };
    // ---------- FINAL SAVE ----------
    const handleEditPolicy = (policy) => {
        navigate(`/hrpolicies/${policy?._id}`);
    };


    return (
        <Box bg="white" borderRadius="12px" h="85vh" p={4} mt={3}>
            {/* HEADER */}
            <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="600" fontFamily={'Poppins'}>
                    HR policies
                </Text>
            </Flex>
            <Box
                my={2}
                h="1.5px"
                bgImage="repeating-linear-gradient(
            to right,
            #C7C7C7 0 6px,
            transparent 6px 14px
          )"
            />

            {/* EMPTY STATE */}
            {policies?.length === 0 && (
                <Flex h="70vh" justify="center" align="center"  >
                    <Box
                        w="80px"
                        h="80px"
                        border="2px dashed #CBD5E1"
                        borderRadius="full"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        cursor="pointer"

                    >
                        <Text fontSize="36px" color='gray.600' fontFamily={'Poppins'}>No Hr Policies Found</Text>
                    </Box>
                </Flex>
            )}

            {/* POLICY CARDS */}
            {policies?.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6} overflowY="auto" h="72vh" sx={{
                    scrollbarGutter: "stable",

                    "&::-webkit-scrollbar": {
                        width: "0px",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        background: "#c4c4c4",
                        borderRadius: "10px",
                    },

                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                }}>
                    {policies?.map((policy) => (
                        <Box
                            key={policy._id}
                            border="1px solid #E5E7EB"
                            borderRadius="12px"
                            bg="#F7F7F7"
                            p={3}
                            m={1}
                            onClick={() => handleEditPolicy(policy)}
                            cursor='pointer'
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            _hover={{
                                transform: "translateY(0px) scale(1.02)",
                                boxShadow: "xl",
                            }}
                        >
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontWeight="600" fontFamily={'Poppins'}>{policy.title}</Text>
                            </Flex>
                            <Box
                                bg="white"
                                borderRadius="8px"
                                p={3}
                                fontSize="13px"
                                h="150px"
                                color="#000000"
                                overflow="hidden"
                                sx={{
                                    ol: {
                                        listStyleType: "decimal",
                                        listStylePosition: "outside",
                                        paddingLeft: "24px",
                                        marginLeft: "0",
                                    },
                                    ul: {
                                        listStyleType: "disc",
                                        listStylePosition: "outside",
                                        paddingLeft: "24px",
                                        marginLeft: "0",
                                    },
                                    li: {
                                        paddingLeft: "4px",
                                        marginBottom: "4px",
                                    },
                                    h1: { fontSize: "18px", fontWeight: "bold", fontFamily: 'Poppins' },
                                    h2: { fontSize: "16px", fontWeight: "bold", fontFamily: 'Poppins' },
                                    a: { color: "blue.500", textDecoration: "underline", fontFamily: 'Poppins' }
                                }}
                                dangerouslySetInnerHTML={{ __html: policy?.content_html }}
                            />

                        </Box>

                    ))}

                </SimpleGrid>
            )}

        </Box>
    );
};

export default HrPoliciesEmployee;