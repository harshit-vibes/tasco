# Session 6: Inochi / Thanh Phu Plastic - Sales Order Automation

> **Briefing Session Transcript**
> **Presented by**: Mr. Huy (Thanh Phu Plastic)
> **Facilitated by**: Laura (GenAI Fund), Mr. Phong
> **Format**: Live Q&A with Vietnamese-English translation

---

## Organization Overview

### Company Structure

**Thanh Phu Plastic** is a subsidiary of DNP Holding, which belongs to Tasco Group.

### Three Business Lines

| Business Line | Description |
|---------------|-------------|
| **Inochi** | Consumer products brand - popular on e-commerce, modern trade, exports |
| **Hard Packaging** | Rigid plastic packaging products |
| **Soft Packaging** | Nylon, carrier bags for supermarkets, etc. |

### Inochi Brand

- Popular consumer products in Vietnam
- Sold on e-commerce channels and modern trade (supermarkets)
- Successfully exports to foreign countries
- Well-known brand in Vietnamese market

---

## Problem Statement: Sales Order Data Entry Automation

### Challenge Overview

Automating the data entry process for sales orders that come from multiple channels in non-standardized formats.

### Current Pain Points

| Issue | Description |
|-------|-------------|
| **Multiple Channels** | Orders via email, Zalo (messaging app), PDF images |
| **Non-Standardized** | Different formats from different sources |
| **Manual Data Entry** | Staff must manually key in orders to ERP |
| **Missing Fields** | Customer orders often lack required ERP fields |
| **Data Inconsistencies** | Errors from manual migration between systems |
| **Batch Processing** | Retail data syncs daily/every few days, not real-time |

### Order Sources

| Source | Format | Volume |
|--------|--------|--------|
| **Email** | Various formats | Part of 95% |
| **Zalo (Messaging)** | Text, images | Part of 95% |
| **PDF/Images** | Scanned orders | Part of 95% |
| **E-commerce/Retail** | System data | ~5% |

### Current Systems

| System | Purpose | Usage |
|--------|---------|-------|
| **Bravo ERP** | Main ERP system | 95% of sales volume |
| **Haravan** | Retail platform | Part of 5% |
| **OmniCell** | Partner system | Part of 5% |

### Bravo ERP Details

- Popular Vietnamese ERP system
- **Modules**: Sales, Inventory, Accounting, Finance
- **Order Entry**: 100% via web application (no mobile)
- **Built-in Workflows**: Inventory checking before order finalization
- **Challenge**: Need to import data from external sources

### Data Flow

```
Orders from Multiple Channels (Email, Zalo, PDF)
                    ↓
            Manual Data Entry
                    ↓
        Bravo ERP (Web Application)
                    ↓
     Inventory Check → Order Finalization
```

**Retail/E-commerce Flow:**
```
Haravan / OmniCell
        ↓
  Batch Export (daily/few days)
        ↓
  Manual Import to Bravo
        ↓
  Data Inconsistencies
```

### Success Metric

> "We expect AI can help us save at least **50% of the time and resources** spent on the whole process."

---

## Q&A Summary

### Order Processing

| Question | Answer |
|----------|--------|
| **Order sources?** | Email, Zalo (messaging), PDF images |
| **Order format?** | Not standardized - varies by source |
| **Sample order form?** | Can be provided in follow-up meeting |
| **Order entry method?** | 100% web application (Bravo ERP) |
| **Mobile app?** | No - web only |

### Systems & Integration

| Question | Answer |
|----------|--------|
| **Main ERP?** | Bravo ERP (popular Vietnamese system) |
| **ERP modules?** | Sales, Inventory, Accounting, Finance |
| **Retail systems?** | Haravan, OmniCell |
| **Integration needed?** | Haravan + OmniCell → Bravo sales module |
| **Current integration?** | Batch process (not real-time) |

### Data & Volume

| Question | Answer |
|----------|--------|
| **Order split?** | 95% Bravo direct, 5% retail/e-commerce |
| **Data inconsistency cause?** | Manual migration, batch processing |
| **Built-in validations?** | Yes - inventory check before finalization |

---

## Requirements

### Integration Points

Need to integrate with Bravo ERP:
1. **Haravan** (retail platform)
2. **OmniCell** (partner system)

### AI/Automation Needs

1. **Multi-format Order Parsing**
   - Email text extraction
   - Zalo message parsing
   - PDF/image OCR and data extraction

2. **Data Standardization**
   - Map various formats to Bravo ERP fields
   - Handle missing required fields
   - Validate data before import

3. **Real-time Sync**
   - Replace batch processing with real-time
   - Reduce data inconsistencies

---

## Solution Opportunities

| Area | Solution Type |
|------|---------------|
| **Order Parsing** | AI/OCR to extract data from emails, messages, PDFs |
| **Data Mapping** | Intelligent field mapping to ERP schema |
| **Validation** | Automated data quality checks |
| **Integration** | API connectors for Haravan, OmniCell → Bravo |
| **Real-time Sync** | Replace batch with continuous sync |

### Technical Considerations

- Bravo ERP has web-based interface - may have API or import capabilities
- Multiple input formats require flexible parsing
- Vietnamese language support needed
- Image/PDF quality may vary

---

## Key Differentiators for Success

1. **50% Efficiency Target**: Clear ROI metric
2. **Known Systems**: Bravo ERP is popular in Vietnam
3. **Multi-channel Input**: Opportunity for AI-powered parsing
4. **Integration Focus**: Haravan + OmniCell are specific targets
5. **Sample Data Available**: Can provide order forms for POC
