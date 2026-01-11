import { NextRequest, NextResponse } from "next/server";
import { putDocumentBinary, getSignedUrl } from "@tasco/db/s3";
import { generateOrderId } from "@tasco/db";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Default entity ID (TODO: Get from auth session)
const DEFAULT_ENTITY_ID = "inochi";

/**
 * POST - Upload a file to S3 and return orderId + sourceUrl
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityId = (formData.get("entityId") as string) || DEFAULT_ENTITY_ID;
    const userId = (formData.get("userId") as string) || "system";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Get file info
    const fileName = file.name;
    const fileSize = file.size;
    const contentType = file.type;

    // Determine source type
    let sourceType: "pdf" | "image" | "email" | "zalo" = "pdf";
    if (contentType.startsWith("image/")) {
      sourceType = "image";
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Build S3 path: uploads/{entityId}/{year}/{month}/{orderId}/original.{ext}
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const ext = fileName.split(".").pop() || "pdf";
    const s3Path = `uploads/${entityId}/${year}/${month}/${orderId}/original.${ext}`;

    // Upload to S3
    console.log(`[Upload API] Uploading ${fileName} to S3: ${s3Path}`);
    await putDocumentBinary(s3Path, fileBuffer, contentType);

    // Build source URL
    const sourceUrl = `s3://tasco-documents/${s3Path}`;

    // Generate presigned URL for viewing (expires in 1 hour)
    const viewUrl = await getSignedUrl(s3Path, 3600);

    console.log(`[Upload API] File uploaded successfully. Order ID: ${orderId}`);

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        sourceUrl,
        viewUrl,
        fileName,
        fileSize,
        sourceType,
        entityId,
        s3Path,
      },
      message: "File uploaded successfully. Ready for extraction.",
    });
  } catch (error) {
    console.error("[Upload API] Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
