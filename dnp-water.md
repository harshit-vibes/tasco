# Session 7: DNP Water & Energy - Leakage Detection & Energy Optimization

> **Briefing Session Transcript**
> **Presented by**: Mr. Phong (covering for DNP Water & Energy team)
> **Facilitated by**: Laura (GenAI Fund)
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### DNP Water

| Attribute | Details |
|-----------|---------|
| **Type** | Holding company for water treatment |
| **Plants** | ~15 water treatment plants |
| **Locations** | Hanoi, Ho Chi Minh City, Ben Tre, other provinces |
| **Core Asset** | Water distribution networks |
| **Revenue Driver** | Managing loss ratio effectively |
| **Growth Strategy** | M&A (acquiring existing water companies) |

### DNP Energy

| Attribute | Details |
|-----------|---------|
| **Type** | New internal venture |
| **Focus** | Energy storage and optimization |
| **Scope** | Internal Tasco factories first |
| **Potential Savings** | ~$7 million USD (50% energy cost reduction) |
| **Future** | Commercialize to other industrial zones |

### Strategic Fit

DNP Water and DNP Holding form a closed-loop ecosystem:
```
DNP Plastic (Pipe Producer) → DNP Water (Pipe User) → Water Distribution
```

---

## Challenge 1: Smart Leakage Analysis

### Current State

| Metric | Value |
|--------|-------|
| **Current Leakage Rate** | 15% |
| **National Average** | 30% |
| **Target** | Below 10% |

### Current Detection Process

```
IoT Sensors (every 15 min) → Data Visualization → Manual Analysis
                                                        ↓
                            Anomaly Detection (by experienced staff)
                                                        ↓
                    Field Team → Isolate Segment → Increase Pressure
                                                        ↓
                    Pinpoint Zone → Construction Team → Excavate
```

**Timeline**: Can take up to 15 days from leak occurrence to pinpoint location

### Pain Points

| Issue | Description |
|-------|-------------|
| **People Dependent** | Requires experienced technical staff |
| **Time Consuming** | Up to 15 days to locate exact leak |
| **Manual Analysis** | Staff read charts to detect anomalies |
| **Trial and Error** | Isolate segments, test pressure, narrow down |

### Previous POC Results

A startup attempted ML-based leak detection:

| Metric | Result |
|--------|--------|
| **Accuracy** | 40-50% (4-5 correct out of 10 identified) |
| **Position Error** | Up to 50 meters from actual leak |
| **Root Cause** | Poor input data quality |

### Data Quality Issues

> "The quality of all GIS data is one of the questions."

Factors affecting model accuracy:
- Pipe depth (1m vs 1.2m gives different results)
- Pipe age and quality
- Joint locations
- Network complexity
- Elevation data

### Requirements

1. **Real-time Detection**: Reduce lead time from 1 month to immediate
2. **Accurate Positioning**: Pinpoint leak location precisely
3. **Handle Data Imperfection**: Work despite GIS data quality (3-4/10)
4. **Cost Effective**: Within budget constraints (government-controlled water pricing)

---

## Challenge 2: Automated Water Network Data Standardization

### GIS Data Current State

| Aspect | Status |
|--------|--------|
| **Data Exists** | Yes |
| **Data Quality** | 3-4 out of 10 |
| **Completeness** | Missing information, inconsistent |
| **Collection Period** | Different time periods |

### Requirements

| Need | Description |
|------|-------------|
| **Data Cleaning** | Standardize existing GIS data |
| **Fill Gaps** | Complete missing information |
| **Improve Quality** | From 3-4/10 to 8/10 |
| **Cost Effective** | Must justify ROI in controlled pricing environment |

### Use Cases

1. **Software Solution**: Automate cleanup of existing data
2. **On-site Survey**: Complete GIS information in the field
3. **Validation**: Verify pipe length, quality, elevation, joints

---

## Challenge 3: Underground Elevation Scanner

### Problem

Need to detect pipe depth and condition underground without excavation.

### Requirements

| Requirement | Details |
|-------------|---------|
| **Form Factor** | Handheld device |
| **Detection** | Pipe depth underground |
| **Technology** | Open (GPR or other - must be cost effective) |
| **Cost** | Must be affordable |

### Usage Pattern

| Type | Frequency |
|------|-----------|
| **Initial Survey** | Major one-time project |
| **Ongoing** | Occasional inspections |
| **M&A** | Survey acquired water company networks |

### In-Pipe Inspection (CCTV Crawlers)

| Consideration | Assessment |
|---------------|------------|
| **Wastewater Pipes** | Easier - large diameter, can retrieve |
| **Clean Water Pipes** | Challenging - small branches to households |
| **Status** | Never tried, open to explore |
| **Concern** | Retrieval from complex network |

---

## Challenge 4: Smart Energy Orchestration

### Concept

Optimize energy usage across Tasco factories through intelligent storage and distribution.

### Energy Sources

- Solar systems
- Excess production energy
- Power grid

### Strategy

```
Store Energy (off-peak/solar) → Intelligent Redistribution → Use (peak times)
```

### Requirements

| Requirement | Description |
|-------------|-------------|
| **Peak/Downtime Balancing** | Buffer energy intelligently |
| **Loss Detection** | Identify operational issues driving energy loss |
| **Optimization** | Reduce overall energy costs |
| **Intelligent System** | Account for time of day, weather, sensors |

### Success Target

| Metric | Target |
|--------|--------|
| **Energy Cost Reduction** | 50% |
| **Potential Savings** | ~$7 million USD |
| **Scope** | Internal Tasco factories first |

### Regulatory Context

- Electricity tariff structures are publicly available
- Time-of-use pricing exists
- Maximum demand charges being trialed

### Not Yet Applicable

- EV car integration for load balancing (low EV penetration in Vietnam)
- Vehicle-to-grid concepts (consumers not ready)

---

## Q&A Summary

### Water/Leakage

| Question | Answer |
|----------|--------|
| **Current leakage level?** | 15% (national: 30%) |
| **Target?** | Below 10% |
| **Current monitoring?** | IoT every 15 min + manual analysis |
| **Previous POC?** | 40-50% accuracy, 50m position error |
| **GIS data quality?** | 3-4 out of 10 |
| **In-pipe robots?** | Never tried, open but concerned about retrieval |
| **Handheld device tech?** | Open - must be cost effective |

### Energy

| Question | Answer |
|----------|--------|
| **Main challenge?** | Peak/downtime balancing, energy loss |
| **Tariff structure?** | Publicly available in Vietnam |
| **EV integration?** | Not yet - low penetration |
| **Savings potential?** | $7M USD (50% reduction) |

### General

| Question | Answer |
|----------|--------|
| **Startup vs scale-up?** | Open to both (DNP Energy is startup itself) |
| **POC budget?** | Available, depends on proposal |
| **Partner selection?** | ROI-focused |
| **Technology preference?** | AI, big data, fast/efficient over heavy equipment |

---

## Solution Opportunities

### For Leakage Analysis

| Area | Solution Type |
|------|---------------|
| **ML Models** | Anomaly detection that handles imperfect data |
| **Digital Twin** | Network visualization and simulation |
| **Real-time Alerts** | Immediate leak detection |
| **Precise Location** | Improve from 50m error to exact position |

### For GIS Data

| Area | Solution Type |
|------|---------------|
| **Data Cleaning** | Automated standardization |
| **Gap Filling** | AI-assisted data completion |
| **Validation** | Cross-reference and verify |
| **Survey Tools** | Cost-effective field data collection |

### For Underground Scanner

| Area | Solution Type |
|------|---------------|
| **GPR Devices** | Ground-penetrating radar |
| **Alternative Tech** | Other non-invasive detection |
| **Handheld Form** | Portable, easy to use |
| **Cost Optimization** | Affordable for controlled-price industry |

### For Energy

| Area | Solution Type |
|------|---------------|
| **Storage Optimization** | When to store vs use |
| **Demand Forecasting** | Predict usage patterns |
| **Weather Integration** | Solar/wind considerations |
| **Loss Detection** | Identify energy waste |

---

## Key Constraints

1. **Government-Controlled Pricing**: Water prices regulated - must justify ROI
2. **Cost Effectiveness**: Solutions must be affordable, not heavy equipment
3. **Data Quality**: Must work with imperfect GIS data (3-4/10)
4. **Network Complexity**: Branches down to household level
5. **M&A Growth**: Solution must be reusable for acquired networks

---

## Success Metrics

### Water

| Metric | Current | Target |
|--------|---------|--------|
| **Loss Ratio** | 15% | <10% |
| **Detection Time** | Up to 1 month | Real-time |
| **GIS Quality** | 3-4/10 | 8/10 |
| **Position Accuracy** | 50m error | Exact |

### Energy

| Metric | Target |
|--------|--------|
| **Cost Reduction** | 50% |
| **Savings** | $7M USD |
| **Scope** | Internal first, then commercial |
