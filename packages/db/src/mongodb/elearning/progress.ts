/**
 * MongoDB User Progress Operations for E-Learning
 */

import { getCollection, toObjectId } from "../client";
import type {
  UserCourseProgressDocument,
  UserCourseProgress,
  CreateUserCourseProgressInput,
  UserModuleProgressDocument,
  UserModuleProgress,
  CreateUserModuleProgressInput,
  UserLessonProgressDocument,
  UserLessonProgress,
  QuizAttemptDocument,
  QuizAttempt,
  CreateQuizAttemptInput,
  ProgressStatus,
  PaginatedResult,
} from "./types";

const COURSE_PROGRESS_COLLECTION = "userCourseProgress";
const MODULE_PROGRESS_COLLECTION = "userModuleProgress";
const LESSON_PROGRESS_COLLECTION = "userLessonProgress";
const QUIZ_ATTEMPT_COLLECTION = "quizAttempts";

// ============================================
// Response Converters
// ============================================

function courseProgressToResponse(doc: UserCourseProgressDocument): UserCourseProgress {
  return {
    id: doc._id?.toHexString() || "",
    userId: doc.userId,
    courseId: doc.courseId,
    appId: doc.appId,
    entityId: doc.entityId,
    status: doc.status,
    completedModules: doc.completedModules,
    totalModules: doc.totalModules,
    percentComplete: doc.percentComplete,
    lastAccessedAt: doc.lastAccessedAt.toISOString(),
    enrolledAt: doc.enrolledAt.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
  };
}

function moduleProgressToResponse(doc: UserModuleProgressDocument): UserModuleProgress {
  return {
    id: doc._id?.toHexString() || "",
    userId: doc.userId,
    moduleId: doc.moduleId,
    courseId: doc.courseId,
    status: doc.status,
    lessonsCompleted: doc.lessonsCompleted,
    totalLessons: doc.totalLessons,
    quizPassed: doc.quizPassed,
    quizScore: doc.quizScore,
    lastAccessedAt: doc.lastAccessedAt.toISOString(),
    startedAt: doc.startedAt.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
  };
}

function lessonProgressToResponse(doc: UserLessonProgressDocument): UserLessonProgress {
  return {
    id: doc._id?.toHexString() || "",
    userId: doc.userId,
    lessonId: doc.lessonId,
    moduleId: doc.moduleId,
    completed: doc.completed,
    completedAt: doc.completedAt?.toISOString(),
    timeSpent: doc.timeSpent,
  };
}

function quizAttemptToResponse(doc: QuizAttemptDocument): QuizAttempt {
  return {
    id: doc._id?.toHexString() || "",
    userId: doc.userId,
    quizId: doc.quizId,
    moduleId: doc.moduleId,
    courseId: doc.courseId,
    score: doc.score,
    passed: doc.passed,
    answers: doc.answers,
    timeSpent: doc.timeSpent,
    attemptNumber: doc.attemptNumber,
    createdAt: doc.createdAt.toISOString(),
  };
}

// ============================================
// Course Progress Operations
// ============================================

/**
 * Enroll a user in a course (create progress record)
 */
export async function enrollInCourse(
  input: CreateUserCourseProgressInput,
  totalModules: number
): Promise<UserCourseProgress> {
  const collection = await getCollection<UserCourseProgressDocument>(COURSE_PROGRESS_COLLECTION);
  const now = new Date();

  const doc: UserCourseProgressDocument = {
    userId: input.userId,
    courseId: input.courseId,
    appId: input.appId,
    entityId: input.entityId,
    status: "not-started",
    completedModules: 0,
    totalModules,
    percentComplete: 0,
    lastAccessedAt: now,
    enrolledAt: now,
  };

  const result = await collection.insertOne(doc);
  return courseProgressToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get user's progress for a course
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<UserCourseProgress | null> {
  const collection = await getCollection<UserCourseProgressDocument>(COURSE_PROGRESS_COLLECTION);
  const doc = await collection.findOne({ userId, courseId });
  return doc ? courseProgressToResponse(doc) : null;
}

/**
 * List all course progress for a user
 */
export async function listUserCourseProgress(
  userId: string
): Promise<PaginatedResult<UserCourseProgress>> {
  const collection = await getCollection<UserCourseProgressDocument>(COURSE_PROGRESS_COLLECTION);

  const [docs, total] = await Promise.all([
    collection.find({ userId }).sort({ lastAccessedAt: -1 }).toArray(),
    collection.countDocuments({ userId }),
  ]);

  return {
    items: docs.map(courseProgressToResponse),
    hasMore: false,
    total,
  };
}

/**
 * Update course progress
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  updates: {
    status?: ProgressStatus;
    completedModules?: number;
    percentComplete?: number;
    completedAt?: string;
  }
): Promise<UserCourseProgress | null> {
  const collection = await getCollection<UserCourseProgressDocument>(COURSE_PROGRESS_COLLECTION);

  const updateDoc: Record<string, unknown> = {
    lastAccessedAt: new Date(),
  };

  if (updates.status !== undefined) updateDoc.status = updates.status;
  if (updates.completedModules !== undefined) updateDoc.completedModules = updates.completedModules;
  if (updates.percentComplete !== undefined) updateDoc.percentComplete = updates.percentComplete;
  if (updates.completedAt !== undefined) updateDoc.completedAt = new Date(updates.completedAt);

  const result = await collection.findOneAndUpdate(
    { userId, courseId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? courseProgressToResponse(result) : null;
}

// ============================================
// Module Progress Operations
// ============================================

/**
 * Start a module (create progress record)
 */
export async function startModule(
  input: CreateUserModuleProgressInput,
  totalLessons: number
): Promise<UserModuleProgress> {
  const collection = await getCollection<UserModuleProgressDocument>(MODULE_PROGRESS_COLLECTION);
  const now = new Date();

  const doc: UserModuleProgressDocument = {
    userId: input.userId,
    moduleId: input.moduleId,
    courseId: input.courseId,
    status: "in-progress",
    lessonsCompleted: 0,
    totalLessons,
    quizPassed: false,
    lastAccessedAt: now,
    startedAt: now,
  };

  const result = await collection.insertOne(doc);
  return moduleProgressToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get user's progress for a module
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<UserModuleProgress | null> {
  const collection = await getCollection<UserModuleProgressDocument>(MODULE_PROGRESS_COLLECTION);
  const doc = await collection.findOne({ userId, moduleId });
  return doc ? moduleProgressToResponse(doc) : null;
}

/**
 * List all module progress for a user
 */
export async function listUserModuleProgress(
  userId: string,
  courseId?: string
): Promise<PaginatedResult<UserModuleProgress>> {
  const collection = await getCollection<UserModuleProgressDocument>(MODULE_PROGRESS_COLLECTION);

  const filter: Record<string, unknown> = { userId };
  if (courseId) filter.courseId = courseId;

  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ startedAt: -1 }).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(moduleProgressToResponse),
    hasMore: false,
    total,
  };
}

/**
 * Update module progress
 */
export async function updateModuleProgress(
  userId: string,
  moduleId: string,
  updates: {
    status?: ProgressStatus;
    lessonsCompleted?: number;
    quizPassed?: boolean;
    quizScore?: number;
    completedAt?: string;
  }
): Promise<UserModuleProgress | null> {
  const collection = await getCollection<UserModuleProgressDocument>(MODULE_PROGRESS_COLLECTION);

  const updateDoc: Record<string, unknown> = {
    lastAccessedAt: new Date(),
  };

  if (updates.status !== undefined) updateDoc.status = updates.status;
  if (updates.lessonsCompleted !== undefined) updateDoc.lessonsCompleted = updates.lessonsCompleted;
  if (updates.quizPassed !== undefined) updateDoc.quizPassed = updates.quizPassed;
  if (updates.quizScore !== undefined) updateDoc.quizScore = updates.quizScore;
  if (updates.completedAt !== undefined) updateDoc.completedAt = new Date(updates.completedAt);

  const result = await collection.findOneAndUpdate(
    { userId, moduleId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? moduleProgressToResponse(result) : null;
}

// ============================================
// Lesson Progress Operations
// ============================================

/**
 * Update lesson progress (upsert pattern)
 */
export async function updateLessonProgress(
  userId: string,
  moduleId: string,
  lessonId: string,
  updates: {
    completed?: boolean;
    timeSpent?: number;
  }
): Promise<UserLessonProgress> {
  const collection = await getCollection<UserLessonProgressDocument>(LESSON_PROGRESS_COLLECTION);
  const now = new Date();

  const existingDoc = await collection.findOne({ userId, lessonId });

  if (!existingDoc) {
    // Create new record
    const doc: UserLessonProgressDocument = {
      userId,
      lessonId,
      moduleId,
      completed: updates.completed || false,
      completedAt: updates.completed ? now : undefined,
      timeSpent: updates.timeSpent || 0,
    };

    const result = await collection.insertOne(doc);
    return lessonProgressToResponse({ ...doc, _id: result.insertedId });
  }

  // Update existing record
  const updateDoc: Record<string, unknown> = {};

  if (updates.completed !== undefined) {
    updateDoc.completed = updates.completed;
    if (updates.completed) {
      updateDoc.completedAt = now;
    }
  }

  if (updates.timeSpent !== undefined) {
    // Accumulate time spent
    updateDoc.timeSpent = existingDoc.timeSpent + updates.timeSpent;
  }

  if (Object.keys(updateDoc).length === 0) {
    return lessonProgressToResponse(existingDoc);
  }

  const result = await collection.findOneAndUpdate(
    { userId, lessonId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return lessonProgressToResponse(result!);
}

/**
 * Get lesson progress
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<UserLessonProgress | null> {
  const collection = await getCollection<UserLessonProgressDocument>(LESSON_PROGRESS_COLLECTION);
  const doc = await collection.findOne({ userId, lessonId });
  return doc ? lessonProgressToResponse(doc) : null;
}

/**
 * List lesson progress for a module
 */
export async function listLessonProgress(
  userId: string,
  moduleId: string
): Promise<PaginatedResult<UserLessonProgress>> {
  const collection = await getCollection<UserLessonProgressDocument>(LESSON_PROGRESS_COLLECTION);

  const [docs, total] = await Promise.all([
    collection.find({ userId, moduleId }).toArray(),
    collection.countDocuments({ userId, moduleId }),
  ]);

  return {
    items: docs.map(lessonProgressToResponse),
    hasMore: false,
    total,
  };
}

// ============================================
// Quiz Attempt Operations
// ============================================

/**
 * Record a quiz attempt
 */
export async function recordQuizAttempt(
  input: CreateQuizAttemptInput,
  passingScore: number
): Promise<QuizAttempt> {
  const collection = await getCollection<QuizAttemptDocument>(QUIZ_ATTEMPT_COLLECTION);
  const now = new Date();

  // Calculate score
  const correctAnswers = input.answers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctAnswers / input.answers.length) * 100);
  const passed = score >= passingScore;

  // Count previous attempts
  const previousAttempts = await collection.countDocuments({
    userId: input.userId,
    quizId: input.quizId,
  });
  const attemptNumber = previousAttempts + 1;

  const doc: QuizAttemptDocument = {
    userId: input.userId,
    quizId: input.quizId,
    moduleId: input.moduleId,
    courseId: input.courseId,
    score,
    passed,
    answers: input.answers,
    timeSpent: input.timeSpent,
    attemptNumber,
    createdAt: now,
  };

  const result = await collection.insertOne(doc);
  return quizAttemptToResponse({ ...doc, _id: result.insertedId });
}

/**
 * List quiz attempts for a user
 */
export async function listQuizAttempts(
  userId: string,
  quizId?: string
): Promise<PaginatedResult<QuizAttempt>> {
  const collection = await getCollection<QuizAttemptDocument>(QUIZ_ATTEMPT_COLLECTION);

  const filter: Record<string, unknown> = { userId };
  if (quizId) filter.quizId = quizId;

  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(quizAttemptToResponse),
    hasMore: false,
    total,
  };
}

/**
 * Get the best quiz attempt for a user
 */
export async function getBestQuizAttempt(
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> {
  const collection = await getCollection<QuizAttemptDocument>(QUIZ_ATTEMPT_COLLECTION);

  const doc = await collection.findOne(
    { userId, quizId },
    { sort: { score: -1 } }
  );

  return doc ? quizAttemptToResponse(doc) : null;
}

/**
 * Get latest quiz attempt
 */
export async function getLatestQuizAttempt(
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> {
  const collection = await getCollection<QuizAttemptDocument>(QUIZ_ATTEMPT_COLLECTION);

  const doc = await collection.findOne(
    { userId, quizId },
    { sort: { createdAt: -1 } }
  );

  return doc ? quizAttemptToResponse(doc) : null;
}
