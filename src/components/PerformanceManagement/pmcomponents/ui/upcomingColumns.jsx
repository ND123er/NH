/* eslint-disable react-refresh/only-export-components -- this module exports table column configuration. */
import { Badge } from "@chakra-ui/react";

const assessmentStyles = {
  Expired: { color: "#e52323", background: "#fff", borderColor: "#ff3333" },
  Completed: { color: "#32a852", background: "#e6f7eb", borderColor: "#91dda2" },
  Pending: { color: "#dc941f", background: "#fff8ed", borderColor: "#f2d8ae" },
  Submitted: { color: "#32a852", background: "#e6f7eb", borderColor: "#91dda2" },
  Upcoming: { color: "#896fbe", background: "#f6f2ff", borderColor: "#d4c8ee" },
  Locked: { color: "#e88d8d", background: "#fff", borderColor: "#ffcaca" },
};

const SelfAssessmentBadge = ({ status }) => {
  const style = assessmentStyles[status] || assessmentStyles.Pending;

  return (
    <Badge
      border="1px solid"
      borderColor={style.borderColor}
      bg={style.background}
      color={style.color}
      borderRadius="full"
      px={2}
      py="2px"
      textTransform="none"
      fontSize="10px"
      fontWeight={400}
      lineHeight="1.2"
    >
      {status}
    </Badge>
  );
};

const FeedbackBadge = ({ value }) => {
  const isLocked = value === "Locked";

  return (
    <Badge
      minW={isLocked ? "57px" : "55px"}
      textAlign="center"
      border="1px solid"
      borderColor={isLocked ? "#ffcaca" : "#dedede"}
      bg="white"
      color={isLocked ? "#e88d8d" : "#111"}
      borderRadius="full"
      px={2}
      py="3px"
      textTransform="none"
      fontSize="10px"
      fontWeight={isLocked ? 400 : 600}
      lineHeight="1.1"
    >
      {value}
    </Badge>
  );
};

export const appraisalColumns = [
  { key: "employeeId", label: "Employee ID", width: "105px" },
  { key: "fullName", label: "Full Name", width: "130px" },
  { key: "doj", label: "DOJ", width: "90px" },
  { key: "doc", label: "DOC", width: "90px" },
  { key: "appraisalDate", label: "Appraisal", width: "105px" },
  { key: "department", label: "Department", width: "125px" },
  {
    key: "selfAssessment",
    label: "Self-Assessment",
    width: "112px",
    align: "center",
    render: (value) => <SelfAssessmentBadge status={value} />,
  },
  {
    key: "feedback",
    label: "Feedback",
    width: "90px",
    align: "center",
    render: (value) => <FeedbackBadge value={value} />,
  },
];
