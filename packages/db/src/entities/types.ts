/**
 * Entity data types for DynamoDB persistence
 */

export type EntityType = "parent" | "holding" | "subsidiary";

/**
 * Entity category for app-level filtering
 * - tasco-group: Tasco Group subsidiaries (used in other apps)
 * - automotive-showroom: Car showrooms/dealerships (customer-lifecycle)
 * - automotive-b2b: B2B fleet clients, corporate customers (customer-lifecycle)
 * - automotive-brand: Vehicle brands distributed by Tasco Auto (GWM, GAC, Lotus)
 */
export type EntityCategory =
  | "tasco-group"
  | "automotive-showroom"
  | "automotive-b2b"
  | "automotive-brand";

export interface EntityMetadata {
  location?: string;
  employeeCount?: number;
  industry?: string;
  comments?: string;
  [key: string]: unknown;
}

export interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: EntityType;
  category?: EntityCategory;
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
  category?: EntityCategory;
  parentId?: string;
  metadata?: EntityMetadata;
}

export interface UpdateEntityInput {
  name?: string;
  shortName?: string;
  type?: EntityType;
  category?: EntityCategory;
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
  category?: EntityCategory;
  parentId?: string;
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}
