import { NextRequest, NextResponse } from "next/server";
import { handleListEntities } from "@tasco/api";

export async function GET(request: NextRequest) {
  return handleListEntities(request);
}
