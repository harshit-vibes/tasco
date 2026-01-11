// Types for the AI-assisted course creator

export type CreatorStage = "describe" | "design" | "publish";

export type DesignSubStage = "outline" | "module";

export interface CourseSelections {
  level: string | null;
  topic: string | null;
  audience: string | null;
  focus: string | null;
}

export interface OutlineModule {
  title: string;
  lessons: string[];
  quizQuestions: number;
}

export interface CourseOutline {
  title: string;
  description: string;
  level: string;
  audience: string;
  estimatedMinutes: number;
  modules: OutlineModule[];
}

export interface GeneratedLesson {
  title: string;
  content: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  questions: GeneratedQuizQuestion[];
}

export interface GeneratedModule {
  moduleIndex: number;
  lessons: GeneratedLesson[];
  quiz: GeneratedQuiz;
}

export interface UploadedDocument {
  file: File;
  name: string;
  size: number;
  type: string;
  content: string | null;
  status: "uploading" | "extracting" | "ready" | "error";
  error?: string;
}

export interface CreatorState {
  // Stage tracking
  stage: CreatorStage;
  designSubStage: DesignSubStage;
  currentModuleIndex: number;
  totalModules: number;

  // Data
  selections: CourseSelections;
  outline: CourseOutline | null;
  modules: GeneratedModule[];

  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Slot options for guided chat
export const levelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const topicOptions = [
  { value: "motor-insurance", label: "Motor Insurance" },
  { value: "health-insurance", label: "Health Insurance" },
  { value: "liability-insurance", label: "Liability Insurance" },
  { value: "claims-processing", label: "Claims Processing" },
  { value: "underwriting", label: "Underwriting" },
  { value: "risk-assessment", label: "Risk Assessment" },
  { value: "customer-service", label: "Customer Service" },
  { value: "regulations", label: "Regulatory Compliance" },
];

export const audienceOptions = [
  { value: "new-sales-agents", label: "New Sales Agents" },
  { value: "senior-agents", label: "Senior Agents" },
  { value: "claims-adjusters", label: "Claims Adjusters" },
  { value: "underwriters", label: "Underwriters" },
  { value: "team-leaders", label: "Team Leaders" },
  { value: "customer-support", label: "Customer Support Staff" },
];

export const focusOptions = [
  { value: "product-knowledge", label: "Product Knowledge" },
  { value: "procedures", label: "Procedures & Processes" },
  { value: "regulations", label: "Regulations & Compliance" },
  { value: "customer-service", label: "Customer Service Skills" },
  { value: "sales-techniques", label: "Sales Techniques" },
];

// Loading messages for streaming loader
export const outlineLoadingMessages = [
  "Analyzing your requirements...",
  "Designing the course curriculum...",
  "Structuring comprehensive modules...",
  "Crafting learning objectives...",
  "Optimizing content flow...",
  "Finalizing the course outline...",
];

export const moduleLoadingMessages = [
  "Writing engaging lesson content...",
  "Adding practical examples...",
  "Crafting quiz questions...",
  "Ensuring learning outcomes...",
  "Adding pro tips for agents...",
  "Polishing the final content...",
];

// Combined loading messages for easy access
export const loadingMessages = {
  outline: outlineLoadingMessages,
  module: moduleLoadingMessages,
};
