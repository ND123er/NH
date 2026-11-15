import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import { MessageSquareText } from 'lucide-react';
import PerformanceManagementTable from '../pmcomponents/ui/PerformanceManagementTable';
export default function FeedbackReviewerTable({ reviewers = [] }) {
  const submitted = reviewers.filter(r => r.submitted).length;
  const rows = reviewers.map((r,i) => ({ ...r, id: r.reviewer_employee_id || i, employeeId: r.reviewer_employee_id || '—', fullName: r.name || '—', designation: r.designation || '—', reviewedOn: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '—', status: r.submitted ? 'Submitted' : 'Pending' }));
  const columns = [{key:'employeeId',label:'Employee ID'},{key:'fullName',label:'Full Name'},{key:'designation',label:'Designation'},{key:'status',label:'Status',render:(v)=><Badge colorScheme={v==='Submitted'?'green':'pink'} borderRadius="full" px={3}>{v}</Badge>},{key:'reviewedOn',label:'Reviewed On'}];
  return <Box mt={5} fontFamily="Poppins, sans-serif"><Flex align="center" gap={3} mb={3}><MessageSquareText size={22}/><Text fontSize={{base:'23px',md:'32px'}} fontWeight="600" lineHeight="1.2" letterSpacing="-0.04em">Feedback Reviewer</Text><Badge borderRadius="full" px={3} bg="#F0F1F3" color="#111">{submitted} of {reviewers.length} Completed</Badge></Flex>
    <Box border="1px solid #E5E7EB" borderRadius="12px" overflow="hidden" sx={{'& th':{fontFamily:'Poppins, sans-serif',fontWeight:'600 !important',fontSize:'16px !important',letterSpacing:'-0.03em',color:'#000'},'& td':{fontFamily:'Poppins, sans-serif',fontWeight:'400',fontSize:'16px !important',letterSpacing:'-0.03em'}}}><PerformanceManagementTable showHeader={false} columns={columns} data={rows} emptyMessage="Reviewers will appear after your self-assessment is submitted and assignments are created." rowHeight={44}/></Box>
  </Box>;
}
