#!/bin/bash

# Deploy all Tier 1 & 2 priority apps to AWS Amplify
# Usage: ./scripts/deploy-priority-apps.sh [region]

set -e

REGION="${1:-ap-southeast-1}"
SCRIPT_DIR="$(dirname "$0")"

echo "=========================================="
echo "Deploying Priority Apps to AWS Amplify"
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

# Tier 1 - Tasco Group HQ (Top Priority)
echo ""
echo "--- Tier 1: Tasco Group HQ ---"
"$SCRIPT_DIR/create-amplify-app.sh" "compliance-qa" "tasco-group/compliance-qa" "$REGION"
"$SCRIPT_DIR/create-amplify-app.sh" "finance-consolidation" "tasco-group/finance-consolidation" "$REGION"

# Tier 2 - Secondary Priority
echo ""
echo "--- Tier 2: Secondary Priority ---"
"$SCRIPT_DIR/create-amplify-app.sh" "customer-lifecycle" "tasco-auto/customer-lifecycle" "$REGION"
"$SCRIPT_DIR/create-amplify-app.sh" "service-center" "carpla/service-center" "$REGION"
"$SCRIPT_DIR/create-amplify-app.sh" "e-learning" "tasco-insurance/e-learning" "$REGION"
"$SCRIPT_DIR/create-amplify-app.sh" "sales-order" "inochi/sales-order" "$REGION"

echo ""
echo "=========================================="
echo "All Priority Apps Deployed!"
echo "=========================================="
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
