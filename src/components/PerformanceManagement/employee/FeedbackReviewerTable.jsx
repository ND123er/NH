// import { Box, Flex, Text, Badge, Button } from '@chakra-ui/react';
// import { MessageSquareText, Eye } from 'lucide-react';
// import PerformanceManagementTable from '../pmcomponents/ui/PerformanceManagementTable';
// export default function FeedbackReviewerTable({ reviewers = [], onViewReview }) {
//   const submitted = reviewers.filter(r => r.submitted).length;
//   const rows = reviewers.map((r, i) => ({ ...r, id: r.reviewer_employee_id || r.employee_id || i, employeeId: r.reviewer_employee_id || r.employee_code || r.employee_id || '—', fullName: r.name || '—', designation: r.designation || '—', reviewedOn: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '—', status: r.submitted ? 'Submitted' : 'Pending' }));
//   const columns = [
//     { key: 'employeeId', label: 'Employee ID' }, { key: 'fullName', label: 'Full Name' }, { key: 'designation', label: 'Designation' },
//     { key: 'status', label: 'Status', render: v => <Badge colorScheme={v === 'Submitted' ? 'green' : 'pink'} borderRadius="full" px={3}>{v}</Badge> },
//     { key: 'reviewedOn', label: 'Reviewed On' },
//     { key: 'view', label: 'Action', render: (_, row) => <Button leftIcon={<Eye size={13} />} size="xs" variant="outline" borderColor="#E5E7EB" color="#274167" borderRadius="6px" isDisabled={!row.submitted} onClick={() => onViewReview?.(row)}>View Review</Button> },
//   ];
//   return <Box mt={5} fontFamily="Poppins, sans-serif"><Flex align="center" gap={3} mb={3}><MessageSquareText size={22}/><Text fontSize={{ base: '23px', md: '32px' }} fontWeight="600" lineHeight="1.2" letterSpacing="-0.04em">Feedback Reviewer</Text><Badge borderRadius="full" px={3} bg="#F0F1F3" color="#111">{submitted} of {reviewers.length} Completed</Badge></Flex>
//     <Box border="1px solid #E5E7EB" borderRadius="12px" overflow="hidden" sx={{ '& th': { fontFamily: 'Poppins, sans-serif', fontWeight: '600 !important', fontSize: '16px !important', letterSpacing: '-0.03em', color: '#000' }, '& td': { fontFamily: 'Poppins, sans-serif', fontWeight: '400', fontSize: '16px !important', letterSpacing: '-0.03em' } }}><PerformanceManagementTable showHeader={false} columns={columns} data={rows} emptyMessage="No reviewer feedback available yet." rowHeight={44}/></Box>
//   </Box>;
// }


import { Box, Flex, Text, Badge, Button } from '@chakra-ui/react';
import { MessageSquareText, Eye } from 'lucide-react';
import PerformanceManagementTable from '../pmcomponents/ui/PerformanceManagementTable';
export default function FeedbackReviewerTable({ reviewers = [], onViewReview }) {
  const submitted = reviewers.filter(r => r.submitted).length;
  const rows = reviewers.map((r, i) => ({ ...r, id: r.reviewer_employee_id || r.employee_id || i, employeeId: r.reviewer_employee_id || r.employee_code || r.employee_id || '—', fullName: r.name || '—', designation: r.designation || '—', reviewedOn: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '—', status: r.submitted ? 'Submitted' : 'Pending' }));
  const columns = [
    { key: 'employeeId', label: 'Employee ID' }, { key: 'fullName', label: 'Full Name' }, { key: 'designation', label: 'Designation' },
    { key: 'status', label: 'Status', render: v => <Badge colorScheme={v === 'Submitted' ? 'green' : 'pink'} borderRadius="full" px={3}>{v}</Badge> },
    { key: 'reviewedOn', label: 'Reviewed On' },
    { key: 'view', label: 'Action', render: (_, row) => <Button leftIcon={<Eye size={13} />} size="xs" variant="outline" borderColor="#E5E7EB" color="#274167" borderRadius="6px" isDisabled={!row.submitted} onClick={() => onViewReview?.(row)}>View Review</Button> },
  ];
  return <Box mt={5} fontFamily="Poppins, sans-serif"><Flex align="center" gap={3} mb={3}><MessageSquareText size={22} /><Text fontSize={{ base: '23px', md: '32px' }} fontWeight="600" lineHeight="1.2" letterSpacing="-0.04em">Feedback Reviewer</Text><Badge borderRadius="full" px={3} bg="#F0F1F3" color="#111">{submitted} of {reviewers.length} Completed</Badge></Flex>
    <Box border="1px solid #E5E7EB" borderRadius="12px" overflow="hidden" sx={{ '& th': { fontFamily: 'Poppins, sans-serif', fontWeight: '600 !important', fontSize: '16px !important', letterSpacing: '-0.03em', color: '#000' }, '& td': { fontFamily: 'Poppins, sans-serif', fontWeight: '400', fontSize: '16px !important', letterSpacing: '-0.03em' } }}><PerformanceManagementTable showHeader={false} columns={columns} data={rows} emptyMessage="No reviewer feedback available yet." rowHeight={44} /></Box>
  </Box>;
}

