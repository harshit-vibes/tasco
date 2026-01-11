# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

**data-sync** (INC2) - AI-powered sales and revenue data synchronization platform for Inochi (Tan Phu Vietnam). This is a **Pivot** app (Integration + LLM) that addresses data synchronization challenges between multiple systems.

### Problem Statement

Inochi's sales data (Haravan) and invoicing/revenue data (Fulfillment, Bravo) are not synchronized. Manual updates cause daily delays and data discrepancies, affecting order processing and revenue recognition.

### Solution

Real-time data synchronization platform that:
- Connects multiple systems (Haravan, Shopee, Website, Fulfillment, Bravo)
- Detects data discrepancies automatically
- Provides AI-powered alerts and natural language queries
- Replaces manual/batch updates with real-time sync monitoring

## Commands

```bash
# Development (from monorepo root)
bun run dev --filter=@tasco/data-sync

# Or from app directory
cd apps/data-sync && bun dev

# Build
bun run build --filter=@tasco/data-sync

# Lint
bun run lint --filter=@tasco/data-sync
```

**Port:** 3007

## Architecture

### Required Pages (Per PRD)

```
app/
├── page.tsx              # Dashboard - Sync overview with status cards
├── alerts/page.tsx       # Discrepancy alerts list with filtering
├── systems/page.tsx      # System connection status and health
└── chat/page.tsx         # AI Assistant for sync queries
```

### Key Components to Build

| Component | Purpose | Package Source |
|-----------|---------|---------------|
| `SyncStatusCard` | Display per-system sync status | Custom (use Card from @tasco/ui) |
| `AlertTimeline` | Chronological discrepancy alerts | Custom (use notifications pattern) |
| `DataComparisonView` | Side-by-side data comparison | Custom |
| `SystemHealthIndicator` | Connection status badges | Custom (use Badge from @tasco/ui) |
| `ChatInterface` | AI Q&A for sync issues | Use ChatContainer from @tasco/ui |

### Data Flow

```
External Systems          Data Sync App                   DynamoDB
┌─────────────┐          ┌─────────────────┐            ┌──────────────┐
│   Haravan   │──────────▶│  Sync Service   │──────────▶│ tasco-sync-  │
│   Shopee    │──────────▶│  (simulated)    │           │   status     │
│   Bravo     │──────────▶│                 │──────────▶│ tasco-sync-  │
│ Fulfillment │──────────▶│ Discrepancy     │           │   alerts     │
└─────────────┘          │   Detection     │           └──────────────┘
                         └─────────────────┘
                                │
                                ▼
                         ┌─────────────────┐
                         │  Lyzr Agent     │
                         │  (Q&A about     │
                         │   sync issues)  │
                         └─────────────────┘
```

## Shared Package Usage

### UI Components (@tasco/ui)

```typescript
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Badge, Separator, ScrollArea, Tabs, TabsList, TabsTrigger, TabsContent,
  ChatContainer, // For AI assistant page
  EntitySelector, // If multi-entity scoping needed
  Skeleton,       // Loading states
} from "@tasco/ui";

import {
  RefreshCw, AlertCircle, CheckCircle, Clock, AlertTriangle,
  Zap, Database, TrendingUp, TrendingDown, Activity, Settings,
} from "@tasco/ui/icons";
```

### Database (@tasco/db)

For this demo, create sync-specific data or use existing patterns:

```typescript
// Use notifications table for alerts
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  type Notification,
  type NotificationType,
} from "@tasco/db";

// Create a sync alert
await createNotification({
  type: "alert",
  category: "system",
  title: "Order Missing in Bravo",
  message: "Order #12345 exists in Haravan but not synced to Bravo",
  appId: "data-sync",
  entityId: "inochi",
  priority: "high",
  actionUrl: "/alerts?id=alert123",
  metadata: {
    orderId: "12345",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    discrepancyType: "missing",
  }
});
```

### Lyzr Integration (@tasco/lyzr)

```typescript
import { usePersistentChat } from "@tasco/lyzr/hooks";

const { messages, isLoading, sendMessage } = usePersistentChat({
  appId: "data-sync",
  entityId: "inochi",
  userId: "user123",
  agentId: process.env.NEXT_PUBLIC_LYZR_AGENT_ID,
  apiKey: process.env.NEXT_PUBLIC_LYZR_API_KEY,
});

// Example queries the agent should handle:
// - "Why is order #12345 missing in Bravo?"
// - "What's the current sync status for Shopee?"
// - "Show me all revenue mismatches from today"
```

### i18n (@tasco/i18n)

Locales already configured in `locales/en/app.json` and `locales/vi/app.json`.

```typescript
import { useTranslation } from "@tasco/i18n";

const { t } = useTranslation("app");
// t("title") -> "Data Sync"
// t("description") -> "AI-powered sales and revenue data synchronization for Inochi"
```

## Demo Data Strategy

Since this is a **Pivot** app (no real system integrations), simulate sync data:

### Mock Sync Status

```typescript
// lib/mock-data.ts
export const SYSTEMS = [
  { id: "haravan", name: "Haravan", type: "sales", status: "connected" },
  { id: "shopee", name: "Shopee", type: "marketplace", status: "connected" },
  { id: "bravo", name: "Bravo", type: "accounting", status: "delayed" },
  { id: "fulfillment", name: "Fulfillment", type: "logistics", status: "connected" },
] as const;

export const MOCK_ALERTS = [
  {
    id: "alert-1",
    type: "missing",
    title: "Order #12345 missing in Bravo",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    severity: "high",
    timestamp: "2024-01-10T10:30:00Z",
  },
  {
    id: "alert-2",
    type: "mismatch",
    title: "Revenue mismatch: Haravan $10,000 vs Bravo $9,500",
    sourceSystem: "haravan",
    targetSystem: "bravo",
    severity: "medium",
    timestamp: "2024-01-10T09:15:00Z",
  },
  // ... more alerts
];

export const SYNC_METRICS = {
  lastSyncTime: "2024-01-10T10:45:00Z",
  recordsSynced: 1247,
  pendingRecords: 23,
  failedRecords: 3,
  averageLatency: "2.3 minutes",
};
```

### API Routes

```
app/api/
├── sync-status/route.ts    # GET: Return system sync statuses
├── alerts/route.ts         # GET: List alerts, POST: Dismiss alert
├── metrics/route.ts        # GET: Sync metrics and KPIs
└── chat/route.ts           # POST: Lyzr agent chat endpoint
```

## Environment Variables

```env
# Required
LYZR_API_KEY=                      # Server-side Lyzr API key
NEXT_PUBLIC_LYZR_API_KEY=          # Client-side Lyzr API key
NEXT_PUBLIC_LYZR_AGENT_ID=         # Data Sync agent ID

# AWS (inherits from root)
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

## Success Metrics (Demo KPIs)

| Metric | Target | Display |
|--------|--------|---------|
| Sync Latency | < 5 minutes | Real-time indicator |
| Discrepancy Detection | 100% | Alert count vs total records |
| Alert Response Time | < 1 hour | Average resolution time |
| System Uptime | 99.9% | Connection status per system |

## Implementation Priority

1. **Dashboard page** - Overview with sync status cards and metrics
2. **Alerts page** - List discrepancies with filtering and dismiss actions
3. **Systems page** - Connection status for each integrated system
4. **Chat page** - AI assistant for sync queries (reuse ChatContainer)

## Sample Alert Types

| Type | Example Message | Severity |
|------|-----------------|----------|
| `missing` | "Order #12345 exists in Haravan but not in Bravo" | high |
| `mismatch` | "Revenue mismatch: Haravan $10,000 vs Bravo $9,500" | medium |
| `delayed` | "Shopee sync delayed by 2 hours" | low |
| `connection` | "Bravo API connection timeout" | critical |

## Key Patterns from Other Apps

### Notifications (from customer-lifecycle)

```typescript
// Use for sync alerts
import { createNotification, getNotifications } from "@tasco/db";

// Create sync alert
await createNotification({
  type: "alert",
  category: "system",
  title: "Sync Discrepancy Detected",
  message: "Order #12345 missing in Bravo",
  appId: "data-sync",
  priority: "high",
  metadata: { orderId: "12345", system: "bravo" }
});
```

### Chat Interface (from compliance-qa)

```typescript
// Reuse chat pattern
<ChatContainer
  messages={messages}
  isLoading={isLoading}
  onSendMessage={sendMessage}
  appTitle={t("chatTitle", "Sync Assistant")}
  appDescription={t("chatDescription", "Ask about sync status and issues")}
  suggestedQuestions={[
    "What's the current sync status?",
    "Show me today's discrepancies",
    "Why is order #12345 missing?",
  ]}
/>
```

### Dashboard Cards (from sales-order)

```typescript
// Status card pattern
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">Haravan</CardTitle>
    <Badge variant={status === "connected" ? "default" : "destructive"}>
      {status}
    </Badge>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">1,247</div>
    <p className="text-xs text-muted-foreground">records synced today</p>
  </CardContent>
</Card>
```

## File Structure Goal

```
apps/data-sync/
├── app/
│   ├── layout.tsx              # ✅ Done - i18n setup
│   ├── page.tsx                # ⚠️ Needs update - Dashboard
│   ├── globals.css             # ✅ Done
│   ├── alerts/
│   │   └── page.tsx            # TODO - Alert list
│   ├── systems/
│   │   └── page.tsx            # TODO - System status
│   ├── chat/
│   │   └── page.tsx            # TODO - AI assistant
│   └── api/
│       ├── sync-status/route.ts
│       ├── alerts/route.ts
│       └── chat/route.ts
├── components/
│   ├── sync-status-card.tsx
│   ├── alert-timeline.tsx
│   ├── system-health.tsx
│   └── metrics-display.tsx
├── lib/
│   ├── mock-data.ts            # Simulated sync data
│   └── types.ts                # TypeScript interfaces
├── locales/
│   ├── en/app.json             # ✅ Done
│   └── vi/app.json             # ✅ Done
└── PRD.md                      # ✅ Done - Requirements
```

## Lyzr Agent Setup

Create agent via scripts or Lyzr Studio:

```typescript
// scripts/setup-agent.ts
import { getOrCreateAgent, type AgentManagementConfig } from "@tasco/api";

const config: AgentManagementConfig = { apiKey: process.env.LYZR_API_KEY };

const { agent } = await getOrCreateAgent({
  name: "Data Sync Assistant",
  system_prompt: `You are an AI assistant for Inochi's data synchronization platform.

You help users:
- Understand sync status between systems (Haravan, Shopee, Bravo, Fulfillment)
- Investigate data discrepancies and their causes
- Track sync latency and performance metrics
- Answer questions about missing or mismatched records

When asked about specific orders, check the sync logs.
When reporting discrepancies, include affected systems and timestamps.
Always be helpful and specific about which system has the issue.`,
}, config);

console.log("Agent ID:", agent.agent_id);
```

## Notes

- **Page.tsx has wrong content** - Currently shows "Sales Order" text (copy-paste error)
- **No DynamoDB tables specific to sync** - Use notifications table for alerts
- **Demo is simulation-based** - No actual API integrations with Haravan/Bravo/etc.
- **Focus on visual demo** - Status cards, alert timeline, chat interface
