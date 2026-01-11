# Tasco AWS Amplify Deployment Guide

This guide covers deploying the 8 Tasco demo apps to AWS Amplify with custom subdomains.

## Overview

| App | Subdomain | Description |
|-----|-----------|-------------|
| compliance-qa | compliance.tasco.app | Compliance & Document Governance |
| customer-lifecycle | customer.tasco.app | Customer Lifecycle Management |
| data-sync | sync.tasco.app | Sales & Revenue Data Sync |
| e-learning | elearning.tasco.app | AI E-Learning Factory |
| promotion-control | promotion.tasco.app | Promotion Overlap Control |
| risk-radar | risk.tasco.app | AI Risk & Profitability Radar |
| sales-order | orders.tasco.app | Order Data Entry Automation |
| sales-pricing | pricing.tasco.app | AI Sales & Pricing Cockpit |

## Prerequisites

1. AWS Account with Amplify access
2. Custom domain configured in Route 53 (or external DNS)
3. GitHub repository access
4. Lyzr API key from [Lyzr Studio](https://studio.lyzr.ai)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Amplify Hosting                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ compliance  │  │  customer   │  │    sync     │ ...    │
│  │   .tasco    │  │   .tasco    │  │   .tasco    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│         ▼                ▼                ▼                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Shared GitHub Repository                │   │
│  │           (tasco monorepo - dev branch)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      Shared Resources          │
              ├───────────────────────────────┤
              │  • AWS DynamoDB (tasco-*)     │
              │  • AWS S3 (tasco-compliance)  │
              │  • Lyzr Agents (16 active)    │
              │  • Lyzr Knowledge Bases (2)   │
              └───────────────────────────────┘
```

## Step 1: AWS Infrastructure Setup

Run the setup script to create DynamoDB tables and IAM roles:

```bash
./scripts/setup-aws.sh ap-southeast-1
```

This creates:
- DynamoDB tables: `tasco-conversations`, `tasco-messages`, `tasco-documents`, etc.
- S3 bucket: `tasco-compliance-docs` (with versioning)
- IAM role: `tasco-amplify-role`

## Step 2: Generate Environment Configurations

Run the env generator script to see required variables for each app:

```bash
# Show all apps
bun run scripts/generate-amplify-env.ts

# Show specific app
bun run scripts/generate-amplify-env.ts compliance-qa

# Output as JSON (for automation)
bun run scripts/generate-amplify-env.ts --json
```

## Step 3: Create Amplify Apps

For each of the 8 apps, create a new Amplify app:

### 3.1 Via AWS Console

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Select "GitHub" and authorize
4. Choose repository: `harshit-vibes/tasco`
5. Select branch: `dev`
6. **Important**: Amplify will auto-detect monorepo
7. Set build settings (uses `amplify.yml` from repo)

### 3.2 Via AWS CLI (Recommended)

```bash
# Create Amplify app for compliance-qa
aws amplify create-app \
  --name tasco-compliance \
  --repository https://github.com/harshit-vibes/tasco \
  --platform WEB \
  --iam-service-role-arn arn:aws:iam::ACCOUNT:role/tasco-amplify-role \
  --environment-variables '{
    "APP_NAME": "compliance-qa",
    "APP_PATH": "compliance-qa"
  }'

# Create branch
aws amplify create-branch \
  --app-id <app-id> \
  --branch-name dev
```

## Step 4: Configure Environment Variables

For each Amplify app, set the following environment variables in the Amplify Console:

### Shared Variables (Same for all apps)

| Variable | Value | Description |
|----------|-------|-------------|
| `LYZR_API_KEY` | `sk-xxx` | Lyzr API key (server-side) |
| `NEXT_PUBLIC_LYZR_API_KEY` | `sk-xxx` | Lyzr API key (client-side) |
| `NEXT_PUBLIC_AWS_REGION` | `ap-southeast-1` | AWS region |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID` | `AKIA...` | AWS access key |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | `xxx` | AWS secret key |

### App-Specific Variables

Each app requires its own agent IDs from the centralized registry:

#### compliance-qa
```
APP_NAME=compliance-qa
APP_PATH=compliance-qa
NEXT_PUBLIC_LYZR_AGENT_ID=696108ed5e0239738a838cd8
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=696108f75e0239738a838cdf
NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=69613776c57d451439d4c8f4
NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=69613777c57d451439d4c8f5
LYZR_KB_ID=6960a63fee18986913060bc0
LYZR_LEGAL_KB_ID=69613775979041509ac8ee82
```

#### e-learning
```
APP_NAME=e-learning
APP_PATH=e-learning
NEXT_PUBLIC_LYZR_AGENT_ID=6961ba6bd09b5523633454d5
LYZR_COURSE_OUTLINE_AGENT_ID=6960efc45e0239738a838056
LYZR_MODULE_CONTENT_AGENT_ID=6960efcf5e0239738a838072
```

#### sales-order
```
APP_NAME=sales-order
APP_PATH=sales-order
NEXT_PUBLIC_LYZR_AGENT_ID=69613126c57d451439d4c4e4
EXTRACTION_AGENT_ID=69613126c57d451439d4c4e4
VALIDATION_AGENT_ID=69613126c57d451439d4c4e5
```

#### customer-lifecycle
```
APP_NAME=customer-lifecycle
APP_PATH=customer-lifecycle
NEXT_PUBLIC_LYZR_AGENT_ID=69625ab1d09b552363346dd5
```

#### sales-pricing
```
APP_NAME=sales-pricing
APP_PATH=sales-pricing
NEXT_PUBLIC_LYZR_AGENT_ID=69625ab2d09b552363346dd6
```

#### risk-radar
```
APP_NAME=risk-radar
APP_PATH=risk-radar
NEXT_PUBLIC_LYZR_AGENT_ID=69625ab2d09b552363346dd7
```

#### data-sync
```
APP_NAME=data-sync
APP_PATH=data-sync
NEXT_PUBLIC_LYZR_AGENT_ID=69625ab3d09b552363346dd8
```

#### promotion-control
```
APP_NAME=promotion-control
APP_PATH=promotion-control
# No chat agent - rule-based conflict detection
```

## Step 5: Configure Custom Domain

### 5.1 Add Domain in Amplify

1. Go to each Amplify app → "Domain management"
2. Click "Add domain"
3. Enter your domain: `tasco.app`
4. Configure subdomain mapping

### 5.2 Subdomain Configuration

For each app, add the appropriate subdomain:

| App | Subdomain |
|-----|-----------|
| compliance-qa | `compliance` |
| customer-lifecycle | `customer` |
| data-sync | `sync` |
| e-learning | `elearning` |
| promotion-control | `promotion` |
| risk-radar | `risk` |
| sales-order | `orders` |
| sales-pricing | `pricing` |

### 5.3 DNS Configuration

If using Route 53:
- Amplify auto-creates CNAME records

If using external DNS:
- Add CNAME records pointing to Amplify CloudFront distribution

## Step 6: Deploy

### Automatic Deployment

Push to the `dev` branch triggers automatic deployment:

```bash
git checkout dev
git add .
git commit -m "feat: Update for production"
git push origin dev
```

### Manual Deployment

In Amplify Console:
1. Go to app → "Builds"
2. Click "Redeploy this version" or trigger new build

## Verification

After deployment, verify each app:

1. **URL Access**: https://compliance.tasco.app
2. **Agent Connection**: Test chat functionality
3. **Database**: Verify DynamoDB read/write
4. **KB Access**: Test document retrieval (compliance-qa)

## Troubleshooting

### Build Failures

Check build logs for:
- Missing environment variables
- Bun installation issues
- Package dependency problems

### Runtime Errors

1. Check browser console for API errors
2. Verify Lyzr API key is valid
3. Check AWS credentials have DynamoDB access

### Agent Not Responding

1. Verify agent ID is correct
2. Check Lyzr Studio for agent status
3. Confirm API key has access to the agent

## Environment Variable Reference

### Required for All Apps

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_NAME` | Yes | App filter name |
| `APP_PATH` | Yes | Directory under apps/ |
| `LYZR_API_KEY` | Yes | Server-side Lyzr API key |
| `NEXT_PUBLIC_LYZR_API_KEY` | Yes | Client-side Lyzr API key |
| `NEXT_PUBLIC_AWS_REGION` | Yes | AWS region |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |

### Agent Registry

All agent IDs are managed in the centralized registry:
- Source: `packages/agents/src/registry.ts`
- KB Source: `packages/agents/src/knowledge-bases.ts`

To view all agent IDs:
```bash
cd packages/agents && bun run list-agents
```

To view all KB IDs:
```bash
cd packages/agents && bun run list-kbs
```

## Cost Estimation

AWS Amplify pricing (per app):
- Build: $0.01/min
- Hosting: $0.15/GB served
- SSL: Free

Estimated monthly cost for 8 apps with moderate traffic: ~$50-100
