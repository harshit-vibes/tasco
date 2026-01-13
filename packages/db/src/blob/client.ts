/**
 * Vercel Blob Storage Client
 *
 * Replaces S3 for the compliance-qa app.
 * Vercel Blob provides simple object storage with CDN distribution.
 *
 * Note: Vercel Blob doesn't have native versioning like S3.
 * We implement versioning via pathname convention: documents/{docId}/v{version}/{filename}
 */

import { put, del, list, head, copy } from "@vercel/blob";

// Base folder for all documents
const DOCUMENTS_FOLDER = "documents";

/**
 * Document version information (manual versioning)
 */
export interface BlobVersion {
  version: number;
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Blob document info returned from uploads
 */
export interface BlobDocumentInfo {
  url: string;
  pathname: string;
  downloadUrl: string;
  size: number;
  contentType?: string;
}

/**
 * Upload a document to Vercel Blob
 */
export async function uploadDocument(
  file: Buffer | Blob | ArrayBuffer | ReadableStream,
  filename: string,
  options?: {
    folder?: string;
    contentType?: string;
  }
): Promise<BlobDocumentInfo> {
  const pathname = options?.folder
    ? `${DOCUMENTS_FOLDER}/${options.folder}/${filename}`
    : `${DOCUMENTS_FOLDER}/${filename}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: options?.contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    downloadUrl: blob.downloadUrl,
    size: 0, // Size not returned by put
    contentType: options?.contentType,
  };
}

/**
 * Upload a new version of a document
 * Uses pathname convention: documents/{docId}/v{version}/{filename}
 */
export async function uploadDocumentVersion(
  file: Buffer | Blob | ArrayBuffer | ReadableStream,
  docId: string,
  version: number,
  filename: string,
  options?: {
    contentType?: string;
  }
): Promise<BlobDocumentInfo> {
  const pathname = `${DOCUMENTS_FOLDER}/${docId}/v${version}/${filename}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: options?.contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    downloadUrl: blob.downloadUrl,
    size: 0,
    contentType: options?.contentType,
  };
}

/**
 * Get document info (metadata) by URL
 */
export async function getDocumentInfo(url: string): Promise<{
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  contentType?: string;
} | null> {
  try {
    const info = await head(url);
    return {
      url: info.url,
      pathname: info.pathname,
      size: info.size,
      uploadedAt: info.uploadedAt,
      contentType: info.contentType,
    };
  } catch (error) {
    console.error("[Blob] Error getting document info:", error);
    return null;
  }
}

/**
 * Download document content as text
 */
export async function getDocument(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[Blob] Error fetching document: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error("[Blob] Error fetching document:", error);
    return null;
  }
}

/**
 * Download document content as buffer
 */
export async function getDocumentBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[Blob] Error fetching document: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[Blob] Error fetching document buffer:", error);
    return null;
  }
}

/**
 * Download document content as JSON
 */
export async function getJsonDocument<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[Blob] Error fetching JSON document: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("[Blob] Error fetching JSON document:", error);
    return null;
  }
}

/**
 * Delete a document from Vercel Blob
 */
export async function deleteDocument(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("[Blob] Error deleting document:", error);
    return false;
  }
}

/**
 * Delete multiple documents
 */
export async function deleteDocuments(urls: string[]): Promise<boolean> {
  try {
    await del(urls);
    return true;
  } catch (error) {
    console.error("[Blob] Error deleting documents:", error);
    return false;
  }
}

/**
 * List documents with a prefix
 */
export async function listDocuments(prefix?: string): Promise<
  Array<{
    url: string;
    pathname: string;
    size: number;
    uploadedAt: Date;
  }>
> {
  try {
    const fullPrefix = prefix
      ? `${DOCUMENTS_FOLDER}/${prefix}`
      : DOCUMENTS_FOLDER;

    const { blobs } = await list({ prefix: fullPrefix });

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error) {
    console.error("[Blob] Error listing documents:", error);
    return [];
  }
}

/**
 * List all versions of a document
 * Versions are stored at: documents/{docId}/v{version}/{filename}
 */
export async function listDocumentVersions(docId: string): Promise<BlobVersion[]> {
  try {
    const prefix = `${DOCUMENTS_FOLDER}/${docId}/`;
    const { blobs } = await list({ prefix });

    const versions: BlobVersion[] = [];

    for (const blob of blobs) {
      // Extract version from pathname: documents/{docId}/v{version}/{filename}
      const match = blob.pathname.match(/\/v(\d+)\//);
      if (match) {
        versions.push({
          version: parseInt(match[1], 10),
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        });
      }
    }

    // Sort by version number, descending
    versions.sort((a, b) => b.version - a.version);

    return versions;
  } catch (error) {
    console.error("[Blob] Error listing document versions:", error);
    return [];
  }
}

/**
 * Copy a document to a new location
 */
export async function copyDocument(
  sourceUrl: string,
  destinationPathname: string
): Promise<BlobDocumentInfo | null> {
  try {
    const blob = await copy(sourceUrl, destinationPathname, {
      access: "public",
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
      size: 0,
    };
  } catch (error) {
    console.error("[Blob] Error copying document:", error);
    return null;
  }
}

/**
 * Check if a document exists
 */
export async function documentExists(url: string): Promise<boolean> {
  try {
    await head(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload JSON document
 */
export async function putJsonDocument<T>(
  data: T,
  pathname: string
): Promise<BlobDocumentInfo> {
  const content = JSON.stringify(data, null, 2);
  const blob = await put(pathname, content, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    downloadUrl: blob.downloadUrl,
    size: content.length,
    contentType: "application/json",
  };
}

/**
 * Update documents index (similar to S3 pattern)
 */
export async function updateDocumentsIndex<T>(documents: T[]): Promise<boolean> {
  try {
    await putJsonDocument({ documents }, `${DOCUMENTS_FOLDER}/index.json`);
    return true;
  } catch (error) {
    console.error("[Blob] Error updating documents index:", error);
    return false;
  }
}

/**
 * Get documents index
 */
export async function getDocumentsIndex<T>(): Promise<T[]> {
  try {
    const { blobs } = await list({ prefix: `${DOCUMENTS_FOLDER}/index.json` });
    if (blobs.length === 0) return [];

    const data = await getJsonDocument<{ documents: T[] }>(blobs[0].url);
    return data?.documents || [];
  } catch (error) {
    console.error("[Blob] Error getting documents index:", error);
    return [];
  }
}
