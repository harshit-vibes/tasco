import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import { TABLES } from "./tables";

// Icon system - capability focused
export type GuideIcon =
  | "sparkles"      // AI/Magic
  | "message"       // Chat/Conversation
  | "database"      // Knowledge/Data
  | "file"          // Documents
  | "search"        // Search/Discovery
  | "shield"        // Compliance/Security
  | "chart"         // Analytics/Insights
  | "zap"           // Automation/Speed
  | "users"         // Multi-entity/Teams
  | "globe"         // Multi-language
  | "check"         // Validation/Quality
  | "brain"         // AI Intelligence
  | "target"        // Problem/Goal
  | "lightbulb"     // Solution
  | "layers"        // Infrastructure
  | "cpu"           // Backend
  | "layout"        // Frontend
  | "bot";          // Agent

export type GuideIconColor =
  | "primary"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "red"
  | "cyan"
  | "pink";

export interface GuideSlide {
  order: number;
  icon: GuideIcon;
  iconColor: GuideIconColor;
  title: string;
  content: string;            // Markdown content
  highlight?: string;         // Optional badge (e.g., "NEW", "AI-Powered")
}

// One-pager section for comprehensive app overview
export interface OnePagerSection {
  title: string;
  icon: GuideIcon;
  iconColor: GuideIconColor;
  content: string;            // Markdown content
  bulletPoints?: string[];    // Key highlights as bullet points
}

// Complete one-pager structure for app demos
export interface AppOnePager {
  // Problem & Solution
  problemStatement: OnePagerSection;
  lyzrSolution: OnePagerSection;

  // Demo Coverage
  demoCoverage: OnePagerSection;

  // Technical Architecture
  frontendExperience: OnePagerSection;
  backendInfra: OnePagerSection;
  agenticInfra: OnePagerSection;

  // Optional: Future roadmap
  futureEnhancements?: OnePagerSection;
}

export interface AppGuide {
  // Identity
  id: string;
  appId: string;
  language: string;

  // Branding
  appName: string;
  appTagline: string;

  // Carousel content (quick feature highlights)
  slides: GuideSlide[];

  // One-pager content (comprehensive overview)
  onePager?: AppOnePager;

  // Call to action
  ctaText?: string;

  // State
  enabled: boolean;
  updatedAt: string;
}

export interface CreateAppGuideInput {
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  ctaText?: string;
  enabled?: boolean;
}

/**
 * Get app guide by appId and language
 */
export async function getAppGuide(appId: string, language: string = "en"): Promise<AppGuide | null> {
  const command = new GetCommand({
    TableName: TABLES.APP_GUIDES,
    Key: {
      pk: `APP#${appId}`,
      sk: `LANG#${language}`,
    },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return null;
  }

  return {
    id: result.Item.id,
    appId: result.Item.appId,
    language: result.Item.language,
    appName: result.Item.appName,
    appTagline: result.Item.appTagline,
    slides: result.Item.slides || [],
    onePager: result.Item.onePager,
    ctaText: result.Item.ctaText,
    enabled: result.Item.enabled,
    updatedAt: result.Item.updatedAt,
  };
}

/**
 * Get all guides for an app (all languages)
 */
export async function getAppGuides(appId: string): Promise<AppGuide[]> {
  const command = new QueryCommand({
    TableName: TABLES.APP_GUIDES,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": `APP#${appId}`,
    },
  });

  const result = await docClient.send(command);

  return (result.Items || []).map((item) => ({
    id: item.id,
    appId: item.appId,
    language: item.language,
    appName: item.appName,
    appTagline: item.appTagline,
    slides: item.slides || [],
    onePager: item.onePager,
    ctaText: item.ctaText,
    enabled: item.enabled,
    updatedAt: item.updatedAt,
  }));
}

/**
 * Create or update an app guide
 */
export async function putAppGuide(input: CreateAppGuideInput): Promise<AppGuide> {
  const id = `guide-${input.appId}-${input.language}`;
  const now = new Date().toISOString();

  const guide: AppGuide = {
    id,
    appId: input.appId,
    language: input.language,
    appName: input.appName,
    appTagline: input.appTagline,
    slides: input.slides.sort((a, b) => a.order - b.order),
    onePager: input.onePager,
    ctaText: input.ctaText,
    enabled: input.enabled ?? true,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: TABLES.APP_GUIDES,
    Item: {
      pk: `APP#${input.appId}`,
      sk: `LANG#${input.language}`,
      ...guide,
    },
  });

  await docClient.send(command);
  return guide;
}

/**
 * Delete an app guide
 */
export async function deleteAppGuide(appId: string, language: string): Promise<boolean> {
  const command = new DeleteCommand({
    TableName: TABLES.APP_GUIDES,
    Key: {
      pk: `APP#${appId}`,
      sk: `LANG#${language}`,
    },
  });

  try {
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting app guide:", error);
    return false;
  }
}

/**
 * Check if an app guide exists
 */
export async function appGuideExists(appId: string, language: string = "en"): Promise<boolean> {
  const guide = await getAppGuide(appId, language);
  return guide !== null;
}
