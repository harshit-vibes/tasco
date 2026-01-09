# Challenge to Proposal Mapping

> Maps all 21 original challenges to the 8 submitted proposals

## Summary

| Metric | Count |
|--------|-------|
| Total Proposals Submitted | 8 |
| Direct Challenge Matches | 6 |
| NEW Proposals (not in original 21) | 2 |
| Stale Challenges (no direct proposal) | 15 |

---

## 8 Proposals Overview

| Code | Proposal Name | Business Unit | Lyzr Fit |
|------|---------------|---------------|----------|
| G1 | Compliance & Document Governance | Tasco Group | LLM |
| TA1 | Customer Lifecycle Management | Tasco Auto | Pivot |
| INS2 | AI Sales & Pricing Cockpit | Tasco Insurance | Pivot |
| INS3 | AI E-Learning Factory | Tasco Insurance | LLM |
| INS4 | AI Risk & Profitability Radar | Tasco Insurance | Pivot |
| INC1 | Order Data Entry Automation | Inochi | LLM |
| INC2 | Sales & Revenue Data Sync | Inochi | Pivot |
| INC4 | Promotion Overlap Control | Inochi | Pivot |

---

## Direct Matches (6)

These challenges have 1:1 mapping to submitted proposals.

| # | Challenge | Business Unit | Proposal |
|---|-----------|---------------|----------|
| 1 | Compliance & Document Governance | Tasco Group | G1 |
| 2 | Customer Lifecycle Management | Tasco Auto | TA1 |
| 3 | AI Sales & Pricing Cockpit | Tasco Insurance | INS2 |
| 4 | AI E-Learning Factory | Tasco Insurance | INS3 |
| 5 | Risk & Profitability Radar | Tasco Insurance | INS4 |
| 6 | Sales Order Automation | Inochi | INC1 |

---

## NEW Proposals (2)

These proposals were submitted but were NOT in the original 21 challenges.

| Code | Proposal Name | Business Unit | Description |
|------|---------------|---------------|-------------|
| INC2 | Sales & Revenue Data Sync | Inochi | Real-time sync between Haravan, Shopee, Bravo |
| INC4 | Promotion Overlap Control | Inochi | AI rules engine for promotion management |

---

## Stale Challenges (15)

These challenges do not have direct proposals. Mapped to closest matching proposal.

### Tasco Group (1 stale)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Finance Consolidation | **G1** | Same business unit, both involve data governance and consolidation |

### Tasco Auto (1 stale)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Inventory Optimization | **TA1** | Same business unit, operational efficiency focus |

### Carpla (2 stale - NO PROPOSALS)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| One-Way Rental Fleet Rebalancing | **TA1** | Automotive domain, fleet/vehicle management |
| Service Center Quality Assurance | **INS3** | Quality monitoring, training/education focus |

### Tasco Insurance (4 stale)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Asset Damage Assessment | **INS2** | Assessment/pricing related, same BU |
| AI Accounting & Reconciliation | **INS4** | Risk/finance monitoring, same BU |
| Moto Liability Insurance Chatbot | **INS3** | Training/education domain, same BU |
| AI Underwriting Model | **INS2** | Pricing/risk assessment, same BU |

### DNP Holding/CMC (2 stale - NO PROPOSALS)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| B2B Sales Pipeline Management | **TA1** | Customer lifecycle, sales management |
| Computer Vision Inventory | **INC1** | Automation, data entry/OCR |

### DNP Water (3 stale - NO PROPOSALS)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Smart Leakage Analysis | **INS4** | Risk monitoring, anomaly detection |
| GIS Data Standardization | **INC2** | Data synchronization, standardization |
| Underground Elevation Scanner | **INC1** | OCR/data extraction automation |

### DNP Energy (1 stale - NO PROPOSALS)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Smart Energy Orchestration | **INS4** | Monitoring, optimization, alerting |

### Thang Long (1 stale - NO PROPOSALS)

| Challenge | Closest Proposal | Rationale |
|-----------|------------------|-----------|
| Material Lifecycle Management | **TA1** | Lifecycle management pattern |

---

## Proposal Load Distribution

After mapping all 21 challenges + 2 NEW proposals:

| Proposal | Direct | Stale Mapped | Total Load |
|----------|--------|--------------|------------|
| G1 | 1 | 1 | **2** |
| TA1 | 1 | 4 | **5** |
| INS2 | 1 | 2 | **3** |
| INS3 | 1 | 2 | **3** |
| INS4 | 1 | 4 | **5** |
| INC1 | 1 | 2 | **3** |
| INC2 | 0 (NEW) | 1 | **1** |
| INC4 | 0 (NEW) | 0 | **1** |

---

## Business Units Without Proposals

The following business units have challenges but NO submitted proposals:

| Business Unit | Challenges | Recommended Focus |
|---------------|------------|-------------------|
| Carpla | 2 | Map to TA1 (automotive) or INS3 (quality) |
| DNP Holding/CMC | 2 | Map to TA1 (sales) or INC1 (automation) |
| DNP Water | 3 | Map to INS4 (monitoring) or INC2 (data) |
| DNP Energy | 1 | Map to INS4 (optimization) |
| Thang Long | 1 | Map to TA1 (lifecycle) |

**Total: 9 challenges from 5 business units without proposals**

---

## App Structure

8 apps in flat structure (one per proposal):

```
apps/
├── compliance-qa/       # G1 - Compliance + Finance Consolidation
├── customer-lifecycle/  # TA1 - Customer Lifecycle + Inventory + Carpla + DNP Sales + Thang Long
├── sales-pricing/       # INS2 - Sales & Pricing + Damage Assessment + Underwriting
├── e-learning/          # INS3 - E-Learning + Service Center + Moto Chatbot
├── risk-radar/          # INS4 - Risk Radar + Accounting + Leakage + Energy
├── sales-order/         # INC1 - Order Entry + CV Inventory + Elevation Scanner
├── data-sync/           # INC2 - Data Sync + GIS Data
└── promotion-control/   # INC4 - Promotion Control
```

**Total: 8 apps matching 8 proposals**
