# Sales Order AI - Inochi

AI-powered order data entry automation using Vietnamese OCR and intelligent data extraction.

## Overview

This application automates the manual order entry process by:
1. **OCR Scanning** - Extract text from PDF/image documents (Vietnamese support)
2. **AI Extraction** - Extract structured order data with confidence scores
3. **Split-Screen Review** - Review orders side-by-side with source documents
4. **Team Collaboration** - Assign orders, add tags, and internal notes
5. **Bravo ERP Export** - Export approved orders to Excel format

## Architecture

### Real Lyzr Agents

The application uses **2 specialized Lyzr agents**:

1. **Vietnamese Order Data Extractor** (`EXTRACTION_AGENT_ID`)
   - Extracts customer info, items, dates from OCR text
   - Returns structured JSON with field-level confidence scores
   - Handles Vietnamese characters and business terminology

2. **Order Validation Specialist** (`VALIDATION_AGENT_ID`)
   - Validates extracted data for completeness and accuracy
   - Checks business logic (calculations, date ranges, formats)
   - Returns validation report with issues and recommendations

### Global Shared Packages

The app leverages monorepo shared packages:

- **@tasco/api** - OCR handler (`handleOCR`)
- **@tasco/export** - Bravo ERP Excel export utilities
- **@tasco/db** - DynamoDB client and data access
- **@tasco/ui** - shadcn/ui components and design system
- **@tasco/i18n** - Vietnamese/English translations

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/sales-order
bun install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your Lyzr API key:

```env
LYZR_API_KEY=your_lyzr_api_key_here
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

### 3. Initialize Database

Create DynamoDB tables (first time only):

```bash
cd ../../packages/db
bun run db:init
```

### 4. Seed Mock Data (Optional)

Populate the database with realistic Vietnamese orders for testing:

```bash
cd ../../packages/db
bun run db:seed-sales-orders 50
```

This creates 50 diverse orders with:
- Realistic Vietnamese company names
- Common product types (beverages, dairy, etc.)
- Mixed statuses (reviewing, approved, exported)
- Confidence score distribution
- Automatic tags (high-value, large-order, urgent)
- Team assignments

### 5. Create Lyzr Agents

Run the agent setup script:

```bash
bun run setup-agents
```

This will:
- Create 2 agents on the Lyzr platform
- Output the agent IDs
- Show you what to add to `.env.local`

Expected output:
```
🚀 Setting up Sales Order agents...
Creating Order Data Extraction Agent...
✅ Extraction Agent created: agent_abc123
Creating Order Validation Agent...
✅ Validation Agent created: agent_xyz789

✅ Setup complete!

📋 Agent IDs created:
   Extraction Agent ID: agent_abc123
   Validation Agent ID: agent_xyz789

🔧 Next steps:
1. Add these agent IDs to your .env.local file:
   EXTRACTION_AGENT_ID=agent_abc123
   VALIDATION_AGENT_ID=agent_xyz789

2. Restart your development server
   bun run dev
```

### 6. Update .env.local

Add the generated agent IDs to your `.env.local`:

```env
LYZR_API_KEY=your_lyzr_api_key_here
EXTRACTION_AGENT_ID=agent_abc123
VALIDATION_AGENT_ID=agent_xyz789
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

### 7. Start Development Server

```bash
bun run dev
```

The app will be available at http://localhost:3006

## Features

### Phase 1: Product Completeness

✅ **Split-Screen Document Viewer**
- PDF and image viewing with zoom, rotate, fullscreen
- Side-by-side with extraction form

✅ **Field-Level Confidence Indicators**
- Visual confidence rings for each field
- Color-coded: Green (90%+), Yellow (70-89%), Red (<70%)
- Automatic highlighting of low-confidence fields

✅ **Bravo ERP Excel Export**
- One-click export to Bravo-compatible Excel format
- Includes all order details and line items
- Proper Vietnamese character encoding

### Phase 2: Design Transformation

✅ **Vietnamese Industrial Design System**
- Deep Indigo primary (traditional Vietnamese blue dye)
- Golden Amber accent (Vietnamese lacquerware)
- Cool gray palette (industrial steel)

✅ **Typography System**
- IBM Plex Sans Vietnamese (headings)
- Inter Variable (body text)
- JetBrains Mono (code/metrics)

✅ **Manufacturing Control Panel Dashboard**
- Real-time metrics grid
- Processing pipeline visualization
- Industrial-themed activity log
- Performance metrics panel

### Week 1 Enhancements

✅ **Improved Navigation**
- Renamed "Upload Orders" → "New Upload"
- Renamed "Review Queue" → "Pending Review"
- Renamed "Order History" → "All Orders"
- Renamed "Dashboard" → "Analytics"

✅ **Category Badges**
- High Value (>5,000,000 VND)
- Large Order (>6 items)
- Needs Review (<80% confidence)

✅ **Breadcrumb Navigation**
- Clear navigation path
- Home icon with clickable trail

### Week 2 Enhancements

✅ **Team Assignment**
- Assign orders to team members
- Track assignment history
- Assignment dropdown in review page

✅ **Order Tagging**
- Add flexible categorization tags
- Keyboard-driven tag input (Enter to add)
- Remove tags with click
- Common tags: high-value, urgent, needs-review

✅ **Internal Collaboration**
- Internal notes field for team communication
- Persists with order data
- Visible to all reviewers

## API Endpoints

### POST /api/ocr
Extract text from uploaded documents using Lyzr OCR API.

**Uses**: `@tasco/api` global handler

**Request:**
```typescript
FormData {
  file: File
}
```

**Response:**
```json
{
  "success": true,
  "text": "Extracted OCR text...",
  "pages": {
    "1": {
      "page": 1,
      "content": "Page 1 content..."
    }
  },
  "totalPages": 1,
  "actionsUsed": 1
}
```

### POST /api/upload
Upload document to S3 and initiate processing.

**Request:**
```typescript
FormData {
  file: File,
  entityId: string
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-001",
  "message": "Upload successful"
}
```

### POST /api/extract
Extract structured order data from OCR text using Lyzr Agent.

**Request:**
```json
{
  "ocrText": "Extracted text from document",
  "fileName": "order-001.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerName": {"value": "Công ty ABC", "confidence": 98},
    "customerCode": {"value": "KH001", "confidence": 95},
    "orderDate": {"value": "2025-01-09", "confidence": 92},
    "deliveryDate": {"value": "2025-01-16", "confidence": 90},
    "items": [
      {
        "productCode": {"value": "SP001", "confidence": 96},
        "productName": {"value": "Bia Tiger lon 330ml", "confidence": 94},
        "quantity": {"value": 100, "confidence": 98},
        "unit": {"value": "thùng", "confidence": 92},
        "unitPrice": {"value": 12000, "confidence": 90},
        "amount": 1200000
      }
    ],
    "totalAmount": 1200000,
    "notes": {"value": "Giao hàng trước 10h sáng", "confidence": 85}
  },
  "metadata": {
    "overallConfidence": 94,
    "extractionTime": 1234
  }
}
```

### GET /api/orders
List orders with filtering and sorting.

**Query Parameters:**
- `entityId` - Filter by entity (required)
- `status` - Filter by status (reviewing, approved, exported, rejected)
- `sortBy` - Sort field (createdAt, updatedAt, confidence)
- `sortOrder` - Sort direction (asc, desc)
- `limit` - Max results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "ORD-001",
      "status": "reviewing",
      "confidence": 94,
      "extractedData": { /* ... */ },
      "assignedTo": "nguyen.van.a@inochi.vn",
      "tags": ["high-value", "urgent"],
      "internalNotes": "Need to verify delivery date",
      "createdAt": "2025-01-09T10:30:00Z"
    }
  ],
  "count": 1
}
```

### PATCH /api/orders/[id]
Update order (approve, reject, edit).

**Request:**
```json
{
  "status": "approved",
  "extractedData": { /* updated data */ },
  "assignedTo": "nguyen.van.a@inochi.vn",
  "tags": ["high-value"],
  "internalNotes": "Verified with customer"
}
```

### GET /api/dashboard
Get analytics metrics.

**Query Parameters:**
- `entityId` - Entity to analyze (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "processedToday": 12,
    "avgAccuracy": 94.5,
    "timeSaved": "45h",
    "statusBreakdown": {
      "reviewing": 5,
      "approved": 8,
      "exported": 137
    }
  }
}
```

## Workflow

1. **Upload** - Drag & drop PDF/image files
2. **OCR Processing** - Lyzr OCR extracts text (global handler)
3. **AI Extraction** - Agent extracts structured data
4. **Review** - User reviews with confidence indicators
5. **Assignment** - Assign to team member (optional)
6. **Tagging** - Add categorization tags (optional)
7. **Notes** - Add internal notes for team (optional)
8. **Validation** - Agent validates for quality
9. **Approve/Reject** - User decision
10. **Export** - Export to Bravo ERP format (global utility)

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **AI Platform**: Lyzr Agent Studio
- **OCR**: Lyzr OCR API (via @tasco/api)
- **Database**: AWS DynamoDB (via @tasco/db)
- **Storage**: AWS S3
- **UI**: React + TailwindCSS + shadcn/ui (via @tasco/ui)
- **Typography**: IBM Plex Sans, Inter, JetBrains Mono
- **Excel Export**: @tasco/export (Bravo ERP format)
- **Language**: TypeScript + Vietnamese i18n (@tasco/i18n)

## Project Structure

```
apps/sales-order/
├── app/
│   ├── api/
│   │   ├── ocr/route.ts          # OCR extraction (uses @tasco/api)
│   │   ├── upload/route.ts       # File upload to S3
│   │   ├── extract/route.ts      # Data extraction
│   │   ├── validate/route.ts     # Order validation
│   │   ├── orders/
│   │   │   ├── route.ts          # List/create orders
│   │   │   └── [id]/route.ts     # Get/update/delete order
│   │   └── dashboard/route.ts    # Analytics metrics
│   ├── dashboard/page.tsx        # Control panel dashboard
│   ├── review/
│   │   ├── page.tsx              # Pending review queue
│   │   └── [id]/page.tsx         # Split-screen review
│   ├── history/page.tsx          # All orders history
│   ├── page.tsx                  # New upload
│   ├── globals.css               # Vietnamese Industrial design
│   └── layout.tsx                # Root layout with fonts
├── components/
│   ├── document-viewer.tsx       # PDF/image viewer
│   ├── confidence-indicator.tsx  # Confidence visualization
│   ├── app-shell.tsx             # Navigation wrapper
│   ├── app-header.tsx            # Header with tour
│   ├── breadcrumb.tsx            # Navigation breadcrumbs
│   └── upload/
│       └── file-dropzone.tsx     # Drag & drop upload
├── lib/
│   ├── agents/
│   │   └── setup.ts              # Agent creation utility
│   └── types/
│       └── order.ts              # TypeScript types
├── scripts/
│   └── setup-agents.ts           # Agent setup CLI
└── locales/
    ├── en/app.json               # English translations
    └── vi/app.json               # Vietnamese translations
```

## Database Schema

**Table**: `tasco-sales-orders`

```typescript
interface Order {
  // Primary Keys
  PK: string;              // "ORDER#${orderId}"
  SK: string;              // "METADATA"
  orderId: string;         // "ORD-001"

  // Basic Info
  entityId: string;        // "inochi"
  status: string;          // "reviewing" | "approved" | "exported" | "rejected"

  // Source
  sourceType: string;      // "pdf" | "image"
  sourceUrl: string;       // S3 URL
  fileName: string;        // Original filename

  // Extraction
  extractedData: {
    customerName: { value: string; confidence: number };
    customerCode: { value: string; confidence: number };
    orderDate: { value: string; confidence: number };
    deliveryDate: { value: string; confidence: number };
    items: Array<{
      productCode: { value: string; confidence: number };
      productName: { value: string; confidence: number };
      quantity: { value: number; confidence: number };
      unit: { value: string; confidence: number };
      unitPrice: { value: number; confidence: number };
      amount: number;
    }>;
    totalAmount: number;
    notes?: { value: string; confidence: number };
  };

  // Quality Metrics
  confidence: number;      // Overall confidence (0-100)

  // Week 2 Enhancements
  assignedTo?: string;     // User email/ID
  assignedAt?: string;     // ISO timestamp
  tags?: string[];         // ["high-value", "urgent"]
  internalNotes?: string;  // Team collaboration notes

  // Audit Trail
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  reviewedBy?: string;     // User who reviewed
  reviewedAt?: string;     // ISO timestamp
}
```

## Mock Data Generation

Generate realistic test data:

```bash
cd packages/db
bun run db:seed-sales-orders 50
```

Generates:
- 50 diverse Vietnamese orders
- 15 company name variations
- 12 product types (beverages, dairy, etc.)
- Realistic prices (12,000 - 850,000 VND)
- Mixed statuses and confidence scores
- Automatic tag assignment
- Team member assignments
- Internal notes (~30% of orders)

## Code Refactoring

The app uses global monorepo packages for code reuse:

### Before Refactoring
- 295 lines of duplicate code
- Local OCR implementation (129 lines)
- Local Bravo export (166 lines)

### After Refactoring
- 97% code reduction
- Global `@tasco/api` OCR handler (10 lines)
- Global `@tasco/export` utilities (import only)
- See `REFACTORING_SUMMARY.md` for details

## Troubleshooting

### Agents not configured

If you see "EXTRACTION_AGENT_ID not configured" error:
1. Make sure you ran `bun run setup-agents`
2. Check that agent IDs are in `.env.local`
3. Restart the dev server

### OCR API errors

If OCR extraction fails:
1. Verify `LYZR_API_KEY` is correct
2. Check file format (PDF, JPG, PNG only)
3. Ensure file size is under 10MB

### Extraction returns invalid JSON

If extraction agent returns invalid JSON:
1. Check agent system prompt format
2. Re-create agent with correct prompt
3. Review agent logs in Lyzr dashboard

### Database connection issues

If DynamoDB operations fail:
1. Check AWS credentials: `aws configure list`
2. Verify region: `NEXT_PUBLIC_AWS_REGION=ap-southeast-1`
3. Run `bun run db:init` to create tables

### Module not found: @tasco/export

If you see import errors:
1. Run `bun install` in repo root
2. Check workspace dependencies in package.json
3. Restart dev server

## Support

For issues or questions:
- Check PRD: `PRD.md`
- Review agent setup: `lib/agents/setup.ts`
- Refactoring details: `REFACTORING_SUMMARY.md`
- Migration status: `MIGRATION_STATUS.md`
- Contact: Inochi Technical Team
