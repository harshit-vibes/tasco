# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

Sales Order AI - Vietnamese OCR-powered order data entry automation for Inochi. Extracts structured data from PDF/image documents using Lyzr agents.

## Commands

```bash
# Development
bun dev                     # Start on port 3006
bun build                   # Production build
bun lint                    # Run linter

# Agent Setup (first time)
bun run setup-agents        # Creates 2 Lyzr agents, outputs IDs to add to .env.local

# App Guide (feature showcase carousel)
bun run seed-guide          # Seed English/Vietnamese guide content to DynamoDB

# Database (run from packages/db)
bun run db:init             # Create DynamoDB tables
bun run db:seed-sales-orders 50  # Seed 50 mock Vietnamese orders
```

## Architecture

### Two-Agent System

1. **Extraction Agent** (`EXTRACTION_AGENT_ID`)
   - Extracts structured JSON from Vietnamese OCR text
   - Returns field-level confidence scores (0-100)
   - Model: `gpt-4o-mini`, temperature: 0.2

2. **Validation Agent** (`VALIDATION_AGENT_ID`)
   - Validates extracted data for business logic
   - Returns validation report with issues/recommendations
   - Model: `gpt-4o-mini`, temperature: 0.1

Agent configs defined in `lib/agents/setup.ts`.

### Processing Pipeline

```
Upload → OCR (Lyzr API) → Extract (Agent 1) → Validate (Agent 2) → Review → Approve/Export
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ocr` | POST | Extract text from PDF/image (uses `@tasco/api` handler) |
| `/api/upload` | POST | Upload to S3, initiate processing |
| `/api/extract` | POST | Extract structured data via Lyzr agent |
| `/api/validate` | POST | Validate extracted data via Lyzr agent |
| `/api/orders` | GET/POST | List/create orders |
| `/api/orders/[id]` | GET/PATCH/DELETE | Order CRUD |
| `/api/dashboard` | GET | Analytics metrics |
| `/api/guide` | GET/PUT/DELETE | App guide carousel (uses `@tasco/api` handler) |

### Key Types

```typescript
// Confidence-wrapped field
interface ConfidenceField<T> {
  value: T;
  confidence: number;  // 0-100
}

// Extracted order structure
interface ExtractedOrderData {
  customerName: ConfidenceField<string>;
  customerCode: ConfidenceField<string>;
  orderDate: ConfidenceField<string>;
  deliveryDate: ConfidenceField<string>;
  items: OrderItem[];
  totalAmount: number;
  notes: ConfidenceField<string>;
}
```

Types defined in `lib/types/order.ts`, also re-exported from `@tasco/db`.

### Shared Package Usage

```typescript
// UI components and icons
import { Button, Card, Badge } from "@tasco/ui";
import { FileText, Upload, Clock } from "@tasco/ui/icons";

// Database operations
import { createOrder, listOrdersByEntity, updateOrder, logActivity } from "@tasco/db";

// Lyzr client
import { createLyzrClient } from "@tasco/lyzr";

// OCR handler (wraps entire route)
import { handleOCR } from "@tasco/api";
export const POST = handleOCR;

// i18n
import { useTranslation, I18nProvider } from "@tasco/i18n";

// Excel export
import { exportToExcel } from "@tasco/export";
```

## Environment Variables

```env
# Required
LYZR_API_KEY=               # Lyzr API key
EXTRACTION_AGENT_ID=        # From setup-agents script
VALIDATION_AGENT_ID=        # From setup-agents script

# Optional
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

## Database Schema

Table: `tasco-sales-orders`

```typescript
{
  PK: "ORDER#${orderId}",
  SK: "METADATA",
  orderId: string,
  entityId: string,           // "inochi"
  status: "reviewing" | "approved" | "exported" | "rejected",
  extractedData: ExtractedOrderData,
  confidence: number,
  sourceUrl: string,
  fileName: string,
  assignedTo?: string,
  tags?: string[],
  internalNotes?: string,
  createdAt: string,
  updatedAt: string,
}
```

## Pages

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `page.tsx` | File upload dropzone + recent orders |
| `/review` | `review/page.tsx` | Pending review queue |
| `/review/[id]` | `review/[id]/page.tsx` | Split-screen order review |
| `/history` | `history/page.tsx` | All orders with filters |
| `/dashboard` | `dashboard/page.tsx` | Analytics metrics |

## Design System

Vietnamese Industrial theme with custom CSS variables in `globals.css`:
- Primary: Deep Indigo (`--primary`)
- Accent: Golden Amber
- Typography: IBM Plex Sans (headings), Inter (body), JetBrains Mono (code)

## Patterns

### Confidence Indicators

Fields show color-coded confidence:
- Green: ≥90%
- Yellow: 70-89%
- Red: <70%

### Category Badges

Auto-applied based on order characteristics:
- "High Value": totalAmount > 5,000,000 VND
- "Large Order": items > 6
- "Needs Review": confidence < 80%
