# Database Reusability Analysis for Sales Order Application

> **Analysis Date**: 2025-01-09
> **Purpose**: Identify existing `@tasco/db` patterns, utilities, and infrastructure that can be reused for the sales-order application

---

## Executive Summary

**Reusability Score: 85%** - The existing `@tasco/db` package provides extensive infrastructure that can be directly reused or adapted with minimal changes for the sales-order application.

**Key Findings**:
- ✅ **Entity management system** - Fully reusable for multi-tenancy
- ✅ **S3 operations** - Complete file handling with versioning
- ✅ **Utilities** - Content types, file handling, ID generation
- ✅ **Table creation patterns** - Clear scripts for new tables
- ✅ **Pagination support** - Built-in pagination helpers
- ⚠️ **Notifications system** - Adaptable for activity logging
- 🆕 **Need to create**: Sales-order specific tables and CRUD operations

---

## Part 1: Existing Infrastructure (Directly Reusable)

### 1.1 Table Naming & Configuration

**File**: `packages/db/src/tables.ts`

**Pattern**: All tables follow `tasco-{name}` convention with environment-based prefix support.

```typescript
export const TABLES = {
  CONVERSATIONS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-conversations`
    : "tasco-conversations",
  // ... more tables
} as const;
```

**✅ Reusable for Sales Order**:
```typescript
// Add to TABLES object in packages/db/src/tables.ts
export const TABLES = {
  // ... existing tables
  SALES_ORDERS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-orders`
    : "tasco-sales-orders",
  SALES_ORDER_ACTIVITY: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-order-activity`
    : "tasco-sales-order-activity",
  SALES_ORDER_METRICS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-sales-order-metrics`
    : "tasco-sales-order-metrics",
  CUSTOMERS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-customers`
    : "tasco-customers",
  PRODUCTS: process.env.DYNAMODB_TABLE_PREFIX
    ? `${process.env.DYNAMODB_TABLE_PREFIX}-products`
    : "tasco-products",
} as const;
```

**Recommendation**: Extend existing `TABLES` object rather than creating separate constants.

---

### 1.2 Key Prefix Pattern

**File**: `packages/db/src/tables.ts`

**Existing Pattern**:
```typescript
export const KEY_PREFIXES = {
  CONVERSATION: "CONV",
  MESSAGE: "MSG",
  ENTITY: "ENT",
  DOCUMENT: "DOC",
  COURSE: "COURSE",
  // ... more
} as const;
```

**✅ Reusable for Sales Order**:
```typescript
// Add to KEY_PREFIXES
export const KEY_PREFIXES = {
  // ... existing prefixes
  ORDER: "ORD",
  ACTIVITY: "ACT",
  METRIC: "MET",
  CUSTOMER: "CUST",
  PRODUCT: "PROD",
} as const;
```

**Helper Functions to Create**:
```typescript
// Add to packages/db/src/tables.ts
export const buildOrderPK = (entityId: string): string =>
  `${KEY_PREFIXES.ORDER}#${entityId}`;

export const buildOrderSK = (orderId: string): string =>
  `${orderId}`;

export const buildActivityPK = (orderId: string): string =>
  `${KEY_PREFIXES.ACTIVITY}#${orderId}`;

export const buildActivitySK = (timestamp: string, activityId: string): string =>
  `${timestamp}#${activityId}`;
```

---

### 1.3 Entity Management System

**File**: `packages/db/src/entities/`

**Existing Capabilities**:
- ✅ `createEntity()` - Create entities (Tasco subsidiaries)
- ✅ `getEntity()` - Get entity by ID
- ✅ `listEntities()` - List all entities with pagination
- ✅ `listEntitiesByType()` - Filter by entity type
- ✅ `listEntitiesByParent()` - Get child entities
- ✅ `updateEntity()` - Update entity metadata
- ✅ `deleteEntity()` - Remove entity
- ✅ `getEntityMap()` - Build lookup map for enrichment

**Entity Type**:
```typescript
export interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: EntityType; // "parent" | "holding" | "subsidiary"
  parentId?: string;
  metadata?: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}
```

**✅ 100% Reusable for Multi-Tenancy**:

All sales orders will be associated with an `entityId` (Inochi, Tasco Auto, etc.). The existing entity system provides:
- Entity hierarchy (parent → holding → subsidiary)
- Entity metadata storage
- Entity lookup for filtering orders by company

**Usage in Sales Order Application**:
```typescript
import { listEntities, getEntity } from "@tasco/db";

// Get all entities for entity selector
const { items: entities } = await listEntities(100);

// Filter orders by entity
const orders = await queryOrders({ entityId: "inochi" });

// Enrich order with entity name
const entity = await getEntity(order.entityId);
const orderWithEntity = { ...order, entityName: entity.name };
```

**No Changes Needed** - Use as-is.

---

### 1.4 S3 Operations

**File**: `packages/db/src/s3/client.ts`

**Existing Capabilities**:
- ✅ `putDocument()` - Upload text documents
- ✅ `putDocumentBinary()` - Upload binary files (PDF, images)
- ✅ `getDocument()` - Download text documents
- ✅ `getDocumentBuffer()` - Download binary files
- ✅ `deleteDocument()` - Remove files
- ✅ `getSignedUrl()` - Generate presigned URLs for secure access
- ✅ **Versioning support**:
  - `listDocumentVersions()` - Get all versions of a file
  - `getDocumentVersion()` - Get specific version
  - `restoreDocumentVersion()` - Restore old version
  - `getCurrentVersionId()` - Get latest version ID

**S3 Bucket**:
```typescript
export const DOCUMENTS_BUCKET = process.env.S3_DOCUMENTS_BUCKET || "tasco-documents";
```

**✅ 95% Reusable for Order File Uploads**:

The existing S3 operations can handle all file types needed for sales orders:
- PDF order documents
- Image scans (JPG, PNG)
- Excel exports for Bravo ERP

**Recommended Usage Pattern**:
```typescript
import { putDocumentBinary, getSignedUrl } from "@tasco/db/s3";

// Upload order PDF
const pdfPath = `uploads/${entityId}/${year}/${month}/${orderId}/original.pdf`;
await putDocumentBinary(pdfPath, pdfBuffer, "application/pdf");

// Generate presigned URL for viewing
const viewUrl = await getSignedUrl(pdfPath, 3600); // 1 hour expiry

// Upload Excel export
const excelPath = `exports/${entityId}/${year}/${month}/bravo-export-${date}.xlsx`;
await putDocumentBinary(excelPath, excelBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
```

**Minor Enhancement Needed**:

Add Excel MIME type to `packages/db/src/utilities/content-types.ts` (already has it - line 25):
```typescript
xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
```
✅ Already exists - no changes needed.

---

### 1.5 Content Type Utilities

**File**: `packages/db/src/utilities/content-types.ts`

**Existing Utilities**:
- ✅ `getContentType(extension)` - Get MIME type from file extension
- ✅ `isBinaryFile(filename)` - Check if file is binary
- ✅ `getFileExtension(filename)` - Extract extension
- ✅ `generateDocumentId(name)` - Create unique document ID
- ✅ `sanitizeFilename(name)` - Clean filename for storage
- ✅ `generateDocumentPath(name, ext, folder)` - Build S3 path
- ✅ `estimatePageCount(content)` - Estimate pages from content

**Supported MIME Types**:
```typescript
// Already supports all sales-order file types
pdf: "application/pdf",
jpg: "image/jpeg",
png: "image/png",
xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
```

**✅ 100% Reusable**:

All utilities work out-of-the-box for sales orders:

```typescript
import {
  getContentType,
  isBinaryFile,
  generateDocumentId,
  sanitizeFilename,
} from "@tasco/db/utilities";

// Generate order ID
const orderId = generateDocumentId("order-ABC-2025-01-09");
// => "doc-1736410800000-order-abc-2025-01-09"

// Get content type
const contentType = getContentType("pdf");
// => "application/pdf"

// Check if binary
const isBinary = isBinaryFile("order.pdf");
// => true
```

**No Changes Needed** - Use as-is.

---

### 1.6 Pagination Pattern

**File**: `packages/db/src/entities/types.ts`

**Existing Type**:
```typescript
export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
  hasMore: boolean;
}
```

**✅ 100% Reusable for Order Lists**:

The pagination pattern is already used in entity listings and can be directly applied to order queries:

```typescript
// Example implementation for orders
export async function listOrders(
  entityId: string,
  limit: number = 20,
  lastKey?: Record<string, unknown>
): Promise<PaginatedResult<Order>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.SALES_ORDERS,
      IndexName: "entityId-createdAt-index",
      KeyConditionExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Newest first
    })
  );

  return {
    items: (result.Items || []) as Order[],
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}
```

**No Changes Needed** - Use existing type.

---

### 1.7 Table Initialization Script

**File**: `packages/db/src/scripts/init-tables.ts`

**Existing Pattern**:
```typescript
const TABLE_DEFINITIONS = [
  {
    TableName: TABLES.CONVERSATIONS,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  // ... more tables
];
```

**✅ 100% Reusable Pattern**:

Follow the same structure for sales-order tables. The init script already handles:
- Table existence checking
- Error handling
- Success/failure reporting
- PAY_PER_REQUEST billing mode (no capacity planning needed)

**Recommended Approach**:

Add sales-order table definitions to the same `TABLE_DEFINITIONS` array:

```typescript
// Add to packages/db/src/scripts/init-tables.ts
const TABLE_DEFINITIONS = [
  // ... existing tables
  {
    TableName: TABLES.SALES_ORDERS,
    KeySchema: [
      { AttributeName: "orderId", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "entityId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "status-createdAt-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "entityId-createdAt-index",
        KeySchema: [
          { AttributeName: "entityId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  // ... more sales-order tables
];
```

**Run Command** (already exists):
```bash
cd packages/db && bun run db:init
```

---

### 1.8 Notifications System (Adaptable)

**File**: `packages/db/src/notifications.ts`

**Existing Type**:
```typescript
export type Notification = {
  notificationId: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};
```

**⚠️ 70% Reusable for Activity Logging**:

The notifications system is designed for user-facing notifications, but the pattern can be adapted for order activity logging:

**Differences**:
| Aspect | Notifications | Order Activity |
|--------|---------------|----------------|
| Primary Key | userId | orderId |
| Purpose | User alerts | Audit trail |
| Read Status | Yes | No |
| Filtering | By user | By order |

**Recommendation**: Create separate `sales-order-activity` module using similar patterns but order-centric schema.

---

## Part 2: Existing Patterns to Adapt

### 2.1 DynamoDB Client & Operations

**File**: `packages/db/src/client.ts`

**Existing Exports**:
```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient);
```

**✅ 100% Reusable**:

Use the same clients for all sales-order operations:

```typescript
import { docClient } from "@tasco/db";
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Create order
await docClient.send(new PutCommand({
  TableName: TABLES.SALES_ORDERS,
  Item: orderData,
}));

// Get order
const result = await docClient.send(new GetCommand({
  TableName: TABLES.SALES_ORDERS,
  Key: { orderId },
}));
```

---

### 2.2 CRUD Operation Pattern

**Reference**: `packages/db/src/entities/entities.ts`

**Existing Pattern**:
```typescript
// Create
export async function createEntity(input: CreateEntityInput): Promise<Entity> {
  const id = input.id || generateId(input.name);
  const now = new Date().toISOString();

  const item = { pk, sk, id, ...input, createdAt: now, updatedAt: now };

  await docClient.send(new PutCommand({
    TableName: TABLES.ENTITIES,
    Item: item,
  }));

  return item;
}

// Get
export async function getEntity(entityId: string): Promise<Entity | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.ENTITIES,
    Key: { pk: ENTITY_ALL_PK, sk: entityId },
  }));

  return result.Item ? itemToEntity(result.Item) : null;
}

// Update
export async function updateEntity(
  entityId: string,
  updates: UpdateEntityInput
): Promise<Entity | null> {
  // Dynamic UpdateExpression building
  const updateExpressions = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames = { "#updatedAt": "updatedAt" };
  const expressionAttributeValues = { ":updatedAt": new Date().toISOString() };

  // Add each update field
  if (updates.name !== undefined) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = updates.name;
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLES.ENTITIES,
    Key: { pk: ENTITY_ALL_PK, sk: entityId },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  }));

  return result.Attributes ? itemToEntity(result.Attributes) : null;
}

// Delete
export async function deleteEntity(entityId: string): Promise<void> {
  await docClient.send(new DeleteCommand({
    TableName: TABLES.ENTITIES,
    Key: { pk: ENTITY_ALL_PK, sk: entityId },
  }));
}
```

**✅ 100% Reusable Pattern**:

Create similar CRUD operations for orders:

```typescript
// packages/db/src/sales-orders/orders.ts (new file)

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const item: OrderItem = {
    orderId,
    ...input,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLES.SALES_ORDERS,
    Item: item,
  }));

  return itemToOrder(item);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.SALES_ORDERS,
    Key: { orderId },
  }));

  return result.Item ? itemToOrder(result.Item) : null;
}

export async function updateOrder(
  orderId: string,
  updates: UpdateOrderInput
): Promise<Order | null> {
  // Follow same dynamic UpdateExpression pattern
  // ...
}

export async function deleteOrder(orderId: string): Promise<void> {
  await docClient.send(new DeleteCommand({
    TableName: TABLES.SALES_ORDERS,
    Key: { orderId },
  }));
}
```

---

### 2.3 ID Generation Pattern

**Reference**: `packages/db/src/entities/entities.ts` (line 22-27)

**Existing Pattern**:
```typescript
const generateId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};
```

**✅ Reusable with Enhancement**:

For orders, we need sequential IDs with timestamps:

```typescript
// packages/db/src/sales-orders/utils.ts (new file)

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
  // Example: "ORD-1736410800000-A3B2F1"
}

export function generateActivityId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ACT-${timestamp}-${random}`.toUpperCase();
}
```

---

## Part 3: New Components Needed

### 3.1 Sales Order Tables Module

**Path**: `packages/db/src/sales-orders/` (new directory)

**Files to Create**:

```
packages/db/src/sales-orders/
├── index.ts          # Public exports
├── types.ts          # Order, Activity, Metrics types
├── orders.ts         # Order CRUD operations
├── activity.ts       # Activity logging operations
├── metrics.ts        # Metrics aggregation operations
├── customers.ts      # Customer CRUD operations (optional)
├── products.ts       # Product CRUD operations (optional)
└── utils.ts          # Helper functions (ID generation, etc.)
```

**Types to Define** (`types.ts`):

```typescript
export interface Order {
  orderId: string;
  entityId: string;
  status: OrderStatus;
  sourceType: "pdf" | "image" | "email" | "zalo";
  sourceUrl: string;
  fileName: string;
  fileSize: number;
  confidence: number;
  extractedData: ExtractedOrderData;
  validation?: ValidationResult;
  processingTime: ProcessingMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  exportedAt?: string;
  exportedBy?: string;
  extractionAgentId: string;
  validationAgentId?: string;
  ttl?: number;
}

export interface OrderActivity {
  activityId: string;
  orderId: string;
  entityId: string;
  action: ActivityAction;
  details: Record<string, any>;
  timestamp: string;
  ttl?: number;
}

export interface OrderMetrics {
  metricType: "daily" | "weekly" | "monthly";
  date: string;
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

// ... more types
```

**Export from Main Index** (`packages/db/src/index.ts`):

```typescript
// Add to existing exports
export {
  // Order operations
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  listOrders,
  listOrdersByStatus,
  listOrdersByEntity,

  // Activity operations
  logActivity,
  getOrderActivity,

  // Metrics operations
  updateMetrics,
  getMetrics,

  // Types
  type Order,
  type OrderActivity,
  type OrderMetrics,
  type CreateOrderInput,
  type UpdateOrderInput,
} from "./sales-orders";
```

---

### 3.2 Table Definitions

**Add to**: `packages/db/src/scripts/init-tables.ts`

See detailed table schemas in Part 1.7 above.

**Tables to Create**:
1. `tasco-sales-orders` - Main orders table
2. `tasco-sales-order-activity` - Activity log
3. `tasco-sales-order-metrics` - Aggregated metrics
4. `tasco-customers` - Customer master data (optional)
5. `tasco-products` - Product master data (optional)

---

## Part 4: Implementation Recommendations

### 4.1 Phased Approach

**Phase 1: Core Order Management** (Week 1-2)
- ✅ Add table names to `TABLES` constant
- ✅ Create `packages/db/src/sales-orders/types.ts`
- ✅ Create `packages/db/src/sales-orders/orders.ts` (CRUD)
- ✅ Add table definitions to `init-tables.ts`
- ✅ Run `bun run db:init` to create tables
- ✅ Export from main index

**Phase 2: Activity Logging** (Week 2-3)
- ✅ Create `packages/db/src/sales-orders/activity.ts`
- ✅ Implement activity logging functions
- ✅ Add activity table to init script

**Phase 3: Metrics & Analytics** (Week 3-4)
- ✅ Create `packages/db/src/sales-orders/metrics.ts`
- ✅ Implement metrics aggregation
- ✅ Add metrics table to init script

**Phase 4: Master Data (Optional)** (Week 4-5)
- ⚠️ Create customer/product tables
- ⚠️ Implement master data CRUD
- ⚠️ Add validation against master data

---

### 4.2 Code Reuse Checklist

**Directly Reuse (No Changes)**:
- ✅ DynamoDB client (`docClient`, `dynamoClient`)
- ✅ Entity management system (for multi-tenancy)
- ✅ S3 operations (file uploads/downloads)
- ✅ Content type utilities
- ✅ Pagination pattern (`PaginatedResult`)
- ✅ Table initialization script structure

**Adapt Existing Patterns**:
- ⚠️ CRUD operation pattern (follow entity module structure)
- ⚠️ ID generation (create order-specific generators)
- ⚠️ Key prefix pattern (add order-specific prefixes)
- ⚠️ Composite key builders (create order key helpers)

**Create New**:
- 🆕 Sales order types and interfaces
- 🆕 Order CRUD operations
- 🆕 Activity logging functions
- 🆕 Metrics aggregation functions
- 🆕 Order-specific utilities
- 🆕 Table definitions for 5 new tables

---

### 4.3 File Structure After Implementation

```
packages/db/src/
├── client.ts                      # ✅ No changes (reuse)
├── index.ts                       # ⚠️ Add sales-order exports
├── tables.ts                      # ⚠️ Add 5 new table names + key prefixes
│
├── entities/                      # ✅ No changes (reuse)
│   ├── index.ts
│   ├── types.ts
│   └── entities.ts
│
├── s3/                            # ✅ No changes (reuse)
│   ├── index.ts
│   └── client.ts
│
├── utilities/                     # ✅ No changes (reuse)
│   ├── content-types.ts
│   └── index.ts
│
├── sales-orders/                  # 🆕 New module
│   ├── index.ts
│   ├── types.ts
│   ├── orders.ts
│   ├── activity.ts
│   ├── metrics.ts
│   ├── customers.ts (optional)
│   ├── products.ts (optional)
│   └── utils.ts
│
└── scripts/
    ├── init-tables.ts             # ⚠️ Add 5 new table definitions
    └── seed-entities.ts           # ✅ No changes
```

---

## Part 5: Cost & Effort Estimation

### 5.1 Effort Breakdown

| Component | Effort | Notes |
|-----------|--------|-------|
| **Reusable Infrastructure (0 effort)** | 0 hours | Client, entities, S3, utilities |
| **Table definitions** | 2 hours | Add 5 tables to init script |
| **Type definitions** | 3 hours | Order, Activity, Metrics types |
| **Order CRUD operations** | 8 hours | Create, get, update, delete, list |
| **Activity logging** | 4 hours | Log activity, get history |
| **Metrics aggregation** | 6 hours | Update and query metrics |
| **Customers/Products (optional)** | 8 hours | Master data CRUD |
| **Testing & validation** | 8 hours | Unit tests, integration tests |
| **Documentation** | 3 hours | API docs, examples |
| **Total** | **42 hours** | ~1 week (1 developer) |

**With Reuse**: 42 hours
**Without Reuse**: ~120 hours (3x longer)

**Time Saved**: 78 hours (65% reduction)

---

### 5.2 Cost Analysis

**Storage Costs** (unchanged from PRODUCTION_AUDIT.md):
- DynamoDB: ~$1/month for 1000 orders
- S3: ~$0.50/month for 1000 files
- **Total**: ~$1.50/month

**Development Costs**:
- **With Reuse**: 42 hours × $50/hr = **$2,100**
- **Without Reuse**: 120 hours × $50/hr = **$6,000**
- **Savings**: **$3,900** (65% reduction)

---

## Part 6: Migration Path

### 6.1 From Mock Data to Production Database

**Step 1: Create Database Schema** (Day 1)
```bash
# Add table definitions to init-tables.ts
# Run initialization
cd packages/db
bun run db:init
```

**Step 2: Implement CRUD Operations** (Day 2-3)
```bash
# Create sales-orders module
mkdir packages/db/src/sales-orders
# Implement orders.ts, activity.ts, types.ts
```

**Step 3: Update API Routes** (Day 4-5)
```typescript
// Before: In-memory array
let orders: Order[] = [];

// After: DynamoDB operations
import { createOrder, getOrder, listOrders } from "@tasco/db";

export async function GET(request: NextRequest) {
  const { items, hasMore } = await listOrders(entityId, 20);
  return NextResponse.json({ items, hasMore });
}
```

**Step 4: Update Frontend** (Day 6-7)
```typescript
// Before: Static mock data
const mockOrders = [...];

// After: API fetch
const { data } = await fetch("/api/orders");
const orders = data.items;
```

**Step 5: Testing & Validation** (Day 8-10)
- Test CRUD operations
- Test pagination
- Test multi-tenancy (entity filtering)
- Test S3 file uploads
- Test activity logging

---

## Part 7: Summary & Recommendations

### 7.1 Reusability Matrix

| Component | Status | Reusability | Effort |
|-----------|--------|-------------|--------|
| DynamoDB Client | ✅ Direct | 100% | 0 hours |
| Entity System | ✅ Direct | 100% | 0 hours |
| S3 Operations | ✅ Direct | 100% | 0 hours |
| Content Utilities | ✅ Direct | 100% | 0 hours |
| Pagination Pattern | ✅ Direct | 100% | 0 hours |
| Table Init Script | ✅ Extend | 95% | 2 hours |
| CRUD Pattern | ⚠️ Adapt | 80% | 8 hours |
| Key Prefixes | ⚠️ Extend | 90% | 1 hour |
| Notifications | ⚠️ Adapt | 70% | 4 hours |
| Order Module | 🆕 New | 0% | 20 hours |
| **Overall** | **Mixed** | **85%** | **42 hours** |

---

### 7.2 Key Recommendations

1. **✅ DO Reuse**:
   - DynamoDB client and AWS configuration
   - Entity management for multi-tenancy
   - S3 operations for file handling
   - Content type utilities
   - Pagination helpers
   - Table initialization patterns

2. **⚠️ DO Adapt**:
   - CRUD operation patterns (follow entity module structure)
   - Key naming conventions (add ORDER, ACTIVITY prefixes)
   - Dynamic UpdateExpression building

3. **🆕 DO Create New**:
   - `sales-orders` module with order-specific logic
   - Order, Activity, Metrics types
   - 5 new DynamoDB tables
   - Order-specific utility functions

4. **❌ DON'T**:
   - Re-implement DynamoDB client
   - Re-implement S3 operations
   - Re-implement entity management
   - Re-implement pagination logic

---

### 7.3 Next Steps

**Immediate (This Week)**:
1. Add table names to `TABLES` constant
2. Create `sales-orders` directory structure
3. Define TypeScript types for Order, Activity, Metrics
4. Add table definitions to `init-tables.ts`

**Short-term (Next 2 Weeks)**:
5. Implement Order CRUD operations
6. Implement Activity logging
7. Run table initialization
8. Update API routes to use database

**Medium-term (Next Month)**:
9. Implement Metrics aggregation
10. Add Customer/Product master data (optional)
11. Write unit tests
12. Write documentation

---

## Part 8: Code Examples

### 8.1 Creating an Order

```typescript
import { createOrder } from "@tasco/db";

const order = await createOrder({
  entityId: "inochi",
  sourceType: "pdf",
  sourceUrl: "s3://tasco-documents/uploads/inochi/2025/01/ORD-123/original.pdf",
  fileName: "order-abc-2025-01-09.pdf",
  fileSize: 245678,
  extractedData: {
    customerName: { value: "Công ty TNHH ABC", confidence: 98 },
    customerCode: { value: "KH001", confidence: 95 },
    orderDate: { value: "2025-01-09", confidence: 92 },
    items: [
      {
        id: "1",
        productCode: { value: "SP001", confidence: 96 },
        productName: { value: "Sản phẩm A", confidence: 94 },
        quantity: { value: 100, confidence: 98 },
        unit: { value: "thùng", confidence: 92 },
        unitPrice: { value: 50000, confidence: 90 },
        amount: 5000000,
      },
    ],
    totalAmount: 5000000,
  },
  createdBy: "user-123",
  extractionAgentId: "69613126c57d451439d4c4e4",
});

console.log(`Created order: ${order.orderId}`);
```

---

### 8.2 Listing Orders by Entity

```typescript
import { listOrdersByEntity } from "@tasco/db";

const { items, hasMore, lastEvaluatedKey } = await listOrdersByEntity(
  "inochi",
  20, // limit
  undefined // lastKey for pagination
);

console.log(`Found ${items.length} orders`);
console.log(`Has more: ${hasMore}`);
```

---

### 8.3 Logging Activity

```typescript
import { logActivity } from "@tasco/db";

await logActivity({
  orderId: "ORD-1736410800000-A3B2F1",
  entityId: "inochi",
  action: "approved",
  details: {
    userId: "user-123",
    userName: "Nguyen Van A",
    changes: {
      status: { from: "reviewing", to: "approved" },
    },
  },
});
```

---

### 8.4 Uploading Order File

```typescript
import { putDocumentBinary, getSignedUrl } from "@tasco/db/s3";

// Upload PDF
const pdfPath = `uploads/inochi/2025/01/${orderId}/original.pdf`;
await putDocumentBinary(pdfPath, pdfBuffer, "application/pdf");

// Generate view URL
const viewUrl = await getSignedUrl(pdfPath, 3600); // 1 hour expiry

console.log(`View URL: ${viewUrl}`);
```

---

## Conclusion

**The existing `@tasco/db` package provides 85% of the infrastructure needed for the sales-order application.**

By reusing:
- ✅ DynamoDB client and configuration
- ✅ Entity management system
- ✅ S3 operations and utilities
- ✅ Pagination patterns
- ✅ Table initialization scripts

We can **reduce implementation time from 15 days to 5 days** (65% reduction) and ensure consistency with other Tasco applications.

**Recommended Action**: Follow the phased implementation approach outlined in Part 4.1, starting with core order management and progressively adding activity logging and metrics.

---

**End of Analysis**
