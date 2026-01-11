#!/bin/bash
# Create Lyzr Agent via curl
#
# Usage:
#   ./scripts/create-agent.sh "Agent Name" "System prompt" [model] [temperature] [json_output]
#   ./scripts/create-agent.sh "Agent Name" @path/to/prompt.txt
#
# Arguments:
#   $1 - Agent name (required)
#   $2 - System prompt or @filepath (required)
#   $3 - Model (default: gpt-4o-mini)
#   $4 - Temperature (default: 0.7)
#   $5 - JSON output: true/false (default: false)
#
# Examples:
#   ./scripts/create-agent.sh "My Assistant" "You are a helpful assistant"
#   ./scripts/create-agent.sh "Validator" @apps/compliance-qa/validation-agent-prompt.txt gpt-4o-mini 0.1 true

set -e

# Configuration
BASE_URL="https://agent-prod.studio.lyzr.ai"
API_KEY="${LYZR_API_KEY:-${NEXT_PUBLIC_LYZR_API_KEY}}"

# Load from .env.local if not set
if [ -z "$API_KEY" ]; then
    if [ -f "apps/compliance-qa/.env.local" ]; then
        API_KEY=$(grep NEXT_PUBLIC_LYZR_API_KEY apps/compliance-qa/.env.local | cut -d= -f2)
    fi
fi

if [ -z "$API_KEY" ]; then
    echo "Error: No API key found. Set LYZR_API_KEY or NEXT_PUBLIC_LYZR_API_KEY"
    exit 1
fi

# Arguments
NAME="${1:-Test Agent}"
PROMPT="${2:-You are a helpful assistant.}"

# If prompt starts with @, read from file
if [[ "$PROMPT" == @* ]]; then
    PROMPT_FILE="${PROMPT:1}"
    if [ ! -f "$PROMPT_FILE" ]; then
        echo "Error: Prompt file not found: $PROMPT_FILE"
        exit 1
    fi
    PROMPT=$(cat "$PROMPT_FILE")
fi

# Optional arguments
MODEL="${3:-gpt-4o-mini}"
TEMPERATURE="${4:-0.7}"
JSON_OUTPUT="${5:-false}"

echo "Creating agent: $NAME"
echo "  Model: $MODEL"
echo "  Temperature: $TEMPERATURE"
echo "  JSON Output: $JSON_OUTPUT"
echo ""

# Build response_format if JSON output requested
if [ "$JSON_OUTPUT" = "true" ] || [ "$JSON_OUTPUT" = "1" ]; then
    RESPONSE_FORMAT='"response_format": {"type": "json_object"},'
else
    RESPONSE_FORMAT=""
fi

# Create agent
RESPONSE=$(curl -s -X POST "${BASE_URL}/v3/agents/" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d @- << EOF
{
  "name": "$NAME",
  "description": "Agent: $NAME",
  "agent_instructions": $(echo "$PROMPT" | jq -Rs .),
  "provider_id": "openai",
  "model": "$MODEL",
  "temperature": $TEMPERATURE,
  "top_p": 0.9,
  ${RESPONSE_FORMAT}
  "features": [],
  "tools": [],
  "store_messages": true
}
EOF
)

# Extract agent_id
AGENT_ID=$(echo "$RESPONSE" | jq -r '.agent_id // .id // empty')

if [ -n "$AGENT_ID" ]; then
    echo "✅ Agent created successfully!"
    echo ""
    echo "Agent ID: $AGENT_ID"
    echo ""
    echo "Add to .env.local:"
    echo "NEXT_PUBLIC_LYZR_AGENT_ID=$AGENT_ID"
else
    echo "❌ Error creating agent:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    exit 1
fi
