import { Box, Flex, Text } from '@chakra-ui/react';
import { MessageCircleQuestion, CalendarDays } from 'lucide-react';
export default function AssessmentHeader({ title, deadline, subtitle = 'Rate your performance and provide remarks.' }) {
  const date = deadline ? new Date(deadline) : null;
  const valid = date && !Number.isNaN(date.getTime());
  const days = valid ? Math.ceil((date.getTime() - Date.now()) / 86400000) : null;
  return <Flex bg="white" border="1px solid #DFE2E6" borderRadius="14px" p={{base:3,md:4}} my={3} align="center" justify="space-between" gap={3} flexWrap="wrap" fontFamily="Poppins, sans-serif">
    <Flex align="center" gap={3}><MessageCircleQuestion color="#274167" size={40} strokeWidth={1.3}/><Box><Text fontSize={{base:'23px',md:'32px'}} fontWeight="600" letterSpacing="-0.04em" color="#000" lineHeight="1.2">{title}</Text><Text color="#757575" fontSize="12px">{subtitle}</Text></Box></Flex>
    <Flex bg="#F1F3F5" borderRadius="12px" p={3} align="center" gap={2}><CalendarDays color="#274167" size={26}/><Box><Text fontSize={{base:'13px',xl:'20px'}} lineHeight="21.84px" letterSpacing="-0.04em" color="#274167">Submission Deadline</Text><Text fontSize={{base:'13px',xl:'20px'}} fontWeight="600" lineHeight="21.84px" letterSpacing="-0.04em" color="#274167">{valid ? date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Not available'} {days !== null ? `(${days >= 0 ? `in ${days} days` : `${Math.abs(days)} days overdue`})` : ''}</Text></Box></Flex>
  </Flex>;
}
