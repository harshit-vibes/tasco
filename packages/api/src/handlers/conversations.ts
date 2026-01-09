import { NextRequest, NextResponse } from "next/server";
import {
  listConversations,
  createConversation,
  deleteConversation,
  updateConversation,
} from "@tasco/db";

/**
 * GET handler for listing conversations
 */
export async function handleListConversations(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!appId || !entityId) {
      return NextResponse.json(
        { success: false, error: "appId and entityId are required" },
        { status: 400 }
      );
    }

    const result = await listConversations(appId, entityId, limit);
    return NextResponse.json({
      success: true,
      conversations: result.items,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error listing conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a conversation
 */
export async function handleCreateConversation(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, entityId, userId, title } = body;

    if (!appId || !entityId || !userId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and userId are required" },
        { status: 400 }
      );
    }

    const conversation = await createConversation({
      appId,
      entityId,
      userId,
      title,
    });

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a conversation
 */
export async function handleDeleteConversation(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const conversationId = searchParams.get("conversationId");

    if (!appId || !entityId || !conversationId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and conversationId are required" },
        { status: 400 }
      );
    }

    await deleteConversation(appId, entityId, conversationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a conversation
 */
export async function handleUpdateConversation(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, entityId, conversationId, title, messageCount } = body;

    if (!appId || !entityId || !conversationId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and conversationId are required" },
        { status: 400 }
      );
    }

    const conversation = await updateConversation(appId, entityId, conversationId, {
      title,
      messageCount,
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
