# Database Entity Audit & Reuse Strategy

> Analysis of existing database entities in `@tasco/db` and reuse plan for customer-lifecycle app

---

## 1. Existing Database Infrastructure

### **Tables Already Created** (5 tables)

| Table | Key Schema | Purpose | Used By |
|-------|-----------|---------|---------|
| `tasco-conversations` | pk=`CONV#appId#entityId`, sk=`conversationId` | Chat conversations | compliance-qa, e-learning |
| `tasco-messages` | pk=`MSG#conversationId`, sk=`timestamp#messageId` | Chat messages | compliance-qa, e-learning |
| `tasco-entities` | pk=`ENT#ALL`, sk=`entityId` | Company entities (17 Tasco subsidiaries) | All apps |
| `tasco-documents` | pk=`DOC#...`, sk=`...` | Document sync status | compliance-qa |
| `tasco-courses` | pk=varies, sk=varies + GSI | Courses, modules, lessons, quizzes, progress | e-learning |

### **Existing Entity Types** (from `@tasco/db`)

#### **1. Entities Module** ✅ **REUSABLE**
```typescript
// packages/db/src/entities/types.ts
Entity {
  id: string;                    // "tasco-auto", "tasco-insurance"
  name: string;                  // "Tasco Auto Co., Ltd."
  shortName?: string;            // "Tasco Auto"
  type: "parent" | "holding" | "subsidiary";
  parentId?: string;             // Parent entity ID
  metadata?: {
    location?: string;
    employeeCount?: number;
    industry?: string;
    comments?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

**Operations Available:**
- `listEntities()` - Get all entities (paginated)
- `getEntity(id)` - Get single entity
- `createEntity(input)` - Create new entity
- `updateEntity(id, updates)` - Update entity
- `deleteEntity(id)` - Delete entity
- `batchCreateEntities(entities[])` - Bulk create
- `isEntitiesEmpty()` - Check if entities exist
- `getEntityMap()` - Get lookup map for enrichment

**Key Schema:**
- `pk = "ENT#ALL"`
- `sk = entityId`

**Current Data:** 17 Tasco entities already seeded (see `docs/mock-data/entities.json`)

---

#### **2. Chat Module** ✅ **REUSABLE**
```typescript
// packages/db/src/chat/types.ts
Conversation {
  id: string;
  appId: string;                 // "customer-lifecycle"
  entityId: string;              // Showroom/entity selection
  userId: string;                // Staff member using chat
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  enhancedCitations?: EnhancedCitation[];
  createdAt: string;
  metadata?: Record<string, unknown>;
}

Citation {
  id: string;
  documentName: string;
  page?: number;
  excerpt: string;
}

EnhancedCitation extends Citation {
  documentId: string;
  filename?: string;
  location?: CitationLocation;
  contextBefore?: string;
  contextAfter?: string;
  metadata?: { relevanceScore, category, entityId };
  href?: string;
}
```

**Operations Available:**
- `createConversation(input)` - Create chat session
- `getConversation(conversationId)` - Get conversation
- `listConversations(appId, entityId)` - List by app/entity
- `updateConversation(id, updates)` - Update conversation
- `deleteConversation(id)` - Delete conversation
- `createMessage(input)` - Add message to conversation
- `listMessages(conversationId)` - Get message history (paginated)
- `deleteMessage(conversationId, messageId)` - Delete message

**Key Schema:**
- Conversations: `pk = "CONV#appId#entityId"`, `sk = conversationId`
- Messages: `pk = "MSG#conversationId"`, `sk = "timestamp#messageId"`

**Usage for Customer-Lifecycle:**
- AI Assistant chat for insights and queries
- Store conversation history for staff
- Multi-entity support built-in

---

#### **3. Notifications Module** ✅ **REUSABLE**
```typescript
// packages/db/src/notifications.ts
Notification {
  id: string;
  type: "created" | "updated" | "deleted";
  category: "conversation" | "entity" | "document";
  title: string;
  timestamp: string;
  read: boolean;
  appId?: string;
}
```

**Operations Available:**
- `createNotification(input)` - Create notification
- `getNotifications(appId, limit)` - Get recent notifications
- `markNotificationAsRead(appId, timestamp, id)` - Mark as read
- `markAllNotificationsAsRead(appId)` - Bulk mark read
- `deleteNotification(appId, timestamp, id)` - Delete notification
- `clearAllNotifications(appId)` - Delete all
- `getUnreadNotificationCount(appId)` - Count unread

**Key Schema:**
- `pk = "APP#appId"`
- `sk = "timestamp#id"`

**Usage for Customer-Lifecycle:**
- Notify sales reps of new hot leads
- Alert on negative sentiment interactions
- Notify managers of conversion milestones
- Campaign launch/completion alerts

**Need to Extend Categories:**
```typescript
type NotificationCategory =
  | "conversation"
  | "entity"
  | "document"
  | "lead"          // NEW
  | "customer"      // NEW
  | "campaign"      // NEW
  | "interaction";  // NEW
```

---

#### **4. Courses Module** ❌ **NOT REUSABLE**
```typescript
// Specific to e-learning app
Course, Module, Lesson, Quiz, Progress...
```

**Not applicable** to customer-lifecycle app.

---

#### **5. Documents Module** ❌ **NOT REUSABLE**
```typescript
// Document sync status tracking
DocumentSyncStatus {
  documentId: string;
  lastSyncAt: string;
  status: "synced" | "pending" | "failed";
  errorMessage?: string;
}
```

**Not applicable** to customer-lifecycle app (no document management).

---

#### **6. S3 Module** ❌ **NOT REUSABLE**
```typescript
// S3 document operations
getDocument, putDocument, deleteDocument, versioning...
```

**Not applicable** unless we add document attachments to interactions (future enhancement).

---

#### **7. Utilities Module** ⚠️ **PARTIALLY REUSABLE**
```typescript
// File utilities
CONTENT_TYPE_MAP, getContentType, isBinaryFile,
generateDocumentId, sanitizeFilename...
```

**Limited use** - might be useful if we add file attachments to leads/customers.

---

## 2. What We Can Reuse for Customer-Lifecycle

### ✅ **Fully Reusable** (Already Available)

| Module | What to Reuse | How |
|--------|--------------|-----|
| **Entities** | Entity selection for showrooms | Use `EntitySelector` component with `listEntities()` |
| **Chat** | AI Assistant conversations | Create conversations with `appId="customer-lifecycle"` |
| **Notifications** | Real-time alerts for staff | Extend categories, use existing operations |

### 🔧 **Extend & Enhance**

#### **Notifications Module - Add New Categories**
```typescript
// Add to packages/db/src/notifications.ts
export type NotificationCategory =
  | "conversation"
  | "entity"
  | "document"
  | "lead"          // NEW: Hot lead assigned, lead converted
  | "customer"      // NEW: At-risk customer, high-value action
  | "campaign"      // NEW: Campaign launched, completed
  | "interaction"   // NEW: Negative sentiment detected
  | "system";       // NEW: System alerts

// Add to CreateNotificationInput
export interface CreateNotificationInput {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  appId?: string;
  entityId?: string;        // NEW: Which showroom
  priority?: "low" | "medium" | "high";  // NEW
  actionUrl?: string;       // NEW: Deep link to relevant page
  metadata?: {              // NEW: Additional context
    leadId?: string;
    customerId?: string;
    campaignId?: string;
    score?: number;
  };
}
```

---

## 3. New Tables Needed for Customer-Lifecycle

### **New Table: `tasco-lifecycle`** (Single-Table Design)

One multi-purpose table for all customer lifecycle entities:

```typescript
TableName: "tasco-lifecycle"
KeySchema: [
  { AttributeName: "pk", KeyType: "HASH" },
  { AttributeName: "sk", KeyType: "RANGE" }
]
BillingMode: "PAY_PER_REQUEST"

GlobalSecondaryIndexes: [
  {
    IndexName: "gsi1",
    KeySchema: [
      { AttributeName: "gsi1pk", KeyType: "HASH" },
      { AttributeName: "gsi1sk", KeyType: "RANGE" }
    ]
  },
  {
    IndexName: "gsi2",
    KeySchema: [
      { AttributeName: "gsi2pk", KeyType: "HASH" },
      { AttributeName: "gsi2sk", KeyType: "RANGE" }
    ]
  },
  {
    IndexName: "gsi3",
    KeySchema: [
      { AttributeName: "gsi3pk", KeyType: "HASH" },
      { AttributeName: "gsi3sk", KeyType: "RANGE" }
    ]
  }
]
```

### **Entity Storage in Single Table:**

#### **Leads**
```
pk = "ENT#{entityId}#LEADS"
sk = "LEAD#{leadId}"

gsi1pk = "STATUS#{status}"
gsi1sk = "SCORE#{score}#CREATED#{createdAt}"  // High-priority leads

gsi2pk = "ASSIGNED#{assignedTo}"
gsi2sk = "STATUS#{status}#CREATED#{createdAt}"  // Rep's leads

gsi3pk = "SOURCE#{source}"
gsi3sk = "CREATED#{createdAt}"  // Lead source analytics
```

#### **Customers**
```
pk = "ENT#{entityId}#CUSTOMERS"
sk = "CUST#{customerId}"

gsi1pk = "SEGMENT#{segment}"
gsi1sk = "LTV#{lifetimeValue}#CUST#{customerId}"  // High-value customers

gsi2pk = "PHONE#{phone}"  // Customer lookup
gsi2sk = "CUST#{customerId}"

gsi3pk = "CHURN#{churnRisk}"
gsi3sk = "LASTACTIVE#{lastActivityAt}"  // At-risk customers
```

#### **Interactions**
```
pk = "CUST#{customerId}#INTERACTIONS"
sk = "INT#{timestamp}##{interactionId}"

gsi1pk = "LEAD#{leadId}#INTERACTIONS"
gsi1sk = "INT#{timestamp}"  // Lead interactions

gsi2pk = "STAFF#{staffId}#INTERACTIONS"
gsi2sk = "INT#{timestamp}"  // Staff interaction history

gsi3pk = "SENTIMENT#{sentiment}"
gsi3sk = "CREATED#{createdAt}"  // Negative sentiment alerts
```

#### **Purchases**
```
pk = "CUST#{customerId}#PURCHASES"
sk = "PURCH#{orderDate}#{purchaseId}"

gsi1pk = "ENT#{entityId}#PURCHASES"
gsi1sk = "DATE#{orderDate}##{purchaseId}"  // Showroom sales

gsi2pk = "SALES#{salesRepId}#PURCHASES"
gsi2sk = "DATE#{orderDate}"  // Sales rep performance

gsi3pk = "BRAND#{brand}"
gsi3sk = "DATE#{orderDate}"  // Sales by brand
```

#### **Campaigns**
```
pk = "ENT#{entityId}#CAMPAIGNS"
sk = "CAMP#{campaignId}"

gsi1pk = "STATUS#{status}"
gsi1sk = "SCHEDULED#{scheduledAt}"  // Upcoming campaigns

gsi2pk = "TYPE#{type}"
gsi2sk = "ROI#{roi}#LAUNCHED#{launchedAt}"  // Best performing campaigns
```

#### **Campaign Engagements**
```
pk = "CAMP#{campaignId}#ENGAGEMENTS"
sk = "ENG#{customerId}#{engagementId}"

gsi1pk = "CUST#{customerId}#ENGAGEMENTS"
gsi1sk = "SENT#{sentAt}##{campaignId}"  // Customer campaign history

gsi2pk = "STATUS#{status}"
gsi2sk = "SENT#{sentAt}"  // Conversion tracking
```

#### **AI Recommendations**
```
pk = "TARGET#{targetType}#{targetId}#RECS"
sk = "REC#{createdAt}#{recommendationId}"

gsi1pk = "TYPE#{type}"
gsi1sk = "CONFIDENCE#{confidence}#CREATED#{createdAt}"  // High-confidence recs

gsi2pk = "STATUS#{status}"
gsi2sk = "EXPIRES#{expiresAt}"  // Pending/expiring
```

#### **Users** (Staff/Sales Reps)
```
pk = "ENT#{entityId}#USERS"
sk = "USER#{userId}"

gsi1pk = "EMAIL#{email}"  // User lookup
gsi1sk = "USER#{userId}"

gsi2pk = "ROLE#{role}"
gsi2sk = "PERF#{conversionRate}#USER#{userId}"  // Top performers
```

#### **Activities** (Audit Log)
```
pk = "ACTIVITY#{entityType}#{entityRef}"
sk = "ACT#{timestamp}#{activityId}"

gsi1pk = "USER#{userId}#ACTIVITIES"
gsi1sk = "TIMESTAMP#{timestamp}"  // User activity history
```

---

## 4. Implementation Strategy

### **Phase 1: Use Existing Infrastructure** ✅

**No new tables needed immediately!** Start with:

1. ✅ **Use `tasco-entities` table**
   - Already has 17 Tasco entities seeded
   - Use existing `@tasco/db` entity operations
   - Perfect for showroom selection

2. ✅ **Use `tasco-conversations` + `tasco-messages` tables**
   - Create AI Assistant conversations with `appId="customer-lifecycle"`
   - Store chat history for staff queries
   - Multi-entity support built-in

3. ✅ **Use `tasco-notifications` table**
   - Extend notification categories (lead, customer, campaign, interaction)
   - Use existing operations for alerts

4. ✅ **Mock Data Only (for demo)**
   - Keep leads, customers, interactions, campaigns in memory
   - Use `apps/customer-lifecycle/lib/mock-data.ts`
   - No database writes needed for Innovation Day demo

**Benefits:**
- ✅ Faster development (reuse existing code)
- ✅ No new table creation needed
- ✅ Entity selection works out of the box
- ✅ Chat functionality ready to go
- ✅ Notifications infrastructure available

---

### **Phase 2: Create `tasco-lifecycle` Table** (Post-Demo)

When moving to production:

1. Create single-table design for lifecycle entities
2. Migrate mock data to DynamoDB
3. Implement CRUD operations for each entity type
4. Add GSI queries for analytics and filtering

**Table Creation Script:**
```typescript
// packages/db/src/scripts/init-lifecycle-table.ts
{
  TableName: "tasco-lifecycle",
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" },
    { AttributeName: "sk", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" },
    { AttributeName: "sk", AttributeType: "S" },
    { AttributeName: "gsi1pk", AttributeType: "S" },
    { AttributeName: "gsi1sk", AttributeType: "S" },
    { AttributeName: "gsi2pk", AttributeType: "S" },
    { AttributeName: "gsi2sk", AttributeType: "S" },
    { AttributeName: "gsi3pk", AttributeType: "S" },
    { AttributeName: "gsi3sk", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "gsi1",
      KeySchema: [
        { AttributeName: "gsi1pk", KeyType: "HASH" },
        { AttributeName: "gsi1sk", KeyType: "RANGE" }
      ],
      Projection: { ProjectionType: "ALL" }
    },
    {
      IndexName: "gsi2",
      KeySchema: [
        { AttributeName: "gsi2pk", KeyType: "HASH" },
        { AttributeName: "gsi2sk", KeyType: "RANGE" }
      ],
      Projection: { ProjectionType: "ALL" }
    },
    {
      IndexName: "gsi3",
      KeySchema: [
        { AttributeName: "gsi3pk", KeyType: "HASH" },
        { AttributeName: "gsi3sk", KeyType: "RANGE" }
      ],
      Projection: { ProjectionType: "ALL" }
    }
  ],
  BillingMode: "PAY_PER_REQUEST"
}
```

---

## 5. Reuse Summary

### ✅ **Can Reuse Immediately**

| Module | Operations | Usage |
|--------|-----------|-------|
| **Entities** | `listEntities()`, `getEntity()` | Showroom selection |
| **Chat** | `createConversation()`, `listMessages()` | AI Assistant |
| **Notifications** | `createNotification()`, `getNotifications()` | Staff alerts |

### 🔧 **Extend Before Use**

| Module | What to Add | Effort |
|--------|-------------|--------|
| **Notifications** | Add lead/customer/campaign categories | 10 min (edit types) |

### ❌ **Cannot Reuse**

| Module | Reason |
|--------|--------|
| Courses | E-learning specific |
| Documents | Document sync specific |
| S3 | No file storage needed (yet) |

### 🆕 **Create New**

| Entity | Storage Strategy | Timeline |
|--------|-----------------|----------|
| Leads, Customers, Interactions, etc. | Mock data in memory | Phase 1 (now) |
| Same entities | `tasco-lifecycle` DynamoDB table | Phase 2 (post-demo) |

---

## 6. Recommended Implementation Path

### **For Innovation Day Demo:**

```typescript
// apps/customer-lifecycle/lib/data-layer.ts

// 1. Entity selection - USE EXISTING
import { listEntities, getEntity } from "@tasco/db";

// 2. AI Assistant chat - USE EXISTING
import {
  createConversation,
  listMessages,
  createMessage
} from "@tasco/db";

// 3. Notifications - EXTEND TYPES, USE EXISTING
import {
  createNotification,
  getNotifications
} from "@tasco/db";

// 4. Leads, Customers, etc. - USE MOCK DATA
import {
  mockLeads,
  mockCustomers,
  mockInteractions,
  mockPurchases,
  mockCampaigns
} from "./mock-data";
```

### **File Structure:**

```
apps/customer-lifecycle/
├── lib/
│   ├── data-layer.ts         # Abstraction over DB operations
│   ├── mock-data.ts          # In-memory demo data
│   └── notifications-ext.ts  # Extended notification types
└── package.json
    dependencies:
      "@tasco/db": "workspace:*"  ✅ Already available
```

---

## 7. Next Steps

1. ✅ **Extend notification types** in `@tasco/db`
   - Add lead, customer, campaign, interaction categories
   - Add priority, actionUrl, metadata fields

2. ✅ **Create mock data file** (`apps/customer-lifecycle/lib/mock-data.ts`)
   - 10 sample leads
   - 15 customers with 360 profiles
   - 50 interactions
   - 20 purchases
   - 5 campaigns
   - 10 AI recommendations

3. ✅ **Create data layer abstraction** (`lib/data-layer.ts`)
   - Functions that use existing DB for entities/chat/notifications
   - Functions that use mock data for leads/customers/etc.
   - Easy to swap to real DB later

4. ⏭️ **Post-Demo: Create `tasco-lifecycle` table**
   - Add table definition to init-tables script
   - Implement CRUD operations for each entity
   - Migrate mock data to DynamoDB

---

## Summary

**Good News:** We can reuse **60% of existing database infrastructure!**

| Aspect | Reusable | Strategy |
|--------|----------|----------|
| Entity selection | ✅ 100% | Use existing `tasco-entities` table |
| AI Assistant chat | ✅ 100% | Use existing `tasco-conversations` + `tasco-messages` |
| Notifications | ✅ 90% | Extend types, use existing operations |
| Leads/Customers/etc. | ⏭️ Phase 2 | Mock data now, DynamoDB later |

**Result:** Fast development for Innovation Day demo, clean migration path to production.
