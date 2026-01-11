# Run App

Start a development server for a specific app.

## Arguments
- `app`: App name (e.g., compliance-qa, e-learning)

## Instructions

```bash
# Option 1: Using Turborepo filter
bun run dev --filter=@tasco/{app}

# Option 2: Direct from app directory
cd apps/{app} && bun dev
```

## Available Apps

| App | Package | Port |
|-----|---------|------|
| compliance-qa | @tasco/compliance-qa | 3001 |
| customer-lifecycle | @tasco/customer-lifecycle | 3001 |
| sales-pricing | @tasco/sales-pricing | 3001 |
| e-learning | @tasco/e-learning | 3001 |
| risk-radar | @tasco/risk-radar | 3001 |
| sales-order | @tasco/sales-order | 3001 |
| data-sync | @tasco/data-sync | 3001 |
| promotion-control | @tasco/promotion-control | 3001 |

## Environment

Make sure `.env.local` exists in the app directory or root with:
- `LYZR_API_KEY` - Lyzr API key
- `NEXT_PUBLIC_LYZR_AGENT_ID` - Agent ID for the app
- `NEXT_PUBLIC_AWS_REGION` - AWS region (ap-southeast-1)
