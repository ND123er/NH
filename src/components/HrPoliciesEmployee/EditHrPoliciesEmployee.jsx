import {
    Box,
    Text,
    Spinner,
    Center,
    Flex,
    Button
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ListTool from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import { useSelector } from "react-redux";
import BreadcrumbsNav from "../../components/BreadCrumbsNav/BreadCrumbsNav";

const EditHrPoliciesEmployee = () => {
    const { policyId } = useParams();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef(null);
    const { user, token } = useSelector((state) => state.auth);


    // ---------------- FETCH POLICY ----------------
    const getPolicy = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/policy/get_single_hr_policy/${policyId}`
            );
            setPolicy(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (policyId) getPolicy();

        return () => {
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, [policyId]);

    // ---------------- HTML → BLOCKS ----------------
    const htmlToBlocks = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const blocks = [];

        doc.body.childNodes.forEach((node) => {
            if (/H[1-3]/.test(node.nodeName)) {
                blocks.push({
                    type: "header",
                    data: {
                        text: node.innerText,
                        level: Number(node.nodeName.replace("H", "")),
                    },
                });
            }

            if (node.nodeName === "P") {
                blocks.push({
                    type: "paragraph",
                    data: { text: node.innerText },
                });
            }

            if (node.nodeName === "UL") {
                blocks.push({
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [...node.children].map((li) => li.innerText),
                    },
                });
            }
        });
        return blocks;
    };

    // ---------------- BLOCKS → HTML ----------------
    const blocksToHTML = (blocks) =>
        blocks
            .map((block) => {
                switch (block.type) {
                    case "header":
                        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                    case "paragraph":
                        return `<p>${block.data.text}</p>`;
                    case "list":
                        const tag = block.data.style === "ordered" ? "ol" : "ul";
                        return `<${tag}>${block.data.items
                            .map((i) => `<li>${i}</li>`)
                            .join("")}</${tag}>`;
                    default:
                        return "";
                }
            })
            .join("");

    // ---------------- LOADING ----------------
    if (loading) {
        return (
            <Center h="70vh">
                <Spinner color="#1A365D" />
            </Center>
        );
    }

    if (!policy) return <Text>No policy found</Text>;

    // ---------------- UI ----------------
    return (
        <Box
            mt={3}
        >
            <Box mb={4}>
                <BreadcrumbsNav extraSegments={["Details"]} />
            </Box>
            <Box
                bg="white"
                borderRadius="12px"
                h="80vh"
                p={4}
                mt={3}
                overflowY="auto"
            >
                <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="600">
                        {policy.title}
                    </Text>
                </Flex>

                <Box
                    my={4}
                    h="1.5px"
                    bgImage="repeating-linear-gradient(
          to right,
          #C7C7C7 0 6px,
          transparent 6px 14px
        )"
                />

                {/* VIEW MODE */}
                {!isEditing && (
                    <Box
                        dangerouslySetInnerHTML={{ __html: policy.content_html }}
                        sx={{

                            ul: {
                                listStyleType: "disc",
                                paddingLeft: "20px",
                                marginTop: "8px",
                                marginBottom: "8px",
                            },
                            ol: {
                                listStyleType: "decimal",
                                paddingLeft: "20px",
                                marginTop: "8px",
                                marginBottom: "8px",
                            },
                            li: {
                                marginBottom: "4px",
                            },
                            p: {
                                color: "#000000",
                                fontSize: "14px",
                                lineHeight: "1.9",
                                mt: 2,
                                mb: "10px",
                            },
                            h1: { fontSize: "18px", fontWeight: "bold" },
                            h2: { fontSize: "16px", fontWeight: "bold" },
                            h3: { fontSize: "14px", fontWeight: "bold" },
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export default EditHrPoliciesEmployee;
