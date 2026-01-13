import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 Client configuration
// Uses default credential provider chain (IAM role on Amplify, AWS CLI locally)
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "ap-southeast-1",
});

export const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || "tasco-compliance-docs";

export { s3Client };

/**
 * Get a document from S3
 */
export async function getDocument(key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    return content || null;
  } catch (error) {
    console.error(`Error fetching document ${key}:`, error);
    return null;
  }
}

/**
 * Get JSON document from S3
 */
export async function getJsonDocument<T>(key: string): Promise<T | null> {
  const content = await getDocument(key);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error parsing JSON document ${key}:`, error);
    return null;
  }
}

/**
 * List all documents in a prefix
 */
export async function listDocuments(prefix: string = ""): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: DOCUMENTS_BUCKET,
      Prefix: prefix,
    });
    const response = await s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key || "").filter(Boolean) || [];
  } catch (error) {
    console.error(`Error listing documents with prefix ${prefix}:`, error);
    return [];
  }
}

/**
 * Legal document types for laws, decrees, and circulars
 */
export type LegalDocumentType = "law" | "decree" | "circular" | "court-decision";

/**
 * Document review status for compliance workflow
 */
export type DocumentReviewStatus = "pending" | "approved" | "rejected" | "archived";

/**
 * Get the documents index (index.json)
 */
export interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  type: string;
  category: string;
  entityId: string;
  effectiveDate: string;
  version: string;
  pages: number;
  language: string;
  tags: string[];
  summary: string;
  syncedToKB?: boolean; // Whether document is synced to knowledge base
  kbDocumentId?: string; // ID of the document in the knowledge base (if synced)
  syncedAt?: string; // When the document was synced to the knowledge base (ISO timestamp)

  // Legal document support
  jurisdiction?: string; // e.g., "Vietnam", "Singapore"
  legalType?: LegalDocumentType; // Type of legal document
  enactmentDate?: string; // When the law/decree was enacted (ISO date)
  applicableEntityIds?: string[]; // Which entities must comply with this document

  // Review workflow
  reviewStatus?: DocumentReviewStatus; // Current review status
  reviewedBy?: string; // User who reviewed the document
  reviewedAt?: string; // When the document was reviewed (ISO timestamp)
  reviewNotes?: string; // Notes from the reviewer
  complianceScore?: number; // 0-100 compliance score
  nextReviewDate?: string; // When the document should be reviewed again (ISO date)

  // OCR support for PDFs
  extractedTextFile?: string; // Path to the extracted text file (for PDFs processed by OCR)
}

export async function getDocumentsIndex(): Promise<DocumentMetadata[]> {
  const index = await getJsonDocument<{ documents: DocumentMetadata[] }>("index.json");
  return index?.documents || [];
}

/**
 * Get entities from S3
 */
export interface S3Entity {
  id: string;
  name: string;
  type: "parent" | "holding" | "subsidiary";
  parentId: string | null;
  location: string;
  employees: number;
  industry: string;
}

export async function getEntitiesFromS3(): Promise<S3Entity[]> {
  const entities = await getJsonDocument<{ entities: S3Entity[] }>("entities.json");
  return entities?.entities || [];
}

/**
 * Upload a document to S3 (text content)
 */
export async function putDocument(key: string, content: string, contentType: string = "text/plain"): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Error uploading document ${key}:`, error);
    return false;
  }
}

/**
 * Upload a binary document to S3 (PDFs, images, etc.)
 */
export async function putDocumentBinary(key: string, content: Buffer | Uint8Array, contentType: string): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Error uploading binary document ${key}:`, error);
    return false;
  }
}

/**
 * Delete a document from S3
 */
export async function deleteDocument(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${key}:`, error);
    return false;
  }
}

/**
 * Update the documents index (index.json)
 */
export async function updateDocumentsIndex(documents: DocumentMetadata[]): Promise<boolean> {
  try {
    const content = JSON.stringify({ documents }, null, 2);
    return await putDocument("index.json", content, "application/json");
  } catch (error) {
    console.error("Error updating documents index:", error);
    return false;
  }
}

/**
 * Get a signed URL for a document (for direct browser access)
 * @param key - S3 key of the document
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    const signedUrl = await awsGetSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error(`Error generating signed URL for ${key}:`, error);
    return null;
  }
}

/**
 * Get document as binary buffer (for PDFs and other binary files)
 */
export async function getDocumentBuffer(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    const response = await s3Client.send(command);
    const bytes = await response.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch (error) {
    console.error(`Error fetching document buffer ${key}:`, error);
    return null;
  }
}

// ==========================================
// Document Versioning Support
// ==========================================

/**
 * Document version information
 */
export interface DocumentVersion {
  versionId: string;
  key: string;
  lastModified: Date;
  size: number;
  isLatest: boolean;
  isDeleteMarker: boolean;
}

/**
 * List all versions of a document
 * Requires S3 bucket versioning to be enabled
 */
export async function listDocumentVersions(key: string): Promise<DocumentVersion[]> {
  try {
    const command = new ListObjectVersionsCommand({
      Bucket: DOCUMENTS_BUCKET,
      Prefix: key,
    });
    const response = await s3Client.send(command);

    const versions: DocumentVersion[] = [];

    // Add regular versions
    if (response.Versions) {
      for (const version of response.Versions) {
        if (version.Key === key) {
          versions.push({
            versionId: version.VersionId || "null",
            key: version.Key,
            lastModified: version.LastModified || new Date(),
            size: version.Size || 0,
            isLatest: version.IsLatest || false,
            isDeleteMarker: false,
          });
        }
      }
    }

    // Add delete markers
    if (response.DeleteMarkers) {
      for (const marker of response.DeleteMarkers) {
        if (marker.Key === key) {
          versions.push({
            versionId: marker.VersionId || "null",
            key: marker.Key,
            lastModified: marker.LastModified || new Date(),
            size: 0,
            isLatest: marker.IsLatest || false,
            isDeleteMarker: true,
          });
        }
      }
    }

    // Sort by date, newest first
    versions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return versions;
  } catch (error) {
    console.error(`Error listing versions for ${key}:`, error);
    return [];
  }
}

/**
 * Get a specific version of a document
 */
export async function getDocumentVersion(key: string, versionId: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      VersionId: versionId,
    });
    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    return content || null;
  } catch (error) {
    console.error(`Error fetching document version ${key}@${versionId}:`, error);
    return null;
  }
}

/**
 * Get a specific version of a document as buffer
 */
export async function getDocumentVersionBuffer(key: string, versionId: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      VersionId: versionId,
    });
    const response = await s3Client.send(command);
    const bytes = await response.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch (error) {
    console.error(`Error fetching document version buffer ${key}@${versionId}:`, error);
    return null;
  }
}

/**
 * Restore a previous version by copying it as the current version
 * This creates a new version with the content of the specified version
 */
export async function restoreDocumentVersion(key: string, versionId: string): Promise<boolean> {
  try {
    // Get the content of the version to restore
    const content = await getDocumentVersionBuffer(key, versionId);
    if (!content) {
      console.error(`Could not fetch version ${versionId} of ${key}`);
      return false;
    }

    // Get content type from the version
    const headCommand = new HeadObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      VersionId: versionId,
    });
    const headResponse = await s3Client.send(headCommand);
    const contentType = headResponse.ContentType || "application/octet-stream";

    // Upload as new current version
    const putCommand = new PutObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
    });
    await s3Client.send(putCommand);

    return true;
  } catch (error) {
    console.error(`Error restoring version ${versionId} of ${key}:`, error);
    return false;
  }
}

/**
 * Get a signed URL for a specific version of a document
 */
export async function getSignedUrlForVersion(
  key: string,
  versionId: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
      VersionId: versionId,
    });
    const signedUrl = await awsGetSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error(`Error generating signed URL for ${key}@${versionId}:`, error);
    return null;
  }
}

/**
 * Get current version ID of a document
 */
export async function getCurrentVersionId(key: string): Promise<string | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.VersionId || null;
  } catch (error) {
    console.error(`Error getting current version ID for ${key}:`, error);
    return null;
  }
}
