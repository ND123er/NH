import {
  Box,
  Text,
  Spinner,
  Center,
  Flex,
  Button,
  Input,
   useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
// import ListTool from "@editorjs/list";
import EditorjsList from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import { useSelector } from "react-redux";
import BreadcrumbsNav from "../../../components/BreadCrumbsNav/BreadCrumbsNav";

const EditHrPolicy = () => {
  const { policyId } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);
  const { user, token } = useSelector((state) => state.auth);
  const [title, setTitle] = useState("");
  const toast = useToast();
const [saving, setSaving] = useState(false);

  // ---------------- FETCH POLICY ----------------
  const getPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/policy/get_single_hr_policy/${policyId}`);
      setPolicy(res.data);
      setTitle(res.data.title);
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

      //   if (node.nodeName === "UL") {
      //     blocks.push({
      //       type: "list",
      //       data: {
      //         style: "unordered",
      //         items: [...node.children].map((li) => li.innerText),
      //       },
      //     });
      //   }
      //worked down
      //   if (node.nodeName === "UL" || node.nodeName === "OL") {
      //     blocks.push({
      //       type: "list",
      //       data: {
      //         style: node.nodeName === "OL" ? "ordered" : "unordered",
      //         items: [...node.children].map((li) => ({
      //           content: li.innerText,
      //         })),
      //       },
      //     });
      //   }
      if (node.nodeName === "UL" || node.nodeName === "OL") {
        blocks.push({
          type: "list",
          data: {
            style: node.nodeName === "OL" ? "ordered" : "unordered",
            meta: {
              counterType: "numeric",
            },
            items: [...node.children].map((li) => ({
              content: li.innerText,
              meta: {},
              items: [],
            })),
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
          case "list": //         .join("")}</${tag}>`; //         .map((i) => `<li>${i}</li>`) //     return `<${tag}>${block.data.items //     const tag = block.data.style === "ordered" ? "ol" : "ul";
          {
            const tag = block.data.style === "ordered" ? "ol" : "ul";

            return `<${tag}>${block.data.items
              .map((item) => {
                const text = typeof item === "string" ? item : item.content;

                return `<li>${text}</li>`;
              })
              .join("")}</${tag}>`;
          }
          default:
            return "";
        }
      })
      .join("");

  // ---------------- OPEN EDITOR ----------------
  const openEditor = () => {
    setIsEditing(true);

    setTimeout(() => {
      editorRef.current = new EditorJS({
        holder: "editorjs",
        data: {
          blocks: htmlToBlocks(policy.content_html),
        },
        // tools: {
        //   header: Header,
        //   list: ListTool,
        //   paragraph: Paragraph,
        // },
        tools: {
          header: Header,
          list: {
            class: EditorjsList,
          },
          paragraph: Paragraph,
        },
      });
    }, 0);
  };

  // ---------------- SAVE EDIT ----------------
  // const saveUpdatedPolicy = async () => {
  //   const data = await editorRef.current.save();
  //   const htmlContent = blocksToHTML(data.blocks);
  //   const body = {
  //     organisation_id: user?.organisation_id,
  //     title: title,
  //     content_html: htmlContent,
  //   };
  //   console.log("bodydddd", body);
  //   await api.put(
  //     `policy/update/${policyId}`,
  //     body,
  //   );

  //   editorRef.current.destroy();
  //   editorRef.current = null;
  //   setIsEditing(false);
  //   getPolicy();
  // };
  const saveUpdatedPolicy = async () => {
  if (saving) return;

  setSaving(true);

  try {
    if (!editorRef.current) {
      throw new Error("Editor is not initialized.");
    }

    // Wait until EditorJS is ready
    await editorRef.current.isReady;

    // Get editor data
    const data = await editorRef.current.save();

    console.log("EditorJS blocks:", data.blocks);

    // Convert EditorJS blocks to HTML
    const htmlContent = blocksToHTML(data.blocks);

    console.log("Generated HTML:", htmlContent);

    // Validate title
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a policy title.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Validate content
    const textContent = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .body.textContent?.trim();

    if (!textContent) {
      toast({
        title: "Content is required",
        description: "Please enter policy content before saving.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const body = {
      organisation_id: user?.organisation_id,
      title: title.trim(),
      content_html: htmlContent,
    };

    console.log("Policy update payload:", body);

    // Call update API
    const response = await api.put(
      `/policy/update/${policyId}`,
      body
    );

    console.log("Policy update response:", response.data);

    // Success toast
    toast({
      title: "Policy updated successfully",
      description:
        response.data?.msg ||
        response.data?.message ||
        "Your HR policy has been updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Destroy editor only after successful save
    editorRef.current?.destroy();
    editorRef.current = null;

    setIsEditing(false);

    // Refresh updated policy
    await getPolicy();

  } catch (error) {
    console.error("Policy update failed:", error);
    console.error("Backend response:", error?.response?.data);

    toast({
      title: "Failed to update policy",
      description:
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while updating the policy.",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });

  } finally {
    setSaving(false);
  }
};

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
    <Box mt={3}>
      <Box mb={4}>
        <BreadcrumbsNav
          extraSegments={["settings1", "HR Policies", "Details"]}
          /*extraSegments={['team-attendance', 'employeeVew']}*/
        />
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
          {/* <Text fontSize="lg" fontWeight="600">
                        {policy.title}
                    </Text> */}
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fontWeight="600"
              fontSize="lg"
              maxW="400px"
            />
          ) : (
            <Text fontSize="lg" fontWeight="600">
              {title}
            </Text>
          )}

          {!isEditing && (
            <Button size="sm" bg="#1A365D" color="white" onClick={openEditor}>
              Edit
            </Button>
          )}
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
                listStyleType: "disc", // 🔥 bullet dots
                paddingLeft: "20px",
                marginTop: "8px",
                marginBottom: "8px",
              },
              ol: {
                listStyleType: "decimal", // 🔥 1 2 3
                paddingLeft: "20px",
                marginTop: "8px",
                marginBottom: "8px",
              },
              li: {
                marginBottom: "4px",
              },
              p: {
                color: "#4A5568",
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

        {/* EDIT MODE */}
        {isEditing && (
          <>
            <Box id="editorjs" minH="200px" border="1px solid #E5E7EB" />

            <Flex justify="flex-end" mt={4} gap={3}>
              <Button
                variant="outline"
                onClick={() => {
                  editorRef.current.destroy();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button bg="#1A365D" color="white" onClick={saveUpdatedPolicy}>
                Save
              </Button>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditHrPolicy;

