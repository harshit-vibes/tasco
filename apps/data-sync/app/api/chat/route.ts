import { NextRequest, NextResponse } from "next/server";

// Mock responses for the sync assistant
const MOCK_RESPONSES: Record<string, string> = {
  "what's the current sync status":
    "**Current Sync Status Summary:**\n\n✅ **Haravan** - Connected (245ms latency)\n- 1,247 records synced today\n- 12 pending\n\n✅ **Shopee** - Connected (312ms latency)\n- 856 records synced today\n- 5 pending\n\n⚠️ **Bravo ERP** - Delayed (1.85s latency)\n- 423 records synced today\n- 89 pending\n- Last sync: 2 hours ago\n\n✅ **Fulfillment** - Connected (178ms latency)\n- 1,089 records synced today\n- 3 pending\n\n**Action Required:** Bravo ERP sync is delayed. There are 89 records pending synchronization.",

  "why is order #ino-12345 missing in bravo":
    "**Order #INO-12345 Analysis:**\n\n📋 **Status:** Missing in Bravo ERP\n\n**Timeline:**\n- Order created in Haravan: 2 hours ago\n- Expected sync time: Within 15 minutes\n- Current status: Not synced\n\n**Root Cause:**\nThe Bravo API connection experienced a timeout (60s) starting 2 hours ago. The order is in the pending sync queue.\n\n**Affected Data:**\n- Customer: Nguyen Van A\n- Order Total: 2,450,000 VND\n- Items: 3 products\n\n**Recommended Actions:**\n1. Check Bravo API status\n2. Retry the sync manually\n3. Verify order data integrity",

  "show me today's sync discrepancies":
    "**Today's Sync Discrepancies:**\n\n🔴 **Critical (1):**\n- Bravo API connection timeout - affecting 89 records\n\n🟠 **High Priority (3):**\n1. Order #INO-12345 missing in Bravo (2h ago)\n2. Invoice #INV-7823 not generated (45m ago)\n3. Order #INO-12298 missing in Bravo (1.5h ago)\n\n🟡 **Medium (1):**\n- Revenue mismatch: Haravan ₫45,670,000 vs Bravo ₫44,220,000\n\n🔵 **Low (1):**\n- Customer phone number mismatch (CUST-8891)\n\n**Summary:** 6 active discrepancies, 4 requiring immediate attention.",

  default:
    "I can help you with data sync questions. Here are some things you can ask me:\n\n- Current sync status across all systems\n- Details about specific orders or records\n- Discrepancy analysis and root causes\n- System health and performance metrics\n- Recommendations for resolving sync issues\n\nWhat would you like to know?",
};

function getMockResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (key !== "default" && lowerQuestion.includes(key)) {
      return response;
    }
  }

  // Check for partial matches
  if (lowerQuestion.includes("status")) {
    return MOCK_RESPONSES["what's the current sync status"];
  }
  if (
    lowerQuestion.includes("discrepanc") ||
    lowerQuestion.includes("issue") ||
    lowerQuestion.includes("problem")
  ) {
    return MOCK_RESPONSES["show me today's sync discrepancies"];
  }
  if (lowerQuestion.includes("missing") || lowerQuestion.includes("order")) {
    return MOCK_RESPONSES["why is order #ino-12345 missing in bravo"];
  }

  return MOCK_RESPONSES["default"];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // For demo, use mock responses
    // In production, this would call the Lyzr agent API
    const response = getMockResponse(message);

    // Simulate some processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500)
    );

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        sessionId: sessionId || `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 }
    );
  }
}
