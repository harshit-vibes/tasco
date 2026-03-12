import { NextResponse } from "next/server";
import { getAllMessages, createMessage } from "@tasco/db/mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "conversationId is required" },
        { status: 400 }
      );
    }

    const messages = await getAllMessages(conversationId);
    return NextResponse.json({ success: true, messages, source: "mongodb" });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { conversationId, role, content, citations, metadata } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { success: false, error: "conversationId, role, and content are required" },
        { status: 400 }
      );
    }

    const message = await createMessage({
      conversationId,
      role,
      content,
      citations,
      metadata,
    });

    return NextResponse.json({ success: true, message, source: "mongodb" }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
