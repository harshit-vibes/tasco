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
  buildModulePK,
  buildModuleSK,
} from "../tables";
import type {
  Module,
  ModuleItem,
  CreateModuleInput,
  UpdateModuleInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique module ID
 */
const generateId = (): string => {
  return `module_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Module
 */
const itemToModule = (item: ModuleItem): Module => ({
  id: item.id,
  courseId: item.courseId,
  title: item.title,
  description: item.description,
  order: item.order,
  lessonCount: item.lessonCount,
  estimatedMinutes: item.estimatedMinutes,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Create a new module
 */
export async function createModule(input: CreateModuleInput): Promise<Module> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: ModuleItem = {
    pk: buildModulePK(input.courseId),
    sk: buildModuleSK(input.order, id),
    id,
    courseId: input.courseId,
    title: input.title,
    description: input.description,
    order: input.order,
    lessonCount: 0,
    estimatedMinutes: input.estimatedMinutes || 0,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToModule(item);
}

/**
 * Get a module by ID
 */
export async function getModule(
  courseId: string,
  order: number,
  moduleId: string
): Promise<Module | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildModulePK(courseId),
        sk: buildModuleSK(order, moduleId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToModule(result.Item as ModuleItem);
}

/**
 * List modules for a course (ordered by order number)
 */
export async function listModules(
  courseId: string,
  limit: number = 50
): Promise<PaginatedResult<Module>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :modulePrefix)",
      ExpressionAttributeValues: {
        ":pk": buildModulePK(courseId),
        ":modulePrefix": "MODULE#",
      },
      ScanIndexForward: true, // Ascending order (by order number)
      Limit: limit,
    })
  );

  const items = (result.Items || []) as ModuleItem[];

  return {
    items: items.map(itemToModule),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Update a module
 */
export async function updateModule(
  courseId: string,
  order: number,
  moduleId: string,
  updates: UpdateModuleInput
): Promise<Module | null> {
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

  if (updates.estimatedMinutes !== undefined) {
    updateExpressions.push("#estimatedMinutes = :estimatedMinutes");
    expressionAttributeNames["#estimatedMinutes"] = "estimatedMinutes";
    expressionAttributeValues[":estimatedMinutes"] = updates.estimatedMinutes;
  }

  // Note: Updating order requires deleting and recreating the item
  // because order is part of the SK

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildModulePK(courseId),
        sk: buildModuleSK(order, moduleId),
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

  return itemToModule(result.Attributes as ModuleItem);
}

/**
 * Delete a module
 */
export async function deleteModule(
  courseId: string,
  order: number,
  moduleId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildModulePK(courseId),
        sk: buildModuleSK(order, moduleId),
      },
    })
  );
}

/**
 * Increment lesson count for a module
 */
export async function incrementLessonCount(
  courseId: string,
  order: number,
  moduleId: string,
  increment: number = 1
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildModulePK(courseId),
        sk: buildModuleSK(order, moduleId),
      },
      UpdateExpression:
        "SET #lessonCount = if_not_exists(#lessonCount, :zero) + :inc, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#lessonCount": "lessonCount",
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
