// Categories for filtering
export const categories = [
  { id: "motor-insurance", label: "Motor Insurance" },
  { id: "health-insurance", label: "Health Insurance" },
  { id: "claims-processing", label: "Claims Processing" },
  { id: "underwriting", label: "Underwriting" },
  { id: "compliance", label: "Compliance" },
  { id: "customer-service", label: "Customer Service" },
  { id: "sales", label: "Sales" },
  { id: "general", label: "General" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

// Re-export types from course-context for convenience
export type {
  Course,
  Module,
  Lesson,
  Quiz,
  QuizQuestion,
  FullCourse,
  CourseCategory,
  CourseDifficulty,
  CourseStatus,
} from "./course-context";
