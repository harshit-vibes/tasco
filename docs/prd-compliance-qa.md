# PRD: AI Compliance & Document Governance System

> **App Code:** G1 | **App Name:** compliance-qa | **Business Unit:** Tasco Group

---

## 1. Executive Summary

TASCO requires an **Agentic AI Governance & Financial Intelligence Platform** that acts as a controlled, auditable, human-in-the-loop assistant for Legal/Compliance and Finance/Accounting teams. The platform must be tightly grounded in TASCO's own documents and Vietnamese regulations.

**Key Differentiators:**
- Instruction-locked agents that DO NOT drift over time
- Clause-level compliance mapping with citation to specific law articles
- Deterministic outputs (same input → same result)
- Source-document grounding for every answer
- Human-in-the-loop by design, not as an afterthought

---

## 2. Problem Statement

TASCO lacks a scalable, controlled, and auditable system to standardize, search, validate, and analyze legal and financial documents across **150–200 subsidiaries**, resulting in:
- Operational overload on small legal team (~4 staff for 200 entities)
- Compliance risk from manual law cross-referencing
- Slow decision-making from fragmented document handling
- Failed past AI attempts (ChatGPT) due to hallucination and inconsistency

---

## 3. Use Case Clusters

### Cluster A: Legal & Compliance (Primary Priority)

| Capability | Description |
|------------|-------------|
| Policy Compliance Checking | Cross-check internal documents against Vietnamese laws |
| Document Types | Company charters, Shareholder agreements, Board resolutions, Internal policies, M&A agreements |
| Law Sources | Vietnamese Enterprise Law, Decrees, Circulars, Internal governance rules |
| Detection | Conflicts, Inconsistencies, Missing clauses, Outdated law references |
| Output | Clause-level mapping with specific law article citations |

**Example Output:**
```
Clause 4.2 of Shareholder Agreement conflicts with Article 135, Enterprise Law 2020 (amended 2023)
```

### Cluster B: Finance & Accounting Intelligence (Secondary Priority)

| Capability | Description |
|------------|-------------|
| Document Search | Natural language search across financial reports |
| Report Types | Annual reports, Quarterly reports, Multi-year documents |
| Consolidation | Assisted (NOT automated) financial consolidation |
| Outputs | Draft tables, Template population, Preliminary commentary |
| Comparison | Cross-year, Cross-subsidiary analysis |

**Explicit Constraints:**
- NOT end-to-end accounting automation
- NOT final financial sign-off
- Human review mandatory for all outputs

---

## 4. Functional Requirements

### 4.1 Document Intelligence Layer

**Supported Formats:**
- PDF
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Google Docs / Sheets
- OCR (future phase)

**Metadata Extraction:**
- Company / Entity
- Document year
- Document type
- Legal entity classification

### 4.2 Legal Compliance Capabilities

| Feature | Description |
|---------|-------------|
| Clause Extraction | Parse documents into structured clauses |
| Law Retrieval | Search Vietnamese laws, Decrees, Circulars |
| Clause-to-Law Mapping | Match document clauses to relevant law articles |
| Conflict Detection | Identify contradictions between documents and laws |
| Gap Identification | Find missing required clauses |
| Compliance Report | Generate structured findings with citations |

### 4.3 Finance Intelligence Capabilities

| Feature | Description |
|---------|-------------|
| Cross-Company Search | Natural language queries across all entities |
| Draft Consolidation | Generate preliminary consolidation tables |
| Template Aggregation | Populate predefined financial templates |
| Draft Commentary | AI-generated analytical commentary (human-reviewed) |
| Cross-Year Comparison | Compare figures across reporting periods |

### 4.4 Multi-Entity Support

- Filter documents by entity (150-200 subsidiaries)
- Search across all entities or specific subset
- Entity hierarchy navigation (Group → Holding → Subsidiary)
- Entity-specific compliance rules

---

## 5. Agent Architecture

### 5.1 Agent Overview

```
User (Legal / Finance)
        |
        v
   Intent Router Agent
        |
        +-------------------+
        |                   |
  Compliance Flow      Finance Flow
        |                   |
Document Ingestion   Document Ingestion
        |                   |
Legal Knowledge      Financial Schema
        |                   |
Compliance Agent     Financial Intelligence Agent
        |                   |
Validation Agent     Validation Agent
        |                   |
   Human Review Layer
        |
Final Draft Output (Traceable + Auditable)
```

### 5.2 Agent Definitions

| Agent | Responsibility |
|-------|---------------|
| **Document Ingestion Agent** | Parse documents, extract structured sections, normalize formats |
| **Legal Knowledge Agent** | Maintain updated law corpus, index decrees & circulars, version control for laws |
| **Compliance Analysis Agent** | Compare clauses vs laws, flag inconsistencies, generate explainable findings |
| **Financial Intelligence Agent** | Extract financial figures, align to templates, strict schema validation |
| **Search & Retrieval Agent** | Semantic + keyword hybrid search, filter by entity/year/type |
| **Consistency & Validation Agent** | Verify outputs against source, reject unverifiable answers, ensure repeatability |
| **Human-in-the-Loop Review Agent** | Flag "review required", support inline comments, track acceptance/rejection |

### 5.3 Critical Agent Properties

| Property | Requirement |
|----------|-------------|
| **Determinism** | Same input must produce identical output |
| **Instruction-Locked** | Agent behavior must not drift over sessions |
| **Traceable** | Every output linked to source document/law |
| **Auditable** | Full logging of agent decisions |
| **Hallucination-Free** | Reject responses that cannot be grounded |

---

## 6. User Interface Requirements

### 6.1 Chat Interface
- Natural language query input
- Suggested questions based on document context
- Streaming responses with loading indicators

### 6.2 Citation System
- Clickable citations linking to source documents
- Page/section-level navigation
- Document preview panel
- Citation confidence indicators

### 6.3 Knowledge Base Management
- Document upload (drag & drop, bulk)
- Document categorization by type/entity/year
- Sync status indicators
- Document preview and search

### 6.4 Compliance Dashboard
- Overview of compliance status across entities
- Conflict/gap summary
- Recent analysis results
- Pending reviews

### 6.5 Multi-Language Support
- English (default)
- Vietnamese (Tiếng Việt)
- Language switcher in header

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Document ingestion: < 30 seconds per document
- Search response: < 3 seconds
- Compliance analysis: < 60 seconds per document

### 7.2 Scalability
- Support 150-200 entities
- Handle 10,000+ documents
- Concurrent users: 50+

### 7.3 Security
- Role-based access control
- Entity-level data isolation
- Audit logging
- Encryption at rest and in transit

### 7.4 Reliability
- 99.5% uptime
- Graceful degradation
- Error recovery

---

## 8. Success Metrics

### 8.1 Legal Metrics

| Metric | Target |
|--------|--------|
| Time to compliance review | 50% reduction |
| % clauses auto-mapped to laws | > 80% |
| Inconsistencies detected pre-review | > 90% accuracy |
| Legal workload reduction | 30% |

### 8.2 Finance Metrics

| Metric | Target |
|--------|--------|
| Time to retrieve financial data | 70% reduction |
| Reports consolidated per hour | 5x improvement |
| % AI-generated tables accepted after review | > 70% |
| Manual Excel handling reduction | 50% |

### 8.3 Platform Metrics

| Metric | Target |
|--------|--------|
| Output reproducibility score | 100% |
| Hallucination rejection rate | > 99% |
| Human override frequency | < 20% |
| User satisfaction score | > 4.0/5.0 |

---

## 9. Explicitly Excluded (Out of Scope)

| Item | Reason |
|------|--------|
| End-to-end accounting automation | Per TASCO requirements |
| Final legal sign-off | Human judgment required |
| Autonomous decision making | Human-in-the-loop mandatory |
| Real-time law database sync | Phase 2 consideration |
| Multi-language document OCR | Future enhancement |

---

## 10. Phases & Timeline

### Phase 1: POC (Current)
- 1-2 legal document types (Charter, Shareholder Agreement)
- 5-10 sample financial reports
- Core law corpus (Enterprise Law + key Circulars)
- Basic compliance report generation
- Search demo

### Phase 2: Pilot
- Expand to 10 entities
- Full document type coverage
- Finance consolidation templates
- Dashboard and analytics

### Phase 3: Scale
- All 150-200 entities
- Advanced conflict detection
- Workflow integration
- API for external systems

---

## 11. Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| UI Components | shadcn/ui, Tailwind CSS |
| AI Platform | Lyzr SDK (Agents, RAG, Tools) |
| Database | AWS DynamoDB |
| Storage | AWS S3 |
| Search | Vector embeddings + keyword hybrid |
| i18n | react-i18next (EN/VI) |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Law corpus outdated | Version control, regular updates, date validation |
| Hallucinated legal advice | Strict grounding, confidence thresholds, human review |
| Document format variations | Multiple parsers, fallback strategies |
| Entity data isolation breach | Row-level security, entity-scoped queries |
| User adoption resistance | Training, intuitive UI, gradual rollout |

---

## 13. Appendix

### A. Document Type Taxonomy

| Category | Types |
|----------|-------|
| Corporate Governance | Company Charter, Shareholder Agreement, Board Resolutions |
| Policies | Internal Regulations, Approval Policies, HR Policies |
| Legal | M&A Agreements, Contracts, Legal Opinions |
| Financial | Annual Reports, Quarterly Reports, Audit Reports |

### B. Vietnamese Law Sources

| Source | Examples |
|--------|----------|
| Laws | Enterprise Law 2020, Securities Law, Labor Code |
| Decrees | Government implementation decrees |
| Circulars | Ministry-level guidance documents |
| Decisions | Specific regulatory decisions |

### C. Entity Hierarchy Example

```
Tasco Group (Parent)
├── Tasco Auto (Holding)
│   ├── Toyota Dealer Network
│   ├── Ford Dealer Network
│   └── Service Centers
├── Tasco Insurance (Holding)
│   └── Regional Offices
├── DNP Holding (Holding)
│   ├── DNP Water
│   └── DNP Energy
└── Inochi (Subsidiary)
```

---

*Last Updated: January 2025*
*Version: 2.0*
