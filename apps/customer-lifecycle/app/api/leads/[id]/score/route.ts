import { NextRequest, NextResponse } from "next/server";
import { createLyzrClient } from "@tasco/lyzr";
import { getLeadById, updateLead, type AILeadScore } from "@tasco/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/leads/[id]/score
 * Analyze a lead using AI and output structured score
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id: leadId } = await params;

    // 1. Get lead data
    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // 2. Get agent configuration
    const apiKey = process.env.LYZR_API_KEY;
    const leadScorerAgentId = process.env.LYZR_LEAD_SCORER_AGENT_ID;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "LYZR_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!leadScorerAgentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "LYZR_LEAD_SCORER_AGENT_ID not configured. Run: bun run scripts/setup-lead-scorer.ts",
        },
        { status: 500 }
      );
    }

    // 3. Create Lyzr client
    const lyzr = createLyzrClient({ apiKey });

    console.log(`[Lead Score API] Analyzing lead: ${leadId}`);

    // 4. Prepare analysis prompt with lead data
    const analysisPrompt = `Analyze this lead and provide a JSON score:

Lead Data:
- Name: ${lead.customer.name}
- Email: ${lead.customer.email}
- Phone: ${lead.customer.phone}
- Location: ${lead.customer.location}
- Source: ${lead.source}
- Status: ${lead.status}
- Priority: ${lead.priority}
- Current Score: ${lead.score}
- Budget: ${lead.interest.budget || "Not specified"}
- Timeline: ${lead.interest.timeline || "Not specified"}
- Interested Brands: ${lead.interest.brands?.join(", ") || "Not specified"}
- Interested Vehicle Types: ${lead.interest.vehicleTypes?.join(", ") || "Not specified"}
- Assigned To: ${lead.assignedTo || "Unassigned"}
- Created: ${lead.createdAt}
- Last Contact: ${lead.lastContactedAt || "Never"}

Provide your analysis as JSON only. No markdown, no explanation.`;

    // 5. Call lead scoring agent
    console.log(
      `[Lead Score API] Calling lead scorer agent: ${leadScorerAgentId}`
    );
    const startTime = Date.now();

    const response = await lyzr.chat(
      leadScorerAgentId,
      [{ role: "user", content: analysisPrompt }],
      `lead-score-${leadId}`
    );

    const analysisMs = Date.now() - startTime;
    console.log(`[Lead Score API] Analysis completed in ${analysisMs}ms`);

    // 6. Parse JSON response (handle markdown code blocks)
    let aiScore: AILeadScore;
    try {
      let jsonStr = response.message.trim();

      // Strip markdown code blocks if present
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(jsonStr.trim());

      // Validate required fields
      if (
        typeof parsed.overallScore !== "number" ||
        !parsed.factors ||
        !parsed.recommendation ||
        !parsed.insights
      ) {
        throw new Error("Missing required fields in AI response");
      }

      aiScore = {
        overallScore: Math.round(parsed.overallScore),
        factors: {
          budgetScore: Math.round(parsed.factors.budgetScore || 0),
          timelineScore: Math.round(parsed.factors.timelineScore || 0),
          brandScore: Math.round(parsed.factors.brandScore || 0),
          engagementScore: Math.round(parsed.factors.engagementScore || 0),
        },
        recommendation: parsed.recommendation as "Hot" | "Warm" | "Cold",
        insights: parsed.insights,
        analyzedAt: new Date().toISOString(),
      };

      console.log(`[Lead Score API] Parsed AI score:`, aiScore);
    } catch (parseError) {
      console.error(
        "[Lead Score API] Failed to parse agent response:",
        parseError
      );
      console.error("[Lead Score API] Raw response:", response.message);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response",
          details: "Agent response was not valid JSON",
          rawResponse: response.message.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // 7. Update lead with AI score
    const updatedLead = await updateLead(leadId, {
      score: aiScore.overallScore,
      aiScore,
    });

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: "Failed to update lead with AI score" },
        { status: 500 }
      );
    }

    console.log(
      `[Lead Score API] Lead ${leadId} scored: ${aiScore.overallScore} (${aiScore.recommendation})`
    );

    return NextResponse.json({
      success: true,
      aiScore,
      analysisTime: analysisMs,
    });
  } catch (error: unknown) {
    console.error("[Lead Score API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lead scoring failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
