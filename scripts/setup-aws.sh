#!/bin/bash

# Tasco AWS Production Setup Script
# Usage: ./scripts/setup-aws.sh [region]

set -e

REGION="${1:-ap-southeast-1}"
REPO_NAME="tasco"
GITHUB_REPO="https://github.com/harshit-vibes/tasco"

echo "=========================================="
echo "Tasco AWS Production Setup"
echo "Region: $REGION"
echo "=========================================="

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI not installed"
    exit 1
fi

# Check authentication
echo ""
echo "Checking AWS credentials..."
aws sts get-caller-identity || {
    echo "Error: AWS credentials not configured. Run 'aws configure'"
    exit 1
}

# ==========================================
# DynamoDB Tables
# ==========================================
echo ""
echo "=========================================="
echo "Creating DynamoDB Tables"
echo "=========================================="

# Sessions table
echo "Creating Sessions table..."
aws dynamodb create-table \
    --table-name tasco-sessions \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    2>/dev/null && echo "✓ Sessions table created" || echo "→ Sessions table already exists"

# Messages table
echo "Creating Messages table..."
aws dynamodb create-table \
    --table-name tasco-messages \
    --attribute-definitions \
        AttributeName=sessionId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=sessionId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    2>/dev/null && echo "✓ Messages table created" || echo "→ Messages table already exists"

# Documents table
echo "Creating Documents table..."
aws dynamodb create-table \
    --table-name tasco-documents \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    2>/dev/null && echo "✓ Documents table created" || echo "→ Documents table already exists"

echo ""
echo "Listing DynamoDB tables..."
aws dynamodb list-tables --region $REGION --query 'TableNames[?starts_with(@, `tasco-`)]'

# ==========================================
# IAM Role for Amplify
# ==========================================
echo ""
echo "=========================================="
echo "Creating IAM Role for Amplify"
echo "=========================================="

# Trust policy for Amplify
cat > /tmp/amplify-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "amplify.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# DynamoDB access policy
cat > /tmp/dynamodb-policy.json << 'EOF'
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
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/tasco-*"
      ]
    }
  ]
}
EOF

# Create role
echo "Creating IAM role: tasco-amplify-role..."
aws iam create-role \
    --role-name tasco-amplify-role \
    --assume-role-policy-document file:///tmp/amplify-trust-policy.json \
    2>/dev/null && echo "✓ Role created" || echo "→ Role already exists"

# Attach DynamoDB policy
echo "Attaching DynamoDB policy..."
aws iam put-role-policy \
    --role-name tasco-amplify-role \
    --policy-name tasco-dynamodb-access \
    --policy-document file:///tmp/dynamodb-policy.json \
    2>/dev/null && echo "✓ Policy attached" || echo "→ Policy already attached"

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name tasco-amplify-role --query 'Role.Arn' --output text 2>/dev/null || echo "")
echo "Role ARN: $ROLE_ARN"

# Cleanup temp files
rm -f /tmp/amplify-trust-policy.json /tmp/dynamodb-policy.json

# ==========================================
# Summary
# ==========================================
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "DynamoDB Tables Created:"
echo "  - tasco-sessions"
echo "  - tasco-messages"
echo "  - tasco-documents"
echo ""
echo "IAM Role: tasco-amplify-role"
echo "Role ARN: $ROLE_ARN"
echo ""
echo "Next Steps:"
echo "1. Create Amplify app in AWS Console"
echo "2. Connect GitHub repo: $GITHUB_REPO"
echo "3. Select branch: prod"
echo "4. Use role: tasco-amplify-role"
echo "5. Set environment variables (see SETUP.md)"
echo ""
