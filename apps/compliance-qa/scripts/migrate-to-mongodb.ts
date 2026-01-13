/**
 * Migration Script: DynamoDB to MongoDB
 *
 * Migrates compliance-qa data from DynamoDB to MongoDB Atlas
 *
 * Run with: bun run scripts/migrate-to-mongodb.ts
 *
 * Options:
 *   --conversations  Only migrate conversations
 *   --messages       Only migrate messages
 *   --documents      Only migrate documents
 *   --guides         Only migrate app guides
 *   --dry-run        Show what would be migrated without making changes
 */

import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { MongoClient, ObjectId } from "mongodb";

// DynamoDB client setup
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const APP_ID = "compliance-qa";
const ENTITY_ID = "compliance-qa";

// DynamoDB table names
const TABLES = {
  CONVERSATIONS: "tasco-conversations",
  MESSAGES: "tasco-messages",
  DOCUMENTS: "tasco-documents",
  APP_GUIDES: "tasco-app-guides",
};

// MongoDB config
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://tasco:TascoDemo2025!@cluster0.xkfddjz.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = process.env.MONGODB_DATABASE || "compliance-qa";

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dataFlags = args.filter((a) => a !== "--dry-run");

// If no specific data flags, migrate all
const migrateAll = dataFlags.length === 0;

const options = {
  conversations: migrateAll || args.includes("--conversations"),
  messages: migrateAll || args.includes("--messages"),
  documents: migrateAll || args.includes("--documents"),
  guides: migrateAll || args.includes("--guides"),
  dryRun,
};

// Create DynamoDB client
function createDynamoClient(): DynamoDBDocumentClient {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

  const clientConfig: Record<string, unknown> = { region };

  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = { accessKeyId, secretAccessKey };
  }

  const client = new DynamoDBClient(clientConfig);
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
    },
  });
}

// ID mapping for conversations (DynamoDB SK -> MongoDB ObjectId)
const conversationIdMap = new Map<string, string>();

async function migrateConversations(
  docClient: DynamoDBDocumentClient,
  mongoDb: MongoClient["db"] extends (name: string) => infer R ? R : never
) {
  console.log("\n📋 Migrating Conversations...");

  const pk = `CONV#${APP_ID}#${ENTITY_ID}`;

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.CONVERSATIONS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": pk,
      },
    })
  );

  const items = result.Items || [];
  console.log(`   Found ${items.length} conversations in DynamoDB`);

  if (items.length === 0) {
    console.log("   No conversations to migrate");
    return;
  }

  if (options.dryRun) {
    console.log("   [DRY RUN] Would migrate:");
    items.slice(0, 3).forEach((item) => {
      console.log(`     - ${item.title || "Untitled"} (${item.sk})`);
    });
    if (items.length > 3) {
      console.log(`     ... and ${items.length - 3} more`);
    }
    return;
  }

  const collection = mongoDb.collection("conversations");

  // Transform and insert
  const docs = items.map((item) => {
    const mongoId = new ObjectId();
    // Map old SK to new MongoDB _id for message migration
    conversationIdMap.set(item.sk, mongoId.toHexString());

    return {
      _id: mongoId,
      appId: APP_ID,
      entityId: ENTITY_ID,
      userId: item.userId || "migrated-user",
      title: item.title || "Migrated Conversation",
      messageCount: item.messageCount || 0,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      metadata: {
        migratedFrom: "dynamodb",
        originalSK: item.sk,
        migrationDate: new Date().toISOString(),
      },
    };
  });

  const insertResult = await collection.insertMany(docs);
  console.log(`   ✅ Migrated ${insertResult.insertedCount} conversations`);
}

async function migrateMessages(
  docClient: DynamoDBDocumentClient,
  mongoDb: MongoClient["db"] extends (name: string) => infer R ? R : never
) {
  console.log("\n💬 Migrating Messages...");

  let totalMigrated = 0;

  // Get all conversation IDs from the map
  for (const [dynamoSK, mongoId] of conversationIdMap) {
    const pk = `MSG#${dynamoSK}`;

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.MESSAGES,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": pk,
        },
      })
    );

    const items = result.Items || [];

    if (items.length === 0) continue;

    if (options.dryRun) {
      console.log(
        `   [DRY RUN] Would migrate ${items.length} messages for conversation ${mongoId}`
      );
      totalMigrated += items.length;
      continue;
    }

    const collection = mongoDb.collection("messages");

    const docs = items.map((item) => ({
      _id: new ObjectId(),
      conversationId: mongoId,
      role: item.role || "user",
      content: item.content || "",
      citations: item.citations || null,
      enhancedCitations: item.enhancedCitations || null,
      validation: item.validation || null,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      metadata: {
        migratedFrom: "dynamodb",
        originalSK: item.sk,
        migrationDate: new Date().toISOString(),
      },
    }));

    await collection.insertMany(docs);
    totalMigrated += docs.length;
  }

  console.log(`   ✅ Migrated ${totalMigrated} messages`);
}

async function migrateDocuments(
  docClient: DynamoDBDocumentClient,
  mongoDb: MongoClient["db"] extends (name: string) => infer R ? R : never
) {
  console.log("\n📄 Migrating Documents...");

  // Scan all documents for compliance-qa
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.DOCUMENTS,
      FilterExpression: "appId = :appId",
      ExpressionAttributeValues: {
        ":appId": APP_ID,
      },
    })
  );

  const items = result.Items || [];
  console.log(`   Found ${items.length} documents in DynamoDB`);

  if (items.length === 0) {
    console.log("   No documents to migrate");
    return;
  }

  if (options.dryRun) {
    console.log("   [DRY RUN] Would migrate:");
    items.slice(0, 5).forEach((item) => {
      console.log(`     - ${item.filename || item.name} (${item.category})`);
    });
    if (items.length > 5) {
      console.log(`     ... and ${items.length - 5} more`);
    }
    return;
  }

  const collection = mongoDb.collection("documents");

  const docs = items.map((item) => ({
    _id: new ObjectId(),
    appId: APP_ID,
    entityId: item.entityId || ENTITY_ID,
    name: item.name || item.filename,
    filename: item.filename || item.name,
    category: item.category || "internal",
    url: item.url || item.s3Url || null,
    s3Key: item.s3Key || null,
    ragDocumentId: item.ragDocumentId || null,
    syncedToKB: item.syncedToKB || false,
    fileSize: item.fileSize || 0,
    mimeType: item.mimeType || "application/pdf",
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    metadata: {
      migratedFrom: "dynamodb",
      originalId: item.id || item.pk,
      migrationDate: new Date().toISOString(),
    },
  }));

  const insertResult = await collection.insertMany(docs);
  console.log(`   ✅ Migrated ${insertResult.insertedCount} documents`);
}

async function migrateAppGuides(
  docClient: DynamoDBDocumentClient,
  mongoDb: MongoClient["db"] extends (name: string) => infer R ? R : never
) {
  console.log("\n📖 Migrating App Guides...");

  // Query for compliance-qa guide using correct key structure: pk = APP#{appId}
  const pk = `APP#${APP_ID}`;

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.APP_GUIDES,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": pk,
      },
    })
  );

  const items = result.Items || [];
  console.log(`   Found ${items.length} app guides in DynamoDB`);

  if (items.length === 0) {
    console.log("   No app guides to migrate");
    return;
  }

  if (options.dryRun) {
    console.log("   [DRY RUN] Would migrate app guide(s) for:", APP_ID);
    items.forEach((item) => {
      console.log(`     - Language: ${item.language || "en"}, Slides: ${item.slides?.length || 0}`);
    });
    return;
  }

  const collection = mongoDb.collection("appGuides");

  const docs = items.map((item) => ({
    _id: new ObjectId(),
    appId: item.appId,
    language: item.language || "en",
    appName: item.appName,
    appTagline: item.appTagline,
    slides: item.slides || [],
    onePager: item.onePager || null,
    ctaText: item.ctaText || null,
    enabled: item.enabled ?? true,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    metadata: {
      migratedFrom: "dynamodb",
      originalId: item.id,
      migrationDate: new Date().toISOString(),
    },
  }));

  // Upsert to avoid duplicates (exclude _id from $set to avoid immutable field error)
  for (const doc of docs) {
    const { _id, ...updateDoc } = doc;
    await collection.updateOne(
      { appId: doc.appId, language: doc.language },
      { $set: updateDoc, $setOnInsert: { _id } },
      { upsert: true }
    );
  }

  console.log(`   ✅ Migrated ${items.length} app guides`);
}

async function main() {
  console.log("🚀 Starting DynamoDB to MongoDB Migration");
  console.log("=========================================");
  console.log(`   App ID: ${APP_ID}`);
  console.log(`   Entity ID: ${ENTITY_ID}`);
  console.log(`   Dry Run: ${options.dryRun}`);
  console.log(`   Migrate: ${[
    options.conversations && "conversations",
    options.messages && "messages",
    options.documents && "documents",
    options.guides && "guides",
  ]
    .filter(Boolean)
    .join(", ")}`);

  // Create clients
  const docClient = createDynamoClient();
  const mongoClient = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log("\n✅ Connected to MongoDB Atlas");

    const mongoDb = mongoClient.db(DATABASE_NAME);

    // Run migrations
    if (options.conversations) {
      await migrateConversations(docClient, mongoDb);
    }

    if (options.messages) {
      // Messages depend on conversations being migrated first
      if (!options.conversations && conversationIdMap.size === 0) {
        console.log(
          "\n⚠️  Skipping messages - need to migrate conversations first or pass --conversations flag"
        );
      } else {
        await migrateMessages(docClient, mongoDb);
      }
    }

    if (options.documents) {
      await migrateDocuments(docClient, mongoDb);
    }

    if (options.guides) {
      await migrateAppGuides(docClient, mongoDb);
    }

    console.log("\n=========================================");
    console.log("✅ Migration complete!");

    if (options.dryRun) {
      console.log(
        "\n💡 This was a dry run. Run without --dry-run to actually migrate data."
      );
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoClient.close();
  }
}

main();
