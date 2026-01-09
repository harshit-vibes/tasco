import { NextRequest, NextResponse } from "next/server";
import {
  getLatestMessages,
  createMessage,
  incrementMessageCount,
} from "@tasco/db";

/**
 * GET handler for getting messages
 */
export async function handleGetMessages(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "conversationId is required" },
        { status: 400 }
      );
    }

    const rawMessages = await getLatestMessages(conversationId, limit);

    // Extract enhancedCitations from metadata for each message
    const messages = rawMessages.map((msg) => {
      const enhancedCitations = msg.metadata?.enhancedCitations;
      if (enhancedCitations) {
        return { ...msg, enhancedCitations };
      }
      return msg;
    });

    return NextResponse.json({
      success: true,
      messages,
      hasMore: false,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a message
 */
export async function handleCreateMessage(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, role, content, citations, enhancedCitations, metadata, appId, entityId } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { success: false, error: "conversationId, role, and content are required" },
        { status: 400 }
      );
    }

    // Build metadata with enhanced citations if present
    const messageMetadata = {
      ...metadata,
      ...(enhancedCitations ? { enhancedCitations } : {}),
    };

    const message = await createMessage({
      conversationId,
      role,
      content,
      citations,
      metadata: Object.keys(messageMetadata).length > 0 ? messageMetadata : undefined,
    });

    // Add enhancedCitations to the response message for immediate use
    const responseMessage = enhancedCitations
      ? { ...message, enhancedCitations }
      : message;

    // Increment message count if appId and entityId provided
    if (appId && entityId) {
      await incrementMessageCount(appId, entityId, conversationId);
    }

    return NextResponse.json({ success: true, message: responseMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
