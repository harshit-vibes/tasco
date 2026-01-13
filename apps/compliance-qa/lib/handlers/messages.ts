/**
 * MongoDB-based Messages Handler
 *
 * Handles message CRUD operations using MongoDB instead of DynamoDB.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listMessages,
  getAllMessages,
  createMessage,
  deleteMessage,
} from "@tasco/db/mongodb";

/**
 * GET handler for listing messages
 */
export async function handleListMessages(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const all = searchParams.get("all") === "true";

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "conversationId is required" },
        { status: 400 }
      );
    }

    // If all=true, return all messages without pagination
    if (all) {
      const messages = await getAllMessages(conversationId);
      return NextResponse.json({
        success: true,
        messages,
        total: messages.length,
        hasMore: false,
      });
    }

    const result = await listMessages(conversationId, {
      page,
      pageSize: limit,
      sortOrder: "asc", // Messages should be in chronological order
    });

    return NextResponse.json({
      success: true,
      messages: result.items,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("[MongoDB] Error listing messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list messages" },
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
    const { conversationId, role, content, citations, enhancedCitations, validation, metadata } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { success: false, error: "conversationId, role, and content are required" },
        { status: 400 }
      );
    }

    if (!["user", "assistant", "system"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "role must be 'user', 'assistant', or 'system'" },
        { status: 400 }
      );
    }

    const message = await createMessage({
      conversationId,
      role,
      content,
      citations,
      enhancedCitations,
      validation,
      metadata,
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("[MongoDB] Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a message
 */
export async function handleDeleteMessage(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "messageId is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteMessage(messageId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MongoDB] Error deleting message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
