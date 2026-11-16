
export const DEMO_QUESTIONS = [
  "Quality of Work",
  "Reliability",
  "Ownership",
  "Communication",
  "Team collaboration",
  "Adaptability",
  "Problem solving",
  "Goal achievement",
  "Professional conduct",
  "Continuous learning",
].map((text, index) => ({
  id: index + 1,
  text,
}));

export const DEMO_REVIEWERS = [
  {
    employee_id: "EMP001",
    employee_code: "1004859",
    name: "Ashish Saha",
    designation: "Project Manager",
    submitted: true,
  },
  {
    employee_id: "EMP002",
    employee_code: "1004858",
    name: "Amelia Kar",
    designation: "Supervisor",
    submitted: true,
  },
  {
    employee_id: "EMP003",
    employee_code: "1004857",
    name: "Rohan Dutta",
    designation: "Human Resource",
    submitted: false,
  },
];

export const DEMO_REVIEWS = [
  {
    _id: "demo-review-1",
    isDemo: true,
    employee: {
      employee_code: "1004859",
      name: "Ashish Saha",
      department: "Engineering",
    },
    questions: DEMO_QUESTIONS,
    submission: null,
  },
  {
    _id: "demo-review-2",
    isDemo: true,
    employee: {
      employee_code: "1004858",
      name: "Amelia Kar",
      department: "HR",
    },
    questions: DEMO_QUESTIONS,
    submission: {
      total_score: 78,
      answers: DEMO_QUESTIONS.map((q) => ({
        question_id: q.id,
        score: 8,
        remarks: "Sample submitted feedback",
      })),
    },
  },
  {
    _id: "demo-review-3",
    isDemo: true,
    employee: {
      employee_code: "1004857",
      name: "Rohan Dutta",
      department: "Design",
    },
    questions: DEMO_QUESTIONS,
    submission: null,
  },
];
