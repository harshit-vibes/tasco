/**
 * Initialize DynamoDB tables for Tasco chat functionality
 *
 * Usage:
 *   bun run db:init
 *
 * Environment variables:
 *   DYNAMODB_ENDPOINT - Override DynamoDB endpoint (default: http://localhost:8000)
 *   AWS_REGION - AWS region (default: ap-southeast-1)
 */

import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "../client";
import { TABLES } from "../tables";

const TABLE_DEFINITIONS = [
  {
    TableName: TABLES.CONVERSATIONS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: TABLES.MESSAGES,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: TABLES.ENTITIES,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: TABLES.DOCUMENTS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Courses table for e-learning (single table design)
  // Stores: courses, modules, lessons, quizzes, questions, progress
  {
    TableName: TABLES.COURSES,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
      { AttributeName: "gsi1pk", AttributeType: "S" as const },
      { AttributeName: "gsi1sk", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "gsi1",
        KeySchema: [
          { AttributeName: "gsi1pk", KeyType: "HASH" as const },
          { AttributeName: "gsi1sk", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Sales Orders table - main order data
  {
    TableName: TABLES.SALES_ORDERS,
    KeySchema: [
      { AttributeName: "orderId", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
      { AttributeName: "entityId", AttributeType: "S" as const },
      { AttributeName: "createdAt", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "status-createdAt-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
          { AttributeName: "createdAt", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
      {
        IndexName: "entityId-createdAt-index",
        KeySchema: [
          { AttributeName: "entityId", KeyType: "HASH" as const },
          { AttributeName: "createdAt", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Sales Order Activity table - audit trail
  {
    TableName: TABLES.SALES_ORDER_ACTIVITY,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Sales Order Metrics table - dashboard aggregations
  {
    TableName: TABLES.SALES_ORDER_METRICS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - Leads table
  {
    TableName: TABLES.LEADS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - Customers table
  {
    TableName: TABLES.CUSTOMERS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - Interactions table
  {
    TableName: TABLES.INTERACTIONS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - Purchases table
  {
    TableName: TABLES.PURCHASES,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - Campaigns table
  {
    TableName: TABLES.CAMPAIGNS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Customer Lifecycle - AI Recommendations table
  {
    TableName: TABLES.AI_RECOMMENDATIONS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Users table
  {
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Promotions table (promotion-control app)
  {
    TableName: TABLES.PROMOTIONS,
    KeySchema: [
      { AttributeName: "promotionId", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "promotionId", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
      { AttributeName: "entityId", AttributeType: "S" as const },
      { AttributeName: "startDate", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "status-startDate-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
          { AttributeName: "startDate", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
      {
        IndexName: "entityId-startDate-index",
        KeySchema: [
          { AttributeName: "entityId", KeyType: "HASH" as const },
          { AttributeName: "startDate", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Risk Radar - Metrics table
  {
    TableName: TABLES.RISK_METRICS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Risk Radar - Alerts table
  {
    TableName: TABLES.RISK_ALERTS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
      { AttributeName: "gsi1pk", AttributeType: "S" as const },
      { AttributeName: "gsi1sk", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "gsi1",
        KeySchema: [
          { AttributeName: "gsi1pk", KeyType: "HASH" as const },
          { AttributeName: "gsi1sk", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Data Sync - Systems table (stores system configurations)
  {
    TableName: TABLES.SYNC_SYSTEMS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Data Sync - Metrics table (stores sync metrics by system and date)
  {
    TableName: TABLES.SYNC_METRICS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  // Notifications table (used by multiple apps for alerts)
  {
    TableName: TABLES.NOTIFICATIONS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" as const },
      { AttributeName: "sk", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" as const },
      { AttributeName: "sk", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
];

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: tableName })
    );
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

async function createTable(definition: (typeof TABLE_DEFINITIONS)[0]): Promise<void> {
  const exists = await tableExists(definition.TableName);

  if (exists) {
    console.log(`✓ Table "${definition.TableName}" already exists`);
    return;
  }

  console.log(`Creating table "${definition.TableName}"...`);

  await dynamoClient.send(new CreateTableCommand(definition));

  console.log(`✓ Table "${definition.TableName}" created successfully`);
}

async function main(): Promise<void> {
  console.log("\n=== Tasco DynamoDB Table Initialization ===\n");
  console.log(`Region: ${process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1"}`);
  console.log("Using AWS CLI credentials\n");

  try {
    for (const definition of TABLE_DEFINITIONS) {
      await createTable(definition);
    }

    console.log("\n=== All tables initialized successfully ===\n");
  } catch (error) {
    console.error("\n❌ Error initializing tables:", error);
    process.exit(1);
  }
}

main();
