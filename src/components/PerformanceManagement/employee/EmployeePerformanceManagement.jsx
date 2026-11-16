import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Text, Spinner, useToast, SimpleGrid, Input, Badge, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { CircleCheck, Clock3 } from 'lucide-react';
import AssessmentTabs from './AssessmentTabs';
import AssessmentHeader from './AssessmentHeader';
import AssessmentQuestionAccordion from './AssessmentQuestionAccordion';
import FeedbackReviewerTable from './FeedbackReviewerTable';
import AppraisalReviewModal from './AppraisalReviewModal';
import PerformanceCard from '../pmcomponents/ui/PerformanceCard';
import PerformanceManagementTable from '../pmcomponents/ui/PerformanceManagementTable';
import { getMyAppraisals, getAppraisalDetails, getMyReviews, submitSelfAssessment, submitReview, saveSelfAssessmentDraft, saveReviewDraft, getReviewDetails, PERFORMANCE_V2_ENABLED } from '../../../api/performancemanagementdashborad';
import {
  DEMO_QUESTIONS,
  DEMO_REVIEWERS,
  DEMO_REVIEWS,
  DEMO_SELF_ANSWERS,
  DEMO_APPRAISAL,
  DEMO_APPRAISAL_DETAIL,
} from "./mockPerformanceData";
const SHOW_DEMO_DATA = import.meta.env.DEV && import.meta.env.VITE_PERFORMANCE_DEMO !== "false";

const getMessage = (error) => error?.response?.data?.msg || error?.message || 'Request failed';
const formStatus = (record) => Number(record?.form_status ?? record?.status);
const formLabel = (s) => ({ 1: 'Upcoming', 2: 'Pending', 3: 'Draft', 4: 'Submitted', 5: 'Expired', 6: 'Reactivated' }[s] || 'Unknown');
const appraisalLabel = (s) => ({ 1: 'Upcoming', 2: 'Self open', 3: 'Self expired', 4: 'Reviewer setup pending', 5: 'In review', 6: 'Completed' }[s] || 'Unknown');
const isBeforeDeadline = (deadline) => !deadline || new Date(deadline).getTime() > Date.now();
const canEditForm = (record, deadline, submitted) => [2, 3, 6].includes(formStatus(record)) && !submitted && isBeforeDeadline(deadline);


export default function EmployeePerformanceManagement() {
  const toast = useToast();
  const [tab, setTab] = useState('self');
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState('');
  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedReview, setSelectedReview] = useState('');
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [showDraftChoice, setShowDraftChoice] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSelf = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAppraisals({ page: 1, limit: 100 });
      const apiList = Array.isArray(res?.result) ? res.result : [];
      const list = SHOW_DEMO_DATA ? [...apiList, DEMO_APPRAISAL] : apiList;
      setAppraisals(list);
      setSelectedAppraisal(old => list.some(x => x._id === old) ? old : (list[0]?._id || ''));
    }
    catch (e) {
      toast({ title: getMessage(e), status: 'error' });
      setAppraisals([]);
    } finally { setLoading(false); }
  }, [toast]);
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyReviews({ page: 1, limit: 100 });
      // const list = Array.isArray(res?.result) ? res.result : [];
      const apiList = Array.isArray(res?.result)
        ? res.result
        : [];

      const list =
        SHOW_DEMO_DATA
          ? [...apiList, ...DEMO_REVIEWS]
          : apiList;
      setReviews(list);
      // setSelectedReview(old => list.some(x => x._id === old) ? old : (list[0]?._id || ''));
      setSelectedReview(old =>
        list.some(x => x._id === old) ? old : ""
      );
    }
    catch (e) { toast({ title: getMessage(e), status: 'error' }); setReviews([]); } finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { if (tab === 'self') fetchSelf(); else fetchReviews(); }, [tab, fetchSelf, fetchReviews]);
  useEffect(() => { let active = true; setDetail(null); setAnswers({}); if (tab !== 'self' || !selectedAppraisal) return; (selectedAppraisal === DEMO_APPRAISAL._id ? Promise.resolve({ result: DEMO_APPRAISAL_DETAIL }) : getAppraisalDetails(selectedAppraisal)).then(r => { if (active) setDetail(r?.result || null) }).catch(e => { if (active) toast({ title: getMessage(e), status: 'error' }) }); return () => { active = false }; }, [tab, selectedAppraisal, toast]);

  useEffect(() => { setAnswers({}); setReviewDetail(null); }, [tab, selectedReview]);
  useEffect(() => {
    if (tab !== 'others' || !selectedReview || !PERFORMANCE_V2_ENABLED || selectedReview.startsWith('demo-')) return;
    let active = true;
    getReviewDetails(selectedReview).then(res => { if (active) setReviewDetail(res?.result || null); })
      .catch(error => { if (active) toast({ title: getMessage(error), status: 'error' }); });
    return () => { active = false; };
  }, [tab, selectedReview, toast]);
  const review = reviewDetail || reviews.find(r => r._id === selectedReview);
  const isSelf = tab === 'self';

  // const questions=isSelf?(detail?.self_assessment?.questions||[]):(review?.questions||[]);

  const apiQuestions = isSelf
    ? (detail?.self_assessment?.questions || [])
    : (review?.questions || []);

  const questions =
    SHOW_DEMO_DATA && apiQuestions.length === 0
      ? DEMO_QUESTIONS
      : apiQuestions;

  const form = isSelf ? detail?.self_assessment : review;
  const submission = form?.submission;
  const savedDraft = PERFORMANCE_V2_ENABLED ? form?.draft?.answers || [] : [];

  const currentAnswers = useMemo(() => { const fromSubmission = {}; for (const a of submission?.answers || []) fromSubmission[a.question_id] = { score: a.score, remarks: a.remarks || '' }; const fromDraft = {}; for (const a of savedDraft) fromDraft[a.question_id] = { score: a.score ?? null, remarks: a.remarks || '' }; return { ...fromSubmission, ...fromDraft, ...answers }; }, [submission, savedDraft, answers]);
  const answered = questions.filter(q => Number.isInteger(currentAnswers[q.id]?.score)).length;

  const score = questions.reduce((sum, q) => sum + (Number.isInteger(currentAnswers[q.id]?.score) ? currentAnswers[q.id].score : 0), 0);

  const selfStatus = formStatus(detail);
  // UI-only: no new endpoints or review permission assumptions.
  // Only render original employee comments if the existing response actually includes them.
  const employeeOriginalAnswers = review?.self_assessment?.submission?.answers?.length
    ? review.self_assessment.submission.answers
    : (SHOW_DEMO_DATA && review?.isDemo ? DEMO_SELF_ANSWERS : []);
  const employeeOriginalById = Object.fromEntries(employeeOriginalAnswers.map(a => [a.question_id, a]));

  // const canEdit = isSelf ?
  //  selfStatus === 2 && !detail?.self_submitted && !submission && !((detail?.self_deadline_at) && 
  //  new Date(detail.self_deadline_at) <= new Date()) : Boolean(review && !review.submission);

  const isDemoQuestions =
    SHOW_DEMO_DATA && apiQuestions.length === 0;

  const canEdit = !isDemoQuestions && !detail?.isDemo && !review?.isDemo && (
    isSelf
      ? (PERFORMANCE_V2_ENABLED ? canEditForm({ form_status: detail?.form_status }, detail?.self_deadline_at, Boolean(submission || detail?.self_submitted)) : selfStatus === 2 && !submission && !detail?.self_submitted && isBeforeDeadline(detail?.self_deadline_at))
      : Boolean(review && !submission && (PERFORMANCE_V2_ENABLED ? canEditForm(review, review.deadline_at, false) : true))
  );

  console.log("Reviewer editing debug:", {
  isSelf,
  canEdit,
  review,
  reviewStatus: review?.form_status,
  reviewSubmission: review?.submission,
  deadline: review?.deadline_at,
  performanceV2: PERFORMANCE_V2_ENABLED,
  isDemoQuestions,
});

  const setAnswer = (id, part, value) => setAnswers(prev => ({ ...prev, [id]: { score: prev[id]?.score ?? currentAnswers[id]?.score ?? null, remarks: prev[id]?.remarks ?? currentAnswers[id]?.remarks ?? '', [part]: value } }));
  const submit = async () => {
    if (isDemoQuestions || review?.isDemo) {
      toast({
        title: "Demo data cannot be submitted",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!canEdit || answered !== 10 || questions.length !== 10 || questions.some(q => !String(currentAnswers[q.id]?.remarks || '').trim())) {
      toast({ title: 'Answer all 10 questions with a score and remarks before submitting', status: 'warning' });
      return;
    }
    const payload = questions.map(q => ({ question_id: q.id, score: currentAnswers[q.id].score, remarks: currentAnswers[q.id].remarks.trim() }));
    setSubmitting(true);
    try { if (isSelf) { await submitSelfAssessment(selectedAppraisal, payload); const r = await getAppraisalDetails(selectedAppraisal); setDetail(r?.result || null); await fetchSelf(); } else { await submitReview(selectedReview, payload); await fetchReviews(); if (PERFORMANCE_V2_ENABLED) { const r = await getReviewDetails(selectedReview); setReviewDetail(r?.result || null); } } setAnswers({}); toast({ title: 'Assessment submitted successfully', status: 'success' }); }
    catch (e) { toast({ title: getMessage(e), status: 'error' }); } finally { setSubmitting(false); }
  };
  const saveDraft = async () => {
    if (!PERFORMANCE_V2_ENABLED || !canEdit || detail?.isDemo || review?.isDemo) {
      toast({ title: 'Backend draft saving is not available on this server', status: 'info' });
      return;
    }
    const payload = questions.filter(q => currentAnswers[q.id] && (Number.isInteger(currentAnswers[q.id].score) || String(currentAnswers[q.id].remarks || '').trim())).map(q => ({
      question_id: q.id,
      ...(Number.isInteger(currentAnswers[q.id].score) ? { score: currentAnswers[q.id].score } : {}),
      remarks: currentAnswers[q.id].remarks || '',
    }));
    setSavingDraft(true);
    try {
      if (isSelf) { await saveSelfAssessmentDraft(selectedAppraisal, payload); const res = await getAppraisalDetails(selectedAppraisal); setDetail(res?.result || null); }
      else { await saveReviewDraft(selectedReview, payload); const res = await getReviewDetails(selectedReview); setReviewDetail(res?.result || null); }
      setAnswers({}); setShowDraftChoice(false);
      toast({ title: 'Draft saved', status: 'success' });
    } catch (error) { toast({ title: getMessage(error), status: 'error' }); }
    finally { setSavingDraft(false); }
  };
  const pending = reviews.filter(r => !r.submission);
  const filtered = reviews.filter(r => (r.employee?.name || '').toLowerCase().includes(search.toLowerCase()) || (r.employee?.employee_code || '').toLowerCase().includes(search.toLowerCase()));
  const reviewColumns = [{ key: 'employeeId', label: 'Employee ID' }, { key: 'name', label: 'Full Name' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Form Status', render: v => <Badge colorScheme={v === 'Submitted' ? 'green' : 'orange'} borderRadius="full">{v}</Badge> }, { key: 'remarks', label: 'Remarks', render: v => v || '—' }];
  const rows = filtered.map(r => ({ id: r._id, employeeId: r.employee?.employee_code || r.employee?.employee_id || '—', name: `${r.isDemo ? "[DEMO] " : ""}${r.employee?.name || "—"}`, department: r.employee?.department || '—', status: r.isDemo ? (r.submission ? 'Demo Submitted' : 'Demo Pending') : (r.submission ? 'Submitted' : (PERFORMANCE_V2_ENABLED ? formLabel(formStatus(r)) : 'Pending')), remarks: r.submission ? `${r.submission.total_score ?? '—'}/100` : '—' }));
  return <Box p={{ base: 2, md: 3 }} fontFamily="Poppins, sans-serif" color="#000" bg="#F5F7FA" minH="75vh">
    <AssessmentTabs value={tab} onChange={setTab} />
    <AssessmentHeader title={isSelf ? 'Self-Assessment' : 'Others-Assessment'} deadline={isSelf ? detail?.self_deadline_at : null} subtitle={isSelf ? 'Rate your performance and provide remarks.' : 'Review your assigned employees and provide feedback.'} />
    {loading ?
      <Flex py={10} justify="center"><Spinner />
      </Flex> : isSelf ? <>
        {appraisals.length >
          1 &&
          <Flex gap={2} mb={3} flexWrap="wrap">
            {appraisals.map(a =>
              <Button key={a._id}
                size="sm" variant={a._id === selectedAppraisal ?
                  'solid' : 'outline'} bg={a._id === selectedAppraisal ?
                    '#274167' : 'white'}
                color={a._id === selectedAppraisal ?
                  'white' : '#274167'}
                onClick={() => setSelectedAppraisal(a._id)}>
                {a.isDemo ? "DEMO · " : ""}{new Date(a.appraisal_date).toLocaleDateString('en-GB')} ·
                {appraisalLabel(Number(a.status))}</Button>)}
          </Flex>}
        {!appraisals.length ? <Box p={8} bg="white" borderRadius="12px">No appraisals assigned yet.</Box> : !detail ? <Flex justify="center" py={8}><Spinner /></Flex> : <Box bg="white" border="1px solid #E1E4E8" borderRadius="14px" p={{ base: 3, md: 4 }}>
          <Flex justify="space-between" mb={3} align="center"><Text fontSize="15px" fontWeight="600">{answered} of {questions.length} Answered</Text><Text fontSize="14px" bg="#F1F2F4" borderRadius="full" px={4} py={1} fontWeight="600">Score: {score}/100</Text></Flex>
          <Box bg="#F2F2F2" p={2} borderRadius="12px">{questions.map((q, i) =>
            <AssessmentQuestionAccordion
              key={q.id}
              question={q}
              index={i}
              score={currentAnswers[q.id]?.score}
              remarks={currentAnswers[q.id]?.remarks || ''}
              onScoreChange={v => setAnswer(q.id, 'score', v)}
              onRemarksChange={v => setAnswer(q.id, 'remarks', v)}
              description={
                SHOW_DEMO_DATA && isDemoQuestions
                  ? "Consistently delivers high-quality work and meets expectations"
                  : ""
              }

              readOnly={!canEdit} />)}
          </Box>
          {(detail?.isDemo || isDemoQuestions) && <Badge colorScheme="orange" mt={2}>Demo questions for layout preview — not submit-ready</Badge>}
          <Flex justify="flex-end" mt={4} gap={2}>
            {PERFORMANCE_V2_ENABLED && <Button variant="outline" isDisabled={!canEdit} isLoading={savingDraft} onClick={saveDraft}>Save Draft</Button>}
            <Button bg="#274167" color="white" _hover={{ bg: '#193352' }} isDisabled={!canEdit || answered !== 10 || questions.length !== 10} isLoading={submitting} onClick={submit}>Submit Assessment</Button>
          </Flex>
          {selfStatus !== 2 && <Text mt={2} color="#757575" fontSize="13px">Status: {formLabel(selfStatus)}</Text>}

          {/* <FeedbackReviewerTable reviewers={detail.reviewers||[]}/>
         */}
          <FeedbackReviewerTable
            onViewReview={setSelectedReviewer}
            reviewers={
              SHOW_DEMO_DATA && !detail?.reviewers?.length
                ? DEMO_REVIEWERS
                : detail?.reviewers || []
            }
          />
        </Box>}
      </> : <>
        {!showReviewDetails ? (
          <>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
              <PerformanceCard icon={CircleCheck}
                title="Submitted Feedback" count={reviews.length - pending.length} />
              <PerformanceCard icon={Clock3} title="Feedback Pending" count={pending.length} />
            </SimpleGrid>
            <Box bg="white" border="1px solid #E1E4E8" borderRadius="14px" p={3} mb={3}>
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="600" fontSize="20px">Remarks Board</Text>
                <Input w="220px" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
              </Flex>
              <Box sx={{
                '& th':
                {
                  fontFamily: 'Poppins',
                  fontSize: '16px !important',
                  letterSpacing: '-0.03em'
                },
                '& td': {
                  fontFamily: 'Poppins',
                  fontSize: '16px !important',
                  letterSpacing: '-0.03em'
                }
              }}>
                <PerformanceManagementTable
                  showHeader={false}
                  data={rows}
                  columns={reviewColumns}
                  emptyMessage="No review assignments"
                  // rowActions=
                  // {[{ label: 'View Details', onClick: (row) => 
                  // { setSelectedReview(row.id); }, variant: 'ghost', size: 'xs' }]} 
                  rowActions={[
                    {
                      label: "View Details",
                      onClick: (row) => {
                        setAnswers({});
                        setSelectedReview(row.id);
                        setShowReviewDetails(true);
                      },
                      variant: "ghost",
                      size: "xs",
                    },
                  ]}
                />
              </Box>
            </Box>
          </>
        ) : (
          <Box>
            <Button
              size="sm"
              mb={3}
              borderRadius="full"
              onClick={() => {
                setShowReviewDetails(false);
                setSelectedReview("");
                setAnswers({});
              }}
            >
              ← Back
            </Button>

            {/* Existing review question section goes here */}
            {review &&
              <Box bg="white" border="1px solid #E1E4E8" borderRadius="14px" p={3}>
                <Flex justify="space-between" mb={3}>
                  {/* <Text fontSize="20px" fontWeight="600">
                    Review: {review.employee?.name || 'Employee'}
                  </Text> */}
                  <Box>
                    <Text
                      fontFamily="Poppins"
                      fontSize="20px"
                      fontWeight="600"
                      color="#000000"
                    >
                      {review.employee?.name || "Employee"}
                    </Text>

                    <Text
                      fontFamily="Poppins"
                      fontSize="16px"
                      color="#757575"
                    >
                      {review.employee?.department || "—"}
                    </Text>

                    <Badge
                      bg="#274167"
                      color="white"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {/* {review.submission?.total_score ?? score}/100 */}
                      {review.submission?.total_score != null
                        ? `${review.submission.total_score}/100`
                        : "Not submitted"}
                    </Badge>
                  </Box>
                  <Text fontWeight="600">
                    {/* {answered} of {questions.length} Answered · {score}/100 */}
                    {answered} of {questions.length} Answered
                  </Text>
                </Flex>
                {review.isDemo && <Badge colorScheme="orange" mb={2}>Demo preview — no submission</Badge>}
                <Box bg="#F2F2F2" borderRadius="12px" p={2}>
                  {questions.map((q, i) =>
                    <AssessmentQuestionAccordion
                      key={q.id}
                      question={q}
                      index={i}
                      score={currentAnswers[q.id]?.score}
                      remarks={currentAnswers[q.id]?.remarks || ''}
                      onScoreChange={v => setAnswer(q.id, 'score', v)}
                      onRemarksChange={v => setAnswer(q.id, 'remarks', v)}
                      description={
                        SHOW_DEMO_DATA && isDemoQuestions
                          ? "Consistently delivers high-quality work and meets expectations"
                          : ""
                      }
                      reviewerMode
                      employeeScore={employeeOriginalById[q.id]?.score ?? null}
                      employeeRemarks={employeeOriginalById[q.id]?.remarks || ''}
                      readOnly={!canEdit} />)}

                </Box>
                <Flex justify="flex-end" mt={4}>
                  <Button bg="#274167" color="white" _hover={{ bg: '#193352' }}
                    isDisabled={!canEdit} isLoading={submitting}
                    onClick={() => setShowDraftChoice(true)}>
                    Save / Draft
                  </Button>
                </Flex>
              </Box>
            }
          </Box>
        )}

      </>}
    <Modal isOpen={showDraftChoice} onClose={() => setShowDraftChoice(false)} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
      <ModalContent mx={4} borderRadius="16px" fontFamily="Poppins, sans-serif" overflow="visible">
        <ModalCloseButton top="-12px" right="-12px" borderRadius="full" bg="white" boxShadow="md" />
        <ModalBody p={6}>
          <Text fontSize="16px" color="#757575" lineHeight="1.6" mb={5}>Would you like to save your review as a draft and submit it later, or submit it now?</Text>
          <Flex gap={3}>
            <Button flex={1} variant="outline" color="#274167" borderColor="#E1E4E8" isLoading={savingDraft} onClick={saveDraft}>Save Draft</Button>
            <Button flex={1} bg="#274167" color="white" _hover={{ bg: '#193352' }} isDisabled={!canEdit || answered !== 10 || questions.length !== 10} isLoading={submitting} onClick={() => { setShowDraftChoice(false); submit(); }}>Submit</Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
    <AppraisalReviewModal isOpen={Boolean(selectedReviewer)} onClose={() => setSelectedReviewer(null)} reviewer={selectedReviewer} employee={detail} demoEnabled={SHOW_DEMO_DATA} />
  </Box>;
}
