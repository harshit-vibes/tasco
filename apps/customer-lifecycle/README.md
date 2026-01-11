# Customer Lifecycle Management

> AI-powered customer lifecycle management for Tasco Auto

**Innovation Day Demo Application**

---

## 📋 Overview

The Customer Lifecycle Management app is a comprehensive CRM solution designed for Tasco Auto's showroom network. It provides end-to-end customer journey tracking from lead generation to loyal customer retention, with AI-powered insights and recommendations.

### Business Challenge Addressed

**Original Challenge**: Customer Lifecycle Management (from 21 submitted challenges)

**Solution**: Unified platform for managing leads, customers, interactions, purchases, campaigns, and AI-driven recommendations across Tasco Auto's 17 entity showrooms.

---

## ✨ Key Features

### 🎯 Lead Management
- Lead capture from multiple sources (website, referral, walk-in, event, social media)
- Priority scoring (Hot, Warm, Cold) based on engagement
- Status tracking (New, Contacted, Qualified, Nurturing, Converted, Lost)
- Lead assignment and contact history
- Real-time conversion rate analytics

### 👥 Customer 360
- Complete customer profile with lifecycle stage tracking
- Segment classification (VIP, Regular, At-Risk, New)
- Lifetime value calculation and purchase history
- Churn risk prediction
- Satisfaction scoring and sentiment analysis

### 🎪 Marketing Campaigns
- Multi-channel campaign management (Email, SMS, Social, Event, Direct Mail)
- Campaign performance tracking (sent, delivered, opened, clicked, converted)
- ROI calculation and budget management
- Active campaign monitoring

### 🤖 AI Recommendations
- Next best action suggestions
- Churn prevention alerts
- Upsell and cross-sell opportunities
- Lead nurturing automation
- Service reminder notifications
- Confidence-scored recommendations

### 💬 AI Assistant
- Conversational AI for customer lifecycle queries
- Trend analysis and insights
- Action recommendations
- Campaign optimization suggestions

### 📊 Analytics Dashboard
- Real-time KPI tracking
- Lead funnel visualization
- Customer retention metrics
- At-risk customer alerts
- Campaign performance overview

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (animations)
- i18next (internationalization)

**Backend/Data:**
- AWS DynamoDB (production database)
- Lyzr SDK (AI agent integration)
- Real-time data sync

**State Management:**
- React hooks (useState, useEffect)
- i18n context provider

### Project Structure

```
apps/customer-lifecycle/
├── app/                          # Next.js app router pages
│   ├── page.tsx                  # Dashboard
│   ├── leads/                    # Lead management pages
│   ├── customers/                # Customer management pages
│   ├── chat/                     # AI Assistant
│   └── layout.tsx                # Root layout with i18n
├── components/                   # React components
│   ├── app-shell.tsx            # Main app wrapper
│   ├── sidebar.tsx              # Navigation sidebar
│   └── header.tsx               # Entity selector header
├── lib/                          # Business logic
│   ├── data-layer.ts            # Data access layer
│   ├── config.ts                # App configuration
│   └── i18n.ts                  # i18n initialization
└── locales/                      # (deprecated, moved to packages/i18n)
```

---

## 🗄️ Data Model

### DynamoDB Tables

**Customer Lifecycle Tables:**
- `tasco-leads` - Lead records with scoring and status
- `tasco-customers` - Customer profiles and lifecycle data
- `tasco-interactions` - Customer/lead interaction history
- `tasco-purchases` - Purchase transaction records
- `tasco-campaigns` - Marketing campaign data
- `tasco-recommendations` - AI-generated recommendations

**Shared Tables:**
- `tasco-entities` - Tasco Auto showroom entities (17 locations)
- `tasco-users` - User profiles and roles
- `tasco-conversations` - AI chat conversations
- `tasco-messages` - Chat message history
- `tasco-notifications` - App notifications

### Type System

**Enums** (defined in `@tasco/db`):
```typescript
// Lead Enums
LeadSource = "website" | "referral" | "walk-in" | "event" | "social" | "other"
LeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost"
LeadPriority = "hot" | "warm" | "cold"

// Customer Enums
CustomerStage = "prospect" | "active" | "loyal" | "at-risk" | "churned"
CustomerSegment = "vip" | "regular" | "at-risk" | "new"

// Interaction Enums
InteractionType = "call" | "email" | "meeting" | "note" | "support" | "other"
InteractionChannel = "phone" | "email" | "in-person" | "chat"
Sentiment = "positive" | "neutral" | "negative"

// Campaign Enums
CampaignType = "email" | "sms" | "social" | "event" | "direct-mail"
CampaignStatus = "draft" | "active" | "paused" | "completed"

// Recommendation Enums
RecommendationType = "next_best_action" | "churn_prevention" | "upsell" | "cross_sell" | "lead_nurturing" | "service_reminder"
RecommendationPriority = "low" | "medium" | "high" | "urgent"
RecommendationStatus = "pending" | "completed" | "dismissed"
```

---

## 🌍 Internationalization (i18n)

The app supports **English** and **Vietnamese** with full translations.

### Supported Languages

| Language | Code | Coverage |
|----------|------|----------|
| English | `en` | ✅ Complete |
| Vietnamese | `vi` | ✅ Complete |

### Translation Namespaces

**Shared** (from `@tasco/i18n`):
- `common` - Common UI elements
- `chat` - Chat interface
- `sidebar` - Navigation sidebar
- `header` - App header

**App-Specific** (customer-lifecycle):
- `app` - App metadata, navigation, actions
- `dashboard` - Dashboard page
- `leads` - Lead management
- `customers` - Customer management

### Usage Example

```typescript
import { useTranslation } from '@tasco/i18n';

const { t } = useTranslation('app');

// English: "Dashboard"
// Vietnamese: "Tổng Quan"
<h1>{t('navigation.dashboard')}</h1>

// With interpolation
<span>{t('dashboard.cards.lead_inbox.new_count', { count: 5 })}</span>
```

### Language Switching

Users can switch languages via the language switcher component in the header (future enhancement).

---

## ⚙️ Configuration

### App Configuration (`lib/config.ts`)

All app settings are centralized in a single config file:

**App Metadata:**
```typescript
APP_CONFIG = {
  name: "Customer Lifecycle",
  company: "Tasco Auto",
  version: "1.0.0",
  description: "AI-powered customer lifecycle management for Tasco Auto",
  tagline: "Innovation Day Demo",
}
```

**Filter Options:**
```typescript
FILTER_OPTIONS = {
  priority: { all, hot, warm, cold },
  leadStatus: { all, new, contacted, qualified, ... },
  leadSource: { all, website, referral, walk-in, ... },
  customerSegment: { all, vip, regular, at-risk, new },
  customerStage: { all, prospect, active, loyal, ... },
}
```

**Search Configuration:**
```typescript
SEARCH_CONFIG = {
  debounceMs: 300,
  minQueryLength: 2,
  placeholders: {
    leads: "Search by name, email, or phone...",
    customers: "Search by name, email, or phone...",
    campaigns: "Search campaigns...",
  },
}
```

**Color Schemes:**
```typescript
PRIORITY_COLORS = {
  hot: { bg, text, border },
  warm: { bg, text, border },
  cold: { bg, text, border },
}
```

See `lib/config.ts` for complete configuration options.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or Bun
- AWS credentials configured for DynamoDB access
- Lyzr API key

### Installation

```bash
# From monorepo root
cd apps/customer-lifecycle

# Install dependencies (using Bun)
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
LYZR_API_KEY=your_lyzr_api_key_here
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

### Database Setup

**IMPORTANT**: This app uses **production AWS DynamoDB** - no local setup required.

The tables are automatically initialized via:
```bash
cd packages/db
bun run db:init        # Create tables
bun run db:seed-users  # Seed user data
```

### Running the App

```bash
# Development mode (port 3002)
bun dev

# Production build
bun build
bun start
```

**Access the app at**: http://localhost:3002

---

## 📱 User Roles

The app supports multiple user roles with different permissions:

| Role | Access | Entities |
|------|--------|----------|
| **Admin** | Full access | All showrooms |
| **Manager** | Manage team, view reports | Assigned showrooms |
| **Sales Rep** | Manage leads & customers | Assigned showrooms |
| **Support** | View-only, add interactions | All showrooms |

Current demo users (seeded):
- **Nguyễn Thị Lan** - Manager (Tasco Auto Hà Nội)
- **Trần Văn Minh** - Manager (Carpla Showroom Hồ Chí Minh)
- **Lê Hoàng Anh** - Sales Rep
- **Phạm Thị Hương** - Sales Rep
- **Võ Minh Tuấn** - Sales Rep
- **Đặng Thu Hà** - Sales Rep
- **Bùi Quốc Khánh** - Sales Rep
- **Ngô Thị Mai** - Support
- **Trương Đức Thành** - Admin

---

## 🎨 UI/UX Highlights

### Design Principles

- **Vietnamese-First**: Full Vietnamese language support with proper fonts
- **Responsive**: Mobile-first design (768px breakpoint)
- **Accessible**: WCAG AA compliant color contrast
- **Consistent**: shadcn/ui component library
- **Delightful**: Smooth animations with Framer Motion

### Key UI Components

**Entity Selector** (`@tasco/ui`):
- Single/multi-select mode
- Hierarchical entity display (parent → holding → subsidiary)
- Search and filter capabilities

**Sidebar Navigation**:
- Collapsible with icon-only mode
- Active route highlighting
- Mobile drawer on small screens

**Dashboard Cards**:
- Real-time KPI tracking
- Trend indicators (up/down)
- Quick action links

**Data Tables**:
- Sort, filter, search capabilities
- Pagination support
- Row actions (view, edit, delete)

---

## 🔗 Integration with Shared Packages

### `@tasco/db`

Data access layer for DynamoDB operations.

```typescript
import {
  getAllLeads,
  getAtRiskCustomers,
  LeadStatus,
  LeadPriority,
  LEAD_STATUSES,
} from '@tasco/db';

const leads = await getAllLeads();
const atRisk = await getAtRiskCustomers();
```

### `@tasco/ui`

Shared UI components library.

```typescript
import { Button, Card, EntitySelector } from '@tasco/ui';
import { Users, TrendingUp } from '@tasco/ui/icons';
```

### `@tasco/lyzr`

Lyzr SDK wrapper for AI agent integration.

```typescript
import { useChat } from '@tasco/lyzr/hooks';

const { messages, sendMessage, isLoading } = useChat({
  conversationId,
  agentId: AGENT_ID,
});
```

### `@tasco/i18n`

Internationalization package.

```typescript
import { useTranslation, I18nProvider } from '@tasco/i18n';
```

---

## 📊 Demo Data

The app includes seeded demo data:

- **9 Users** - Managers, Sales Reps, Support, Admin
- **17 Entities** - Tasco Auto and Carpla showrooms across Vietnam
- **Leads** - Sample leads with various statuses and priorities
- **Customers** - Sample customers with purchase history
- **Interactions** - Sample interaction records
- **Campaigns** - Active marketing campaigns
- **Recommendations** - AI-generated suggestions

---

## 🧪 Testing

```bash
# Run tests (when implemented)
bun test

# Type checking
bun run type-check

# Linting
bun run lint
```

---

## 📈 Future Enhancements

### Planned Features

- [ ] Advanced analytics and reporting
- [ ] Email/SMS integration
- [ ] Calendar integration for scheduling
- [ ] Document management
- [ ] Mobile app (React Native)
- [ ] Bulk operations (import/export)
- [ ] Advanced filtering and saved views
- [ ] Custom dashboards
- [ ] Workflow automation
- [ ] Integration with Tasco Auto's existing systems

### Technical Improvements

- [ ] Real-time updates (WebSockets)
- [ ] Offline mode support
- [ ] Performance optimization (virtual scrolling)
- [ ] Advanced caching strategies
- [ ] Comprehensive test coverage
- [ ] E2E testing with Playwright
- [ ] CI/CD pipeline
- [ ] Performance monitoring (Sentry)

---

## 🤝 Contributing

This is an internal Tasco Innovation Day demo project. For questions or suggestions, contact the development team.

---

## 📝 License

Internal use only - Tasco Group

---

## 📞 Support

For technical support or questions:
- **Development Team**: Lyzr Blueprint Track
- **Project Owner**: Harshit Choudhary
- **Organization**: Tasco Group / Lyzr

---

## 🎯 Success Metrics

### Key Performance Indicators

**Lead Management:**
- Lead response time < 1 hour
- Conversion rate improvement > 15%
- Lead scoring accuracy > 80%

**Customer Retention:**
- Churn rate reduction > 20%
- Customer satisfaction score > 85%
- At-risk customer intervention rate > 90%

**Campaign Effectiveness:**
- Campaign ROI > 3x
- Email open rate > 25%
- Conversion rate > 5%

**AI Recommendations:**
- Recommendation acceptance rate > 60%
- Accuracy of churn predictions > 75%
- Time saved per sales rep > 2 hours/week

---

## 📚 Related Documentation

- [Tasco Innovation Day PRD](../../docs/prd-compliance-qa.md)
- [Challenge Mapping](../../docs/mapping.md)
- [DynamoDB Schema](../../packages/db/README.md)
- [i18n Configuration](../../packages/i18n/README.md)
- [UI Components](../../packages/ui/README.md)

---

**Built with ❤️ for Tasco Auto Innovation Day 2024**
