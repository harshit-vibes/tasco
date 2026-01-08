# Session 2: Tasco Auto - Inventory Optimization & Customer Lifecycle

> **Briefing Session Transcript**
> **Presented by**: Anton (Tasco Auto)
> **Facilitated by**: Laura (GenAI Fund), Tina (Translation)
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### Tasco Auto Structure

Tasco Auto operates in two distinct business branches:

| Branch | Type | Brands | Market Position |
|--------|------|--------|-----------------|
| **Dealership** | Non-exclusive distribution | Toyota, Hyundai, etc. (14-15 brands) | ~30% market share per brand, competing with other dealers |
| **Sole Distribution** | 100% exclusive in Vietnam | Vinfast, GWM (Haval), GAC (Lynk & Co), Lotus | Full control: import, distribution, all dealers |

### Sole Distribution Brands (Focus Area)

| Brand | Status | Showrooms | Models | Data Availability |
|-------|--------|-----------|--------|-------------------|
| Vinfast | Established | 2-3 | 3 | Comprehensive |
| GWM (Haval/GLE) | 1+ year in market | Part of 100+ | Multiple | Available in DMS |
| GAC (Lynk & Co) | ~1 year in market | Part of 100+ | Multiple | Available in DMS |
| Lotus | Launching next year | Planned | TBD | New |

**Combined Scale (New Brands):** 100+ showrooms, 30+ car models

### Current Systems

| System | Status | Notes |
|--------|--------|-------|
| **DMS (Dealer Management System)** | Launched ~2 months ago | Still preliminary, room for improvements |
| **ERP** | Exists per dealership | Fragmented across first branch |
| **Customer Data** | Manual/Excel | No unified system |
| **Communication** | Zalo | Direct from sales agents to customers |

---

## Problem Statement 1: Customer Lifecycle Management (CDP/CRM)

### Vision

> "We are not positioning ourselves to selling car only, but selling the **lifestyle**."

Each brand has an associated lifestyle and brand identity, with mobility services and merchandising beyond just vehicle sales.

### Challenge Overview

Need 360-degree customer view to serve and support customers throughout:
- Vehicle usage
- Daily mobility needs
- Full ownership lifecycle

### Current Pain Points

| Issue | Description |
|-------|-------------|
| **Fragmented Systems** | Everything done manually through Excel files |
| **No Unified View** | Cannot track customer journey across touchpoints |
| **Sales Rep Dependency** | When reps leave, customer relationships go with them |
| **Manual Processes** | Labor-intensive, error-prone |

### Customer Lifecycle Stages

```
Lead Generation → First Contact → Purchase → Service Usage → Resale
     ↓                ↓              ↓            ↓            ↓
Social media    Showroom visit   Vehicle     Maintenance    Trade-in
Press           Test drive       delivery    Car wash       Second-hand
Events          Negotiation                  Accessories    sale
```

### Marketing Channels

| Channel | Budget Share | Platforms |
|---------|--------------|-----------|
| Press/Publicity | ~33% | Traditional media |
| Social Media | ~33% | Facebook, TikTok, YouTube |
| Trade Marketing | ~33% | Offline events at showrooms |

### Requirements

1. **360-degree Customer View**: Unified platform for all customer data
2. **Full Lifecycle Tracking**: From first brand contact to vehicle resale
3. **Lead Enrichment**: Capture and enrich leads from all marketing channels
4. **Service Integration**: Track post-purchase service usage
5. **Ownership Protection**: Customer relationships belong to company, not individual reps
6. **DMS Integration**: Must work with existing (new) DMS system

---

## Problem Statement 2: Inventory Optimization & Import Process

> **Priority Level: HIGH - More Critical and Urgent**

### Challenge Overview

AI-powered inventory prediction and optimization for sole distribution brands across 100+ showrooms in Vietnam.

### Business Context

| Aspect | Details |
|--------|---------|
| **Import Frequency** | Monthly (just-in-time principle) |
| **Inventory Cycle Target** | Maximum 3 months |
| **Decision Scope** | When to order, what models, which colors, what configurations |

### The Core Problem

| Scenario | Business Impact |
|----------|-----------------|
| **Understocked** | Missed sales opportunities, lost revenue, unhappy dealers |
| **Overstocked** | High inventory costs, capital tied up, exceeds 3-month threshold |

### Prediction Requirements

Must predict demand across multiple dimensions:

| Dimension | Granularity |
|-----------|-------------|
| **Showroom** | 100+ locations across Vietnam |
| **Car Model** | 30+ models |
| **Color** | Various options per model |
| **Configuration** | Different specs/variants |
| **Region** | Geographic demand patterns |
| **Time** | Monthly (potentially more frequent) |

### Supply Chain Scope

**Full touchpoint management required:**
```
Import Order → OEM Production → Shipping → Port Arrival →
Inspection → Warehouse → Dealer Delivery → Customer
```

- Quality control at each checkpoint
- Transparency across all stakeholders
- Order tracking and delivery status visibility

### OEM Data Sharing

| Data Type | Description |
|-----------|-------------|
| **Production Schedules** | When orders will be manufactured |
| **Delivery Timelines** | When shipments will arrive in Vietnam |
| **Order Tracking** | Status updates throughout process |

### Success Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Missed Sales** | 0% | Every dealer order fulfilled immediately |
| **Inventory Cycle** | < 3 months | No vehicle stays in inventory beyond threshold |
| **Cash Cycle** | Minimize | LC opening → Import → Sale → Payment collection |

### Measurement Approach

1. Baseline metrics captured before pilot
2. Same metrics measured after pilot implementation
3. Quantifiable improvement = success

---

## Q&A Summary

### Inventory Management

| Question | Answer |
|----------|--------|
| **Prediction frequency?** | Monthly (may increase with volume growth) |
| **Include import inspection?** | Yes - full supply chain from import to delivery |
| **Quality control?** | Every checkpoint requires QC |
| **Third-party involvement?** | Tasco manages entire process; may outsource trucking |
| **Which brands to focus?** | GWM, GAC, Lotus (new brands with 100+ showrooms) |
| **Historical data available?** | Yes - 1+ year for GWM/GAC, importing to DMS |

### Customer Management

| Question | Answer |
|----------|--------|
| **Current CDP vendor?** | None at Tasco Auto level |
| **Communication channel?** | Zalo (direct from sales agents) |
| **Fleet/corporate sales?** | ~10% of revenue |

### Solution Approach

| Question | Answer |
|----------|--------|
| **End-to-end vs point solution?** | Both welcome - propose where your product fits |
| **Pilot preference?** | Short-term quick wins for inventory (urgent), long-term integration |

---

## Solution Approach Preference

| Timeline | Approach | Priority |
|----------|----------|----------|
| **Short-term** | Quick, out-of-box solutions for inventory management | **HIGH - Urgent** |
| **Long-term** | Integrated end-to-end system | Medium |

### Proposal Options

Startups can propose:
- **End-to-end solution**: Complete system covering all requirements
- **Point solution**: Single component addressing specific step in the process

---

## Key Differentiators for Success

1. **Inventory Challenge (Priority)**:
   - Accurate demand prediction at granular level
   - Support for monthly import cycles
   - Clear ROI through reduced missed sales and inventory costs

2. **Customer Lifecycle Challenge**:
   - Unified customer view across fragmented systems
   - Protection of customer relationships from sales rep turnover
   - Integration with new DMS system

---

## Data Availability for POC

| Data Type | Availability |
|-----------|--------------|
| Historical sales | 1+ year (GWM, GAC) |
| Showroom data | 100+ locations |
| Model/variant data | 30+ models |
| OEM schedules | Available upon order placement |
| Current inventory | In DMS system |
