# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tasco Innovation Day demos - a Bun + Next.js 15 monorepo with **8 AI demo applications** based on 8 submitted proposals for Tasco Group business units. Apps use Lyzr SDK for AI agent capabilities.

## Commands

```bash
# Install dependencies
bun install

# Run a specific app (use filter with package name)
bun run dev --filter=@tasco/compliance-qa

# Build specific app
bun run build --filter=@tasco/compliance-qa

# Run from app directory
cd apps/compliance-qa && bun dev

# Initialize DynamoDB tables (run once)
cd packages/db && bun run db:init

# Seed entities data (optional - API auto-seeds)
cd packages/db && bun run db:seed-entities

# Clean all builds
bun run clean

# AWS production setup
./scripts/setup-aws.sh
./scripts/deploy-priority-apps.sh
```

**Port Convention:** Apps run on port 3001 by default (configured in each app's next.config.ts)

## Architecture

### Monorepo Structure (Bun workspaces + Turborepo)

**Apps** (`apps/[app-name]/`): 8 Next.js 15 apps in flat structure
- Package naming: `@tasco/[app-name]`
- Each app uses App Router and depends on shared packages

**8 Apps (1 per proposal)**:

| Code | App | Proposal | Business Unit |
|------|-----|----------|---------------|
| G1 | compliance-qa | Compliance & Document Governance | Tasco Group |
| TA1 | customer-lifecycle | Customer Lifecycle Management | Tasco Auto |
| INS2 | sales-pricing | AI Sales & Pricing Cockpit | Tasco Insurance |
| INS3 | e-learning | AI E-Learning Factory | Tasco Insurance |
| INS4 | risk-radar | AI Risk & Profitability Radar | Tasco Insurance |
| INC1 | sales-order | Order Data Entry Automation | Inochi |
| INC2 | data-sync | Sales & Revenue Data Sync | Inochi |
| INC4 | promotion-control | Promotion Overlap Control | Inochi |

**Shared Packages** (`packages/`):
- `@tasco/agents` - **Central agent & KB registry** (single source of truth)
- `@tasco/ui` - shadcn/ui components + globals.css + icons
- `@tasco/db` - DynamoDB client (`docClient`, `dynamoClient`)
- `@tasco/lyzr` - Lyzr SDK wrapper (`createLyzrClient`, `useChat` hook)
- `@tasco/api` - API handlers + Lyzr agent management utilities
- `@tasco/rag` - RAG/Knowledge Base service wrapper
- `@tasco/config` - Shared TypeScript and Tailwind configs

### UI Package Structure

```
packages/ui/src/
├── components/       # shadcn components (Button, Card, EntitySelector, etc.)
├── icons/index.ts    # Re-exports from lucide-react (import from @tasco/ui/icons)
├── lib/utils.ts      # cn() utility
├── globals.css       # Tailwind + CSS variables
└── index.ts          # Component exports
```

**Icon Usage:** Import icons from `@tasco/ui/icons` (not directly from lucide-react):
```typescript
import { MessageSquare, FileText, Settings } from "@tasco/ui/icons";
```

### Multi-Tenant Pattern

All apps support multi-entity selection for Tasco's 17 subsidiaries:
- `EntitySelector` component in `@tasco/ui` with single/multi-select modes
- Entity hierarchy: parent → holding → subsidiary
- Mock entities data: `docs/mock-data/entities.json`

### Package Dependencies

Apps import shared packages:
```typescript
import { Button, Card, EntitySelector } from "@tasco/ui";
import { MessageSquare, Settings } from "@tasco/ui/icons";
import { docClient } from "@tasco/db";
import { useChat } from "@tasco/lyzr/hooks";
import "@tasco/ui/globals.css"; // In layout.tsx
```

## Centralized Agent & KB Registry (`@tasco/agents`)

The `@tasco/agents` package is the **single source of truth** for all Lyzr agents and knowledge bases across apps.

### Agent Registry

```typescript
import { getAgent, getAgentsByApp, AGENTS } from "@tasco/agents/registry";

// Get agent by key
const agent = getAgent("compliance-qa:orchestrator");
console.log(agent.id); // "696108ed5e0239738a838cd8"

// Get all agents for an app
const agents = getAgentsByApp("compliance-qa");
```

### Knowledge Base Registry

```typescript
import { getKB, getKBsByApp, DOCUMENT_CATEGORIES } from "@tasco/agents/knowledge-bases";

// Get KB by key
const kb = getKB("compliance-qa:legal-kb");
console.log(kb.id); // "69613775979041509ac8ee82"

// Get document category
const legalCategory = DOCUMENT_CATEGORIES._LEGAL;
console.log(legalCategory.targetKB); // "compliance-qa:legal-kb"
```

### Registry Management Scripts

```bash
# List all agents
cd packages/agents && bun run list-agents

# List all knowledge bases
cd packages/agents && bun run list-kbs

# Setup pending KBs in Lyzr API
LYZR_API_KEY=xxx bun run setup-kbs
```

### Registry Structure

| Registry | Active | Pending | Apps |
|----------|--------|---------|------|
| Agents | 16 | 0 | 8 |
| Knowledge Bases | 2 | 7 | 8 |
| Document Categories | 5 | - | compliance-qa |

## Lyzr Agent Management

The `@tasco/api` package provides comprehensive utilities for managing Lyzr agents programmatically.

### Agent Management Functions

```typescript
import {
  // Basic CRUD
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  findAgentByName,
  getOrCreateAgent,
  // Advanced utilities
  updateAgentFull,
  connectKnowledgeBase,
  disconnectKnowledgeBase,
  updateAgentInstructions,
  getAgentKnowledgeBase,
  updateAgentModel,
  addKnowledgeBase,
  removeKnowledgeBase,
  getAgentKnowledgeBases,
  // Types
  type AgentConfig,
  type Agent,
  type AgentManagementConfig,
  type AgentUpdateOptions,
  type AgentFeature,
  type RAGFeature,
} from "@tasco/api";
```

### Common Operations

```typescript
const config: AgentManagementConfig = { apiKey: process.env.LYZR_API_KEY };

// Create or get existing agent (idempotent)
const { agent, created } = await getOrCreateAgent(
  { name: "My Agent", system_prompt: "You are helpful" },
  config
);

// Connect a Knowledge Base to agent
await connectKnowledgeBase(agent.agent_id, kbId, config, { top_k: 5 });

// Update agent instructions
await updateAgentInstructions(agent.agent_id, "New system prompt", config);

// Get connected KB
const kbId = await getAgentKnowledgeBase(agent.agent_id, config);

// Change model
await updateAgentModel(agent.agent_id, "gpt-4o", config);
```

### Lyzr API Notes

- **PUT requires all fields**: Use `updateAgentFull()` which auto-merges with existing config
- **KB connection via features**: KBs connect through `features` array with `type: "rag"`, not `rag_id`
- **API URL**: `https://agent-prod.studio.lyzr.ai/v3/agents/`

### Example Setup Scripts

See `apps/compliance-qa/scripts/` for reference implementations:
- `setup-agents.ts` - Create agents and KBs
- `connect-agents.ts` - Connect KBs to agents
- `update-orchestrator.ts` - Update agent instructions
- `sync-documents.ts` - Sync documents to KBs

## Mock Data

Synthetic compliance documents and entity data for demos:
- `docs/mock-data/*.md` - 8 sample documents (policies, charters, minutes)
- `docs/mock-data/index.json` - Document metadata
- `docs/mock-data/entities.json` - 17 Tasco entities hierarchy

## Database

**IMPORTANT:** Always use production AWS DynamoDB, even for local development. No local DynamoDB setup required.

AWS credentials are managed via AWS CLI profile (not environment variables):
```bash
# Configure AWS CLI (one-time setup)
aws configure --profile tasco
```

Tables:
- `tasco-conversations` - Chat conversations
- `tasco-messages` - Chat messages
- `tasco-entities` - Company entities
- `tasco-documents` - Document metadata
- `tasco-courses` - E-learning courses

## Environment Variables

```env
# Lyzr API
LYZR_API_KEY=                           # Lyzr API key (server-side)
NEXT_PUBLIC_LYZR_API_KEY=               # Lyzr API key (client-side)
NEXT_PUBLIC_LYZR_AGENT_ID=              # Main agent ID
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=   # Validation agent ID

# Multi-Agent (compliance-qa)
NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=        # Legal expert agent
NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=     # Internal policy agent
LYZR_LEGAL_KB_ID=                       # Legal KB ID
LYZR_KB_ID=                             # Internal KB ID

# AWS
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

## Proposal to Challenge Mapping

21 original challenges + 2 NEW proposals = 8 apps

| App | Type | Challenges Mapped |
|-----|------|-------------------|
| compliance-qa | LLM | Compliance, Finance Consolidation |
| customer-lifecycle | Pivot | Customer Lifecycle, Inventory, Carpla Fleet, DNP Sales, Thang Long |
| sales-pricing | Pivot | Sales & Pricing, Damage Assessment, Underwriting |
| e-learning | LLM | E-Learning, Service Center Quality, Moto Chatbot |
| risk-radar | Pivot | Risk Radar, Accounting, Leakage, Energy |
| sales-order | LLM | Order Entry, CV Inventory, Elevation Scanner |
| data-sync | Pivot | Data Sync, GIS Standardization |
| promotion-control | Pivot | Promotion Control |

See `docs/mapping.md` for complete mapping details.

## Git Workflow

- `dev` branch: Local development
- `prod` branch: AWS Amplify auto-deploy

## Lyzr Registry

**Primary:** Use `@tasco/agents` package (TypeScript, programmatic access)
**Secondary:** `lyzr-registry.json` at repo root (JSON, quick reference)

### Using the Centralized Registry

Apps should import from `@tasco/agents` instead of hardcoding IDs:

```typescript
// In scripts that need agent/KB IDs
import { getAgent } from "@tasco/agents/registry";
import { getKB, DOCUMENT_CATEGORIES } from "@tasco/agents/knowledge-bases";

const agentId = getAgent("compliance-qa:orchestrator")?.id;
const kbId = getKB("compliance-qa:legal-kb")?.id;
```

### JSON Registry (Quick Reference)

```bash
# View current registry
cat lyzr-registry.json | jq '.agents["compliance-qa"]'

# Get all agent IDs
cat lyzr-registry.json | jq '.agents | to_entries | .[].value | to_entries | .[].value.id'
```

### Registry Files

| File | Purpose |
|------|---------|
| `packages/agents/src/registry.ts` | Agent definitions (TypeScript) |
| `packages/agents/src/knowledge-bases.ts` | KB definitions (TypeScript) |
| `lyzr-registry.json` | JSON export for quick reference |

**Update both** when creating new agents or KBs.

## Key Documentation

- `lyzr-registry.json` - Agent and KB registry
- `docs/mapping.md` - Challenge to proposal mapping
- `docs/README.md` - Documentation index
- `docs/proposal[1-8].md` - Submitted proposals
- `docs/challenges/` - Original challenge files
- `docs/prd/` - Product requirement documents per app
