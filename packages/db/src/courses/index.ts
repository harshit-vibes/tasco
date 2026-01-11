// Types
export * from "./types";

// Course operations
export {
  createCourse,
  getCourse,
  listCourses,
  updateCourse,
  deleteCourse,
  incrementModuleCount,
  publishCourse,
  archiveCourse,
} from "./courses";

// Module operations
export {
  createModule,
  getModule,
  listModules,
  updateModule,
  deleteModule,
  incrementLessonCount,
} from "./modules";

// Lesson operations
export {
  createLesson,
  getLesson,
  listLessons,
  updateLesson,
  deleteLesson,
} from "./lessons";

// Quiz operations
export {
  createQuiz,
  getQuiz,
  getQuizForModule,
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  batchCreateQuizQuestions,
  listQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuizWithQuestions,
  incrementQuestionCount,
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
  // Quiz attempts
  recordQuizAttempt,
  listQuizAttempts,
  getBestQuizAttempt,
} from "./progress";
