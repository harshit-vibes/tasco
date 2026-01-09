import { NextResponse } from "next/server";
import { getDocumentsIndex, getDocument, type DocumentMetadata } from "@tasco/db/s3";
import { getAllDocumentSyncStatuses, getDocumentSyncStatus } from "@tasco/db";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Entity lookup map for joining entity names
const ENTITIES: Record<string, { name: string; shortName: string }> = {
  "tasco-group": { name: "Tasco Group Holdings", shortName: "Tasco Group" },
  "tasco-insurance": { name: "Tasco Insurance JSC", shortName: "Tasco Insurance" },
  "tasco-life": { name: "Tasco Life Insurance", shortName: "Tasco Life" },
  "tasco-general": { name: "Tasco General Insurance", shortName: "Tasco General" },
  "tasco-auto": { name: "Tasco Auto JSC", shortName: "Tasco Auto" },
  "inochi": { name: "Inochi Vietnam JSC", shortName: "Inochi" },
  "thang-long": { name: "Thang Long Materials JSC", shortName: "Thang Long" },
  "dnp-water": { name: "DNP Water JSC", shortName: "DNP Water" },
};

// Reverse lookup: map entity names to their IDs
const ENTITY_NAME_TO_ID: Record<string, string> = {};
for (const [id, data] of Object.entries(ENTITIES)) {
  ENTITY_NAME_TO_ID[data.shortName.toLowerCase()] = id;
  ENTITY_NAME_TO_ID[data.name.toLowerCase()] = id;
}

// Get effective entityId from document (handles legacy data)
function getEffectiveEntityId(doc: DocumentMetadata & { entity?: string }): string {
  // If entityId exists, use it
  if (doc.entityId) return doc.entityId;

  // Try to map legacy entity name to ID
  if ((doc as { entity?: string }).entity) {
    const legacyEntity = (doc as { entity?: string }).entity!;
    const mappedId = ENTITY_NAME_TO_ID[legacyEntity.toLowerCase()];
    if (mappedId) return mappedId;
    // If no mapping found, use the entity name as-is
    return legacyEntity;
  }

  return "unknown";
}

// Enrich document with entity name
function enrichDocument(doc: DocumentMetadata & { entity?: string }, syncedToKB?: boolean) {
  const effectiveId = getEffectiveEntityId(doc);
  const entityData = ENTITIES[effectiveId];
  return {
    ...doc,
    entityId: effectiveId,
    entity: entityData?.shortName || effectiveId,
    entityName: entityData?.name || effectiveId,
    // Use sync status from DynamoDB if available, otherwise use S3 value
    syncedToKB: syncedToKB !== undefined ? syncedToKB : (doc.syncedToKB ?? false),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const entityId = searchParams.get("entityId");

  try {
    // Get sync statuses from DynamoDB
    let syncStatuses: Record<string, { syncedToKB: boolean }> = {};
    try {
      syncStatuses = await getAllDocumentSyncStatuses();
    } catch (dbError) {
      console.warn("Could not fetch sync statuses from DynamoDB:", dbError);
      // Continue without sync status - will use S3 values
    }

    // If specific document requested, return its content
    if (id) {
      const index = await getDocumentsIndex();
      const doc = index.find((d) => d.id === id);

      if (!doc) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      const content = await getDocument(doc.filename);
      const syncStatus = syncStatuses[id];

      return NextResponse.json({
        success: true,
        document: {
          ...enrichDocument(doc as DocumentMetadata & { entity?: string }, syncStatus?.syncedToKB),
          content,
        },
      });
    }

    // Otherwise return document index
    let documents = await getDocumentsIndex();

    // Filter by category if provided
    if (category) {
      documents = documents.filter((d) => d.category === category);
    }

    // Filter by entityId if provided (using effective entityId for legacy support)
    if (entityId) {
      documents = documents.filter((d) => getEffectiveEntityId(d as DocumentMetadata & { entity?: string }) === entityId);
    }

    // Enrich all documents with entity names and sync status
    const enrichedDocuments = documents.map((d) => {
      const syncStatus = syncStatuses[d.id];
      return enrichDocument(d as DocumentMetadata & { entity?: string }, syncStatus?.syncedToKB);
    });

    // Calculate document counts per entity (using effective entityId)
    const allDocs = await getDocumentsIndex();
    const entityCounts: Record<string, number> = {};
    for (const doc of allDocs) {
      const effectiveId = getEffectiveEntityId(doc as DocumentMetadata & { entity?: string });
      entityCounts[effectiveId] = (entityCounts[effectiveId] || 0) + 1;
    }

    return NextResponse.json(
      {
        success: true,
        documents: enrichedDocuments,
        count: enrichedDocuments.length,
        entityCounts,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
