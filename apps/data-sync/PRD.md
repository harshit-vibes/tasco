# Data Sync - Product Requirements Document

> INC2 | Inochi | Pivot

---

## Key Solutions Demonstrated

This demo addresses data synchronization and quality challenges for Inochi's multi-system architecture:

- **Real-Time Multi-System Sync**: Connects Haravan (sales), Shopee, Website, Fulfillment, and Bravo (ERP) - replacing manual/batch updates that cause daily delays
- **AI-Powered Discrepancy Detection**: Automatically identifies data mismatches between systems - eliminating manual reconciliation that misses errors
- **Proactive Alert System**: Notifies teams of sync issues before they impact order processing and revenue recognition
- **Data Quality Governance**: Validates data consistency across platforms - solving the "data discrepancy rate" problem affecting continuous operations
- **Natural Language Queries**: Ask about sync status and issues in plain language ("Why is order #12345 missing in Bravo?")
- **Audit Trail**: Complete visibility into sync history and discrepancy resolution

**Challenges Addressed:**
1. INC2 - Sales & Revenue Data Synchronization (direct match - NEW proposal)
2. GIS Data Standardization (DNP Water - data quality and standardization pattern)

---

## Overview

**App:** data-sync
**Proposal:** INC2 - Real-time AI-Powered Sales & Revenue Data Synchronization
**Business Unit:** Inochi (Tan Phu Vietnam)
**Type:** Pivot (Integration + LLM)
**Port:** 3007

---

## Problem Statement

Inochi's sales data (Haravan) and invoicing/revenue data (Fulfillment, Bravo) are not synchronized. Manual updates cause daily delays and data discrepancies, affecting order processing and revenue recognition.

---

## Solution

A real-time data synchronization platform that connects multiple systems, detects discrepancies, and provides AI-powered alerts for data quality issues.

---

## Core Features

### MVP Features

- [ ] Multi-system connection status
- [ ] Data discrepancy detection
- [ ] Alert notifications
- [ ] Sync status dashboard

### Future Features

- [ ] Automated reconciliation
- [ ] Root cause analysis
- [ ] Historical trend analysis
- [ ] API health monitoring

---

## User Stories

1. **As an** accountant, **I want to** see sync status **so that** I know if data is current.

2. **As an** IT admin, **I want to** receive mismatch alerts **so that** I can fix issues quickly.

3. **As a** finance manager, **I want to** trust revenue data **so that** I can report accurately.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** System schemas, rules
- **Features:** Monitoring, alerts, Q&A

### Data Sources

- Haravan (sales)
- Shopee (marketplace)
- Bravo (accounting)
- Fulfillment system

---

## UI/UX Requirements

### Pages

1. **Dashboard** - Sync overview
2. **Alerts** - Discrepancy list
3. **Systems** - Connection status
4. **AI Assistant** - Query interface

### Components

- System status cards
- Alert timeline
- Data comparison view
- Chat interface

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Sync latency | < 5 minutes |
| Discrepancy detection | 100% |
| Alert response time | < 1 hour |

---

## Mapped Challenges

This app addresses:
1. **Sales & Revenue Data Sync** (direct match - NEW)
2. **GIS Data Standardization** (DNP Water - data quality)

---

## Sample Alerts

- "Order #12345 exists in Haravan but not in Bravo"
- "Revenue mismatch: Haravan $10,000 vs Bravo $9,500"
- "Shopee sync delayed by 2 hours"
