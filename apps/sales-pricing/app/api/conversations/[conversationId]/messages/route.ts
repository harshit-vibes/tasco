import { NextRequest } from "next/server";
import { handleGetMessages, handleCreateMessage } from "@tasco/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  return handleGetMessages(request, { conversationId });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  return handleCreateMessage(request, { conversationId });
}
