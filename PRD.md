# Tasco Innovation Day - Product Requirements Document

> 8 AI-powered demo applications for Tasco Group business units

---

## Overview

**Project:** Tasco Innovation Day Demos
**Client:** Tasco Group (Vietnam)
**Partner:** Lyzr AI
**Timeline:** 2026

### Objective

Build 8 functional AI demo applications showcasing Lyzr's agent capabilities across Tasco Group's business units. Each app addresses a specific business challenge submitted through the Vietnam Innovation Day program.

---

## Business Context

### About Tasco Group

Tasco Group is a diversified Vietnamese conglomerate with operations in:
- **Automotive** - Vehicle sales, service, and financing
- **Insurance** - Non-life insurance (motor, property, liability)
- **Consumer Goods** - Household products (Inochi brand)
- **Infrastructure** - Water, energy, construction

### Innovation Day Program

Tasco partnered with startups to solve real operational challenges using AI. Lyzr was selected to address 8 challenges across 4 business units.

---

## 8 Applications

| Code | App | Business Unit | Type | Port |
|------|-----|---------------|------|------|
| G1 | compliance-qa | Tasco Group | LLM | 3001 |
| TA1 | customer-lifecycle | Tasco Auto | Pivot | 3002 |
| INS2 | sales-pricing | Tasco Insurance | Pivot | 3003 |
| INS3 | e-learning | Tasco Insurance | LLM | 3004 |
| INS4 | risk-radar | Tasco Insurance | Pivot | 3005 |
| INC1 | sales-order | Inochi | LLM | 3006 |
| INC2 | data-sync | Inochi | Pivot | 3007 |
| INC4 | promotion-control | Inochi | Pivot | 3008 |

### Lyzr Fit Classification

- **LLM (3):** G1, INS3, INC1 - Core LLM/RAG use cases
- **Pivot (5):** TA1, INS2, INS4, INC2, INC4 - Data/ML challenges with LLM overlay

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Database | AWS DynamoDB |
| AI/Agents | Lyzr SDK |
| Hosting | AWS Amplify |

---

## Shared Packages

| Package | Purpose |
|---------|---------|
| `@tasco/ui` | shadcn/ui components |
| `@tasco/db` | DynamoDB client |
| `@tasco/lyzr` | Lyzr SDK wrapper |
| `@tasco/config` | Shared configs |

---

## User Personas

### Primary Users

1. **Business Users** - Tasco employees using the demos
2. **Executives** - Decision makers evaluating the solutions
3. **Innovation Team** - Tasco team coordinating the program

### Demo Audience

- Vietnam Innovation Day judges
- Tasco Group leadership
- Potential investors/partners

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Demo completion | All 8 apps functional |
| Response time | < 3 seconds for AI responses |
| Uptime | 99% during demo period |
| User feedback | Positive from Tasco team |

---

## Constraints

- **Timeline:** Demo-ready for Innovation Day 2026
- **Budget:** TBD per proposal
- **Data:** Use sample/synthetic data for demos
- **Language:** UI in English, content may include Vietnamese

---

## Risk Factors

| Risk | Mitigation |
|------|------------|
| Data availability | Use synthetic demo data |
| Integration complexity | Focus on standalone demos |
| Timeline pressure | Prioritize LLM-native apps |

---

## Documentation

- [Challenge Mapping](docs/mapping.md) - How challenges map to apps
- [Proposals](docs/) - Original proposal documents
- [Setup Guide](SETUP.md) - Development and deployment

---

## App PRDs

Each app has its own detailed PRD:

| App | PRD |
|-----|-----|
| compliance-qa | [apps/compliance-qa/PRD.md](apps/compliance-qa/PRD.md) |
| customer-lifecycle | [apps/customer-lifecycle/PRD.md](apps/customer-lifecycle/PRD.md) |
| sales-pricing | [apps/sales-pricing/PRD.md](apps/sales-pricing/PRD.md) |
| e-learning | [apps/e-learning/PRD.md](apps/e-learning/PRD.md) |
| risk-radar | [apps/risk-radar/PRD.md](apps/risk-radar/PRD.md) |
| sales-order | [apps/sales-order/PRD.md](apps/sales-order/PRD.md) |
| data-sync | [apps/data-sync/PRD.md](apps/data-sync/PRD.md) |
| promotion-control | [apps/promotion-control/PRD.md](apps/promotion-control/PRD.md) |
