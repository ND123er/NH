import { useEffect, useMemo, useState } from 'react';
import {
  Box, Flex, Text, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, SimpleGrid, Badge, Avatar, Table,
  Thead, Tbody, Tr, Th, Td, Radio, RadioGroup,
} from '@chakra-ui/react';
import { MessageSquareText, BarChart3, CalendarDays } from 'lucide-react';
import { DEMO_QUESTIONS, DEMO_SELF_ANSWERS, DEMO_REVIEW_ANSWERS } from './mockPerformanceData';

const dateLabel = (date) => date
  ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Not available';
const totalScore = (answers) => answers.length
  ? answers.reduce((sum, answer) => sum + (Number(answer.score) || 0), 0)
  : null;
const average = (total) => total == null ? '—' : (Number(total) / 10).toFixed(1).replace(/\.0$/, '');
const scoreBadge = (value) => value == null ? '—' : `${value}/10`;

export default function AppraisalReviewModal({
  isOpen, onClose, reviewer, employee, reviewDetails, demoEnabled = false,
}) {
  const self = employee?.self_assessment?.submission;
  const feedback = reviewDetails?.submission || reviewer?.submission;
  const realQuestions = employee?.self_assessment?.questions || [];
  const realSelfAnswers = self?.answers || [];
  const realReviewerAnswers = feedback?.answers || [];
  // Demo preview is allowed only for explicitly marked sample reviewers.
  const preview = Boolean(demoEnabled && reviewer?.isDemo &&
    (!realQuestions.length || !realReviewerAnswers.length));
  const questions = realQuestions.length ? realQuestions : (preview ? DEMO_QUESTIONS : []);
  const selfAnswers = realSelfAnswers.length ? realSelfAnswers : (preview ? DEMO_SELF_ANSWERS : []);
  const reviewerAnswers = realReviewerAnswers.length ? realReviewerAnswers : (preview ? DEMO_REVIEW_ANSWERS : []);
  const selfById = useMemo(() => Object.fromEntries(selfAnswers.map(a => [String(a.question_id), a])), [selfAnswers]);
  const reviewerById = useMemo(() => Object.fromEntries(reviewerAnswers.map(a => [String(a.question_id), a])), [reviewerAnswers]);
  const [selectedQuestion, setSelectedQuestion] = useState('');

  useEffect(() => {
    setSelectedQuestion(String(questions[0]?.id ?? ''));
  }, [reviewer?.id, reviewer?.employee_id, reviewer?.reviewer_employee_id, isOpen, questions[0]?.id]);

  const selected = questions.find(q => String(q.id) === selectedQuestion);
  const selfAnswer = selected ? selfById[String(selected.id)] : null;
  const reviewerAnswer = selected ? reviewerById[String(selected.id)] : null;
  // const selfTotal = self?.total_score ?? totalScore(selfAnswers);

  // const reviewerTotal = feedback?.total_score ?? reviewer?.total_score ?? totalScore(reviewerAnswers);
  const selfTotal = self?.total_score ?? null;

  const reviewerTotal =
    feedback?.total_score ??
    reviewer?.total_score ??
    null;

  const reviewerDate = reviewer?.submitted_at || feedback?.submitted_at;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="16px" overflow="hidden" fontFamily="Poppins, sans-serif" mx={3}>
        <ModalHeader borderBottom="1px solid #ECEFF2" fontSize="20px" fontWeight="600" display="flex" alignItems="center" gap={2}>
          <MessageSquareText size={20} /> My Appraisal Review
          {preview && <Badge ml={2} colorScheme="orange" fontSize="10px">Demo preview</Badge>}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Flex align="center" justify="space-between" px={5} py={5} gap={3} flexWrap="wrap">
            <Flex align="center" gap={3}>
              <Avatar name={reviewer?.name || 'Reviewer'} size="lg" />
              <Box>
                <Text fontSize="20px" fontWeight="600">{reviewer?.name || 'Reviewer'}</Text>
                <Text color="#757575">{reviewer?.designation || '—'}</Text>
              </Box>
            </Flex>
            <Flex align="center" gap={2} bg="#F1F3F5" borderRadius="12px" px={3} py={2}>
              <CalendarDays size={24} color="#274167" />
              <Box>
                <Text fontSize="12px" color="#274167">Submission Date</Text>
                <Text fontWeight="600" fontSize="13px" color="#274167">{dateLabel(reviewerDate)}</Text>
              </Box>
            </Flex>
          </Flex>

          <SimpleGrid columns={2} spacing={0}>
            <Box bg="#274167" color="white" textAlign="center" py={5}>
              <Text fontWeight="600" fontSize="18px">My Self Score</Text>
              <Text fontWeight="700" fontSize="34px">
                {/* {average(selfTotal)} / 10 */}
                {selfTotal === null ? "—" : selfTotal} / 100
                </Text>
              <Badge bg="white" color="#274167" borderRadius="full" px={4}>Self-Assessment</Badge>
            </Box>
            <Box bg="#A6C8FF" color="#000" textAlign="center" py={5}>
              <Text fontWeight="600" fontSize="18px">Reviewer Score</Text>
              <Text fontWeight="700" fontSize="34px">
                {/* {average(reviewerTotal)} / 10 */}
                {reviewerTotal === null ? "—" : reviewerTotal} / 100
                </Text>
              <Badge bg="white" color="#274167" borderRadius="full" px={4}>Feedback</Badge>
            </Box>
          </SimpleGrid>

          <Box px={4} pt={4} pb={3}>
            <Flex align="center" gap={2} mb={3}>
              <BarChart3 size={18} />
              <Text fontSize="18px" fontWeight="600">Rating Details</Text>
            </Flex>
            <Box border="1px solid #E5E7EB" borderRadius="12px" overflowX="auto">
              <RadioGroup value={selectedQuestion} onChange={setSelectedQuestion}>
                <Table size="sm">
                  <Thead bg="#F6F7F8">
                    <Tr>
                      <Th color="#000" width="36px" aria-label="Select question" />
                      <Th color="#000">Question</Th>
                      <Th color="#000">My Rating</Th>
                      <Th color="#000">Reviewer Rating</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {questions.length ? questions.map((q, i) => (
                      <Tr key={q.id} bg={String(q.id) === selectedQuestion ? '#E2EEFF' : (i % 2 === 0 ? '#F1F3F5' : 'white')}
                        cursor="pointer" onClick={() => setSelectedQuestion(String(q.id))}>
                        <Td><Radio value={String(q.id)} colorScheme="blue" aria-label={`View feedback for ${q.text}`} /></Td>
                        <Td fontWeight={String(q.id) === selectedQuestion ? '600' : '400'}>{q.text}</Td>
                        <Td><Badge bg="#274167" color="white" borderRadius="full" px={2}>{scoreBadge(selfById[String(q.id)]?.score)}</Badge></Td>
                        <Td><Badge bg="#274167" color="white" borderRadius="full" px={2}>{scoreBadge(reviewerById[String(q.id)]?.score)}</Badge></Td>
                      </Tr>
                    )) : (
                      <Tr><Td colSpan={4} textAlign="center" color="#757575">Question-wise comparison is not available.</Td></Tr>
                    )}
                  </Tbody>
                </Table>
              </RadioGroup>
            </Box>
            {selected && <Text mt={2} fontSize="12px" color="#757575">Showing feedback for: <Text as="span" fontWeight="600" color="#274167">{selected.text}</Text></Text>}
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} bg="#E2EEFF" p={4}>
            <Box bg="white" p={4} borderRadius="12px" minH="140px">
              <Text fontWeight="600" fontSize="18px" mb={2}>My Feedback</Text>
              <Text fontSize="13px" color="#757575" fontStyle="italic" whiteSpace="pre-wrap">
                {selfAnswer?.remarks?.trim() || 'No self-assessment feedback for this question.'}
              </Text>
              <Text mt={4} fontSize="13px" fontWeight="600" color="#274167">Obtained Score: {scoreBadge(selfAnswer?.score)}</Text>
            </Box>
            <Box bg="white" p={4} borderRadius="12px" minH="140px">
              <Text fontWeight="600" fontSize="18px" mb={2}>Reviewer Feedback</Text>
              <Text fontSize="13px" color="#757575" fontStyle="italic" whiteSpace="pre-wrap">
                {reviewerAnswer?.remarks?.trim() || 'No reviewer feedback for this question.'}
              </Text>
              <Text mt={4} fontSize="13px" fontWeight="600" color="#274167">Obtained Score: {scoreBadge(reviewerAnswer?.score)}</Text>
            </Box>
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

