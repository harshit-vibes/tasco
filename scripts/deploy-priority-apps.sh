#!/bin/bash

# Deploy all 8 apps to AWS Amplify
# Usage: ./scripts/deploy-priority-apps.sh [region]

set -e

REGION="${1:-ap-southeast-1}"
SCRIPT_DIR="$(dirname "$0")"

echo "=========================================="
echo "Deploying 8 Apps to AWS Amplify"
echo "Region: $REGION"
echo "=========================================="

# First, run AWS setup
echo ""
echo "Step 1: Setting up AWS infrastructure..."
"$SCRIPT_DIR/setup-aws.sh" "$REGION"

echo ""
echo "=========================================="
echo "Step 2: Creating Amplify Apps"
echo "=========================================="

# All 8 apps (flat structure)
APPS=(
  "compliance-qa"
  "customer-lifecycle"
  "sales-pricing"
  "e-learning"
  "risk-radar"
  "sales-order"
  "data-sync"
  "promotion-control"
)

for APP in "${APPS[@]}"; do
  echo ""
  echo "--- Deploying: $APP ---"
  "$SCRIPT_DIR/create-amplify-app.sh" "$APP" "apps/$APP" "$REGION"
done

echo ""
echo "=========================================="
echo "All 8 Apps Deployed!"
echo "=========================================="
echo ""
echo "Apps deployed:"
for APP in "${APPS[@]}"; do
  echo "  - $APP"
done
echo ""
echo "Next Steps:"
echo "1. Go to AWS Amplify Console"
echo "2. Set LYZR_API_KEY environment variable for each app"
echo "3. Push to prod branch to trigger builds"
echo ""
echo "To trigger builds:"
echo "  git checkout prod"
echo "  git merge dev"
echo "  git push origin prod"
echo ""
