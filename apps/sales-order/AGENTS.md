# Lyzr Agent Configuration

This document describes the real Lyzr agents configured for the Sales Order application.

## Agent Architecture

```
┌─────────────────────────────────────────────┐
│         Sales Order Application              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          Upload Document (PDF/Image)         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   Agent 1: Lyzr OCR API                     │
│   • Extract text from documents              │
│   • Vietnamese language support              │
│   • Returns: Raw OCR text by page           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   Agent 2: Order Data Extractor             │
│   • Model: GPT-4 Turbo                      │
│   • Extract structured order data            │
│   • Field-level confidence scores            │
│   • Returns: JSON with customer, items, etc │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   Agent 3: Order Validation Specialist      │
│   • Model: GPT-4 Turbo                      │
│   • Validate extracted data                  │
│   • Check business logic                     │
│   • Returns: Validation report               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Review & Approve Interface           │
│         Export to Bravo ERP                  │
└─────────────────────────────────────────────┘
```

## Agent 1: Lyzr OCR API

**Type**: External API (No agent creation needed)

**Endpoint**: `https://lyzr-ocr.lyzr.app/extract`

**Purpose**: Extract text from Vietnamese order documents (PDF, images)

**Configuration**:
- Supports: PDF, JPG, PNG, GIF
- Max file size: 10MB
- Vietnamese character recognition
- Page-by-page text extraction

**API Integration**:
```typescript
// apps/sales-order/app/api/ocr/route.ts
const response = await fetch("https://lyzr-ocr.lyzr.app/extract", {
  method: "POST",
  headers: {
    "x-api-key": LYZR_API_KEY,
  },
  body: formData, // FormData with file
});
```

**Response Format**:
```json
{
  "pages": [
    {
      "page": 1,
      "text": "Extracted text from page 1..."
    }
  ]
}
```

---

## Agent 2: Vietnamese Order Data Extractor

**Type**: Lyzr Chat Agent

**Agent ID**: Set in `EXTRACTION_AGENT_ID` environment variable

**Model**: `gpt-4o-mini`

**Temperature**: `0.2` (low for consistent extraction)

**Purpose**: Extract structured order data from OCR text with field-level confidence

### System Prompt

```
You are an AI assistant specialized in extracting structured order data from Vietnamese business documents.

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

Be meticulous with Vietnamese characters (ă, â, ê, ô, ơ, ư, đ and tones).
```

### API Integration

```typescript
// apps/sales-order/app/api/extract/route.ts
import { createLyzrClient } from "@tasco/lyzr";

const lyzr = createLyzrClient({ apiKey: LYZR_API_KEY });

const response = await lyzr.chat(
  extractionAgentId,
  [{ role: "user", content: extractionPrompt }],
  `extract-${Date.now()}`
);

const extractedData = JSON.parse(response.message);
```

### Input Example

```
Extract structured order data from this Vietnamese sales order document.

OCR Text:
CÔNG TY TNHH ABC
Mã KH: KH001
Ngày đặt hàng: 09/01/2025
Ngày giao hàng: 15/01/2025

Chi tiết đơn hàng:
1. Mã SP: SP001 - Sản phẩm A - SL: 100 thùng - Đơn giá: 50,000đ
2. Mã SP: SP002 - Sản phẩm B - SL: 50 thùng - Đơn giá: 80,000đ

Ghi chú: Giao hàng trong giờ hành chính
```

### Output Example

```json
{
  "customerName": {"value": "CÔNG TY TNHH ABC", "confidence": 98},
  "customerCode": {"value": "KH001", "confidence": 96},
  "orderDate": {"value": "2025-01-09", "confidence": 95},
  "deliveryDate": {"value": "2025-01-15", "confidence": 94},
  "items": [
    {
      "productCode": {"value": "SP001", "confidence": 97},
      "productName": {"value": "Sản phẩm A", "confidence": 95},
      "quantity": {"value": 100, "confidence": 99},
      "unit": {"value": "thùng", "confidence": 92},
      "unitPrice": {"value": 50000, "confidence": 91}
    },
    {
      "productCode": {"value": "SP002", "confidence": 96},
      "productName": {"value": "Sản phẩm B", "confidence": 94},
      "quantity": {"value": 50, "confidence": 98},
      "unit": {"value": "thùng", "confidence": 91},
      "unitPrice": {"value": 80000, "confidence": 89}
    }
  ],
  "notes": {"value": "Giao hàng trong giờ hành chính", "confidence": 87}
}
```

---

## Agent 3: Order Validation Specialist

**Type**: Lyzr Chat Agent

**Agent ID**: Set in `VALIDATION_AGENT_ID` environment variable

**Model**: `gpt-4o-mini`

**Temperature**: `0.1` (very low for consistent validation)

**Purpose**: Validate extracted order data for completeness, accuracy, and business logic

### System Prompt

```
You are an AI quality control specialist for Vietnamese sales order processing.

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

Severity levels: "error" (blocking issue), "warning" (needs review), "info" (suggestion)
```

### API Integration

```typescript
const validationPrompt = `Validate this extracted order data:

${JSON.stringify(extractedData, null, 2)}

Return a validation report in JSON format.`;

const response = await lyzr.chat(
  validationAgentId,
  [{ role: "user", content: validationPrompt }],
  `validate-${Date.now()}`
);

const validation = JSON.parse(response.message);
```

---

## Setup Instructions

### 1. Install Prerequisites

- Lyzr API key (https://www.lyzr.ai/)
- Bun runtime (https://bun.sh/)

### 2. Run Setup Script

```bash
cd apps/sales-order
LYZR_API_KEY=your_key bun run setup-agents
```

This will:
1. Create "Vietnamese Order Data Extractor" agent
2. Create "Order Validation Specialist" agent
3. Output agent IDs

### 3. Configure Environment

Add to `.env.local`:

```env
LYZR_API_KEY=your_lyzr_api_key
EXTRACTION_AGENT_ID=agent_abc123
VALIDATION_AGENT_ID=agent_xyz789
```

### 4. Verify Setup

Start the dev server and upload a test document:

```bash
bun run dev
```

Navigate to http://localhost:3006 and upload a Vietnamese order document.

---

## Agent Management

### List Existing Agents

```bash
# Using the Lyzr SDK
curl -X GET "https://agent-prod.studio.lyzr.ai/v3/agents" \
  -H "x-api-key: YOUR_API_KEY"
```

### Update Agent Prompt

To update an agent's system prompt:

1. Edit `lib/agents/setup.ts`
2. Delete the existing agent via Lyzr dashboard
3. Run `bun run setup-agents` again

### Test Individual Agent

```bash
# Test extraction agent
curl -X POST "https://agent-prod.studio.lyzr.ai/v3/inference/chat/" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "agent_id": "EXTRACTION_AGENT_ID",
    "user_id": "test",
    "session_id": "test-1",
    "message": "Extract data from: CÔNG TY ABC..."
  }'
```

---

## Performance Metrics

**Expected Performance:**
- OCR Processing: 2-5 seconds per page
- Data Extraction: 3-8 seconds per order
- Validation: 2-4 seconds per order
- **Total**: ~10-20 seconds per order (end-to-end)

**Accuracy Targets:**
- Overall Confidence: > 90%
- High Confidence Fields: > 95%
- Medium Confidence Fields: 70-89%
- Low Confidence Fields: < 70% (flagged for review)

---

## Troubleshooting

### Issue: Agent returns markdown-wrapped JSON

**Solution**: The API route handles this by stripping markdown:

```typescript
if (jsonText.includes("```json")) {
  jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
}
```

### Issue: Confidence scores inconsistent

**Solution**: Re-create agent with clearer prompt instructions about confidence scoring.

### Issue: Vietnamese characters corrupted

**Solution**: Ensure UTF-8 encoding throughout:
- API responses: UTF-8
- Database: UTF-8
- Frontend: UTF-8

---

## Cost Optimization

**Agent Usage Costs:**
- GPT-4 Turbo: $10/1M input tokens, $30/1M output tokens
- Average order: ~2K tokens input, ~1K tokens output
- **Cost per order**: ~$0.05

**Monthly Volume (1000 orders):**
- Total cost: ~$50/month
- Savings vs manual entry: ~$2000/month (40 hours @ $50/hr)
- **ROI**: 40x

---

## Future Enhancements

1. **Real-time Processing Pipeline**
   - WebSocket for live status updates
   - Batch processing queue

2. **Advanced Validation**
   - Product catalog lookup
   - Customer history validation
   - Pricing rule engine

3. **Multi-language Support**
   - English, Vietnamese, Thai
   - Auto-detect document language

4. **Learning System**
   - Track corrections made by users
   - Retrain agents based on feedback
   - Continuous accuracy improvement
