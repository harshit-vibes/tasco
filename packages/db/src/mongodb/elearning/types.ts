/**
 * MongoDB Document Types for E-Learning
 * Migrated from DynamoDB - removes pk/sk fields, uses MongoDB native types
 */

import { ObjectId } from "mongodb";

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
// Course Types
// ============================================

export interface CourseDocument {
  _id?: ObjectId;
  appId: string;
  entityId: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  estimatedMinutes: number;
  moduleCount: number;
  isAIGenerated: boolean;
  coverImage?: string;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  appId: string;
  entityId: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  estimatedMinutes: number;
  moduleCount: number;
  isAIGenerated: boolean;
  coverImage?: string;
  tags?: string[];
  createdBy: string;
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

// ============================================
// Module Types
// ============================================

export interface ModuleDocument {
  _id?: ObjectId;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
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

// ============================================
// Lesson Types
// ============================================

export interface LessonDocument {
  _id?: ObjectId;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
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

// ============================================
// Quiz Types
// ============================================

export interface QuizDocument {
  _id?: ObjectId;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;
  questionCount: number;
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;
  questionCount: number;
  timeLimit?: number;
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

// ============================================
// Quiz Question Types
// ============================================

export interface QuizQuestionDocument {
  _id?: ObjectId;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
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

// ============================================
// User Progress Types
// ============================================

export interface UserCourseProgressDocument {
  _id?: ObjectId;
  userId: string;
  courseId: string;
  appId: string;
  entityId: string;
  status: ProgressStatus;
  completedModules: number;
  totalModules: number;
  percentComplete: number;
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface UserCourseProgress {
  id: string;
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

export interface UserModuleProgressDocument {
  _id?: ObjectId;
  userId: string;
  moduleId: string;
  courseId: string;
  status: ProgressStatus;
  lessonsCompleted: number;
  totalLessons: number;
  quizPassed: boolean;
  quizScore?: number;
  lastAccessedAt: Date;
  startedAt: Date;
  completedAt?: Date;
}

export interface UserModuleProgress {
  id: string;
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

export interface UserLessonProgressDocument {
  _id?: ObjectId;
  userId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number;
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
}

// ============================================
// Quiz Attempt Types
// ============================================

export interface QuizAttemptAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizAttemptDocument {
  _id?: ObjectId;
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  score: number;
  passed: boolean;
  answers: QuizAttemptAnswer[];
  timeSpent: number;
  attemptNumber: number;
  createdAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  score: number;
  passed: boolean;
  answers: QuizAttemptAnswer[];
  timeSpent: number;
  attemptNumber: number;
  createdAt: string;
}

export interface CreateQuizAttemptInput {
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  answers: QuizAttemptAnswer[];
  timeSpent: number;
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
  hasMore: boolean;
  total?: number;
}
