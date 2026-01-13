import { NextResponse } from "next/server";
import { getAgentsByApp, getEnabledAgentsByApp, getAllSuggestionsByApp } from "@tasco/db";

const APP_ID = "customer-lifecycle";

/**
 * GET /api/agents
 * Fetch all agents for this app with their suggestions
 *
 * Query params:
 * - enabledOnly: "true" to fetch only enabled agents (default: true)
 * - suggestionsOnly: "true" to fetch only suggestions (flattened)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get("enabledOnly") !== "false";
    const suggestionsOnly = searchParams.get("suggestionsOnly") === "true";

    // If only suggestions are needed
    if (suggestionsOnly) {
      const suggestions = await getAllSuggestionsByApp(APP_ID);
      return NextResponse.json({ suggestions });
    }

    // Fetch agents
    const agents = enabledOnly
      ? await getEnabledAgentsByApp(APP_ID)
      : await getAgentsByApp(APP_ID);

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
