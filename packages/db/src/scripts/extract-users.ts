/**
 * Extract user data from existing DynamoDB tables
 *
 * Usage:
 *   bun run db:extract-users
 *
 * This script scans existing data to extract unique user IDs and names,
 * then creates user profiles for users that don't exist yet.
 */

import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES } from "../tables";
import { createUser, getUserById } from "../users";
import type { CreateUserInput } from "../users";

console.log("\n=== Extracting User Data from Existing Tables ===\n");

interface UserInfo {
  userId?: string;
  userName?: string;
  userEmail?: string;
  entityId?: string;
}

/**
 * Scan a table and extract user information
 */
async function scanTableForUsers(
  tableName: string,
  extractFn: (item: any) => UserInfo[]
): Promise<UserInfo[]> {
  const users: UserInfo[] = [];

  try {
    const command = new ScanCommand({
      TableName: tableName,
      Limit: 1000, // Adjust as needed
    });

    const result = await docClient.send(command);

    if (result.Items) {
      for (const item of result.Items) {
        const extracted = extractFn(item);
        users.push(...extracted);
      }
    }

    return users;
  } catch (error) {
    console.error(`Error scanning ${tableName}:`, error);
    return [];
  }
}

/**
 * Extract users from conversations table
 */
async function extractFromConversations(): Promise<UserInfo[]> {
  console.log("Scanning conversations table...");
  const users = await scanTableForUsers(TABLES.CONVERSATIONS, (item) => {
    if (item.userId) {
      return [
        {
          userId: item.userId,
          entityId: item.entityId,
        },
      ];
    }
    return [];
  });
  console.log(`  Found ${users.length} user entries`);
  return users;
}

/**
 * Extract users from sales order activity logs
 */
async function extractFromSalesOrderActivity(): Promise<UserInfo[]> {
  console.log("Scanning sales order activity table...");
  const users = await scanTableForUsers(
    TABLES.SALES_ORDER_ACTIVITY,
    (item) => {
      const userInfos: UserInfo[] = [];

      if (item.details?.userId || item.details?.userName) {
        userInfos.push({
          userId: item.details.userId,
          userName: item.details.userName,
          entityId: item.entityId,
        });
      }

      return userInfos;
    }
  );
  console.log(`  Found ${users.length} user entries`);
  return users;
}

/**
 * Extract users from sales orders
 */
async function extractFromSalesOrders(): Promise<UserInfo[]> {
  console.log("Scanning sales orders table...");
  const users = await scanTableForUsers(TABLES.SALES_ORDERS, (item) => {
    const userInfos: UserInfo[] = [];

    if (item.createdBy) {
      userInfos.push({
        userId: item.createdBy,
        entityId: item.entityId,
      });
    }

    if (item.reviewedBy) {
      userInfos.push({
        userId: item.reviewedBy,
        entityId: item.entityId,
      });
    }

    if (item.exportedBy) {
      userInfos.push({
        userId: item.exportedBy,
        entityId: item.entityId,
      });
    }

    if (item.assignedTo) {
      userInfos.push({
        userId: item.assignedTo,
        userEmail: item.assignedTo.includes("@") ? item.assignedTo : undefined,
        entityId: item.entityId,
      });
    }

    return userInfos;
  });
  console.log(`  Found ${users.length} user entries`);
  return users;
}

/**
 * Merge and deduplicate user information
 */
function mergeUserInfo(userInfos: UserInfo[]): Map<string, UserInfo> {
  const userMap = new Map<string, UserInfo>();

  for (const info of userInfos) {
    const key = info.userId || info.userName || "";
    if (!key) continue;

    const existing = userMap.get(key);
    if (existing) {
      // Merge information
      userMap.set(key, {
        userId: existing.userId || info.userId,
        userName: existing.userName || info.userName,
        userEmail: existing.userEmail || info.userEmail,
        entityId: existing.entityId || info.entityId,
      });
    } else {
      userMap.set(key, info);
    }
  }

  return userMap;
}

/**
 * Parse Vietnamese name into first and last name
 */
function parseVietnameseName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  // Vietnamese names: Last name is typically the first part
  const lastName = parts[0];
  const firstName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

/**
 * Create user from extracted information
 */
async function createUserFromInfo(info: UserInfo): Promise<boolean> {
  try {
    // Generate userId if not present
    const userId =
      info.userId ||
      `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Check if user already exists
    const existing = await getUserById(userId);
    if (existing) {
      console.log(`  ⊘ User already exists: ${userId}`);
      return false;
    }

    // Parse name
    const fullName = info.userName || "Unknown User";
    const { firstName, lastName } = parseVietnameseName(fullName);

    // Generate email if not present
    const email =
      info.userEmail ||
      `${firstName.toLowerCase().replace(/\s+/g, ".")}.${lastName.toLowerCase()}@tasco.vn`;

    // Create user input
    const userInput: CreateUserInput = {
      userId,
      email,
      fullName,
      firstName,
      lastName,
      role: "sales_rep", // Default role
      entityId: info.entityId || "tasco-group",
      isActive: true,
      metadata: {
        department: "Sales",
        // Mark as migrated from old data
        migratedFrom: "extract-users-script",
      },
    };

    await createUser(userInput);
    console.log(`  ✓ Created user: ${fullName} (${userId})`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to create user:`, error);
    return false;
  }
}

/**
 * Main extraction and creation function
 */
async function main() {
  try {
    console.log("Step 1: Extracting user data from tables...\n");

    const [conversationUsers, activityUsers, orderUsers] = await Promise.all([
      extractFromConversations(),
      extractFromSalesOrderActivity(),
      extractFromSalesOrders(),
    ]);

    console.log("\nStep 2: Merging and deduplicating user data...\n");

    const allUsers = [...conversationUsers, ...activityUsers, ...orderUsers];
    const uniqueUsers = mergeUserInfo(allUsers);

    console.log(`  Found ${uniqueUsers.size} unique users\n`);

    console.log("Step 3: Creating user profiles...\n");

    let created = 0;
    let skipped = 0;

    for (const [, userInfo] of uniqueUsers) {
      const wasCreated = await createUserFromInfo(userInfo);
      if (wasCreated) {
        created++;
      } else {
        skipped++;
      }
    }

    console.log("\n=== ✅ User extraction completed ===\n");
    console.log(`Total users processed: ${uniqueUsers.size}`);
    console.log(`  - Created: ${created}`);
    console.log(`  - Skipped (already exist): ${skipped}`);
    console.log();
  } catch (error) {
    console.error("\n❌ Error extracting users:", error);
    process.exit(1);
  }
}

main();
