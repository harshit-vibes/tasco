/**
 * MongoDB Client for Tasco (compliance-qa pilot)
 *
 * Uses MongoDB Atlas with connection pooling and singleton pattern.
 * Includes retry logic for transient SSL/TLS errors.
 */

import { MongoClient, Db, Collection, ObjectId, Document as MongoDocument } from "mongodb";

// Connection URI from environment
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || "compliance-qa";

// Singleton instances
let client: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

// Connection options
const clientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

/**
 * Reset the cached client (used when connection errors occur)
 */
export function resetClient(): void {
  if (client) {
    client.close().catch(() => {});
  }
  client = null;
  db = null;
  connectionPromise = null;
  console.log("[MongoDB] Client reset due to connection error");
}

/**
 * Get MongoDB client singleton
 * Creates connection on first call, reuses thereafter
 * Includes retry logic for transient errors
 */
export async function getMongoClient(): Promise<MongoClient> {
  // Return existing client if connected
  if (client) {
    try {
      // Quick ping to verify connection is alive
      await client.db().command({ ping: 1 });
      return client;
    } catch (error) {
      console.warn("[MongoDB] Existing connection stale, reconnecting...");
      resetClient();
    }
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "[MongoDB] MONGODB_URI environment variable is not set. " +
      "Set it to your MongoDB Atlas connection string."
    );
  }

  connectionPromise = (async () => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[MongoDB] Connecting to MongoDB Atlas (attempt ${attempt}/${maxRetries})...`);
        const newClient = new MongoClient(MONGODB_URI, clientOptions);
        await newClient.connect();
        console.log("[MongoDB] Connected successfully");
        client = newClient;
        connectionPromise = null;
        return newClient;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[MongoDB] Connection attempt ${attempt} failed:`, lastError.message);

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          const delay = 500 * Math.pow(2, attempt - 1);
          console.log(`[MongoDB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    connectionPromise = null;
    throw lastError || new Error("[MongoDB] Failed to connect after retries");
  })();

  return connectionPromise;
}

/**
 * Get database instance
 */
export async function getDb(): Promise<Db> {
  const mongoClient = await getMongoClient();

  // Always get fresh db reference from client (in case client was reconnected)
  if (!db || db.client !== mongoClient) {
    db = mongoClient.db(DATABASE_NAME);
    console.log(`[MongoDB] Using database: ${DATABASE_NAME}`);
  }

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
