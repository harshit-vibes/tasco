# E-Learning App: Mock Data to Database Migration Plan

## Executive Summary

This document outlines the plan to migrate hardcoded/mocked data in the e-learning frontend to database-driven data. The audit identified **6 areas** requiring attention, with **3 high priority** items that affect user experience.

---

## Current State Analysis

| # | Data Type | Location | Priority | Effort | API Status |
|---|-----------|----------|----------|--------|------------|
| 1 | Course Progress Bar | `app/courses/page.tsx:333` | **HIGH** | Low | API exists, needs connection |
| 2 | Categories | `lib/courses-data.ts:2-11` | **HIGH** | Medium | No API, needs creation |
| 3 | Demo User ID | `lib/progress-context.tsx:15-27` | **MEDIUM** | Medium | Works, needs auth integration |
| 4 | Difficulty Config | `app/courses/page.tsx:32-48` | LOW | Low | Keep as config |
| 5 | Example Prompts | `locales/*/elearning.json` | LOW | Low | Keep as i18n |
| 6 | Seed Data | `scripts/seed-courses.ts` | LOW | N/A | Already uses API |

---

## Migration Tasks

### Phase 1: Quick Wins (1-2 hours)

#### 1.1 Connect Progress Bar to Real Data

**Current State:**
```tsx
// app/courses/page.tsx:333
<div className="progress-bar-fill" style={{ width: "0%" }} />
```

**Target State:**
```tsx
const { courseProgress } = useProgress();
const progress = courseProgress[course.id]?.overallProgress || 0;
<div className="progress-bar-fill" style={{ width: `${progress}%` }} />
```

**Files to Modify:**
- `app/courses/page.tsx` - Add useProgress hook, pass progress to CourseCard

**Acceptance Criteria:**
- [ ] Course cards show actual completion percentage
- [ ] Progress updates reflect after completing lessons
- [ ] Zero progress shown for unenrolled courses

---

### Phase 2: Categories API (2-3 hours)

#### 2.1 Create Categories Table Schema

**New DynamoDB Table:** `tasco-categories`

| Attribute | Type | Description |
|-----------|------|-------------|
| `pk` | String | `CATEGORY#e-learning` |
| `sk` | String | `CAT#{categoryId}` |
| `id` | String | Category ID (e.g., "motor-insurance") |
| `label` | String | Display label (e.g., "Motor Insurance") |
| `icon` | String | Optional icon name |
| `order` | Number | Sort order |
| `appId` | String | App identifier |

#### 2.2 Create API Endpoints

**File:** `packages/api/src/handlers/categories.ts`

```typescript
// GET /api/categories
export async function handleGetCategories(req: Request) {
  const { appId } = getQueryParams(req);
  const categories = await getCategories(appId);
  return Response.json({ success: true, categories });
}

// POST /api/categories (admin only)
export async function handleCreateCategory(req: Request) {
  const body = await req.json();
  const category = await createCategory(body);
  return Response.json({ success: true, category });
}
```

**File:** `apps/e-learning/app/api/categories/route.ts`

```typescript
import { handleGetCategories, handleCreateCategory } from "@tasco/api";

export const GET = handleGetCategories;
export const POST = handleCreateCategory;
```

#### 2.3 Create Database Functions

**File:** `packages/db/src/functions/categories.ts`

```typescript
export async function getCategories(appId: string): Promise<Category[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: "tasco-categories",
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": `CATEGORY#${appId}` },
  }));
  return result.Items?.sort((a, b) => a.order - b.order) || [];
}

export async function createCategory(category: CategoryInput): Promise<Category> {
  const item = {
    pk: `CATEGORY#${category.appId}`,
    sk: `CAT#${category.id}`,
    ...category,
    createdAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: "tasco-categories", Item: item }));
  return item;
}
```

#### 2.4 Create Categories Context

**File:** `apps/e-learning/lib/categories-context.tsx`

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Category {
  id: string;
  label: string;
  icon?: string;
  order: number;
}

interface CategoriesContextValue {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories?appId=e-learning");
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategories must be used within CategoriesProvider");
  return context;
}
```

#### 2.5 Seed Script for Categories

**File:** `apps/e-learning/scripts/seed-categories.ts`

```typescript
const categories = [
  { id: "motor-insurance", label: "Motor Insurance", order: 1 },
  { id: "health-insurance", label: "Health Insurance", order: 2 },
  { id: "claims-processing", label: "Claims Processing", order: 3 },
  { id: "underwriting", label: "Underwriting", order: 4 },
  { id: "compliance", label: "Compliance", order: 5 },
  { id: "customer-service", label: "Customer Service", order: 6 },
  { id: "sales", label: "Sales", order: 7 },
  { id: "general", label: "General", order: 8 },
];

async function seedCategories() {
  for (const cat of categories) {
    await fetch("http://localhost:3004/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, appId: "e-learning" }),
    });
  }
}
```

#### 2.6 Update Frontend Components

**Files to Modify:**
- `app/courses/page.tsx` - Replace static import with `useCategories()`
- `components/app-shell.tsx` - Wrap with `CategoriesProvider`
- Remove `lib/courses-data.ts` after migration

---

### Phase 3: Authentication Integration (4-6 hours)

#### 3.1 Replace Demo User with Real Auth

**Current State:**
```typescript
// lib/progress-context.tsx
function getUserId(): string {
  if (typeof window === "undefined") return "demo-user";
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random()...}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}
```

**Target State (with Auth):**
```typescript
import { useAuth } from "@tasco/auth"; // or your auth provider

function ProgressProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id || null;

  // Don't fetch progress until we have a real user
  useEffect(() => {
    if (userId) {
      fetchAllProgress();
    }
  }, [userId]);

  // ...
}
```

**Dependencies:**
- Auth provider setup (Clerk, Auth0, NextAuth, etc.)
- User table in database
- Session management

**Note:** This is optional for demo purposes. The current localStorage-based approach works for demos.

---

### Phase 4: Configuration Cleanup (1 hour)

#### 4.1 Move Difficulty Config to Shared Config

**Current Location:** `app/courses/page.tsx:32-48` (inline function)

**Target Location:** `lib/config/difficulty.ts`

```typescript
export const difficultyConfig = {
  beginner: {
    labelKey: "difficulty.beginner",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50",
  },
  intermediate: {
    labelKey: "difficulty.intermediate",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/50",
  },
  advanced: {
    labelKey: "difficulty.advanced",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/50",
  },
} as const;

export type DifficultyLevel = keyof typeof difficultyConfig;
```

**Rationale:** Keep as config, not database. These are UI styling decisions, not business data.

---

## Implementation Order

```
Week 1:
├── Day 1: Phase 1 - Connect Progress Bar (1-2 hrs)
├── Day 2-3: Phase 2 - Categories API (2-3 hrs)
│   ├── Create DynamoDB table
│   ├── Add API handlers
│   ├── Create context
│   └── Update components
└── Day 4: Phase 4 - Config Cleanup (1 hr)

Week 2 (Optional):
└── Phase 3: Auth Integration (4-6 hrs)
    └── Only if moving beyond demo mode
```

---

## Files Summary

### New Files to Create
```
packages/db/src/functions/categories.ts
packages/api/src/handlers/categories.ts
apps/e-learning/app/api/categories/route.ts
apps/e-learning/lib/categories-context.tsx
apps/e-learning/lib/config/difficulty.ts
apps/e-learning/scripts/seed-categories.ts
```

### Files to Modify
```
apps/e-learning/app/courses/page.tsx
apps/e-learning/components/app-shell.tsx
```

### Files to Delete (after migration)
```
apps/e-learning/lib/courses-data.ts
```

---

## Rollback Plan

Each phase is independent. If issues arise:
1. **Phase 1:** Revert to `width: "0%"`
2. **Phase 2:** Keep static `categories` array in `lib/courses-data.ts`
3. **Phase 3:** Keep localStorage-based user IDs
4. **Phase 4:** Keep inline config function

---

## Success Metrics

- [ ] All course cards display real progress percentages
- [ ] Categories load from database on page load
- [ ] No hardcoded data arrays in component files
- [ ] All static config moved to dedicated config files
- [ ] Seed scripts exist for initial data population
