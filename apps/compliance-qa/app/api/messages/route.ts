import { NextRequest } from "next/server";
// Using MongoDB handlers for pilot migration
import { handleListMessages, handleCreateMessage } from "@/lib/handlers";

export async function GET(request: NextRequest) {
  return handleListMessages(request);
}

export async function POST(request: NextRequest) {
  return handleCreateMessage(request);
}
