#!/bin/bash

# Create Amplify App via AWS CLI
# Usage: ./scripts/create-amplify-app.sh <app-name> <app-path> [region]
#
# Example:
#   ./scripts/create-amplify-app.sh compliance-qa tasco-group/compliance-qa

set -e

APP_NAME="${1}"
APP_PATH="${2}"
REGION="${3:-ap-southeast-1}"
GITHUB_REPO="https://github.com/harshit-vibes/tasco"
BRANCH="prod"

if [ -z "$APP_NAME" ] || [ -z "$APP_PATH" ]; then
    echo "Usage: $0 <app-name> <app-path> [region]"
    echo ""
    echo "Example:"
    echo "  $0 compliance-qa tasco-group/compliance-qa"
    echo "  $0 service-center carpla/service-center ap-southeast-1"
    echo ""
    echo "Available apps:"
    echo "  Tier 1 (Priority):"
    echo "    compliance-qa          tasco-group/compliance-qa"
    echo "    finance-consolidation  tasco-group/finance-consolidation"
    echo "  Tier 2:"
    echo "    customer-lifecycle     tasco-auto/customer-lifecycle"
    echo "    service-center         carpla/service-center"
    echo "    e-learning             tasco-insurance/e-learning"
    echo "    sales-order            inochi/sales-order"
    exit 1
fi

AMPLIFY_APP_NAME="tasco-${APP_NAME}"
PACKAGE_NAME="@tasco/${APP_PATH//\//-}"

echo "=========================================="
echo "Creating Amplify App: $AMPLIFY_APP_NAME"
echo "Package: $PACKAGE_NAME"
echo "Path: apps/$APP_PATH"
echo "Region: $REGION"
echo "=========================================="

# Get IAM role ARN
ROLE_ARN=$(aws iam get-role --role-name tasco-amplify-role --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Error: IAM role 'tasco-amplify-role' not found."
    echo "Run ./scripts/setup-aws.sh first"
    exit 1
fi

echo "Using IAM Role: $ROLE_ARN"

# Build spec for monorepo
BUILD_SPEC=$(cat << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - curl -fsSL https://bun.sh/install | bash
        - export BUN_INSTALL="$HOME/.bun"
        - export PATH="$BUN_INSTALL/bin:$PATH"
        - bun install
    build:
      commands:
        - export BUN_INSTALL="$HOME/.bun"
        - export PATH="$BUN_INSTALL/bin:$PATH"
        - bun run build --filter=${APP_NAME}
  artifacts:
    baseDirectory: apps/${APP_PATH}/.next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
EOF
)

# Replace placeholders
BUILD_SPEC="${BUILD_SPEC//\$\{APP_NAME\}/$PACKAGE_NAME}"
BUILD_SPEC="${BUILD_SPEC//\$\{APP_PATH\}/$APP_PATH}"

# Create Amplify app
echo ""
echo "Creating Amplify app..."
APP_ID=$(aws amplify create-app \
    --name "$AMPLIFY_APP_NAME" \
    --repository "$GITHUB_REPO" \
    --platform WEB \
    --iam-service-role-arn "$ROLE_ARN" \
    --environment-variables "APP_NAME=$PACKAGE_NAME,APP_PATH=$APP_PATH,AWS_REGION=$REGION" \
    --build-spec "$BUILD_SPEC" \
    --region $REGION \
    --query 'app.appId' \
    --output text 2>/dev/null) || {
    echo "Error creating app. It may already exist."
    echo "Check AWS Amplify Console: https://console.aws.amazon.com/amplify/"
    exit 1
}

echo "✓ App created: $APP_ID"

# Create branch
echo ""
echo "Creating branch: $BRANCH..."
aws amplify create-branch \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH" \
    --enable-auto-build \
    --region $REGION \
    2>/dev/null && echo "✓ Branch created" || echo "→ Branch may already exist"

# Get app URL
APP_URL="https://${BRANCH}.${APP_ID}.amplifyapp.com"

echo ""
echo "=========================================="
echo "Amplify App Created!"
echo "=========================================="
echo ""
echo "App ID: $APP_ID"
echo "App Name: $AMPLIFY_APP_NAME"
echo "Branch: $BRANCH"
echo "URL: $APP_URL"
echo ""
echo "Console: https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""
echo "Environment Variables to set in Console:"
echo "  LYZR_API_KEY=<your-lyzr-api-key>"
echo "  NEXT_PUBLIC_APP_URL=$APP_URL"
echo ""
echo "To trigger a build:"
echo "  git push origin prod"
echo ""
