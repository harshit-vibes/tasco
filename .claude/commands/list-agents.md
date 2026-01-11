# List Lyzr Agents

List all agents associated with the Lyzr API key.

## Instructions

```typescript
import { listAgents } from "@tasco/api";

const config = { apiKey: process.env.LYZR_API_KEY };
const agents = await listAgents(config);

console.table(agents.map(a => ({
  id: a.agent_id,
  name: a.name,
  model: a.model,
  hasKB: a.features?.some(f => f.type === "rag") || false,
})));
```

## Quick Script

Create `scripts/list-agents.ts`:

```typescript
#!/usr/bin/env node
import { listAgents, getAgentKnowledgeBases } from "@tasco/api";

const apiKey = process.env.LYZR_API_KEY;
if (!apiKey) {
  console.error("LYZR_API_KEY required");
  process.exit(1);
}

const agents = await listAgents({ apiKey });

for (const agent of agents) {
  const kbs = await getAgentKnowledgeBases(agent.agent_id, { apiKey });
  console.log(`${agent.name}`);
  console.log(`  ID: ${agent.agent_id}`);
  console.log(`  Model: ${agent.model}`);
  console.log(`  KBs: ${kbs.length > 0 ? kbs.join(", ") : "none"}`);
  console.log();
}
```

Run with: `bun scripts/list-agents.ts`
