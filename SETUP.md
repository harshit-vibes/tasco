# Setup Guide

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.42
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone and Install

```bash
git clone https://github.com/harshit-vibes/tasco.git
cd tasco
git checkout dev
bun install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
LYZR_API_KEY=your_lyzr_api_key_here
```

### 3. Start DynamoDB Local

```bash
# Start Docker Desktop first, then:
docker compose up -d dynamodb-local dynamodb-admin

# Initialize tables
docker compose up dynamodb-init

# Verify
open http://localhost:8001  # DynamoDB Admin UI
```

### 4. Run an App

```bash
# Tier 1 - Tasco Group (Priority)
bun run dev --filter=@tasco/tasco-group-compliance-qa

# Or from app directory
cd apps/tasco-group/compliance-qa && bun dev
```

App runs at: http://localhost:3000

### Available Apps

| Priority | Command |
|----------|---------|
| Tier 1 | `bun run dev --filter=@tasco/tasco-group-compliance-qa` |
| Tier 1 | `bun run dev --filter=@tasco/tasco-group-finance-consolidation` |
| Tier 2 | `bun run dev --filter=@tasco/tasco-auto-customer-lifecycle` |
| Tier 2 | `bun run dev --filter=@tasco/carpla-service-center` |
| Tier 2 | `bun run dev --filter=@tasco/tasco-insurance-e-learning` |
| Tier 2 | `bun run dev --filter=@tasco/inochi-sales-order` |

---

## Production (AWS Amplify)

### 1. Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **New app** > **Host web app**
3. Connect GitHub repository: `harshit-vibes/tasco`
4. Select branch: `prod`

### 2. Configure Build Settings

In Amplify Console > Build settings, use the `amplify.yml` from the repo.

**Required Environment Variables** (set in Amplify Console):

| Variable | Value | Example |
|----------|-------|---------|
| `APP_NAME` | Package name | `@tasco/tasco-group-compliance-qa` |
| `APP_PATH` | App path | `tasco-group/compliance-qa` |
| `LYZR_API_KEY` | Your Lyzr API key | `lyzr_xxx` |
| `AWS_REGION` | DynamoDB region | `ap-southeast-1` |

### 3. Deploy Multiple Apps

Create separate Amplify apps for each demo:

| App | APP_NAME | APP_PATH |
|-----|----------|----------|
| Compliance QA | `@tasco/tasco-group-compliance-qa` | `tasco-group/compliance-qa` |
| Finance | `@tasco/tasco-group-finance-consolidation` | `tasco-group/finance-consolidation` |
| Customer Lifecycle | `@tasco/tasco-auto-customer-lifecycle` | `tasco-auto/customer-lifecycle` |
| Service Center | `@tasco/carpla-service-center` | `carpla/service-center` |
| E-Learning | `@tasco/tasco-insurance-e-learning` | `tasco-insurance/e-learning` |
| Sales Order | `@tasco/inochi-sales-order` | `inochi/sales-order` |

### 4. DynamoDB (Production)

Create tables in AWS DynamoDB Console:

```bash
# Sessions table
aws dynamodb create-table \
  --table-name Sessions \
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1

# Messages table
aws dynamodb create-table \
  --table-name Messages \
  --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=sessionId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

### 5. IAM Permissions

Amplify service role needs DynamoDB access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:ap-southeast-1:*:table/*"
    }
  ]
}
```

---

## Git Workflow

```
feature/xxx  →  dev  →  prod
                 ↓        ↓
              Local    AWS Amplify
```

### Development Flow

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/my-feature

# 2. Make changes and test locally
bun run dev --filter=@tasco/tasco-group-compliance-qa

# 3. Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# 4. Create PR: feature/xxx → dev
# 5. After merge, test on dev branch locally

# 6. When ready for production:
git checkout prod
git merge dev
git push origin prod
# Amplify auto-deploys on prod push
```

---

## Troubleshooting

### Docker Issues

```bash
# Check if Docker is running
docker info

# Reset DynamoDB data
docker compose down -v
docker compose up -d dynamodb-local
```

### Bun Issues

```bash
# Clear cache
rm -rf node_modules bun.lockb
bun install
```

### Build Errors

```bash
# Build specific app
bun run build --filter=@tasco/tasco-group-compliance-qa

# Check for TypeScript errors
bun run lint
```
