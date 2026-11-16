import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Collapse,
} from "@chakra-ui/react";
import { ChevronDown, ArrowLeft } from "lucide-react";

export default function ReviewerFeedbackDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reviewerId } = useParams();

  const reviewer = state?.reviewer;
  const [expanded, setExpanded] = useState({});

  const questions = reviewer?.questions || [];
  const answers = reviewer?.submission?.answers || [];

//   const totalScore =
//     reviewer?.submission?.total_score ??
//     (answers.length
//       ? answers.reduce((sum, answer) => sum + Number(answer.score || 0), 0)
//       : null);
const totalScore =
  reviewer?.submission?.total_score ??
  reviewer?.total_score ??
  null;

  return (
    <Box bg="#f5f5f5" minH="100vh" p={{ base: 3, md: 6 }}>
      <Button
        size="sm"
        leftIcon={<ArrowLeft size={15} />}
        mb={4}
        borderRadius="full"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Box
        bg="white"
        border="1px solid #d8d8d8"
        borderRadius="16px"
        overflow="hidden"
        maxW="950px"
        mx="auto"
      >
        <Flex
          justify="space-between"
          align="center"
          p={5}
          borderBottom="1px solid #e5e5e5"
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Text fontSize="22px" fontWeight={700}>
              {reviewer?.name || "Reviewer Feedback"}
            </Text>
            <Text fontSize="12px" color="#777">
              {reviewer?.designation || "Reviewer"}
            </Text>
            <Text fontSize="12px" color="#777">
              Employee: {state?.employeeName || "—"}
            </Text>
          </Box>

          <Badge
            bg="#008b12"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
          >
            {totalScore === null ? "Not available" : `${totalScore} / 100`}
          </Badge>
        </Flex>

        <Box p={5}>
          <Text fontSize="16px" fontWeight={700} mb={4}>
            Reviewer Assessment
          </Text>

          {questions.length ? (
            questions.map((question, index) => {
              const answer = answers.find(
                (item) =>
                  String(item.question_id) === String(question.id)
              );

              const isExpanded = Boolean(expanded[question.id]);

              return (
                <Box
                  key={question.id}
                  mb={2}
                  bg="#f1f1f1"
                  borderRadius="18px"
                  overflow="hidden"
                >
                  <Flex
                    as="button"
                    type="button"
                    w="100%"
                    minH="48px"
                    align="center"
                    justify="space-between"
                    px={3}
                    gap={3}
                    textAlign="left"
                    onClick={() =>
                      setExpanded((previous) => ({
                        ...previous,
                        [question.id]: !previous[question.id],
                      }))
                    }
                  >
                    <Text fontSize="13px" flex="1">
                      {index + 1}. {question.text}
                    </Text>

                    <Flex
                      bg="white"
                      borderRadius="full"
                      minW="96px"
                      h="29px"
                      justify="center"
                      align="center"
                      fontSize="14px"
                    >
                      {answer?.score != null
                        ? `${answer.score} / 10`
                        : "— / 10"}
                    </Flex>

                    <Box
                      transform={
                        isExpanded ? "rotate(180deg)" : "none"
                      }
                    >
                      <ChevronDown size={15} />
                    </Box>
                  </Flex>

                  <Collapse in={isExpanded} animateOpacity>
                    <Box
                      bg="white"
                      px={4}
                      py={3}
                      borderTop="1px solid #e5e5e5"
                    >
                      <Text fontSize="12px" fontWeight={600} mb={1}>
                        Reviewer Comment
                      </Text>

                      <Text
                        fontSize="12px"
                        color="#757575"
                        whiteSpace="pre-wrap"
                      >
                        {answer?.remarks?.trim() ||
                          "No comment provided."}
                      </Text>
                    </Box>
                  </Collapse>
                </Box>
              );
            })
          ) : (
            <Text color="#777" fontSize="13px">
              Reviewer question details are not available.
            </Text>
          )}
        </Box>

        <Flex
          justify="space-between"
          align="center"
          px={5}
          py={4}
          borderTop="1px solid #e5e5e5"
        >
          <Text fontSize="13px" fontWeight={600}>
            Obtained Score:{" "}
            {totalScore === null ? "—" : `${totalScore} / 100`}
          </Text>

          <Button
            size="sm"
            bg="#233d68"
            color="white"
            _hover={{ bg: "#1b3155" }}
            onClick={() => navigate(-1)}
          >
            Back to Appraisals
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}