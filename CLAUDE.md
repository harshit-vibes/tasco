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
- `@tasco/ui` - shadcn/ui components + globals.css + icons
- `@tasco/db` - DynamoDB client (`docClient`, `dynamoClient`)
- `@tasco/lyzr` - Lyzr SDK wrapper (`createLyzrClient`, `useChat` hook)
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

### Mock Data

Synthetic compliance documents and entity data for demos:
- `docs/mock-data/*.md` - 8 sample documents (policies, charters, minutes)
- `docs/mock-data/index.json` - Document metadata
- `docs/mock-data/entities.json` - 17 Tasco entities hierarchy

### Database

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

### Environment Variables

```env
LYZR_API_KEY=         # Lyzr API key
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

## Key Documentation

- `docs/mapping.md` - Challenge to proposal mapping
- `docs/README.md` - Documentation index
- `docs/proposal[1-8].md` - Submitted proposals
- `docs/challenges/` - Original challenge files
