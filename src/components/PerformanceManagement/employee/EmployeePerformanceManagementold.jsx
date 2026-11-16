import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Text, Spinner, useToast, SimpleGrid, Input, Badge } from '@chakra-ui/react';
import { CircleCheck, Clock3 } from 'lucide-react';
import AssessmentTabs from './AssessmentTabs';
import AssessmentHeader from './AssessmentHeader';
import AssessmentQuestionAccordion from './AssessmentQuestionAccordion';
import FeedbackReviewerTable from './FeedbackReviewerTable';
import PerformanceCard from '../pmcomponents/ui/PerformanceCard';
import PerformanceManagementTable from '../pmcomponents/ui/PerformanceManagementTable';
import { getMyAppraisals, getAppraisalDetails, getMyReviews, submitSelfAssessment, submitReview } from '../../../api/performancemanagementdashborad';
import {
  DEMO_QUESTIONS,
  DEMO_REVIEWERS,
  DEMO_REVIEWS,
} from "./mockPerformanceData";
const SHOW_DEMO_DATA = import.meta.env.DEV;

const getMessage = (error) => error?.response?.data?.msg || error?.message || 'Request failed';
const getStatus = (record) => Number(record?.form_status ?? record?.status);
const statusLabel = (s) => ({ 1: 'Upcoming', 2: 'Open', 3: 'Expired', 4: 'Awaiting Reviewers', 5: 'In Review', 6: 'Completed' }[s] || 'Unknown');

export default function EmployeePerformanceManagement() {
  const toast = useToast();
  const [tab, setTab] = useState('self');
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState('');
  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState('');
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSelf = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAppraisals({ page: 1, limit: 100 });
      const list = Array.isArray(res?.result) ? res.result : [];
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
        SHOW_DEMO_DATA && apiList.length === 0
          ? DEMO_REVIEWS
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
  useEffect(() => { let active = true; setDetail(null); setAnswers({}); if (tab !== 'self' || !selectedAppraisal) return; getAppraisalDetails(selectedAppraisal).then(r => { if (active) setDetail(r?.result || null) }).catch(e => { if (active) toast({ title: getMessage(e), status: 'error' }) }); return () => { active = false }; }, [tab, selectedAppraisal, toast]);

  useEffect(() => { setAnswers({}); }, [tab, selectedReview]);
  const review = reviews.find(r => r._id === selectedReview);
  const isSelf = tab === 'self';

  // const questions=isSelf?(detail?.self_assessment?.questions||[]):(review?.questions||[]);

  const apiQuestions = isSelf
    ? (detail?.self_assessment?.questions || [])
    : (review?.questions || []);

  const questions =
    SHOW_DEMO_DATA && apiQuestions.length === 0
      ? DEMO_QUESTIONS
      : apiQuestions;

  const submission = isSelf ? detail?.self_assessment?.submission : review?.submission;
  const currentAnswers = useMemo(() => { const fromSubmission = {}; for (const a of submission?.answers || []) fromSubmission[a.question_id] = { score: a.score, remarks: a.remarks || '' }; return { ...fromSubmission, ...answers }; }, [submission, answers]);
  const answered = questions.filter(q => Number.isInteger(currentAnswers[q.id]?.score)).length;
  const score = questions.reduce((sum, q) => sum + (Number.isInteger(currentAnswers[q.id]?.score) ? currentAnswers[q.id].score : 0), 0);
  const selfStatus = getStatus(detail);

  // const canEdit = isSelf ?
  //  selfStatus === 2 && !detail?.self_submitted && !submission && !((detail?.self_deadline_at) && 
  //  new Date(detail.self_deadline_at) <= new Date()) : Boolean(review && !review.submission);

  const isDemoQuestions =
    SHOW_DEMO_DATA && apiQuestions.length === 0;

  const canEdit = !isDemoQuestions && (
    isSelf
      ? selfStatus === 2 &&
      !detail?.self_submitted &&
      !submission &&
      !(
        detail?.self_deadline_at &&
        new Date(detail.self_deadline_at) <= new Date()
      )
      : Boolean(
        review &&
        !review.isDemo &&
        !review.submission
      )
  );

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
    if (!canEdit || answered !== 10 || questions.length !== 10) return;
    const payload = questions.map(q => ({ question_id: q.id, score: currentAnswers[q.id].score, remarks: currentAnswers[q.id].remarks || '' }));
    setSubmitting(true);
    try { if (isSelf) { await submitSelfAssessment(selectedAppraisal, payload); const r = await getAppraisalDetails(selectedAppraisal); setDetail(r?.result || null); await fetchSelf(); } else { await submitReview(selectedReview, payload); await fetchReviews(); } setAnswers({}); toast({ title: 'Assessment submitted successfully', status: 'success' }); }
    catch (e) { toast({ title: getMessage(e), status: 'error' }); } finally { setSubmitting(false); }
  };
  const pending = reviews.filter(r => !r.submission);
  const filtered = reviews.filter(r => (r.employee?.name || '').toLowerCase().includes(search.toLowerCase()) || (r.employee?.employee_code || '').toLowerCase().includes(search.toLowerCase()));
  const reviewColumns = [{ key: 'employeeId', label: 'Employee ID' }, { key: 'name', label: 'Full Name' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Form Status', render: v => <Badge colorScheme={v === 'Submitted' ? 'green' : 'orange'} borderRadius="full">{v}</Badge> }, { key: 'remarks', label: 'Remarks', render: v => v || '—' }];
  const rows = filtered.map(r => ({ id: r._id, employeeId: r.employee?.employee_code || r.employee?.employee_id || '—', name: r.employee?.name || '—', department: r.employee?.department || '—', status: r.submission ? 'Submitted' : 'Pending', remarks: r.submission ? `${r.submission.total_score ?? '—'}/100` : '—' }));
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
                {new Date(a.appraisal_date).toLocaleDateString('en-GB')} ·
                {statusLabel(getStatus(a))}</Button>)}
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
          <Flex justify="flex-end" mt={4}><Button bg="#274167" color="white" _hover={{ bg: '#193352' }} isDisabled={!canEdit || answered !== 10 || questions.length !== 10} isLoading={submitting} onClick={submit}>Submit Assessment</Button></Flex>
          {selfStatus !== 2 && <Text mt={2} color="#757575" fontSize="13px">Status: {statusLabel(selfStatus)}</Text>}

          {/* <FeedbackReviewerTable reviewers={detail.reviewers||[]}/>
         */}
          <FeedbackReviewerTable
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
                      {review.submission?.total_score ?? score}/100
                    </Badge>
                  </Box>
                  <Text fontWeight="600">{answered} of {questions.length} Answered · {score}/100</Text>
                </Flex>
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
                      readOnly={!canEdit} />)}

                </Box>
                <Flex justify="flex-end" mt={4}>
                  <Button bg="#274167" color="white" _hover={{ bg: '#193352' }}
                    isDisabled={!canEdit || answered !== 10 || questions.length !== 10}
                    isLoading={submitting}
                    onClick={submit}>
                    Submit Feedback
                  </Button>
                </Flex>
              </Box>
            }
          </Box>
        )}

      </>}
  </Box>;
}
