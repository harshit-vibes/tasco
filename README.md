# Tasco Innovation Day Demos

> Bun + Next.js 15 monorepo with 21 AI demo applications for Tasco Group

## Quick Start

```bash
# Install dependencies
bun install

# Run a specific app
bun run dev --filter=@tasco/tasco-group-compliance-qa

# Run with DynamoDB Local
docker-compose up -d dynamodb-local
bun run dev --filter=@tasco/tasco-group-compliance-qa
```

## Priority Strategy

| Tier | Business Units | Focus | Apps |
|------|----------------|-------|------|
| **Tier 1** | Tasco Group HQ | Win this account | 2 |
| **Tier 2** | Tasco Auto, Carpla, Insurance, Inochi | 1 demo each | 4 |
| **Tier 3** | Remaining challenges | Scaffolded | 10 |
| **Tier 4** | DNP Water, DNP Energy, Thang Long | No active dev | 5 |

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
├── apps/                    # 21 demo applications
│   ├── tasco-group/         # Tier 1 - Top Priority
│   │   ├── compliance-qa/
│   │   └── finance-consolidation/
│   ├── tasco-auto/          # Tier 2
│   ├── carpla/              # Tier 2
│   ├── tasco-insurance/     # Tier 2
│   ├── inochi/              # Tier 2
│   ├── dnp-holding/         # Tier 3
│   ├── dnp-water/           # Tier 4
│   ├── dnp-energy/          # Tier 4
│   └── thang-long/          # Tier 4
├── packages/                # Shared packages
│   ├── ui/                  # shadcn components
│   ├── db/                  # DynamoDB client
│   ├── lyzr/                # Lyzr SDK wrapper
│   └── config/              # Shared configs
├── docker/                  # Docker setup
└── docs/                    # Challenge documentation
```

## Apps by Business Unit

### Tier 1 - Tasco Group HQ (2 apps)

| App | Challenge | Type |
|-----|-----------|------|
| compliance-qa | Compliance Document Governance | LLM |
| finance-consolidation | Finance Consolidation | Pivot |

### Tier 2 - Secondary Priority (4 apps)

| Business Unit | App | Challenge | Type |
|---------------|-----|-----------|------|
| tasco-auto | customer-lifecycle | Customer Lifecycle Management | Pivot |
| carpla | service-center | Service Center Quality | LLM |
| tasco-insurance | e-learning | AI E-Learning Factory | LLM |
| inochi | sales-order | Sales Order Automation | LLM |

### Tier 3 & 4 - Scaffolded (15 apps)

See [docs/README.md](docs/README.md) for full challenge list.

## Local Development

```bash
# 1. Install dependencies
bun install

# 2. Start DynamoDB Local
docker compose up -d dynamodb-local dynamodb-admin

# 3. Run an app
bun run dev --filter=@tasco/tasco-group-compliance-qa

# DynamoDB Admin UI
open http://localhost:8001
```

## Production (AWS)

```bash
# 1. Setup AWS infrastructure (DynamoDB tables + IAM)
./scripts/setup-aws.sh

# 2. Deploy all priority apps to Amplify
./scripts/deploy-priority-apps.sh

# Or deploy a single app
./scripts/create-amplify-app.sh compliance-qa tasco-group/compliance-qa
```

| Branch | Environment |
|--------|-------------|
| `dev` | Local Docker only |
| `prod` | AWS Amplify (auto-deploy) |

See [SETUP.md](SETUP.md) for detailed instructions.

## Documentation

- [Challenge Index](docs/README.md) - All 21 challenges
- [Lyzr Fit Analysis](docs/lyzr-fit.md) - LLM vs non-LLM classification
- [Challenge Details](docs/challenges/) - Individual problem statements
