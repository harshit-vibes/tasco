/**
 * Customer Lifecycle App Configuration
 *
 * Centralized configuration for the customer lifecycle management app
 */

// ============================================
// App Metadata
// ============================================

export const APP_CONFIG = {
  name: "Customer Lifecycle",
  company: "Tasco Auto",
  version: "1.0.0",
  description: "AI-powered customer lifecycle management for Tasco Auto",
  tagline: "Innovation Day Demo",
} as const;

// ============================================
// Page Metadata
// ============================================

export const PAGE_TITLES = {
  dashboard: "Customer Lifecycle Dashboard",
  leads: "Leads Management",
  customers: "Customer 360",
  marketing: "Marketing Campaigns",
  analytics: "Analytics & Insights",
  chat: "Customer Lifecycle AI Assistant",
  settings: "Settings",
} as const;

export const PAGE_DESCRIPTIONS = {
  dashboard: "Track leads, customers, and campaign performance in real-time",
  leads: "Manage and nurture your sales pipeline",
  customers: "Complete lifecycle tracking and customer insights",
  marketing: "Plan, execute, and analyze marketing campaigns",
  analytics: "Deep insights into customer behavior and trends",
  chat:
    "Ask me anything about leads, customers, marketing campaigns, and lifecycle management. I can analyze trends, recommend actions, and help you optimize your customer engagement strategy.",
  settings: "Configure your preferences and integrations",
} as const;

// ============================================
// Filter Options
// ============================================

export const FILTER_OPTIONS = {
  priority: {
    all: { value: "all", label: "All Priorities" },
    hot: { value: "hot", label: "Hot" },
    warm: { value: "warm", label: "Warm" },
    cold: { value: "cold", label: "Cold" },
  },
  leadStatus: {
    all: { value: "all", label: "All Statuses" },
    new: { value: "new", label: "New" },
    contacted: { value: "contacted", label: "Contacted" },
    qualified: { value: "qualified", label: "Qualified" },
    nurturing: { value: "nurturing", label: "Nurturing" },
    converted: { value: "converted", label: "Converted" },
    lost: { value: "lost", label: "Lost" },
  },
  leadSource: {
    all: { value: "all", label: "All Sources" },
    website: { value: "website", label: "Website" },
    referral: { value: "referral", label: "Referral" },
    walkIn: { value: "walk-in", label: "Walk-in" },
    event: { value: "event", label: "Event" },
    social: { value: "social", label: "Social Media" },
    other: { value: "other", label: "Other" },
  },
  customerSegment: {
    all: { value: "all", label: "All Segments" },
    vip: { value: "vip", label: "VIP" },
    regular: { value: "regular", label: "Regular" },
    atRisk: { value: "at-risk", label: "At Risk" },
    new: { value: "new", label: "New" },
  },
  customerStage: {
    all: { value: "all", label: "All Stages" },
    prospect: { value: "prospect", label: "Prospect" },
    active: { value: "active", label: "Active" },
    loyal: { value: "loyal", label: "Loyal" },
    atRisk: { value: "at-risk", label: "At Risk" },
    churned: { value: "churned", label: "Churned" },
  },
} as const;

// ============================================
// Sort Options
// ============================================

export const SORT_OPTIONS = {
  leads: {
    score: { value: "score", label: "Score" },
    createdAt: { value: "createdAt", label: "Date Created" },
    name: { value: "name", label: "Name" },
    lastContactedAt: { value: "lastContactedAt", label: "Last Contacted" },
  },
  customers: {
    lifetimeValue: { value: "lifetimeValue", label: "Lifetime Value" },
    lastActivityAt: { value: "lastActivityAt", label: "Last Activity" },
    createdAt: { value: "createdAt", label: "Date Joined" },
    name: { value: "name", label: "Name" },
  },
} as const;

// ============================================
// Pagination
// ============================================

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// ============================================
// Search
// ============================================

export const SEARCH_CONFIG = {
  debounceMs: 300,
  minQueryLength: 2,
  placeholders: {
    leads: "Search by name, email, or phone...",
    customers: "Search by name, email, or phone...",
    campaigns: "Search campaigns...",
    general: "Search...",
  },
} as const;

// ============================================
// Entity Selector
// ============================================

export const ENTITY_CONFIG = {
  placeholder: "Select showroom...",
  placeholderMulti: "Select showrooms...",
  mode: {
    single: "single",
    multi: "multi",
  },
} as const;

// ============================================
// Dashboard
// ============================================

export const DASHBOARD_CONFIG = {
  recentLeadsCount: 5,
  atRiskCustomersCount: 3,
  recommendationsCount: 4,
  refreshInterval: 60000, // 1 minute
} as const;

// ============================================
// Color Schemes
// ============================================

export const PRIORITY_COLORS = {
  hot: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-900",
  },
  warm: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-900",
  },
  cold: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900",
  },
} as const;

export const STATUS_COLORS = {
  new: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  contacted: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  qualified: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  nurturing: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  converted: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  lost: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-400",
  },
} as const;

export const SEGMENT_COLORS = {
  vip: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  regular: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  "at-risk": {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
  },
  new: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
} as const;

// ============================================
// Date Formats
// ============================================

export const DATE_FORMATS = {
  full: "PPP", // January 1, 2024
  short: "PP", // Jan 1, 2024
  time: "p", // 5:30 PM
  datetime: "PPp", // Jan 1, 2024, 5:30 PM
  relative: true, // Use relative time (e.g., "2 hours ago")
} as const;

// ============================================
// Validation Rules
// ============================================

export const VALIDATION = {
  lead: {
    scoreMin: 0,
    scoreMax: 100,
    nameMinLength: 2,
    nameMaxLength: 100,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^[0-9\s\-\+\(\)]+$/,
  },
  customer: {
    churnRiskMin: 0,
    churnRiskMax: 1,
    satisfactionScoreMin: 0,
    satisfactionScoreMax: 100,
  },
  campaign: {
    nameMinLength: 3,
    nameMaxLength: 100,
    budgetMin: 0,
  },
} as const;

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
  enableChat: true,
  enableAnalytics: true,
  enableNotifications: true,
  enableExport: true,
  enableBulkActions: true,
  enableAIRecommendations: true,
} as const;

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;
