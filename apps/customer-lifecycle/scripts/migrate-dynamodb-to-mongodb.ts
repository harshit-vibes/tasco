/**
 * Migration Script: DynamoDB to MongoDB
 *
 * Migrates all customer-lifecycle data from AWS DynamoDB to MongoDB Atlas.
 *
 * Usage: bun run scripts/migrate-dynamodb-to-mongodb.ts
 *
 * Environment variables loaded from .env.local automatically by Bun
 */

// DynamoDB imports (source) - all from main @tasco/db export
import {
  getAllLeads as getDynamoLeads,
  getAllCustomers as getDynamoCustomers,
  getAllCampaigns as getDynamoCampaigns,
  getAllVehicles as getDynamoVehicles,
  getAllImportOrders as getDynamoImportOrders,
  listConversations as getDynamoConversations,
  getAllMessages as getDynamoMessages,
  listEntities as getDynamoEntities,
} from "@tasco/db";

// MongoDB imports (destination)
import {
  getMongoClient,
  getDb,
  closeConnection,
} from "@tasco/db/mongodb";

// Types
interface MigrationStats {
  table: string;
  dynamoCount: number;
  mongoCount: number;
  migrated: number;
  errors: number;
}

// Helper to remove DynamoDB-specific fields
function cleanDynamoRecord(record: any): any {
  const { pk, sk, ...clean } = record;
  return clean;
}

// Migrate Leads
async function migrateLeads(): Promise<MigrationStats> {
  console.log("\n📋 Migrating Leads...");
  const stats: MigrationStats = { table: "leads", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    // Get all leads from DynamoDB
    const dynamoResult = await getDynamoLeads();
    const leads = dynamoResult.items;
    stats.dynamoCount = leads.length;
    console.log(`  Found ${leads.length} leads in DynamoDB`);

    if (leads.length === 0) {
      console.log("  No leads to migrate");
      return stats;
    }

    // Get MongoDB collection
    const db = await getDb();
    const collection = db.collection("leads");

    // Check existing count
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB leads: ${stats.mongoCount}`);

    // Transform and insert
    const documents = leads.map(lead => {
      const clean = cleanDynamoRecord(lead);
      return {
        ...clean,
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    // Use bulkWrite with upsert to avoid duplicates
    const operations = documents.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new leads`);

  } catch (error) {
    console.error("  ❌ Error migrating leads:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Customers
async function migrateCustomers(): Promise<MigrationStats> {
  console.log("\n👥 Migrating Customers...");
  const stats: MigrationStats = { table: "customers", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    const dynamoResult = await getDynamoCustomers();
    const customers = dynamoResult.items;
    stats.dynamoCount = customers.length;
    console.log(`  Found ${customers.length} customers in DynamoDB`);

    if (customers.length === 0) {
      console.log("  No customers to migrate");
      return stats;
    }

    const db = await getDb();
    const collection = db.collection("customers");
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB customers: ${stats.mongoCount}`);

    const documents = customers.map(customer => {
      const clean = cleanDynamoRecord(customer);
      return {
        ...clean,
        lastActivityAt: clean.lastActivityAt ? new Date(clean.lastActivityAt) : new Date(),
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    const operations = documents.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new customers`);

  } catch (error) {
    console.error("  ❌ Error migrating customers:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Campaigns
async function migrateCampaigns(): Promise<MigrationStats> {
  console.log("\n📣 Migrating Campaigns...");
  const stats: MigrationStats = { table: "campaigns", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    const campaigns = await getDynamoCampaigns();
    stats.dynamoCount = campaigns.length;
    console.log(`  Found ${campaigns.length} campaigns in DynamoDB`);

    if (campaigns.length === 0) {
      console.log("  No campaigns to migrate");
      return stats;
    }

    const db = await getDb();
    const collection = db.collection("campaigns");
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB campaigns: ${stats.mongoCount}`);

    const documents = campaigns.map(campaign => {
      const clean = cleanDynamoRecord(campaign);
      return {
        ...clean,
        metrics: clean.metrics || { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    const operations = documents.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new campaigns`);

  } catch (error) {
    console.error("  ❌ Error migrating campaigns:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Vehicles
async function migrateVehicles(): Promise<MigrationStats> {
  console.log("\n🚗 Migrating Vehicles...");
  const stats: MigrationStats = { table: "vehicles", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    const dynamoResult = await getDynamoVehicles();
    const vehicles = dynamoResult.items;
    stats.dynamoCount = vehicles.length;
    console.log(`  Found ${vehicles.length} vehicles in DynamoDB`);

    if (vehicles.length === 0) {
      console.log("  No vehicles to migrate");
      return stats;
    }

    const db = await getDb();
    const collection = db.collection("vehicles");
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB vehicles: ${stats.mongoCount}`);

    const documents = vehicles.map(vehicle => {
      const clean = cleanDynamoRecord(vehicle);
      return {
        ...clean,
        arrivedAt: clean.arrivedAt ? new Date(clean.arrivedAt) : undefined,
        soldAt: clean.soldAt ? new Date(clean.soldAt) : undefined,
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    const operations = documents.map(doc => ({
      updateOne: {
        filter: { vin: doc.vin },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new vehicles`);

  } catch (error) {
    console.error("  ❌ Error migrating vehicles:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Import Orders
async function migrateImportOrders(): Promise<MigrationStats> {
  console.log("\n📦 Migrating Import Orders...");
  const stats: MigrationStats = { table: "importOrders", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    const dynamoResult = await getDynamoImportOrders();
    const orders = dynamoResult.items;
    stats.dynamoCount = orders.length;
    console.log(`  Found ${orders.length} import orders in DynamoDB`);

    if (orders.length === 0) {
      console.log("  No import orders to migrate");
      return stats;
    }

    const db = await getDb();
    const collection = db.collection("importOrders");
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB import orders: ${stats.mongoCount}`);

    const documents = orders.map(order => {
      const clean = cleanDynamoRecord(order);
      return {
        ...clean,
        actualArrivalDate: clean.actualArrivalDate ? new Date(clean.actualArrivalDate) : undefined,
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    const operations = documents.map(doc => ({
      updateOne: {
        filter: { orderNumber: doc.orderNumber },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new import orders`);

  } catch (error) {
    console.error("  ❌ Error migrating import orders:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Entities
async function migrateEntities(): Promise<MigrationStats> {
  console.log("\n🏢 Migrating Entities...");
  const stats: MigrationStats = { table: "entities", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    const dynamoResult = await getDynamoEntities();
    const entities = dynamoResult.items;
    stats.dynamoCount = entities.length;
    console.log(`  Found ${entities.length} entities in DynamoDB`);

    if (entities.length === 0) {
      console.log("  No entities to migrate");
      return stats;
    }

    const db = await getDb();
    const collection = db.collection("entities");
    stats.mongoCount = await collection.countDocuments();
    console.log(`  Existing MongoDB entities: ${stats.mongoCount}`);

    const documents = entities.map(entity => {
      const clean = cleanDynamoRecord(entity);
      return {
        ...clean,
        entityId: clean.id, // Map id to entityId for MongoDB schema
        createdAt: clean.createdAt ? new Date(clean.createdAt) : new Date(),
        updatedAt: clean.updatedAt ? new Date(clean.updatedAt) : new Date(),
      };
    });

    const operations = documents.map(doc => ({
      updateOne: {
        filter: { entityId: doc.entityId },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations);
    stats.migrated = result.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new entities`);

  } catch (error) {
    console.error("  ❌ Error migrating entities:", error);
    stats.errors++;
  }

  return stats;
}

// Migrate Conversations and Messages
async function migrateConversations(): Promise<MigrationStats> {
  console.log("\n💬 Migrating Conversations...");
  const stats: MigrationStats = { table: "conversations", dynamoCount: 0, mongoCount: 0, migrated: 0, errors: 0 };

  try {
    // Get conversations for the customer-lifecycle app
    const dynamoResult = await getDynamoConversations("customer-lifecycle", "*");
    const conversations = dynamoResult.items;
    stats.dynamoCount = conversations.length;
    console.log(`  Found ${conversations.length} conversations in DynamoDB`);

    if (conversations.length === 0) {
      console.log("  No conversations to migrate");
      return stats;
    }

    const db = await getDb();
    const convCollection = db.collection("conversations");
    const msgCollection = db.collection("messages");

    stats.mongoCount = await convCollection.countDocuments();
    console.log(`  Existing MongoDB conversations: ${stats.mongoCount}`);

    // Migrate conversations
    const convDocuments = conversations.map(conv => {
      const clean = cleanDynamoRecord(conv);
      return {
        ...clean,
        createdAt: new Date(clean.createdAt),
        updatedAt: new Date(clean.updatedAt),
      };
    });

    const convOps = convDocuments.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const convResult = await convCollection.bulkWrite(convOps);
    stats.migrated = convResult.upsertedCount;
    console.log(`  ✅ Migrated ${stats.migrated} new conversations`);

    // Migrate messages for each conversation
    let totalMessages = 0;
    for (const conv of conversations) {
      try {
        const messages = await getDynamoMessages(conv.id);
        if (messages.length > 0) {
          const msgDocuments = messages.map(msg => {
            const clean = cleanDynamoRecord(msg);
            return {
              ...clean,
              createdAt: new Date(clean.createdAt),
            };
          });

          const msgOps = msgDocuments.map(doc => ({
            updateOne: {
              filter: { id: doc.id },
              update: { $setOnInsert: doc },
              upsert: true,
            },
          }));

          const msgResult = await msgCollection.bulkWrite(msgOps);
          totalMessages += msgResult.upsertedCount;
        }
      } catch (err) {
        console.error(`  ⚠️ Error migrating messages for conversation ${conv.id}:`, err);
      }
    }
    console.log(`  ✅ Migrated ${totalMessages} new messages`);

  } catch (error) {
    console.error("  ❌ Error migrating conversations:", error);
    stats.errors++;
  }

  return stats;
}

// Main migration function
async function runMigration() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     DynamoDB → MongoDB Migration for Customer Lifecycle    ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("Starting migration at:", new Date().toISOString());

  const allStats: MigrationStats[] = [];

  try {
    // Test MongoDB connection
    console.log("\n🔌 Testing MongoDB connection...");
    await getMongoClient();
    console.log("  ✅ MongoDB connected successfully");

    // Run migrations
    allStats.push(await migrateEntities());
    allStats.push(await migrateLeads());
    allStats.push(await migrateCustomers());
    allStats.push(await migrateCampaigns());
    allStats.push(await migrateVehicles());
    allStats.push(await migrateImportOrders());
    allStats.push(await migrateConversations());

    // Print summary
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Migration Summary                        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("┌─────────────────┬───────────┬───────────┬──────────┬────────┐");
    console.log("│ Table           │ DynamoDB  │ MongoDB   │ Migrated │ Errors │");
    console.log("├─────────────────┼───────────┼───────────┼──────────┼────────┤");

    let totalDynamo = 0;
    let totalMongo = 0;
    let totalMigrated = 0;
    let totalErrors = 0;

    for (const stat of allStats) {
      console.log(
        `│ ${stat.table.padEnd(15)} │ ${String(stat.dynamoCount).padStart(9)} │ ${String(stat.mongoCount + stat.migrated).padStart(9)} │ ${String(stat.migrated).padStart(8)} │ ${String(stat.errors).padStart(6)} │`
      );
      totalDynamo += stat.dynamoCount;
      totalMongo += stat.mongoCount + stat.migrated;
      totalMigrated += stat.migrated;
      totalErrors += stat.errors;
    }

    console.log("├─────────────────┼───────────┼───────────┼──────────┼────────┤");
    console.log(
      `│ ${"TOTAL".padEnd(15)} │ ${String(totalDynamo).padStart(9)} │ ${String(totalMongo).padStart(9)} │ ${String(totalMigrated).padStart(8)} │ ${String(totalErrors).padStart(6)} │`
    );
    console.log("└─────────────────┴───────────┴───────────┴──────────┴────────┘");

    console.log("\n✅ Migration completed at:", new Date().toISOString());

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    await closeConnection();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run migration
runMigration().catch(console.error);
