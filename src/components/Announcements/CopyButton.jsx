import { IconButton } from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { useState } from "react";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
//ehfkhkjng
    try {
      await navigator.clipboard.writeText(String(text));

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };
//ebhfdhgfkjhgjgf
  return (
    <IconButton
      aria-label={copied ? "Copy" : "Copy"}


      icon={copied ? <CheckIcon /> : <CopyIcon />}
      size="sm"
      minW="32px"

      //jjjujuu
      h=""
      variant="ghost"
      color={copied ? "green.500" : "gray.500"}
      _hover={{
        bg: "#EDF2F7",
      }}
      onClick={handleCopy}
    />
  );
};







export default CopyButton;
