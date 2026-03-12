/**
 * MongoDB E-Learning Module Exports
 *
 * This module provides MongoDB operations for the e-learning app,
 * as part of the migration from DynamoDB.
 */

// Type exports
export type {
  // Course types
  CourseDocument,
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseCategory,
  CourseDifficulty,
  CourseStatus,
  // Module types
  ModuleDocument,
  Module,
  CreateModuleInput,
  UpdateModuleInput,
  // Lesson types
  LessonDocument,
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  // Quiz types
  QuizDocument,
  Quiz,
  CreateQuizInput,
  UpdateQuizInput,
  QuizQuestionDocument,
  QuizQuestion,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
  QuizWithQuestions,
  // Progress types
  UserCourseProgressDocument,
  UserCourseProgress,
  CreateUserCourseProgressInput,
  UserModuleProgressDocument,
  UserModuleProgress,
  CreateUserModuleProgressInput,
  UserLessonProgressDocument,
  UserLessonProgress,
  ProgressStatus,
  // Quiz attempt types
  QuizAttemptDocument,
  QuizAttempt,
  CreateQuizAttemptInput,
  QuizAttemptAnswer,
  // Composite types
  CourseWithModules,
  ModuleWithLessons,
  FullCourse,
  CourseProgressSummary,
  // Pagination
  PaginatedResult,
} from "./types";

// Course operations
export {
  createCourse,
  getCourse,
  getCourseById,
  listCourses,
  listAllCourses,
  updateCourse,
  deleteCourse,
  incrementModuleCount,
  publishCourse,
  archiveCourse,
  bulkCreateCourses,
} from "./courses";

// Module operations
export {
  createModule,
  getModule,
  listModules,
  updateModule,
  deleteModule,
  incrementLessonCount,
  getModulesCount,
  bulkCreateModules,
  deleteModulesByCourse,
} from "./modules";

// Lesson operations
export {
  createLesson,
  getLesson,
  listLessons,
  updateLesson,
  deleteLesson,
  getLessonsCount,
  bulkCreateLessons,
  deleteLessonsByModule,
} from "./lessons";

// Quiz operations
export {
  createQuiz,
  getQuiz,
  getQuizForModule,
  getQuizWithQuestions,
  updateQuiz,
  deleteQuiz,
  incrementQuestionCount,
  // Question operations
  createQuizQuestion,
  batchCreateQuizQuestions,
  getQuizQuestion,
  listQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  deleteQuestionsByQuiz,
  deleteQuizWithQuestions,
} from "./quizzes";

// Progress operations
export {
  // Course progress
  enrollInCourse,
  getCourseProgress,
  listUserCourseProgress,
  updateCourseProgress,
  // Module progress
  startModule,
  getModuleProgress,
  listUserModuleProgress,
  updateModuleProgress,
  // Lesson progress
  updateLessonProgress,
  getLessonProgress,
  listLessonProgress,
  // Quiz attempts
  recordQuizAttempt,
  listQuizAttempts,
  getBestQuizAttempt,
  getLatestQuizAttempt,
} from "./progress";
