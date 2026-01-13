/**
 * MongoDB Guide Operations
 *
 * CRUD operations for app guides in MongoDB.
 */

import { ObjectId, Collection } from "mongodb";
import { getDb } from "./client";

// Collection accessors
let guidesCollection: Collection | null = null;

async function getGuidesCollection(): Promise<Collection> {
  if (!guidesCollection) {
    const db = await getDb();
    guidesCollection = db.collection("appGuides");
  }
  return guidesCollection;
}

// Types
export interface GuideSlide {
  order: number;
  icon: string;
  iconColor: string;
  title: string;
  content: string;
  highlight?: string;
}

export interface OnePagerSection {
  title: string;
  icon: string;
  iconColor: string;
  content: string;
  bulletPoints?: string[];
}

export interface AppOnePager {
  problemStatement: OnePagerSection;
  lyzrSolution: OnePagerSection;
  demoCoverage: OnePagerSection;
  frontendExperience: OnePagerSection;
  backendInfra: OnePagerSection;
  agenticInfra: OnePagerSection;
  futureEnhancements?: OnePagerSection;
}

export interface AppGuide {
  id: string;
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  ctaText?: string;
  enabled: boolean;
  updatedAt: string;
}

interface GuideDocument {
  _id?: ObjectId;
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  ctaText?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

function toAppGuide(doc: GuideDocument): AppGuide {
  return {
    id: doc._id?.toHexString() || "",
    appId: doc.appId,
    language: doc.language,
    appName: doc.appName,
    appTagline: doc.appTagline,
    slides: doc.slides,
    onePager: doc.onePager,
    ctaText: doc.ctaText,
    enabled: doc.enabled,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Get app guide by appId and language
 */
export async function getAppGuide(
  appId: string,
  language: string = "en"
): Promise<AppGuide | null> {
  const collection = await getGuidesCollection();
  const doc = await collection.findOne({ appId, language }) as GuideDocument | null;

  if (!doc) {
    return null;
  }

  return toAppGuide(doc);
}

/**
 * Get all guides for an app (all languages)
 */
export async function getAppGuides(appId: string): Promise<AppGuide[]> {
  const collection = await getGuidesCollection();
  const docs = await collection.find({ appId }).toArray() as GuideDocument[];

  return docs.map(toAppGuide);
}

/**
 * Create or update an app guide
 */
export async function putAppGuide(input: {
  appId: string;
  language: string;
  appName: string;
  appTagline: string;
  slides: GuideSlide[];
  onePager?: AppOnePager;
  ctaText?: string;
  enabled?: boolean;
}): Promise<AppGuide> {
  const collection = await getGuidesCollection();
  const now = new Date();

  // Upsert - separate createdAt from $set to avoid conflict with $setOnInsert
  const result = await collection.findOneAndUpdate(
    { appId: input.appId, language: input.language },
    {
      $set: {
        appId: input.appId,
        language: input.language,
        appName: input.appName,
        appTagline: input.appTagline,
        slides: input.slides.sort((a, b) => a.order - b.order),
        onePager: input.onePager,
        ctaText: input.ctaText,
        enabled: input.enabled ?? true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" }
  );

  return toAppGuide(result as GuideDocument);
}

/**
 * Delete an app guide
 */
export async function deleteAppGuide(
  appId: string,
  language: string
): Promise<boolean> {
  const collection = await getGuidesCollection();

  try {
    const result = await collection.deleteOne({ appId, language });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("[MongoDB] Error deleting app guide:", error);
    return false;
  }
}

/**
 * Check if an app guide exists
 */
export async function appGuideExists(
  appId: string,
  language: string = "en"
): Promise<boolean> {
  const guide = await getAppGuide(appId, language);
  return guide !== null;
}
