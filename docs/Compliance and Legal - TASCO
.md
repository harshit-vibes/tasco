Compliance and Legal - TASCO

1. Executive Summary (Why this POC matters)
TASCO is not looking for a chatbot or isolated AI experiment. They are facing structural governance bottlenecks caused by:
150–200 legal entities


Extremely small legal & finance teams


High regulatory exposure


Manual, fragmented document handling


Failed past attempts with ChatGPT due to hallucination, inconsistency, and lack of control


This POC proposes an Agentic AI Governance & Financial Intelligence Platform that acts as a controlled, auditable, human-in-the-loop assistant for Legal/Compliance and Finance/Accounting, tightly grounded in TASCO’s own documents and Vietnamese regulations.
The POC focuses on assistive intelligence, not full automation—exactly aligned with TASCO’s stated expectations.

2. Core Use Cases Identified (From Transcript)
Use Case Cluster A – Legal & Compliance (Primary Priority)
Explicitly stated by CEO:
Policy & document compliance checking


Company charters


Shareholder agreements


Board/shareholder resolutions


Internal policies


M&A agreements


Cross-checking against:


Vietnamese laws


Decrees


Circulars


Internal governance rules


Detecting:


Conflicts


Inconsistencies


Missing clauses


Outdated references to laws


Reducing legal team overload


Current team: ~4 core legal staff supporting ~200 entities



Use Case Cluster B – Finance & Accounting Intelligence (Secondary Priority)
Explicitly stated by CEO:
Search & retrieval across financial reports


Annual / quarterly reports


Multi-year documents


Multiple subsidiaries


Assisted financial consolidation


NOT full automation


Assist with:


Horizontal aggregation


Draft tables


Template population


Preliminary commentary


Drafting analytical commentary


Human review mandatory


AI provides first draft insights


Consistency & determinism


Zero tolerance for hallucinated numbers


All outputs must be traceable to source documents



3. Explicit Pain Points (Extracted Verbatim & Interpreted)
Governance & Legal
❌ Legal documents scattered across personal laptops


❌ No standardized structure across subsidiaries


❌ Manual comparison with laws is slow & error-prone


❌ AI tools require manual copy-paste


❌ ChatGPT:


Breaks instructions over time


Produces inconsistent outputs


Hallucinates interpretations


❌ No traceability of AI outputs back to source law/article



Finance & Accounting
❌ Too many reports to manually search


❌ Manual consolidation is slow


❌ Existing AI tools:


Invent numbers


Change logic across runs


❌ No confidence in AI output reproducibility



4. Problem Statement (PRD)
TASCO lacks a scalable, controlled, and auditable system to standardize, search, validate, and analyze legal and financial documents across 150–200 subsidiaries, resulting in operational overload, compliance risk, and slow decision-making.

5. Solution Overview (POC Scope)
A Private, Agentic AI Governance Platform that:
Operates on TASCO-controlled document repositories


Uses deterministic, instruction-locked agents


Enforces human-in-the-loop


Provides explainable, traceable outputs


Is modular and deployable per department



6. POC Scope Definition (Important for Winning)
Included
✅ Legal compliance analysis
 ✅ Financial document intelligence
 ✅ Search, comparison, draft assistance
 ✅ Traceable, explainable AI outputs
Explicitly Excluded (as per transcript)
❌ End-to-end accounting automation
 ❌ Final legal or financial sign-off
 ❌ Autonomous decision making
This alignment is critical to TASCO’s trust.

7. Key Differentiating Value (HIGHLIGHT FOR JUDGES)
These are the features other startups are unlikely to emphasize clearly enough:
Instruction-locked agents that DO NOT drift over time


Clause-level compliance mapping with citation to specific law articles


Deterministic outputs (same input → same result)


Source-document grounding for every answer


Designed explicitly for legal & finance teams, not generic chat


Built for subsidiaries with uneven digital maturity


Human-in-the-loop by design, not as an afterthought



8. Functional Requirements
A. Document Intelligence Layer
Ingest:


PDF


Word


Excel


Google Docs / Sheets


OCR optional (future)


Metadata extraction:


Company


Year


Document type


Legal entity



B. Legal Compliance Capabilities
Clause extraction


Law / Decree / Circular retrieval


Clause-to-law mapping


Conflict detection


Gap identification


Compliance summary report


Output example:
Clause 4.2 of Shareholder Agreement conflicts with Article 135, Enterprise Law 2020 (amended 2023)

C. Finance Intelligence Capabilities
Cross-company search (natural language)


Draft consolidation tables


Template-based aggregation


Draft analytical commentary


Cross-year comparison



9. Agent Design (Core of the POC)
1. Document Ingestion Agent
Parses documents


Extracts structured sections


Normalizes formats



2. Legal Knowledge Agent
Maintains updated law corpus


Indexes decrees & circulars


Version control for laws



3. Compliance Analysis Agent
Compares clauses vs laws


Flags inconsistencies


Generates explainable findings


🔥 High-value: Clause-level reasoning with citations

4. Financial Intelligence Agent
Extracts financial figures


Aligns to predefined templates


Prevents hallucination via strict schema validation



5. Search & Retrieval Agent
Semantic + keyword hybrid search


Filters by entity, year, document type



6. Consistency & Validation Agent
Verifies outputs against source


Rejects unverifiable answers


Ensures repeatability


🔥 Differentiator: Deterministic execution pipeline

7. Human-in-the-Loop Review Agent
Flags “review required”


Supports inline comments


Tracks acceptance / rejection



10. Agentic Architecture (Textual Diagram)
User (Legal / Finance)
        |
        v
Intent Router Agent
        |
        +-------------------+
        |                   |
Compliance Flow        Finance Flow
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


11. Analytics & Success Metrics
Legal
Time to compliance review ↓


% clauses auto-mapped to laws


inconsistencies detected pre-review


Legal workload reduction estimate



Finance
Time to retrieve financial data ↓


reports consolidated per hour


% AI-generated tables accepted after review


Reduction in manual Excel handling



Platform-level
Output reproducibility score


Hallucination rejection rate


Human override frequency



12. Why This POC Will Win vs Others
Most competitors will propose:
“AI chatbot for documents”


“RAG + ChatGPT”


“Automation hype”


Your proposal:
Speaks exactly TASCO’s language


Respects their AI skepticism


Shows deep understanding of legal & finance workflows


Emphasizes control, auditability, and scale



13. Next Steps (POC Execution Plan – Optional Slide)
Select 1–2 legal document types (e.g., Charter, Shareholder Agreement)


Select 5–10 sample financial reports


Configure law corpus (Enterprise Law + Circulars)


Deliver:


Compliance report


Financial draft tables


Search demo


Measure time saved vs manual baseline




