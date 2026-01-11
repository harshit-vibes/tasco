import { NextRequest } from "next/server";
import {
  handleListConversations,
  handleCreateConversation,
  handleDeleteConversation,
} from "@tasco/api";

export async function GET(request: NextRequest) {
  return handleListConversations(request);
}

export async function POST(request: NextRequest) {
  return handleCreateConversation(request);
}

export async function DELETE(request: NextRequest) {
  return handleDeleteConversation(request);
}
