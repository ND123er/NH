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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FiMoreHorizontal, FiMoreVertical } from "react-icons/fi";
import { useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ListTool from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import BreadcrumbsNav from "../../../components/BreadCrumbsNav/BreadCrumbsNav";

const HrPolicies = () => {
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

  const handleSavePolicy = async () => {
    const data = await editorRef.current.save();

    setTempPolicy({
      blocks: data.blocks,
    });

    addModal.onClose();
    titleModal.onOpen();
  };

  // ---------- FINAL SAVE ----------
  // const blocksToHTML = (blocks) => {
  //   return blocks
  //     .map((block) => {
  //       switch (block.type) {
  //         case "header":
  //           return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;

  //         case "paragraph":
  //           return `<p>${block.data.text}</p>`;

  //         case "list": {
  //           const tag = block.data.style === "ordered" ? "ol" : "ul";

  //           const items = block.data.items
  //             .map((item) => {
  //               if (typeof item === "string") {
  //                 return `<li>${item}</li>`;
  //               }
  //               return `<li>${item.content}</li>`;
  //             })
  //             .join("");

  //           return `<${tag}>${items}</${tag}>`;
  //         }

  //         default:
  //           return "";
  //       }
  //     })
  //     .join("");
  // };

  const blocksToHTML = (blocks) => {
    const renderListItems = (items = [], style = "unordered") => {
      return items
        .map((item) => {
          const content = typeof item === "string" ? item : item?.content || "";

          const children =
            typeof item === "object" && Array.isArray(item.items)
              ? item.items
              : [];

          // if (style === "checklist") {
          //   const checked =
          //     typeof item === "object" &&
          //     (item?.meta?.checked === true ||
          //       item?.meta?.checked === "true");

          //   return `
          //     <li style="list-style: none; margin-bottom: 8px;">
          //       <label style="display: flex; align-items: flex-start; gap: 8px;">
          //         <input
          //           type="checkbox"
          //           ${checked ? "checked" : ""}
          //           disabled
          //           style="margin-top: 4px;"
          //         />
          //         <span>${content}</span>
          //       </label>
          //       ${
          //         children.length
          //           ? `<ul style="list-style: none; padding-left: 24px;">
          //               ${renderListItems(children, style)}
          //             </ul>`
          //           : ""
          //       }
          //     </li>
          //   `;
          // }

          if (style === "checklist") {
            const checked =
              typeof item === "object" &&
              (item?.meta?.checked === true || item?.meta?.checked === "true");

            const checkboxSymbol = checked ? "☑" : "☐";

            return `
    <li>
      <span>${checkboxSymbol} ${content}</span>
      ${children.length ? `<ul>${renderListItems(children, style)}</ul>` : ""}
    </li>
  `;
          }

          const nestedTag = style === "ordered" ? "ol" : "ul";

          return `
          <li>
            ${content}
            ${
              children.length
                ? `<${nestedTag}>
                    ${renderListItems(children, style)}
                  </${nestedTag}>`
                : ""
            }
          </li>
        `;
        })
        .join("");
    };

    return blocks
      .map((block) => {
        switch (block.type) {
          case "header":
            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;

          case "paragraph":
            return `<p>${block.data.text}</p>`;

          case "list": {
            const style = block.data.style || "unordered";

            // if (style === "checklist") {
            //   return `
            //   <ul style="list-style: none; padding-left: 0;">
            //     ${renderListItems(block.data.items, "checklist")}
            //   </ul>
            // `;
            // }
            if (style === "checklist") {
              return `
    <div>
      ${block.data.items
        .map((item) => {
          const checked =
            item?.meta?.checked === true || item?.meta?.checked === "true";

          const symbol = checked ? "☑" : "☐";

          return `
            <p>
              <span>${symbol} ${item.content}</span>
            </p>
          `;
        })
        .join("")}
    </div>
  `;
            }

            const tag = style === "ordered" ? "ol" : "ul";

            return `
            <${tag}>
              ${renderListItems(block.data.items, style)}
            </${tag}>
          `;
          }

          default:
            return "";
        }
      })
      .join("");
  };

  // const saveFinalPolicy = async () => {
  //   if (!tempPolicy) return;
  //   const finalTitle = customTitle;
  //   const htmlContent = blocksToHTML(tempPolicy.blocks);

  //   const body = {
  //     organisation_id: user?.organisation_id,
  //     title: finalTitle,
  //     content_html: htmlContent,
  //   };
  //   try {
  //     const res = await api.post('policy/create_hr_policy', body);
  //     setPolicies((prev) => [
  //       ...prev,
  //       {
  //         id: Date.now(),
  //         title: finalTitle,
  //         blocks: tempPolicy.blocks,
  //       },
  //     ]);
  //     fetchPolicies();
  //     toast({
  //       title: "Policy added successfully",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });

  //     setCustomTitle("");
  //     setTempPolicy(null);
  //     titleModal.onClose();
  //     addModal.onClose();
  //   } catch (error) {
  //     toast({
  //       title: "Error saving policy",
  //       description: "Policy with the same title already exists",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const saveFinalPolicy = async () => {
    if (!tempPolicy) return;

    const finalTitle = customTitle.trim();

    // Validate empty policy title
    if (!finalTitle) {
      toast({
        title: "Validation Error",
        description: "Policy Title is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const htmlContent = blocksToHTML(tempPolicy.blocks);

    const body = {
      organisation_id: user?.organisation_id,
      title: finalTitle,
      content_html: htmlContent,
    };

    try {
      await api.post("policy/create_hr_policy", body);

      setPolicies((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: finalTitle,
          blocks: tempPolicy.blocks,
        },
      ]);

      fetchPolicies();

      toast({
        title: "Policy added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setCustomTitle("");
      setTempPolicy(null);
      titleModal.onClose();
      addModal.onClose();
    } catch (error) {
      toast({
        title: "Error saving policy",
        description:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Something went wrong while saving the policy",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPolicy = (policy) => {
    navigate(`/settings/HrPolicies/edit/${policy?._id}`);
  };
  const handleDeletePolicy = async (policy) => {
    try {
      await api.delete(`/policy/delete_hr_policy/${policy._id}`);

      // UI se bhi hata do
      setPolicies((prev) => prev.filter((p) => p._id !== policy._id));

      toast({
        title: "Policy deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting policy",
        description: error?.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="12px"
        h="85vh"
        p={0}
        mt={{ base: "9.2vh", sm: "7.6vh", md: "6.3vh", lg: 3 }}
        w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
        ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0.1vw" }}
        mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0.1vw" }}
        //  border="1px solid #757575"
      >
        <Flex justify="space-between" align="center" pl={4} pr={4} pt={4}>
          <Text fontSize="lg" fontWeight="700" fontFamily={"Poppins"}>
            HR policies settings
          </Text>

          {policies.length > 0 && (
            <Button
              size="sm"
              bg="#1A365D"
              width={"100px"}
              height={"37px"}
              fontFamily={"Poppins"}
              color="white"
              onClick={addModal.onOpen}
            >
              Add
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

        {/* EMPTY STATE */}
        {policies.length === 0 && (
          <Flex 
            // h="70vh"
            justify="center"
            align="center"
             >
            <Box
              w="80px"
              h="80px"
              border="2px dashed #CBD5E1"
              borderRadius="full"
              display="flex"
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={addModal.onOpen}
            >
              <Text fontSize="36px" color="#1A365D" fontFamily={"Poppins"}>
                +
              </Text>
            </Box>
          </Flex>
        )}

        {/* POLICY CARDS */}
        {policies?.length > 0 && (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            mt={6}
            pl={4}
            pr={4}
            overflowY="auto"
            // h="70vh"
          >
            {policies?.map((policy) => (
              <Box
                key={policy._id}
                border="1px solid #E5E7EB"
                borderRadius="12px"
                bg="#F7F7F7"
                p={3}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="500" fontFamily={"Poppins"}>
                    {policy.title}
                  </Text>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreHorizontal size={18} />}
                      size="sm"
                      variant="ghost"
                      bg="white"
                      borderRadius="md"
                      _hover={{ bg: "gray.100" }}
                      borderWidth="1px"
                      borderColor="gray.300"
                    />
                    <MenuList>
                      <MenuItem
                        fontFamily={"Poppins"}
                        onClick={() => handleEditPolicy(policy)}
                      >
                        View
                      </MenuItem>
                      <MenuItem
                        fontFamily={"Poppins"}
                        onClick={() => handleDeletePolicy(policy)}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                {/* HTML CONTENT */}
                <Box
                  bg="white"
                  borderRadius="8px"
                  p={3}
                  fontSize="13px"
                  h="150px"
                  color="gray.600"
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
                    h1: {
                      fontSize: "18px",
                      fontWeight: "bold",
                      fontFamily: "Poppins",
                    },
                    h2: {
                      fontSize: "16px",
                      fontWeight: "bold",
                      fontFamily: "Poppins",
                    },
                    a: {
                      color: "blue.500",
                      textDecoration: "underline",
                      fontFamily: "Poppins",
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: policy?.content_html }}
                />
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* ADD POLICY MODAL */}
        <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily={"Poppins"}>Add HR Policy</ModalHeader>
            <ModalBody>
              <Box id="editorjs" minH="300px" border="1px solid #E5E7EB" />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={addModal.onClose} fontFamily={"Poppins"}>
                Cancel
              </Button>
              <Button
                bg="#1A365D"
                color="white"
                fontFamily={"Poppins"}
                onClick={handleSavePolicy}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* TITLE MODAL */}
        <Modal isOpen={titleModal.isOpen} onClose={titleModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Policy Title</ModalHeader>
            <ModalBody>
              <Input
                placeholder="Enter policy title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              {/* <Button
                bg="#1A365D"
                color="white"
                onClick={() =>
                  saveFinalPolicy(customTitle || "Untitled Policy", tempPolicy.points)
                }
              >
                Save Title
              </Button> */}
              <Button bg="#1A365D" color="white" onClick={saveFinalPolicy}>
                Save Title
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* DETAIL MODAL */}
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.onClose}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedPolicy?.title}</ModalHeader>
            <ModalBody>
              {selectedPolicy?.blocks.map((block, i) => {
                if (block.type === "header") {
                  return (
                    <Text key={i} fontWeight="600">
                      {block.data.text}
                    </Text>
                  );
                }
                if (block.type === "paragraph") {
                  return (
                    <Text key={i} fontSize="13px" color="gray.600">
                      {block.data.text}
                    </Text>
                  );
                }
                if (block.type === "list") {
                  return block.data.items.map((item, idx) => (
                    <Text key={idx} fontSize="13px" color="gray.600">
                      • {item}
                    </Text>
                  ));
                }
                return null;
              })}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default HrPolicies;
