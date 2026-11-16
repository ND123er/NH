
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
    isDemo: true,
  },
  {
    employee_id: "EMP002",
    employee_code: "1004858",
    name: "Amelia Kar",
    designation: "Supervisor",
    submitted: true,
    isDemo: true,
  },
  {
    employee_id: "EMP003",
    employee_code: "1004857",
    name: "Rohan Dutta",
    designation: "Human Resource",
    submitted: false,
    isDemo: true,
  },
];

// Development-only visual preview. Never use these records for API submissions.
export const DEMO_SELF_ANSWERS = DEMO_QUESTIONS.map((q, i) => ({
  question_id: q.id,
  score: [8, 7, 8, 9, 8, 8, 7, 9, 8, 8][i],
  remarks: `I completed my ${q.text.toLowerCase()} responsibilities effectively, maintained work quality, and continuously worked on improving my skills.`,
}));
export const DEMO_REVIEW_ANSWERS = DEMO_QUESTIONS.map((q, i) => ({
  question_id: q.id,
  score: [9, 8, 9, 8, 9, 8, 8, 9, 9, 9][i],
  remarks: `Demonstrated strong ${q.text.toLowerCase()} and consistent improvement throughout the review period.`,
}));

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
    self_assessment: { submission: { answers: DEMO_SELF_ANSWERS } },
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
    self_assessment: { submission: { answers: DEMO_SELF_ANSWERS } },
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
    self_assessment: { submission: { answers: DEMO_SELF_ANSWERS } },
    submission: null,
  },
];


// Entirely synthetic appraisal for empty-list development preview only.
export const DEMO_APPRAISAL = {
  _id: 'demo-appraisal-1', isDemo: true, status: 2, form_status: 2,
  appraisal_date: '2026-11-27T00:00:00.000Z', self_deadline_at: '2026-11-27T00:00:00.000Z',
  self_submitted: false, employee_code: 'DEMO-001', name: 'Demo Employee',
};
export const DEMO_APPRAISAL_DETAIL = {
  ...DEMO_APPRAISAL,
  self_assessment: { questions: DEMO_QUESTIONS, submission: null },
  reviewers: DEMO_REVIEWERS,
};
