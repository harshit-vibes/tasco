#!/bin/bash

ENDPOINT="http://dynamodb-local:8000"

echo "Waiting for DynamoDB Local to be ready..."
sleep 5

echo "Creating tables..."

# Conversations table - for chat conversations
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name tasco-conversations \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "tasco-conversations table already exists"

# Messages table - for chat messages
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name tasco-messages \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "tasco-messages table already exists"

# Documents table - for knowledge base documents (legacy)
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name Documents \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "Documents table already exists"

echo "Listing tables..."
aws dynamodb list-tables --endpoint-url $ENDPOINT

echo "DynamoDB initialization complete!"
