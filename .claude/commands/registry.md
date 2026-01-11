# Lyzr Registry

View and manage the Lyzr agents and knowledge bases registry.

## Registry Location

`lyzr-registry.json` at repo root.

## Quick Commands

```bash
# List all agents
bun scripts/registry.ts list agents

# List all KBs
bun scripts/registry.ts list kbs

# Get specific agent
bun scripts/registry.ts get compliance-qa main

# Update agent field
bun scripts/registry.ts update compliance-qa main model gpt-4o

# Sync from live Lyzr API
bun scripts/registry.ts sync

# Generate .env.local for an app
bun scripts/registry.ts env compliance-qa
```

## Registry Structure

```json
{
  "agents": {
    "<app-name>": {
      "<agent-key>": {
        "id": "lyzr-agent-id",
        "name": "Display Name",
        "role": "main|orchestrator|expert|validator",
        "model": "gpt-4o-mini",
        "connectedKBs": ["kb-key"],
        "envVar": "NEXT_PUBLIC_LYZR_AGENT_ID"
      }
    }
  },
  "knowledgeBases": {
    "<kb-key>": {
      "id": "lyzr-kb-id",
      "name": "kb-name",
      "app": "app-name",
      "connectedAgents": ["agent-key"],
      "envVar": "LYZR_KB_ID"
    }
  }
}
```

## When to Update Registry

1. After creating a new agent → Add entry or update `id`
2. After creating a new KB → Add entry with `id`
3. After connecting KB to agent → Update both `connectedKBs` and `connectedAgents`
4. After changing model → Update `model` field
5. After syncing documents → Update `documentCount`

## Programmatic Access

```typescript
import registry from "../../lyzr-registry.json";

// Get agent ID
const agentId = registry.agents["compliance-qa"]["main"].id;

// Get KB ID
const kbId = registry.knowledgeBases["legal-kb"].id;

// Get env var name
const envVar = registry.agents["compliance-qa"]["main"].envVar;
```
