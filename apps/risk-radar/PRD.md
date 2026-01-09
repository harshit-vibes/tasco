# Risk Radar - Product Requirements Document

> INS4 | Tasco Insurance | Pivot

---

## Key Solutions Demonstrated

This demo addresses risk visibility and proactive monitoring challenges across Tasco Group:

- **Real-Time Risk Dashboard**: Replaces delayed, manually-processed Excel reports with live monitoring - solving the "data fragmented across multiple systems" problem
- **AI-Powered Anomaly Detection**: Early warning system for loss ratio spikes, claim anomalies, and profitability issues - enabling proactive intervention
- **Natural Language Insights**: Query risk data conversationally ("Why did profitability drop in Q3?") - making analytics accessible to non-technical executives
- **Multi-Dimensional Analysis**: Tracks risk exposure by region, product, customer segment, and time period - supporting cohort analysis that wasn't possible before
- **Integrated Data View**: Consolidates contracts, premiums, claims, reinsurance, and accounting data - addressing the fragmentation across core insurance, accounting, and CRM systems
- **Compliance Monitoring**: Enhanced risk management and compliance capabilities matching rapid growth (2 branches to 33 in 2 years)

**Challenges Addressed:**
1. INS4 - AI Risk & Profitability Radar (direct match)
2. AI Accounting & Reconciliation (mapped - financial anomaly detection)
3. Smart Leakage Analysis (DNP Water - anomaly detection pattern for 15% leakage)
4. Smart Energy Orchestration (DNP Energy - monitoring and optimization for $7M savings potential)

---

## Overview

**App:** risk-radar
**Proposal:** INS4 - AI Risk & Profitability Radar
**Business Unit:** Tasco Insurance
**Type:** Pivot (Analytics + LLM)
**Port:** 3005

---

## Problem Statement

Tasco Insurance's risk management relies on delayed Excel reports. Data is fragmented across systems, making it difficult to monitor loss ratios, detect anomalies, and make proactive decisions. Management lacks real-time visibility into risk exposure.

---

## Solution

A real-time risk monitoring dashboard with AI-powered alerts, anomaly detection, and natural language insights on business performance.

---

## Core Features

### MVP Features

- [ ] Real-time risk dashboard
- [ ] Loss ratio monitoring
- [ ] AI-generated alerts
- [ ] Natural language insights

### Future Features

- [ ] Predictive risk modeling
- [ ] Automated recommendations
- [ ] Drill-down analysis
- [ ] Report generation

---

## User Stories

1. **As an** executive, **I want to** see risk overview **so that** I can make strategic decisions.

2. **As a** risk manager, **I want to** receive anomaly alerts **so that** I can investigate issues early.

3. **As a** finance lead, **I want to** track profitability **so that** I can optimize resource allocation.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** Risk data, policies
- **Features:** Chat, analytics, alerts

### Data Sources

- Claims data
- Premium data
- Reinsurance data
- Accounting data

---

## UI/UX Requirements

### Pages

1. **Dashboard** - Risk overview
2. **Alerts** - Anomaly notifications
3. **Analysis** - Detailed metrics
4. **AI Assistant** - Query interface

### Components

- Metric cards
- Charts/graphs
- Alert list
- Chat interface

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Alert accuracy | > 85% |
| Detection time | < 24 hours |
| Dashboard adoption | > 90% of managers |

---

## Mapped Challenges

This app addresses:
1. **AI Risk & Profitability Radar** (direct match)
2. **AI Accounting & Reconciliation** (mapped - financial monitoring)
3. **Smart Leakage Analysis** (DNP Water - anomaly detection)
4. **Smart Energy Orchestration** (DNP Energy - monitoring)

---

## Sample Queries

- "What is our current loss ratio by region?"
- "Show me claims anomalies from last week"
- "Why did profitability drop in Q3?"
