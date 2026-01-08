#!/bin/bash

ENDPOINT="http://dynamodb-local:8000"

echo "Waiting for DynamoDB Local to be ready..."
sleep 5

echo "Creating tables..."

# Sessions table - for chat sessions
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name Sessions \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "Sessions table already exists"

# Messages table - for chat messages
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name Messages \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "Messages table already exists"

# Documents table - for knowledge base documents
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
