/**
 * Lyzr Agent Setup for Sales Order Application
 * Uses shared @tasco/api agent management utilities
 */

import {
  getOrCreateAgent,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";

/**
 * Agent 1: Order Data Extraction Agent
 * Extracts structured order data from Vietnamese OCR text
 */
export const ORDER_EXTRACTION_AGENT: AgentConfig = {
  name: "Vietnamese Order Data Extractor",
  system_prompt: `You are an AI assistant specialized in extracting structured order data from Vietnamese business documents.

Your task is to analyze OCR-extracted text from sales orders and extract the following information with high accuracy:

1. Customer Information:
   - Customer Name (Tên khách hàng)
   - Customer Code (Mã khách hàng)

2. Order Details:
   - Order Date (Ngày đặt hàng)
   - Delivery Date (Ngày giao hàng)
   - Notes (Ghi chú)

3. Order Items (Line items):
   For each product, extract:
   - Product Code (Mã sản phẩm)
   - Product Name (Tên sản phẩm)
   - Quantity (Số lượng)
   - Unit (Đơn vị: thùng, hộp, chai, etc.)
   - Unit Price (Đơn giá)

4. Calculations:
   - Calculate amount for each line item (quantity × unit price)
   - Calculate total order amount

IMPORTANT INSTRUCTIONS:
- You MUST respond with ONLY valid JSON, no markdown code blocks, no explanations
- Vietnamese text should be preserved exactly as written
- If a field is unclear or missing, use confidence score < 70
- Dates should be in YYYY-MM-DD format
- Numbers should not include currency symbols or thousand separators in the JSON
- Each field must include a confidence score (0-100) based on OCR clarity

Response format (pure JSON):
{
  "customerName": {"value": "string", "confidence": 95},
  "customerCode": {"value": "string", "confidence": 90},
  "orderDate": {"value": "YYYY-MM-DD", "confidence": 85},
  "deliveryDate": {"value": "YYYY-MM-DD", "confidence": 80},
  "items": [
    {
      "productCode": {"value": "string", "confidence": 92},
      "productName": {"value": "string", "confidence": 88},
      "quantity": {"value": 100, "confidence": 95},
      "unit": {"value": "thùng", "confidence": 90},
      "unitPrice": {"value": 50000, "confidence": 85}
    }
  ],
  "notes": {"value": "string", "confidence": 75}
}

Be meticulous with Vietnamese characters (ă, â, ê, ô, ơ, ư, đ and tones).`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.2,
  },
};

/**
 * Agent 2: Order Validation Agent
 * Validates extracted order data for completeness and accuracy
 */
export const ORDER_VALIDATION_AGENT: AgentConfig = {
  name: "Order Validation Specialist",
  system_prompt: `You are an AI quality control specialist for Vietnamese sales order processing.

Your task is to validate extracted order data and identify potential issues or inconsistencies.

Validation checks:
1. Data Completeness: Are all required fields present?
2. Format Validity: Are dates, codes, and numbers in correct format?
3. Business Logic: Do quantities and prices make sense?
4. Consistency: Do calculated amounts match (qty × price)?
5. Vietnamese Text: Are Vietnamese characters preserved correctly?

You will receive extracted order data and must return a validation report.

Response format (pure JSON):
{
  "overallScore": 94,
  "isValid": true,
  "issues": [
    {
      "field": "deliveryDate",
      "severity": "warning",
      "message": "Delivery date is less than 2 days from order date",
      "suggestion": "Verify if express delivery was requested"
    }
  ],
  "recommendations": [
    "Consider double-checking product code SP003 - confidence is below 80%"
  ],
  "confidence": "high"
}

Severity levels: "error" (blocking issue), "warning" (needs review), "info" (suggestion)`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.1,
  },
};

/**
 * Setup all agents for the sales order application
 * Uses getOrCreateAgent for idempotent setup
 */
export async function setupSalesOrderAgents(apiKey: string): Promise<{
  extractionAgentId: string;
  validationAgentId: string;
  created: { extraction: boolean; validation: boolean };
}> {
  const config: AgentManagementConfig = { apiKey };

  console.log("🚀 Setting up Sales Order agents...\n");

  // Create or get extraction agent
  console.log("📝 Checking/creating Order Data Extraction Agent...");
  const extractionResult = await getOrCreateAgent(
    ORDER_EXTRACTION_AGENT,
    config
  );

  if (extractionResult.created) {
    console.log(`✅ Extraction Agent created: ${extractionResult.agent.agent_id}`);
  } else {
    console.log(`✓  Extraction Agent already exists: ${extractionResult.agent.agent_id}`);
  }

  // Create or get validation agent
  console.log("\n📝 Checking/creating Order Validation Agent...");
  const validationResult = await getOrCreateAgent(
    ORDER_VALIDATION_AGENT,
    config
  );

  if (validationResult.created) {
    console.log(`✅ Validation Agent created: ${validationResult.agent.agent_id}`);
  } else {
    console.log(`✓  Validation Agent already exists: ${validationResult.agent.agent_id}`);
  }

  return {
    extractionAgentId: extractionResult.agent.agent_id,
    validationAgentId: validationResult.agent.agent_id,
    created: {
      extraction: extractionResult.created,
      validation: validationResult.created,
    },
  };
}
