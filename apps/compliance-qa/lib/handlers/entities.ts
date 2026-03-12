/**
 * MongoDB-based Entity Handlers for compliance-qa
 *
 * Local handlers that use MongoDB instead of DynamoDB.
 */

import { NextResponse } from "next/server";
import { getDb } from "@tasco/db/mongodb";

// Entity types
export interface Entity {
  id: string;
  entityId: string;
  name: string;
  shortName?: string;
  type: "parent" | "holding" | "subsidiary";
  category?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET handler - List all entities
 */
export async function handleListEntities() {
  try {
    console.log("[Entities] Starting entity list request - v2");
    console.log("[Entities] MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("[Entities] MONGODB_DATABASE:", process.env.MONGODB_DATABASE || "(default: compliance-qa)");
    const db = await getDb();
    console.log("[Entities] Database name:", db.databaseName);
    const collection = db.collection("entities");
    console.log("[Entities] Collection name: entities");

    const docs = await collection.find({}).sort({ name: 1 }).toArray();
    console.log("[Entities] Found", docs.length, "entities");

    const entities: Entity[] = docs.map((doc) => ({
      id: doc._id?.toHexString() || doc.entityId,
      entityId: doc.entityId,
      name: doc.name,
      shortName: doc.shortName,
      type: doc.type,
      category: doc.category,
      parentId: doc.parentId,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      entities,
      count: entities.length,
    });
  } catch (error) {
    console.error("[Entities API] Error fetching entities:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch entities",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Get single entity by ID
 */
export async function handleGetEntity(entityId: string) {
  try {
    const db = await getDb();
    const collection = db.collection("entities");

    const doc = await collection.findOne({ entityId });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Entity not found" },
        { status: 404 }
      );
    }

    const entity: Entity = {
      id: doc._id?.toHexString() || doc.entityId,
      entityId: doc.entityId,
      name: doc.name,
      shortName: doc.shortName,
      type: doc.type,
      category: doc.category,
      parentId: doc.parentId,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      entity,
    });
  } catch (error) {
    console.error("[Entities API] Error fetching entity:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch entity",
      },
      { status: 500 }
    );
  }
}
