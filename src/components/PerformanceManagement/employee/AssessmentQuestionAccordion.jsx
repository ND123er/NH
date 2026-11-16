import { useState } from 'react';
import { Box, Flex, Text, IconButton, Textarea, Collapse } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

export const SCORE_COLORS = ['#8B1E1E','#9B321C','#A64B18','#A65F12','#98700D','#7F760B','#657A0D','#4D7A13','#36751B','#246B24','#155C2A'];

export default function AssessmentQuestionAccordion({ question, index, score, remarks = '', onScoreChange, onRemarksChange, readOnly = false, description = '', reviewerMode = false, employeeScore = null, employeeRemarks = '' }) {
  const [expanded, setExpanded] = useState(false);
  const scoreDots = (selected) => SCORE_COLORS.map((color, value) => (
    <Box as="button" type="button" key={value} aria-label={`Score ${value}`} aria-pressed={selected === value}
      disabled={readOnly} onClick={() => onScoreChange?.(value)}
      w={{ base: '26px', xl: '34px' }} h={{ base: '26px', xl: '34px' }} flexShrink={0}
      borderRadius="full" bg={color} color="white" fontWeight="600" fontSize={{ base: '11px', xl: '13px' }}
      opacity={selected === value ? 1 : 0.43} border="2px solid white"
      outline={selected === value ? `2px dashed ${color}` : 'none'} outlineOffset="1px"
      cursor={readOnly ? 'default' : 'pointer'}>{value}</Box>
  ));
  return (
    <Box bg="white" borderRadius="12px" mb="7px" overflow="hidden" fontFamily="Poppins, sans-serif" border="1px solid #EEF0F2">
      <Flex align="center" gap={3} px={{ base: 2, md: 3 }} py="10px" flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
        <Flex flex="1" align="center" gap="10px" minW={{ base: '100%', lg: '270px' }}>
          <Flex w="50px" h="50px" flexShrink={0} borderRadius="full" bg="#274167" color="white" align="center" justify="center" fontSize="18px" fontWeight="600">{index + 1}</Flex>
          <Box minW={0}><Text fontSize={{ base: '15px', xl: '20px' }} fontWeight="600" lineHeight="21.84px" letterSpacing="-0.04em" color="#000">{question.text}</Text>
            {description && <Text color="#757575" fontSize={{ base: '12px', xl: '16px' }} lineHeight="21.84px" letterSpacing="-0.04em">{description}</Text>}
          </Box>
        </Flex>
        <Flex align="center" gap={2} ml="auto">
          {reviewerMode ? (Number.isInteger(employeeScore) ? <Flex align="center" justify="center" borderRadius="full" bg={SCORE_COLORS[employeeScore]} color="white" w="34px" h="34px" fontWeight="600" outline={`2px dashed ${SCORE_COLORS[employeeScore]}`} outlineOffset="2px">{employeeScore}</Flex> : <Text fontSize="12px" color="#757575">—</Text>) : <Flex gap="4px" flexWrap="wrap" justify="flex-end">{scoreDots(score)}</Flex>}
          <IconButton aria-label={expanded ? 'Collapse question' : 'Expand question'} size="sm" variant="ghost" color="#274167" icon={<ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />} onClick={() => setExpanded(v => !v)} />
        </Flex>
      </Flex>
      <Collapse in={expanded} animateOpacity>
        {reviewerMode && <>
          <Box bg="#274167" color="white" px={4} py={3} fontSize="14px" fontStyle="italic" textAlign="center">{employeeRemarks || 'Employee comment not available'}</Box>
          <Flex py={3} px={2} align="center" justify="center" gap={3} flexWrap="wrap"><Text fontSize="13px" fontStyle="italic">Revised Score</Text><Flex gap="4px" flexWrap="wrap" justify="center">{scoreDots(score)}</Flex></Flex>
        </>}
        <Box bg="#F2F2F2" p={3}>
          <Textarea value={remarks} isReadOnly={readOnly} maxLength={5000} onChange={e => onRemarksChange?.(e.target.value)} placeholder={reviewerMode ? 'Write comment here ...' : 'Add your remarks'} resize="vertical" fontSize="14px" bg="white" borderRadius="9px" borderColor="#E5E7EB" />
        </Box>
      </Collapse>
    </Box>
  );
}
