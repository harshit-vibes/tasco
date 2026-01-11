# Sales Order Application - Production Readiness Audit

**Date**: 2025-01-09
**Status**: ⚠️ Using Mock Data - Requires Database & Agent Integration

---

## Executive Summary

The sales-order application currently uses **hardcoded mock data** in all UI pages and in-memory storage in API routes. To make this production-ready, we need to:

1. **Replace 6 hardcoded data sources** with DynamoDB tables
2. **Integrate 2 existing real agents** (already configured)
3. **Add 1 new validation agent** for real-time validation
4. **Implement file storage** for uploaded documents
5. **Add user authentication** and multi-tenancy

---

## 1. Hardcoded Data Inventory

### 1.1 Frontend Mock Data

| Location | Data Type | Lines | Records | Replacement |
|----------|-----------|-------|---------|-------------|
| `app/page.tsx` | Recent orders list | 11-36 | 3 orders | DynamoDB query (last 5 orders) |
| `app/review/page.tsx` | Pending orders queue | 27-61 | 3 orders | DynamoDB query (status='reviewing') |
| `app/review/[id]/page.tsx` | Order detail with confidence | 36-81 | 1 order | DynamoDB get by ID |
| `app/dashboard/page.tsx` | Metrics & analytics | 19-79 | Multiple datasets | DynamoDB aggregations |
| `app/history/page.tsx` | Order history | 34-100 | 6+ orders | DynamoDB query with pagination |

**Total Frontend Mock Records**: ~15-20 hardcoded orders

### 1.2 API Mock Data

| Location | Storage Type | Data | Replacement |
|----------|--------------|------|-------------|
| `app/api/orders/route.ts` | In-memory array | 1 order in `orders[]` | DynamoDB `tasco-orders` table |
| `app/api/orders/[id]/route.ts` | Static object | `mockOrder` object | DynamoDB query by ID |

**Total API Mock Records**: 1-2 hardcoded orders

### 1.3 Dashboard Metrics (Mock)

```typescript
// From app/dashboard/page.tsx
const metrics = {
  totalOrders: 156,           // Should be: COUNT(*) from orders table
  processedToday: 24,         // Should be: COUNT(*) WHERE date = today
  avgAccuracy: 94.5,          // Should be: AVG(confidence) from orders
  timeSaved: "42h",           // Should be: Calculated from processing times
  activeProcesses: 3,         // Should be: Real-time from processing queue
  queuedOrders: 12,           // Should be: COUNT(*) WHERE status='reviewing'
  systemHealth: 98,           // Should be: Calculated from error rates
};

const processingStages = [...]  // Should be: Real-time pipeline status
const recentActivity = [...]     // Should be: Latest 10 from activity log
const weeklyData = [...]         // Should be: Aggregated from past 7 days
```

---

## 2. Required Database Schema

### 2.1 DynamoDB Tables

#### **Table 1: `tasco-sales-orders`**

**Purpose**: Store all order records with extraction results

**Partition Key**: `orderId` (String)
**Sort Key**: None
**GSI 1**: `status-createdAt-index` (for querying by status)
**GSI 2**: `customerCode-orderDate-index` (for customer lookups)

**Attributes**:
```typescript
{
  // Primary identifiers
  orderId: string;              // e.g., "ORD-001"
  entityId: string;             // Tasco subsidiary (e.g., "inochi")

  // Order metadata
  status: "pending" | "reviewing" | "approved" | "rejected" | "exported";
  sourceType: "pdf" | "image" | "email" | "zalo";
  sourceUrl: string;            // S3 URL to original document
  fileName: string;             // Original filename
  fileSize: number;             // File size in bytes

  // Extraction results
  confidence: number;           // Overall confidence (0-100)
  extractedData: {
    customerName: { value: string; confidence: number };
    customerCode: { value: string; confidence: number };
    orderDate: { value: string; confidence: number };
    deliveryDate: { value: string; confidence: number };
    items: Array<{
      id: string;
      productCode: { value: string; confidence: number };
      productName: { value: string; confidence: number };
      quantity: { value: number; confidence: number };
      unit: { value: string; confidence: number };
      unitPrice: { value: number; confidence: number };
      amount: number;
    }>;
    totalAmount: number;
    notes: { value: string; confidence: number };
  };

  // Validation results (from validation agent)
  validation?: {
    overallScore: number;
    isValid: boolean;
    issues: Array<{
      field: string;
      severity: "error" | "warning" | "info";
      message: string;
      suggestion?: string;
    }>;
    recommendations: string[];
    confidence: "high" | "medium" | "low";
  };

  // Processing metadata
  processingTime: {
    ocrMs: number;
    extractionMs: number;
    validationMs: number;
    totalMs: number;
  };

  // Audit trail
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;
  createdBy: string;            // User ID who uploaded
  reviewedBy?: string;          // User ID who approved/rejected
  reviewedAt?: string;          // Timestamp of review
  exportedAt?: string;          // Timestamp of Bravo export
  exportedBy?: string;          // User ID who exported

  // Agent IDs used
  extractionAgentId: string;
  validationAgentId?: string;

  // TTL (optional - for automatic cleanup)
  ttl?: number;                 // Unix timestamp for auto-deletion
}
```

**Indexes**:
```typescript
// GSI 1: Query by status
{
  partitionKey: "status",
  sortKey: "createdAt",
  projection: "ALL"
}

// GSI 2: Query by customer
{
  partitionKey: "customerCode",
  sortKey: "orderDate",
  projection: "ALL"
}

// GSI 3: Query by entity
{
  partitionKey: "entityId",
  sortKey: "createdAt",
  projection: "ALL"
}
```

#### **Table 2: `tasco-sales-order-activity`**

**Purpose**: Activity log for audit trail and dashboard

**Partition Key**: `activityId` (String)
**Sort Key**: `timestamp` (String)
**GSI 1**: `orderId-timestamp-index` (for order-specific activity)

**Attributes**:
```typescript
{
  activityId: string;           // UUID
  orderId: string;              // Reference to order
  entityId: string;             // Tasco subsidiary

  action: "uploaded" | "extracted" | "validated" | "reviewed" | "approved" | "rejected" | "exported" | "deleted";

  details: {
    userId?: string;
    userName?: string;
    changes?: Record<string, any>;  // What was changed
    reason?: string;                // Rejection reason, etc.
  };

  timestamp: string;            // ISO 8601
  ttl?: number;                 // Auto-cleanup after 90 days
}
```

#### **Table 3: `tasco-sales-order-metrics`**

**Purpose**: Pre-aggregated metrics for dashboard performance

**Partition Key**: `metricType` (String)
**Sort Key**: `date` (String)

**Attributes**:
```typescript
{
  metricType: "daily" | "weekly" | "monthly";
  date: string;                 // e.g., "2025-01-09"
  entityId: string;

  metrics: {
    totalOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    exportedOrders: number;
    avgConfidence: number;
    avgProcessingTimeMs: number;
    totalTimeSavedHours: number;
  };

  updatedAt: string;
}
```

#### **Table 4: `tasco-customers` (Optional - for validation)**

**Purpose**: Master customer list for validation

**Partition Key**: `customerCode` (String)

**Attributes**:
```typescript
{
  customerCode: string;         // e.g., "KH001"
  customerName: string;
  entityId: string;             // Which Tasco subsidiary

  address?: string;
  phone?: string;
  email?: string;

  // Validation data
  isActive: boolean;
  creditLimit?: number;
  paymentTerms?: string;

  // Stats
  totalOrders: number;
  lastOrderDate?: string;

  createdAt: string;
  updatedAt: string;
}
```

#### **Table 5: `tasco-products` (Optional - for validation)**

**Purpose**: Master product catalog for validation

**Partition Key**: `productCode` (String)

**Attributes**:
```typescript
{
  productCode: string;          // e.g., "SP001"
  productName: string;
  entityId: string;             // Which Tasco subsidiary

  // Pricing
  unitPrice: number;
  unit: string;                 // thùng, hộp, chai

  // Validation
  isActive: boolean;
  category?: string;

  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Required Agents

### 3.1 Existing Agents (Already Configured ✅)

#### **Agent 1: Vietnamese Order Data Extractor**
- **Agent ID**: `69613126c57d451439d4c4e4`
- **Model**: gpt-4o-mini
- **Temperature**: 0.2
- **Status**: ✅ **Already Created & Integrated**
- **Used In**: `/app/api/extract/route.ts`
- **Purpose**: Extract structured order data from OCR text

#### **Agent 2: Order Validation Specialist**
- **Agent ID**: `69613126c57d451439d4c4e5`
- **Model**: gpt-4o-mini
- **Temperature**: 0.1
- **Status**: ✅ **Created but NOT Integrated**
- **Purpose**: Validate extracted data for quality

**Action Required**: Wire validation agent into workflow

### 3.2 New Agents Needed

#### **Agent 3: Real-time Order Monitor (Optional)**
- **Model**: gpt-4o-mini
- **Temperature**: 0.3
- **Purpose**: Monitor orders in review queue, flag anomalies
- **System Prompt**:
```
You are an order monitoring specialist for Vietnamese sales orders.

Analyze incoming orders and flag potential issues:
1. Unusual pricing (significantly above/below average)
2. Duplicate orders (same customer, similar items, same day)
3. Invalid customer codes (not in master list)
4. Invalid product codes (not in catalog)
5. Date anomalies (order date in future, delivery before order)
6. Quantity outliers (unusually high or low)

Return JSON with anomaly alerts.
```

---

## 4. File Storage Architecture

### 4.1 S3 Bucket Structure

**Bucket Name**: `tasco-sales-orders-{env}` (e.g., `tasco-sales-orders-prod`)

**Folder Structure**:
```
s3://tasco-sales-orders-prod/
├── uploads/
│   ├── {entityId}/
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── {orderId}/
│   │   │   │   │   ├── original.pdf
│   │   │   │   │   ├── original.jpg
│   │   │   │   │   └── metadata.json
│   │   │   │   └── ...
├── exports/
│   ├── {entityId}/
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── bravo-export-{date}.xlsx
│   │   │   │   └── ...
└── processed/
    ├── {orderId}/
    │   ├── ocr-output.json
    │   ├── extraction-result.json
    │   └── validation-result.json
```

**Lifecycle Rules**:
- `uploads/`: Retain for 90 days, then move to Glacier
- `exports/`: Retain for 7 years (tax compliance)
- `processed/`: Delete after 30 days

### 4.2 File Upload Flow

```typescript
// 1. Upload to S3
const s3Key = `uploads/${entityId}/${year}/${month}/${orderId}/original.pdf`;
await s3Client.putObject({ Bucket, Key: s3Key, Body: file });

// 2. Generate pre-signed URL for viewing
const viewUrl = await s3Client.getSignedUrl('getObject', {
  Bucket,
  Key: s3Key,
  Expires: 3600 // 1 hour
});

// 3. Store S3 key in DynamoDB
await dynamoDb.putItem({
  TableName: 'tasco-sales-orders',
  Item: {
    orderId,
    sourceUrl: s3Key, // Store S3 key, not pre-signed URL
    ...
  }
});
```

---

## 5. Authentication & Multi-Tenancy

### 5.1 User Authentication

**Current State**: ❌ No authentication
**Required**: ✅ User authentication with entity-based access control

**Implementation Options**:

1. **Use Existing Tasco Auth** (if available)
2. **Add NextAuth.js** with:
   - Email/password
   - Google OAuth
   - JWT sessions

**User Schema**:
```typescript
{
  userId: string;
  email: string;
  name: string;
  role: "admin" | "reviewer" | "uploader";
  entityId: string;             // Which Tasco subsidiary
  permissions: string[];        // ["upload", "review", "export"]
}
```

### 5.2 Multi-Tenancy (Entity Isolation)

**Current State**: ❌ No entity filtering
**Required**: ✅ Row-level security by `entityId`

**Implementation**:
```typescript
// All DynamoDB queries must filter by entityId
const getUserOrders = async (userId: string) => {
  const user = await getUser(userId);

  return dynamoDb.query({
    TableName: 'tasco-sales-orders',
    IndexName: 'entityId-createdAt-index',
    KeyConditionExpression: 'entityId = :entityId',
    ExpressionAttributeValues: {
      ':entityId': user.entityId  // CRITICAL: Filter by user's entity
    }
  });
};
```

---

## 6. API Routes to Update

### 6.1 File Upload Flow

**Current**: FileDropzone uploads files but doesn't persist
**Required**: Full upload → OCR → Extract → Validate → Store pipeline

```typescript
// app/api/upload/route.ts (NEW)
POST /api/upload
1. Receive file from FileDropzone
2. Upload to S3
3. Call OCR API (/api/ocr)
4. Call Extraction API (/api/extract) with OCR text
5. Call Validation API (/api/validate) with extracted data
6. Save to DynamoDB with all results
7. Return order ID to frontend
```

### 6.2 Orders API Updates

**File**: `app/api/orders/route.ts`

**Changes**:
```typescript
// BEFORE (in-memory array)
let orders: Order[] = [ /* hardcoded */ ];

// AFTER (DynamoDB)
import { docClient } from "@tasco/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const entityId = await getEntityIdFromSession(request);

  const params = {
    TableName: "tasco-sales-orders",
    IndexName: "entityId-createdAt-index",
    KeyConditionExpression: "entityId = :entityId",
    ExpressionAttributeValues: {
      ":entityId": entityId,
    },
    ScanIndexForward: false, // DESC order
    Limit: 50,
  };

  if (status) {
    params.FilterExpression = "status = :status";
    params.ExpressionAttributeValues[":status"] = status;
  }

  const result = await docClient.query(params);
  return NextResponse.json({
    success: true,
    data: result.Items
  });
}
```

### 6.3 Validation API (NEW)

**File**: `app/api/validate/route.ts` (needs to be created)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createLyzrClient } from "@tasco/lyzr";

export async function POST(request: NextRequest) {
  const { extractedData, orderId } = await request.json();

  const lyzr = createLyzrClient({
    apiKey: process.env.LYZR_API_KEY!
  });

  const validationPrompt = `Validate this extracted order data:

${JSON.stringify(extractedData, null, 2)}

Return a validation report in JSON format.`;

  const response = await lyzr.chat(
    process.env.VALIDATION_AGENT_ID!,
    [{ role: "user", content: validationPrompt }],
    `validate-${orderId}`
  );

  // Parse JSON response
  let jsonText = response.message.trim();
  if (jsonText.includes("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  }

  const validation = JSON.parse(jsonText);

  return NextResponse.json({
    success: true,
    validation,
  });
}
```

### 6.4 Dashboard Metrics API (NEW)

**File**: `app/api/metrics/route.ts` (needs to be created)

```typescript
export async function GET(request: Request) {
  const entityId = await getEntityIdFromSession(request);
  const today = new Date().toISOString().split('T')[0];

  // Get today's metrics
  const todayMetrics = await docClient.get({
    TableName: 'tasco-sales-order-metrics',
    Key: { metricType: 'daily', date: today, entityId }
  });

  // Get real-time counts
  const [totalOrders, reviewingOrders] = await Promise.all([
    countOrders(entityId, null),
    countOrders(entityId, 'reviewing'),
  ]);

  return NextResponse.json({
    success: true,
    metrics: {
      totalOrders,
      reviewingOrders,
      processedToday: todayMetrics.Item?.metrics.totalOrders || 0,
      avgConfidence: todayMetrics.Item?.metrics.avgConfidence || 0,
      ...
    }
  });
}
```

---

## 7. Implementation Roadmap

### Phase 1: Database Setup (Week 1)
- [ ] Create DynamoDB tables with indexes
- [ ] Set up S3 bucket with lifecycle rules
- [ ] Add AWS credentials to environment
- [ ] Create database utilities in `@tasco/db`

### Phase 2: API Integration (Week 2)
- [ ] Update `/api/orders` to use DynamoDB
- [ ] Update `/api/orders/[id]` to query DynamoDB
- [ ] Create `/api/upload` endpoint
- [ ] Create `/api/validate` endpoint
- [ ] Create `/api/metrics` endpoint

### Phase 3: Frontend Updates (Week 3)
- [ ] Replace mock data in `app/page.tsx` with API calls
- [ ] Replace mock data in `app/review/page.tsx` with API calls
- [ ] Replace mock data in `app/review/[id]/page.tsx` with API call
- [ ] Replace mock data in `app/dashboard/page.tsx` with API calls
- [ ] Replace mock data in `app/history/page.tsx` with API calls
- [ ] Add loading states and error handling

### Phase 4: Authentication (Week 4)
- [ ] Add NextAuth.js configuration
- [ ] Create login page
- [ ] Add session management
- [ ] Implement entity-based access control
- [ ] Add user profile page

### Phase 5: Agent Integration (Week 5)
- [ ] Wire validation agent into upload flow
- [ ] Add real-time validation results to UI
- [ ] Create agent monitoring dashboard
- [ ] Add agent performance metrics

### Phase 6: Testing & Optimization (Week 6)
- [ ] End-to-end testing with real documents
- [ ] Performance optimization (query tuning)
- [ ] Error handling improvements
- [ ] User acceptance testing

---

## 8. Cost Estimation (Monthly)

### DynamoDB Costs (1000 orders/month)

| Resource | Units | Cost |
|----------|-------|------|
| Write Capacity (orders) | 1000 writes × $1.25/million | $0.001 |
| Read Capacity (queries) | 10,000 reads × $0.25/million | $0.003 |
| Storage (1 GB) | 1 GB × $0.25/GB | $0.25 |
| **Total DynamoDB** | | **$0.25/month** |

### S3 Costs (1000 PDFs, 5MB avg)

| Resource | Units | Cost |
|----------|-------|------|
| Storage (5 GB) | 5 GB × $0.023/GB | $0.12 |
| PUT requests | 1000 × $0.005/1000 | $0.005 |
| GET requests | 5000 × $0.0004/1000 | $0.002 |
| **Total S3** | | **$0.13/month** |

### Agent Inference (gpt-4o-mini)

| Resource | Tokens/Order | Cost |
|----------|--------------|------|
| Extraction (2K in, 1K out) | 3K tokens | $0.001 |
| Validation (1K in, 0.5K out) | 1.5K tokens | $0.0005 |
| **Total per order** | | **$0.0015** |
| **1000 orders** | | **$1.50/month** |

### **Total Monthly Cost: ~$2/month**

**ROI**:
- Manual entry cost: $2000/month (40 hours @ $50/hr)
- Automated cost: $2/month
- **Savings: $1998/month (99.9% cost reduction)**

---

## 9. Database Infrastructure Reusability

**✅ Good News**: The existing `@tasco/db` package provides **85% of the infrastructure** needed for the sales-order application.

### 9.1 What Can Be Reused Directly (0 hours effort)

✅ **DynamoDB Client** - Complete client configuration
✅ **Entity Management System** - Multi-tenancy support for 17 Tasco entities
✅ **S3 Operations** - File upload/download with versioning support
✅ **Content Type Utilities** - MIME type detection, file validation
✅ **Pagination Pattern** - Built-in pagination helpers
✅ **Table Initialization Scripts** - Clear patterns for creating tables

### 9.2 What Needs to Be Created (42 hours effort)

🆕 **Sales Order Module** (`packages/db/src/sales-orders/`)
- Order CRUD operations (8 hours)
- Activity logging functions (4 hours)
- Metrics aggregation (6 hours)
- Type definitions (3 hours)
- Table definitions (2 hours)
- Customers/Products master data (8 hours, optional)
- Testing & validation (8 hours)
- Documentation (3 hours)

### 9.3 Reusability Impact

**Without Reuse**: 120 hours (3 weeks)
**With Reuse**: 42 hours (1 week)
**Time Saved**: 78 hours (65% reduction)
**Cost Saved**: $3,900 (at $50/hr)

### 9.4 Detailed Analysis

📄 **See**: `DATABASE_REUSABILITY_ANALYSIS.md` for comprehensive breakdown of:
- Existing infrastructure inventory
- Reusable patterns and utilities
- Implementation recommendations
- Code examples and migration path
- Phased development approach

**Key Takeaway**: By leveraging existing `@tasco/db` infrastructure, we can reduce implementation time from 15 days to 5 days while ensuring consistency with other Tasco applications.

---

## 10. Summary

### Current State
✅ Real agents configured (2/2)
❌ All data is hardcoded/in-memory
❌ No file persistence
❌ No authentication
❌ No validation agent integration

### Production Requirements
1. **5 DynamoDB tables** (orders, activity, metrics, customers, products)
2. **S3 bucket** for file storage
3. **Validation agent integration** (agent already exists)
4. **Authentication & multi-tenancy**
5. **Replace all 6 frontend mock data sources**
6. **Replace all 2 API in-memory stores**

### Effort Estimate
- **Development**: 6 weeks (1 developer)
- **Testing**: 1 week
- **Deployment**: 1 week
- **Total**: 8 weeks to production

### Risk Mitigation
- Use existing `@tasco/db` utilities
- Follow existing Tasco patterns (compliance-qa app)
- Incremental rollout (entity by entity)
- Maintain mock data as fallback during transition
