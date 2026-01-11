# Update Agent Model

Change the LLM model used by a Lyzr agent.

## Arguments
- `agent_id`: The Lyzr agent ID
- `model`: Model name (gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.)

## Instructions

```typescript
import { updateAgentModel } from "@tasco/api";

const config = { apiKey: process.env.LYZR_API_KEY };
await updateAgentModel(agentId, "gpt-4o", config);
```

## Available Models

| Model | Use Case | Cost |
|-------|----------|------|
| gpt-4o | High quality, complex tasks | Higher |
| gpt-4o-mini | Fast, cost-effective | Lower |
| gpt-4-turbo | Balance of quality/speed | Medium |

## Bulk Update Script

Update all agents for an app:

```typescript
#!/usr/bin/env node
import { listAgents, updateAgentModel } from "@tasco/api";

const MODEL = "gpt-4o-mini";
const apiKey = process.env.LYZR_API_KEY;
const config = { apiKey };

const agents = await listAgents(config);
const appAgents = agents.filter(a => a.name.includes("Tasco"));

for (const agent of appAgents) {
  console.log(`Updating ${agent.name} to ${MODEL}...`);
  await updateAgentModel(agent.agent_id, MODEL, config);
}

console.log("Done!");
```

## Notes

- Model changes take effect immediately
- No need to restart the app
- Consider cost implications when choosing models
