/**
 * MongoDB Client for Tasco (compliance-qa pilot)
 *
 * Uses MongoDB Atlas with connection pooling and singleton pattern.
 */

import { MongoClient, Db, Collection, ObjectId, Document as MongoDocument } from "mongodb";

// Connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || "compliance-qa";

// Singleton instances
let client: MongoClient | null = null;
let db: Db | null = null;

// Connection options
const clientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Get MongoDB client singleton
 * Creates connection on first call, reuses thereafter
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "[MongoDB] MONGODB_URI environment variable is not set. " +
      "Set it to your MongoDB Atlas connection string."
    );
  }

  console.log("[MongoDB] Connecting to MongoDB Atlas...");
  client = new MongoClient(MONGODB_URI, clientOptions);
  await client.connect();
  console.log("[MongoDB] Connected successfully");

  return client;
}

/**
 * Get database instance
 */
export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoClient = await getMongoClient();
  db = mongoClient.db(DATABASE_NAME);
  console.log(`[MongoDB] Using database: ${DATABASE_NAME}`);

  return db;
}

/**
 * Get typed collection by name
 */
export async function getCollection<T extends MongoDocument>(
  name: string
): Promise<Collection<T>> {
  const database = await getDb();
  return database.collection<T>(name);
}

/**
 * Close MongoDB connection (for graceful shutdown)
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[MongoDB] Connection closed");
  }
}

/**
 * Health check - ping the database
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const database = await getDb();
    await database.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("[MongoDB] Health check failed:", error);
    return false;
  }
}

/**
 * Helper to generate a new ObjectId string
 */
export function generateId(): string {
  return new ObjectId().toHexString();
}

/**
 * Helper to convert string to ObjectId (for queries)
 */
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

// Re-export ObjectId for convenience
export { ObjectId };
