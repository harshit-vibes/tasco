# Lyzr Agent Audit Report

> **Audit Date:** 2026-01-10
> **Total Apps:** 8
> **Total Registered Agents:** 12 (10 active, 2 pending)
> **Total Knowledge Bases:** 2

---

## Executive Summary

| App | Status | Agents | KBs | Implementation |
|-----|--------|--------|-----|----------------|
| **compliance-qa** | Production | 4 | 2 | Multi-agent orchestration |
| **e-learning** | Production | 6 | 0 | Content generation pipeline |
| **sales-order** | Production | 2 | 0 | OCR extraction + validation |
| **customer-lifecycle** | Mock | 0 | 0 | Chat UI only, no backend |
| **sales-pricing** | Mock | 0 | 0 | Chat ready, needs agent ID |
| **risk-radar** | Mock | 0 | 0 | ChatProvider ready, needs ID |
| **data-sync** | Mock | 0 | 0 | Hardcoded mock responses |
| **promotion-control** | None | 0 | 0 | No chat feature |

---

## App 1: COMPLIANCE-QA (Production)

### Architecture: Multi-Agent Orchestration

```
User Query
    ↓
[Orchestrator Agent] ← 696108ed5e0239738a838cd8
    ├─ Routes LEGAL queries to:
    │   └─ [Legal Expert] ← 69613776c57d451439d4c8f4
    │       └─ Queries legal-kb (6 docs)
    │
    └─ Routes INTERNAL queries to:
        └─ [Internal Expert] ← 69613777c57d451439d4c8f5
            └─ Queries internal-kb (8 docs)
    ↓
[Validation Agent] ← 696108f75e0239738a838cdf
    └─ Scores response quality
```

### Agent Inventory

| Role | Name | Agent ID | Model | Connected KB | Env Var |
|------|------|----------|-------|--------------|---------|
| orchestrator | Compliance Super AI | `696108ed5e0239738a838cd8` | gpt-4o-mini | None | `NEXT_PUBLIC_LYZR_AGENT_ID` |
| expert | Tasco Legal Framework Expert | `69613776c57d451439d4c8f4` | gpt-4o-mini | legal-kb | `NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID` |
| expert | Tasco Internal Policy Expert | `69613777c57d451439d4c8f5` | gpt-4o-mini | internal-kb | `NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID` |
| validator | Compliance Validation Agent | `696108f75e0239738a838cdf` | gpt-4o-mini | None | `NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID` |

### Knowledge Bases

| Name | KB ID | Documents | Connected Agent |
|------|-------|-----------|-----------------|
| compliance-qa-internal | `6960a63fee18986913060bc0` | 8 | internal-expert |
| compliance-qa-legal | `69613775979041509ac8ee82` | 6 | legal-expert |

### Features

| Feature | Agent Used | Status |
|---------|-----------|--------|
| Compliance Q&A Chat | Orchestrator → Experts | Production |
| Response Validation | Validation Agent | Production |
| Legal Document Queries | Legal Expert + KB | Production |
| Internal Policy Queries | Internal Expert + KB | Production |
| Document Sync to KB | N/A (script) | Production |

### Setup Scripts

- `bun run setup-agents` - Create agents and KBs
- `bun run connect-agents` - Connect KBs to agents
- `bun run update-orchestrator` - Update orchestration prompt
- `bun run sync-documents` - Sync documents to KBs

---

## App 2: E-LEARNING (Production)

### Architecture: Content Generation Pipeline

```
User Requirement
    ↓
[Course Outline Generator] ← 6960efc45e0239738a838056
    ↓
[Module Content Generator] ← 6960efcf5e0239738a838072
    ├─ [Lesson Generator] ← 6960f136c57d451439d4b4a1
    └─ [Quiz Generator] ← 6960f1445e0239738a8383b9
    ↓
Course Published

[Chat Assistant] ← 6961ba6bd09b5523633454d5
    └─ [Validation Agent] ← 6961ba6bd09b5523633454d6
```

### Agent Inventory

| Role | Name | Agent ID | Model | Env Var |
|------|------|----------|-------|---------|
| expert | Course Outline Generator | `6960efc45e0239738a838056` | gpt-4o-mini | `LYZR_COURSE_OUTLINE_AGENT_ID` |
| expert | Module Content Generator | `6960efcf5e0239738a838072` | gpt-4o-mini | `LYZR_MODULE_CONTENT_AGENT_ID` |
| expert | Lesson Generator | `6960f136c57d451439d4b4a1` | gpt-4o-mini | `LYZR_LESSON_GENERATOR_AGENT_ID` |
| expert | Quiz Generator | `6960f1445e0239738a8383b9` | gpt-4o-mini | `LYZR_QUIZ_GENERATOR_AGENT_ID` |
| main | E-Learning Chat Assistant | `6961ba6bd09b5523633454d5` | gpt-4o-mini | `NEXT_PUBLIC_LYZR_AGENT_ID` |
| validator | E-Learning Validation Agent | `6961ba6bd09b5523633454d6` | gpt-4o-mini | `NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID` |

### Features

| Feature | Agent Used | Status |
|---------|-----------|--------|
| Course Outline Generation | Outline Generator | Production |
| Module Content Generation | Module/Lesson/Quiz Generators | Production |
| Learner Chat Assistant | Chat Assistant | Production |
| Response Validation | Validation Agent | Production |

### Setup Scripts

- `bun run setup-agents` - Create chat agents

---

## App 3: SALES-ORDER (Production)

### Architecture: OCR + Extraction + Validation

```
Uploaded Document (PDF/Image)
    ↓
[OCR Processing]
    ↓
[Vietnamese Order Extractor] ← 69613126c57d451439d4c4e4
    ↓
[Order Validation Specialist] ← 69613126c57d451439d4c4e5
    ↓
Extracted & Validated Order
```

### Agent Inventory

| Role | Name | Agent ID | Model | Env Var |
|------|------|----------|-------|---------|
| expert | Vietnamese Order Data Extractor | `69613126c57d451439d4c4e4` | gpt-4o-mini | `EXTRACTION_AGENT_ID` |
| validator | Order Validation Specialist | `69613126c57d451439d4c4e5` | gpt-4o-mini | `VALIDATION_AGENT_ID` |

### Features

| Feature | Agent Used | Status |
|---------|-----------|--------|
| OCR Text Extraction | N/A (external service) | Production |
| Order Data Extraction | Extractor Agent | Production |
| Data Validation | Validation Agent | Production |
| Confidence Scoring | Extractor Agent | Production |

### Setup Scripts

- `bun run setup-agents` - Create extraction/validation agents

---

## App 4: CUSTOMER-LIFECYCLE (Mock)

### Status: Chat UI Only - No Backend Agent

| Feature | Implementation | Agent Status |
|---------|---------------|--------------|
| Chat UI | `useChatContext()` hook | No agent configured |
| Suggested Questions | Hardcoded in page | N/A |
| AI Recommendations | Database schema exists | No agent to populate |

### Required Agents (Not Created)

| Proposed Role | Purpose | Status |
|---------------|---------|--------|
| main | Customer Insights Assistant | Not created |
| expert | Lead Recommendation Agent | Not created |

---

## App 5: SALES-PRICING (Mock)

### Status: Chat Infrastructure Ready - Needs Agent ID

| Feature | Implementation | Agent Status |
|---------|---------------|--------------|
| Chat Page | `usePersistentChat()` hook | No agent ID |
| Conversation History | DynamoDB storage | Works without agent |
| Pricing Calculations | Local JavaScript | N/A (no agent needed) |

### Required Agents (Not Created)

| Proposed Role | Purpose | Status |
|---------------|---------|--------|
| main | Pricing Assistant | Not created |

---

## App 6: RISK-RADAR (Mock)

### Status: ChatProvider Ready - Needs Agent ID

| Feature | Implementation | Agent Status |
|---------|---------------|--------------|
| AI Assistant Page | ChatProvider + useChatContext | No agent ID |
| Conversation Sidebar | ChatProvider context | No agent ID |
| Demo Controls | Mock data simulation | N/A |

### Required Agents (Not Created)

| Proposed Role | Purpose | Status |
|---------------|---------|--------|
| main | Risk Analysis Assistant | Not created |

---

## App 7: DATA-SYNC (Mock)

### Status: Hardcoded Mock Responses

| Feature | Implementation | Agent Status |
|---------|---------------|--------------|
| Chat Page | Custom mock handler | Hardcoded responses |
| API Route | Keyword-based responses | No Lyzr calls |

### Required Agents (Not Created)

| Proposed Role | Purpose | Status |
|---------------|---------|--------|
| main | Data Sync Assistant | Not created |

---

## App 8: PROMOTION-CONTROL (None)

### Status: No Chat Feature

| Feature | Implementation | Agent Status |
|---------|---------------|--------------|
| Conflict Detection | Local algorithm | N/A |
| Promotion Management | CRUD operations | N/A |

### Required Agents (Optional)

| Proposed Role | Purpose | Status |
|---------------|---------|--------|
| main | Promotion Analysis Assistant | Not planned |

---

## Complete Agent Registry

### Active Agents (12 Total)

| # | App | Agent Name | Agent ID | Role | Status |
|---|-----|-----------|----------|------|--------|
| 1 | compliance-qa | Compliance Super AI | `696108ed5e0239738a838cd8` | orchestrator | Active |
| 2 | compliance-qa | Tasco Legal Framework Expert | `69613776c57d451439d4c8f4` | expert | Active |
| 3 | compliance-qa | Tasco Internal Policy Expert | `69613777c57d451439d4c8f5` | expert | Active |
| 4 | compliance-qa | Compliance Validation Agent | `696108f75e0239738a838cdf` | validator | Active |
| 5 | e-learning | Course Outline Generator | `6960efc45e0239738a838056` | expert | Active |
| 6 | e-learning | Module Content Generator | `6960efcf5e0239738a838072` | expert | Active |
| 7 | e-learning | Lesson Generator | `6960f136c57d451439d4b4a1` | expert | Active |
| 8 | e-learning | Quiz Generator | `6960f1445e0239738a8383b9` | expert | Active |
| 9 | e-learning | E-Learning Chat Assistant | `6961ba6bd09b5523633454d5` | main | Active |
| 10 | e-learning | E-Learning Validation Agent | `6961ba6bd09b5523633454d6` | validator | Active |
| 11 | sales-order | Vietnamese Order Data Extractor | `69613126c57d451439d4c4e4` | expert | Active |
| 12 | sales-order | Order Validation Specialist | `69613126c57d451439d4c4e5` | validator | Active |

### Knowledge Bases (2 Total)

| # | App | KB Name | KB ID | Documents | Connected Agent |
|---|-----|---------|-------|-----------|-----------------|
| 1 | compliance-qa | compliance-qa-internal | `6960a63fee18986913060bc0` | 8 | internal-expert |
| 2 | compliance-qa | compliance-qa-legal | `69613775979041509ac8ee82` | 6 | legal-expert |

---

## Agent-to-Feature Mapping

### One Agent = One Feature = One App (Current State)

| Agent | App | Feature | Unique |
|-------|-----|---------|--------|
| Compliance Super AI | compliance-qa | Orchestration | Yes |
| Legal Expert | compliance-qa | Legal Q&A | Yes |
| Internal Expert | compliance-qa | Policy Q&A | Yes |
| Compliance Validator | compliance-qa | Response Scoring | Yes |
| Course Outline Generator | e-learning | Outline Creation | Yes |
| Module Content Generator | e-learning | Module Creation | Yes |
| Lesson Generator | e-learning | Lesson Creation | Yes |
| Quiz Generator | e-learning | Quiz Creation | Yes |
| E-Learning Chat | e-learning | Learner Support | Yes |
| E-Learning Validator | e-learning | Response Scoring | Yes |
| Order Extractor | sales-order | OCR Extraction | Yes |
| Order Validator | sales-order | Data Validation | Yes |

**Finding:** All 12 agents are unique to their app/feature. No agent is shared across apps.

---

## Mock vs Real Implementation Summary

| App | Chat Feature | Agent Status | Real/Mock |
|-----|--------------|--------------|-----------|
| compliance-qa | Yes | 4 agents | **Real** |
| e-learning | Yes | 6 agents | **Real** |
| sales-order | No (extraction only) | 2 agents | **Real** |
| customer-lifecycle | Yes (UI only) | 0 agents | **Mock** |
| sales-pricing | Yes (infrastructure) | 0 agents | **Mock** |
| risk-radar | Yes (ChatProvider) | 0 agents | **Mock** |
| data-sync | Yes (hardcoded) | 0 agents | **Mock** |
| promotion-control | No | 0 agents | **N/A** |

---

## Recommendations

### Immediate Actions

1. **Update lyzr-registry.json** - sales-order agent IDs are in .env.local but registry shows null
2. **Create agents for mock apps** - customer-lifecycle, sales-pricing, risk-radar, data-sync need real agents
3. **Centralize agent management** - Move all agent configs to `packages/agents/`

### Proposed Centralized Structure

```
packages/agents/
├── src/
│   ├── registry.ts           # Central agent registry
│   ├── config/
│   │   ├── compliance-qa.ts  # App-specific configs
│   │   ├── e-learning.ts
│   │   ├── sales-order.ts
│   │   └── ...
│   ├── hooks/
│   │   └── useAgent.ts       # Shared hook for agent access
│   └── types.ts              # Agent type definitions
├── scripts/
│   ├── setup-all.ts          # Setup all agents
│   ├── validate.ts           # Validate agent configs
│   └── sync-registry.ts      # Sync IDs to registry
└── package.json
```

### Agent Creation Priority

| Priority | App | Agents Needed | Effort |
|----------|-----|---------------|--------|
| 1 | sales-pricing | 1 (Pricing Assistant) | Low |
| 2 | risk-radar | 1 (Risk Assistant) | Low |
| 3 | customer-lifecycle | 2 (Insights + Recommendations) | Medium |
| 4 | data-sync | 1 (Sync Assistant) | Low |
| 5 | promotion-control | 1 (Optional NLQ) | Low |

---

## Environment Variables Reference

### Production Apps

**compliance-qa:**
```env
NEXT_PUBLIC_LYZR_AGENT_ID=696108ed5e0239738a838cd8
NEXT_PUBLIC_LYZR_API_KEY=sk-default-...
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=696108f75e0239738a838cdf
NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=69613776c57d451439d4c8f4
NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=69613777c57d451439d4c8f5
LYZR_KB_ID=6960a63fee18986913060bc0
LYZR_LEGAL_KB_ID=69613775979041509ac8ee82
```

**e-learning:**
```env
NEXT_PUBLIC_LYZR_AGENT_ID=6961ba6bd09b5523633454d5
NEXT_PUBLIC_LYZR_API_KEY=sk-default-...
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=6961ba6bd09b5523633454d6
LYZR_COURSE_OUTLINE_AGENT_ID=6960efc45e0239738a838056
LYZR_MODULE_CONTENT_AGENT_ID=6960efcf5e0239738a838072
LYZR_LESSON_GENERATOR_AGENT_ID=6960f136c57d451439d4b4a1
LYZR_QUIZ_GENERATOR_AGENT_ID=6960f1445e0239738a8383b9
```

**sales-order:**
```env
LYZR_API_KEY=sk-default-...
EXTRACTION_AGENT_ID=69613126c57d451439d4c4e4
VALIDATION_AGENT_ID=69613126c57d451439d4c4e5
```

### Mock Apps (Need Configuration)

**customer-lifecycle, sales-pricing, risk-radar, data-sync:**
```env
NEXT_PUBLIC_LYZR_AGENT_ID=<TO_BE_CREATED>
NEXT_PUBLIC_LYZR_API_KEY=<API_KEY>
```
