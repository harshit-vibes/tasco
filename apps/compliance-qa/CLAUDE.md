# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

**Compliance QA** is an AI-powered compliance Q&A system for Tasco Group (G1 proposal). It provides deterministic, source-grounded responses for legal and document governance queries across 150-200 subsidiary companies.

## Commands

```bash
# Development
bun run dev              # Start dev server on port 3001

# Build & Lint
bun run build            # Production build
bun run lint             # Run ESLint

# Agent & KB Setup Scripts
bun run setup-agents     # Create Legal/Internal Expert agents + Legal KB
bun run connect-agents   # Connect Knowledge Bases to agents
bun run sync-documents   # Sync documents from S3 to RAG KBs
bun run update-orchestrator  # Update orchestrator agent instructions
bun run seed-legal-docs  # Seed legal documents
bun run seed-guide       # Seed guide data

# Document sync options
bun run sync-documents -- --legal-only     # Only sync legal documents
bun run sync-documents -- --internal-only  # Only sync internal documents
bun run sync-documents -- --force          # Force resync all documents
```

## Architecture

### Multi-Agent System

The app uses a hierarchical multi-agent architecture with Lyzr:

```
Orchestrator Agent (Claude Sonnet)
├── Legal Expert Agent (gpt-4o-mini, temp=0.2)
│   └── Legal KB (Vietnamese laws, decrees, circulars)
└── Internal Expert Agent (gpt-4o-mini, temp=0.3)
    └── Internal KB (company policies, charters, contracts)
```

- **Orchestrator**: Routes queries to appropriate expert agents, validates responses
- **Validation Agent**: Scores response quality for compliance accuracy
- **Legal Expert**: Specializes in Vietnamese corporate law (Luật Doanh nghiệp, Nghị định, Thông tư)
- **Internal Expert**: Specializes in Tasco Group's internal policies and procedures

### Key Files

| Path | Purpose |
|------|---------|
| `components/app-shell.tsx` | Main layout with ChatProvider, sidebar navigation |
| `components/app-header.tsx` | Header with language switcher, settings |
| `lib/agents/setup.ts` | Agent configurations (LEGAL_EXPERT_AGENT, INTERNAL_EXPERT_AGENT) |
| `scripts/sync-documents.ts` | Syncs documents to appropriate KB based on category |
| `locales/{en,vi}/` | i18n translations (bilingual support) |

### API Routes

All API handlers use factory functions from `@tasco/api`:

| Route | Purpose |
|-------|---------|
| `/api/conversations` | Chat conversation CRUD |
| `/api/messages` | Message storage |
| `/api/documents` | Document CRUD (uses `createDocumentsHandler`) |
| `/api/documents/sync` | Trigger KB sync |
| `/api/documents/upload` | File upload to S3 |
| `/api/guide` | App guide/tour data |
| `/api/ocr` | OCR processing |

### Shared Packages Used

```typescript
import { ChatProvider, useChatContext, SettingsProvider } from "@tasco/lyzr";
import { ChatContainer, DocumentPreviewSheet, Button } from "@tasco/ui";
import { MessageSquare, FileDown } from "@tasco/ui/icons";
import { handleListConversations, createDocumentsHandler, getOrCreateAgent } from "@tasco/api";
import { syncDocumentToRAG, createRAGService } from "@tasco/rag";
import { getAgent, getKB, DOCUMENT_CATEGORIES } from "@tasco/agents";
import { useTranslation, I18nProvider } from "@tasco/i18n";
import { exportChatToPDF } from "@tasco/export";
import { TourProvider } from "@tasco/tours";
```

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

```env
# Agent IDs (from @tasco/agents registry)
NEXT_PUBLIC_LYZR_AGENT_ID=           # Orchestrator agent
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID= # Validation agent
NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=     # Legal expert agent
NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=  # Internal expert agent

# API Keys
NEXT_PUBLIC_LYZR_API_KEY=            # Client-side Lyzr API key
LYZR_API_KEY=                        # Server-side Lyzr API key

# Knowledge Base IDs
LYZR_KB_ID=                          # Internal KB
LYZR_LEGAL_KB_ID=                    # Legal KB
NEXT_PUBLIC_RAG_URL=https://rag-prod.studio.lyzr.ai

# AWS (for DynamoDB)
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=
```

## Document Categories

Documents are automatically routed to the appropriate KB based on category:

| Category | Destination KB | Expert Agent |
|----------|---------------|--------------|
| `_LEGAL` | Legal KB | Legal Expert Agent |
| All others | Internal KB | Internal Expert Agent |

Categories defined in `@tasco/agents/knowledge-bases` via `DOCUMENT_CATEGORIES`.

## Navigation Structure

The app sidebar (`components/app-shell.tsx`) has these sections:

- **Main**: Overview (dashboard), Compliance Chat (main chat interface)
- **Documents**: Internal Documents (KB), Legal Framework
- **Organization**: Entity Structure, Audit Trail
- **Settings**: API key configuration
