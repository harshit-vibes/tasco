# Tasco Innovation Day Demos

> Bun + Next.js 15 monorepo with 8 AI demo applications for Tasco Group

## Quick Start

```bash
# Install dependencies
bun install

# Run a specific app
bun run dev --filter=@tasco/compliance-qa

# Run with DynamoDB Local
docker compose up -d dynamodb-local
bun run dev --filter=@tasco/compliance-qa
```

## Applications Overview

| Code | App | Business Unit | Type | Port | PRD |
|------|-----|---------------|------|------|-----|
| G1 | [compliance-qa](#g1-compliance-qa) | Tasco Group | LLM | 3001 | [PRD](apps/compliance-qa/PRD.md) |
| TA1 | [customer-lifecycle](#ta1-customer-lifecycle) | Tasco Auto | Pivot | 3002 | [PRD](apps/customer-lifecycle/PRD.md) |
| INS2 | [sales-pricing](#ins2-sales-pricing) | Tasco Insurance | Pivot | 3003 | [PRD](apps/sales-pricing/PRD.md) |
| INS3 | [e-learning](#ins3-e-learning) | Tasco Insurance | LLM | 3004 | [PRD](apps/e-learning/PRD.md) |
| INS4 | [risk-radar](#ins4-risk-radar) | Tasco Insurance | Pivot | 3005 | [PRD](apps/risk-radar/PRD.md) |
| INC1 | [sales-order](#inc1-sales-order) | Inochi | LLM | 3006 | [PRD](apps/sales-order/PRD.md) |
| INC2 | [data-sync](#inc2-data-sync) | Inochi | Pivot | 3007 | [PRD](apps/data-sync/PRD.md) |
| INC4 | [promotion-control](#inc4-promotion-control) | Inochi | Pivot | 3008 | [PRD](apps/promotion-control/PRD.md) |

**LLM-Native (3):** G1, INS3, INC1 | **Pivot (5):** TA1, INS2, INS4, INC2, INC4

---

## Application PRDs

### G1: Compliance QA

> **AI Compliance & Document Governance** | Tasco Group | LLM-Native

**Problem:** 4-person legal team manages 150-200 subsidiaries. Current OpenAI/GPT solution gives inconsistent results - same query returns different answers.

**Solution:** Deterministic RAG-powered Q&A with source-grounded citations.

| Key Feature | Description |
|-------------|-------------|
| Deterministic Responses | Temperature=0 retrieval ensures consistent answers |
| Source Citations | Every response includes document name, page, and quote |
| Multi-Entity Support | Governance across 150-200 subsidiary companies |
| Bilingual | Vietnamese and English language support |

```bash
bun run dev --filter=@tasco/compliance-qa
# http://localhost:3001
```

[Full PRD](apps/compliance-qa/PRD.md)

---

### TA1: Customer Lifecycle

> **Customer Lifecycle Management** | Tasco Auto | Pivot

**Problem:** Customer data fragmented across Excel, DMS, service records, and Zalo. Sales reps leave and take customer relationships with them.

**Solution:** 360-degree customer profile with AI-powered insights.

| Key Feature | Description |
|-------------|-------------|
| Unified Profile | Single view across all customer touchpoints |
| Relationship Protection | Data persists when employees leave |
| Lead-to-Lifecycle | Full journey from social media to resale |
| AI Insights | Natural language queries on customer data |

```bash
bun run dev --filter=@tasco/customer-lifecycle
# http://localhost:3002
```

[Full PRD](apps/customer-lifecycle/PRD.md)

---

### INS2: Sales Pricing

> **AI Sales & Pricing Cockpit** | Tasco Insurance | Pivot

**Problem:** Excel-based quotation takes 5-10 minutes per vehicle. Slow response loses sales. 10% higher loss ratio than market average.

**Solution:** Instant quote generation with AI pricing recommendations.

| Key Feature | Description |
|-------------|-------------|
| Instant Quotes | < 1 minute vs 5-10 minutes with Excel |
| Risk-Based Pricing | AI recommendations based on vehicle/customer data |
| Knowledge Base | RAG answers pricing policy questions |
| Human-in-Loop | AI suggests, human decides |

```bash
bun run dev --filter=@tasco/sales-pricing
# http://localhost:3003
```

[Full PRD](apps/sales-pricing/PRD.md)

---

### INS3: E-Learning

> **AI E-Learning Factory** | Tasco Insurance | LLM-Native

**Problem:** 1,000+ personnel across 33 branches. Thin pool of qualified trainers. Inconsistent classroom-based training quality.

**Solution:** AI-powered learning platform with product knowledge Q&A.

| Key Feature | Description |
|-------------|-------------|
| 24/7 Product Q&A | RAG bot answers insurance questions instantly |
| Scalable Content | AI converts PowerPoints to interactive learning |
| Consistent Delivery | Standardized training across 33 branches |
| Progress Tracking | Manager visibility into team readiness |

```bash
bun run dev --filter=@tasco/e-learning
# http://localhost:3004
```

[Full PRD](apps/e-learning/PRD.md)

---

### INS4: Risk Radar

> **AI Risk & Profitability Radar** | Tasco Insurance | Pivot

**Problem:** Delayed Excel reports. Data fragmented across core insurance, accounting, and CRM. No real-time visibility into risk exposure.

**Solution:** Real-time risk dashboard with AI anomaly detection.

| Key Feature | Description |
|-------------|-------------|
| Live Dashboard | Replaces delayed manual Excel reports |
| Anomaly Detection | Early warning for loss ratio spikes |
| NL Insights | Query risk data conversationally |
| Multi-Dimensional | Analysis by region, product, segment, time |

```bash
bun run dev --filter=@tasco/risk-radar
# http://localhost:3005
```

[Full PRD](apps/risk-radar/PRD.md)

---

### INC1: Sales Order

> **Order Data Entry Automation** | Inochi | LLM-Native

**Problem:** Manual order entry from PDFs/images into Bravo ERP. 95% of orders come in non-standard formats. Missing fields require manual lookup.

**Solution:** AI-powered document extraction with human validation.

| Key Feature | Description |
|-------------|-------------|
| Multi-Format OCR | Extract from PDF, images, emails, Zalo |
| Field Mapping | Auto-map to Bravo ERP required fields |
| Human Validation | Review interface before system entry |
| 50% Efficiency | Clear ROI target for time savings |

```bash
bun run dev --filter=@tasco/sales-order
# http://localhost:3006
```

[Full PRD](apps/sales-order/PRD.md)

---

### INC2: Data Sync

> **Sales & Revenue Data Synchronization** | Inochi | Pivot

**Problem:** Haravan (sales), Shopee, Website, Fulfillment, and Bravo (ERP) not synchronized. Manual updates cause daily delays and data discrepancies.

**Solution:** Real-time multi-system sync with AI discrepancy detection.

| Key Feature | Description |
|-------------|-------------|
| Multi-System Sync | Connect 5+ platforms in real-time |
| Discrepancy Detection | AI identifies data mismatches |
| Proactive Alerts | Notify before issues impact operations |
| NL Queries | "Why is order #12345 missing in Bravo?" |

```bash
bun run dev --filter=@tasco/data-sync
# http://localhost:3007
```

[Full PRD](apps/data-sync/PRD.md)

---

### INC4: Promotion Control

> **Promotion Overlap Control** | Inochi | Pivot

**Problem:** Cannot track promotion effectiveness and overlap. Excel/email management causes errors. Overlap between customers, products, and time periods.

**Solution:** AI rules engine for promotion conflict detection.

| Key Feature | Description |
|-------------|-------------|
| Overlap Detection | AI identifies conflicting promotions |
| Proactive Alerts | Notify before promotions go live |
| Calendar View | Timeline of all promotions by segment |
| Auto Reports | Daily/weekly promotion summaries |

```bash
bun run dev --filter=@tasco/promotion-control
# http://localhost:3008
```

[Full PRD](apps/promotion-control/PRD.md)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Bun |
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Database | DynamoDB (Local for dev, AWS for prod) |
| AI | Lyzr SDK |
| Hosting | AWS Amplify |

## Project Structure

```
tasco/
├── apps/                        # 8 demo applications
│   ├── compliance-qa/           # G1 - Tasco Group
│   ├── customer-lifecycle/      # TA1 - Tasco Auto
│   ├── sales-pricing/           # INS2 - Tasco Insurance
│   ├── e-learning/              # INS3 - Tasco Insurance
│   ├── risk-radar/              # INS4 - Tasco Insurance
│   ├── sales-order/             # INC1 - Inochi
│   ├── data-sync/               # INC2 - Inochi
│   └── promotion-control/       # INC4 - Inochi
├── packages/                    # Shared packages
│   ├── ui/                      # shadcn components + icons
│   ├── db/                      # DynamoDB client + chat persistence
│   ├── lyzr/                    # Lyzr SDK wrapper + hooks
│   ├── api/                     # Shared API handlers
│   └── config/                  # Shared configs
├── docs/                        # Documentation
│   ├── mapping.md               # Challenge to proposal mapping
│   └── proposal[1-8].md         # Original proposals
└── scripts/                     # AWS deployment scripts
```

## Challenge Mapping

21 original challenges mapped to 8 submitted proposals:

| App | Challenges Addressed |
|-----|---------------------|
| compliance-qa | Compliance Governance, Finance Consolidation |
| customer-lifecycle | Customer Lifecycle, Inventory, Carpla Fleet, DNP Sales, Thang Long |
| sales-pricing | Sales & Pricing, Damage Assessment, Underwriting |
| e-learning | E-Learning, Service Center Quality, Moto Chatbot |
| risk-radar | Risk Radar, Accounting, Leakage, Energy |
| sales-order | Order Entry, CV Inventory, Elevation Scanner |
| data-sync | Data Sync, GIS Standardization |
| promotion-control | Promotion Control |

See [docs/mapping.md](docs/mapping.md) for complete mapping details.

## Local Development

```bash
# 1. Install dependencies
bun install

# 2. Start DynamoDB Local (optional)
docker compose up -d dynamodb-local dynamodb-admin

# 3. Run an app
bun run dev --filter=@tasco/compliance-qa

# DynamoDB Admin UI
open http://localhost:8001
```

## Production (AWS)

```bash
# 1. Setup AWS infrastructure
./scripts/setup-aws.sh

# 2. Deploy all apps
./scripts/deploy-priority-apps.sh

# Or deploy a single app
./scripts/create-amplify-app.sh compliance-qa apps/compliance-qa
```

| Branch | Environment |
|--------|-------------|
| `dev` | Development (no auto-deploy) |
| `prod` | AWS Amplify (auto-deploy) |

## Documentation

- [Challenge Mapping](docs/mapping.md) - How 21 challenges map to 8 proposals
- [Proposals](docs/) - All 8 submitted proposals (proposal1.md - proposal8.md)
