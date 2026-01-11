import { NextRequest, NextResponse } from "next/server";
import { createLyzrClient } from "@tasco/lyzr";
import { updateOrder, logActivity, type ValidationResult } from "@tasco/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validate extracted order data using Validation Agent
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, extractedData, entityId } = await request.json();

    if (!orderId || !extractedData) {
      return NextResponse.json(
        { error: "orderId and extractedData are required" },
        { status: 400 }
      );
    }

    // Get agent configuration
    const apiKey = process.env.LYZR_API_KEY;
    const validationAgentId = process.env.VALIDATION_AGENT_ID;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LYZR_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!validationAgentId) {
      return NextResponse.json(
        {
          error:
            "VALIDATION_AGENT_ID not configured. Run: bun run setup-agents",
        },
        { status: 500 }
      );
    }

    // Create Lyzr client
    const lyzr = createLyzrClient({ apiKey });

    console.log(`[Validate API] Validating order: ${orderId}`);

    // Prepare validation prompt
    const validationPrompt = `Validate this extracted Vietnamese sales order data for quality and accuracy.

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Check for:
1. Missing required fields
2. Invalid formats (dates, numbers)
3. Inconsistencies (total amount vs line items)
4. Data quality issues
5. Vietnamese language correctness

Remember to respond with ONLY valid JSON matching the exact format specified in your instructions. No markdown, no explanations.`;

    // Call validation agent
    console.log(`[Validate API] Calling validation agent: ${validationAgentId}`);
    const startTime = Date.now();

    const response = await lyzr.chat(
      validationAgentId,
      [{ role: "user", content: validationPrompt }],
      `validate-${orderId}`
    );

    const validationMs = Date.now() - startTime;
    console.log(`[Validate API] Validation completed in ${validationMs}ms`);

    // Parse the response as JSON
    let validation: ValidationResult;
    try {
      // Clean the response text (remove any markdown wrappers)
      let jsonText = response.message.trim();

      if (jsonText.includes("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      validation = JSON.parse(jsonText) as ValidationResult;
      console.log(`[Validate API] Successfully parsed validation result`);
    } catch (parseError) {
      console.error(
        "[Validate API] Failed to parse agent response:",
        parseError
      );
      console.error("[Validate API] Raw response:", response.message);

      return NextResponse.json(
        {
          error: "Failed to parse validation result",
          details: "Agent response was not valid JSON",
          rawResponse: response.message.substring(0, 500),
        },
        { status: 500 }
      );
    }

    console.log(`[Validate API] Validation summary:`);
    console.log(`  - Overall score: ${validation.overallScore}`);
    console.log(`  - Is valid: ${validation.isValid}`);
    console.log(`  - Issues: ${validation.issues.length}`);
    console.log(`  - Confidence: ${validation.confidence}`);

    // Update order with validation results
    await updateOrder(orderId, {
      validation,
      validationAgentId,
    });

    // Log activity
    await logActivity({
      orderId,
      entityId: entityId || "inochi",
      action: "validated",
      details: {
        userId: "system",
        changes: {
          overallScore: validation.overallScore,
          isValid: validation.isValid,
          issuesCount: validation.issues.length,
          confidence: validation.confidence,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: validation,
      metadata: {
        validationTime: validationMs,
        agentId: validationAgentId,
      },
    });
  } catch (error: any) {
    console.error("[Validate API] Error:", error);
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
