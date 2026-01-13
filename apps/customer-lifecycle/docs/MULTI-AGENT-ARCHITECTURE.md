# Multi-Agent Architecture Design

> Customer Lifecycle Management - Specialized AI Agent System

## Executive Summary

This document outlines the architecture for transforming the customer-lifecycle app from a single unified AI agent to a **multi-agent system** with specialized domain experts. Users can select which agent to chat with based on their needs.

---

## 1. Agent Taxonomy

### Proposed Agent Lineup

| Agent Key | Name | Role | Domain | RAG KB |
|-----------|------|------|--------|--------|
| `customer-lifecycle:assistant` | General Assistant | `main` | All-purpose queries | business-data-kb |
| `customer-lifecycle:lead-expert` | Lead Expert | `expert` | Lead scoring, qualification, prioritization | business-data-kb |
| `customer-lifecycle:customer-expert` | Customer Expert | `expert` | Churn analysis, LTV, retention | business-data-kb |
| `customer-lifecycle:inventory-expert` | Inventory Expert | `expert` | Stock levels, aging, supply chain | business-data-kb |
| `customer-lifecycle:campaign-expert` | Campaign Expert | `expert` | Marketing ROI, segmentation, performance | business-data-kb |

### Agent Icons & Colors

| Agent | Icon | Color | Accent |
|-------|------|-------|--------|
| General Assistant | `Sparkles` | Violet | `bg-violet-500` |
| Lead Expert | `Target` | Red | `bg-red-500` |
| Customer Expert | `Users` | Emerald | `bg-emerald-500` |
| Inventory Expert | `Car` | Blue | `bg-blue-500` |
| Campaign Expert | `Megaphone` | Amber | `bg-amber-500` |

---

## 2. Agent System Prompts

### General Assistant
```
You are the Customer Lifecycle Assistant for Tasco Auto, a leading automotive group in Vietnam with 100+ showrooms and sole distribution rights for GWM, GAC, and Lotus brands.

You help users with:
- General questions about customers, leads, campaigns, and inventory
- Dashboard insights and recommendations
- Cross-functional queries that span multiple domains

When answering:
- Use data from the knowledge base when available
- Provide specific numbers and details
- Suggest next actions when relevant
- If a query is highly specialized (deep lead scoring, churn prediction, inventory optimization), recommend the appropriate specialist agent

Available specialists:
- Lead Expert: For lead scoring, qualification strategies, conversion optimization
- Customer Expert: For churn analysis, retention strategies, LTV insights
- Inventory Expert: For stock analysis, aging alerts, supply chain tracking
- Campaign Expert: For marketing ROI, A/B testing insights, segment performance
```

### Lead Expert
```
You are the Lead Expert AI for Tasco Auto's Customer Lifecycle system. You specialize in:

**Core Expertise:**
- Lead scoring and prioritization (Hot/Warm/Cold classification)
- Lead qualification strategies and criteria
- Conversion funnel analysis and optimization
- Lead source effectiveness (website, referral, walk-in, social, events)
- Sales rep assignment and workload balancing
- Follow-up timing and frequency recommendations

**Analysis Capabilities:**
- Score leads based on: contact completeness, interest signals, budget, timeline, engagement
- Identify high-potential leads requiring immediate action
- Compare conversion rates across sources, showrooms, and time periods
- Predict lead conversion probability

**Response Style:**
- Be data-driven with specific scores and metrics
- Provide actionable recommendations for sales reps
- Prioritize leads by urgency and potential value
- Reference specific lead records when relevant

Always cite your data sources and provide confidence levels for predictions.
```

### Customer Expert
```
You are the Customer Expert AI for Tasco Auto's Customer Lifecycle system. You specialize in:

**Core Expertise:**
- Customer 360-degree profile analysis
- Churn risk prediction and prevention strategies
- Customer lifetime value (LTV) calculation and optimization
- Segmentation (VIP, Regular, At-Risk, New)
- Retention strategies and loyalty programs
- Service reminder optimization
- Upsell and cross-sell recommendations

**Analysis Capabilities:**
- Identify at-risk customers before they churn
- Calculate and track customer LTV trends
- Segment customers by value, behavior, and lifecycle stage
- Recommend personalized engagement strategies
- Analyze satisfaction scores and interaction history

**Response Style:**
- Focus on retention and customer value maximization
- Provide specific customer insights with supporting data
- Recommend actionable interventions for at-risk customers
- Reference purchase history and interaction patterns

Always quantify churn risk (0-100) and provide intervention recommendations.
```

### Inventory Expert
```
You are the Inventory Expert AI for Tasco Auto's vehicle inventory system. You specialize in:

**Core Expertise:**
- Vehicle inventory tracking across all showrooms
- Supply chain visibility (12-stage pipeline from factory to delivery)
- Inventory aging analysis (warning >60 days, critical >90 days)
- Import order management (GWM, GAC, Lotus)
- Stock optimization and rebalancing
- Lead-to-inventory matching

**Analysis Capabilities:**
- Track vehicles by VIN, status, brand, model, location
- Monitor import orders from OEM to arrival
- Calculate inventory health metrics (turn rate, fill rate, aging)
- Forecast arrivals and recommend reorders
- Match available inventory to lead interests

**Brands Covered:**
- GWM (Great Wall Motors): Haval, Tank, Ora
- GAC: Aion, Trumpchi
- Lotus: Eletre, Emeya

**Response Style:**
- Provide specific vehicle counts and values
- Highlight aging alerts and critical inventory
- Track import order ETAs and delays
- Reference VINs and order numbers when relevant

Always provide inventory health context (aging %, turn rate) with your analysis.
```

### Campaign Expert
```
You are the Campaign Expert AI for Tasco Auto's marketing system. You specialize in:

**Core Expertise:**
- Campaign performance analysis and ROI calculation
- Customer segment targeting and optimization
- Multi-channel marketing (email, SMS, social, events, direct mail)
- A/B testing insights and recommendations
- Lead source attribution
- Budget allocation optimization

**Analysis Capabilities:**
- Calculate campaign ROI, open rates, click rates, conversion rates
- Compare performance across channels and segments
- Identify high-performing campaign strategies
- Recommend target segments for new campaigns
- Analyze marketing funnel conversion

**Response Style:**
- Focus on metrics and ROI
- Provide benchmark comparisons
- Recommend optimizations based on data
- Reference specific campaigns and their performance

Always calculate ROI = (Revenue - Budget) / Budget and provide channel comparisons.
```

---

## 3. Architecture Design

### Option A: Direct Agent Selection (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Interface                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent Selector: [General ▼] [Lead] [Customer] ...  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Selected Agent  │
                    │  (Direct Call)   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   General   │    │    Lead     │    │  Customer   │
│  Assistant  │    │   Expert    │    │   Expert    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                          ▼
               ┌──────────────────┐
               │  Business Data   │
               │   Knowledge Base │
               └──────────────────┘
```

**Pros:**
- User has full control
- Transparent agent selection
- Simple implementation
- Predictable behavior

**Cons:**
- User must know which agent to use
- May select wrong agent for query

### Option B: Smart Routing (Orchestrator)

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Interface                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Mode: [Smart Routing ▼] or [Select Agent ▼]        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Orchestrator   │
                    │   (Query Router) │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Lead     │    │  Customer   │    │  Inventory  │
│   Expert    │    │   Expert    │    │   Expert    │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Pros:**
- Intelligent routing
- User doesn't need to choose
- Can combine multiple experts

**Cons:**
- Additional API call for routing
- Routing errors possible
- More complex implementation

### Recommended: Hybrid Approach

1. **Default**: General Assistant (handles most queries)
2. **User Choice**: Agent selector dropdown to pick specialist
3. **Smart Suggestions**: Show "Recommended: Lead Expert" badge when query matches domain

---

## 4. Data Flow

### Message Flow with Agent Selection

```
1. User selects agent from dropdown (or uses default)
2. User types message
3. ChatProvider reads selectedAgentId from state
4. usePersistentChat calls Lyzr API with selected agent
5. Response includes agent attribution in metadata
6. Message stored with agentKey in DynamoDB
7. UI shows agent badge on response message
```

### Message Metadata Enhancement

```typescript
interface MessageMetadata {
  // Existing
  citations?: EnhancedCitation[];
  validation?: ValidationResult;

  // New for multi-agent
  agentKey: string;           // "customer-lifecycle:lead-expert"
  agentName: string;          // "Lead Expert"
  agentRole: AgentRole;       // "expert"
  responseTime?: number;      // ms
}
```

---

## 5. UI Design

### Agent Selector Component

```
┌──────────────────────────────────────────────────────────────┐
│ Chat with: ┌───────────────────────────────────────────────┐ │
│            │ ✨ General Assistant                        ▼ │ │
│            ├───────────────────────────────────────────────┤ │
│            │ ✨ General Assistant    All-purpose queries   │ │
│            │ 🎯 Lead Expert          Scoring, qualification │ │
│            │ 👥 Customer Expert      Churn, retention, LTV  │ │
│            │ 🚗 Inventory Expert     Stock, supply chain    │ │
│            │ 📣 Campaign Expert      Marketing ROI          │ │
│            └───────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Agent Badge on Messages

```
┌──────────────────────────────────────────────────────────────┐
│ 🤖 Lead Expert                                    10:32 AM  │
│ ──────────────────────────────────────────────────────────── │
│ Based on the current data, here are your top priority leads: │
│                                                              │
│ 1. **Nguyễn Văn A** - Score: 92/100 (Hot)                   │
│    Interest: Haval H6, Budget: 800M-1B VND                  │
│    → Recommend: Schedule test drive today                    │
│                                                              │
│ 📎 Sources: lead-nguyen-van-a.md, lead-scoring-model.md     │
└──────────────────────────────────────────────────────────────┘
```

### Suggested Questions by Agent

| Agent | Suggested Questions |
|-------|---------------------|
| General | "What's the overview of my dashboard?", "Summary of this week" |
| Lead Expert | "Which leads should I prioritize today?", "Score breakdown for hot leads" |
| Customer Expert | "Who is at highest churn risk?", "Top VIP customers by LTV" |
| Inventory Expert | "Vehicles aging over 60 days?", "When is the next GAC shipment?" |
| Campaign Expert | "Best performing campaign this month?", "ROI comparison by channel" |

---

## 6. Implementation Plan

### Phase 1: Agent Registry Setup
- [ ] Add 4 new agent configs to `@tasco/agents/registry.ts`
- [ ] Define system prompts for each specialist
- [ ] Configure RAG connections to business-data-kb

### Phase 2: Agent Creation Script
- [ ] Create `scripts/setup-multi-agents.ts`
- [ ] Call Lyzr API to create agents
- [ ] Connect each agent to knowledge base
- [ ] Update registry with actual agent IDs

### Phase 3: UI Components
- [ ] Create `components/agent-selector.tsx`
- [ ] Add agent badge to chat messages
- [ ] Update suggested questions per agent
- [ ] Add agent icons and colors

### Phase 4: Chat Integration
- [ ] Extend ChatProvider with `selectedAgentId` state
- [ ] Update usePersistentChat to use selected agent
- [ ] Store agent info in message metadata
- [ ] Display agent attribution in UI

### Phase 5: Testing & Refinement
- [ ] Test each agent's responses
- [ ] Verify RAG retrieval quality
- [ ] Tune system prompts based on output
- [ ] Performance testing (latency impact)

---

## 7. Environment Variables

```env
# Existing
NEXT_PUBLIC_LYZR_API_KEY=xxx
NEXT_PUBLIC_LYZR_AGENT_ID=xxx  # General Assistant (default)

# New Multi-Agent IDs
NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID=xxx

# Feature Flag
NEXT_PUBLIC_ENABLE_MULTI_AGENT=true
```

---

## 8. Agent Configuration Schema

```typescript
interface AgentDefinition {
  key: string;                    // "customer-lifecycle:lead-expert"
  name: string;                   // "Lead Expert"
  description: string;            // Short description for UI
  role: "main" | "expert";
  icon: LucideIcon;               // Target, Users, Car, Megaphone
  color: string;                  // Tailwind color class
  systemPrompt: string;           // Full prompt text
  suggestedQuestions: string[];   // 3-5 domain-specific questions
  envVar: string;                 // NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID
  connectedKBs: string[];         // KB keys from registry
}
```

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent selection rate | >30% use specialists | Analytics |
| Response relevance | >4.5/5 user rating | Feedback |
| Query resolution | >80% single-turn | Analytics |
| Latency impact | <500ms additional | Monitoring |
| RAG citation rate | >60% with sources | Logs |

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Users don't discover agents | Prominent selector, onboarding tour |
| Wrong agent selected | Smart suggestions, easy switching |
| Specialist too narrow | General Assistant as fallback |
| RAG retrieval mismatch | All agents share same KB |
| Latency increase | Parallel agent init, caching |

---

## Summary

The multi-agent architecture transforms the customer-lifecycle chat from a single generalist to a team of specialists:

1. **General Assistant** - Default, handles 70% of queries
2. **Lead Expert** - Scoring, qualification, sales prioritization
3. **Customer Expert** - Churn, retention, LTV optimization
4. **Inventory Expert** - Stock, aging, supply chain
5. **Campaign Expert** - Marketing ROI, segmentation

Users select their agent via a dropdown, see agent attribution on responses, and get domain-specific suggested questions. All agents share the same knowledge base but have specialized system prompts for their domain.
