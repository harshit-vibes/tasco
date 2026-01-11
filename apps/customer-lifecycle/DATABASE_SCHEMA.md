# Customer Lifecycle - Database Schema & Agent Architecture

> Database entities, relationships, and AI agent design for Tasco Auto Customer Lifecycle Management

---

## 1. Database Entities

### Core Entities (7 tables)

#### 1.1 **Entities** (Showrooms/Locations)
```typescript
Entity {
  id: string;                    // PK
  name: string;                  // "Tasco Toyota Hanoi"
  code: string;                  // "TT-HN-001"
  type: "showroom" | "service_center";
  location: {
    address: string;
    city: string;
    region: string;
    coordinates?: [number, number];
  };
  brands: string[];              // ["Toyota", "Ford"]
  managers: string[];            // User IDs
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
```

**DynamoDB Table:** `tasco-entities`
- **PK:** `entityId`
- **SK:** `metadata`
- **GSI1:** `type#status` → List active showrooms

---

#### 1.2 **Leads**
```typescript
Lead {
  id: string;                    // PK: "LEAD#uuid"
  entityId: string;              // FK → Entity (showroom)

  // Lead Information
  source: "website" | "facebook" | "google_ads" | "walk_in" | "referral" | "phone";
  status: "new" | "contacted" | "qualified" | "negotiating" | "converted" | "lost";
  priority: "hot" | "warm" | "cold";

  // Customer Info
  customer: {
    name: string;
    email?: string;
    phone: string;
    preferredContact: "phone" | "email" | "whatsapp";
  };

  // Interest Details
  interest: {
    brands: string[];            // ["Toyota", "Ford"]
    models?: string[];           // ["Fortuner", "Ranger"]
    type: "new" | "used" | "both";
    budget?: {
      min: number;
      max: number;
      currency: "VND";
    };
    timeframe: "immediate" | "1_month" | "3_months" | "6_months";
  };

  // AI Scoring
  score: number;                 // 0-100 AI-generated lead score
  scoringFactors: {
    engagement: number;          // Website activity, response time
    budget_fit: number;          // Budget vs available inventory
    urgency: number;             // Timeframe score
    qualification: number;       // Contact quality
  };

  // Assignment
  assignedTo?: string;           // Sales rep ID
  assignedAt?: Date;
  distributionMethod: "auto" | "manual";

  // Tracking
  firstContactAt?: Date;
  lastContactAt?: Date;
  responseTime?: number;         // Minutes to first contact
  touchPoints: number;           // Number of interactions

  // Outcome
  convertedTo?: string;          // Customer ID if converted
  lostReason?: string;

  // Metadata
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**DynamoDB Table:** `tasco-leads`
- **PK:** `leadId`
- **SK:** `metadata`
- **GSI1:** `entityId#status` → Leads by showroom and status
- **GSI2:** `assignedTo#status` → Leads by sales rep
- **GSI3:** `score#createdAt` → High-priority leads (score > 80)
- **GSI4:** `source#createdAt` → Leads by source (analytics)

---

#### 1.3 **Customers** (Customer 360 Profile)
```typescript
Customer {
  id: string;                    // PK: "CUST#uuid"
  entityId: string;              // Primary showroom

  // Profile
  profile: {
    name: string;
    email?: string;
    phone: string;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other";
    address: {
      street: string;
      city: string;
      district: string;
      ward?: string;
      postalCode?: string;
    };
    occupation?: string;
    income_bracket?: "low" | "medium" | "high" | "premium";
  };

  // Segmentation
  segment: "new" | "regular" | "vip" | "inactive";
  lifetimeValue: number;         // Total revenue from customer
  purchaseCount: number;         // Number of vehicles purchased

  // Preferences
  preferences: {
    brands: string[];            // Favorite brands
    vehicleTypes: string[];      // "sedan", "suv", "pickup"
    priceRange: {
      min: number;
      max: number;
    };
    contactMethod: "phone" | "email" | "whatsapp" | "sms";
    contactTime: "morning" | "afternoon" | "evening";
    language: "en" | "vi";
  };

  // AI-Generated Insights
  insights: {
    nextPurchaseProb: number;    // 0-1 probability of next purchase
    recommendedModels: string[]; // AI recommendations
    churnRisk: number;           // 0-1 risk of losing customer
    sentiment: "positive" | "neutral" | "negative";
    sentimentScore: number;      // -1 to 1
    nextBestAction?: string;     // AI-generated recommendation
  };

  // Behavioral Data
  behavior: {
    lastVisit?: Date;
    visitFrequency: number;      // Visits per year
    serviceFrequency: number;    // Service visits per year
    responseRate: number;        // % of marketing messages responded to
    avgResponseTime: number;     // Hours to respond
  };

  // Marketing Consent
  consents: {
    marketing: boolean;
    sms: boolean;
    email: boolean;
    phone: boolean;
  };

  // Metadata
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
```

**DynamoDB Table:** `tasco-customers`
- **PK:** `customerId`
- **SK:** `metadata`
- **GSI1:** `entityId#segment` → Customers by showroom and segment
- **GSI2:** `segment#lifetimeValue` → High-value customers
- **GSI3:** `phone` → Customer lookup by phone
- **GSI4:** `email` → Customer lookup by email
- **GSI5:** `insights.churnRisk#lastActivityAt` → At-risk customers

---

#### 1.4 **Interactions** (Communication History)
```typescript
Interaction {
  id: string;                    // PK: "INT#uuid"
  customerId: string;            // FK → Customer
  leadId?: string;               // FK → Lead (if before conversion)
  entityId: string;              // FK → Entity (showroom)

  // Interaction Details
  type: "call" | "email" | "sms" | "whatsapp" | "chat" | "visit" | "social";
  channel: "inbound" | "outbound";
  direction: "customer_to_business" | "business_to_customer";

  // Content
  subject?: string;
  summary: string;               // AI-generated summary
  transcript?: string;           // For calls/chats
  rawContent?: string;           // Original message

  // Participants
  staffId?: string;              // Sales rep or CS agent
  staffName?: string;

  // AI Analysis
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;        // -1 to 1
  topics: string[];              // Extracted topics: "pricing", "features", "service"
  intent?: string;               // "inquiry", "complaint", "purchase", "service"
  urgency: "low" | "medium" | "high";

  // Outcome
  outcome?: "resolved" | "escalated" | "follow_up_needed" | "converted";
  followUpRequired: boolean;
  followUpDate?: Date;

  // Metadata
  duration?: number;             // Seconds (for calls)
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
  createdAt: Date;
  processedAt?: Date;            // When AI analysis completed
}
```

**DynamoDB Table:** `tasco-interactions`
- **PK:** `interactionId`
- **SK:** `createdAt`
- **GSI1:** `customerId#createdAt` → Customer interaction timeline
- **GSI2:** `leadId#createdAt` → Lead interaction history
- **GSI3:** `staffId#createdAt` → Staff interaction history
- **GSI4:** `sentiment#createdAt` → Negative sentiment alerts
- **GSI5:** `followUpRequired#followUpDate` → Pending follow-ups

---

#### 1.5 **Purchases** (Vehicle Sales)
```typescript
Purchase {
  id: string;                    // PK: "PURCH#uuid"
  orderId: string;               // Business order ID
  customerId: string;            // FK → Customer
  leadId?: string;               // FK → Lead (if from lead)
  entityId: string;              // FK → Entity (showroom)

  // Vehicle Details
  vehicle: {
    vin?: string;                // Vehicle Identification Number
    brand: string;               // "Toyota", "Ford"
    model: string;               // "Fortuner", "Ranger"
    variant: string;             // "2.4 AT 4x2", "Wildtrak 2.0L"
    year: number;
    color: string;
    type: "new" | "used";
    mileage?: number;            // For used cars
  };

  // Pricing
  pricing: {
    listPrice: number;
    discount: number;
    finalPrice: number;
    tradeinValue?: number;       // If trade-in
    financingAmount?: number;
    downPayment?: number;
    currency: "VND";
  };

  // Payment & Financing
  paymentMethod: "cash" | "financing" | "leasing";
  financingProvider?: string;
  loanTerm?: number;             // Months

  // Delivery
  status: "ordered" | "in_transit" | "delivered" | "cancelled";
  orderDate: Date;
  deliveryDate?: Date;
  deliveryAddress?: string;

  // Sales Info
  salesRepId: string;
  salesRepName: string;
  commission?: number;

  // Related Services
  addons: Array<{
    name: string;                // "Extended Warranty", "Insurance"
    price: number;
    provider?: string;
  }>;

  // Trade-in (if applicable)
  tradein?: {
    vin: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    valuationPrice: number;
  };

  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**DynamoDB Table:** `tasco-purchases`
- **PK:** `purchaseId`
- **SK:** `orderDate`
- **GSI1:** `customerId#orderDate` → Customer purchase history
- **GSI2:** `entityId#orderDate` → Showroom sales
- **GSI3:** `salesRepId#orderDate` → Sales rep performance
- **GSI4:** `vehicle.brand#orderDate` → Sales by brand
- **GSI5:** `status#orderDate` → Order fulfillment tracking

---

#### 1.6 **Campaigns** (Marketing Campaigns)
```typescript
Campaign {
  id: string;                    // PK: "CAMP#uuid"
  entityId: string;              // FK → Entity (or "ALL" for group-wide)

  // Campaign Details
  name: string;
  description: string;
  type: "promotion" | "product_launch" | "event" | "seasonal" | "retention";
  channel: "email" | "sms" | "whatsapp" | "social" | "multi_channel";

  // Targeting
  targeting: {
    segment: string[];           // "new", "regular", "vip"
    brands?: string[];           // Filter by brand interest
    models?: string[];
    lifetimeValueMin?: number;
    lifetimeValueMax?: number;
    lastPurchaseMonths?: number; // Purchased in last X months
    customFilters?: Record<string, any>;
  };
  recipientCount: number;        // Estimated/actual recipients

  // Content
  content: {
    subject?: string;            // For email/SMS
    message: string;
    personalized: boolean;       // Uses AI personalization
    personalizationFields?: string[]; // ["name", "preferred_model"]
    callToAction: string;
    landingPageUrl?: string;
  };

  // Scheduling
  status: "draft" | "scheduled" | "running" | "completed" | "paused";
  scheduledAt?: Date;
  launchedAt?: Date;
  completedAt?: Date;

  // Performance Metrics
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;           // Led to purchase
    revenue: number;             // Revenue attributed
    cost: number;                // Campaign cost
    roi: number;                 // Return on investment
  };

  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      content: string;
      recipientPercent: number;
      metrics: {
        sent: number;
        opened: number;
        clicked: number;
        converted: number;
      };
    }>;
    winningVariant?: string;
  };

  // Metadata
  createdBy: string;             // User ID
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**DynamoDB Table:** `tasco-campaigns`
- **PK:** `campaignId`
- **SK:** `metadata`
- **GSI1:** `entityId#status` → Active campaigns by showroom
- **GSI2:** `status#scheduledAt` → Upcoming scheduled campaigns
- **GSI3:** `type#launchedAt` → Campaign performance by type
- **GSI4:** `metrics.roi#completedAt` → Best performing campaigns

---

#### 1.7 **Campaign Engagements** (Campaign Response Tracking)
```typescript
CampaignEngagement {
  id: string;                    // PK: "ENG#uuid"
  campaignId: string;            // FK → Campaign
  customerId: string;            // FK → Customer

  // Engagement Details
  status: "sent" | "delivered" | "opened" | "clicked" | "converted" | "bounced" | "unsubscribed";
  variant?: string;              // A/B test variant ID

  // Timestamps
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  convertedAt?: Date;

  // Personalization
  personalizedContent?: string;  // AI-generated personalized message
  personalizedFields?: Record<string, string>;

  // Conversion
  converted: boolean;
  conversionValue?: number;      // Revenue from conversion
  purchaseId?: string;           // FK → Purchase (if converted)

  // Metadata
  channel: "email" | "sms" | "whatsapp" | "social";
  deviceType?: "mobile" | "desktop" | "tablet";
  createdAt: Date;
}
```

**DynamoDB Table:** `tasco-campaign-engagements`
- **PK:** `engagementId`
- **SK:** `sentAt`
- **GSI1:** `campaignId#status` → Campaign engagement breakdown
- **GSI2:** `customerId#campaignId` → Customer campaign history
- **GSI3:** `status#sentAt` → Track opens, clicks, conversions

---

### Supporting Entities (3 tables)

#### 1.8 **Activities** (Audit Log)
```typescript
Activity {
  id: string;                    // PK: "ACT#uuid"
  entityId: string;              // FK → Entity
  userId: string;                // Staff/system user

  // Activity Details
  type: "lead_created" | "lead_assigned" | "customer_updated" |
        "interaction_logged" | "campaign_launched" | "purchase_completed";
  entityType: "lead" | "customer" | "interaction" | "purchase" | "campaign";
  entityRef: string;             // Reference ID

  action: string;                // "created", "updated", "deleted"
  description: string;

  // Changes (for updates)
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

**DynamoDB Table:** `tasco-activities`
- **PK:** `activityId`
- **SK:** `timestamp`
- **GSI1:** `entityType#entityRef` → Activity log for specific entity
- **GSI2:** `userId#timestamp` → User activity history

---

#### 1.9 **AI Recommendations**
```typescript
AIRecommendation {
  id: string;                    // PK: "REC#uuid"

  // Target
  targetType: "lead" | "customer";
  targetId: string;              // Lead/Customer ID

  // Recommendation
  type: "next_best_action" | "model_suggestion" | "campaign_target" |
        "retention_action" | "upsell_opportunity";
  title: string;
  description: string;
  confidence: number;            // 0-1

  // Context
  reasoning: string[];           // Array of reasons
  data: Record<string, any>;     // Supporting data

  // Actions
  suggestedActions: Array<{
    action: string;              // "call_customer", "send_email", "schedule_visit"
    priority: number;
    estimatedImpact: string;
  }>;

  // Status
  status: "active" | "applied" | "dismissed" | "expired";
  appliedAt?: Date;
  appliedBy?: string;
  outcome?: string;

  // Metadata
  agentId: string;               // Which AI agent generated this
  createdAt: Date;
  expiresAt?: Date;
}
```

**DynamoDB Table:** `tasco-ai-recommendations`
- **PK:** `recommendationId`
- **SK:** `createdAt`
- **GSI1:** `targetType#targetId#status` → Active recommendations for entity
- **GSI2:** `type#confidence` → High-confidence recommendations
- **GSI3:** `status#expiresAt` → Pending/expiring recommendations

---

#### 1.10 **Users** (Staff/Sales Reps)
```typescript
User {
  id: string;                    // PK: "USER#uuid"
  entityId: string;              // FK → Entity (primary showroom)

  // Profile
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "sales_rep" | "cs_agent";

  // Assignment
  assignedEntities: string[];    // Can work across multiple showrooms
  specializations: string[];     // Brands/models they specialize in

  // Performance
  performance: {
    leadsAssigned: number;
    leadsConverted: number;
    conversionRate: number;      // %
    avgResponseTime: number;     // Minutes
    customerSatisfaction: number; // 0-5 rating
    totalRevenue: number;
  };

  // Settings
  settings: {
    autoAssign: boolean;
    maxLeads: number;            // Max concurrent leads
    workingHours: {
      start: string;             // "09:00"
      end: string;               // "18:00"
    };
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
  };

  // Metadata
  status: "active" | "inactive";
  createdAt: Date;
  lastLoginAt?: Date;
}
```

**DynamoDB Table:** `tasco-users`
- **PK:** `userId`
- **SK:** `metadata`
- **GSI1:** `entityId#role` → Users by showroom and role
- **GSI2:** `email` → User lookup
- **GSI3:** `role#performance.conversionRate` → Top performers

---

## 2. Entity Relationships

```
┌──────────────┐
│   Entities   │  (Showrooms)
│  (Showrooms) │
└──────┬───────┘
       │
       │ 1:N
       │
       ├─────────────────────┬─────────────────────┬─────────────────────┐
       │                     │                     │                     │
       ▼                     ▼                     ▼                     ▼
┌──────────┐         ┌────────────┐        ┌───────────┐        ┌──────────┐
│  Leads   │         │ Customers  │        │ Campaigns │        │  Users   │
└────┬─────┘         └─────┬──────┘        └─────┬─────┘        └────┬─────┘
     │                     │                     │                    │
     │ 1:N                 │ 1:N                 │ 1:N                │ 1:N
     │                     │                     │                    │
     ├──────────┬──────────┴──────────┬──────────┴──────────┐         │
     │          │                     │                     │         │
     ▼          ▼                     ▼                     ▼         ▼
┌──────────────┐              ┌──────────────┐      ┌───────────────────┐
│ Interactions │              │  Purchases   │      │ Campaign          │
│  (History)   │              │   (Sales)    │      │ Engagements       │
└──────────────┘              └──────────────┘      └───────────────────┘
     │                              │
     │ N:1                          │ N:1
     │                              │
     └──────────────┬───────────────┘
                    │
                    ▼
            ┌────────────────┐
            │      AI        │
            │ Recommendations│
            └────────────────┘
```

### Key Relationships:

1. **Entity (Showroom) → Leads/Customers/Campaigns/Users** (1:N)
   - Each showroom has multiple leads, customers, campaigns, staff

2. **Lead → Customer** (1:1 on conversion)
   - When lead converts, creates Customer record
   - `Lead.convertedTo` → `Customer.id`

3. **Customer → Interactions** (1:N)
   - Customer has timeline of all communications

4. **Customer → Purchases** (1:N)
   - Customer can purchase multiple vehicles over time

5. **Lead → Interactions** (1:N)
   - Lead interactions before conversion

6. **Campaign → Campaign Engagements** (1:N)
   - Campaign sent to many customers, each creates engagement record

7. **User → Leads** (1:N via assignment)
   - Sales rep assigned to multiple leads
   - `Lead.assignedTo` → `User.id`

8. **Lead/Customer → AI Recommendations** (1:N)
   - AI generates recommendations for leads and customers

---

## 3. Data Access Patterns

### Queries by Feature:

#### **Lead Management**
```typescript
// 1. Get all leads for showroom (with filters)
GSI1: entityId#status → status = "new"

// 2. Get leads assigned to sales rep
GSI2: assignedTo#status

// 3. Get high-priority leads (score > 80)
GSI3: score#createdAt → score > 80

// 4. Analyze lead sources
GSI4: source#createdAt → group by source

// 5. Get lead with full history
PK: leadId
+ Query interactions: GSI2 on leadId
```

#### **Customer 360**
```typescript
// 1. Get customer profile
PK: customerId

// 2. Get customer interaction timeline
Interactions GSI1: customerId#createdAt

// 3. Get customer purchase history
Purchases GSI1: customerId#orderDate

// 4. Get customer campaign history
CampaignEngagements GSI2: customerId#campaignId

// 5. Find at-risk customers
Customers GSI5: insights.churnRisk > 0.7

// 6. Lookup customer by phone
Customers GSI3: phone
```

#### **Marketing**
```typescript
// 1. Get active campaigns for showroom
Campaigns GSI1: entityId#status → status = "running"

// 2. Get campaign performance
PK: campaignId
+ CampaignEngagements GSI1: campaignId#status

// 3. Get high-ROI campaigns
Campaigns GSI4: metrics.roi#completedAt

// 4. Get customer's campaign responses
CampaignEngagements GSI2: customerId#campaignId
```

#### **Analytics**
```typescript
// 1. Conversion funnel
Leads: count by status
Interactions: count by outcome
Purchases: count by status

// 2. Sales performance
Purchases GSI3: salesRepId#orderDate

// 3. Brand performance
Purchases GSI4: vehicle.brand#orderDate

// 4. Sentiment analysis
Interactions GSI4: sentiment = "negative"
```

---

## 4. AI Agents Architecture

### Agent Roles & Responsibilities

#### **4.1 Lead Scoring Agent**
```typescript
Agent: "Lead Scoring & Prioritization"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a3"

Purpose:
  - Score incoming leads based on conversion probability
  - Prioritize leads for sales team
  - Recommend optimal distribution

Input:
  - Lead data (source, contact info, interest, behavior)
  - Historical conversion data
  - Current sales team capacity

Output:
  - Lead score (0-100)
  - Priority level (hot/warm/cold)
  - Recommended sales rep for assignment
  - Scoring factors breakdown

Trigger:
  - On lead creation
  - On lead update (new interaction)
  - Periodic re-scoring (daily)

Tools:
  - Classification model for lead quality
  - Ranking algorithm for prioritization
  - Sales rep workload analysis

Prompt Template:
  ```
  Analyze this lead and provide a conversion probability score:

  Lead Details:
  - Source: {{source}}
  - Interest: {{interest.brands}} / {{interest.models}}
  - Budget: {{interest.budget}}
  - Timeframe: {{interest.timeframe}}
  - Contact quality: {{customer.phone}} / {{customer.email}}

  Historical Context:
  - Avg conversion rate for {{source}}: {{historical_conversion_rate}}
  - Showroom inventory match: {{inventory_match_score}}

  Provide:
  1. Overall score (0-100)
  2. Breakdown by factors
  3. Recommended actions
  4. Best sales rep to assign (based on specialization and workload)
  ```
```

---

#### **4.2 Sentiment Analysis Agent**
```typescript
Agent: "Interaction Sentiment & Intent Analysis"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a4"

Purpose:
  - Analyze customer interactions for sentiment
  - Extract topics and intent
  - Identify urgent issues or escalations

Input:
  - Interaction transcript (call, chat, email)
  - Customer context (history, segment)
  - Previous interaction sentiment

Output:
  - Sentiment (positive/neutral/negative)
  - Sentiment score (-1 to 1)
  - Topics discussed (pricing, features, service, complaint)
  - Intent classification (inquiry, purchase, complaint, service)
  - Urgency level
  - Summary of key points

Trigger:
  - On interaction creation
  - Real-time during call/chat

Tools:
  - NLP sentiment analysis
  - Topic extraction
  - Intent classification
  - Speech-to-text (for calls)

Prompt Template:
  ```
  Analyze this customer interaction:

  Interaction:
  Type: {{type}}
  Content: {{transcript}}

  Customer Context:
  - Segment: {{customer.segment}}
  - Previous sentiment: {{customer.insights.sentiment}}
  - Recent purchases: {{recent_purchases}}

  Provide:
  1. Sentiment (positive/neutral/negative) with score
  2. Topics discussed (array)
  3. Intent (inquiry/purchase/complaint/service)
  4. Urgency (low/medium/high)
  5. Summary (2-3 sentences)
  6. Recommended follow-up action
  ```
```

---

#### **4.3 Customer Insights Agent**
```typescript
Agent: "Customer 360 Insights & Recommendations"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a5"

Purpose:
  - Generate comprehensive customer insights
  - Predict next purchase probability
  - Recommend next-best-action
  - Identify churn risk

Input:
  - Customer profile & preferences
  - Purchase history
  - Interaction history with sentiment
  - Campaign engagement history
  - Behavioral data

Output:
  - Next purchase probability
  - Recommended models/vehicles
  - Churn risk score
  - Next-best-action recommendation
  - Customer health score

Trigger:
  - On customer profile update
  - After new interaction
  - After campaign engagement
  - Periodic re-analysis (weekly)

Tools:
  - Predictive ML model for purchase probability
  - Churn prediction model
  - Recommendation engine
  - Customer segmentation

Prompt Template:
  ```
  Generate insights for this customer:

  Customer Profile:
  - Segment: {{segment}}
  - Lifetime value: {{lifetimeValue}}
  - Purchase count: {{purchaseCount}}
  - Last purchase: {{lastPurchase.date}} ({{lastPurchase.model}})

  Recent Activity:
  - Last visit: {{lastVisit}}
  - Recent interactions: {{interactionSummary}}
  - Sentiment trend: {{sentimentTrend}}
  - Campaign engagement: {{campaignEngagement}}

  Preferences:
  - Brands: {{preferences.brands}}
  - Vehicle types: {{preferences.vehicleTypes}}
  - Budget: {{preferences.priceRange}}

  Provide:
  1. Next purchase probability (0-1) with reasoning
  2. Recommended vehicles (top 3)
  3. Churn risk (0-1) with factors
  4. Next-best-action (specific recommendation)
  5. Customer health score (0-100)
  ```
```

---

#### **4.4 Marketing Personalization Agent**
```typescript
Agent: "Campaign Content Personalization"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a6"

Purpose:
  - Personalize campaign messages for each customer
  - Generate A/B test variants
  - Optimize send timing
  - Recommend campaign targets

Input:
  - Campaign template
  - Customer profile & preferences
  - Customer interaction history
  - Previous campaign performance
  - Current inventory

Output:
  - Personalized message content
  - Optimal send time
  - Recommended vehicle/offer
  - Expected engagement probability

Trigger:
  - On campaign launch
  - For each campaign recipient

Tools:
  - Content generation (GPT)
  - Personalization engine
  - Send time optimization
  - Recommendation system

Prompt Template:
  ```
  Personalize this campaign message:

  Campaign:
  Type: {{campaign.type}}
  Base message: {{campaign.content.message}}
  Offer: {{campaign.offer}}

  Customer:
  - Name: {{customer.name}}
  - Segment: {{customer.segment}}
  - Preferences: {{customer.preferences}}
  - Last purchase: {{customer.lastPurchase}}
  - Recent interest: {{customer.recentInterest}}

  Inventory Match:
  {{matching_vehicles}}

  Generate:
  1. Personalized message (keeping tone and CTA)
  2. Recommended vehicle(s) to highlight
  3. Optimal send time based on customer behavior
  4. Expected engagement probability
  ```
```

---

#### **4.5 Conversational AI Assistant**
```typescript
Agent: "Customer Lifecycle Chatbot"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a7"

Purpose:
  - Answer questions about leads, customers, campaigns
  - Provide insights and analytics
  - Help staff with data lookup
  - Generate reports

Input:
  - User question (natural language)
  - User context (role, showroom)
  - Database access

Output:
  - Natural language response
  - Relevant data/charts
  - Actionable recommendations

Trigger:
  - User message in chat interface

Tools:
  - RAG over customer data
  - SQL/DynamoDB query generation
  - Chart generation
  - Function calling for data retrieval

Prompt Template:
  ```
  You are a Customer Lifecycle Management assistant for Tasco Auto.

  You help sales reps, managers, and CS agents by:
  1. Finding customer and lead information
  2. Providing insights and analytics
  3. Recommending actions
  4. Answering questions about campaigns and performance

  Available data:
  - Leads ({{lead_count}} active)
  - Customers ({{customer_count}})
  - Interactions, Purchases, Campaigns

  User: {{user.role}} at {{user.entityName}}

  Question: {{user_question}}

  Respond naturally and helpfully. Use data to support your answers.
  If you need to look up specific data, use the available functions.
  ```
```

---

#### **4.6 Lead Distribution Agent**
```typescript
Agent: "Intelligent Lead Distribution & Routing"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a8"

Purpose:
  - Auto-assign leads to best-fit sales reps
  - Balance workload across team
  - Match leads to rep specializations
  - Optimize for conversion probability

Input:
  - New lead data
  - Sales rep profiles (specializations, workload, performance)
  - Team capacity
  - Historical assignment success

Output:
  - Recommended sales rep for assignment
  - Assignment reasoning
  - Alternative rep suggestions
  - Expected conversion probability

Trigger:
  - On new lead creation
  - When lead is manually reassigned
  - When rep reaches max capacity

Tools:
  - Matching algorithm
  - Workload balancing
  - Performance analysis

Prompt Template:
  ```
  Assign this lead to the best sales representative:

  Lead:
  - Source: {{source}}
  - Interest: {{interest.brands}} / {{interest.models}}
  - Budget: {{interest.budget}}
  - Location: {{customer.location}}
  - Score: {{score}}

  Available Sales Reps:
  {{#each sales_reps}}
  - {{name}}
    - Specializations: {{specializations}}
    - Current leads: {{currentLeads}} / {{maxLeads}}
    - Conversion rate: {{conversionRate}}%
    - Avg response time: {{avgResponseTime}} min
  {{/each}}

  Consider:
  1. Brand/model specialization match
  2. Current workload
  3. Historical performance
  4. Geographic proximity

  Provide:
  1. Recommended rep (primary)
  2. Alternative reps (2 backups)
  3. Reasoning for each
  4. Expected conversion probability
  ```
```

---

#### **4.7 Quality Assurance Agent** (Optional)
```typescript
Agent: "Interaction Quality & Compliance Check"
ID: "66ac13e1-2346-4fb8-b8a3-8a058f12c1a9"

Purpose:
  - Monitor interaction quality
  - Check compliance with policies
  - Identify training needs
  - Escalate issues

Input:
  - Interaction transcript
  - Company policies & guidelines
  - Staff performance history

Output:
  - Quality score (0-100)
  - Compliance issues (if any)
  - Training recommendations
  - Escalation flag

Trigger:
  - On interaction completion
  - Periodic quality audits

Tools:
  - Compliance checking
  - Quality scoring
  - Policy knowledge base

Prompt Template:
  ```
  Review this customer interaction for quality and compliance:

  Interaction:
  {{transcript}}

  Staff: {{staff.name}} ({{staff.role}})

  Company Standards:
  - Professional tone ✓
  - Active listening ✓
  - Product knowledge ✓
  - Compliance with pricing policy ✓
  - Data privacy compliance ✓

  Evaluate:
  1. Quality score (0-100)
  2. Compliance issues (list any violations)
  3. Strengths (what went well)
  4. Improvement areas
  5. Training recommendations
  ```
```

---

## 5. Agent Integration Flow

### Example: New Lead Processing

```
1. Lead Created
   ↓
2. Lead Scoring Agent
   - Generates score
   - Determines priority
   ↓
3. Lead Distribution Agent
   - Assigns to best-fit sales rep
   - Creates AI recommendation
   ↓
4. Notification to Sales Rep
   - "New hot lead assigned"
   - View lead details + AI insights
   ↓
5. Sales Rep Contacts Lead
   - Call/email/chat
   ↓
6. Interaction Logged
   ↓
7. Sentiment Analysis Agent
   - Analyzes conversation
   - Extracts topics and intent
   - Updates customer sentiment
   ↓
8. Customer Insights Agent (if converted)
   - Generates Customer 360
   - Predicts next purchase
   - Recommends next-best-action
   ↓
9. Marketing Personalization Agent
   - Adds to nurture campaign
   - Personalizes follow-up messages
```

---

## 6. Summary

### Database Entities: **10 tables**

| Entity | Purpose | Records (Estimate) |
|--------|---------|-------------------|
| Entities | Showrooms/locations | 100 |
| Leads | Lead tracking | 10,000+ |
| Customers | Customer 360 profiles | 50,000+ |
| Interactions | Communication history | 500,000+ |
| Purchases | Vehicle sales | 30,000+ |
| Campaigns | Marketing campaigns | 500+ |
| Campaign Engagements | Campaign responses | 1M+ |
| Activities | Audit log | 2M+ |
| AI Recommendations | AI-generated insights | 50,000+ |
| Users | Staff/sales reps | 1,000 |

### AI Agents: **7 agents**

| Agent | Purpose | Trigger |
|-------|---------|---------|
| Lead Scoring | Prioritize leads | On lead creation/update |
| Sentiment Analysis | Analyze interactions | On interaction |
| Customer Insights | Generate 360 insights | Periodic + on update |
| Marketing Personalization | Personalize campaigns | On campaign launch |
| Conversational Assistant | Answer questions | User query |
| Lead Distribution | Auto-assign leads | New lead |
| Quality Assurance | Monitor quality | Interaction complete |

---

This architecture supports:
- ✅ Lead optimization and distribution
- ✅ Customer 360 unified profiles
- ✅ Multi-channel interaction tracking
- ✅ Marketing personalization
- ✅ AI-powered insights and recommendations
- ✅ Analytics and reporting
- ✅ Multi-showroom support with entity selection
