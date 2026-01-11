# Connect Knowledge Base to Agent

Connect a Lyzr Knowledge Base to an agent via the API.

## Arguments
- `agent_id`: The Lyzr agent ID
- `kb_id`: The Knowledge Base ID
- `top_k`: (optional) Number of results to retrieve, default 5

## Instructions

Use `@tasco/api` to connect:

```typescript
import { connectKnowledgeBase, getAgentKnowledgeBase } from "@tasco/api";

const config = { apiKey: process.env.LYZR_API_KEY };

// Connect KB
await connectKnowledgeBase(agentId, kbId, config, { top_k: 5 });

// Verify connection
const connectedKb = await getAgentKnowledgeBase(agentId, config);
console.log("Connected KB:", connectedKb);
```

## Notes

- KBs connect via `features` array with `type: "rag"`, not `rag_id` field
- `connectKnowledgeBase()` replaces any existing KB connection
- Use `addKnowledgeBase()` to add multiple KBs without removing existing ones
- Use `removeKnowledgeBase()` to remove a specific KB while keeping others
