# Sales Pricing - Product Requirements Document

> INS2 | Tasco Insurance | Pivot

---

## Key Solutions Demonstrated

This demo addresses motor vehicle insurance pricing and sales efficiency challenges for Tasco Insurance:

- **Instant Quote Generation**: Reduces quotation time from 5-10 minutes (Excel-based) to under 1 minute - solving the slow response time problem that loses sales
- **Risk-Based Pricing Guidance**: AI co-pilot provides pricing recommendations based on vehicle data, customer risk profiles, and claims history - addressing the 10% higher-than-market loss ratio
- **Pricing Rules Knowledge Base**: RAG-powered assistant answers pricing questions instantly ("What discounts can I apply for fleet customers?")
- **Co-Pilot Design**: AI suggests and recommends, but human makes final decision - matching Tasco Insurance's requirement for human-in-the-loop
- **Multi-Factor Risk Assessment**: Considers vehicle type, region, customer segment, historical claims - moving beyond simple asset-value-based pricing
- **Sales Agent Empowerment**: Builds professional, digitized image while maintaining sales agent autonomy on pricing decisions

**Challenges Addressed:**
1. INS2 - AI Sales & Pricing Cockpit (direct match)
2. Asset Damage Assessment (mapped - assessment and pricing integration)
3. AI Underwriting Model (mapped - risk-based pricing foundation)

---

## Overview

**App:** sales-pricing
**Proposal:** INS2 - AI Sales & Pricing Cockpit
**Business Unit:** Tasco Insurance
**Type:** Pivot (ML + LLM)
**Port:** 3003

---

## Problem Statement

Tasco Insurance's quotation process is manual and Excel-based, taking 5-10 minutes per vehicle. This leads to slow response times, inconsistent pricing, and missed sales opportunities. Sales agents lack real-time guidance on optimal pricing strategies.

---

## Solution

An AI-powered pricing cockpit that generates instant quotes, provides pricing recommendations, and helps sales agents close deals faster.

---

## Core Features

### MVP Features

- [ ] Instant quote generation (< 1 minute)
- [ ] Pricing guidelines assistant
- [ ] Quote comparison tool
- [ ] Basic risk indicators

### Future Features

- [ ] Dynamic pricing based on risk models
- [ ] Competitor price benchmarking
- [ ] Conversion prediction
- [ ] Automated approval workflows

---

## User Stories

1. **As a** sales agent, **I want to** generate quotes instantly **so that** I can respond to customers quickly.

2. **As a** branch manager, **I want to** see pricing trends **so that** I can optimize our competitiveness.

3. **As an** underwriter, **I want to** review risk factors **so that** I can approve quotes confidently.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** Pricing rules, guidelines
- **Features:** Chat, calculations, recommendations

### Data Sources

- Vehicle data
- Pricing rules
- Claims history
- Risk factors

---

## UI/UX Requirements

### Pages

1. **Quote Generator** - Main pricing interface
2. **Guidelines Assistant** - Pricing Q&A
3. **Dashboard** - Sales metrics

### Components

- Quote form
- Price breakdown
- Risk indicators
- Chat assistant

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Quote generation time | < 1 minute |
| Quote accuracy | > 95% |
| Conversion rate improvement | +10% |

---

## Mapped Challenges

This app addresses:
1. **AI Sales & Pricing Cockpit** (direct match)
2. **Asset Damage Assessment** (mapped - assessment pricing)
3. **AI Underwriting Model** (mapped - risk assessment)

---

## Sample Queries

- "What's the quote for a 2023 Toyota Camry in Hanoi?"
- "Why is this quote higher than standard?"
- "What discounts can I apply for fleet customers?"
