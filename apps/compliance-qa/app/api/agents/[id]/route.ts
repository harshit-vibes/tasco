import { NextRequest } from "next/server";
import { handleGetAgent } from "@tasco/api";

// Cache agent data for 5 minutes
export const revalidate = 300;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const apiKey = process.env.NEXT_PUBLIC_LYZR_API_KEY;

  return handleGetAgent(id, { apiKey, cacheDuration: 300 });
}
