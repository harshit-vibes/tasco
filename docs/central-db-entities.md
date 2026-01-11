# Global Catalog & Centralized Entity Management Plan

## Summary

Create a unified documentation system and centralize DynamoDB entity management across all 8 Tasco apps.

---

## App & Database Analysis

### App Maturity Matrix

| App | DB Integration | Tables Used | Status |
|-----|----------------|-------------|--------|
| **compliance-qa** | Full | entities, conversations, messages, documents | Production-ready |
| **customer-lifecycle** | Full | leads, customers, interactions, purchases, campaigns, recommendations | Production-ready |
| **sales-order** | Full | orders, activity, metrics, users | Production-ready |
| **e-learning** | Full | courses, modules, lessons, quizzes, progress | Production-ready |
| **promotion-control** | Full | promotions, conflicts | Production-ready |
| **sales-pricing** | Partial | conversations, messages (quotes are mock) | Demo only |
| **data-sync** | None | All mock data | Placeholder |
| **risk-radar** | None | All mock data | Placeholder |

### DynamoDB Table Inventory (13 Tables)

| Table | Domain | Apps Using |
|-------|--------|------------|
| `tasco-entities` | Core | All 8 apps |
| `tasco-conversations` | Core | compliance-qa, sales-pricing, e-learning, customer-lifecycle |
| `tasco-messages` | Core | compliance-qa, sales-pricing, e-learning, customer-lifecycle |
| `tasco-notifications` | Core | compliance-qa, sales-pricing |
| `tasco-documents` | Compliance | compliance-qa |
| `tasco-leads` | Lifecycle | customer-lifecycle |
| `tasco-customers` | Lifecycle | customer-lifecycle |
| `tasco-interactions` | Lifecycle | customer-lifecycle |
| `tasco-purchases` | Lifecycle | customer-lifecycle |
| `tasco-campaigns` | Lifecycle | customer-lifecycle |
| `tasco-ai-recommendations` | Lifecycle | customer-lifecycle |
| `tasco-sales-orders` | Orders | sales-order |
| `tasco-sales-order-activity` | Orders | sales-order |
| `tasco-sales-order-metrics` | Orders | sales-order |
| `tasco-courses` | Learning | e-learning |
| `tasco-users` | Core | sales-order, e-learning |
| `tasco-app-guides` | Core | All 8 apps |

### Entity Relationships by Domain

**Core Domain:**
```
Entity (17 Tasco subsidiaries)
├── Conversation[] (scoped by entityId + appId)
│   └── Message[]
├── Notification[] (scoped by entityId + appId)
└── AppGuide[] (scoped by appId)
```

**Lifecycle Domain:**
```
Lead (entityId scoped)
├── Interaction[]
└── converts to → Customer
                  ├── Interaction[]
                  ├── Purchase[]
                  └── AIRecommendation[]
Campaign (entityId scoped)
└── targets → Lead[] / Customer[]
```

**Learning Domain:**
```
Course (appId + entityId scoped)
├── Module[] (ordered)
│   ├── Lesson[] (ordered)
│   └── Quiz
│       └── QuizQuestion[] (ordered)
└── UserProgress[]
    ├── CourseProgress
    ├── ModuleProgress
    ├── LessonProgress
    └── QuizAttempt[]
```

**Orders Domain:**
```
SalesOrder (entityId scoped)
├── Activity[] (audit log)
├── ExtractedData (OCR results)
└── Validation (AI review)
Metrics (daily/weekly/monthly aggregates)
```

**Promotions Domain:**
```
Promotion (entityId scoped)
├── targetSegments[]
├── targetProducts[]
├── targetChannels[]
└── ConflictDetectionResult[]
```

### Component Catalog Summary (31 Components in @tasco/ui)

| Category | Components |
|----------|------------|
| **Layout** | AppShell, AppHeader, AppSidebar, SimpleHeader |
| **Chat** | ChatContainer, ChatInput, ChatMessage, ChatHistory, CitationCard, CitationList, ValidationBadge |
| **Documents** | DocumentPreviewSheet, DocumentContentViewer, PDFViewer |
| **Forms** | Button, Input, Textarea, Select, Badge, Switch |
| **Display** | Card (+ Header/Title/Description/Content/Footer), Separator, Avatar, ScrollArea, Skeleton |
| **Navigation** | Tabs, DropdownMenu |
| **Modals** | Dialog, AlertDialog, Sheet |
| **Multi-tenant** | EntitySelector (single/multi-select with hierarchy) |
| **Onboarding** | GuideCarousel, GuideTrigger |

### App-Specific Components

| App | Custom Components |
|-----|-------------------|
| **compliance-qa** | DocumentVersionHistory, ValidationAgentBadge |
| **e-learning** | CreatorShell, DescribeScreen, DesignScreen, PublishScreen, QuizContainer, ModuleCard |
| **sales-pricing** | Sidebar (custom), QuoteWizard |
| **sales-order** | OrderCard, OrderTable, MetricsCards, ActivityTimeline |
| **customer-lifecycle** | LeadCard, CustomerCard, CampaignCard, InteractionTimeline |
| **promotion-control** | PromotionTimeline, ConflictAlert, PromotionCard |
| **data-sync** | SyncStatusCard, AlertCard, SystemHealthIndicator |
| **risk-radar** | RiskRadarSidebar, AlertCard, MetricsCard |

---

## Part 1: Global Catalog System

### 1.1 Documentation Structure

Create `docs/catalog/` with the following structure:

```
docs/catalog/
├── README.md                    # Catalog index with navigation
│
├── system-design/
│   ├── overview.md              # Architecture overview
│   ├── entity-relationships.md  # ER diagrams for all 5 domains
│   ├── key-patterns.md          # DynamoDB key design (PK/SK patterns)
│   └── multi-tenant.md          # Entity scoping strategy
│
├── database/
│   ├── index.md                 # Database schema index
│   ├── tables.md                # All 13+ DynamoDB tables
│   ├── core.md                  # entities, conversations, messages, notifications, users, guides
│   ├── lifecycle.md             # leads, customers, interactions, purchases, campaigns, recommendations
│   ├── courses.md               # courses, modules, lessons, quizzes, progress
│   ├── orders.md                # sales-orders, activity, metrics
│   ├── documents.md             # documents (sync)
│   └── promotions.md            # promotions, conflicts
│
├── components/
│   ├── index.md                 # Component catalog index (31 shared + app-specific)
│   ├── layout.md                # AppShell, AppHeader, AppSidebar, SimpleHeader
│   ├── chat.md                  # ChatContainer, ChatInput, ChatMessage, etc. (7 components)
│   ├── documents.md             # DocumentPreviewSheet, DocumentContentViewer, PDFViewer
│   ├── forms.md                 # Button, Input, Textarea, Select, Badge, Switch
│   ├── entity-selector.md       # EntitySelector deep dive (505 lines, complex)
│   └── onboarding.md            # GuideCarousel, GuideTrigger, useAppGuide
│
└── apps/
    ├── index.md                 # App overview (maturity matrix)
    ├── compliance-qa.md         # Full DB integration, document management
    ├── customer-lifecycle.md    # Full DB integration, CRM features
    ├── sales-order.md           # Full DB integration, OCR/AI extraction
    ├── e-learning.md            # Full DB integration, course creation wizard
    ├── promotion-control.md     # Full DB integration, conflict detection
    ├── sales-pricing.md         # Partial DB (chat only), quote generation
    ├── data-sync.md             # Placeholder (mock data)
    └── risk-radar.md            # Placeholder (mock data)
```

### 1.2 Entity Documentation Format

Each entity document will include:

```markdown
# Entity: Lead

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (LEAD#uuid) |
| entityId | string | Yes | Tasco subsidiary ID |
| ...

## Key Structure

- **PK**: `LEAD#{leadId}`
- **SK**: `METADATA`

## Relationships

- Has many: Interactions
- Converts to: Customer
- Belongs to: Entity (subsidiary)

## Operations

- `createLead(input)` - packages/db/src/lifecycle/leads.ts:45
- `getLead(id)` - packages/db/src/lifecycle/leads.ts:78
...

## Used By Apps

- customer-lifecycle
```

### 1.3 Component Documentation Format

```markdown
# Component: EntitySelector

## Import

\`\`\`tsx
import { EntitySelector } from "@tasco/ui";
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| entities | Entity[] | - | List of entities |
| mode | "single" \| "multi" | "single" | Selection mode |
...

## Usage Examples

### Single Select
\`\`\`tsx
<EntitySelector entities={entities} mode="single" onChange={handleChange} />
\`\`\`

## Used By Apps

- compliance-qa (page.tsx)
- customer-lifecycle (header)
- sales-pricing (header)
```

---

## Part 2: Centralized Entity Management

### 2.1 Current Issues

| Issue | Impact | Apps Affected |
|-------|--------|---------------|
| Type duplication | Maintenance overhead | compliance-qa |
| Distributed seed data | Inconsistent data | All |
| Hardcoded defaults | Brittle code | sales-order |
| No entity context | Repetitive code | All |

### 2.2 Proposed Changes

#### A. Create Entity Constants Package

**File**: `packages/db/src/entities/constants.ts`

```typescript
// Tasco entity hierarchy - single source of truth
export const TASCO_ENTITIES: Omit<Entity, 'createdAt' | 'updatedAt'>[] = [
  {
    id: "tasco-group",
    name: "Tasco Group",
    shortName: "Tasco",
    type: "parent",
    metadata: { location: "Vietnam", industry: "Conglomerate" }
  },
  // ... all 17 entities
];

export const DEFAULT_ENTITY_ID = "tasco-group";

export const ENTITY_TYPE_LABELS = {
  parent: "Parent Company",
  holding: "Holding Company",
  subsidiary: "Subsidiary"
} as const;
```

#### B. Create Entity Context Hook

**File**: `packages/lyzr/src/hooks/useEntity.ts`

```typescript
export function useEntity() {
  // Get entity from URL param or localStorage
  const [entityId, setEntityId] = useState<string>(DEFAULT_ENTITY_ID);

  return {
    entityId,
    setEntityId,
    // Helper to scope API calls
    getEntityScope: () => `?entityId=${entityId}`,
  };
}
```

#### C. Centralized Seed Handler

**File**: `packages/api/src/handlers/entities.ts` (enhance existing)

```typescript
export async function handleListEntities(config: {
  autoSeed?: boolean;
  seedData?: Entity[];
  cacheDuration?: number;
}) {
  // Check if entities exist
  const isEmpty = await isEntitiesEmpty();

  if (isEmpty && config.autoSeed) {
    // Use centralized seed data
    const seedData = config.seedData || TASCO_ENTITIES;
    await batchCreateEntities(seedData);
  }

  return listEntities();
}
```

#### D. Remove App-Level Entity Definitions

Apps should import from packages:

```typescript
// Before (in apps/compliance-qa/app/entities/page.tsx)
type Entity = {
  id: string;
  name: string;
  // ... duplicated
}

// After
import type { Entity } from "@tasco/db";
import { TASCO_ENTITIES } from "@tasco/db/entities";
```

### 2.3 Migration Steps

1. **Create constants file** in `packages/db/src/entities/constants.ts`
2. **Export from package** in `packages/db/src/entities/index.ts`
3. **Update app API routes** to use centralized handler
4. **Remove duplicate types** from app code
5. **Add entity context hook** to `packages/lyzr`
6. **Update apps** to use hook instead of hardcoded defaults

---

## Part 3: Automated Catalog Generation (Optional)

### 3.1 Schema Documentation Generator

Create `scripts/generate-catalog.ts`:

```typescript
// Parse packages/db/src/**/*.ts for type definitions
// Generate markdown files automatically
// Include JSDoc comments as descriptions
```

### 3.2 Component Documentation Generator

```typescript
// Parse packages/ui/src/components/*.tsx
// Extract props from TypeScript interfaces
// Generate markdown with examples
```

---

## Part 4: Implementation Files

### Files to Create

| File | Purpose |
|------|---------|
| `docs/catalog/README.md` | Catalog index |
| `docs/catalog/system-design/entity-relationships.md` | ER diagram |
| `docs/catalog/entities/index.md` | Entity catalog |
| `docs/catalog/components/index.md` | Component catalog |
| `packages/db/src/entities/constants.ts` | Centralized entity data |
| `packages/lyzr/src/hooks/useEntity.ts` | Entity context hook |

### Files to Modify

| File | Change |
|------|--------|
| `packages/db/src/entities/index.ts` | Export constants |
| `packages/api/src/handlers/entities.ts` | Use centralized seed |
| `apps/*/app/api/entities/route.ts` | Use centralized handler |
| `apps/compliance-qa/app/entities/page.tsx` | Import types from @tasco/db |

---

## Part 5: Verification

1. **Catalog Documentation**
   - Navigate to `docs/catalog/` and verify all sections exist
   - Check entity relationships are accurate
   - Verify component props match implementation

2. **Centralized Entities**
   - Run `bun run dev --filter=@tasco/compliance-qa`
   - Create/edit entities and verify persistence
   - Check other apps can read the same entities

3. **No Breaking Changes**
   - All 8 apps should build successfully
   - Entity selector should work across all apps
   - Data should be consistent across apps

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Catalog Format | Markdown in `docs/catalog/` |
| Entity Visibility | All entities visible to all apps |
| Seed Strategy | Auto-seed on first API call |

---

## Implementation Order

### Phase 1: Centralized Entity Constants
1. Create `packages/db/src/entities/constants.ts` with all 17 Tasco entities
2. Export from `packages/db/src/entities/index.ts`
3. Update `packages/api/src/handlers/entities.ts` to use centralized data

### Phase 2: Remove App-Level Duplication
1. Update `apps/compliance-qa/app/entities/page.tsx` - import types from @tasco/db
2. Update `apps/*/app/api/entities/route.ts` - use centralized handler
3. Remove hardcoded `DEFAULT_ENTITY_ID` from sales-order

### Phase 3: Create Catalog Documentation
1. Create `docs/catalog/README.md` with navigation
2. Document all 6 entity domains (chat, lifecycle, courses, sales-orders, users, documents)
3. Document core Tasco entities (17 subsidiaries)
4. Document all 31 UI components
5. Create app-specific documentation (8 apps)

### Phase 4: Entity Context Hook (Optional Enhancement)
1. Create `packages/lyzr/src/hooks/useEntity.ts`
2. Add to `packages/lyzr/src/hooks/index.ts` exports
3. Update apps to use hook for consistent entity selection
