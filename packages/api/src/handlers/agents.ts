import { NextRequest, NextResponse } from "next/server";

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai";

// Required headers for Lyzr API (Origin + User-Agent headers are required)
const BROWSER_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const getHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "x-api-key": apiKey,
  "Origin": "https://studio.lyzr.ai",
  "User-Agent": BROWSER_USER_AGENT,
  "Accept": "application/json",
});

// In-memory cache for agent data
const agentCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface AgentHandlerConfig {
  /** Lyzr API key */
  apiKey?: string;
  /** Cache duration in seconds */
  cacheDuration?: number;
}

/**
 * GET handler for fetching agent details
 */
export async function handleGetAgent(
  agentId: string,
  config: AgentHandlerConfig = {}
) {
  const { apiKey, cacheDuration = 300 } = config;

  try {
    // Check in-memory cache first
    const cached = agentCache.get(agentId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { success: true, agent: cached.data },
        {
          headers: {
            "Cache-Control": `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`,
            "X-Cache": "HIT",
          },
        }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Lyzr API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${LYZR_API_URL}/v3/agents/${agentId}`, {
      method: "GET",
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `Lyzr API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const agent = await response.json();

    // Store in cache
    agentCache.set(agentId, { data: agent, timestamp: Date.now() });

    return NextResponse.json(
      { success: true, agent },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`,
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

/**
 * Clear agent cache (useful for testing or manual refresh)
 */
export function clearAgentCache(agentId?: string) {
  if (agentId) {
    agentCache.delete(agentId);
  } else {
    agentCache.clear();
  }
}
