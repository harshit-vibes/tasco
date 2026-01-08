# Session 4: Tasco Insurance - AI for Insurance Operations

> **Briefing Session Transcript**
> **Presented by**: Mr. Phong, Mr. Hieu, Mrs. Tao
> **Facilitated by**: Laura (GenAI Fund)
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### Tasco Insurance at a Glance

| Attribute | Details |
|-----------|---------|
| **Type** | Non-life insurance subsidiary of Tasco Group |
| **Started** | January 1, 2024 (2 years old) |
| **Revenue** | 70 million USD (1,500 billion VND) |
| **Ranking** | Top 10 non-life insurance in Vietnam |
| **Growth** | One of the fastest growing insurance companies |
| **Personnel** | 1,000+ employees |
| **Branches** | Grew from 2 to 30+ branches |
| **Products** | ~30 insurance policies/products |

### Revenue Breakdown

| Product Category | Revenue Share |
|------------------|---------------|
| **Motor Vehicle Insurance** | 90% |
| - Car Insurance | Primary |
| - Liability Insurance | Compulsory |
| Health Insurance | Limited |
| Marine Insurance | Limited |
| Other Products | Limited |

### Competitive Advantage

Tasco Insurance benefits from Tasco Group's ecosystem:
- **VTC** (mobility services)
- **Tasco Auto** (automotive distribution)
- Access to car buyer data at point of sale

### Key Pain Point: Loss Ratio

> "Our loss ratio is roughly 10% higher than the market average."

**Root Causes:**
- New to market - limited historical data
- Unable to do proper credit scoring for customers
- Pricing based on asset value only (not risk-based)
- No selective pricing based on customer risk profiles
- Haven't segmented loss ratio by cohorts yet

---

## Seven Challenges

### Challenge 1: Asset Damage Assessment & Claims

**Problem**: Claims processing workload is overwhelming and time-consuming.

| Aspect | Current State |
|--------|---------------|
| **Processing Time** | 1 day to 1 month (depends on complexity) |
| **Volume** | Cannot process all claims timely |
| **Process** | Manual assessment by inspectors |

**Current Claims Workflow:**

```
Customer calls → Call Center (speech-to-text) → Claim Ticket Created
                                                        ↓
                            Inspector assigned (based on location)
                                                        ↓
                    Inspector meets customer at showroom → Mobile App
                    (photos, evidence, damage recording)
                                                        ↓
                            Backend Server → Supervisor Review
                                                        ↓
                    Negotiation (cost estimation, parts needed)
                                                        ↓
                            Approval → Invoice → Payment
```

**Current Technology:**
- Mobile app for inspectors (data collection, photo evidence)
- Call center with speech-to-text transcription
- Backend processing system
- Some OpenAI usage for image classification (limited)

**Fraud Detection:**
- Currently relies on inspector expertise
- Case studies collected when fraud detected
- No AI model for fraud detection yet
- Example: Inspectors can detect color discrepancies indicating pre-existing damage

**Opportunity**: AI for damage assessment, fraud detection, automated processing

---

### Challenge 2: AI Sales & Pricing for Motor Vehicle Insurance

**Problem**: Pricing is not risk-based, leading to higher loss ratios.

| Current State | Desired State |
|---------------|---------------|
| Pricing based on asset value only | Risk-based pricing |
| No customer credit scoring | Customer risk profiles |
| No cohort analysis | Segmented loss ratio analysis |
| Limited data utilization | AI-driven pricing models |

**Approach**: Co-pilot design (not 100% autonomous)

> "We cannot rely 100% on AI output. The system should suggest and recommend, but the person who makes the decision is ultimately from Tasco Insurance."

**Opportunity**: Risk-based pricing models, customer segmentation, predictive analytics

---

### Challenge 3: AI E-Learning Factory

**Problem**: Scaling training for 1,000+ personnel across 30+ branches with traditional methods.

| Current State | Challenge |
|---------------|-----------|
| Training by internal trainers | Not scalable |
| Classroom-based | Inconsistent quality |
| No LMS system | No standardization |
| Experience-based | Hard to replicate |

**Context:**
- Scaled from 2 branches to 30+ branches
- Staff come from various insurance backgrounds
- Need continuous training and development
- Starting from scratch with no existing system

**Opportunity**: LMS platform, AI-powered training, knowledge base, certification system

---

### Challenge 4: AI Risk & Profitability Radar

**Problem**: Need better visibility into risk exposure and profitability across products and segments.

| Product Category | Digitization Status |
|------------------|---------------------|
| Motor Vehicle Insurance | Fully digitalized (core product) |
| Health Insurance | Excel + Core system |
| Other Products | Partially digitalized |

**Opportunity**: Risk analytics dashboard, profitability analysis, cohort segmentation

---

### Challenge 5: AI Accounting & Reconciliation

**Problem**: Processing millions of transactions for insurance-specific accounting.

| Aspect | Details |
|--------|---------|
| **System** | Internal accounting software |
| **Data Export** | CSV export and API connections available |
| **Complexity** | Insurance-specific transactions (not simple ledger) |
| **Volume** | Millions of transactions |

**Note**: Insurance accounting is unique - includes policy transactions, claims, premiums, etc.

**Opportunity**: AI reconciliation, anomaly detection, reporting co-pilot

---

### Challenge 6: Moto Liability Insurance - 1 Million Policies

**Problem**: Liability insurance is sold 100% offline with 60-70% cost of sales.

| Current State | Target |
|---------------|--------|
| 100% offline sales | 100% online experience |
| 60-70% cost of sales | Significantly reduced |
| <5% online at Tasco | Majority online |
| <10% online in Vietnam market | Lead the market |

**Business Context:**
- Liability insurance is compulsory in Vietnam
- Most policies are renewals (not new customers)
- Current sales model is unsustainable (costs exceed price cap)

**Two Key Success Factors:**

1. **Right Timing**: When does customer want to transact?
2. **Frictionless Process**: Fast, efficient, no blockages

**Opportunity**: Digital sales platform, automated renewal, frictionless UX

---

### Challenge 7: AI Underwriting Model

**Problem**: Need better underwriting decisions based on risk assessment.

| Current State | Desired State |
|---------------|---------------|
| Asset value-based pricing | Risk-based underwriting |
| Limited data utilization | Comprehensive risk models |
| Manual assessment | AI-assisted decisions |

**Opportunity**: Underwriting AI, risk scoring, automated policy decisions

---

## Q&A Summary

### General

| Question | Answer |
|----------|--------|
| **AI autonomy level?** | Co-pilot design - AI suggests, humans decide |
| **Claims processing time?** | 1 day to 1 month depending on complexity |
| **Number of products?** | ~30 policies across all non-life categories |
| **Focus products?** | 90% revenue from motor vehicle insurance |

### Data & Systems

| Question | Answer |
|----------|--------|
| **Mobile app?** | Yes - for inspectors to collect evidence |
| **Call center?** | Yes - with speech-to-text |
| **AI usage?** | Limited - some OpenAI for image classification |
| **Fraud detection?** | Manual - based on inspector expertise |
| **Data for training?** | Collected but not yet used for AI models |

### Products & Sales

| Question | Answer |
|----------|--------|
| **Online sales?** | <5% at Tasco, <10% in Vietnam market |
| **New product launch time?** | 3-7 days for configuration |
| **Selling motorbike insurance online?** | Not yet on e-commerce platforms |
| **Loss ratio causes?** | Not yet segmented by cohort |

### E-Learning

| Question | Answer |
|----------|--------|
| **Current training system?** | None - traditional classroom only |
| **Competitive intelligence?** | No system for competitor comparison |

---

## Technical Details

### Product Launch Process

| Phase | Timeline |
|-------|----------|
| **Analysis & Development** | Depends on research complexity |
| **System Configuration** | 3-7 days (shortest: 1-2 days) |

### Claims Data Flow

1. **Customer Call** → Call center records (voice + text)
2. **Ticket Creation** → Assigned to inspector
3. **Inspection** → Mobile app (photos, evidence)
4. **Backend Processing** → Supervisor review
5. **Negotiation** → Cost estimation with showrooms
6. **Approval** → Documentation, invoice, payment

### Data Availability

| Data Type | Status |
|-----------|--------|
| Call recordings | ✅ Available (with transcription) |
| Claim photos/evidence | ✅ Available |
| Policy transactions | ✅ Available |
| Fraud case studies | ✅ Collected |
| AI training datasets | ⚠️ Not yet prepared |

---

## What They're Looking For

### Startup Experience

> "We expect startups to have worked with insurance companies in Vietnam or other markets, including Southeast Asia or globally."

### Solution Approach

1. **Learn from best practices** in other markets
2. **Adapt to Vietnam context**
3. **Share relevant insurance experience**

### Proposal Tips

- List relevant insurance industry experience
- Highlight work with other insurance companies
- Be specific about which challenge you're addressing
- Consider Vietnam market nuances

---

## Solution Opportunities Summary

| Challenge | Key Opportunity |
|-----------|-----------------|
| **1. Claims** | AI damage assessment, fraud detection, automation |
| **2. Sales & Pricing** | Risk-based pricing, customer segmentation |
| **3. E-Learning** | LMS platform, AI training, knowledge base |
| **4. Risk & Profitability** | Analytics dashboard, cohort analysis |
| **5. Accounting** | AI reconciliation, anomaly detection |
| **6. Liability Insurance** | Digital sales platform, frictionless UX |
| **7. Underwriting** | AI risk scoring, automated decisions |
