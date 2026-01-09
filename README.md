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

## 8 Apps (1 per Proposal)

| Code | App | Proposal | Business Unit | Type |
|------|-----|----------|---------------|------|
| G1 | compliance-qa | Compliance & Document Governance | Tasco Group | LLM |
| TA1 | customer-lifecycle | Customer Lifecycle Management | Tasco Auto | Pivot |
| INS2 | sales-pricing | AI Sales & Pricing Cockpit | Tasco Insurance | Pivot |
| INS3 | e-learning | AI E-Learning Factory | Tasco Insurance | LLM |
| INS4 | risk-radar | AI Risk & Profitability Radar | Tasco Insurance | Pivot |
| INC1 | sales-order | Order Data Entry Automation | Inochi | LLM |
| INC2 | data-sync | Sales & Revenue Data Sync | Inochi | Pivot |
| INC4 | promotion-control | Promotion Overlap Control | Inochi | Pivot |

**LLM-Native (3):** G1, INS3, INC1
**Pivot (5):** TA1, INS2, INS4, INC2, INC4

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

## Structure

```
tasco/
├── apps/                        # 8 demo applications (flat structure)
│   ├── compliance-qa/           # G1 - Tasco Group
│   ├── customer-lifecycle/      # TA1 - Tasco Auto
│   ├── sales-pricing/           # INS2 - Tasco Insurance
│   ├── e-learning/              # INS3 - Tasco Insurance
│   ├── risk-radar/              # INS4 - Tasco Insurance
│   ├── sales-order/             # INC1 - Inochi
│   ├── data-sync/               # INC2 - Inochi
│   └── promotion-control/       # INC4 - Inochi
├── packages/                    # Shared packages
│   ├── ui/                      # shadcn components
│   ├── db/                      # DynamoDB client
│   ├── lyzr/                    # Lyzr SDK wrapper
│   └── config/                  # Shared configs
├── docker/                      # Docker setup
├── scripts/                     # AWS deployment scripts
└── docs/                        # Documentation
```

## Challenge Mapping

21 original challenges have been mapped to 8 submitted proposals:
- **6 direct matches** - Challenges with 1:1 proposal mapping
- **2 NEW proposals** - INC2, INC4 (not in original 21)
- **15 stale challenges** - Mapped to closest proposal

| App | Challenges Mapped |
|-----|-------------------|
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

# 2. Start DynamoDB Local
docker compose up -d dynamodb-local dynamodb-admin

# 3. Run an app
bun run dev --filter=@tasco/compliance-qa

# DynamoDB Admin UI
open http://localhost:8001
```

## Production (AWS)

```bash
# 1. Setup AWS infrastructure (DynamoDB tables + IAM)
./scripts/setup-aws.sh

# 2. Deploy all apps to Amplify
./scripts/deploy-priority-apps.sh

# Or deploy a single app
./scripts/create-amplify-app.sh compliance-qa apps/compliance-qa
```

| Branch | Environment |
|--------|-------------|
| `dev` | Local Docker only |
| `prod` | AWS Amplify (auto-deploy) |

See [SETUP.md](SETUP.md) for detailed instructions.

## Documentation

- [Proposal to Challenge Mapping](docs/mapping.md) - How 21 challenges map to 8 proposals
- [Proposals](docs/) - All 8 submitted proposals (proposal1.md - proposal8.md)
- [Challenge Details](docs/challenges/) - Individual problem statements by business unit
- [Lyzr Fit Analysis](docs/lyzr-fit.md) - LLM vs non-LLM classification
