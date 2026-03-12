/**
 * Entities API Route - Uses local MongoDB handlers
 */

import { NextResponse } from "next/server";
import { getDb } from "@tasco/db/mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    console.log("[Entities API] Direct MongoDB query test");
    const db = await getDb();
    console.log("[Entities API] Database:", db.databaseName);

    // Try to list collections
    const collections = await db.listCollections().toArray();
    console.log("[Entities API] Collections:", collections.map(c => c.name));

    const entitiesCollection = db.collection("entities");
    const count = await entitiesCollection.countDocuments({});
    console.log("[Entities API] Entities count:", count);

    const docs = await entitiesCollection.find({}).sort({ name: 1 }).toArray();
    console.log("[Entities API] Found docs:", docs.length);

    const entities = docs.map((doc) => ({
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
      debug: {
        database: db.databaseName,
        collections: collections.map(c => c.name),
        rawCount: count
      }
    });
  } catch (error) {
    console.error("[Entities API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch entities",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
