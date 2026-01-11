/**
 * User data types for DynamoDB persistence
 */

export type UserRole = "admin" | "manager" | "sales_rep" | "support";

export interface UserMetadata {
  department?: string;
  hireDate?: string;
  performanceMetrics?: {
    leadsConverted?: number;
    totalSales?: number;
    averageResponseTime?: number;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
  };
  [key: string]: unknown;
}

export interface User {
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  entityId: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  metadata?: UserMetadata;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserInput {
  userId?: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  entityId: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
  metadata?: UserMetadata;
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  entityId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
  metadata?: UserMetadata;
  lastLoginAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}

// DynamoDB item type (internal)
export interface UserItem {
  pk: string;
  sk: string;
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  entityId: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  metadata?: UserMetadata;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
