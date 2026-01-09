# Promotion Control - Product Requirements Document

> INC4 | Inochi | Pivot

---

## Key Solutions Demonstrated

This demo addresses promotion management chaos for Inochi's sales and marketing teams:

- **AI Rules Engine for Overlap Detection**: Automatically identifies conflicting promotions across customers, products, and time periods - replacing manual Excel/email tracking that causes errors
- **Proactive Conflict Alerts**: Notifies Sales/Marketing teams before promotions go live with potential issues - preventing customer confusion and revenue leakage
- **Multi-Dimensional Promotion View**: Calendar/timeline visualization of all active and planned promotions by customer segment, product group, and sales channel
- **Automated Reporting**: Daily/weekly/monthly promotion reports generated automatically - eliminating manual update burden on teams
- **Natural Language Queries**: Ask about promotion status and conflicts ("Which promotions apply to VIP customers next month?")
- **Historical Analysis**: AI learns from past promotion patterns to predict and prevent future conflicts

**Challenges Addressed:**
1. INC4 - Promotion Overlap Control (direct match - NEW proposal)

---

## Overview

**App:** promotion-control
**Proposal:** INC4 - AI Rules Engine for Promotion Overlap Control
**Business Unit:** Inochi (Tan Phu Vietnam)
**Type:** Pivot (Rules Engine + LLM)
**Port:** 3008

---

## Problem Statement

Inochi cannot track the effectiveness and overlap of multiple promotions. Manual management via Excel/email leads to synchronization issues, potential errors, and overlap between customers, products, and time periods.

---

## Solution

An AI-powered promotion management system that detects overlaps, validates rules, and alerts teams about potential conflicts before they impact customers.

---

## Core Features

### MVP Features

- [ ] Promotion calendar view
- [ ] Overlap detection
- [ ] Rule validation
- [ ] Alert notifications

### Future Features

- [ ] Promotion effectiveness analytics
- [ ] AI recommendations
- [ ] Automated conflict resolution
- [ ] Integration with POS

---

## User Stories

1. **As a** marketing manager, **I want to** see all active promotions **so that** I can plan campaigns effectively.

2. **As a** sales lead, **I want to** detect overlaps **so that** I can avoid customer confusion.

3. **As a** finance analyst, **I want to** track promotion costs **so that** I can measure ROI.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** Promotion rules
- **Features:** Rule engine, alerts, Q&A

### Data Sources

- Promotion database
- Product catalog
- Customer segments
- Sales data

---

## UI/UX Requirements

### Pages

1. **Calendar** - Promotion timeline
2. **Rules** - Promotion definitions
3. **Alerts** - Overlap warnings
4. **AI Assistant** - Query interface

### Components

- Calendar/Gantt view
- Rule editor
- Conflict cards
- Chat interface

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Overlap detection | 100% |
| False positive rate | < 5% |
| Planning time reduction | -50% |

---

## Mapped Challenges

This app addresses:
1. **Promotion Overlap Control** (direct match - NEW)

---

## Sample Alerts

- "Promotion A and B both apply 20% discount to Product X"
- "Customer segment 'VIP' eligible for 3 overlapping promotions"
- "Promotion C ends after Promotion D starts with same products"
