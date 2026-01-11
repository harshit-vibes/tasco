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
  buildCourseListPK,
  buildCourseSK,
} from "../tables";
import type {
  Course,
  CourseItem,
  CreateCourseInput,
  UpdateCourseInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique course ID
 */
const generateId = (): string => {
  return `course_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Course
 */
const itemToCourse = (item: CourseItem): Course => ({
  id: item.id,
  appId: item.appId,
  entityId: item.entityId,
  title: item.title,
  description: item.description,
  category: item.category,
  difficulty: item.difficulty,
  status: item.status,
  estimatedMinutes: item.estimatedMinutes,
  moduleCount: item.moduleCount,
  isAIGenerated: item.isAIGenerated,
  coverImage: item.coverImage,
  tags: item.tags,
  createdBy: item.createdBy,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: CourseItem = {
    pk: buildCourseListPK(input.appId, input.entityId),
    sk: buildCourseSK(id),
    id,
    appId: input.appId,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: input.difficulty,
    status: "draft",
    estimatedMinutes: input.estimatedMinutes || 0,
    moduleCount: 0,
    isAIGenerated: input.isAIGenerated || false,
    coverImage: input.coverImage,
    tags: input.tags,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    // GSI for category-based queries
    gsi1pk: `CATEGORY#${input.category}`,
    gsi1sk: `${now}#${id}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToCourse(item);
}

/**
 * Get a course by ID
 */
export async function getCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildCourseListPK(appId, entityId),
        sk: buildCourseSK(courseId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToCourse(result.Item as CourseItem);
}

/**
 * List courses for an app/entity
 */
export async function listCourses(
  appId: string,
  entityId: string,
  options?: {
    limit?: number;
    lastKey?: Record<string, unknown>;
    status?: string;
  }
): Promise<PaginatedResult<Course>> {
  const { limit = 50, lastKey, status } = options || {};

  let filterExpression: string | undefined;
  let expressionAttributeValues: Record<string, unknown> = {
    ":pk": buildCourseListPK(appId, entityId),
    ":coursePrefix": "COURSE#",
  };

  if (status) {
    filterExpression = "#status = :status";
    expressionAttributeValues[":status"] = status;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :coursePrefix)",
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: status ? { "#status": "status" } : undefined,
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const items = (result.Items || []) as CourseItem[];

  return {
    items: items.map(itemToCourse),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Update a course
 */
export async function updateCourse(
  appId: string,
  entityId: string,
  courseId: string,
  updates: UpdateCourseInput
): Promise<Course | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    updateExpressions.push("#title = :title");
    expressionAttributeNames["#title"] = "title";
    expressionAttributeValues[":title"] = updates.title;
  }

  if (updates.description !== undefined) {
    updateExpressions.push("#description = :description");
    expressionAttributeNames["#description"] = "description";
    expressionAttributeValues[":description"] = updates.description;
  }

  if (updates.category !== undefined) {
    updateExpressions.push("#category = :category");
    expressionAttributeNames["#category"] = "category";
    expressionAttributeValues[":category"] = updates.category;
  }

  if (updates.difficulty !== undefined) {
    updateExpressions.push("#difficulty = :difficulty");
    expressionAttributeNames["#difficulty"] = "difficulty";
    expressionAttributeValues[":difficulty"] = updates.difficulty;
  }

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.estimatedMinutes !== undefined) {
    updateExpressions.push("#estimatedMinutes = :estimatedMinutes");
    expressionAttributeNames["#estimatedMinutes"] = "estimatedMinutes";
    expressionAttributeValues[":estimatedMinutes"] = updates.estimatedMinutes;
  }

  if (updates.coverImage !== undefined) {
    updateExpressions.push("#coverImage = :coverImage");
    expressionAttributeNames["#coverImage"] = "coverImage";
    expressionAttributeValues[":coverImage"] = updates.coverImage;
  }

  if (updates.tags !== undefined) {
    updateExpressions.push("#tags = :tags");
    expressionAttributeNames["#tags"] = "tags";
    expressionAttributeValues[":tags"] = updates.tags;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildCourseListPK(appId, entityId),
        sk: buildCourseSK(courseId),
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

  return itemToCourse(result.Attributes as CourseItem);
}

/**
 * Delete a course (and all its modules, lessons, quizzes)
 * Note: In production, you'd also delete child items in a transaction
 */
export async function deleteCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildCourseListPK(appId, entityId),
        sk: buildCourseSK(courseId),
      },
    })
  );
}

/**
 * Increment module count for a course
 */
export async function incrementModuleCount(
  appId: string,
  entityId: string,
  courseId: string,
  increment: number = 1
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildCourseListPK(appId, entityId),
        sk: buildCourseSK(courseId),
      },
      UpdateExpression:
        "SET #moduleCount = if_not_exists(#moduleCount, :zero) + :inc, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#moduleCount": "moduleCount",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":inc": increment,
        ":zero": 0,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}

/**
 * Publish a course (change status to published)
 */
export async function publishCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  return updateCourse(appId, entityId, courseId, { status: "published" });
}

/**
 * Archive a course
 */
export async function archiveCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  return updateCourse(appId, entityId, courseId, { status: "archived" });
}
