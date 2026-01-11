#!/usr/bin/env bun
/**
 * Seed App Guides with One-Pager Content
 *
 * This script populates the app guides table with comprehensive
 * one-pager content for all 8 Tasco demo applications.
 *
 * Usage:
 *   cd packages/db && bun run seed-guides
 */

import { putAppGuide, type CreateAppGuideInput, type GuideSlide, type AppOnePager, type OnePagerSection } from "../guide";

// ============================================================================
// COMPLIANCE-QA (G1) - Compliance & Document Governance
// ============================================================================
const complianceQaGuide: CreateAppGuideInput = {
  appId: "compliance-qa",
  language: "en",
  appName: "Compliance & Document Governance",
  appTagline: "AI-powered legal compliance and document intelligence for Tasco Group",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "TASCO Group manages 150-200 subsidiaries with a small legal team (~4 staff), creating significant compliance and governance challenges.",
      bulletPoints: [
        "Manual cross-referencing of internal policies against Vietnamese laws",
        "Fragmented document handling across hundreds of entities",
        "Inconsistent policy interpretation and enforcement",
        "Failed past AI attempts due to hallucination and inconsistency",
        "Slow decision-making from operational overload"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "Multi-agent architecture providing instruction-locked, deterministic compliance analysis with human-in-the-loop design.",
      bulletPoints: [
        "Orchestrator Agent for intent routing (Legal vs Finance workflows)",
        "Legal Expert Agent grounded in Vietnamese Enterprise Law",
        "Internal Policy Agent for corporate governance documents",
        "Validation Agent ensuring source-grounded, traceable outputs",
        "Dual Knowledge Bases: Legal KB + Internal Documents KB"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Working POC demonstrating core compliance and document intelligence capabilities.",
      bulletPoints: [
        "Document upload and categorization (Charter, Policies, Resolutions)",
        "Natural language Q&A with citation system",
        "Clause-level compliance mapping",
        "Multi-entity document filtering (17 Tasco entities)",
        "Bilingual support (English/Vietnamese)"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Modern, responsive UI built with Next.js 15 and shadcn/ui components.",
      bulletPoints: [
        "Chat interface with streaming responses",
        "Clickable citations linking to source documents",
        "Document preview with PDF viewer",
        "Entity selector with hierarchy navigation",
        "Knowledge base management dashboard"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "AWS-powered backend with DynamoDB and S3 for scalable document storage.",
      bulletPoints: [
        "DynamoDB: conversations, messages, documents, entities",
        "S3: Document storage with versioning",
        "Multi-tenant architecture with entity scoping",
        "Real-time document sync status tracking"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Lyzr-powered multi-agent system with RAG-enabled knowledge retrieval.",
      bulletPoints: [
        "4 specialized agents (Orchestrator, Legal, Internal, Validation)",
        "2 Knowledge Bases (Legal Framework, Internal Policies)",
        "Hybrid search: Vector embeddings + keyword matching",
        "Citation extraction and confidence scoring"
      ]
    },
    futureEnhancements: {
      title: "Future Roadmap",
      icon: "zap",
      iconColor: "pink",
      content: "Planned enhancements for Phase 2 and beyond.",
      bulletPoints: [
        "Real-time law database synchronization",
        "Advanced conflict detection algorithms",
        "Finance consolidation templates",
        "Workflow integration and approvals",
        "API for external system integration"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "shield",
      iconColor: "primary",
      title: "Compliance Intelligence",
      content: "Cross-check internal documents against Vietnamese laws with **clause-level mapping** and specific law article citations.",
      highlight: "AI-Powered"
    },
    {
      order: 2,
      icon: "database",
      iconColor: "blue",
      title: "Dual Knowledge Base",
      content: "Separate knowledge bases for **Legal Framework** (Enterprise Law, Decrees) and **Internal Policies** (Charters, Resolutions).",
      highlight: "RAG-Enabled"
    },
    {
      order: 3,
      icon: "users",
      iconColor: "green",
      title: "Multi-Entity Support",
      content: "Filter and search across **17 Tasco entities** with hierarchical navigation (Group → Holding → Subsidiary)."
    },
    {
      order: 4,
      icon: "globe",
      iconColor: "purple",
      title: "Bilingual Support",
      content: "Full English and Vietnamese (Tiếng Việt) language support for all interfaces and AI responses."
    },
    {
      order: 5,
      icon: "check",
      iconColor: "orange",
      title: "Human-in-the-Loop",
      content: "Every AI output is **traceable and auditable** with mandatory human review for final decisions."
    }
  ]
};

// ============================================================================
// CUSTOMER-LIFECYCLE (TA1) - Customer Lifecycle Management
// ============================================================================
const customerLifecycleGuide: CreateAppGuideInput = {
  appId: "customer-lifecycle",
  language: "en",
  appName: "Customer Lifecycle Management",
  appTagline: "360° customer profile and multi-channel experience personalization",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Tasco Auto operates 100+ showrooms serving 4.1M car owners, facing fragmented customer data and inconsistent experiences.",
      bulletPoints: [
        "Online leads not fully optimized, suboptimal distribution",
        "Sales follow-up relies on individual experience, not data",
        "Customer experience inconsistent across touchpoints",
        "Feedback data fragmented (call, chat, email)",
        "Marketing activities dispersed, promotions not personalized"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "AI-powered customer intelligence platform with unified 360° profile and personalized engagement.",
      bulletPoints: [
        "Lead Scoring Agent for intelligent lead distribution",
        "Customer Intelligence Agent for 360° profile building",
        "Recommendation Agent for personalized offers",
        "Sentiment Analysis from multi-channel interactions",
        "Unified Customer Data Platform (CDP)"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Working demo showcasing customer lifecycle stages and AI-powered recommendations.",
      bulletPoints: [
        "Lead capture and scoring dashboard",
        "Customer 360° profile view",
        "Interaction timeline (calls, chats, visits)",
        "AI-generated next-best-action recommendations",
        "Campaign effectiveness tracking"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "CRM-style interface with customer cards, timelines, and recommendation panels.",
      bulletPoints: [
        "Lead and customer card views",
        "Interaction timeline visualization",
        "Campaign management interface",
        "AI recommendation sidebar",
        "Multi-entity customer filtering"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Comprehensive customer data model with full lifecycle tracking.",
      bulletPoints: [
        "DynamoDB: leads, customers, interactions, purchases",
        "Campaign and recommendation tables",
        "Lead-to-customer conversion tracking",
        "Multi-entity scoping for dealer networks"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Conversational AI assistant for customer insights and recommendations.",
      bulletPoints: [
        "Customer Lifecycle Agent for unified chat",
        "NLP for sentiment analysis",
        "ML classification for lead scoring",
        "Recommendation engine integration"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "users",
      iconColor: "primary",
      title: "Customer 360° Profile",
      content: "Unified view of customer data from **all touchpoints** - showrooms, calls, emails, and digital channels."
    },
    {
      order: 2,
      icon: "zap",
      iconColor: "green",
      title: "Smart Lead Distribution",
      content: "AI-powered lead scoring and **intelligent distribution** to the right sales representatives."
    },
    {
      order: 3,
      icon: "brain",
      iconColor: "purple",
      title: "AI Recommendations",
      content: "Personalized **next-best-action** suggestions based on customer behavior and preferences.",
      highlight: "AI-Powered"
    },
    {
      order: 4,
      icon: "chart",
      iconColor: "blue",
      title: "Campaign Analytics",
      content: "Track marketing effectiveness and **optimize promotions** based on customer segments."
    }
  ]
};

// ============================================================================
// SALES-PRICING (INS2) - AI Sales & Pricing Cockpit
// ============================================================================
const salesPricingGuide: CreateAppGuideInput = {
  appId: "sales-pricing",
  language: "en",
  appName: "AI Sales & Pricing Cockpit",
  appTagline: "Intelligent motor insurance quotation and pricing optimization",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Tasco Insurance faces rapid growth in motor vehicle segment with manual pricing processes causing delays.",
      bulletPoints: [
        "Quotations still Excel-based (5-10 minutes/vehicle)",
        "Surge in claims causing backlogs and slow processing",
        "Initial damage assessment is manual and inconsistent",
        "Risk of fraud from slow verification processes",
        "Pricing decisions lack real-time data integration"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "AI-powered pricing cockpit with dynamic risk assessment and instant quotation generation.",
      bulletPoints: [
        "Pricing Agent for real-time quote generation (<1 minute)",
        "Risk Assessment Agent using telematics and behavioral data",
        "Claims History Analysis for accurate pricing",
        "Dynamic pricing model with market factors",
        "Fraud detection integration"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Quote generation workflow with risk-based pricing demonstration.",
      bulletPoints: [
        "Vehicle information input form",
        "Real-time quote calculation",
        "Risk factor visualization",
        "Quote history and comparison",
        "AI-assisted pricing recommendations"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Streamlined quote wizard with risk indicators and pricing breakdown.",
      bulletPoints: [
        "Step-by-step quote wizard",
        "Risk factor dashboard",
        "Premium breakdown visualization",
        "Quote comparison tools",
        "Chat-based pricing assistance"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Integration-ready architecture for insurance core systems.",
      bulletPoints: [
        "DynamoDB: quotes, pricing rules, risk factors",
        "Conversation persistence for pricing history",
        "Multi-entity support for 33 branches",
        "API-ready for Bravo/ERP integration"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Conversational pricing assistant with domain expertise.",
      bulletPoints: [
        "Sales Pricing Agent for quote generation",
        "Knowledge base with pricing rules",
        "Risk calculation integration",
        "Natural language query support"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "zap",
      iconColor: "primary",
      title: "Instant Quotes",
      content: "Generate motor insurance quotes in **under 1 minute** instead of 5-10 minutes with Excel.",
      highlight: "10x Faster"
    },
    {
      order: 2,
      icon: "chart",
      iconColor: "green",
      title: "Dynamic Pricing",
      content: "Risk-based pricing using **behavioral data, telematics, and claims history** for accurate premiums."
    },
    {
      order: 3,
      icon: "brain",
      iconColor: "purple",
      title: "AI Risk Assessment",
      content: "Automated risk scoring with **fraud detection** and anomaly identification.",
      highlight: "AI-Powered"
    },
    {
      order: 4,
      icon: "message",
      iconColor: "blue",
      title: "Conversational Interface",
      content: "Natural language queries for **pricing guidance** and policy recommendations."
    }
  ]
};

// ============================================================================
// E-LEARNING (INS3) - AI E-Learning Factory
// ============================================================================
const eLearningGuide: CreateAppGuideInput = {
  appId: "e-learning",
  language: "en",
  appName: "AI E-Learning Factory",
  appTagline: "Automated course creation and training content generation",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Tasco Insurance needs to train 1,000+ personnel but faces severe content creation bottlenecks.",
      bulletPoints: [
        "Large training demand but thin pool of qualified trainers",
        "Unable to hold continuous offline classes at scale",
        "Converting PowerPoint to SCORM takes weeks",
        "Difficult to scale team capability with growth speed",
        "Inconsistent training quality across 33 branches"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "Generative AI factory for rapid e-learning content creation from source materials.",
      bulletPoints: [
        "Course Outline Agent for curriculum design",
        "Module Content Agent for lesson generation",
        "Quiz Generator for assessment creation",
        "PPT-to-SCORM conversion automation",
        "Multi-format content generation (text, quiz, video scripts)"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "End-to-end course creation workflow demonstration.",
      bulletPoints: [
        "Topic input and outline generation",
        "Module and lesson content creation",
        "Interactive quiz generation",
        "Course preview and publishing",
        "Progress tracking dashboard"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Creator studio with step-by-step course building workflow.",
      bulletPoints: [
        "Describe → Design → Publish wizard",
        "Module and lesson editor",
        "Quiz builder with multiple question types",
        "Course preview mode",
        "Learning progress analytics"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Comprehensive course management data model.",
      bulletPoints: [
        "DynamoDB: courses, modules, lessons, quizzes",
        "User progress tracking tables",
        "Quiz attempt history",
        "Multi-entity course scoping"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Specialized agents for each stage of content creation.",
      bulletPoints: [
        "Course Outline Agent for structure design",
        "Module Content Agent for detailed lessons",
        "Chat Agent for learner Q&A support",
        "Document intelligence for source extraction"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "sparkles",
      iconColor: "primary",
      title: "AI Course Generation",
      content: "Transform topic descriptions into **complete course outlines** with modules, lessons, and quizzes.",
      highlight: "Generative AI"
    },
    {
      order: 2,
      icon: "zap",
      iconColor: "green",
      title: "Rapid Content Creation",
      content: "Reduce course development from **weeks to hours** with automated content generation."
    },
    {
      order: 3,
      icon: "check",
      iconColor: "blue",
      title: "Interactive Assessments",
      content: "Auto-generate **quizzes and knowledge checks** aligned with learning objectives."
    },
    {
      order: 4,
      icon: "chart",
      iconColor: "purple",
      title: "Progress Tracking",
      content: "Monitor learner progress and **completion rates** across all courses."
    }
  ]
};

// ============================================================================
// RISK-RADAR (INS4) - AI Risk & Profitability Radar
// ============================================================================
const riskRadarGuide: CreateAppGuideInput = {
  appId: "risk-radar",
  language: "en",
  appName: "AI Risk & Profitability Radar",
  appTagline: "Real-time risk monitoring and early warning system",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Tasco Insurance's technology and risk management systems lag behind rapid business growth.",
      bulletPoints: [
        "Data fragmented across multiple systems",
        "Difficult to analyze operational efficiency in real-time",
        "Management decisions based on delayed Excel reports",
        "Limited visibility into risk exposure",
        "Reactive rather than proactive risk management"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "Unified risk intelligence platform with early warning and proactive alerting.",
      bulletPoints: [
        "Risk Analysis Agent for multi-dimensional assessment",
        "Anomaly Detection for loss ratio monitoring",
        "Early Warning System for claim spikes",
        "Policy/Resource Recommendation Engine",
        "Data integration from core insurance systems"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Risk dashboard with real-time monitoring and alerting demonstration.",
      bulletPoints: [
        "Risk metrics dashboard",
        "Anomaly detection alerts",
        "Loss ratio analysis by segment",
        "Profitability heatmaps",
        "AI-powered risk insights chat"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Executive dashboard with drill-down analytics and alert management.",
      bulletPoints: [
        "Risk score overview cards",
        "Interactive profitability charts",
        "Alert notification center",
        "Segment analysis views",
        "Chat-based risk insights"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Analytics-ready infrastructure for risk data aggregation.",
      bulletPoints: [
        "DynamoDB: risk metrics, alerts, analysis results",
        "Integration points for core insurance data",
        "Multi-entity risk scoping",
        "Historical trend storage"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Conversational risk analysis assistant.",
      bulletPoints: [
        "Risk Radar Agent for natural language queries",
        "Integration with metrics database",
        "Proactive alert generation",
        "Recommendation engine for risk mitigation"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "shield",
      iconColor: "primary",
      title: "Early Warning System",
      content: "Proactive alerts for **loss ratio spikes, claim anomalies**, and profitability risks.",
      highlight: "Real-time"
    },
    {
      order: 2,
      icon: "chart",
      iconColor: "green",
      title: "Multi-Dimensional Analysis",
      content: "Risk assessment across **products, regions, channels, and customer segments**."
    },
    {
      order: 3,
      icon: "brain",
      iconColor: "purple",
      title: "AI Recommendations",
      content: "Intelligent policy and resource allocation suggestions to **optimize profitability**.",
      highlight: "AI-Powered"
    },
    {
      order: 4,
      icon: "zap",
      iconColor: "blue",
      title: "Unified Data View",
      content: "Consolidated data from **core insurance, accounting, and CRM** systems."
    }
  ]
};

// ============================================================================
// SALES-ORDER (INC1) - Order Data Entry Automation
// ============================================================================
const salesOrderGuide: CreateAppGuideInput = {
  appId: "sales-order",
  language: "en",
  appName: "Order Data Entry Automation",
  appTagline: "AI-powered OCR for automated sales order processing",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Inochi's sale admins manually enter orders from PDFs and images, causing delays and errors.",
      bulletPoints: [
        "Manual data entry from PDF files and images",
        "High risk of input errors in item codes and quantities",
        "Time-consuming SO creation in Bravo system",
        "Inconsistent customer order formats",
        "No standardized verification process"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "Intelligent document processing with AI OCR and automated SO creation pipeline.",
      bulletPoints: [
        "Extraction Agent for OCR and data recognition",
        "Validation Agent for accuracy verification",
        "Template standardization for customer orders",
        "Review interface before system recording",
        "API integration with Bravo ERP"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "End-to-end order processing from document upload to SO creation.",
      bulletPoints: [
        "PDF/Image upload and OCR extraction",
        "Extracted data review and editing",
        "AI validation with confidence scores",
        "Order history and metrics dashboard",
        "Activity timeline for audit trail"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Order management interface with extraction preview and approval workflow.",
      bulletPoints: [
        "Document upload with drag-and-drop",
        "Side-by-side extraction preview",
        "Inline editing and correction",
        "Order cards with status tracking",
        "Metrics dashboard for processing stats"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Complete order management data model with activity tracking.",
      bulletPoints: [
        "DynamoDB: orders, activity logs, metrics",
        "User management for sale admins",
        "Extracted data storage with validation status",
        "Multi-entity support for order routing"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Dual-agent system for extraction and validation.",
      bulletPoints: [
        "Extraction Agent for OCR and field recognition",
        "Validation Agent for data accuracy checking",
        "Confidence scoring for each field",
        "API-ready for Bravo integration"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "file",
      iconColor: "primary",
      title: "AI-Powered OCR",
      content: "Extract item codes, quantities, customers, and prices from **PDFs and images** automatically.",
      highlight: "AI-Powered"
    },
    {
      order: 2,
      icon: "check",
      iconColor: "green",
      title: "Smart Validation",
      content: "AI validates extracted data with **confidence scoring** and error highlighting."
    },
    {
      order: 3,
      icon: "zap",
      iconColor: "blue",
      title: "Faster Processing",
      content: "Reduce data entry time and **eliminate manual errors** in order creation."
    },
    {
      order: 4,
      icon: "chart",
      iconColor: "purple",
      title: "Processing Dashboard",
      content: "Monitor order entry **metrics, accuracy rates, and processing times**."
    }
  ]
};

// ============================================================================
// DATA-SYNC (INC2) - Sales & Revenue Data Sync
// ============================================================================
const dataSyncGuide: CreateAppGuideInput = {
  appId: "data-sync",
  language: "en",
  appName: "Sales & Revenue Data Sync",
  appTagline: "Real-time data synchronization across sales and accounting systems",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Inochi faces daily data discrepancies between sales platforms and accounting systems.",
      bulletPoints: [
        "Sales data (Haravan) and invoicing (Bravo) not synchronized",
        "Manual updates causing daily delays",
        "Data discrepancies affecting revenue recognition",
        "No real-time visibility across systems",
        "Simple scripts prone to failures and gaps"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "Intelligent data sync platform with AI-powered data quality monitoring.",
      bulletPoints: [
        "Real-time API synchronization module",
        "AI Data Quality Agent for mismatch detection",
        "Multi-platform integration (Haravan, Shopee, Bravo)",
        "Automated alert system for discrepancies",
        "Self-healing data reconciliation"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Sync monitoring dashboard with alert management.",
      bulletPoints: [
        "System health status overview",
        "Sync status for each connected platform",
        "Data mismatch alerts and details",
        "Reconciliation action buttons",
        "Historical sync performance"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Operations dashboard with real-time sync status and alerts.",
      bulletPoints: [
        "System health indicators",
        "Connected platform cards",
        "Alert notification panel",
        "Sync history timeline",
        "Chat-based diagnostics"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Integration-focused architecture for multi-system connectivity.",
      bulletPoints: [
        "DynamoDB: sync status, alerts, configurations",
        "API connectors for Haravan, Shopee, Bravo",
        "Event-driven sync triggers",
        "Audit logging for all sync operations"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Conversational interface for sync monitoring and diagnostics.",
      bulletPoints: [
        "Data Sync Agent for status queries",
        "Natural language troubleshooting",
        "Alert explanation and recommendations",
        "Integration health monitoring"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "database",
      iconColor: "primary",
      title: "Real-time Sync",
      content: "Automatic synchronization between **Haravan, Shopee, and Bravo** systems.",
      highlight: "Real-time"
    },
    {
      order: 2,
      icon: "search",
      iconColor: "green",
      title: "Data Quality AI",
      content: "AI-powered detection of **data mismatches and discrepancies** across platforms."
    },
    {
      order: 3,
      icon: "zap",
      iconColor: "blue",
      title: "Smart Alerts",
      content: "Proactive notifications for **sync failures and data anomalies**."
    },
    {
      order: 4,
      icon: "check",
      iconColor: "purple",
      title: "Accurate Revenue",
      content: "Ensure **real-time revenue recognition** with consistent data across systems."
    }
  ]
};

// ============================================================================
// PROMOTION-CONTROL (INC4) - Promotion Overlap Control
// ============================================================================
const promotionControlGuide: CreateAppGuideInput = {
  appId: "promotion-control",
  language: "en",
  appName: "Promotion Overlap Control",
  appTagline: "AI rules engine for intelligent promotion management",
  ctaText: "Start Exploring",
  enabled: true,
  onePager: {
    problemStatement: {
      title: "Business Challenges",
      icon: "target",
      iconColor: "red",
      content: "Inochi manages multiple promotions manually, leading to overlaps and revenue leakage.",
      bulletPoints: [
        "Manual promotion tracking via Excel/email",
        "Lack of synchronization across teams",
        "Potential overlap between customer/product/time",
        "No systematic conflict detection",
        "Difficult to measure promotion effectiveness"
      ]
    },
    lyzrSolution: {
      title: "Lyzr Agentic Solution",
      icon: "lightbulb",
      iconColor: "green",
      content: "AI-powered rules engine for promotion analysis, conflict detection, and alerting.",
      bulletPoints: [
        "Promotion Analysis Agent for overlap detection",
        "Machine learning for pattern recognition",
        "Automated conflict alerts to Sales/Marketing",
        "Integration with sales data for validation",
        "Daily/weekly/monthly automated reports"
      ]
    },
    demoCoverage: {
      title: "Demo Coverage",
      icon: "check",
      iconColor: "blue",
      content: "Promotion dashboard with conflict visualization and alerting.",
      bulletPoints: [
        "Promotion timeline visualization",
        "Conflict detection cards",
        "Alert management interface",
        "Promotion performance metrics",
        "Customer/product segment analysis"
      ]
    },
    frontendExperience: {
      title: "Frontend Experience",
      icon: "layout",
      iconColor: "purple",
      content: "Visual promotion management with timeline and conflict indicators.",
      bulletPoints: [
        "Promotion calendar timeline",
        "Conflict alert badges",
        "Segment breakdown charts",
        "Performance analytics",
        "Quick action buttons"
      ]
    },
    backendInfra: {
      title: "Backend Infrastructure",
      icon: "cpu",
      iconColor: "orange",
      content: "Promotion data model with conflict tracking.",
      bulletPoints: [
        "DynamoDB: promotions, conflicts, alerts",
        "Integration with sales channel data",
        "Historical promotion performance",
        "Multi-entity promotion scoping"
      ]
    },
    agenticInfra: {
      title: "Agentic Infrastructure",
      icon: "bot",
      iconColor: "cyan",
      content: "Rule-based conflict detection with ML enhancement.",
      bulletPoints: [
        "AI Rules Engine for conflict analysis",
        "Pattern recognition for promotion optimization",
        "Automated report generation",
        "Alert distribution via Email/Zalo"
      ]
    }
  },
  slides: [
    {
      order: 1,
      icon: "shield",
      iconColor: "primary",
      title: "Conflict Detection",
      content: "Automatically detect **promotion overlaps** across customers, products, and time periods.",
      highlight: "AI Rules Engine"
    },
    {
      order: 2,
      icon: "zap",
      iconColor: "green",
      title: "Smart Alerts",
      content: "Proactive notifications to **Sales and Marketing** before conflicts cause issues."
    },
    {
      order: 3,
      icon: "chart",
      iconColor: "blue",
      title: "Promotion Analytics",
      content: "Dashboard showing promotion **effectiveness and performance** by segment."
    },
    {
      order: 4,
      icon: "file",
      iconColor: "purple",
      title: "Automated Reports",
      content: "Daily, weekly, and monthly **promotion reports** generated automatically."
    }
  ]
};

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function seedGuides() {
  console.log("🌱 Seeding App Guides with One-Pager Content...\n");

  const guides = [
    complianceQaGuide,
    customerLifecycleGuide,
    salesPricingGuide,
    eLearningGuide,
    riskRadarGuide,
    salesOrderGuide,
    dataSyncGuide,
    promotionControlGuide,
  ];

  for (const guide of guides) {
    try {
      console.log(`📝 Seeding guide for: ${guide.appId}`);
      await putAppGuide(guide);
      console.log(`   ✅ ${guide.appName} guide created`);
    } catch (error) {
      console.error(`   ❌ Error seeding ${guide.appId}:`, error);
    }
  }

  console.log("\n✨ Guide seeding complete!");
  console.log(`   Total guides: ${guides.length}`);
}

// Run the seed function
seedGuides().catch(console.error);
