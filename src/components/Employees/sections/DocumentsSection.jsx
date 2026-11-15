import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Text,
  Flex,
  SimpleGrid,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Input,
  Progress,
  Avatar,
  Divider,
  Heading,
  Stack,
  Center,
  Badge,
} from "@chakra-ui/react";
import {
  FiUpload,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
} from "react-icons/fi";

let nextId = 1;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DocumentsSection() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef(null);
  const toast = useToast();

  const [files, setFiles] = useState([]); // {id, file, progress, status, intervalId}
  // status: "queued" | "uploading" | "done" | "error" | "cancelled"

  function handleFiles(selectedFiles) {
    const incoming = Array.from(selectedFiles).map((f) => ({
      id: nextId++,
      file: f,
      progress: 0,
      status: "queued",
      intervalId: null,
    }));
    setFiles((s) => [...s, ...incoming]);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dtFiles = e.dataTransfer.files;
    if (dtFiles && dtFiles.length) handleFiles(dtFiles);
  }

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function startUploadFor(fileObj) {
    // simulate upload by increasing progress until 100
    if (fileObj.status === "uploading" || fileObj.status === "done") return;

    const intervalId = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== fileObj.id) return f;
          const nextProgress = Math.min(100, f.progress + Math.random() * 15);
          if (nextProgress >= 100) {
            clearInterval(f.intervalId);
            return { ...f, progress: 100, status: "done", intervalId: null };
          }
          return { ...f, progress: nextProgress, status: "uploading" };
        })
      );
    }, 350);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileObj.id ? { ...f, intervalId, status: "uploading" } : f
      )
    );
  }

  function startAllUploads() {
    if (!files.length)
      return toast({ title: "No files to upload", status: "info" });
    files.forEach((f) => startUploadFor(f));
  }

  function removeFile(id) {
    setFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.intervalId) clearInterval(target.intervalId);
      return prev.filter((p) => p.id !== id);
    });
  }

  function cancelUpload(id) {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (f.intervalId) clearInterval(f.intervalId);
        return { ...f, status: "cancelled", intervalId: null };
      })
    );
  }

  function onBrowseClick() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  return (
    <Box bg="white" borderRadius="md" p={4} boxShadow="sm" border={"1px solid #cccccc"}>
      <Heading size="md" mb={2}>
        Documents
      </Heading>
      {/* Top small upload card */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="60vh"
        gap={4}
        mb={4}
        textAlign="center"
      >
        <Box
          bg="white"
          borderRadius="8px"
          p={6}
          border="1px solid"
          borderColor="gray.300"
          w={{ base: "90%", sm: "70%", md: "400px" }}
          boxShadow="md"
        >
          <Center mb={3}>
            <FiUpload size={32} />
          </Center>
          <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }}>
            Upload documents here
          </Text>
          <Text fontSize={{ base: "sm", md: "md" }} color="gray.500" mt={2}>
            by using the "Add" button
          </Text>

          {/* Centered Add button below card */}
          <Flex justify="center" mt={6}>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              bg="#1A365D"
              color="white"
              _hover={{ bg: "#153e75" }}
              onClick={onOpen}
            >
              Add documents
            </Button>
          </Flex>
        </Box>
      </Flex>
      {/* Modal - Drag & Drop */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Choose a file and upload securely to proceed.
            </Text>

            <Box
              border="2px dashed"
              borderColor="gray.200"
              borderRadius="md"
              py={10}
              px={4}
              textAlign="center"
              mb={4}
              onDrop={handleDrop}
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
              onDragLeave={preventDefault}
              cursor="pointer"
              onClick={onBrowseClick}
            >
              <FiUpload size={28} />
              <Text fontWeight="semibold" mt={2}>
                Drag and drop your files
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                JPEG, PNG, PDF, and MP4 formats, up to 50MB
              </Text>
              <Button mt={4} size="sm" onClick={onBrowseClick}>
                Browse
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                display="none"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />
            </Box>

            <Heading size="sm" mb={3}>
              Uploaded Files
            </Heading>

            <VStack spacing={3} align="stretch">
              {files.length === 0 && (
                <Text fontSize="sm" color="gray.500">
                  No files selected yet.
                </Text>
              )}

              {files.map((f) => (
                <Box
                  key={f.id}
                  p={3}
                  borderRadius="md"
                  border="1px solid #EDF2F7"
                >
                  <Flex align="center" justify="space-between" gap={3}>
                    <HStack spacing={3} align="center">
                      <Box>
                        <FiFileText size={20} />
                      </Box>
                      <Box minW="0">
                        <Text fontWeight="medium" noOfLines={1}>
                          {f.file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatBytes(f.file.size)}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={2}>
                      <Box minW="120px" maxW="220px">
                        <Progress
                          value={f.progress}
                          size="sm"
                          borderRadius="md"
                          hasStripe={f.status === "uploading"}
                          isAnimated={f.status === "uploading"}
                        />
                        <Flex justify="space-between" fontSize="xs" mt={1}>
                          <Text color="gray.500">
                            {f.status === "done"
                              ? "Uploaded"
                              : f.status === "cancelled"
                              ? "Cancelled"
                              : f.status === "uploading"
                              ? `${Math.floor(f.progress)}%`
                              : "Queued"}
                          </Text>
                          <Text color="gray.500">
                            {Math.floor(f.progress)}%
                          </Text>
                        </Flex>
                      </Box>

                      {f.status === "done" ? (
                        <FiCheckCircle color="green" />
                      ) : (
                        <IconButton
                          aria-label="cancel"
                          size="sm"
                          icon={<FiXCircle />}
                          variant="ghost"
                          onClick={() => cancelUpload(f.id)}
                        />
                      )}

                      <IconButton
                        aria-label="remove"
                        size="sm"
                        icon={<FiTrash2 />}
                        variant="ghost"
                        onClick={() => removeFile(f.id)}
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="white"
              bg="#1A365D"
              _hover={{ bg: "#153e75" }}
              onClick={() => {
                startAllUploads();
                toast({
                  title: "Upload started",
                  status: "info",
                  duration: 1200,
                });
              }}
            >
              Upload File
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
