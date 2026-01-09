import { NextRequest } from "next/server";
import { handleGetMessages, handleCreateMessage } from "@tasco/api";

export async function GET(request: NextRequest) {
  return handleGetMessages(request);
}

export async function POST(request: NextRequest) {
  return handleCreateMessage(request);
}
