# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Customer Lifecycle Management - an AI-powered CRM for Tasco Auto built on Next.js 15, TypeScript, and Lyzr AI. Manages leads, customers, campaigns, and vehicle inventory across 17 showroom entities with AI chat assistance.

## Commands

```bash
# Development (port 3002)
bun dev

# Build and start
bun build && bun start

# Linting
bun lint

# Setup scripts
bun run setup-agents          # Create Lyzr agents
bun run setup-multi-agents    # Create expert agents for multi-agent chat
bun run connect-kb-to-experts # Connect KB to all expert agents
bun run seed-guide            # Seed app guide content
bun run sync-business-data    # Sync data to RAG knowledge base

# From monorepo root - database setup
cd packages/db && bun run db:init
cd packages/db && bun run db:seed-lifecycle
```

## Architecture

### App Structure

```
app/
├── layout.tsx              # Root: I18nProvider → EntityFilterProvider → AppShell
├── page.tsx                # Dashboard with stats, leads inbox, at-risk customers
├── chat/page.tsx           # AI chat with conversation history
├── leads/                  # Lead list (Kanban/list views) + detail pages
├── customers/              # Customer list + detail pages
├── marketing/              # Campaign management
├── inventory/              # Vehicle inventory + import orders
└── api/                    # REST endpoints (see below)

components/
├── app-shell.tsx           # ChatProvider wrapper + keyboard shortcuts (⌘K)
├── sidebar.tsx             # Navigation + conversation history
├── header.tsx              # EntitySelector + notifications + user menu
├── ai-command-bar.tsx      # Command palette (⌘K) for quick AI queries
├── floating-ai-button.tsx  # FAB to open chat
└── *-detail-sheet.tsx      # Slide-out detail panels (lead, customer, campaign)

lib/
├── data-layer.ts              # Data access abstraction over @tasco/db
├── entity-filter-context.tsx  # Multi-entity selection context
├── multi-agent-context.tsx    # Multi-agent AI selection context
├── config.ts                  # App constants and filter options
└── rag-sync.ts                # Auto-sync data changes to Lyzr KB
```

### Multi-Agent System

The app uses a **multi-agent architecture** with 5 specialized AI agents:

| Agent | Key | Specialization |
|-------|-----|----------------|
| General Assistant | `customer-lifecycle:assistant` | Cross-functional, routing, general queries |
| Lead Expert | `customer-lifecycle:lead-expert` | Lead scoring, qualification, conversion |
| Customer Expert | `customer-lifecycle:customer-expert` | Retention, churn prediction, VIP analysis |
| Inventory Expert | `customer-lifecycle:inventory-expert` | Stock management, aging, import orders |
| Campaign Expert | `customer-lifecycle:campaign-expert` | Marketing ROI, campaign performance |

**Agent Selection Flow:**
```
User opens Chat → AgentSelector dropdown → useMultiAgent() updates state →
ChatProvider receives new agentId → Lyzr routes to selected agent
```

**Key files:**
- `lib/multi-agent-context.tsx` - Agent definitions, provider, hooks
- `components/agent-selector.tsx` - AgentSelector, AgentIndicator, AgentBadge

**Usage:**
```typescript
import { useMultiAgent } from "@/lib/multi-agent-context";
import { AgentSelector, AgentIndicator } from "@/components/agent-selector";

// In component
const { selectedAgent, selectAgent, currentAgentId, isMultiAgentEnabled } = useMultiAgent();

// UI components
<AgentSelector showFullName />  // Dropdown
<AgentIndicator />              // Compact badge
```

### Data Flow

1. **Entity Filtering**: `useEntityFilter()` provides `selectedEntityIds` used by all data fetches
2. **API Pattern**: `GET /api/[resource]?entityIds=id1,id2,id3` - all endpoints support entity filtering
3. **Chat Integration**: `ChatProvider` wraps app, `useChatContext()` available in all components
4. **RAG Sync**: Changes to leads/customers/campaigns auto-sync to KB via `lib/rag-sync.ts`

### API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/dashboard` | GET | Stats, leads inbox, at-risk customers, recommendations |
| `/api/leads` | GET, POST | List/create leads with priority/status filters |
| `/api/leads/[id]` | GET, PUT, DELETE | Single lead CRUD |
| `/api/leads/[id]/score` | POST | AI lead scoring |
| `/api/customers` | GET, POST | List/create customers with segment filters |
| `/api/customers/[id]` | GET, PUT | Single customer CRUD |
| `/api/campaigns` | GET, POST | Campaign list/create |
| `/api/inventory` | GET | Vehicle inventory with status/brand/aging filters |
| `/api/orders` | GET | Import orders |
| `/api/entities` | GET | Showroom entity list |
| `/api/conversations` | GET, POST, PATCH, DELETE | Chat conversations |
| `/api/messages` | GET, POST | Chat messages with citations |
| `/api/notifications` | GET, POST | App notifications |
| `/api/guide` | GET | App guide/onboarding content |

### Key Types

```typescript
// Leads
LeadPriority: "hot" | "warm" | "cold"
LeadStatus: "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost"
LeadSource: "website" | "referral" | "walk-in" | "event" | "social" | "other"

// Customers
CustomerStage: "prospect" | "active" | "loyal" | "at-risk" | "churned"
CustomerSegment: "vip" | "regular" | "at-risk" | "new"

// Campaigns
CampaignType: "email" | "sms" | "social" | "event" | "direct-mail"
CampaignStatus: "draft" | "active" | "paused" | "completed"
```

## Shared Packages

### @tasco/ui - Component Library

```typescript
// Core components
import { Button, Card, Badge, Dialog, Sheet, Tabs } from "@tasco/ui";

// Chat components
import { ChatContainer, ChatMessage, ChatInput } from "@tasco/ui";

// App components
import { EntitySelector, GuideCarousel, AppShell } from "@tasco/ui";

// Icons (190+ Lucide icons re-exported)
import { MessageSquare, Users, Car, Sparkles } from "@tasco/ui/icons";

// Utilities
import { cn } from "@tasco/ui/lib/utils";
```

**EntitySelector** - Hierarchical multi-select for 17 Tasco entities with parent→holding→subsidiary tree.

**ChatContainer** - Full chat UI with messages, input, suggestions, citations, and validation badges.

**GuideCarousel** - One-pager + feature slides for app onboarding tours.

### @tasco/lyzr - AI Integration

```typescript
import { ChatProvider, useChatContext } from "@tasco/lyzr";
import { usePersistentChat } from "@tasco/lyzr/hooks";
import { createLyzrClient } from "@tasco/lyzr";

// ChatProvider wraps app for global chat state
<ChatProvider
  appId="customer-lifecycle"
  entityId={entityId}
  userId={userId}
  agentId={process.env.NEXT_PUBLIC_LYZR_AGENT_ID}
  enableValidation={true}
>
  {children}
</ChatProvider>

// Access in components
const {
  messages,
  isLoading,
  sendMessage,
  conversations,
  selectConversation,
  createNewConversation,
  deleteConversationById,
} = useChatContext();
```

**Features**:
- DynamoDB-persisted conversations with entity scoping
- Per-app conversation caching prevents refetches
- Auto-generated titles from first user message
- Enhanced citations from Lyzr RAG
- Validation agent support for response scoring (0-100)
- Streaming inference support

### @tasco/db - Database Layer

```typescript
import { docClient } from "@tasco/db";
import {
  // Chat
  createConversation, getConversation, listConversations,
  createMessage, listMessages,
  // Entities
  listEntities, getEntity,
  // Notifications
  createNotification, getNotifications,
} from "@tasco/db";

// Lifecycle-specific (via lib/data-layer.ts)
import {
  getAllLeads, getLeadById, createLead, updateLead,
  getAllCustomers, getCustomerById, getAtRiskCustomers,
  getAllCampaigns, getCampaignById,
} from "@/lib/data-layer";
```

### @tasco/agents - Agent Registry

```typescript
import { getAgent, getAgentsByApp, getKB } from "@tasco/agents/registry";

// Get agent config
const agent = getAgent("customer-lifecycle:assistant");
console.log(agent.id);  // Lyzr agent ID

// Get knowledge base
const kb = getKB("customer-lifecycle:business-data-kb");
```

### @tasco/i18n - Internationalization

```typescript
import { useTranslation } from "@tasco/i18n";
import { I18nProvider } from "@tasco/i18n/provider";

// In components
const { t } = useTranslation("leads");  // Namespace
return <h1>{t("title")}</h1>;

// Shared namespaces: common, chat, sidebar, header
// App namespaces: app, dashboard, leads, customers, marketing
```

**Languages**: English (en), Vietnamese (vi)

### @tasco/rag - RAG Utilities

```typescript
import { syncDocumentToRAG, createRAGService } from "@tasco/rag";

// Sync document to knowledge base
await syncDocumentToRAG(document, {
  lyzrApiKey: process.env.LYZR_API_KEY,
  ragKBId: process.env.LYZR_BUSINESS_DATA_KB_ID,
});
```

### @tasco/api - API Handlers

```typescript
import {
  handleConversationsRequest,
  handleMessagesRequest,
  handleEntitiesRequest,
} from "@tasco/api";
```

## Key Patterns

### Entity Filtering

```typescript
// In any page/component
const { selectedEntityIds, isLoading } = useEntityFilter();

// Build query string
const entityParam = buildEntityFilterParams(selectedEntityIds);
const url = `/api/leads?${entityParam}&status=new`;

// All API endpoints support ?entityIds=id1,id2,id3
```

### Detail Sheets

```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);

// In render
<LeadDetailSheet
  leadId={selectedId}
  open={!!selectedId}
  onOpenChange={(open) => !open && setSelectedId(null)}
/>
```

### RAG Sync on Data Changes

```typescript
// lib/rag-sync.ts auto-syncs to KB
import { syncLeadToRAG, syncCustomerToRAG } from "@/lib/rag-sync";

// After creating/updating a lead
await syncLeadToRAG(lead);
```

### Translation Pattern

```typescript
// locales/en/leads.json
{
  "title": "Leads",
  "filters": {
    "all": "All",
    "hot": "Hot Leads"
  },
  "stats": {
    "total": "Total: {{count}}"
  }
}

// Usage
const { t } = useTranslation("leads");
t("stats.total", { count: 42 });  // "Total: 42"
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_LYZR_API_KEY=           # Lyzr API key
NEXT_PUBLIC_LYZR_AGENT_ID=          # Main chat agent ID

# Multi-Agent (optional - enables agent selection)
NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID=       # Lead expert agent
NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID=   # Customer expert agent
NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID=  # Inventory expert agent
NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID=   # Campaign expert agent

# Optional
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=  # Response validation agent
LYZR_BUSINESS_DATA_KB_ID=              # Knowledge base for RAG sync

# AWS (auto-configured)
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

When expert agent IDs are set, the multi-agent UI automatically enables (`isMultiAgentEnabled: true`).

## Database Tables

- `tasco-conversations` - Chat conversations (PK: id, SK: createdAt)
- `tasco-messages` - Chat messages (PK: conversationId, SK: timestamp#id)
- `tasco-entities` - Showroom entities
- `tasco-leads` - Lead records
- `tasco-customers` - Customer profiles
- `tasco-campaigns` - Marketing campaigns
- `tasco-vehicles` - Inventory vehicles
- `tasco-import-orders` - Vehicle import orders
- `tasco-notifications` - App notifications

## File Locations

| Purpose | Location |
|---------|----------|
| Data access functions | `lib/data-layer.ts` |
| Entity filtering | `lib/entity-filter-context.tsx` |
| Multi-agent context | `lib/multi-agent-context.tsx` |
| RAG sync utilities | `lib/rag-sync.ts` |
| App constants | `lib/config.ts` |
| Agent selector UI | `components/agent-selector.tsx` |
| English translations | `locales/en/*.json` |
| Vietnamese translations | `locales/vi/*.json` |
| Dashboard API | `app/api/dashboard/route.ts` |
| Chat page | `app/chat/page.tsx` |
| Agent setup script | `scripts/setup-agents.ts` |
| Multi-agent setup | `scripts/setup-multi-agents.ts` |
| KB connection script | `scripts/connect-kb-to-experts.ts` |

## Adding Features

### New Page
1. Create `app/[feature]/page.tsx`
2. Add translations to `locales/en/[feature].json` and `locales/vi/[feature].json`
3. Use `useEntityFilter()` for multi-entity support
4. Add navigation item to `components/sidebar.tsx`

### New API Endpoint
1. Create `app/api/[resource]/route.ts`
2. Support `?entityIds=` query parameter
3. Return `{ success: boolean, data?, error? }` format

### Connect to Lyzr Chat
1. Get agent ID: `getAgent("customer-lifecycle:assistant")`
2. Configure in `ChatProvider` props
3. Use `useChatContext()` in components
4. Sync data changes via `lib/rag-sync.ts`
