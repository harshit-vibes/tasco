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
