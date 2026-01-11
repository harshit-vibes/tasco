import { NextResponse } from "next/server";
import {
  getDocumentsIndex,
  getDocument,
  putDocument,
  deleteDocument,
  updateDocumentsIndex,
  type DocumentMetadata,
} from "@tasco/db/s3";
import {
  getAllDocumentSyncStatuses,
  deleteDocumentSyncStatus,
  getContentType,
  generateDocumentId,
  sanitizeFilename,
  estimatePageCount,
  getEntityMap,
  type EntityMap,
} from "@tasco/db";

/**
 * Entity configuration for document enrichment
 */
export interface EntityConfig {
  id: string;
  name: string;
  shortName: string;
}

/**
 * Configuration for the document handler factory
 */
export interface DocumentsHandlerConfig {
  /** Default entity ID when none specified */
  defaultEntity: string;
  /** Default document type (e.g., "policy", "procedure") */
  defaultDocumentType?: string;
  /** Path to the sync API endpoint (for internal sync calls) */
  syncApiPath?: string;
}

/**
 * Enriched document with entity information
 */
export interface EnrichedDocument extends DocumentMetadata {
  entityId: string;
  entity: string;
  entityName: string;
  syncedToKB: boolean;
}

/**
 * Response types for document operations
 */
export interface DocumentResponse {
  success: boolean;
  document?: EnrichedDocument;
  documents?: EnrichedDocument[];
  count?: number;
  entityCounts?: Record<string, number>;
  message?: string;
  error?: string;
}

/**
 * Document statistics for dashboard
 */
export interface DocumentStats {
  total: number;
  syncedToKB: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
  byCategory: Record<string, number>;
  byLegalType: Record<string, number>;
}

/**
 * Creates document CRUD handlers that fetch entities from the database
 *
 * @example
 * ```ts
 * const { GET, POST, PATCH, DELETE } = createDocumentsHandler({
 *   defaultEntity: "tasco-group",
 *   syncApiPath: "/api/documents/sync",
 * });
 * ```
 */
export function createDocumentsHandler(config: DocumentsHandlerConfig) {
  const {
    defaultEntity,
    defaultDocumentType = "policy",
    syncApiPath = "/api/documents/sync",
  } = config;

  // Cache for entities loaded from database
  let cachedEntities: EntityMap | null = null;
  let cachedEntityNameToId: Record<string, string> | null = null;

  /**
   * Get entities from database (cached)
   */
  async function getEntities(): Promise<EntityMap> {
    if (!cachedEntities) {
      cachedEntities = await getEntityMap();
      // Build reverse lookup: map entity names to their IDs
      cachedEntityNameToId = {};
      for (const [id, data] of Object.entries(cachedEntities)) {
        cachedEntityNameToId[data.shortName.toLowerCase()] = id;
        cachedEntityNameToId[data.name.toLowerCase()] = id;
      }
    }
    return cachedEntities;
  }

  /**
   * Get entity name to ID lookup (cached)
   */
  async function getEntityNameToId(): Promise<Record<string, string>> {
    await getEntities(); // Ensures cache is populated
    return cachedEntityNameToId!;
  }

  /**
   * Get effective entityId from document (handles legacy data)
   */
  async function getEffectiveEntityId(doc: DocumentMetadata & { entity?: string }): Promise<string> {
    // If entityId exists, use it
    if (doc.entityId) return doc.entityId;

    // Try to map legacy entity name to ID
    if (doc.entity) {
      const entityNameToId = await getEntityNameToId();
      const mappedId = entityNameToId[doc.entity.toLowerCase()];
      if (mappedId) return mappedId;
      // If no mapping found, use the entity name as-is
      return doc.entity;
    }

    return defaultEntity;
  }

  /**
   * Enrich document with entity name and sync status
   */
  async function enrichDocument(
    doc: DocumentMetadata & { entity?: string },
    syncedToKB?: boolean
  ): Promise<EnrichedDocument> {
    const entities = await getEntities();
    const effectiveId = await getEffectiveEntityId(doc);
    const entityData = entities[effectiveId];
    return {
      ...doc,
      entityId: effectiveId,
      entity: entityData?.shortName || effectiveId,
      entityName: entityData?.name || effectiveId,
      syncedToKB: syncedToKB !== undefined ? syncedToKB : (doc.syncedToKB ?? false),
    };
  }

  /**
   * GET - List documents or get a specific document
   * Supports: ?id=<id>, ?category=<cat>, ?entityId=<eid>, ?stats=true
   */
  async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const entityId = searchParams.get("entityId");
    const stats = searchParams.get("stats");

    try {
      // Get sync statuses from DynamoDB
      let syncStatuses: Record<string, { syncedToKB: boolean }> = {};
      try {
        syncStatuses = await getAllDocumentSyncStatuses();
      } catch (dbError) {
        console.warn("Could not fetch sync statuses from DynamoDB:", dbError);
      }

      // If stats requested, return aggregated statistics for dashboard
      if (stats === "true") {
        const allDocs = await getDocumentsIndex();
        const statsData: DocumentStats = {
          total: allDocs.length,
          syncedToKB: Object.values(syncStatuses).filter((s) => s.syncedToKB).length,
          byStatus: {
            pending: allDocs.filter((d) => d.reviewStatus === "pending").length,
            approved: allDocs.filter((d) => d.reviewStatus === "approved").length,
            rejected: allDocs.filter((d) => d.reviewStatus === "rejected").length,
            archived: allDocs.filter((d) => d.reviewStatus === "archived").length,
          },
          byCategory: {},
          byLegalType: {},
        };

        // Count by category
        for (const doc of allDocs) {
          const cat = doc.category || "General";
          statsData.byCategory[cat] = (statsData.byCategory[cat] || 0) + 1;
          if (doc.legalType) {
            statsData.byLegalType[doc.legalType] = (statsData.byLegalType[doc.legalType] || 0) + 1;
          }
        }

        return NextResponse.json({
          success: true,
          stats: statsData,
        });
      }

      // If specific document requested, return its content
      if (id) {
        const index = await getDocumentsIndex();
        // Try to find by ID first, then by name (case-insensitive)
        let doc = index.find((d) => d.id === id);
        if (!doc) {
          doc = index.find((d) => d.name === id);
        }
        if (!doc) {
          doc = index.find((d) => d.name.toLowerCase() === id.toLowerCase());
        }

        if (!doc) {
          return NextResponse.json(
            { success: false, error: "Document not found" },
            { status: 404 }
          );
        }

        const content = await getDocument(doc.filename);
        const syncStatus = syncStatuses[doc.id];
        const enrichedDoc = await enrichDocument(doc as DocumentMetadata & { entity?: string }, syncStatus?.syncedToKB);

        return NextResponse.json({
          success: true,
          document: {
            ...enrichedDoc,
            content,
          },
        });
      }

      // Get all documents
      const allDocs = await getDocumentsIndex();

      // Calculate document counts per entity (from all docs before filtering)
      const entityCounts: Record<string, number> = {};
      for (const doc of allDocs) {
        const effectiveId = await getEffectiveEntityId(doc as DocumentMetadata & { entity?: string });
        entityCounts[effectiveId] = (entityCounts[effectiveId] || 0) + 1;
      }

      // Apply filters
      let documents = allDocs;

      if (category) {
        documents = documents.filter((d) => d.category === category);
      }

      if (entityId) {
        // Filter documents by entityId - need to await each check
        const filteredDocs: typeof documents = [];
        for (const d of documents) {
          const effectiveEntityId = await getEffectiveEntityId(d as DocumentMetadata & { entity?: string });
          if (effectiveEntityId === entityId) {
            filteredDocs.push(d);
          }
        }
        documents = filteredDocs;
      }

      // Enrich all documents
      const enrichedDocuments = await Promise.all(
        documents.map(async (d) => {
          const syncStatus = syncStatuses[d.id];
          return enrichDocument(d as DocumentMetadata & { entity?: string }, syncStatus?.syncedToKB);
        })
      );

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

  /**
   * POST - Upload a new document
   */
  async function POST(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const {
        name,
        content,
        filename: originalFilename,
        category,
        entityId,
        tags,
        summary,
        syncToKB,
        // Legal document fields
        jurisdiction,
        legalType,
        enactmentDate,
        applicableEntityIds,
        // Review workflow fields
        reviewStatus,
        reviewNotes,
      } = body;

      if (!name || !content) {
        return NextResponse.json(
          { success: false, error: "Name and content are required" },
          { status: 400 }
        );
      }

      // Generate document ID and filename
      const docId = generateDocumentId(name);
      const ext = originalFilename
        ? originalFilename.split(".").pop()?.toLowerCase() || "md"
        : "md";
      const sanitizedName = sanitizeFilename(name);
      const filename = `documents/${sanitizedName}.${ext}`;
      const contentType = getContentType(ext);

      // Upload document content to S3
      const uploadSuccess = await putDocument(filename, content, contentType);
      if (!uploadSuccess) {
        return NextResponse.json(
          { success: false, error: "Failed to upload document to S3" },
          { status: 500 }
        );
      }

      // Get current index and add new document
      const currentDocs = await getDocumentsIndex();
      const newDoc: DocumentMetadata = {
        id: docId,
        name,
        filename,
        type: defaultDocumentType,
        category: category || "General",
        entityId: entityId || defaultEntity,
        effectiveDate: new Date().toISOString().split("T")[0],
        version: "1.0",
        pages: estimatePageCount(content),
        language: "en",
        tags: tags || [],
        summary: summary || name,
        syncedToKB: false,
        // Legal document fields (optional)
        ...(jurisdiction && { jurisdiction }),
        ...(legalType && { legalType }),
        ...(enactmentDate && { enactmentDate }),
        ...(applicableEntityIds && { applicableEntityIds }),
        // Review workflow fields (optional)
        ...(reviewStatus && { reviewStatus }),
        ...(reviewNotes && { reviewNotes }),
      };

      const updatedDocs = [...currentDocs, newDoc];
      const indexSuccess = await updateDocumentsIndex(updatedDocs);

      if (!indexSuccess) {
        // Rollback: delete the uploaded document
        await deleteDocument(filename);
        return NextResponse.json(
          { success: false, error: "Failed to update document index" },
          { status: 500 }
        );
      }

      // If syncToKB is true, trigger sync to Lyzr RAG
      let finalDoc = newDoc;
      if (syncToKB) {
        try {
          const syncResponse = await fetch(new URL(syncApiPath, request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: docId, action: "sync" }),
          });

          if (syncResponse.ok) {
            finalDoc = { ...newDoc, syncedToKB: true };
            const updatedWithSync = updatedDocs.map((d) => (d.id === docId ? finalDoc : d));
            await updateDocumentsIndex(updatedWithSync);
          }
        } catch (syncError) {
          console.warn("Auto-sync failed, document uploaded without sync:", syncError);
        }
      }

      const enrichedDoc = await enrichDocument(finalDoc as DocumentMetadata & { entity?: string });
      return NextResponse.json({
        success: true,
        document: enrichedDoc,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to upload document" },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH - Update document metadata
   */
  async function PATCH(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const {
        id,
        name,
        category,
        entityId,
        summary,
        tags,
        // Legal document fields
        jurisdiction,
        legalType,
        enactmentDate,
        applicableEntityIds,
        // Review workflow fields
        reviewStatus,
        reviewedBy,
        reviewNotes,
        complianceScore,
        nextReviewDate,
      } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Document ID is required" },
          { status: 400 }
        );
      }

      const currentDocs = await getDocumentsIndex();
      const docIndex = currentDocs.findIndex((d) => d.id === id);

      if (docIndex === -1) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Update document fields
      const updatedDoc = {
        ...currentDocs[docIndex],
        ...(name && { name }),
        ...(category && { category }),
        ...(entityId && { entityId }),
        ...(summary && { summary }),
        ...(tags && {
          tags: Array.isArray(tags)
            ? tags
            : tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean),
        }),
        // Legal document fields
        ...(jurisdiction && { jurisdiction }),
        ...(legalType && { legalType }),
        ...(enactmentDate && { enactmentDate }),
        ...(applicableEntityIds && { applicableEntityIds }),
        // Review workflow fields
        ...(reviewStatus && { reviewStatus }),
        ...(reviewedBy && { reviewedBy }),
        ...(reviewNotes !== undefined && { reviewNotes }),
        ...(complianceScore !== undefined && { complianceScore }),
        ...(nextReviewDate && { nextReviewDate }),
        // Auto-set reviewedAt when reviewStatus changes
        ...(reviewStatus && { reviewedAt: new Date().toISOString() }),
      };

      const updatedDocs = [...currentDocs];
      updatedDocs[docIndex] = updatedDoc;
      const indexSuccess = await updateDocumentsIndex(updatedDocs);

      if (!indexSuccess) {
        return NextResponse.json(
          { success: false, error: "Failed to update document" },
          { status: 500 }
        );
      }

      const enrichedDoc = await enrichDocument(updatedDoc as DocumentMetadata & { entity?: string });
      return NextResponse.json({
        success: true,
        document: enrichedDoc,
      });
    } catch (error) {
      console.error("Error updating document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update document" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE - Remove a document
   */
  async function DELETE(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    try {
      const currentDocs = await getDocumentsIndex();
      const docToDelete = currentDocs.find((d) => d.id === id);

      if (!docToDelete) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Get sync statuses to check if document is synced to RAG
      let syncStatuses: Record<string, { syncedToKB: boolean }> = {};
      try {
        syncStatuses = await getAllDocumentSyncStatuses();
      } catch (dbError) {
        console.warn("Could not fetch sync statuses:", dbError);
      }

      // If document is synced to RAG, unsync it first
      const isSynced =
        syncStatuses[id]?.syncedToKB ||
        (docToDelete as DocumentMetadata & { syncedToKB?: boolean }).syncedToKB;
      if (isSynced) {
        console.log(`Document ${id} is synced to RAG, unsyncing before delete...`);
        try {
          const syncResponse = await fetch(new URL(syncApiPath, request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: id, action: "unsync" }),
          });

          if (syncResponse.ok) {
            console.log(`Successfully unsynced document ${id} from RAG`);
          } else {
            console.warn(`Failed to unsync document ${id} from RAG, continuing with delete`);
          }
        } catch (syncError) {
          console.warn(`Error unsyncing document ${id}:`, syncError);
        }
      }

      // Delete the document file from S3
      const deleteSuccess = await deleteDocument(docToDelete.filename);
      if (!deleteSuccess) {
        console.warn(
          `Failed to delete document file ${docToDelete.filename}, continuing with index update`
        );
      }

      // Remove from index
      const updatedDocs = currentDocs.filter((d) => d.id !== id);
      const indexSuccess = await updateDocumentsIndex(updatedDocs);

      if (!indexSuccess) {
        return NextResponse.json(
          { success: false, error: "Failed to update document index" },
          { status: 500 }
        );
      }

      // Clean up sync status from DynamoDB
      try {
        await deleteDocumentSyncStatus(id);
      } catch (dbError) {
        console.warn("Could not delete sync status from DynamoDB:", dbError);
      }

      return NextResponse.json({
        success: true,
        message: `Document "${docToDelete.name}" deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete document" },
        { status: 500 }
      );
    }
  }

  return { GET, POST, PATCH, DELETE };
}

// Re-export types for convenience
export type { DocumentMetadata } from "@tasco/db/s3";
