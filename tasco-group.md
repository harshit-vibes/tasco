# Session 1: Tasco Group - Compliance & Finance AI Challenges

> **Briefing Session Transcript**
> **Presented by**: Mr. Phong (CEO, Tasco Group)
> **Facilitated by**: Laura (GenAI Fund)
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### Tasco Group Structure

| Attribute | Details |
|-----------|---------|
| **Type** | Conglomerate / Holding Company |
| **Subsidiaries** | 150-200 companies |
| **Structure** | Multi-level holdings (e.g., DNP Holding is owned by Tasco but is itself a holding company) |
| **Legal Team** | 4 lawyers and internal compliance officers |

---

## Problem Statement 1: AI for Compliance & Document Governance

### Challenge Overview

Tasco Group requires an AI-powered system for compliance management and document governance across their conglomerate structure.

### Document Types to Manage

- Company charters
- Meeting minutes (shareholders meetings, board meetings)
- Internal policies and regulations
- Contracts
- Internal governance documents

### Compliance Requirements

1. Documents must comply with current **laws and regulations**
2. Internal policies and contracts must align with **internal governance documents**
3. Multi-layered compliance checking needed across 150-200 entities

### Current Pain Points

| Issue | Description |
|-------|-------------|
| **Volume Overload** | Massive document volume across 150-200 companies |
| **Small Team** | Only 4 people cannot handle the workload manually |
| **Disconnected Tools** | OpenAI is separate from document management system |
| **Manual Process** | Copy-paste workflow required for each compliance check |
| **Security Risk** | Copying sensitive documents to external tools is unsafe |
| **Inefficient** | Process is time-consuming and error-prone |

### Current Technical Implementation

**Architecture:**
```
Google Drive (Document Storage)
        ↓
    Custom API
        ↓
Custom GPT (OpenAI)
        ↓
   User Queries
```

**How it works:**
1. Company files organized in Google Drive folders
2. Custom GPT built on OpenAI platform
3. API interface connects GPT to Google Drive
4. Users query the Custom GPT
5. System retrieves documents, summarizes, extracts information

**Use Cases:**
- Document summarization
- Information extraction
- Finding relevant documents
- Answering compliance questions

### Problems with Current AI Solution

| Problem | Impact |
|---------|--------|
| **Inconsistent Results** | Same query returns different answers at different times |
| **Not Stable** | Unreliable for compliance-critical decisions |
| **Not Reliable** | Cannot be trusted for legal/regulatory work |

### Requirements

1. **Integration**: Connect directly with document management systems
2. **Security**: Eliminate need to copy sensitive documents externally
3. **Consistency**: Same query must return same results every time
4. **Efficiency**: Reduce manual workload on legal team
5. **Compliance Automation**: Automated checking against laws and internal policies
6. **Scalability**: Handle documents across 150-200 entities

---

## Problem Statement 2: AI for Finance & Accounting

### Challenge Overview

Similar to compliance challenge, but applied to finance and accounting departments. Need AI support for financial report compliance and consolidation.

### Current Systems

| System | Purpose |
|--------|---------|
| **ERP** | Accounting transactions |
| **Document System** | Financial reports from various companies (separate from ERP) |

### Key Use Cases

#### 1. Financial Report Compliance
- Ensuring financial reports comply with regulations
- Validating submitted reports from subsidiaries

#### 2. Financial Statement Consolidation
- Consolidating income statements across multiple companies
- Supporting group-level financial reporting
- Multi-tier consolidation required:
  - Subsidiaries → Sub-holdings (e.g., DNP Holding)
  - Sub-holdings → Tasco Group

### Consolidation Structure

```
Tasco Group (Parent Holding)
    ├── DNP Holding (Sub-holding)
    │   ├── Subsidiary A
    │   ├── Subsidiary B
    │   └── Subsidiary C
    ├── Other Holding Companies
    │   └── ...
    └── Direct Subsidiaries
        └── ...
```

### Problems with Current AI Solution

| Problem | Description |
|---------|-------------|
| **Inconsistent Results** | AI returns different results when run at different times |
| **Hallucination** | AI invents new data not present in source documents |
| **Unreliable** | Cannot be trusted for financial reporting |

### Requirements

1. **Consistency**: Must return identical results for identical inputs
2. **Grounded Responses**: All outputs strictly from submitted financial reports
3. **Zero Hallucination**: Must not invent or fabricate any financial data
4. **Traceability**: All data must be traceable to source documents
5. **Integration**: Connect with existing document management system
6. **Multi-level Consolidation**: Support complex holding company structures

---

## Success Criteria (Both Challenges)

| Metric | Target |
|--------|--------|
| Consistency | 100% - Same results for same queries |
| Accuracy | Grounded in source documents only |
| Efficiency | Significant reduction in manual workload |
| Security | No sensitive data copied to external tools |
| Coverage | Support for all 150-200 entities |

---

## Q&A Summary

### Q: What do you use OpenAI for currently?

**A:** We use Custom GPT on OpenAI with API integration to Google Drive:
- Document summarization
- Information extraction
- Finding relevant documents
- Answering user queries about compliance

The system accesses documents via API (similar to MCP tools), retrieves information, and answers questions.

### Q: What are the main problems with current implementation?

**A:**
- **Inconsistency**: Same instruction/request returns different answers at different times
- **Not stable or reliable**: Cannot be trusted for compliance-critical work
- Results vary even with identical prompts

---

## Technical Context

### Current Stack
- **Document Storage**: Google Drive
- **AI Platform**: OpenAI (Custom GPT)
- **Integration**: Custom API connecting GPT to Drive
- **ERP**: Separate system for accounting transactions

### Desired Improvements
- Direct integration with document management (no copy-paste)
- Consistent, reproducible AI responses
- Secure handling of sensitive documents
- Support for complex organizational hierarchies
- Automated compliance checking workflows

---

## Call for Solutions

Tasco Group is seeking solutions that can:

1. **For Legal/Compliance:**
   - Reduce workload on 4-person legal team
   - Automate document compliance checking
   - Integrate securely with existing document systems

2. **For Finance/Accounting:**
   - Automate financial statement consolidation
   - Ensure consistent, hallucination-free results
   - Support multi-tier holding company structures

**Key Differentiator Required:** Consistency and reliability - the solution must produce the same results every time for the same inputs.
