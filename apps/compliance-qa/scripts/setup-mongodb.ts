/**
 * Setup MongoDB Collections and Indexes
 *
 * Run with: bun run scripts/setup-mongodb.ts
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tasco:TascoDemo2025!@cluster0.xkfddjz.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = process.env.MONGODB_DATABASE || "compliance-qa";

async function setupMongoDB() {
  console.log("Setting up MongoDB collections and indexes...\n");

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas\n");

    const db = client.db(DATABASE_NAME);

    // Create collections
    const collections = [
      "conversations",
      "messages",
      "documents",
      "entities",
      "notifications",
      "appGuides",
    ];

    for (const name of collections) {
      try {
        await db.createCollection(name);
        console.log(`Created collection: ${name}`);
      } catch (err: any) {
        if (err.code === 48) {
          console.log(`Collection already exists: ${name}`);
        } else {
          throw err;
        }
      }
    }

    console.log("\nCreating indexes...\n");

    // Conversations indexes
    await db.collection("conversations").createIndexes([
      { key: { appId: 1, entityId: 1 }, name: "appId_entityId" },
      { key: { createdAt: -1 }, name: "createdAt_desc" },
      { key: { updatedAt: -1 }, name: "updatedAt_desc" },
    ]);
    console.log("Created indexes for: conversations");

    // Messages indexes
    await db.collection("messages").createIndexes([
      { key: { conversationId: 1, createdAt: 1 }, name: "conversationId_createdAt" },
      { key: { createdAt: -1 }, name: "createdAt_desc" },
    ]);
    console.log("Created indexes for: messages");

    // Documents indexes
    await db.collection("documents").createIndexes([
      { key: { appId: 1, entityId: 1 }, name: "appId_entityId" },
      { key: { category: 1 }, name: "category" },
      { key: { filename: 1 }, name: "filename" },
      { key: { ragDocumentId: 1 }, name: "ragDocumentId" },
      { key: { syncedToKB: 1 }, name: "syncedToKB" },
      { key: { updatedAt: -1 }, name: "updatedAt_desc" },
    ]);
    console.log("Created indexes for: documents");

    // Entities indexes
    await db.collection("entities").createIndexes([
      { key: { entityId: 1 }, unique: true, name: "entityId_unique" },
      { key: { parentId: 1 }, name: "parentId" },
      { key: { type: 1 }, name: "type" },
      { key: { category: 1 }, name: "category" },
    ]);
    console.log("Created indexes for: entities");

    // Notifications indexes
    await db.collection("notifications").createIndexes([
      { key: { appId: 1, entityId: 1 }, name: "appId_entityId" },
      { key: { read: 1 }, name: "read" },
      { key: { createdAt: -1 }, name: "createdAt_desc" },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: "expiresAt_ttl" },
    ]);
    console.log("Created indexes for: notifications");

    // AppGuides indexes (unique on appId + language combination)
    await db.collection("appGuides").createIndexes([
      { key: { appId: 1, language: 1 }, unique: true, name: "appId_language_unique" },
    ]);
    console.log("Created indexes for: appGuides");

    console.log("\nMongoDB setup complete!");
    console.log(`\nDatabase: ${DATABASE_NAME}`);
    console.log(`Collections: ${collections.length}`);

  } finally {
    await client.close();
  }
}

setupMongoDB().catch(console.error);
