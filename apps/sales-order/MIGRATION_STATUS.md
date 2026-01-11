# Sales Order Migration Status

**Last Updated**: 2025-01-09
**Progress**: Week 1 Complete ✅ | Week 2: 50% Complete ⚠️ | Week 3: Pending

---

## ✅ WEEK 1: DATABASE FOUNDATION - COMPLETE

### Created Files

1. **`packages/db/src/sales-orders/types.ts`** ✅
   - All TypeScript interfaces for Order, Activity, Metrics
   - 300+ lines of comprehensive type definitions

2. **`packages/db/src/sales-orders/orders.ts`** ✅
   - Full CRUD operations (create, get, update, delete, list)
   - Query functions (by status, by entity, search)
   - Count functions for dashboard
   - 350+ lines

3. **`packages/db/src/sales-orders/activity.ts`** ✅
   - Activity logging (logActivity, getOrderActivity)
   - 80+ lines

4. **`packages/db/src/sales-orders/metrics.ts`** ✅
   - Metrics aggregation (update, get, get ranges)
   - Helper functions (getTodayMetrics, getWeekMetrics, etc.)
   - 200+ lines

5. **`packages/db/src/sales-orders/utils.ts`** ✅
   - ID generation (generateOrderId, generateActivityId)
   - Confidence calculation
   - Data validation
   - Time saved calculation
   - 180+ lines

6. **`packages/db/src/sales-orders/index.ts`** ✅
   - Public exports for all types and functions

### Modified Files

7. **`packages/db/src/tables.ts`** ✅
   - Added 3 table names (SALES_ORDERS, SALES_ORDER_ACTIVITY, SALES_ORDER_METRICS)
   - Added key prefixes (ORDER, ACTIVITY, METRIC)
   - Added key builder functions

8. **`packages/db/src/scripts/init-tables.ts`** ✅
   - Added 3 table definitions with GSI indexes

9. **`packages/db/src/index.ts`** ✅
   - Exported all sales-orders module functions and types

### Database Tables Created ✅

```bash
$ bun run db:init
✓ Table "tasco-sales-orders" created successfully
✓ Table "tasco-sales-order-activity" created successfully
✓ Table "tasco-sales-order-metrics" created successfully
```

**Tables in AWS DynamoDB:**
- `tasco-sales-orders` (with 2 GSI: status-createdAt-index, entityId-createdAt-index)
- `tasco-sales-order-activity` (pk/sk composite key)
- `tasco-sales-order-metrics` (pk/sk composite key)

---

## ⚠️ WEEK 2: API ROUTES - 50% COMPLETE

### Completed Routes ✅

1. **`apps/sales-order/app/api/orders/route.ts`** ✅
   - ✅ GET: List orders with filters (status, search, entity)
   - ✅ POST: Create new order from extracted data
   - Replaced in-memory array with DynamoDB operations
   - Added activity logging
   - 140 lines

2. **`apps/sales-order/app/api/orders/[id]/route.ts`** ✅
   - ✅ GET: Get single order by ID
   - ✅ PATCH: Update order (status, extracted data, validation)
   - ✅ DELETE: Delete order with activity logging
   - 200 lines

### Remaining Routes (Need Implementation)

3. **`apps/sales-order/app/api/upload/route.ts`** ⚠️ TODO
   **Current**: Returns mock response
   **Needs**:
   ```typescript
   import { putDocumentBinary } from "@tasco/db/s3";
   import { createOrder, logActivity } from "@tasco/db";

   // 1. Upload file to S3
   const s3Path = `uploads/${entityId}/${year}/${month}/${orderId}/original.${ext}`;
   await putDocumentBinary(s3Path, fileBuffer, contentType);

   // 2. Get S3 URL
   const sourceUrl = `s3://tasco-documents/${s3Path}`;

   // 3. Trigger OCR (call extraction API)
   const response = await fetch('/api/extract', {
     method: 'POST',
     body: JSON.stringify({ sourceUrl, fileName, orderId })
   });

   // 4. Create order record
   const order = await createOrder({
     entityId,
     sourceUrl,
     fileName,
     fileSize,
     sourceType,
     extractedData,
     confidence,
     processingTime,
     createdBy,
     extractionAgentId: process.env.EXTRACTION_AGENT_ID
   });

   // 5. Log activity
   await logActivity({
     orderId: order.orderId,
     entityId,
     action: "uploaded",
     details: { userId, fileName }
   });
   ```

4. **`apps/sales-order/app/api/extract/route.ts`** ⚠️ PARTIAL
   **Current**: Calls real Lyzr agent but doesn't save to DB
   **Needs**:
   ```typescript
   // After extraction
   const orderId = body.orderId || generateOrderId();

   // Save/update order in database
   if (existingOrderId) {
     await updateOrder(orderId, {
       extractedData,
       confidence,
       status: "reviewing"
     });
   } else {
     await createOrder({
       orderId,
       entityId,
       sourceUrl,
       fileName,
       fileSize,
       sourceType,
       extractedData,
       confidence,
       processingTime: {
         ocrMs: 0,
         extractionMs,
         validationMs: 0,
         totalMs: extractionMs
       },
       createdBy,
       extractionAgentId
     });
   }

   // Log activity
   await logActivity({
     orderId,
     entityId,
     action: "extracted",
     details: { confidence, extractionAgentId }
   });
   ```

5. **`apps/sales-order/app/api/validate/route.ts`** 🆕 NEW FILE NEEDED
   **Purpose**: Call validation agent with extracted data
   **Code**:
   ```typescript
   import { NextRequest, NextResponse } from "next/server";
   import { createLyzrClient } from "@tasco/lyzr";
   import { updateOrder, logActivity } from "@tasco/db";

   export async function POST(request: NextRequest) {
     const { orderId, extractedData, entityId } = await request.json();

     // Call validation agent
     const lyzrClient = createLyzrClient({
       apiKey: process.env.LYZR_API_KEY!,
     });

     const validationStart = Date.now();
     const response = await lyzrClient.chat({
       agentId: process.env.VALIDATION_AGENT_ID!,
       message: JSON.stringify(extractedData),
     });

     const validationMs = Date.now() - validationStart;

     // Parse validation result
     const validation = JSON.parse(response.message);

     // Update order with validation
     await updateOrder(orderId, {
       validation,
       validationAgentId: process.env.VALIDATION_AGENT_ID
     });

     // Log activity
     await logActivity({
       orderId,
       entityId,
       action: "validated",
       details: {
         overallScore: validation.overallScore,
         isValid: validation.isValid,
         issuesCount: validation.issues.length
       }
     });

     return NextResponse.json({
       success: true,
       data: validation
     });
   }
   ```

6. **`apps/sales-order/app/api/dashboard/route.ts`** ⚠️ TODO
   **Current**: Returns hardcoded metrics
   **Needs**:
   ```typescript
   import {
     getTodayMetrics,
     getWeekMetrics,
     aggregateMetrics,
     getOrderCountByStatus,
     getOrderCountByEntity,
     listOrdersByEntity
   } from "@tasco/db";

   export async function GET(request: NextRequest) {
     const { searchParams } = request.nextUrl;
     const entityId = searchParams.get("entityId") || "inochi";

     // Get metrics
     const todayMetrics = await getTodayMetrics(entityId);
     const weekMetrics = await getWeekMetrics(entityId);
     const weekAggregated = aggregateMetrics(weekMetrics);

     // Get counts
     const reviewingCount = await getOrderCountByStatus("reviewing");
     const totalCount = await getOrderCountByEntity(entityId);

     // Get recent activity
     const recentOrders = await listOrdersByEntity(entityId, 5);

     return NextResponse.json({
       success: true,
       data: {
         metrics: {
           totalOrders: totalCount,
           processedToday: todayMetrics?.metrics.totalOrders || 0,
           avgAccuracy: todayMetrics?.metrics.avgConfidence || 0,
           timeSaved: weekAggregated.totalTimeSavedHours
         },
         recentActivity: recentOrders.items.map(order => ({
           id: order.orderId,
           action: order.status === "approved" ? "Order approved" : "Order uploaded",
           orderId: order.orderId,
           customer: order.extractedData.customerName.value,
           time: new Date(order.updatedAt).toLocaleString(),
           type: order.status
         })),
         weeklyData: weekMetrics.map(m => ({
           day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
           orders: m.metrics.totalOrders
         }))
       }
     });
   }
   ```

---

## 🔄 WEEK 3: FRONTEND UPDATES - PENDING

All frontend pages currently use hardcoded mock data. Need to replace with API fetch calls:

### Pages to Update

1. **`apps/sales-order/app/page.tsx`** ⚠️ TODO
   **Change**:
   ```typescript
   // Before
   const mockRecentOrders = [...]

   // After
   const { data } = await fetch('/api/orders?limit=5&entityId=inochi');
   const recentOrders = data.data;
   ```

2. **`apps/sales-order/app/review/page.tsx`** ⚠️ TODO
   ```typescript
   // Before
   const mockPendingOrders = [...]

   // After
   const { data } = await fetch('/api/orders?status=reviewing&entityId=inochi');
   const pendingOrders = data.data;
   ```

3. **`apps/sales-order/app/review/[id]/page.tsx`** ⚠️ TODO
   ```typescript
   // Before
   const mockOrderData = {...}

   // After
   const { data } = await fetch(`/api/orders/${id}`);
   const orderData = data.data;
   ```

4. **`apps/sales-order/app/dashboard/page.tsx`** ⚠️ TODO
   ```typescript
   // Before
   const metrics = {...hardcoded...}

   // After
   const { data } = await fetch('/api/dashboard?entityId=inochi');
   const { metrics, recentActivity, weeklyData } = data.data;
   ```

5. **`apps/sales-order/app/history/page.tsx`** ⚠️ TODO
   ```typescript
   // Before
   const mockOrders = [...]

   // After
   const [orders, setOrders] = useState([]);
   const [lastKey, setLastKey] = useState(undefined);

   const fetchOrders = async () => {
     const { data } = await fetch(`/api/orders?entityId=inochi&limit=20`);
     setOrders(data.data);
   };
   ```

6. **`apps/sales-order/app/upload/page.tsx`** ⚠️ TODO
   ```typescript
   // Before
   // Mock file upload simulation

   // After
   const formData = new FormData();
   formData.append('file', file);
   formData.append('entityId', 'inochi');

   const response = await fetch('/api/upload', {
     method: 'POST',
     body: formData
   });

   const { orderId } = await response.json();

   // Redirect to review page
   router.push(`/review/${orderId}`);
   ```

---

## 📊 Progress Summary

| Week | Component | Status | Progress |
|------|-----------|--------|----------|
| **Week 1** | Database Module | ✅ Complete | 100% |
| | - Types | ✅ | |
| | - Orders CRUD | ✅ | |
| | - Activity Logging | ✅ | |
| | - Metrics Aggregation | ✅ | |
| | - Table Initialization | ✅ | |
| **Week 2** | API Routes | ⚠️ In Progress | 50% |
| | - GET /api/orders | ✅ | |
| | - GET /api/orders/[id] | ✅ | |
| | - PATCH /api/orders/[id] | ✅ | |
| | - DELETE /api/orders/[id] | ✅ | |
| | - POST /api/upload | ❌ TODO | |
| | - POST /api/extract | ⚠️ PARTIAL | |
| | - POST /api/validate | ❌ NEW FILE | |
| | - GET /api/dashboard | ❌ TODO | |
| **Week 3** | Frontend Pages | ❌ Not Started | 0% |
| | - app/page.tsx | ❌ | |
| | - app/review/page.tsx | ❌ | |
| | - app/review/[id]/page.tsx | ❌ | |
| | - app/dashboard/page.tsx | ❌ | |
| | - app/history/page.tsx | ❌ | |
| | - app/upload/page.tsx | ❌ | |

**Overall Progress**: **Week 1: 100% | Week 2: 50% | Week 3: 0% → Total: 50% Complete**

---

## 🎯 Next Steps

### Immediate (Complete Week 2):

1. **Update POST /api/upload** - Add S3 file upload
2. **Update POST /api/extract** - Add database save after extraction
3. **Create POST /api/validate** - New validation endpoint
4. **Update GET /api/dashboard** - Real metrics from database

### After Week 2 (Start Week 3):

5. **Update all 6 frontend pages** to fetch from real APIs instead of using mock data

### Testing:

6. **End-to-end test**: Upload → Extract → Validate → Review → Approve → Export

---

## 🔧 Quick Commands

```bash
# Test database operations
cd packages/db
bun run db:init  # Already done ✅

# Start dev server
cd apps/sales-order
bun dev  # http://localhost:3006

# Test API routes
curl http://localhost:3006/api/orders
curl http://localhost:3006/api/orders/ORD-123
```

---

## ✅ What's Working Now

- ✅ Database tables created in AWS DynamoDB
- ✅ Full CRUD operations available via `@tasco/db`
- ✅ Activity logging operational
- ✅ Metrics aggregation ready
- ✅ GET/PATCH/DELETE orders API routes using real database
- ✅ Multi-tenancy support (entity filtering)

## ❌ What's Still Mock Data

- ❌ File uploads (not going to S3 yet)
- ❌ Extraction API (not saving to database)
- ❌ Validation agent (not implemented)
- ❌ Dashboard metrics (hardcoded)
- ❌ All frontend pages (using mock arrays)

---

**Once Week 2 & 3 are complete, the application will be 100% production-ready with zero mock data!**
