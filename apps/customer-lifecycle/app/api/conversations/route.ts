import { NextResponse } from "next/server";
import {
  listConversations,
  createConversation,
  deleteConversation,
  updateConversation,
  createNotification,
} from "@tasco/db";

const APP_ID = "customer-lifecycle";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");

    if (!appId || !entityId) {
      return NextResponse.json(
        { success: false, error: "appId and entityId are required" },
        { status: 400 }
      );
    }

    const result = await listConversations(appId, entityId);
    return NextResponse.json({ success: true, conversations: result.items });
  } catch (error) {
    console.error("Error listing conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { appId, entityId, title, userId } = body;

    if (!appId || !entityId || !userId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId and userId are required" },
        { status: 400 }
      );
    }

    const conversation = await createConversation({
      appId,
      entityId,
      title,
      userId,
    });

    // Create notification (async, don't block response)
    createNotification({
      type: "created",
      category: "conversation",
      title: `New conversation: ${title || "Untitled"}`,
      message: `AI conversation started`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/`,
      metadata: { conversationId: conversation.id },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const conversationId = searchParams.get("conversationId") || searchParams.get("id");

    if (!appId || !entityId || !conversationId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId and conversationId are required" },
        { status: 400 }
      );
    }

    await deleteConversation(appId, entityId, conversationId);

    // Create notification (async, don't block response)
    createNotification({
      type: "deleted",
      category: "conversation",
      title: `Conversation deleted`,
      message: `AI conversation has been removed`,
      appId: APP_ID,
      priority: "low",
      actionUrl: `/`,
      metadata: { conversationId },
    }).catch((err) => console.error("[Notification] Failed to create:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { appId, entityId, conversationId, ...updates } = body;

    if (!appId || !entityId || !conversationId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId and conversationId are required" },
        { status: 400 }
      );
    }

    const conversation = await updateConversation(appId, entityId, conversationId, updates);
    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
