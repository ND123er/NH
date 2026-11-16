import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Badge, Box, Button, Collapse, Flex, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  Spinner, Text,
} from "@chakra-ui/react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getAppraisalDetails } from "../../../api/performancemanagementdashborad";

// Reviewer rows and submitted answers are read from GET /get_appraisal/:id.
// A pending review's answers must never be displayed to an employee.
export default function ReviewerFeedbackDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appraisalId, reviewerId } = useParams();
  const [details, setDetails] = useState(location.state?.appraisalDetails || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(reviewerId || null);
  const [expanded, setExpanded] = useState({});
  const isDummy = Boolean(location.state?.isDummy);

  useEffect(() => {
    if (details || isDummy || !appraisalId) return;
    let cancelled = false;
    setLoading(true);
    getAppraisalDetails(appraisalId)
      .then((response) => { if (!cancelled) setDetails(response?.result || null); })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.msg || err?.message || "Unable to load feedback.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appraisalId, details, isDummy]);

  const reviewers = details?.reviewers || [];
  const selected = useMemo(
    () => reviewers.find((r) => String(r._id) === String(selectedId)),
    [reviewers, selectedId],
  );
  const canView = (reviewer) =>
    reviewer?.submitted === true && Boolean(reviewer?.submission);
  const questions = selected?.questions || [];
  const answers = selected?.submission?.answers || [];
  const totalScore = selected?.submission?.total_score ?? selected?.total_score ?? null;
  const employeeName = location.state?.employeeName || details?.name || "Employee";

  const closeFeedback = () => {
    setSelectedId(null);
    setExpanded({});
    if (reviewerId) {
      navigate(`/performanceManagement/reviewer-feedback/${encodeURIComponent(appraisalId)}`, {
        replace: true,
        state: { ...location.state, appraisalDetails: details },
      });
    }
  };

  return (
    <Box bg="#f5f5f5" minH="100vh" p={{ base: 3, md: 6 }}>
      <Button size="sm" leftIcon={<ArrowLeft size={15} />} mb={4} borderRadius="full"
        onClick={() => navigate("/performanceManagement")}>Back</Button>
      <Box bg="white" border="1px solid #d8d8d8" borderRadius="16px" p={5}
      //  maxW="1000px" 
       mx="auto">
        <Text fontSize="22px" fontWeight={700} mb={1}>Reviewer feedback</Text>
        <Text fontSize="12px" color="#777" mb={4}>
          {employeeName} · Submitted feedback can be opened individually. Pending reviews are locked.
        </Text>
        {loading ? <Flex justify="center" py={10}><Spinner /></Flex> : error ? (
          <Text color="red.600" fontSize="13px">{error}</Text>
        ) : reviewers.length ? reviewers.map((reviewer, index) => (
          <Flex key={reviewer._id || index} align="center" justify="space-between"
            gap={3} px={3} py={2} mb={2} bg="#f1f1f1" borderRadius="full">
            <Flex align="center" gap={2} minW={0} flexWrap="wrap">
              <Text fontSize="13px" fontWeight={600}>{reviewer.name || `Reviewer ${index + 1}`}</Text>
              <Badge borderRadius="full" bg="white" fontSize="10px" textTransform="none">
                {reviewer.designation || "Reviewer"}
              </Badge>
              {!canView(reviewer) && <Badge colorScheme="orange" borderRadius="full">Pending</Badge>}
            </Flex>
            <Button size="xs" flexShrink={0} borderRadius="full" px={4} bg="#274167" color="white"
              _hover={{ bg: "#1b3155" }} isDisabled={!canView(reviewer)}
              onClick={() => { setSelectedId(reviewer._id); setExpanded({}); }}>
              Open Feedback
            </Button>
          </Flex>
        )) : <Text color="#777" fontSize="13px">No reviewers are assigned to this appraisal yet.</Text>}
      </Box>

      <Modal isOpen={Boolean(selected && canView(selected))} onClose={closeFeedback}
        isCentered scrollBehavior="inside" size="xl">
        <ModalOverlay bg="rgba(20, 25, 35, 0.18)" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" overflow="hidden" maxH="90vh" mx={3}>
          <ModalHeader borderBottom="1px solid #e5e5e5" fontSize="22px" fontWeight={700}>
            {selected?.name || "Reviewer Feedback"}
            <Text fontSize="12px" color="#777" fontWeight={400}>
              {selected?.designation || "Reviewer"} · {employeeName}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} overflowY="auto">
            <Box px={5} pt={4} pb={4}>
              <Flex align="center" gap={2} mb={4}>
                <Text fontSize="13px">Reviewer score</Text>
                <Badge bg={totalScore == null ? "#f1f1f1" : "#008b12"}
                  color={totalScore == null ? "#666" : "white"} borderRadius="full"
                  px={3} py={1} textTransform="none">
                  {totalScore == null ? "Not available" : `${totalScore} / 100`}
                </Badge>
              </Flex>
              {questions.length ? questions.map((question, index) => {
                const answer = answers.find((item) => String(item.question_id) === String(question.id));
                const isExpanded = Boolean(expanded[question.id]);
                return (
                  <Box key={question.id} mb={1} bg="#f1f1f1" borderRadius="18px" overflow="hidden">
                    <Flex as="button" type="button" w="100%" minH="44px" align="center"
                      justify="space-between" px={3} gap={2} textAlign="left"
                      onClick={() => setExpanded((prev) => ({ ...prev, [question.id]: !prev[question.id] }))}>
                      <Text fontSize="13px" flex="1">{index + 1}. {question.text}</Text>
                      <Flex bg="white" borderRadius="full" minW="96px" h="29px"
                        justify="center" align="center" fontSize="14px">
                        {answer?.score != null ? `${answer.score} / 10` : "— / 10"}
                      </Flex>
                      <Box transform={isExpanded ? "rotate(180deg)" : "none"}><ChevronDown size={15} /></Box>
                    </Flex>
                    <Collapse in={isExpanded} animateOpacity>
                      <Box bg="white" px={4} py={3} borderTop="1px solid #e5e5e5">
                        <Text fontSize="12px" fontWeight={600} mb={1}>Reviewer Comment</Text>
                        <Text fontSize="12px" color="#757575" whiteSpace="pre-wrap">
                          {answer?.remarks?.trim() || "No comment provided."}
                        </Text>
                      </Box>
                    </Collapse>
                  </Box>
                );
              }) : <Text color="#777" fontSize="13px">Reviewer question details are not available.</Text>}
            </Box>
          </ModalBody>
          <Flex justify="space-between" align="center" p={3} flexShrink={0}>
            <Text fontSize="12px" fontWeight={600} color="#274167">
              Obtained score: {totalScore == null ? "—" : `${totalScore} / 100`}
            </Text>
            <Button size="sm" bg="#233d68" color="white" _hover={{ bg: "#1b3155" }}
              onClick={closeFeedback}>Close</Button>
          </Flex>
        </ModalContent>
      </Modal>
    </Box>
  );
}
