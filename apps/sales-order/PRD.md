# Sales Order - Product Requirements Document

> INC1 | Inochi | LLM-Native

---

## Key Solutions Demonstrated

This demo addresses manual order data entry bottlenecks for Inochi's sales operations:

- **Multi-Format Document Processing**: AI extracts order data from PDFs, images, emails, and Zalo messages - eliminating manual keying from non-standardized sources (95% of order volume)
- **Intelligent Field Mapping**: Automatically maps diverse order formats to Bravo ERP's required fields - solving the "missing fields" problem where customer orders lack required ERP data
- **Human-in-the-Loop Validation**: Review and approval interface before system entry - ensuring accuracy while maintaining automation benefits
- **50% Efficiency Target**: Clear ROI metric aligns with Inochi's expectation to save at least 50% of time and resources on order processing
- **Vietnamese OCR Support**: Handles Vietnamese language documents from local customers and suppliers
- **ERP Integration Ready**: Designed for Bravo ERP connection (popular Vietnamese system used for Sales, Inventory, Accounting)

**Challenges Addressed:**
1. INC1 - Order Data Entry Automation (direct match)
2. Computer Vision Inventory (DNP Holding - document/label processing pattern)
3. Underground Elevation Scanner (DNP Water - data extraction from field sources)

---

## Overview

**App:** sales-order
**Proposal:** INC1 - AI-Powered Order Data Entry Automation
**Business Unit:** Inochi (Tan Phu Vietnam)
**Type:** LLM-Native
**Port:** 3006

---

## Problem Statement

Inochi's sale admins manually enter orders from PDF files and images into the SO/Bravo system. This process is time-consuming, error-prone, and creates bottlenecks during peak periods.

---

## Solution

An AI-powered OCR system that automatically extracts order data from documents (PDF, images) and creates sales orders with human review before submission.

---

## Core Features

### MVP Features

- [ ] Document upload (PDF, images)
- [ ] AI-powered data extraction
- [ ] Review/edit interface
- [ ] Bravo system export

### Future Features

- [ ] Email integration (auto-capture)
- [ ] Zalo message parsing
- [ ] Batch processing
- [ ] Error pattern learning

---

## User Stories

1. **As a** sale admin, **I want to** upload order documents **so that** data is extracted automatically.

2. **As a** supervisor, **I want to** review extracted data **so that** I can approve accurate orders.

3. **As a** manager, **I want to** track processing time **so that** I can measure efficiency gains.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** Document Agent
- **Knowledge Base:** Order templates
- **Features:** OCR, data extraction, validation

### Data Sources

- Customer order PDFs
- Order images
- Product catalog
- Customer database

---

## UI/UX Requirements

### Pages

1. **Upload** - Document submission
2. **Review** - Extracted data verification
3. **History** - Processed orders
4. **Dashboard** - Processing metrics

### Components

- File upload zone
- Data form (editable)
- Document preview
- Status indicators

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction accuracy | > 95% |
| Processing time | < 30 seconds |
| Error rate reduction | -80% |

---

## Mapped Challenges

This app addresses:
1. **Order Data Entry Automation** (direct match)
2. **Computer Vision Inventory** (DNP - document processing)
3. **Underground Elevation Scanner** (DNP Water - data extraction)

---

## Sample Documents

- Purchase orders (PDF)
- Order confirmation emails
- Handwritten order forms (images)
- Zalo message screenshots
