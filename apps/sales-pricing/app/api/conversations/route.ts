import { NextRequest } from "next/server";
import { handleListConversations, handleCreateConversation } from "@tasco/api";

export async function GET(request: NextRequest) {
  return handleListConversations(request, { appId: "sales-pricing" });
}

export async function POST(request: NextRequest) {
  return handleCreateConversation(request, { appId: "sales-pricing" });
}
