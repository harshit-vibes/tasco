import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import {
  TABLES,
  buildUserProgressPK,
  buildCourseProgressSK,
  buildModuleProgressSK,
  buildLessonProgressSK,
  buildQuizAttemptSK,
} from "../tables";
import type {
  UserCourseProgress,
  UserCourseProgressItem,
  CreateUserCourseProgressInput,
  UserModuleProgress,
  UserModuleProgressItem,
  CreateUserModuleProgressInput,
  UserLessonProgress,
  UserLessonProgressItem,
  QuizAttempt,
  QuizAttemptItem,
  CreateQuizAttemptInput,
  ProgressStatus,
  PaginatedResult,
} from "./types";

// ============================================
// ID Generators
// ============================================

const generateAttemptId = (): string => {
  return `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ============================================
// Converters
// ============================================

const itemToCourseProgress = (item: UserCourseProgressItem): UserCourseProgress => ({
  userId: item.userId,
  courseId: item.courseId,
  appId: item.appId,
  entityId: item.entityId,
  status: item.status,
  completedModules: item.completedModules,
  totalModules: item.totalModules,
  percentComplete: item.percentComplete,
  lastAccessedAt: item.lastAccessedAt,
  enrolledAt: item.enrolledAt,
  completedAt: item.completedAt,
});

const itemToModuleProgress = (item: UserModuleProgressItem): UserModuleProgress => ({
  userId: item.userId,
  moduleId: item.moduleId,
  courseId: item.courseId,
  status: item.status,
  lessonsCompleted: item.lessonsCompleted,
  totalLessons: item.totalLessons,
  quizPassed: item.quizPassed,
  quizScore: item.quizScore,
  lastAccessedAt: item.lastAccessedAt,
  startedAt: item.startedAt,
  completedAt: item.completedAt,
});

const itemToLessonProgress = (item: UserLessonProgressItem): UserLessonProgress => ({
  userId: item.userId,
  lessonId: item.lessonId,
  moduleId: item.moduleId,
  completed: item.completed,
  completedAt: item.completedAt,
  timeSpent: item.timeSpent,
});

const itemToQuizAttempt = (item: QuizAttemptItem): QuizAttempt => ({
  id: item.id,
  userId: item.userId,
  quizId: item.quizId,
  moduleId: item.moduleId,
  courseId: item.courseId,
  score: item.score,
  passed: item.passed,
  answers: item.answers,
  timeSpent: item.timeSpent,
  attemptNumber: item.attemptNumber,
  createdAt: item.createdAt,
});

// ============================================
// Course Progress
// ============================================

/**
 * Enroll a user in a course (create progress record)
 */
export async function enrollInCourse(
  input: CreateUserCourseProgressInput,
  totalModules: number
): Promise<UserCourseProgress> {
  const now = new Date().toISOString();

  const item: UserCourseProgressItem = {
    pk: buildUserProgressPK(input.userId),
    sk: buildCourseProgressSK(input.courseId),
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
    // GSI for querying by course
    gsi1pk: `COURSE#${input.courseId}`,
    gsi1sk: `USER#${input.userId}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToCourseProgress(item);
}

/**
 * Get user's progress for a course
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<UserCourseProgress | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildCourseProgressSK(courseId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToCourseProgress(result.Item as UserCourseProgressItem);
}

/**
 * List all course progress for a user
 */
export async function listUserCourseProgress(
  userId: string
): Promise<PaginatedResult<UserCourseProgress>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :progressPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildUserProgressPK(userId),
        ":progressPrefix": "PROGRESS#COURSE#",
      },
      ScanIndexForward: false,
    })
  );

  const items = (result.Items || []) as UserCourseProgressItem[];

  return {
    items: items.map(itemToCourseProgress),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
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
  const updateExpressions: string[] = ["#lastAccessedAt = :lastAccessedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#lastAccessedAt": "lastAccessedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":lastAccessedAt": new Date().toISOString(),
  };

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.completedModules !== undefined) {
    updateExpressions.push("#completedModules = :completedModules");
    expressionAttributeNames["#completedModules"] = "completedModules";
    expressionAttributeValues[":completedModules"] = updates.completedModules;
  }

  if (updates.percentComplete !== undefined) {
    updateExpressions.push("#percentComplete = :percentComplete");
    expressionAttributeNames["#percentComplete"] = "percentComplete";
    expressionAttributeValues[":percentComplete"] = updates.percentComplete;
  }

  if (updates.completedAt !== undefined) {
    updateExpressions.push("#completedAt = :completedAt");
    expressionAttributeNames["#completedAt"] = "completedAt";
    expressionAttributeValues[":completedAt"] = updates.completedAt;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildCourseProgressSK(courseId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToCourseProgress(result.Attributes as UserCourseProgressItem);
}

// ============================================
// Module Progress
// ============================================

/**
 * Start a module (create progress record)
 */
export async function startModule(
  input: CreateUserModuleProgressInput,
  totalLessons: number
): Promise<UserModuleProgress> {
  const now = new Date().toISOString();

  const item: UserModuleProgressItem = {
    pk: buildUserProgressPK(input.userId),
    sk: buildModuleProgressSK(input.moduleId),
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

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToModuleProgress(item);
}

/**
 * Get user's progress for a module
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<UserModuleProgress | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildModuleProgressSK(moduleId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToModuleProgress(result.Item as UserModuleProgressItem);
}

/**
 * List all module progress for a user (for a specific course or all)
 */
export async function listUserModuleProgress(
  userId: string
): Promise<PaginatedResult<UserModuleProgress>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :progressPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildUserProgressPK(userId),
        ":progressPrefix": "PROGRESS#MODULE#",
      },
      ScanIndexForward: false,
    })
  );

  const items = (result.Items || []) as UserModuleProgressItem[];

  return {
    items: items.map(itemToModuleProgress),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
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
  const updateExpressions: string[] = ["#lastAccessedAt = :lastAccessedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#lastAccessedAt": "lastAccessedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":lastAccessedAt": new Date().toISOString(),
  };

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.lessonsCompleted !== undefined) {
    updateExpressions.push("#lessonsCompleted = :lessonsCompleted");
    expressionAttributeNames["#lessonsCompleted"] = "lessonsCompleted";
    expressionAttributeValues[":lessonsCompleted"] = updates.lessonsCompleted;
  }

  if (updates.quizPassed !== undefined) {
    updateExpressions.push("#quizPassed = :quizPassed");
    expressionAttributeNames["#quizPassed"] = "quizPassed";
    expressionAttributeValues[":quizPassed"] = updates.quizPassed;
  }

  if (updates.quizScore !== undefined) {
    updateExpressions.push("#quizScore = :quizScore");
    expressionAttributeNames["#quizScore"] = "quizScore";
    expressionAttributeValues[":quizScore"] = updates.quizScore;
  }

  if (updates.completedAt !== undefined) {
    updateExpressions.push("#completedAt = :completedAt");
    expressionAttributeNames["#completedAt"] = "completedAt";
    expressionAttributeValues[":completedAt"] = updates.completedAt;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildModuleProgressSK(moduleId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToModuleProgress(result.Attributes as UserModuleProgressItem);
}

// ============================================
// Lesson Progress
// ============================================

/**
 * Mark a lesson as completed or update time spent
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
  const now = new Date().toISOString();

  // First check if record exists
  const existingResult = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildLessonProgressSK(lessonId),
      },
    })
  );

  if (!existingResult.Item) {
    // Create new record
    const item: UserLessonProgressItem = {
      pk: buildUserProgressPK(userId),
      sk: buildLessonProgressSK(lessonId),
      userId,
      lessonId,
      moduleId,
      completed: updates.completed || false,
      completedAt: updates.completed ? now : undefined,
      timeSpent: updates.timeSpent || 0,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLES.COURSES,
        Item: item,
      })
    );

    return itemToLessonProgress(item);
  }

  // Update existing record
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  if (updates.completed !== undefined) {
    updateExpressions.push("#completed = :completed");
    expressionAttributeNames["#completed"] = "completed";
    expressionAttributeValues[":completed"] = updates.completed;

    if (updates.completed) {
      updateExpressions.push("#completedAt = :completedAt");
      expressionAttributeNames["#completedAt"] = "completedAt";
      expressionAttributeValues[":completedAt"] = now;
    }
  }

  if (updates.timeSpent !== undefined) {
    updateExpressions.push("#timeSpent = #timeSpent + :timeSpent");
    expressionAttributeNames["#timeSpent"] = "timeSpent";
    expressionAttributeValues[":timeSpent"] = updates.timeSpent;
  }

  if (updateExpressions.length === 0) {
    return itemToLessonProgress(existingResult.Item as UserLessonProgressItem);
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildLessonProgressSK(lessonId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return itemToLessonProgress(result.Attributes as UserLessonProgressItem);
}

/**
 * Get lesson progress
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<UserLessonProgress | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildUserProgressPK(userId),
        sk: buildLessonProgressSK(lessonId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToLessonProgress(result.Item as UserLessonProgressItem);
}

// ============================================
// Quiz Attempts
// ============================================

/**
 * Record a quiz attempt
 */
export async function recordQuizAttempt(
  input: CreateQuizAttemptInput,
  passingScore: number
): Promise<QuizAttempt> {
  const id = generateAttemptId();
  const now = new Date().toISOString();

  // Calculate score
  const correctAnswers = input.answers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctAnswers / input.answers.length) * 100);
  const passed = score >= passingScore;

  // Count previous attempts
  const { items: previousAttempts } = await listQuizAttempts(
    input.userId,
    input.quizId
  );
  const attemptNumber = previousAttempts.length + 1;

  const item: QuizAttemptItem = {
    pk: buildUserProgressPK(input.userId),
    sk: buildQuizAttemptSK(input.quizId, id),
    id,
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
    // GSI for querying by quiz
    gsi1pk: `QUIZ#${input.quizId}`,
    gsi1sk: `USER#${input.userId}#${now}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToQuizAttempt(item);
}

/**
 * List quiz attempts for a user
 */
export async function listQuizAttempts(
  userId: string,
  quizId?: string
): Promise<PaginatedResult<QuizAttempt>> {
  const keyPrefix = quizId
    ? `ATTEMPT#QUIZ#${quizId}`
    : "ATTEMPT#QUIZ#";

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :attemptPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildUserProgressPK(userId),
        ":attemptPrefix": keyPrefix,
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  const items = (result.Items || []) as QuizAttemptItem[];

  return {
    items: items.map(itemToQuizAttempt),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get the best quiz attempt for a user
 */
export async function getBestQuizAttempt(
  userId: string,
  quizId: string
): Promise<QuizAttempt | null> {
  const { items } = await listQuizAttempts(userId, quizId);

  if (items.length === 0) {
    return null;
  }

  // Return the attempt with highest score
  return items.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}
