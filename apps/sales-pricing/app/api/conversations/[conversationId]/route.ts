import { NextRequest } from "next/server";
import {
  handleGetConversation,
  handleUpdateConversation,
  handleDeleteConversation,
} from "@tasco/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  return handleGetConversation(request, { appId: "sales-pricing", conversationId });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  return handleUpdateConversation(request, { appId: "sales-pricing", conversationId });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  return handleDeleteConversation(request, { appId: "sales-pricing", conversationId });
}
