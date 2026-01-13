import { NextRequest } from "next/server";
// Using MongoDB handlers for pilot migration
import {
  handleListConversations,
  handleCreateConversation,
  handleDeleteConversation,
  handleUpdateConversation,
} from "@/lib/handlers";

export async function GET(request: NextRequest) {
  return handleListConversations(request);
}

export async function POST(request: NextRequest) {
  return handleCreateConversation(request);
}

export async function DELETE(request: NextRequest) {
  return handleDeleteConversation(request);
}

export async function PATCH(request: NextRequest) {
  return handleUpdateConversation(request);
}
