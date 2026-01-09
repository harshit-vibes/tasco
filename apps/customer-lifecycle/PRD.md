# Customer Lifecycle - Product Requirements Document

> TA1 | Tasco Auto | Pivot

---

## Key Solutions Demonstrated

This demo addresses customer data fragmentation and lifecycle management across Tasco Group:

- **360-Degree Customer Profile**: Unifies fragmented data from Excel files, DMS, service records, and communication channels (Zalo) into a single customer view - solving the "no unified view" problem
- **Sales Rep Relationship Protection**: Customer relationships belong to the company, not individual reps - data persists when employees leave
- **Lead-to-Lifecycle Tracking**: Full journey visibility from social media/press leads through purchase, service, and resale
- **AI-Powered Customer Insights**: Natural language queries on customer data ("show customers due for service this month")
- **Multi-Channel Lead Enrichment**: Captures leads from Facebook, TikTok, YouTube, offline events across 100+ showrooms
- **Personalized Engagement**: AI recommendations for next-best-action based on customer history and behavior patterns

**Challenges Addressed:**
1. TA1 - Customer Lifecycle Management (direct match)
2. Inventory Optimization (Tasco Auto - stock/demand queries)
3. One-Way Rental Fleet Rebalancing (Carpla - fleet lifecycle patterns)
4. B2B Sales Pipeline Management (DNP Holding - sales lifecycle tracking)
5. Material Lifecycle Management (Thang Long - lifecycle management pattern)

---

## Overview

**App:** customer-lifecycle
**Proposal:** TA1 - Customer Lifecycle Management
**Business Unit:** Tasco Auto
**Type:** Pivot (Data + LLM)
**Port:** 3002

---

## Problem Statement

Tasco Auto's customer data is fragmented across multiple systems (DMS, CRM, service records). This makes it difficult to understand customer journey, predict needs, and deliver personalized experiences. Sales and service teams lack a unified view of customer interactions.

---

## Solution

A Customer Data Platform (CDP) with AI-powered insights that unifies customer data and provides intelligent recommendations for engagement.

---

## Core Features

### MVP Features

- [ ] Unified customer profile view
- [ ] Customer timeline/journey visualization
- [ ] AI chatbot for customer queries
- [ ] Basic analytics dashboard

### Future Features

- [ ] Predictive churn analysis
- [ ] Next-best-action recommendations
- [ ] Automated campaign triggers
- [ ] Integration with DMS/CRM

---

## User Stories

1. **As a** sales rep, **I want to** see a customer's complete history **so that** I can personalize my approach.

2. **As a** service advisor, **I want to** know upcoming service needs **so that** I can proactively reach out.

3. **As a** manager, **I want to** see customer health scores **so that** I can prioritize retention efforts.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** Customer data
- **Features:** Chat, data retrieval, insights

### Data Sources

- Customer profiles
- Purchase history
- Service records
- Communication logs

---

## UI/UX Requirements

### Pages

1. **Dashboard** - Overview metrics
2. **Customer Search** - Find customers
3. **Customer Profile** - Detailed view
4. **AI Assistant** - Query interface

### Components

- Customer cards
- Timeline component
- Metric widgets
- Chat interface

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Profile completeness | > 80% |
| Query response time | < 3 seconds |
| User adoption | > 70% of sales team |

---

## Mapped Challenges

This app addresses:
1. **Customer Lifecycle Management** (direct match)
2. **Inventory Optimization** (mapped - stock queries)
3. **One-Way Rental Fleet Rebalancing** (Carpla - fleet queries)
4. **B2B Sales Pipeline** (DNP - sales queries)
5. **Material Lifecycle Management** (Thang Long - lifecycle patterns)

---

## Sample Queries

- "Show me customers due for service this month"
- "What is the purchase history for customer #12345?"
- "Which customers are at risk of churn?"
