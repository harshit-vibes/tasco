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
  buildLessonPK,
  buildLessonSK,
} from "../tables";
import type {
  Lesson,
  LessonItem,
  CreateLessonInput,
  UpdateLessonInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique lesson ID
 */
const generateId = (): string => {
  return `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Lesson
 */
const itemToLesson = (item: LessonItem): Lesson => ({
  id: item.id,
  moduleId: item.moduleId,
  title: item.title,
  content: item.content,
  order: item.order,
  estimatedMinutes: item.estimatedMinutes,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Create a new lesson
 */
export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: LessonItem = {
    pk: buildLessonPK(input.moduleId),
    sk: buildLessonSK(input.order, id),
    id,
    moduleId: input.moduleId,
    title: input.title,
    content: input.content,
    order: input.order,
    estimatedMinutes: input.estimatedMinutes || 5,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToLesson(item);
}

/**
 * Get a lesson by ID
 */
export async function getLesson(
  moduleId: string,
  order: number,
  lessonId: string
): Promise<Lesson | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildLessonPK(moduleId),
        sk: buildLessonSK(order, lessonId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToLesson(result.Item as LessonItem);
}

/**
 * List lessons for a module (ordered by order number)
 */
export async function listLessons(
  moduleId: string,
  limit: number = 50
): Promise<PaginatedResult<Lesson>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :lessonPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildLessonPK(moduleId),
        ":lessonPrefix": "LESSON#",
      },
      ScanIndexForward: true, // Ascending order
      Limit: limit,
    })
  );

  const items = (result.Items || []) as LessonItem[];

  return {
    items: items.map(itemToLesson),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Update a lesson
 */
export async function updateLesson(
  moduleId: string,
  order: number,
  lessonId: string,
  updates: UpdateLessonInput
): Promise<Lesson | null> {
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

  if (updates.content !== undefined) {
    updateExpressions.push("#content = :content");
    expressionAttributeNames["#content"] = "content";
    expressionAttributeValues[":content"] = updates.content;
  }

  if (updates.estimatedMinutes !== undefined) {
    updateExpressions.push("#estimatedMinutes = :estimatedMinutes");
    expressionAttributeNames["#estimatedMinutes"] = "estimatedMinutes";
    expressionAttributeValues[":estimatedMinutes"] = updates.estimatedMinutes;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildLessonPK(moduleId),
        sk: buildLessonSK(order, lessonId),
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

  return itemToLesson(result.Attributes as LessonItem);
}

/**
 * Delete a lesson
 */
export async function deleteLesson(
  moduleId: string,
  order: number,
  lessonId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildLessonPK(moduleId),
        sk: buildLessonSK(order, lessonId),
      },
    })
  );
}
