/**
 * User CRUD operations for DynamoDB
 */

import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildUserPK, USER_METADATA_SK } from "../tables";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserItem,
  PaginatedResult,
} from "./types";

/**
 * Convert DynamoDB item to User
 */
function itemToUser(item: UserItem): User {
  return {
    userId: item.userId,
    email: item.email,
    fullName: item.fullName,
    firstName: item.firstName,
    lastName: item.lastName,
    role: item.role,
    entityId: item.entityId,
    phoneNumber: item.phoneNumber,
    avatarUrl: item.avatarUrl,
    isActive: item.isActive,
    metadata: item.metadata,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastLoginAt: item.lastLoginAt,
  };
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const now = new Date().toISOString();
  const userId =
    input.userId || `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const user: User = {
    userId,
    email: input.email,
    fullName: input.fullName,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    entityId: input.entityId,
    phoneNumber: input.phoneNumber,
    avatarUrl: input.avatarUrl,
    isActive: input.isActive !== undefined ? input.isActive : true,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  const item: UserItem = {
    pk: buildUserPK(userId),
    sk: USER_METADATA_SK,
    ...user,
  };

  const command = new PutCommand({
    TableName: TABLES.USERS,
    Item: item,
  });

  await docClient.send(command);

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const command = new GetCommand({
    TableName: TABLES.USERS,
    Key: {
      pk: buildUserPK(userId),
      sk: USER_METADATA_SK,
    },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return null;
  }

  return itemToUser(result.Item as UserItem);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  });

  const result = await docClient.send(command);

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return itemToUser(result.Items[0] as UserItem);
}

/**
 * Get all users
 */
export async function getAllUsers(
  limit = 100,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResult<User>> {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  });

  const result = await docClient.send(command);

  return {
    items: (result.Items || []).map((item) => itemToUser(item as UserItem)),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Get users by entity
 */
export async function getUsersByEntity(entityId: string): Promise<User[]> {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: "entityId = :entityId AND isActive = :active",
    ExpressionAttributeValues: {
      ":entityId": entityId,
      ":active": true,
    },
  });

  const result = await docClient.send(command);

  return (result.Items || []).map((item) => itemToUser(item as UserItem));
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: "#role = :role AND isActive = :active",
    ExpressionAttributeNames: {
      "#role": "role",
    },
    ExpressionAttributeValues: {
      ":role": role,
      ":active": true,
    },
  });

  const result = await docClient.send(command);

  return (result.Items || []).map((item) => itemToUser(item as UserItem));
}

/**
 * Get active users
 */
export async function getActiveUsers(): Promise<User[]> {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: "isActive = :active",
    ExpressionAttributeValues: {
      ":active": true,
    },
  });

  const result = await docClient.send(command);

  return (result.Items || []).map((item) => itemToUser(item as UserItem));
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: UpdateUserInput
): Promise<User | null> {
  const now = new Date().toISOString();

  const updateExpressions: string[] = ["updatedAt = :updatedAt"];
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
  };

  if (updates.email !== undefined) {
    updateExpressions.push("email = :email");
    expressionAttributeValues[":email"] = updates.email;
  }

  if (updates.fullName !== undefined) {
    updateExpressions.push("fullName = :fullName");
    expressionAttributeValues[":fullName"] = updates.fullName;
  }

  if (updates.firstName !== undefined) {
    updateExpressions.push("firstName = :firstName");
    expressionAttributeValues[":firstName"] = updates.firstName;
  }

  if (updates.lastName !== undefined) {
    updateExpressions.push("lastName = :lastName");
    expressionAttributeValues[":lastName"] = updates.lastName;
  }

  if (updates.role !== undefined) {
    updateExpressions.push("#role = :role");
    expressionAttributeValues[":role"] = updates.role;
  }

  if (updates.entityId !== undefined) {
    updateExpressions.push("entityId = :entityId");
    expressionAttributeValues[":entityId"] = updates.entityId;
  }

  if (updates.phoneNumber !== undefined) {
    updateExpressions.push("phoneNumber = :phoneNumber");
    expressionAttributeValues[":phoneNumber"] = updates.phoneNumber;
  }

  if (updates.avatarUrl !== undefined) {
    updateExpressions.push("avatarUrl = :avatarUrl");
    expressionAttributeValues[":avatarUrl"] = updates.avatarUrl;
  }

  if (updates.isActive !== undefined) {
    updateExpressions.push("isActive = :isActive");
    expressionAttributeValues[":isActive"] = updates.isActive;
  }

  if (updates.metadata !== undefined) {
    updateExpressions.push("metadata = :metadata");
    expressionAttributeValues[":metadata"] = updates.metadata;
  }

  if (updates.lastLoginAt !== undefined) {
    updateExpressions.push("lastLoginAt = :lastLoginAt");
    expressionAttributeValues[":lastLoginAt"] = updates.lastLoginAt;
  }

  const command = new UpdateCommand({
    TableName: TABLES.USERS,
    Key: {
      pk: buildUserPK(userId),
      sk: USER_METADATA_SK,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames:
      updates.role !== undefined ? { "#role": "role" } : undefined,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const result = await docClient.send(command);

  if (!result.Attributes) {
    return null;
  }

  return itemToUser(result.Attributes as UserItem);
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLES.USERS,
    Key: {
      pk: buildUserPK(userId),
      sk: USER_METADATA_SK,
    },
  });

  await docClient.send(command);
}

/**
 * Update user last login
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await updateUser(userId, {
    lastLoginAt: new Date().toISOString(),
  });
}

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(userId: string): Promise<User | null> {
  return await updateUser(userId, { isActive: false });
}

/**
 * Activate user
 */
export async function activateUser(userId: string): Promise<User | null> {
  return await updateUser(userId, { isActive: true });
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const allUsers = await getAllUsers(1000);
  const users = allUsers.items;

  const roleDistribution = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const entityDistribution = users.reduce(
    (acc, user) => {
      acc[user.entityId] = (acc[user.entityId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    byRole: roleDistribution,
    byEntity: entityDistribution,
  };
}
