/**
 * App Guide API Handler
 *
 * Provides API endpoints for fetching and managing app guides
 * (feature showcase / help carousel content).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAppGuide,
  getAppGuides,
  putAppGuide,
  deleteAppGuide,
  type AppGuide,
  type CreateAppGuideInput,
} from "@tasco/db";

export interface GuideHandlerConfig {
  appId: string;
  defaultLanguage?: string;
}

/**
 * Handle GET request - fetch app guide
 * Query params:
 * - lang: language code (default: "en")
 * - all: if "true", fetch all languages for the app
 */
export async function handleGetGuide(
  request: NextRequest,
  config: GuideHandlerConfig
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || config.defaultLanguage || "en";
    const fetchAll = searchParams.get("all") === "true";

    if (fetchAll) {
      // Fetch all guides for the app (all languages)
      const guides = await getAppGuides(config.appId);
      return NextResponse.json({
        success: true,
        guides,
      });
    }

    // Fetch specific language guide
    const guide = await getAppGuide(config.appId, language);

    if (!guide) {
      // Try fallback to English if requested language not found
      if (language !== "en") {
        const fallbackGuide = await getAppGuide(config.appId, "en");
        if (fallbackGuide) {
          return NextResponse.json({
            success: true,
            guide: fallbackGuide,
            fallback: true,
            requestedLanguage: language,
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Guide not found",
          appId: config.appId,
          language,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("Error fetching app guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch guide",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle PUT request - create or update app guide
 * Body: CreateAppGuideInput (appId and language are from body, not config)
 */
export async function handlePutGuide(
  request: NextRequest,
  _config: GuideHandlerConfig
): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.appId || !body.language || !body.appName || !body.slides) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: appId, language, appName, slides",
        },
        { status: 400 }
      );
    }

    // Validate slides structure
    if (!Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "slides must be a non-empty array",
        },
        { status: 400 }
      );
    }

    const input: CreateAppGuideInput = {
      appId: body.appId,
      language: body.language,
      appName: body.appName,
      appTagline: body.appTagline || "",
      slides: body.slides,
      ctaText: body.ctaText,
      enabled: body.enabled ?? true,
    };

    const guide = await putAppGuide(input);

    return NextResponse.json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("Error saving app guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save guide",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle DELETE request - delete app guide
 * Query params:
 * - lang: language code (required)
 */
export async function handleDeleteGuide(
  request: NextRequest,
  config: GuideHandlerConfig
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang");

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: lang",
        },
        { status: 400 }
      );
    }

    const success = await deleteAppGuide(config.appId, language);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete guide",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Guide deleted: ${config.appId}/${language}`,
    });
  } catch (error) {
    console.error("Error deleting app guide:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete guide",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Create guide handler configured for a specific app
 */
export function createGuideHandler(config: GuideHandlerConfig) {
  return {
    handleGet: (request: NextRequest) => handleGetGuide(request, config),
    handlePut: (request: NextRequest) => handlePutGuide(request, config),
    handleDelete: (request: NextRequest) => handleDeleteGuide(request, config),
  };
}

// Re-export types for consumers
export type { AppGuide, CreateAppGuideInput, GuideSlide, GuideIcon, GuideIconColor } from "@tasco/db";
