import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, ENTITY_ALL_PK } from "../tables";
import type {
  Entity,
  EntityItem,
  CreateEntityInput,
  UpdateEntityInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique entity ID from name (slug format)
 */
const generateId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Convert DynamoDB item to Entity
 */
const itemToEntity = (item: EntityItem): Entity => ({
  id: item.id,
  name: item.name,
  shortName: item.shortName,
  type: item.type,
  parentId: item.parentId,
  metadata: item.metadata,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Create a new entity
 */
export async function createEntity(input: CreateEntityInput): Promise<Entity> {
  const id = input.id || generateId(input.name);
  const now = new Date().toISOString();

  const item: EntityItem = {
    pk: ENTITY_ALL_PK,
    sk: id,
    id,
    name: input.name,
    shortName: input.shortName,
    type: input.type,
    parentId: input.parentId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.ENTITIES,
      Item: item,
    })
  );

  return itemToEntity(item);
}

/**
 * Get a single entity by ID
 */
export async function getEntity(entityId: string): Promise<Entity | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.ENTITIES,
      Key: {
        pk: ENTITY_ALL_PK,
        sk: entityId,
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToEntity(result.Item as EntityItem);
}

/**
 * List all entities
 */
export async function listEntities(
  limit: number = 100,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Entity>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.ENTITIES,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": ENTITY_ALL_PK,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  const items = (result.Items || []) as EntityItem[];

  return {
    items: items.map(itemToEntity),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * List entities by type
 */
export async function listEntitiesByType(
  type: string
): Promise<Entity[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.ENTITIES,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#type = :type",
      ExpressionAttributeNames: {
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":pk": ENTITY_ALL_PK,
        ":type": type,
      },
    })
  );

  const items = (result.Items || []) as EntityItem[];
  return items.map(itemToEntity);
}

/**
 * List entities by parent ID
 */
export async function listEntitiesByParent(
  parentId: string
): Promise<Entity[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.ENTITIES,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "parentId = :parentId",
      ExpressionAttributeValues: {
        ":pk": ENTITY_ALL_PK,
        ":parentId": parentId,
      },
    })
  );

  const items = (result.Items || []) as EntityItem[];
  return items.map(itemToEntity);
}

/**
 * Update an entity
 */
export async function updateEntity(
  entityId: string,
  updates: UpdateEntityInput
): Promise<Entity | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.name !== undefined) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = updates.name;
  }

  if (updates.shortName !== undefined) {
    updateExpressions.push("#shortName = :shortName");
    expressionAttributeNames["#shortName"] = "shortName";
    expressionAttributeValues[":shortName"] = updates.shortName;
  }

  if (updates.type !== undefined) {
    updateExpressions.push("#type = :type");
    expressionAttributeNames["#type"] = "type";
    expressionAttributeValues[":type"] = updates.type;
  }

  if (updates.parentId !== undefined) {
    updateExpressions.push("#parentId = :parentId");
    expressionAttributeNames["#parentId"] = "parentId";
    expressionAttributeValues[":parentId"] = updates.parentId;
  }

  if (updates.metadata !== undefined) {
    updateExpressions.push("#metadata = :metadata");
    expressionAttributeNames["#metadata"] = "metadata";
    expressionAttributeValues[":metadata"] = updates.metadata;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.ENTITIES,
      Key: {
        pk: ENTITY_ALL_PK,
        sk: entityId,
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

  return itemToEntity(result.Attributes as EntityItem);
}

/**
 * Delete an entity
 */
export async function deleteEntity(entityId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.ENTITIES,
      Key: {
        pk: ENTITY_ALL_PK,
        sk: entityId,
      },
    })
  );
}

/**
 * Batch create entities (for seeding)
 */
export async function batchCreateEntities(
  entities: CreateEntityInput[]
): Promise<Entity[]> {
  const results: Entity[] = [];

  for (const entity of entities) {
    const created = await createEntity(entity);
    results.push(created);
  }

  return results;
}

/**
 * Check if entities collection is empty
 */
export async function isEntitiesEmpty(): Promise<boolean> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.ENTITIES,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": ENTITY_ALL_PK,
      },
      Limit: 1,
    })
  );

  return !result.Items || result.Items.length === 0;
}
