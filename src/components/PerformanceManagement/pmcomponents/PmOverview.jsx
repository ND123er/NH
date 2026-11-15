import { SimpleGrid } from "@chakra-ui/react";
import { CalendarDays, CircleCheck, Clock3 } from "lucide-react";
import { PerformanceCard } from "./ui/PerformanceCard";

const PmOverview = ({ counts = {}, onViewList }) => (
  <SimpleGrid
    columns={{ base: 1, md: 3 }}
    spacing={{ base: 3, md: 4 }}
    w="100%"
  >
    <PerformanceCard
      icon={CalendarDays}
      title="Upcoming Appraisal"
      count={counts.upcoming ?? 0}
      period="This Month"
    />
    <PerformanceCard
      icon={CircleCheck}
      title="Submitted Self-Assessment"
      count={counts.self_submitted ?? 0}
      period="This Month"
    />
    <PerformanceCard
      icon={Clock3}
      title="Overdue / Expired"
      count={counts.overdue ?? 0}
      period="Last Month"
      onViewList={onViewList}
    />
  </SimpleGrid>
);

export default PmOverview;
