# PRD: Customer Lifecycle Management & Inventory Optimization System

> **App Code:** TA1 | **App Name:** customer-lifecycle | **Business Unit:** Tasco Auto

---

## 1. Executive Summary

### Business Context

Tasco Auto operates as part of Tasco Group with:
- **100+ showrooms** across Vietnam
- **16 brands** in portfolio (dealership model)
- **3 sole distribution brands**: GWM (Haval), GAC (Lynk & Co), Lotus (100% exclusive)
- **30+ vehicle models** across sole distribution brands
- **Monthly import cycles** with just-in-time inventory strategy

### Vision

> "Selling lifestyle, not just cars"

Tasco Auto aims to transform from a traditional automotive dealer to a customer-centric lifestyle brand, leveraging AI to optimize every touchpoint from first contact to repeat purchase.

### The Challenge

Tasco Auto faces **TWO critical problem statements**:

| # | Problem Statement | Priority | Current Status |
|---|-------------------|----------|----------------|
| 1 | Customer Lifecycle Management | Medium | Implemented |
| 2 | Inventory Optimization & Import Process | **HIGH - More Critical** | **Not Implemented** |

### Key Solutions Demonstrated

This demo addresses customer data fragmentation and lifecycle management across Tasco Group:

- **360-Degree Customer Profile**: Unifies fragmented data from Excel files, DMS, service records, and communication channels (Zalo) into a single customer view
- **Sales Rep Relationship Protection**: Customer relationships belong to the company, not individual reps - data persists when employees leave
- **Lead-to-Lifecycle Tracking**: Full journey visibility from social media/press leads through purchase, service, and resale
- **AI-Powered Customer Insights**: Natural language queries on customer data
- **Multi-Channel Lead Enrichment**: Captures leads from Facebook, TikTok, YouTube, offline events across 100+ showrooms
- **Personalized Engagement**: AI recommendations for next-best-action based on customer history and behavior patterns
- **Inventory Optimization**: Vehicle stock tracking with supply chain visibility (NEW)

### Challenges Addressed

1. TA1 - Customer Lifecycle Management (direct match)
2. Inventory Optimization (Tasco Auto - stock/demand queries)
3. One-Way Rental Fleet Rebalancing (Carpla - fleet lifecycle patterns)
4. B2B Sales Pipeline Management (DNP Holding - sales lifecycle tracking)
5. Material Lifecycle Management (Thang Long - lifecycle management pattern)

---

## 2. Problem Statement

### From Proposal TA1: Customer Lifecycle Pain Points

| Pain Point | Description | Impact |
|------------|-------------|--------|
| **Leads not optimized** | Online leads not fully captured or processed | Lost sales opportunities |
| **Suboptimal distribution** | No intelligent lead routing to sales reps | Uneven workload, slow response |
| **Untimely follow-up** | Sales follow-up relies on individual experience | Inconsistent customer experience |
| **Inconsistent CX** | No standardized customer journey | Brand perception varies |
| **Dispersed marketing** | Marketing activities fragmented across channels | No unified ROI view |
| **Fragmented data** | Customer data in silos (DMS, CRM, spreadsheets) | No 360-degree view |

### From Challenge Brief: Inventory Pain Points

| Pain Point | Description | Impact |
|------------|-------------|--------|
| **Understocking** | Insufficient inventory for customer demand | Missed sales (0% target) |
| **Overstocking** | Excess inventory tying up capital | Cash flow problems |
| **Long cycles** | Inventory sitting > 3 months | Depreciation, storage costs |
| **No visibility** | 12-stage supply chain not tracked | Planning difficulties |
| **Manual processes** | Excel-based inventory management | Errors, delays |

### Key Business Drivers

From the challenge brief:

> "For sole-distribution brands (GWM, GAC, Lotus), Tasco controls 100% of import decisions. The core challenge is: **Understocked = missed sales, Overstocked = capital tied up**."

Target metrics:
- **Missed Sales**: 0%
- **Inventory Cycle**: < 3 months
- **Cash Cycle**: Minimize days from Letter of Credit to customer payment

---

## 3. Use Case Clusters

### Cluster A: Lead Management & Conversion

**Primary Users:** Sales Representatives, Sales Managers

| Use Case | Description | AI Capability |
|----------|-------------|---------------|
| Lead Capture | Aggregate leads from all channels (web, social, showroom, referral) | Auto-classification |
| Lead Scoring | Prioritize leads based on conversion likelihood | AI scoring model |
| Lead Distribution | Route leads to optimal sales rep | Rule-based + AI matching |
| Lead Nurturing | Track and optimize conversion funnel | Next-best-action |
| Lead-to-Inventory Matching | Match lead interests to available vehicles | Real-time matching |

### Cluster B: Customer 360 & Retention

**Primary Users:** Sales Representatives, Customer Success, Marketing

| Use Case | Description | AI Capability |
|----------|-------------|---------------|
| Customer Profile | Unified view of all customer data and interactions | Data aggregation |
| Segmentation | Classify customers (VIP, Regular, At-Risk, New) | ML clustering |
| Churn Prediction | Identify customers likely to leave | Predictive model |
| Lifetime Value | Calculate and track CLV per customer | LTV scoring |
| Upsell/Cross-sell | Recommend additional products/services | Recommendation engine |

### Cluster C: Inventory Optimization (NEW - HIGH PRIORITY)

**Primary Users:** Inventory Managers, Procurement, Showroom Managers

| Use Case | Description | AI Capability |
|----------|-------------|---------------|
| Vehicle Tracking | Track every vehicle from order to delivery | VIN-level tracking |
| Supply Chain Visibility | Monitor 12-stage pipeline | Status tracking |
| Stock Level Analytics | Monitor inventory by showroom, brand, model | Real-time dashboards |
| Age Monitoring | Alert on vehicles exceeding thresholds | Age-based alerts |
| Demand Forecasting | Predict optimal order quantities | ML forecasting |
| Import Order Management | Track OEM orders and timelines | Order lifecycle |

### Cluster D: Marketing & Campaigns

**Primary Users:** Marketing Team, Campaign Managers

| Use Case | Description | AI Capability |
|----------|-------------|---------------|
| Campaign Creation | Design targeted marketing campaigns | Template library |
| Segment Targeting | Target campaigns to customer segments | Audience selection |
| Performance Tracking | Monitor campaign ROI and effectiveness | Analytics dashboard |
| Attribution | Track lead source to conversion | Multi-touch attribution |

---

## 4. Functional Requirements

### 4.1 Lead Management

| Requirement | Priority | Status |
|-------------|----------|--------|
| Create, edit, view, delete leads | High | Implemented |
| Lead search and filtering | High | Implemented |
| Lead status workflow (New → Contacted → Qualified → Nurturing → Converted → Lost) | High | Implemented |
| Lead source tracking | Medium | Implemented |
| AI-powered lead scoring | High | Implemented |
| Lead score factors breakdown | Medium | Implemented |
| Multi-entity filtering | High | Implemented |

### 4.2 Lead Distribution & Routing (PARTIAL)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Manual lead assignment | Medium | Implemented |
| Auto-assignment rules (round-robin) | High | **Not Implemented** |
| Geography-based routing | Medium | **Not Implemented** |
| Workload balancing | Medium | **Not Implemented** |
| Response time SLAs | High | **Not Implemented** |

### 4.3 Task & Follow-up System (NOT IMPLEMENTED)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Create tasks for leads/customers | High | **Not Implemented** |
| Due date and priority | High | **Not Implemented** |
| Reminder notifications | High | **Not Implemented** |
| Overdue task alerts | Medium | **Not Implemented** |
| Manager oversight view | Medium | **Not Implemented** |

### 4.4 Customer 360 Profile

| Requirement | Priority | Status |
|-------------|----------|--------|
| Unified customer view | High | Implemented |
| Customer segmentation (VIP, Regular, At-Risk, New) | High | Implemented |
| Interaction history timeline | High | Implemented |
| Purchase history tracking | High | Implemented |
| AI-powered insights | High | Implemented |
| Churn risk indicators | Medium | Implemented |

### 4.5 Inventory Management (NEW - HIGH PRIORITY)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Vehicle CRUD operations | High | ✅ Implemented |
| VIN-level tracking | High | ✅ Implemented |
| 12-stage supply chain status | High | ✅ Implemented |
| Inventory age tracking | High | ✅ Implemented |
| Age alerts (>60 days, >90 days) | High | ✅ Implemented |
| Stock level by showroom/brand/model | High | ✅ Implemented |
| Vehicle reservation for leads | Medium | ✅ Implemented |
| Link to customer purchases | Medium | ✅ Implemented |

### 4.6 Import Order Management (NEW)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Import order CRUD | High | ✅ Implemented |
| Order timeline tracking | High | ✅ Implemented |
| OEM confirmation status | Medium | ✅ Implemented |
| Letter of Credit tracking | Medium | ✅ Implemented |
| Expected arrival dates | High | ✅ Implemented |
| Actual vs expected variance | Medium | ✅ Implemented |

### 4.7 Campaign Management

| Requirement | Priority | Status |
|-------------|----------|--------|
| Create, edit, view campaigns | High | Implemented |
| Campaign status workflow | High | Implemented |
| Target segment selection | High | Implemented |
| Budget tracking | Medium | Implemented |
| Performance metrics (sent, opened, clicked, converted) | High | Implemented |
| ROI calculation | Medium | Implemented |

### 4.8 Analytics & Reporting

| Requirement | Priority | Status |
|-------------|----------|--------|
| Dashboard with KPIs | High | Implemented |
| Lead conversion funnel | Medium | Partial |
| Campaign performance | High | Implemented |
| AI recommendations | High | Implemented |
| Inventory analytics | High | **Not Implemented** |
| Inventory age distribution | Medium | **Not Implemented** |

---

## 5. Agent Architecture

### Multi-Agent System Overview

The Customer Lifecycle app employs a **multi-agent architecture** with specialized domain experts. Users can select which agent to chat with based on their needs, or use the General Assistant for cross-functional queries.

### Agent Lineup

| Agent Key | Name | Role | Domain | Status |
|-----------|------|------|--------|--------|
| `customer-lifecycle:assistant` | General Assistant | `main` | All-purpose queries | ✅ Active |
| `customer-lifecycle:lead-expert` | Lead Expert | `expert` | Lead scoring, qualification, prioritization | ✅ Implemented |
| `customer-lifecycle:customer-expert` | Customer Expert | `expert` | Churn analysis, LTV, retention | ✅ Implemented |
| `customer-lifecycle:inventory-expert` | Inventory Expert | `expert` | Stock levels, aging, supply chain | ✅ Implemented |
| `customer-lifecycle:campaign-expert` | Campaign Expert | `expert` | Marketing ROI, segmentation, performance | ✅ Implemented |
| `customer-lifecycle:lead-scorer` | Lead Scorer | `analyzer` | Automated lead scoring (JSON output) | ✅ Active |

### Agent Icons & Colors

| Agent | Icon | Color | Tailwind Class |
|-------|------|-------|----------------|
| General Assistant | Sparkles | Violet | `bg-violet-100 text-violet-600` |
| Lead Expert | Target | Red | `bg-red-100 text-red-600` |
| Customer Expert | Users | Emerald | `bg-emerald-100 text-emerald-600` |
| Inventory Expert | Car | Blue | `bg-blue-100 text-blue-600` |
| Campaign Expert | Megaphone | Amber | `bg-amber-100 text-amber-600` |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Interface                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent Selector: [General ▼] [Lead] [Customer] ...  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Selected Agent  │
                    │  (Direct Call)   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   General   │    │    Lead     │    │  Customer   │
│  Assistant  │    │   Expert    │    │   Expert    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │    ┌─────────────┴─────────────┐    │
       │    │                           │    │
       ▼    ▼                           ▼    ▼
   ┌─────────────┐              ┌─────────────┐
   │  Inventory  │              │  Campaign   │
   │   Expert    │              │   Expert    │
   └──────┬──────┘              └──────┬──────┘
          │                            │
          └────────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  Business Data   │
            │  Knowledge Base  │
            └──────────────────┘
```

### Agent Specializations

#### General Assistant
- Cross-functional queries spanning all domains
- Dashboard insights and recommendations
- Routing suggestions to specialist agents
- Fallback for unclassified queries

#### Lead Expert
- Lead scoring and prioritization (Hot/Warm/Cold)
- Conversion funnel analysis
- Lead source effectiveness comparison
- Sales rep assignment recommendations
- Follow-up timing optimization

#### Customer Expert
- Churn risk prediction and prevention
- Customer lifetime value (LTV) analysis
- Customer segmentation (VIP, Regular, At-Risk)
- Retention strategy recommendations
- Service reminder optimization

#### Inventory Expert
- Vehicle inventory tracking across showrooms
- 12-stage supply chain visibility
- Aging analysis (>60 days warning, >90 days critical)
- Import order tracking (GWM, GAC, Lotus)
- Lead-to-inventory matching

#### Campaign Expert
- Campaign ROI calculation
- Multi-channel performance comparison
- A/B testing insights
- Segment targeting recommendations
- Budget allocation optimization

### Sample Queries by Agent

| Agent | Sample Queries |
|-------|----------------|
| General | "What's the overview of my dashboard?", "Summary of this week" |
| Lead Expert | "Which leads should I prioritize today?", "Score breakdown for hot leads" |
| Customer Expert | "Who is at highest churn risk?", "Top VIP customers by LTV" |
| Inventory Expert | "Vehicles aging over 60 days?", "When is the next GAC shipment?" |
| Campaign Expert | "Best performing campaign this month?", "ROI comparison by channel" |

### Environment Variables

```env
# Main Agent
NEXT_PUBLIC_LYZR_AGENT_ID=xxx

# Multi-Agent IDs
NEXT_PUBLIC_LYZR_LEAD_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_CUSTOMER_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_INVENTORY_EXPERT_ID=xxx
NEXT_PUBLIC_LYZR_CAMPAIGN_EXPERT_ID=xxx

# Feature Flag
NEXT_PUBLIC_ENABLE_MULTI_AGENT=true
```

### Setup Commands

```bash
# Create all expert agents
bun run setup-multi-agents

# Connect Knowledge Base to all experts
LYZR_KB_ID=xxx bun run connect-kb-to-experts
```

---

## 6. Data Model

### Existing Entities

#### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "website" | "referral" | "social" | "showroom" | "event";
  status: "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost";
  assignedTo: string;
  interest: string[];           // Vehicle models interested in
  budget?: number;
  notes?: string;

  // AI Scoring
  score?: number;               // 0-100
  scoreFactors?: ScoreFactor[];

  entityId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Customer
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: "vip" | "regular" | "at-risk" | "new";

  // Metrics
  totalPurchases: number;
  totalSpent: number;
  lifetimeValue: number;
  satisfactionScore: number;
  churnRisk: number;            // 0-100

  // History
  purchases: Purchase[];
  interactions: Interaction[];

  entityId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Campaign
```typescript
interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  targetSegment: string[];
  budget: number;
  startDate: string;
  endDate: string;

  // Metrics
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };

  entityId: string;
  createdAt: string;
  updatedAt: string;
}
```

### New Entities (Inventory Module)

#### Vehicle
```typescript
interface Vehicle {
  id: string;
  vin: string;                    // Vehicle Identification Number (unique)

  // Vehicle Details
  brand: "GWM" | "GAC" | "Lotus";
  model: string;                  // e.g., "Haval H6", "Lynk & Co 01"
  variant: string;                // e.g., "Premium", "Sport"
  color: string;
  configuration: string;          // e.g., "4WD", "Sunroof Package"
  year: number;

  // Pricing
  importPrice: number;            // Cost price (USD)
  listPrice: number;              // MSRP (VND)
  dealerPrice: number;            // Price to dealer (VND)

  // Status & Location
  status: VehicleStatus;
  currentLocation: string;        // Showroom ID or warehouse ID
  assignedShowroom: string;       // Target showroom for delivery

  // Timeline
  orderedAt: string;
  expectedArrival: string;
  arrivedAt?: string;
  soldAt?: string;

  // Age Tracking (computed)
  daysInInventory: number;        // Auto-calculated from arrivedAt
  ageAlert: "none" | "warning" | "critical";  // warning >60 days, critical >90 days

  // Linking
  soldToCustomerId?: string;      // Customer who purchased
  reservedForLeadId?: string;     // Lead with reservation
  importOrderId: string;          // Parent import order

  entityId: string;               // Showroom/entity
  createdAt: string;
  updatedAt: string;
}

type VehicleStatus =
  | "ordered"           // PO placed with OEM
  | "in_production"     // OEM manufacturing
  | "shipped"           // On vessel
  | "at_port"           // Arrived at Vietnam port
  | "customs"           // Customs clearance
  | "inspection"        // Quality inspection
  | "in_warehouse"      // Central warehouse
  | "in_transit"        // Being delivered to showroom
  | "at_showroom"       // Available for sale
  | "reserved"          // Reserved for customer
  | "sold"              // Sold
  | "delivered";        // Delivered to customer
```

#### ImportOrder
```typescript
interface ImportOrder {
  id: string;
  orderNumber: string;            // PO number

  // Order Details
  brand: "GWM" | "GAC" | "Lotus";
  totalUnits: number;
  vehicles: VehicleOrderLine[];

  // Timeline
  orderedAt: string;
  expectedProductionComplete: string;
  expectedShipDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;

  // Status
  status: OrderStatus;

  // Financials
  totalValue: number;             // Total order value (USD)
  lcNumber?: string;              // Letter of Credit number
  lcOpenedAt?: string;            // LC opening date
  lcExpiryAt?: string;            // LC expiry date

  // Notes
  notes?: string;

  entityId: string;               // Ordering entity
  createdAt: string;
  updatedAt: string;
}

interface VehicleOrderLine {
  model: string;
  variant: string;
  color: string;
  quantity: number;
  unitPrice: number;              // USD
}

type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "arrived"
  | "completed";
```

### Core Data Entities

The application uses a unified Entity system to manage organizational hierarchy, business units, and product brands. All entities are stored in the `tasco-entities` DynamoDB table.

#### Entity Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `tasco-group` | Business units and subsidiaries | Tasco Auto, Tasco Insurance, Inochi |
| `automotive-showroom` | Physical dealership locations | Showroom Hanoi, Showroom HCMC |
| `automotive-b2b` | Corporate/fleet customers | Fleet clients, rental companies |
| `automotive-brand` | Vehicle brands distributed | GWM, GAC, Lotus |

#### Entity Type Hierarchy

```
parent (Tasco Group)
  └── holding (Tasco Auto, Tasco Insurance, Inochi)
       └── subsidiary (Individual showrooms, brands)
```

#### Entity Interface

```typescript
interface Entity {
  id: string;                    // Unique identifier (slug format)
  name: string;                  // Full name
  shortName?: string;            // Display name (e.g., "GWM")
  type: "parent" | "holding" | "subsidiary";
  category: EntityCategory;
  parentId?: string;             // Parent entity reference
  metadata?: EntityMetadata;     // Flexible metadata
  createdAt: string;
  updatedAt: string;
}

interface EntityMetadata {
  location?: string;
  employeeCount?: number;
  industry?: string;
  // Brand-specific metadata
  colorTheme?: string;           // "red", "blue", "amber"
  colorClass?: string;           // "text-red-500"
  bgClass?: string;              // "bg-red-500/10"
  gradientClass?: string;        // "from-red-500/15 to-red-600/5"
  borderClass?: string;          // "border-red-500/30"
  accentClass?: string;          // "bg-red-500"
  vinPrefix?: string;            // VIN prefix for brand
  country?: string;              // Country of origin
  models?: BrandModel[];         // Available models
  [key: string]: unknown;
}

interface BrandModel {
  name: string;                  // Model name (e.g., "Haval H6")
  variants: string[];            // Variants (e.g., ["Lux", "Premium", "Ultra"])
}
```

#### Automotive Brands

The three sole-distribution brands are stored as entities with `category: "automotive-brand"`:

| Brand | ID | Short Name | Color Theme | Country | Models |
|-------|-----|------------|-------------|---------|--------|
| Great Wall Motors | `gwm` | GWM | Red | China | Haval H6, Haval Jolion, Tank 300, Tank 500, Poer, Ora Good Cat |
| GAC Motor | `gac` | GAC | Blue | China | GS3, GS4, GS8, AION Y Plus, AION S Plus |
| Lotus Cars | `lotus` | Lotus | Amber | UK | Eletre, Emeya |

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/entities` | GET | List all entities (with category filter) |
| `/api/brands` | GET | List automotive brands with styling metadata |
| `/api/agents` | GET | List AI agents with suggestions |

#### Context Providers

The application uses React Context to provide entity data throughout the component tree:

| Provider | Hook | Purpose |
|----------|------|---------|
| `EntityFilterProvider` | `useEntityFilter()` | Multi-tenant entity selection |
| `BrandsProvider` | `useBrands()` | Brand data with styling |
| `MultiAgentProvider` | `useMultiAgent()` | AI agent selection |

#### Usage Example

```tsx
// Access brands from context
const { brands, getBrandStyle, getModels } = useBrands();

// Get styling for a brand
const gwmStyle = getBrandStyle("gwm");
// { gradient: "from-red-500/15...", text: "text-red-500", ... }

// Get models for a brand
const gwmModels = getModels("gwm");
// [{ name: "Haval H6", variants: ["Lux", "Premium", "Ultra"] }, ...]

// Filter by brand in UI
<div className={`bg-gradient-to-r ${gwmStyle.gradient}`}>
  {/* Brand-colored content */}
</div>
```

### Entity Relationships

```
ImportOrder
    │
    │ 1:N
    ▼
Vehicle ──────────────────────┐
    │                         │
    │ N:1 (soldTo)           │ N:1 (reservedFor)
    ▼                         ▼
Customer                     Lead
    │
    │ 1:N
    ▼
Purchase
    │
    │ N:1 (vehicle)
    ▼
Vehicle
```

---

## 7. UI Requirements

### Page Structure

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Dashboard | `/` | KPIs, alerts, recommendations | ✅ Implemented |
| Leads | `/leads` | Lead list, filters, search | ✅ Implemented |
| Lead Detail | `/leads/[id]` | Individual lead view | ✅ Implemented |
| Customers | `/customers` | Customer list, segmentation | ✅ Implemented |
| Customer Detail | `/customers/[id]` | Individual customer view | ✅ Implemented |
| Marketing | `/marketing` | Campaign management | ✅ Implemented |
| **Inventory** | `/inventory` | Vehicle list, stock levels | ✅ Implemented |
| **Import Orders** | `/inventory/orders` | Supply chain tracking | ✅ Implemented |
| Chat | `/chat` | AI assistant with conversation history | ✅ Implemented |

### New Components (Inventory Module)

| Component | Purpose |
|-----------|---------|
| `VehicleCard` | Display vehicle summary in list view |
| `VehicleDetailSheet` | Full vehicle details (view/edit) |
| `ImportOrderSheet` | Import order details |
| `InventoryFilters` | Filter by brand, model, status, age |
| `StockLevelChart` | Visualize stock by showroom |
| `InventoryAgeChart` | Age distribution of inventory |
| `SupplyChainTimeline` | Visual timeline of order stages |
| `VehicleStatusBadge` | 12-stage status indicator |

### Dashboard Enhancements

Add inventory widgets to main dashboard:

| Widget | Metrics |
|--------|---------|
| Inventory Overview | Total units, by brand, by status |
| Age Alerts | Units >60 days, >90 days |
| Incoming Shipments | Next 30 days arrivals |
| Stock Health | Turn rate, fill rate |

### Design System

Follow existing patterns from customer-lifecycle app:
- `DetailSheet` pattern for view/create/edit modes
- Entity selector for multi-tenant filtering
- Card-based grid layouts
- Badge system for status indicators
- Chart components using existing library

---

## 8. User Journey Documentation

This section provides comprehensive user journey flows for all modules in the Customer Lifecycle Management system.

### 8.1 Application Entry & Navigation

#### First-Time User Experience

1. **App Loading** → User lands on Dashboard (`/`)
2. **Guide Carousel** → Optional onboarding tour appears (can be triggered from header help icon)
3. **Entity Selection** → Header shows EntitySelector with all 17 Tasco showrooms pre-selected
4. **Dashboard Overview** → User sees KPIs filtered by selected entities

#### Global Navigation Elements

| Element | Location | Purpose |
|---------|----------|---------|
| **Sidebar** | Left | Primary navigation + conversation history |
| **Header** | Top | Entity selector, notifications, user menu, help |
| **Command Bar** | Modal (⌘K) | Quick AI query access |
| **Floating AI Button** | Bottom-right | Open chat assistant |

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open AI Command Bar |
| `Escape` | Close modals/sheets |

---

### 8.2 Dashboard Journey (`/`)

**Purpose:** Central hub showing key metrics, alerts, and AI recommendations.

#### User Flow

```
Entry → View Stats Cards → Check Lead Inbox → Review At-Risk Customers → See AI Recommendations → Take Action
```

#### Dashboard Sections

| Section | Content | User Actions |
|---------|---------|--------------|
| **Hero Stats** | Total Leads, Hot Leads, Customers, At-Risk Count | View aggregated metrics |
| **Lead Inbox** | Recent leads requiring attention | Click to open lead detail sheet |
| **At-Risk Customers** | Customers with high churn risk | Click to open customer detail sheet |
| **AI Recommendations** | Next-best-action suggestions | Click action button to execute |
| **Quick Actions** | Create Lead, View Inventory, Open Chat | Navigate to respective pages |

#### Data Refresh

- Stats refresh on entity selection change
- Manual refresh via refresh button
- Data scoped to selected entities only

---

### 8.3 Lead Management Journey (`/leads`)

**Purpose:** Capture, prioritize, and convert sales leads.

#### Lead Lifecycle States

```
New → Contacted → Qualified → Nurturing → Converted (to Customer)
                           ↘ Lost
```

| Status | Description | Next Actions |
|--------|-------------|--------------|
| `new` | Fresh lead, uncontacted | Contact within 4 hours |
| `contacted` | Initial contact made | Qualify interest level |
| `qualified` | Confirmed buyer intent | Match to inventory, schedule test drive |
| `nurturing` | Long-term prospect | Send campaigns, follow up periodically |
| `converted` | Became a customer | Close lead, link to customer record |
| `lost` | Did not convert | Record reason, may re-engage later |

#### Lead Priority System

| Priority | Score Range | Visual | Description |
|----------|-------------|--------|-------------|
| 🔥 Hot | 70-100 | Red badge | High conversion probability, immediate action needed |
| 🌡️ Warm | 40-69 | Orange badge | Moderate interest, nurture actively |
| ❄️ Cold | 0-39 | Blue badge | Low engagement, long-term nurture |

#### User Flow: Lead List Page

```
1. Land on /leads
2. View leads in Kanban or List view (toggle)
3. Filter by:
   - Priority (Hot/Warm/Cold)
   - Status (New/Contacted/Qualified/etc.)
   - Source (Website/Referral/Walk-in/etc.)
   - Search by name/email/phone
4. Click lead card → Open LeadDetailSheet
5. View/Edit lead details
6. Trigger AI scoring
7. Assign to sales rep
8. Add notes/interactions
```

#### User Flow: Lead Scoring

```
1. Open lead detail sheet
2. Click "Score Lead" or "Re-score" button
3. AI analyzes:
   - Contact information completeness
   - Interest signals (vehicle types, budget)
   - Engagement history
   - Source quality
   - Recency of activity
4. Score (0-100) calculated with factor breakdown
5. Priority auto-assigned based on score
```

#### Lead Detail Sheet Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Contact info, source, priority, score, assigned rep |
| **Interest** | Vehicle types, brands, budget range, timeline |
| **Activity** | Interaction history (calls, emails, meetings, notes) |
| **Vehicles** | Matched inventory based on interest criteria |

---

### 8.4 Customer Management Journey (`/customers`)

**Purpose:** 360-degree view of customers throughout their lifecycle.

#### Customer Lifecycle Stages

```
Prospect → Active → Loyal → At-Risk → Churned
              ↓
          (Re-engage)
```

| Stage | Description | Key Actions |
|-------|-------------|-------------|
| `prospect` | Converted from lead, pending first purchase | Complete first sale |
| `active` | Made purchase(s), engaged customer | Upsell, cross-sell, service reminders |
| `loyal` | Repeat buyer, high satisfaction | VIP treatment, referral program |
| `at-risk` | Declining engagement, service issues | Retention campaigns, personal outreach |
| `churned` | No activity for extended period | Win-back campaigns |

#### Customer Segmentation

| Segment | Criteria | Actions |
|---------|----------|---------|
| 🌟 **VIP** | High LTV, repeat purchases, referrals | Priority service, exclusive offers |
| 👤 **Regular** | Standard purchase history | Maintain engagement, upsell |
| ⚠️ **At-Risk** | Churn risk > 60%, declining engagement | Immediate intervention |
| 🆕 **New** | Recent conversion, < 90 days | Onboarding, satisfaction check |

#### User Flow: Customer List Page

```
1. Land on /customers
2. View customer grid with segment badges
3. Filter by:
   - Segment (VIP/Regular/At-Risk/New)
   - Stage (Prospect/Active/Loyal/etc.)
   - Search by name/email/phone
4. Sort by: LTV, Churn Risk, Last Purchase, Name
5. Click customer card → Open CustomerDetailSheet
```

#### Customer Detail Sheet Tabs

| Tab | Content |
|-----|---------|
| **Profile** | Contact info, segment, stage, lifetime metrics |
| **Insights** | Churn risk score, satisfaction score, AI recommendations |
| **Purchases** | Purchase history with vehicle details |
| **Interactions** | Complete interaction timeline |
| **Vehicles** | Owned vehicles (linked from purchases) |

#### Key Customer Metrics

| Metric | Description | Location |
|--------|-------------|----------|
| **Lifetime Value (LTV)** | Total revenue from customer | Profile card |
| **Churn Risk** | 0-100 probability of leaving | Insights tab, badge on card |
| **Satisfaction Score** | 0-100 based on interactions | Insights tab |
| **Total Purchases** | Count of completed purchases | Profile card |
| **Average Order Value** | LTV / Total Purchases | Profile card |

---

### 8.5 Marketing Campaign Journey (`/marketing`)

**Purpose:** Create, execute, and track marketing campaigns.

#### Campaign Lifecycle

```
Draft → Active → Paused → Completed
           ↓
       (Resume)
```

| Status | Description |
|--------|-------------|
| `draft` | Campaign created but not launched |
| `active` | Currently running, collecting metrics |
| `paused` | Temporarily stopped, can resume |
| `completed` | Finished, final metrics available |

#### Campaign Types

| Type | Channel | Use Case |
|------|---------|----------|
| `email` | Email | Newsletters, promotions, service reminders |
| `sms` | SMS | Urgent notifications, appointment reminders |
| `social` | Facebook, TikTok | Brand awareness, lead generation |
| `event` | Offline | Showroom events, test drive days |
| `direct-mail` | Physical mail | Premium offers, VIP communications |

#### User Flow: Campaign Management

```
1. Land on /marketing
2. View active campaigns dashboard
3. Filter by: Type, Status, Target Segment
4. Click campaign → Open CampaignDetailSheet
5. View performance metrics:
   - Sent / Delivered / Opened / Clicked / Converted
   - Revenue generated
   - ROI calculation
6. Create new campaign:
   - Set name, type, target segment
   - Define budget, start/end dates
   - Configure content (template selection)
   - Launch or save as draft
```

#### Campaign Metrics

| Metric | Formula | Good Benchmark |
|--------|---------|----------------|
| **Delivery Rate** | Delivered / Sent | > 95% |
| **Open Rate** | Opened / Delivered | > 20% |
| **Click Rate** | Clicked / Opened | > 3% |
| **Conversion Rate** | Converted / Clicked | > 5% |
| **ROI** | (Revenue - Budget) / Budget | > 100% |

---

### 8.6 Vehicle Inventory Journey (`/inventory`)

**Purpose:** Track vehicles from factory order to customer delivery.

#### Vehicle Status Pipeline (12 Stages)

```
Ordered → Production → Shipped → At Port → Customs → Inspection → Warehouse → In Transit → At Showroom → Reserved → Sold → Delivered
```

| Step | Status | Icon | Description | Location |
|------|--------|------|-------------|----------|
| 1 | `ordered` | 📦 Package | PO placed with OEM | OEM Factory |
| 2 | `in_production` | 🏭 Factory | Being manufactured | OEM Factory |
| 3 | `shipped` | 🚢 Ship | On vessel to Vietnam | At Sea |
| 4 | `at_port` | 📍 MapPin | Arrived at Vietnam port | Hai Phong/HCMC Port |
| 5 | `customs` | ⏰ Clock | Customs clearance process | Port |
| 6 | `inspection` | 👁️ Eye | Quality inspection | Port/Warehouse |
| 7 | `in_warehouse` | 🏪 Warehouse | At central warehouse | Central Warehouse |
| 8 | `in_transit` | 🚚 Truck | Being delivered to showroom | En Route |
| 9 | `at_showroom` | 🚗 Car | Available for sale | Showroom |
| 10 | `reserved` | 👥 Users | Reserved for a lead | Showroom |
| 11 | `sold` | 💰 DollarSign | Sold to customer | Showroom |
| 12 | `delivered` | ✅ CheckCircle | Handed over to customer | Customer |

#### Age Alert System

| Alert Level | Days in Inventory | Visual | Action Required |
|-------------|-------------------|--------|-----------------|
| ✅ None | 0-59 days | No badge | Normal |
| ⚠️ Warning | 60-89 days | Amber badge | Review pricing, increase promotion |
| 🚨 Critical | 90+ days | Red badge | Immediate action, discount consideration |

#### User Flow: Inventory Page

```
1. Land on /inventory
2. View hero header with brand logos (GWM · GAC · Lotus)
3. See stats cards:
   - Total Vehicles
   - At Showroom (ready for sale)
   - In Transit
   - Aging Alert count
4. Use filters:
   - Search: VIN, model, color, variant
   - Status tabs: All, Showroom, Transit, Reserved
   - Brand buttons: All, GWM, GAC, Lotus
   - View toggle: Grid / List
5. Browse vehicle cards showing:
   - Brand accent color (red=GWM, blue=GAC, amber=Lotus)
   - Status badge with icon
   - Age alert badge (if applicable)
   - Model, variant, color
   - VIN (last 8 characters)
   - List price (VND)
6. Click vehicle → Open VehicleDetailSheet
```

#### Vehicle Detail Sheet

**Header:**
- Model name and variant
- Brand pill badge
- Pipeline progress visualization

**Tabs:**

| Tab | Content |
|-----|---------|
| **Details** | VIN (with copy button), color, year, configuration, current location, expected arrival, age alert status |
| **Pricing** | List Price (MSRP), Import Price (USD), Dealer Price, Margin calculation |
| **History** | Order placed date, arrival date, reservation history, link to import order |

**Actions:**
- Assign to Lead → Link vehicle to interested lead
- AI Match → Find leads interested in this vehicle

#### Brand Styling

| Brand | Accent Color | Gradient |
|-------|--------------|----------|
| **GWM** | Red | `from-red-500/15 to-red-600/5` |
| **GAC** | Blue | `from-blue-500/15 to-blue-600/5` |
| **Lotus** | Amber | `from-amber-500/15 to-amber-600/5` |

---

### 8.7 Import Orders Journey (`/inventory/orders`)

**Purpose:** Track bulk purchase orders from OEMs through the global supply chain.

#### Import Order Status Pipeline

```
Draft → Submitted → Confirmed → Production → Shipped → Arrived → Completed
```

| Status | Description | Next Action |
|--------|-------------|-------------|
| `draft` | Order drafted, awaiting submission | Submit to OEM |
| `submitted` | Submitted to OEM for confirmation | Await OEM response |
| `confirmed` | OEM confirmed, awaiting production | Monitor production |
| `in_production` | Vehicles being manufactured | Track completion |
| `shipped` | On vessel, in transit to Vietnam | Monitor shipping |
| `arrived` | Arrived at port, processing | Clear customs, inspect |
| `completed` | All vehicles received at showrooms | Close order |

#### User Flow: Import Orders Page

```
1. Navigate to /inventory/orders (or click "Import Orders" from /inventory)
2. See hero header with supply chain theme
3. View stats cards:
   - Total Orders
   - Total Units (with USD value)
   - In Transit
   - Arrived This Month
4. Use filters:
   - Search: PO number, brand, L/C number
   - Status dropdown
   - Brand dropdown
5. View orders grouped by status:
   - Active Orders (with pulsing dot)
   - Recently Arrived
   - Completed
6. Each order card shows:
   - PO number with brand badge
   - Pipeline progress bar
   - Units count and USD value
   - Expected arrival with countdown
   - Vehicle manifest preview
7. Click order → Open OrderDetailSheet
```

#### Order Detail Sheet

**Header:**
- PO number and brand badge
- Status badge
- Supply chain timeline with animated progress

**Tabs:**

| Tab | Content |
|-----|---------|
| **Details** | Order info, dates, L/C details, key metrics (units, value, ETA) |
| **Vehicles** | Full manifest with model, variant, color, quantity, unit price, line total |
| **Documents** | (Future: shipping docs, customs forms, inspection reports) |

#### Supply Chain Timeline Component

Visual representation with 5 major milestones:
1. **Ordered** - PO submitted
2. **Confirmed** - OEM accepted
3. **Production** - Manufacturing
4. **Shipped** - On vessel
5. **Arrived** - At Vietnam port

Each milestone shows:
- Completion status (completed/current/upcoming)
- Associated date
- Animated pulse for current stage

#### Letter of Credit (L/C) Tracking

| Field | Purpose |
|-------|---------|
| L/C Number | Bank reference for payment |
| L/C Opened At | When L/C was issued |
| L/C Expiry At | Deadline for shipment |

---

### 8.8 AI Chat Assistant Journey (`/chat`)

**Purpose:** Natural language interface for querying customer, lead, and inventory data.

#### Chat Features

| Feature | Description |
|---------|-------------|
| **Persistent Conversations** | Chat history saved to DynamoDB |
| **Multiple Conversations** | Create, switch, delete conversations |
| **Entity Scoping** | Answers scoped to selected entities |
| **Citation Support** | Sources shown for data-backed answers |
| **Validation Scoring** | Response quality assessment (0-100) |

#### User Flow: Chat Page

```
1. Navigate to /chat or click Floating AI Button
2. View conversation list in sidebar
3. Select existing conversation or create new
4. Type question in chat input
5. Receive AI response with:
   - Answer text (markdown formatted)
   - Citations (if data-backed)
   - Validation score badge
6. Continue conversation with follow-ups
7. Use suggested questions for inspiration
```

#### Entry Points to Chat

| Entry Point | Behavior |
|-------------|----------|
| Sidebar "AI Chat" link | Opens /chat with conversation list |
| Floating AI Button | Opens /chat |
| Command Bar (⌘K) | Quick query → redirects to /chat with query pre-filled |
| Dashboard "Ask AI" | Opens /chat |

#### Suggested Questions by Domain

**Lead Management:**
- "Which leads should I prioritize contacting today?"
- "Show me all hot leads that haven't been contacted in 3 days"
- "What's the conversion rate for website leads vs referrals?"

**Customer Insights:**
- "Show me customers at high risk of churning"
- "Who are our top 10 VIP customers by lifetime value?"
- "Which customers are due for service this month?"

**Inventory:**
- "How many Haval H6 units do we have in stock?"
- "Which vehicles have been in inventory over 60 days?"
- "What's the status of import order PO-2024-001?"

**Marketing:**
- "What's the ROI of our last email campaign?"
- "Which customer segment responds best to SMS campaigns?"

#### Conversation Management

| Action | How |
|--------|-----|
| Create new conversation | Click "+" in sidebar or "New Conversation" button |
| Switch conversation | Click conversation in sidebar list |
| Delete conversation | Click trash icon on conversation (with confirmation) |
| Rename conversation | Auto-generated from first message (or edit title) |

---

### 8.9 Entity Filtering (Global)

**Purpose:** Multi-tenant data scoping across 17 Tasco showrooms.

#### Entity Hierarchy

```
Tasco Group (Parent)
├── Tasco Auto (Holding)
│   ├── Tasco Auto Hà Nội
│   ├── Tasco Auto HCMC
│   ├── Tasco Auto Đà Nẵng
│   └── ... (17 subsidiaries total)
├── Carpla (Holding)
│   └── ... subsidiaries
└── Inochi (Holding)
    └── ... subsidiaries
```

#### EntitySelector Component

**Location:** Header (top-right area)

**Features:**
- Hierarchical dropdown with parent/holding/subsidiary tree
- Multi-select with checkboxes
- "All Companies" toggle
- Ancestor selection (selecting parent selects all children)
- Badge showing selection count ("+X more")
- Persisted to localStorage

#### How Entity Filtering Works

1. User selects entities in header EntitySelector
2. Selection stored in `EntityFilterContext`
3. All pages read `selectedEntityIds` from context
4. API calls include `?entityIds=id1,id2,id3` parameter
5. Backend filters data to matching entities only
6. UI displays filtered results

#### Affected Data

| Entity Type | Filtered By |
|-------------|-------------|
| Leads | `entityId` field |
| Customers | `entityId` field |
| Campaigns | `entityId` field |
| Vehicles | `assignedShowroom` or `entityId` |
| Import Orders | `entityId` field |
| Conversations | App-wide (not entity-filtered) |

---

### 8.10 Notification System

**Purpose:** Alert users to important events and actions.

#### Notification Types

| Type | Icon | Example |
|------|------|---------|
| `created` | ➕ Plus | "Vehicle added: GWM Haval H6" |
| `updated` | 🔄 Refresh | "Order shipped: PO-2024-001" |
| `deleted` | 🗑️ Trash | "Lead removed: John Doe" |
| `alert` | ⚠️ Warning | "Vehicle aging: 90 days in inventory" |
| `reminder` | 🔔 Bell | "Follow up due: Lead #12345" |

#### Notification Center

**Location:** Header (bell icon)

**Features:**
- Unread count badge
- Dropdown list of recent notifications
- Click to navigate to related item
- Mark as read

#### Auto-Generated Notifications

| Event | Notification |
|-------|--------------|
| Vehicle created | "Vehicle added: [Brand] [Model]" |
| Vehicle status change | "Vehicle [status]: [Brand] [Model]" |
| Import order created | "Import order created: [PO Number]" |
| Order arrival | "Order arrived: [PO Number]" |
| Lead score change | "Lead score updated: [Name] - [Score]" |
| Age alert triggered | "Aging alert: [VIN] - [Days] days" |

---

### 8.11 RAG Synchronization (Background)

**Purpose:** Keep AI knowledge base updated with real-time data changes.

#### Sync Triggers

| Event | Synced Data |
|-------|-------------|
| Lead created/updated | Lead profile, interest, score |
| Customer created/updated | Customer profile, insights, purchase history |
| Vehicle created/updated | Vehicle specs, status, pricing |
| Import order created/updated | Order details, timeline, manifest |
| Campaign created/updated | Campaign metrics, target segment |

#### Document Format

Data is formatted as human-readable documents for RAG:

```
LEAD: Nguyễn Văn A [Updated: Jan 10, 2025]
- Priority: HOT | Score: 85/100
- Source: website | Status: qualified
- Interest: GWM SUVs, GAC Sedans, Budget: 500M-1B VND
- Contact: nguyen@email.com | 0912345678
- Last Contact: Jan 8, 2025
- Assigned To: Trần Văn B
- Entity: Tasco Auto Hà Nội
```

#### Benefits

- AI chat has real-time knowledge
- Answers reflect latest data changes
- No manual re-indexing required

---

### 8.12 Cross-Module Journeys

#### Lead to Customer Conversion

```
1. Lead created (source: website form)
2. Lead scored by AI (Hot: 85/100)
3. Sales rep contacts lead
4. Lead qualified, interest matched to inventory
5. Test drive scheduled
6. Lead status → "Nurturing"
7. Vehicle reserved for lead
8. Purchase negotiation
9. Lead status → "Converted"
10. Customer record created (linked to lead)
11. Vehicle status → "Sold"
12. Purchase record created (links customer ↔ vehicle)
13. Vehicle delivered
14. Customer stage → "Active"
```

#### Inventory to Lead Matching

```
1. New vehicle arrives at showroom
2. Vehicle status → "at_showroom"
3. AI scans lead interests
4. Matches found: leads interested in this model/brand/budget
5. AI recommendation created: "Notify [Lead] about [Vehicle]"
6. Sales rep sees recommendation on dashboard
7. Rep contacts lead with vehicle info
8. If interested → Vehicle reserved for lead
```

#### Campaign to Conversion Tracking

```
1. Campaign created targeting "At-Risk" segment
2. Campaign launched (email type)
3. Emails delivered to matching customers
4. Customer opens email → "Opened" metric +1
5. Customer clicks link → "Clicked" metric +1
6. Customer visits showroom → Lead created (source: campaign)
7. Lead converts → "Converted" metric +1
8. Revenue tracked → Campaign ROI calculated
```

---

## 9. Technical Requirements

### Lyzr Components

- **Agent Type:** Assistant Agent
- **Knowledge Base:** Customer data, Inventory data
- **Features:** Chat, data retrieval, insights, scoring

### Data Sources

- Customer profiles
- Purchase history
- Service records
- Communication logs
- Vehicle inventory (NEW)
- Import orders (NEW)

### DynamoDB Tables

| Table | Partition Key | Sort Key | Purpose |
|-------|---------------|----------|---------|
| `tasco-leads` | `entityId` | `id` | Lead management |
| `tasco-customers` | `entityId` | `id` | Customer profiles |
| `tasco-campaigns` | `entityId` | `id` | Marketing campaigns |
| `tasco-vehicles` | `entityId` | `id` | Vehicle inventory |
| `tasco-import-orders` | `entityId` | `id` | Import orders |
| `tasco-vehicle-by-vin` | `vin` | - | VIN lookup (GSI) |
| `tasco-vehicle-by-status` | `status` | `entityId` | Status queries (GSI) |

---

## 9. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| Search response | < 1 second |
| Dashboard refresh | < 3 seconds |
| Query response time | < 3 seconds |
| Inventory sync | Near real-time |

### Scalability

| Dimension | Target |
|-----------|--------|
| Showrooms | 100+ |
| Vehicles in inventory | 10,000+ |
| Customers | 100,000+ |
| Leads | 50,000+ |
| Concurrent users | 500+ |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Role-based access | Entity-level permissions |
| Data isolation | Multi-tenant by entityId |
| Audit logging | All CRUD operations logged |
| API security | Authentication required |

### Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Data backup | Daily |
| Recovery time | < 4 hours |

---

## 10. Success Metrics

### Lead Management KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Lead-to-conversion rate | Baseline | +20% | Monthly |
| Response time to new leads | Unknown | < 4 hours | Real-time |
| Lead score accuracy | N/A | > 80% | Quarterly |
| Lead distribution efficiency | Manual | Automated | N/A |

### Customer Retention KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Churn prediction accuracy | N/A | > 75% | Quarterly |
| Customer retention rate | Baseline | +10% | Quarterly |
| NPS score | Unknown | > 40 | Monthly |
| Customer 360 adoption | N/A | > 80% | Monthly |
| Profile completeness | Baseline | > 80% | Monthly |
| User adoption | Baseline | > 70% of sales team | Monthly |

### Inventory KPIs (from Challenge Brief)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Missed sales** | Unknown | **0%** | Monthly |
| **Inventory cycle** | Unknown | **< 3 months** | Monthly |
| Vehicles > 60 days | Unknown | < 10% | Weekly |
| Vehicles > 90 days | Unknown | < 5% | Weekly |
| Fill rate | Unknown | > 95% | Monthly |
| Turn rate | Unknown | 4x/year | Quarterly |
| Stock value visibility | Manual | Real-time | N/A |

### Campaign KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Campaign ROI | Baseline | +15% | Per campaign |
| Open rate | Baseline | +10% | Per campaign |
| Conversion rate | Baseline | +20% | Per campaign |

---

## 11. Implementation Phases

### Phase 1: Core Inventory (Current Priority)

**Duration:** Sprint 1-2

| Task | Deliverable |
|------|-------------|
| Vehicle data model | DynamoDB table + types |
| Vehicle CRUD API | `/api/inventory/*` endpoints |
| Inventory page | `/inventory` with list view |
| Vehicle detail sheet | View/create/edit modes |
| Inventory filters | Brand, model, status, age |
| Dashboard widget | Basic inventory stats |

### Phase 2: Supply Chain Visibility

**Duration:** Sprint 3-4

| Task | Deliverable |
|------|-------------|
| ImportOrder data model | DynamoDB table + types |
| Import order API | `/api/orders/*` endpoints |
| Orders page | `/inventory/orders` |
| Supply chain timeline | Visual stage tracker |
| Age alert system | Automatic warnings |

### Phase 3: Intelligence & Integration

**Duration:** Sprint 5-6

| Task | Deliverable |
|------|-------------|
| Lead-to-inventory matching | Show available vehicles for lead |
| Inventory advisor agent | Natural language queries |
| Customer purchase linking | Connect purchases to VINs |
| Inventory analytics page | Charts and insights |

### Phase 4: Advanced Features

**Duration:** Sprint 7-8

| Task | Deliverable |
|------|-------------|
| Demand forecasting | ML-based predictions |
| Auto-reorder suggestions | AI recommendations |
| DMS integration prep | API design for future sync |
| Export/reporting | PDF and Excel exports |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Data quality** - Inventory data inconsistent | High | High | Validation rules, data cleansing scripts |
| **User adoption** - Staff resistant to new system | Medium | High | Training, intuitive UI, gradual rollout |
| **Integration complexity** - DMS sync challenges | High | Medium | Start with manual entry, design API for future |
| **Scope creep** - Adding features beyond MVP | Medium | Medium | Strict phase boundaries, PRD as source of truth |
| **Performance** - Slow with large inventory | Low | High | Pagination, indexing, caching strategy |
| **Data migration** - Moving from Excel | High | Medium | Import tools, validation, parallel running |

---

## 13. API Endpoints Reference

### Existing Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/leads` | Lead CRUD |
| GET/PATCH | `/api/leads/[id]` | Lead details |
| GET/POST | `/api/customers` | Customer CRUD |
| GET/PATCH | `/api/customers/[id]` | Customer details |
| GET/POST | `/api/campaigns` | Campaign CRUD |
| GET/PATCH | `/api/campaigns/[id]` | Campaign details |

### New Endpoints (Inventory)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/inventory` | Vehicle list/create |
| GET/PATCH/DELETE | `/api/inventory/[id]` | Vehicle CRUD |
| GET | `/api/inventory/stats` | Inventory statistics |
| GET | `/api/inventory/alerts` | Age/stock alerts |
| GET/POST | `/api/orders` | Import orders list/create |
| GET/PATCH | `/api/orders/[id]` | Order CRUD |

---

## Appendix

### A. Vehicle Status Workflow

```
┌─────────┐    ┌──────────────┐    ┌─────────┐    ┌─────────┐
│ ordered │───▶│in_production │───▶│ shipped │───▶│ at_port │
└─────────┘    └──────────────┘    └─────────┘    └────┬────┘
                                                       │
┌──────────────────────────────────────────────────────┘
│
▼
┌─────────┐    ┌────────────┐    ┌──────────────┐    ┌────────────┐
│ customs │───▶│ inspection │───▶│ in_warehouse │───▶│ in_transit │
└─────────┘    └────────────┘    └──────────────┘    └─────┬──────┘
                                                           │
┌──────────────────────────────────────────────────────────┘
│
▼
┌─────────────┐    ┌──────────┐    ┌──────┐    ┌───────────┐
│ at_showroom │───▶│ reserved │───▶│ sold │───▶│ delivered │
└─────────────┘    └──────────┘    └──────┘    └───────────┘
```

### B. Brand Portfolio

| Type | Brands | Control Level |
|------|--------|---------------|
| **Sole Distribution** | GWM (Haval), GAC (Lynk & Co), Lotus | 100% import control |
| **Dealership** | Toyota, Ford, Hyundai, Kia, Mazda, Honda, etc. | OEM-controlled |

**Note:** Inventory module focuses on **sole distribution brands** where Tasco controls import decisions.

### C. Entity Hierarchy

```
Tasco Group (Parent)
└── Tasco Auto (Holding)
    ├── GWM Network
    │   ├── Showroom Hanoi 1
    │   ├── Showroom Hanoi 2
    │   ├── Showroom HCMC 1
    │   └── ... (100+ showrooms)
    ├── GAC Network
    │   └── ... showrooms
    └── Lotus Network
        └── ... showrooms
```

### D. Marketing Channel Mix

From challenge brief:
- **Press:** 33%
- **Social Media:** 33%
- **Trade Marketing:** 33%

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-12 | AI Assistant | Initial PRD with inventory module |
| 2.0 | 2025-01-13 | AI Assistant | Added comprehensive User Journey Documentation (Section 8), updated implementation status for Inventory & Orders modules |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Business Stakeholder | | | |
