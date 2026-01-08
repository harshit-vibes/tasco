# Session 5: DNP Holding & CMC Tiles - B2B Sales & Inventory Management

> **Briefing Session Transcript**
> **Presented by**: Mr. Kung (DNP Holding), Mr. Zung (CMC Tiles - Supply Chain)
> **Facilitated by**: Laura (GenAI Fund), Mr. Phong
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### DNP Holding Structure

DNP Holding is a holding company under Tasco Group with multiple subsidiaries:

| Subsidiary | Business |
|------------|----------|
| **DNP Plastic** | Plastic pipes for construction |
| **CMC Tiles** | Construction tiles and materials |
| Other subsidiaries | Various construction-related products |

### Business Model

- **B2B Focus**: Selling to construction projects
- **Sales Organization**: 100+ B2B sales personnel
- **Sales Cycle**: ~2 years for construction materials
- **Sales Approach**: Project-based (not company-based)
- **Territory**: Each salesperson assigned specific region with full responsibility

---

## Problem Statement 1: B2B Sales Pipeline Management

### Challenge Overview

Managing 100+ B2B sales representatives selling construction materials (pipes, tiles) to construction projects with long sales cycles.

### Current Pain Points

| Issue | Description |
|-------|-------------|
| **No Sales Tools** | No CRM or pipeline management system |
| **Manual Reporting** | Supervisors aggregate reports manually |
| **Timing** | Missing the "golden time" to engage stakeholders |
| **Visibility** | Management lacks real-time pipeline visibility |
| **2-Year Cycle** | Long sales cycle hard to track manually |

### Sales Process

**Three Key Stakeholders in Construction Projects:**
1. **Investors** - Project owners/funders
2. **Contractors** - Construction companies
3. **Design Consultants** - Provide specifications

**Product Sequence:**
- Plastic pipes typically come first in construction timeline
- Tiles follow later in the project

### Sales Authorization

Each salesperson has:
- Comprehensive control over their region
- Pricing authority for projects
- Full responsibility for target customers
- Decision-making power

### Requirements

**For Sales Representatives:**
- Pipeline management tools
- Alerts for optimal engagement timing
- Stakeholder interaction tracking
- Project progress monitoring

**For Management (PMO):**
- View all sales pipelines
- Visualize regional performance
- Monitor major projects
- Ensure accurate, timely updates

### Current State

| Aspect | Status |
|--------|--------|
| **CRM/Sales Tools** | None |
| **Reporting** | Manual (field → supervisor → aggregate) |
| **Pipeline Tracking** | Excel-based, manual |
| **Stakeholder Outreach** | Email, targeted but manual |

---

## Problem Statement 2: Computer Vision for Inventory Counting

### Challenge Overview

Using AI/computer vision to count and manage inventory of construction materials (tiles, pipes) in warehouses.

### CMC Tiles - Scale

| Metric | Value |
|--------|-------|
| **Inventory Volume** | 5 million square meters of tiles |
| **Current Counting Time** | 15 days for full reconciliation |
| **Staff Involved** | 50 people (operators, inventory control, accountants) |
| **ERP System** | Bravo (popular Vietnamese ERP) |

### Current Process (Manual)

```
Receive Product → Count → Store in Warehouse
                             ↓
                    Move to Pallet → Load Truck → Deliver
                    (Count at each checkpoint)
```

**Problem at Each Step:**
- Manual counting is error-prone
- Miscounts cascade through the system
- Requires stock replenishment due to calculation errors

### Tile Counting Challenges

| Challenge | Description |
|-----------|-------------|
| **SKU Complexity** | Same surface pattern can have different frame/backing = different SKU |
| **Label Issues** | Labels on back of tiles get blurred, scratched, mixed |
| **Material Variations** | Different materials, frames, spines, lengths |
| **Visual Similarity** | Products look similar but are different SKUs |

### DNP Plastic Pipe Counting Challenges

**Two Approaches:**

| Approach | Method | Pros | Cons |
|----------|--------|------|------|
| **Body Reading** | Read spec/SKU printed on pipe body | Accurate SKU | Hard to access in storage, manual |
| **Pipe End Counting** | Count from cross-section view | Camera-friendly | Same diameter ≠ same SKU (thickness varies) |

**Pipe Specifications:**
- Smallest pipe: ~19mm diameter
- Different thickness = different SKU (even with same diameter)
- Not transparent (no need - used for water flow)

### Recent Improvements

DNP has developed a **layout system**:
- Planned palette/area allocation for specific products
- "Right product, right place" approach
- Still requires reconciliation and counting per palette area

### Success Metrics

| Metric | Target |
|--------|--------|
| **Cost Reduction** | 50% reduction in inventory staff (50 → 25) |
| **Accuracy** | Eliminate manual counting errors |
| **Speed** | Faster than 15-day reconciliation cycle |
| **Days in Inventory** | Reduce inventory holding time |
| **Space Optimization** | Identify empty palettes, optimize allocation |

### Data Availability

| Data Type | Status |
|-----------|--------|
| **Inventory Movements** | ✅ Available (historical) |
| **ERP Data** | ✅ Available (Bravo system) |
| **Excel Records** | ✅ Available (current SKU/location) |
| **Layout Maps** | ✅ Available (new system) |
| **Images** | ❌ Not systematically collected |

**Note**: Data must be protected and masked for POC/training.

### Quality Inspection

> "For quality inspections, it's possible, but not the focus at the first stage. We want to apply counting first because it's easier. Quality inspection may require other methods beyond visual."

Quality inspection is a future phase - not current priority.

---

## Q&A Summary

### B2B Sales

| Question | Answer |
|----------|--------|
| **Current tools?** | None - all manual reporting |
| **Tech savviness of users?** | Not mentioned, assume basic |
| **Sales cycle?** | ~2 years for construction projects |
| **Stakeholders?** | Investors, contractors, design consultants |

### Inventory/Computer Vision

| Question | Answer |
|----------|--------|
| **Are pipes transparent?** | No - not needed for water flow |
| **Pipe size?** | Smallest ~19mm diameter |
| **Inventory staff?** | 50 people |
| **Current ERP?** | Bravo (Vietnamese ERP) |
| **Counting time?** | 15 days for full reconciliation |
| **Quality inspection?** | Future phase, not current focus |
| **Image data available?** | No - relied on personnel expertise |

### Data & POC

| Question | Answer |
|----------|--------|
| **Mock data for POC?** | Layout maps + Excel data available |
| **Data protection?** | Must be masked/protected |
| **Training data?** | Need to collect images |

---

## Solution Opportunities

### For B2B Sales Pipeline

| Area | Solution Type |
|------|---------------|
| **CRM System** | Pipeline management for 100+ sales reps |
| **Engagement Timing** | AI to detect optimal stakeholder contact times |
| **Progress Tracking** | Real-time project status updates |
| **Management Dashboard** | Pipeline visualization across regions |
| **Alert System** | Notifications for key project milestones |

### For Inventory Counting

| Area | Solution Type |
|------|---------------|
| **Computer Vision** | Camera-based counting at warehouse/truck |
| **SKU Recognition** | AI to identify product type from visual |
| **Pallet Tracking** | Empty space detection, optimization |
| **Reconciliation** | Automated vs manual counting comparison |
| **Integration** | Connect with Bravo ERP |

### Technical Considerations

**For Tiles:**
- Need to handle label degradation
- Must distinguish backing/frame variations
- Surface pattern alone is not sufficient for SKU

**For Pipes:**
- Pipe end counting is camera-friendly
- Must detect thickness from cross-section
- Body reading may still be needed for verification

---

## Key Differentiators for Success

1. **Counting Challenge Priority**: Focus on counting first, quality inspection later
2. **50% Cost Reduction Target**: Clear ROI metric for inventory management
3. **15-Day Baseline**: Significant improvement opportunity in reconciliation time
4. **No Existing Tools**: Greenfield opportunity for sales pipeline
5. **2-Year Sales Cycle**: Long cycle means high value per project
