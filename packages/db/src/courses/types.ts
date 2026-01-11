/**
 * E-Learning Course data types for DynamoDB persistence
 */

// ============================================
// Enums and Constants
// ============================================

export type CourseCategory =
  | "motor-insurance"
  | "health-insurance"
  | "claims-processing"
  | "underwriting"
  | "compliance"
  | "customer-service"
  | "sales"
  | "general";

export type CourseDifficulty = "beginner" | "intermediate" | "advanced";

export type CourseStatus = "draft" | "published" | "archived";

export type ProgressStatus = "not-started" | "in-progress" | "completed";

// ============================================
// Course Entity
// ============================================

export interface Course {
  id: string;
  appId: string;           // App that owns this course (e.g., "e-learning")
  entityId: string;        // Business entity (for multi-tenant)
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  estimatedMinutes: number;
  moduleCount: number;     // Denormalized count
  isAIGenerated: boolean;  // Created via AI course creator
  coverImage?: string;     // S3 URL or path
  tags?: string[];
  createdBy: string;       // User ID
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  appId: string;
  entityId: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  estimatedMinutes?: number;
  isAIGenerated?: boolean;
  coverImage?: string;
  tags?: string[];
  createdBy: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  category?: CourseCategory;
  difficulty?: CourseDifficulty;
  status?: CourseStatus;
  estimatedMinutes?: number;
  coverImage?: string;
  tags?: string[];
}

// DynamoDB item (includes pk/sk)
export interface CourseItem extends Course {
  pk: string;  // ENT#{appId}#{entityId}
  sk: string;  // COURSE#{courseId}
  gsi1pk?: string;  // CATEGORY#{category}
  gsi1sk?: string;  // {createdAt}#{courseId}
}

// ============================================
// Module Entity
// ============================================

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;           // 1, 2, 3...
  lessonCount: number;     // Denormalized count
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleInput {
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes?: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  order?: number;
  estimatedMinutes?: number;
}

// DynamoDB item
export interface ModuleItem extends Module {
  pk: string;  // COURSE#{courseId}
  sk: string;  // MODULE#{order}#{moduleId}
}

// ============================================
// Lesson Entity
// ============================================

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;         // Markdown content
  order: number;           // 1, 2, 3...
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonInput {
  moduleId: string;
  title: string;
  content: string;
  order: number;
  estimatedMinutes?: number;
}

export interface UpdateLessonInput {
  title?: string;
  content?: string;
  order?: number;
  estimatedMinutes?: number;
}

// DynamoDB item
export interface LessonItem extends Lesson {
  pk: string;  // MODULE#{moduleId}
  sk: string;  // LESSON#{order}#{lessonId}
}

// ============================================
// Quiz Entity
// ============================================

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;    // Percentage (e.g., 70)
  questionCount: number;   // Denormalized count
  timeLimit?: number;      // Minutes, optional
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizInput {
  moduleId: string;
  title: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
}

// DynamoDB item
export interface QuizItem extends Quiz {
  pk: string;  // MODULE#{moduleId}
  sk: string;  // QUIZ#{quizId}
}

// ============================================
// Quiz Question Entity
// ============================================

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];       // Array of answer options
  correctAnswer: number;   // Index of correct option (0-based)
  explanation?: string;    // Explanation shown after answer
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizQuestionInput {
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
}

export interface UpdateQuizQuestionInput {
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  order?: number;
}

// DynamoDB item
export interface QuizQuestionItem extends QuizQuestion {
  pk: string;  // QUIZ#{quizId}
  sk: string;  // QUESTION#{order}#{questionId}
}

// ============================================
// User Progress Entities
// ============================================

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  appId: string;
  entityId: string;
  status: ProgressStatus;
  completedModules: number;
  totalModules: number;
  percentComplete: number;
  lastAccessedAt: string;
  enrolledAt: string;
  completedAt?: string;
}

export interface CreateUserCourseProgressInput {
  userId: string;
  courseId: string;
  appId: string;
  entityId: string;
}

// DynamoDB item
export interface UserCourseProgressItem extends UserCourseProgress {
  pk: string;  // USER#{userId}
  sk: string;  // PROGRESS#COURSE#{courseId}
  gsi1pk?: string;  // COURSE#{courseId}
  gsi1sk?: string;  // USER#{userId}
}

export interface UserModuleProgress {
  userId: string;
  moduleId: string;
  courseId: string;
  status: ProgressStatus;
  lessonsCompleted: number;
  totalLessons: number;
  quizPassed: boolean;
  quizScore?: number;
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
}

export interface CreateUserModuleProgressInput {
  userId: string;
  moduleId: string;
  courseId: string;
}

// DynamoDB item
export interface UserModuleProgressItem extends UserModuleProgress {
  pk: string;  // USER#{userId}
  sk: string;  // PROGRESS#MODULE#{moduleId}
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;       // Seconds
}

// DynamoDB item
export interface UserLessonProgressItem extends UserLessonProgress {
  pk: string;  // USER#{userId}
  sk: string;  // PROGRESS#LESSON#{lessonId}
}

// ============================================
// Quiz Attempt Entity
// ============================================

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  score: number;           // Percentage
  passed: boolean;
  answers: {               // User's answers
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  timeSpent: number;       // Seconds
  attemptNumber: number;
  createdAt: string;
}

export interface CreateQuizAttemptInput {
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  timeSpent: number;
}

// DynamoDB item
export interface QuizAttemptItem extends QuizAttempt {
  pk: string;  // USER#{userId}
  sk: string;  // ATTEMPT#QUIZ#{quizId}#{attemptId}
  gsi1pk?: string;  // QUIZ#{quizId}
  gsi1sk?: string;  // USER#{userId}#{createdAt}
}

// ============================================
// Composite Types (for API responses)
// ============================================

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface FullCourse extends Course {
  modules: (Module & {
    lessons: Lesson[];
    quiz?: QuizWithQuestions;
  })[];
}

export interface CourseProgressSummary extends UserCourseProgress {
  course: Course;
  moduleProgress: UserModuleProgress[];
}

// ============================================
// Pagination
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}
