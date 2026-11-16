import { useState } from 'react';
import { Box, Flex, Text, IconButton, Textarea, Collapse } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

export const SCORE_COLORS = ['#8B1E1E','#9B321C','#A64B18','#A65F12','#98700D','#7F760B','#657A0D','#4D7A13','#36751B','#246B24','#155C2A'];
export default function AssessmentQuestionAccordion
({ question, 
  index,
   score,
    remarks = '',
     onScoreChange, 
     onRemarksChange,
      readOnly = false, 
  description = ''


}) {
  const [expanded, setExpanded] = useState(false);
  return <Box bg="white" borderRadius="12px" mb="6px" px={{base:2,md:3}} py="10px" fontFamily="Poppins, sans-serif">
    <Flex align="center" gap={{base:2,md:3}} flexWrap={{base:'wrap',lg:'nowrap'}}>
      <Flex flex="1" align="center" gap="10px" minW={{base:'100%',lg:'270px'}}>
        <Flex w="50px" h="50px" flexShrink={0} borderRadius="full" bg="#274167" color="white" align="center" justify="center" fontSize="18px" fontWeight="600">{index + 1}</Flex>
        <Box minW={0}><Text fontSize={{base:'15px',xl:'20px'}} fontWeight="600" lineHeight="21.84px" letterSpacing="-0.04em" color="#000" noOfLines={2}>{question.text}</Text>{description && <Text color="#757575" fontSize={{base:'12px',xl:'16px'}} fontWeight="400" lineHeight="21.84px" letterSpacing="-0.04em" noOfLines={2}>{description}</Text>}</Box>
      </Flex>
      <Flex gap={{base:'3px',md:'5px'}} align="center" flexWrap="wrap" justify="flex-end" ml="auto">
        {SCORE_COLORS.map((color, value) => <Box as="button" type="button" key={value} aria-label={`Score ${value}`} aria-pressed={score === value} disabled={readOnly} onClick={() => onScoreChange?.(value)} w={{base:'27px',xl:'34px'}} h={{base:'27px',xl:'34px'}} borderRadius="full" bg={color} opacity={score === value ? 1 : 0.43} color="white" fontWeight="600" fontSize={{base:'11px',xl:'13px'}} border={score === value ? '2px solid white' : '2px solid transparent'} outline={score === value ? `2px dashed ${color}` : 'none'} outlineOffset="1px" cursor={readOnly ? 'default' : 'pointer'} _focusVisible={{boxShadow:'0 0 0 3px #274167'}}>{value}</Box>)}
        <IconButton aria-label={expanded ? 'Collapse question' : 'Expand question'} size="sm" variant="ghost" color="#274167" icon={<ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />} onClick={() => setExpanded(v => !v)} />
      </Flex>
    </Flex>
    <Collapse in={expanded} animateOpacity><Box mt={3} pt={3} borderTop="1px solid #EDF0F3"><Text fontWeight="600" mb={2} fontSize="13px">Remarks</Text><Textarea value={remarks} isReadOnly={readOnly} maxLength={5000} onChange={e => onRemarksChange?.(e.target.value)} placeholder="Add your remarks (optional)" resize="vertical" fontSize="14px" /></Box></Collapse>
  </Box>;
}
