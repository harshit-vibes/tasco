/**
 * Entity data types for DynamoDB persistence
 */

export type EntityType = "parent" | "holding" | "subsidiary";

export interface EntityMetadata {
  location?: string;
  employeeCount?: number;
  industry?: string;
  [key: string]: unknown;
}

export interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: EntityType;
  parentId?: string;
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityInput {
  id?: string;
  name: string;
  shortName?: string;
  type: EntityType;
  parentId?: string;
  metadata?: EntityMetadata;
}

export interface UpdateEntityInput {
  name?: string;
  shortName?: string;
  type?: EntityType;
  parentId?: string;
  metadata?: EntityMetadata;
}

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}

// DynamoDB item type (internal)
export interface EntityItem {
  pk: string;
  sk: string;
  id: string;
  name: string;
  shortName?: string;
  type: EntityType;
  parentId?: string;
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}
