/**
 * MongoDB-based Guide Handlers for compliance-qa
 *
 * Local handlers that use MongoDB instead of DynamoDB.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAppGuide, putAppGuide, deleteAppGuide } from "@tasco/db/mongodb";

const APP_ID = "compliance-qa";

/**
 * GET handler - Get app guide by language
 */
export async function handleGetGuide(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || "en";

    const guide = await getAppGuide(APP_ID, language);

    if (!guide) {
      return NextResponse.json(
        { success: false, error: "Guide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("[Guide API] Error fetching guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch guide",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Create or update app guide
 */
export async function handlePutGuide(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || body.language || "en";

    if (!body.appName || !body.slides) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: appName, slides" },
        { status: 400 }
      );
    }

    const guide = await putAppGuide({
      appId: APP_ID,
      language,
      appName: body.appName,
      appTagline: body.appTagline || "",
      slides: body.slides,
      onePager: body.onePager,
      ctaText: body.ctaText,
      enabled: body.enabled,
    });

    return NextResponse.json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("[Guide API] Error updating guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update guide",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete app guide
 */
export async function handleDeleteGuide(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || "en";

    const deleted = await deleteAppGuide(APP_ID, language);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Guide not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guide deleted successfully",
    });
  } catch (error) {
    console.error("[Guide API] Error deleting guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete guide",
      },
      { status: 500 }
    );
  }
}
