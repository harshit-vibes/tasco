import { NextRequest, NextResponse } from "next/server";
import { createLyzrClient } from "@tasco/lyzr";
import {
  createOrder,
  updateOrder,
  logActivity,
  calculateOverallConfidence,
  type ExtractedOrderData,
  type ConfidenceField,
  type OrderItem,
} from "@tasco/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Default entity ID (TODO: Get from auth session)
const DEFAULT_ENTITY_ID = "inochi";

/**
 * Extract structured order data from OCR text using Lyzr Agent
 * and save to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ocrText,
      orderId,
      sourceUrl,
      fileName,
      fileSize,
      sourceType = "pdf",
      entityId = DEFAULT_ENTITY_ID,
      userId = "system",
    } = body;

    if (!ocrText) {
      return NextResponse.json({ error: "OCR text is required" }, { status: 400 });
    }

    if (!orderId || !sourceUrl || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, sourceUrl, fileName" },
        { status: 400 }
      );
    }

    // Get agent configuration
    const apiKey = process.env.LYZR_API_KEY;
    const extractionAgentId = process.env.EXTRACTION_AGENT_ID;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LYZR_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!extractionAgentId) {
      return NextResponse.json(
        {
          error:
            "EXTRACTION_AGENT_ID not configured. Run: bun run setup-agents",
        },
        { status: 500 }
      );
    }

    // Create Lyzr client
    const lyzr = createLyzrClient({ apiKey });

    console.log(`[Extract API] Processing order: ${orderId} - ${fileName}`);
    console.log(`[Extract API] OCR text length: ${ocrText.length} characters`);

    // Prepare extraction prompt
    const extractionPrompt = `Extract structured order data from this Vietnamese sales order document.

OCR Text:
${ocrText}

Remember to respond with ONLY valid JSON matching the exact format specified in your instructions. No markdown, no explanations.`;

    // Call extraction agent
    console.log(`[Extract API] Calling extraction agent: ${extractionAgentId}`);
    const startTime = Date.now();

    const response = await lyzr.chat(
      extractionAgentId,
      [{ role: "user", content: extractionPrompt }],
      `extract-${orderId}`
    );

    const extractionMs = Date.now() - startTime;
    console.log(`[Extract API] Extraction completed in ${extractionMs}ms`);

    // Parse the response as JSON
    let rawExtractedData: any;
    try {
      // Clean the response text (remove any markdown wrappers)
      let jsonText = response.message.trim();

      if (jsonText.includes("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      rawExtractedData = JSON.parse(jsonText);
      console.log(`[Extract API] Successfully parsed extraction result`);
    } catch (parseError) {
      console.error("[Extract API] Failed to parse agent response:", parseError);
      console.error("[Extract API] Raw response:", response.message);

      return NextResponse.json(
        {
          error: "Failed to parse extraction result",
          details: "Agent response was not valid JSON",
          rawResponse: response.message.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // Transform to ExtractedOrderData format with confidence fields
    const extractedData: ExtractedOrderData = {
      customerName: rawExtractedData.customerName as ConfidenceField<string>,
      customerCode: rawExtractedData.customerCode as ConfidenceField<string>,
      orderDate: rawExtractedData.orderDate as ConfidenceField<string>,
      deliveryDate: rawExtractedData.deliveryDate as ConfidenceField<string>,
      items: rawExtractedData.items.map((item: any) => ({
        id: item.id || String(Date.now() + Math.random()),
        productCode: item.productCode as ConfidenceField<string>,
        productName: item.productName as ConfidenceField<string>,
        quantity: item.quantity as ConfidenceField<number>,
        unit: item.unit as ConfidenceField<string>,
        unitPrice: item.unitPrice as ConfidenceField<number>,
        amount: item.quantity.value * item.unitPrice.value,
      })),
      totalAmount: rawExtractedData.items.reduce(
        (sum: number, item: any) =>
          sum + item.quantity.value * item.unitPrice.value,
        0
      ),
      notes: rawExtractedData.notes as ConfidenceField<string>,
    };

    // Calculate overall confidence
    const overallConfidence = calculateOverallConfidence(extractedData);

    console.log(`[Extract API] Extraction summary:`);
    console.log(`  - Customer: ${extractedData.customerName.value}`);
    console.log(`  - Items: ${extractedData.items.length}`);
    console.log(`  - Total: ${extractedData.totalAmount.toLocaleString("vi-VN")} VND`);
    console.log(`  - Overall confidence: ${overallConfidence}%`);

    // Create order in database
    const order = await createOrder({
      entityId,
      sourceType,
      sourceUrl,
      fileName,
      fileSize: fileSize || 0,
      extractedData,
      confidence: overallConfidence,
      processingTime: {
        ocrMs: 0, // OCR time not tracked yet
        extractionMs,
        validationMs: 0, // Not validated yet
        totalMs: extractionMs,
      },
      createdBy: userId,
      extractionAgentId,
    });

    // Note: We use the orderId from upload, but database generates its own
    // This is intentional - the DB orderId is the source of truth
    console.log(`[Extract API] Order created in database: ${order.orderId}`);

    // Log activity
    await logActivity({
      orderId: order.orderId,
      entityId,
      action: "extracted",
      details: {
        userId,
        changes: {
          confidence: overallConfidence,
          extractionAgentId,
          itemCount: extractedData.items.length,
          totalAmount: extractedData.totalAmount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId, // Return DB-generated orderId
        extractedData,
        overallConfidence,
        totalAmount: extractedData.totalAmount,
        itemCount: extractedData.items.length,
        extractionTime: extractionMs,
        agentId: extractionAgentId,
      },
    });
  } catch (error: any) {
    console.error("[Extract API] Error:", error);
    return NextResponse.json(
      {
        error: "Extraction failed",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
