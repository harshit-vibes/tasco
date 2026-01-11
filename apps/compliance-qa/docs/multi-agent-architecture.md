# Multi-Agent Orchestration Architecture

## Overview

Transform the compliance-qa app from a single-agent to a multi-agent system with specialized experts for different knowledge domains.

## Current State

```
User Query
    ↓
[Main Compliance Agent] ← Single KB (all documents)
    ↓
[Validation Agent] (response scoring)
    ↓
Response
```

**Current Agents:**
- Main Agent: `696108ed5e0239738a838cd8`
- Validation Agent: `696108f75e0239738a838cdf`
- Single KB: `6960a63fee18986913060bc0`

## Proposed Architecture

### Option A: Router Pattern (Recommended)

```
User Query
    ↓
[Intent Classifier / Router]
    ↓
    ├─ Legal questions ──────→ [Legal Expert Agent] ← Legal KB
    │                                                  (Laws, Decrees, Circulars)
    │
    ├─ Internal policy ──────→ [Internal KB Agent] ← Internal KB
    │  questions                                      (Policies, Contracts, Charters)
    │
    └─ Mixed/Comparative ────→ [Both Agents] → Response Merger
       questions
    ↓
[Validation Agent] (quality scoring)
    ↓
Final Response with Citations
```

### Agent Roles

| Agent | Purpose | Knowledge Domain | Environment Variable |
|-------|---------|------------------|---------------------|
| Router | Intent classification | None (logic only) | `LYZR_ROUTER_AGENT_ID` |
| Legal Expert | Law-of-the-land queries | Legal KB | `LYZR_LEGAL_AGENT_ID` |
| Internal Expert | Company policy queries | Internal KB | `LYZR_INTERNAL_AGENT_ID` |
| Validator | Response quality scoring | None | `LYZR_VALIDATION_AGENT_ID` |

### Knowledge Base Split

**Legal KB (New):**
- Documents with `category = "_LEGAL"`
- Laws & Regulations
- Decrees
- Circulars
- Court Decisions
- Regulatory Guidelines

**Internal KB (Existing, filtered):**
- Documents with `category != "_LEGAL"`
- Internal Policies
- Company Charters
- Meeting Minutes
- Contracts
- Governance Documents

## Implementation Plan

### Phase 1: Lyzr Studio Setup

1. **Create Legal Knowledge Base**
   - New KB in Lyzr Studio
   - Sync only `_LEGAL` category documents
   - Configure chunking for legal documents

2. **Create Legal Expert Agent**
   - System prompt: Legal domain expert
   - Connect to Legal KB
   - Optimize for regulatory interpretation

3. **Create Internal Expert Agent**
   - System prompt: Internal policy expert
   - Connect to Internal KB (filtered)
   - Optimize for company-specific queries

4. **Create Router Agent**
   - System prompt: Intent classification
   - No KB connection (classification only)
   - Returns: `legal`, `internal`, or `both`

### Phase 2: Backend Changes

#### 2.1 Update Environment Variables

```env
# Lyzr Agent Configuration
NEXT_PUBLIC_LYZR_API_KEY=sk-xxx

# Multi-Agent IDs
NEXT_PUBLIC_LYZR_ROUTER_AGENT_ID=xxx     # Intent classifier
NEXT_PUBLIC_LYZR_LEGAL_AGENT_ID=xxx      # Legal expert
NEXT_PUBLIC_LYZR_INTERNAL_AGENT_ID=xxx   # Internal KB expert
NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=xxx # Existing validator

# Knowledge Base IDs
LYZR_LEGAL_KB_ID=xxx
LYZR_INTERNAL_KB_ID=xxx
```

#### 2.2 Create Multi-Agent Client

```typescript
// packages/lyzr/src/multi-agent-client.ts

export interface AgentConfig {
  routerAgentId: string;
  legalAgentId: string;
  internalAgentId: string;
  validationAgentId?: string;
}

export interface RoutingResult {
  intent: 'legal' | 'internal' | 'both';
  confidence: number;
  reasoning: string;
}

export interface MultiAgentResponse {
  message: string;
  citations: EnhancedCitation[];
  sources: {
    legal?: { message: string; citations: EnhancedCitation[] };
    internal?: { message: string; citations: EnhancedCitation[] };
  };
  routing: RoutingResult;
  validation?: ValidationResult;
}

export class MultiAgentClient {
  private client: LyzrClient;
  private config: AgentConfig;

  async chat(
    messages: ChatMessage[],
    userId: string
  ): Promise<MultiAgentResponse> {
    // 1. Route the query
    const routing = await this.routeQuery(messages);

    // 2. Query appropriate agent(s)
    const responses = await this.queryAgents(messages, routing, userId);

    // 3. Merge responses if needed
    const merged = this.mergeResponses(responses, routing);

    // 4. Validate (optional)
    const validation = await this.validate(messages, merged, userId);

    return { ...merged, routing, validation };
  }

  private async routeQuery(messages: ChatMessage[]): Promise<RoutingResult> {
    const response = await this.client.chat(
      this.config.routerAgentId,
      [
        ...messages,
        {
          role: 'system',
          content: `Classify the user's query intent:
- "legal": Questions about laws, regulations, decrees, circulars
- "internal": Questions about company policies, procedures, contracts
- "both": Questions comparing internal policies against legal requirements

Respond with JSON: { "intent": "legal|internal|both", "confidence": 0-1, "reasoning": "..." }`
        }
      ],
      'router'
    );

    return JSON.parse(response.message);
  }

  private async queryAgents(
    messages: ChatMessage[],
    routing: RoutingResult,
    userId: string
  ): Promise<{ legal?: ChatResponse; internal?: ChatResponse }> {
    const queries: Promise<ChatResponse>[] = [];
    const results: { legal?: ChatResponse; internal?: ChatResponse } = {};

    if (routing.intent === 'legal' || routing.intent === 'both') {
      queries.push(
        this.client.chat(this.config.legalAgentId, messages, userId)
          .then(r => { results.legal = r; return r; })
      );
    }

    if (routing.intent === 'internal' || routing.intent === 'both') {
      queries.push(
        this.client.chat(this.config.internalAgentId, messages, userId)
          .then(r => { results.internal = r; return r; })
      );
    }

    await Promise.all(queries);
    return results;
  }

  private mergeResponses(
    responses: { legal?: ChatResponse; internal?: ChatResponse },
    routing: RoutingResult
  ): Omit<MultiAgentResponse, 'routing' | 'validation'> {
    if (routing.intent === 'both') {
      // Merge both responses
      return {
        message: this.formatMergedResponse(responses),
        citations: [
          ...(responses.legal?.citations || []),
          ...(responses.internal?.citations || []),
        ],
        sources: {
          legal: responses.legal ? {
            message: responses.legal.message,
            citations: responses.legal.citations || [],
          } : undefined,
          internal: responses.internal ? {
            message: responses.internal.message,
            citations: responses.internal.citations || [],
          } : undefined,
        },
      };
    }

    // Single agent response
    const response = responses.legal || responses.internal!;
    return {
      message: response.message,
      citations: response.citations || [],
      sources: {
        legal: responses.legal ? {
          message: responses.legal.message,
          citations: responses.legal.citations || [],
        } : undefined,
        internal: responses.internal ? {
          message: responses.internal.message,
          citations: responses.internal.citations || [],
        } : undefined,
      },
    };
  }

  private formatMergedResponse(
    responses: { legal?: ChatResponse; internal?: ChatResponse }
  ): string {
    const parts: string[] = [];

    if (responses.legal) {
      parts.push(`## Legal Framework Analysis\n\n${responses.legal.message}`);
    }

    if (responses.internal) {
      parts.push(`## Internal Policy Analysis\n\n${responses.internal.message}`);
    }

    if (responses.legal && responses.internal) {
      parts.push(`## Summary\n\nBased on both the legal requirements and internal policies...`);
    }

    return parts.join('\n\n---\n\n');
  }
}
```

#### 2.3 Update ChatProvider

```typescript
// Update chat-context.tsx to support multi-agent mode

export interface ChatProviderProps {
  // ... existing props
  /** Enable multi-agent orchestration */
  enableMultiAgent?: boolean;
  /** Router agent ID for multi-agent mode */
  routerAgentId?: string;
  /** Legal expert agent ID */
  legalAgentId?: string;
  /** Internal KB expert agent ID */
  internalAgentId?: string;
}
```

### Phase 3: Document Sync Updates

#### 3.1 Separate Sync Endpoints

```typescript
// app/api/documents/sync-legal/route.ts
// Syncs _LEGAL documents to Legal KB

// app/api/documents/sync-internal/route.ts
// Syncs non-_LEGAL documents to Internal KB
```

#### 3.2 Update Seed Script

```typescript
// scripts/seed-legal-docs.ts
// Add automatic sync to Legal KB after seeding
```

### Phase 4: UI Updates

#### 4.1 Response Display

Update chat message display to show:
- Source indicator (Legal / Internal / Both)
- Separate citation groups by source
- Routing confidence indicator

#### 4.2 Settings Page

Add agent configuration options:
- Enable/disable multi-agent mode
- View agent status
- Test individual agents

## System Prompts

### Router Agent

```
You are a compliance query classifier. Analyze the user's question and determine which knowledge domain(s) are needed.

Categories:
- "legal": Questions about laws, regulations, government decrees, circulars, court decisions
- "internal": Questions about company policies, procedures, contracts, internal documents
- "both": Questions that require comparing internal practices against legal requirements, compliance gap analysis

Always respond with valid JSON:
{
  "intent": "legal" | "internal" | "both",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of classification"
}
```

### Legal Expert Agent

```
You are a legal compliance expert specializing in Vietnamese corporate law and regulations.

Your knowledge base contains:
- Enterprise laws
- Government decrees
- Ministry circulars
- Regulatory guidelines
- Court decisions

When answering:
1. Always cite specific laws, articles, and clauses
2. Explain legal implications clearly
3. Note any recent amendments or changes
4. Highlight compliance requirements
5. Use formal legal terminology appropriately

Format citations as: [Law/Decree Name, Article X, Clause Y]
```

### Internal KB Expert Agent

```
You are an internal compliance analyst for Tasco Group.

Your knowledge base contains:
- Company policies and procedures
- Corporate charters and bylaws
- Meeting minutes and board resolutions
- Contracts and agreements
- Internal governance documents

When answering:
1. Reference specific policy documents
2. Note which entity the policy applies to
3. Explain approval workflows if relevant
4. Highlight any policy exceptions
5. Connect to related internal documents

Format citations as: [Document Name, Section/Article, Entity]
```

### Validation Agent (Updated)

```
You are a compliance response validator. Evaluate AI responses for quality and compliance accuracy.

Evaluate on these dimensions:
1. Groundedness (0-100): Is the response backed by cited documents?
2. Citation Quality (0-100): Are citations relevant and accurate?
3. Completeness (0-100): Does it fully answer the question?
4. Compliance Risk (high/medium/low): Any regulatory concerns?

For multi-agent responses, also evaluate:
5. Source Agreement: Do legal and internal sources align?
6. Gap Analysis: Any conflicts between law and policy?

Return structured JSON with scores and reasoning.
```

## Migration Path

### Step 1: Create New Agents (Lyzr Studio)
1. Create Legal KB → Upload legal documents
2. Create Legal Expert Agent → Connect to Legal KB
3. Create Internal Expert Agent → Connect to existing KB (will filter)
4. Create Router Agent → No KB

### Step 2: Update Environment
1. Add new agent IDs to `.env.local`
2. Deploy to staging for testing

### Step 3: Implement Multi-Agent Client
1. Create `multi-agent-client.ts`
2. Update `usePersistentChat.ts` to support multi-agent mode
3. Update chat UI to display source information

### Step 4: Document Sync
1. Create separate sync endpoints
2. Update seeding scripts
3. Migrate existing documents to correct KBs

### Step 5: Testing & Rollout
1. Test with sample queries
2. Validate routing accuracy
3. Check response quality
4. Gradual rollout with feature flag

## API Costs Consideration

Multi-agent queries will increase API costs:
- Router call: 1 API call per query
- Agent calls: 1-2 calls depending on routing
- Validation: 1 call (optional)

**Total: 3-4 API calls per query vs current 2 calls**

Consider:
- Caching router decisions for similar queries
- Making validation optional/on-demand
- Batch processing for document sync

## Success Metrics

1. **Routing Accuracy**: >90% correct classification
2. **Response Quality**: Validation scores >80%
3. **Citation Accuracy**: Legal citations match actual laws
4. **User Satisfaction**: Reduced follow-up questions
5. **Compliance Coverage**: Answers reference both legal and internal sources when appropriate
