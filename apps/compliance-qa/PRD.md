# Compliance QA - Product Requirements Document

> G1 | Tasco Group | LLM-Native

---

## Key Solutions Demonstrated

This demo addresses critical compliance and document governance challenges for Tasco Group:

- **Deterministic AI Responses**: Eliminates the #1 pain point - inconsistent results from current OpenAI/GPT solution. Uses temperature=0 on retrieval to ensure same query always returns same answer (critical for legal/compliance work)
- **Source-Grounded Citations**: Every response includes document name, page number, and direct quote - solving the hallucination problem in financial and legal contexts
- **Secure Document Handling**: Removes need to copy sensitive documents to external tools (current security risk with OpenAI workflow)
- **Multi-Entity Compliance**: Supports document governance across 150-200 subsidiary companies with a 4-person legal team
- **Multi-Agent Orchestration**: Manager agent (Claude Sonnet) handles routing and validation, Worker agent (Claude Haiku at temp=0) handles deterministic document retrieval
- **Bilingual Support**: Vietnamese and English language detection and responses for a Vietnamese conglomerate

**Challenges Addressed:**
1. G1 - Compliance & Document Governance (direct match)
2. Finance Consolidation (same business unit - data governance pattern)

---

## Overview

| Attribute | Value |
|-----------|-------|
| **App** | compliance-qa |
| **Proposal** | G1 - AI Compliance & Document Governance |
| **Business Unit** | Tasco Group HQ |
| **Type** | LLM-Native |
| **Port** | 3001 |
| **Priority** | High (Tier 1) |

---

## Business Context

### About Tasco Group

- **Type:** Conglomerate / Holding Company
- **Subsidiaries:** 150-200 companies
- **Structure:** Multi-level holdings (Tasco > DNP Holding > Subsidiaries)
- **Legal Team:** 4 lawyers and compliance officers
- **Listed:** Hanoi Stock Exchange (HUT - HNX)

### Organization Structure

```
Tasco Group (Parent Holding)
├── DNP Holding (Sub-holding)
│   ├── Subsidiary A
│   ├── Subsidiary B
│   └── Subsidiary C
├── Tasco Auto
├── Tasco Insurance
├── Other Holdings
│   └── ...
└── Direct Subsidiaries
    └── ...
```

---

## Problem Statement

### Current Situation

With 150-200 subsidiary companies, Tasco Group struggles to standardize, monitor, and enforce policies, internal regulations, and legal documents across the group. The 4-person legal team cannot manually handle the document volume.

### Current Solution (What They Have)

```
Google Drive (Document Storage)
        ↓
    Custom API
        ↓
Custom GPT (OpenAI)
        ↓
   User Queries
```

**Current Capabilities:**
- Document summarization
- Information extraction
- Finding relevant documents
- Answering compliance questions

### Pain Points

| Issue | Description |
|-------|-------------|
| **Inconsistent Results** | Same query returns different answers at different times |
| **Not Stable** | Unreliable for compliance-critical decisions |
| **Security Risk** | Copying sensitive documents to external tools |
| **Manual Process** | Copy-paste workflow for each compliance check |
| **Small Team** | 4 people cannot handle workload across 150-200 entities |
| **Disconnected Tools** | OpenAI is separate from document management |

### Critical Requirement

> **CONSISTENCY IS THE #1 PRIORITY**
>
> The solution MUST produce identical results for identical queries every time. This is non-negotiable for legal/compliance work.

---

## Solution

An AI-powered compliance Q&A system that provides consistent, grounded, and traceable answers from Tasco Group's document repository.

### Key Differentiators from Current Solution

| Current (OpenAI GPT) | Our Solution (Lyzr) |
|---------------------|---------------------|
| Inconsistent results | Deterministic responses |
| External tool (security risk) | Self-hosted / secure |
| Copy-paste workflow | Direct integration |
| No traceability | Full source citations |
| Generic AI | Compliance-focused agent |

---

## Document Types

| Category | Icon | Examples | Keywords |
|----------|------|----------|----------|
| **Policies** | 📋 | HR policies, IT policies, Finance policies | expense, leave, travel, conduct |
| **Contracts** | 📝 | Vendor agreements, Employment contracts, NDAs | agreement, terms, vendor |
| **Meeting Minutes** | 📅 | Board meetings, Shareholders meetings, Committee decisions | resolution, decision, board |
| **Legal Documents** | ⚖️ | Decrees, Circulars, Laws, Regulations | decree, circular, law |
| **Governance** | 🏛️ | Compliance frameworks, Audit reports, Charters | charter, bylaws, authority |

---

## Core Features

### MVP Features (Demo)

- [ ] **Document Upload** - PDF, DOCX support
- [ ] **Knowledge Base** - RAG-powered document indexing
- [ ] **Chat Interface** - Natural language Q&A
- [ ] **Source Citations** - Every answer cites source document + page
- [ ] **Consistency Mode** - Deterministic responses (temperature=0)
- [ ] **Conversation History** - Track past queries
- [ ] **Bilingual Support** - English and Vietnamese

### Phase 2 Features

- [ ] **Google Drive Integration** - Connect existing document storage
- [ ] **Multi-entity Support** - Query by subsidiary
- [ ] **Compliance Checking** - Validate documents against regulations
- [ ] **Audit Trail** - Log all queries and responses

### Phase 3 Features

- [ ] **Document Version Control** - Track changes over time
- [ ] **Role-based Access** - Restrict by user role
- [ ] **Automated Alerts** - Notify on regulation changes
- [ ] **Report Generation** - Export compliance reports

---

## User Personas

### Primary Users

| Persona | Role | Use Case |
|---------|------|----------|
| **Legal Counsel** | 4-person legal team | Compliance verification, contract review |
| **Compliance Officer** | Internal compliance | Policy enforcement, audit preparation |
| **Department Head** | Business unit leaders | Policy clarification, decision support |
| **Executive** | C-level | Governance oversight |

### User Stories

1. **As a** legal counsel, **I want to** check if a contract clause complies with current regulations **so that** I can approve it confidently.

2. **As a** compliance officer, **I want to** find all policies related to a specific regulation **so that** I can ensure group-wide compliance.

3. **As a** department head, **I want to** understand the approval process for a transaction **so that** I follow proper governance.

4. **As an** executive, **I want to** get a summary of compliance status **so that** I can report to the board.

---

## Technical Architecture

### Agent Orchestration

The system uses a **multi-agent architecture** with a Manager-Worker pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Query                              │
│         "What is the approval process for contracts             │
│                    over $100,000?"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Compliance QA Coordinator (Manager)                │
│                                                                 │
│  Model: Claude Sonnet 4.0 | Temp: 0.1                          │
│  Features: memory                                               │
│                                                                 │
│  Responsibilities:                                              │
│  1. Analyze query → detect document type, language, scope      │
│  2. Delegate to specialist with structured context             │
│  3. Validate response has complete citations                   │
│  4. Format final response consistently                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ delegates
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           Compliance Document Specialist (Worker)               │
│                                                                 │
│  Model: Claude 3.5 Haiku | Temp: 0 (deterministic)             │
│  Features: RAG (knowledge base)                                │
│                                                                 │
│  Responsibilities:                                              │
│  1. Search knowledge base for relevant documents               │
│  2. Extract exact quotes (no paraphrasing)                     │
│  3. Cite: Document Name, Page X, Section Y.Z                   │
│  4. Return structured evidence-based response                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ returns
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Compliance QA Coordinator (Manager)                │
│                                                                 │
│  Validates:                                                     │
│  ✓ Direct answer present                                       │
│  ✓ Document name included                                      │
│  ✓ Page/section reference                                      │
│  ✓ Evidence quote in quotation marks                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Final Response                             │
│                                                                 │
│  **Answer:** Clear, concise answer                             │
│  **Source:** Document, Page X, Section Y.Z                     │
│  **Evidence:** "Direct quote from document"                    │
│  **Additional Context:** Related policies if any               │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Configuration

| Agent | Model | Temperature | Purpose |
|-------|-------|-------------|---------|
| **Coordinator** | Claude Sonnet 4.0 | 0.1 | Query analysis, validation, formatting |
| **Specialist** | Claude 3.5 Haiku | 0.0 | Document retrieval, citation extraction |

### Why Multi-Agent?

| Decision | Rationale |
|----------|-----------|
| **Separation of concerns** | Routing logic vs retrieval logic |
| **Cost optimization** | Expensive model for coordination, cheap model for retrieval |
| **Determinism** | Worker at temp=0 ensures consistent citations |
| **Extensibility** | Can add specialized workers per document type |

### Blueprint Details

| Property | Value |
|----------|-------|
| **Blueprint ID** | `98ad85ac-5951-4890-83c9-f3d1017f1c85` |
| **Manager Agent ID** | `69607f24c57d451439d499a0` |
| **Worker Agent ID** | `69607f24566bcffb7aebad83` |
| **Studio URL** | https://studio.lyzr.ai/lyzr-manager?blueprint=98ad85ac-5951-4890-83c9-f3d1017f1c85 |

### Consistency Requirements

```python
# Manager Agent - handles orchestration
manager_config = {
    "model": "anthropic/claude-sonnet-4-0",
    "temperature": 0.1,  # Slight variation OK for phrasing
    "features": ["memory"]  # Session continuity
}

# Worker Agent - handles retrieval (CRITICAL: temp=0)
worker_config = {
    "model": "anthropic/claude-3-5-haiku-latest",
    "temperature": 0,  # DETERMINISTIC - same query = same citation
    "top_p": 1
}
```

### Data Flow

```
User Query
    ↓
Coordinator (analyzes intent, detects language)
    ↓
Specialist (searches RAG knowledge base)
    ↓
Document Chunks Retrieved
    ↓
Specialist (extracts citations, quotes)
    ↓
Coordinator (validates citations, formats response)
    ↓
Response + Citations
    ↓
User Interface
```

### Security Requirements

- [ ] No document data sent to external services (if self-hosted)
- [ ] Audit logging for all queries
- [ ] Encrypted document storage
- [ ] Session-based access control

---

## UI/UX Requirements

### Information Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Compliance QA App                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   💬 Chat   │   │ 📚 Library  │   │ ⬆️ Upload   │   │ ⚙️ Settings │     │
│  │   (Main)    │   │             │   │             │   │             │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                             │
│  Primary Flow:  Library → Upload → Chat → Review Citations                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page 1: Chat Interface (Main Experience)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏢 Compliance QA                    [EN|VI]  [📚 Library]  [+ New Chat]    │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  CONVERSATIONS │   ┌────────────────────────────────────────────────────┐   │
│                │   │  🤖 Welcome to Tasco Compliance QA                 │   │
│  Today         │   │                                                    │   │
│  ● Contract    │   │  I help you find answers from your compliance     │   │
│    approval    │   │  documents with exact source citations.           │   │
│    limits      │   │                                                    │   │
│                │   │  Try asking:                                       │   │
│  Yesterday     │   │  • "What is the contract approval process?"       │   │
│  ○ Travel      │   │  • "Who can approve expenses over $50k?"          │   │
│    policy      │   │  • "What did the board decide about DNP?"         │   │
│  ○ Board       │   └────────────────────────────────────────────────────┘   │
│    minutes     │                                                            │
│    Q3          │   ┌────────────────────────────────────────────────────┐   │
│                │   │  👤 What is the approval process for contracts    │   │
│  Last Week     │   │     over $100,000?                                 │   │
│  ○ Vendor      │   └────────────────────────────────────────────────────┘   │
│    require...  │                                                            │
│                │   ┌────────────────────────────────────────────────────┐   │
│  ───────────   │   │  🤖 **Answer:**                                    │   │
│  [🗑️ Clear]    │   │  Contracts exceeding $100,000 require three-tier  │   │
│                │   │  approval: Department Head → Finance Director →   │   │
│                │   │  CEO. All three signatures are required before    │   │
│                │   │  contract execution.                              │   │
│                │   │                                                    │   │
│                │   │  **Source:**                                       │   │
│                │   │  ┌──────────────────────────────────────────────┐ │   │
│                │   │  │ 📄 Procurement Policy v2.1                   │ │   │
│                │   │  │    Page 12, Section 4.2                      │ │   │
│                │   │  │    [View Document]                           │ │   │
│                │   │  └──────────────────────────────────────────────┘ │   │
│                │   │                                                    │   │
│                │   │  **Evidence:**                                     │   │
│                │   │  "All contracts with a total value exceeding      │   │
│                │   │  USD 100,000 (or VND equivalent) shall require    │   │
│                │   │  written approval from: (1) the requesting        │   │
│                │   │  Department Head, (2) the Finance Director, and   │   │
│                │   │  (3) the Chief Executive Officer."                │   │
│                │   │                                                    │   │
│                │   │  **Related:**                                      │   │
│                │   │  • Section 4.1 covers $50k-$100k contracts        │   │
│                │   │  • Section 6.3 for emergency procedures           │   │
│                │   │                                                    │   │
│                │   │  [👍] [👎] [📋 Copy]                    2.1s      │   │
│                │   └────────────────────────────────────────────────────┘   │
│                │                                                            │
├────────────────┴────────────────────────────────────────────────────────────┤
│  [📎 Attach]  Ask about compliance documents...              [Send →]       │
│               ─────────────────────────────────────────                     │
│               Suggested: "What about emergency purchases?" [Try]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chat Interface Components

| Element | Purpose | Orchestration Mapping |
|---------|---------|----------------------|
| **Language Toggle** | EN/VI switch | Coordinator detects & responds in same language |
| **Conversation History** | Left sidebar | Session continuity via `memory` feature |
| **Structured Response** | Answer/Source/Evidence | Coordinator's output format |
| **Citation Card** | Clickable source reference | Specialist's citation extraction |
| **Related Section** | Cross-references | Specialist finds related policies |
| **Response Time** | "2.1s" indicator | Trace latency tracking |
| **Feedback Buttons** | 👍👎 | Quality monitoring for consistency |
| **Suggested Follow-up** | Quick actions | Context-aware suggestions |

### Page 2: Document Library

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📚 Document Library                              [+ Upload]  [⬇️ Export]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔍 Search documents...                    [All Types ▼] [All Entities ▼]  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📁 POLICIES (12)                                                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │ 📄              │ │ 📄              │ │ 📄              │               │
│  │ Procurement     │ │ Travel Policy   │ │ HR Handbook     │               │
│  │ Policy v2.1     │ │ 2024            │ │ 2024            │               │
│  │                 │ │                 │ │                 │               │
│  │ 45 pages        │ │ 23 pages        │ │ 156 pages       │               │
│  │ Updated: Dec 24 │ │ Updated: Nov 24 │ │ Updated: Jan 25 │               │
│  │ ✅ Indexed      │ │ ✅ Indexed      │ │ ⏳ Processing   │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                             │
│  📁 MEETING MINUTES (8)                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │ 📄              │ │ 📄              │ │ 📄              │               │
│  │ Board Minutes   │ │ Board Minutes   │ │ Shareholders    │               │
│  │ Q4 2024         │ │ Q3 2024         │ │ Meeting 2024    │               │
│  │                 │ │                 │ │                 │               │
│  │ 12 pages        │ │ 15 pages        │ │ 28 pages        │               │
│  │ Updated: Dec 24 │ │ Updated: Sep 24 │ │ Updated: Jun 24 │               │
│  │ ✅ Indexed      │ │ ✅ Indexed      │ │ ✅ Indexed      │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                             │
│  📁 CONTRACTS (15)          📁 LEGAL DOCS (23)         📁 GOVERNANCE (6)   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Total: 64 documents  |  ✅ 61 indexed  |  ⏳ 3 processing                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Document Categories

| Category | Icon | Filter Keywords | Document Types |
|----------|------|-----------------|----------------|
| Policies | 📋 | expense, leave, travel, conduct | HR, IT, Finance policies |
| Contracts | 📝 | agreement, terms, vendor | Vendor, employment, NDAs |
| Minutes | 📅 | resolution, decision, board | Board, committee minutes |
| Legal | ⚖️ | decree, circular, law | Vietnamese regulations |
| Governance | 🏛️ | charter, bylaws, authority | Compliance frameworks |

### Page 3: Upload Documents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⬆️ Upload Documents                                              [← Back]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                     ┌───────────────────┐                          │   │
│  │                     │    📄 + 📄 + 📄   │                          │   │
│  │                     └───────────────────┘                          │   │
│  │                                                                     │   │
│  │              Drag & drop PDF or DOCX files here                    │   │
│  │                     or [Browse Files]                               │   │
│  │                                                                     │   │
│  │              Supports: PDF, DOCX  •  Max: 50MB per file            │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  QUEUED FOR PROCESSING (2)                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 procurement-policy-v2.2.pdf                           [✕ Remove] │   │
│  │    2.3 MB  •  Uploaded just now                                     │   │
│  │                                                                     │   │
│  │    Category: [Policy ▼]     Entity: [Tasco Group HQ ▼]             │   │
│  │    ████████████████░░░░  Processing... 78%                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 board-resolution-2025-01.pdf                          [✕ Remove] │   │
│  │    456 KB  •  Uploaded 2 min ago                                    │   │
│  │                                                                     │   │
│  │    Category: [Minutes ▼]    Entity: [Tasco Group HQ ▼]             │   │
│  │    ✅ Indexed successfully  •  12 pages extracted                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Upload More]                                              [Done →]        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Upload Metadata Fields

| Field | Required | Purpose |
|-------|----------|---------|
| **Category** | Yes | Routes to correct document type for search |
| **Entity** | Yes | Filters by subsidiary (150-200 entities) |
| **Version** | Optional | Tracks document revisions |
| **Effective Date** | Optional | For regulatory compliance |

### Page 4: Settings

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  KNOWLEDGE BASE STATUS                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 64 documents indexed  •  Last sync: 5 min ago  [🔄 Refresh]     │   │
│  │                                                                     │   │
│  │  By Category:                                                       │   │
│  │  ████████████████████  Policies: 12                                │   │
│  │  ██████████████        Minutes: 8                                  │   │
│  │  ████████████████████████  Contracts: 15                           │   │
│  │  ██████████████████████████████  Legal: 23                         │   │
│  │  ████████              Governance: 6                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  LANGUAGE PREFERENCES                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Default Language:  [● English  ○ Vietnamese]                       │   │
│  │  Auto-detect from query: [✓]                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  RESPONSE SETTINGS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Always show citations: [✓]                                         │   │
│  │  Show evidence quotes: [✓]                                          │   │
│  │  Show related documents: [✓]                                        │   │
│  │  Response detail level: [● Detailed  ○ Concise]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  AUDIT LOG                                                     [View All →] │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Today, 2:34 PM  •  "contract approval process" → Found 2 sources  │   │
│  │  Today, 2:12 PM  •  "travel expense policy" → Found 1 source       │   │
│  │  Today, 1:45 PM  •  "board resolution DNP" → Found 3 sources       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Response States (Loading UX)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STATE 1: ANALYZING QUERY                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔍 Analyzing your question...                                      │   │
│  │     Detected: Policy question • English • Group-wide               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  STATE 2: SEARCHING DOCUMENTS                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📚 Searching compliance documents...                               │   │
│  │     Checking: Procurement Policy, Travel Policy, Board Minutes     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  STATE 3: PREPARING RESPONSE                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Found 2 relevant sources                                        │   │
│  │     Preparing response with citations...                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  STATE 4: NO DOCUMENTS FOUND                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ No matching policy found                                        │   │
│  │                                                                     │   │
│  │  I could not find a policy addressing this question.               │   │
│  │                                                                     │   │
│  │  Recommended next steps:                                           │   │
│  │  • [Contact Legal Team]                                            │   │
│  │  • [Upload Missing Document]                                       │   │
│  │  • [Try a Different Question]                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Experience

```
┌─────────────────────┐
│ 🏢 Compliance QA    │
│ [≡] [EN|VI] [+]     │
├─────────────────────┤
│                     │
│ 🤖 Based on the     │
│ Procurement Policy  │
│ (Section 4.2)...    │
│                     │
│ ┌─────────────────┐ │
│ │ 📄 Source       │ │
│ │ Procurement     │ │
│ │ Policy v2.1     │ │
│ │ Page 12         │ │
│ │ [View Doc]      │ │
│ └─────────────────┘ │
│                     │
│ Evidence:           │
│ "All contracts      │
│ exceeding USD       │
│ 100,000..."         │
│                     │
│ [👍] [👎] [📋]      │
│                     │
├─────────────────────┤
│ [📎] Ask...  [→]    │
└─────────────────────┘
```

### Components

| Component | Description | Props |
|-----------|-------------|-------|
| `ChatMessage` | User/AI message with citations | `type`, `content`, `citations`, `timestamp` |
| `CitationCard` | Source document reference | `document`, `page`, `section`, `onView` |
| `DocumentCard` | Document preview in library | `name`, `type`, `pages`, `status`, `onView` |
| `FileUpload` | Drag-drop upload zone | `onUpload`, `accept`, `maxSize` |
| `SearchBar` | Query input with suggestions | `onSearch`, `suggestions`, `placeholder` |
| `LanguageToggle` | EN/VI switch | `value`, `onChange` |
| `ResponseLoader` | Loading states | `state`, `details` |
| `FeedbackButtons` | 👍👎 rating | `onFeedback`, `responseId` |

### Orchestration → UX Mapping

| Orchestration Feature | UX Implementation |
|-----------------------|-------------------|
| Coordinator analyzes query | Loading: "Analyzing..." + detected type badge |
| Specialist searches KB | Loading: "Searching..." + document names |
| Coordinator validates citations | Structured response with Source/Evidence sections |
| Memory feature | Conversation history sidebar with session continuity |
| Deterministic responses | Feedback buttons to verify consistency |
| Bilingual support | EN/VI toggle + auto-detect from query |
| No document found | Clear escalation paths with action buttons |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Consistency** | 100% | Same query = same answer |
| **Response Time** | < 5 seconds | Time to first token |
| **Citation Rate** | 100% | All answers cite sources |
| **Accuracy** | > 95% | Verified by legal team |
| **User Adoption** | > 80% | Legal team active usage |
| **Query Volume** | 50+/day | After rollout |

---

## Sample Queries

### Contract & Legal

- "What is the approval process for contracts over $100,000?"
- "Does this clause comply with Circular 123/2024?"
- "What are the requirements for vendor contracts?"

### Policy & Governance

- "What is the travel expense reimbursement policy?"
- "Who has authority to approve capital expenditures?"
- "What is the conflict of interest disclosure process?"

### Compliance

- "What regulations apply to cross-border transactions?"
- "What are the reporting requirements for subsidiaries?"
- "When is the next compliance audit due?"

### Meeting Minutes

- "What was decided about the DNP acquisition?"
- "Who attended the last board meeting?"
- "What resolutions were passed in Q3 2024?"

---

## Demo Data

For the Innovation Day demo, we'll use sample documents:

| Document | Type | Content |
|----------|------|---------|
| `procurement-policy.pdf` | Policy | Approval workflows, limits |
| `travel-policy.pdf` | Policy | Expense guidelines |
| `board-minutes-2024.pdf` | Minutes | Sample board decisions |
| `compliance-framework.pdf` | Governance | Compliance requirements |
| `sample-contract.pdf` | Contract | Template contract |

---

## Implementation Phases

### Phase 1: Demo (Week 1-2)
- Basic chat interface
- Document upload (5-10 sample docs)
- RAG with citations
- Consistency mode enabled
- Multi-agent orchestration

### Phase 2: Pilot (Week 3-4)
- Google Drive integration
- Full document library UI
- Vietnamese language
- Audit logging

### Phase 3: Production (Week 5+)
- Multi-entity support
- Compliance checking
- Role-based access
- Report generation

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inconsistent AI responses | High | Temperature=0 on worker, structured prompts |
| Document parsing errors | Medium | Pre-processing validation, fallback OCR |
| Vietnamese language issues | Medium | Use multilingual models, test thoroughly |
| Security concerns | High | Self-hosted option, encryption, audit logs |
| Low adoption | Medium | Training sessions, intuitive UI |

---

## Dependencies

- Lyzr Blueprint SDK (multi-agent orchestration)
- Lyzr RAG APIs (knowledge base)
- Vector database (included in Lyzr)
- PDF/DOCX parsing library
- AWS DynamoDB for session storage
- Sample compliance documents

---

## References

- [Proposal G1](../../docs/proposal2.md)
- [Tasco Group Challenge](../../docs/challenges/tasco-group.md)
- [Global PRD](../../PRD.md)
- [Blueprint in Lyzr Studio](https://studio.lyzr.ai/lyzr-manager?blueprint=98ad85ac-5951-4890-83c9-f3d1017f1c85)
