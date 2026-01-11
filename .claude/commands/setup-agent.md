# Setup Lyzr Agent

Create or configure a Lyzr agent for an app in this monorepo.

## Arguments
- `app`: The app name (e.g., compliance-qa, e-learning)
- `agent_type`: Type of agent (main, expert, validation)

## Instructions

1. Check if the app has existing agent setup in `apps/$app/scripts/`
2. If not, create a setup script based on `apps/compliance-qa/scripts/setup-agents.ts`
3. Use `@tasco/api` functions:
   - `getOrCreateAgent()` for idempotent creation
   - `connectKnowledgeBase()` to connect KBs
   - `updateAgentInstructions()` to set prompts

## Template

```typescript
import {
  getOrCreateAgent,
  connectKnowledgeBase,
  type AgentConfig,
  type AgentManagementConfig,
} from "@tasco/api";

const AGENT_CONFIG: AgentConfig = {
  name: "App Name Agent",
  system_prompt: `Your system prompt here...`,
  llm_params: {
    model: "gpt-4o-mini",
    temperature: 0.3,
  },
};

async function setup(apiKey: string) {
  const config: AgentManagementConfig = { apiKey };

  const { agent, created } = await getOrCreateAgent(AGENT_CONFIG, config);
  console.log(created ? "Created:" : "Found:", agent.agent_id);

  // Connect KB if needed
  if (kbId) {
    await connectKnowledgeBase(agent.agent_id, kbId, config);
  }

  return agent;
}
```

## Output

After creating the setup script:
1. Add script command to app's package.json
2. Output the agent ID for .env.local
3. Provide instructions for connecting to Lyzr Studio if needed
