import { Flex, Button } from '@chakra-ui/react';
import { LayoutGrid, Megaphone } from 'lucide-react';

const tabs = [{ id: 'self', label: 'Self-Assessment', icon: LayoutGrid }, { id: 'others', label: 'Others-Assessment', icon: Megaphone }];
export default function AssessmentTabs({ value, onChange }) {
  return <Flex bg="#274167" borderRadius="10px" p="5px" gap="4px" role="tablist" fontFamily="Poppins, sans-serif">
    {tabs.map(({ id, label, icon: Icon }) => <Button key={id} role="tab" aria-selected={value === id} flex="1" minW={0} h="43px" bg={value === id ? 'white' : 'transparent'} color={value === id ? '#111' : '#E4EAF3'} _hover={{ bg: value === id ? 'white' : '#35547c' }} fontSize={{base:'12px',md:'15px'}} fontWeight="600" borderRadius="6px" leftIcon={<Icon size={17} />} onClick={() => onChange(id)}>{label}</Button>)}
  </Flex>;
}
