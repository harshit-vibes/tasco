/**
 * MongoDB Module Operations for E-Learning
 */

import { getCollection, toObjectId } from "../client";
import type {
  ModuleDocument,
  Module,
  CreateModuleInput,
  UpdateModuleInput,
  PaginatedResult,
} from "./types";

const COLLECTION = "modules";

/**
 * Convert MongoDB document to Module response
 */
function toResponse(doc: ModuleDocument): Module {
  return {
    id: doc._id?.toHexString() || "",
    courseId: doc.courseId,
    title: doc.title,
    description: doc.description,
    order: doc.order,
    lessonCount: doc.lessonCount,
    estimatedMinutes: doc.estimatedMinutes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Create a new module
 */
export async function createModule(input: CreateModuleInput): Promise<Module> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  const now = new Date();

  const doc: ModuleDocument = {
    courseId: input.courseId,
    title: input.title,
    description: input.description,
    order: input.order,
    lessonCount: 0,
    estimatedMinutes: input.estimatedMinutes || 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return toResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get a module by ID
 */
export async function getModule(moduleId: string): Promise<Module | null> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  const doc = await collection.findOne({ _id: toObjectId(moduleId) });
  return doc ? toResponse(doc) : null;
}

/**
 * List modules for a course (ordered by order number)
 */
export async function listModules(
  courseId: string,
  limit: number = 50
): Promise<PaginatedResult<Module>> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);

  const [docs, total] = await Promise.all([
    collection
      .find({ courseId })
      .sort({ order: 1 })
      .limit(limit)
      .toArray(),
    collection.countDocuments({ courseId }),
  ]);

  return {
    items: docs.map(toResponse),
    hasMore: docs.length < total,
    total,
  };
}

/**
 * Update a module
 */
export async function updateModule(
  moduleId: string,
  updates: UpdateModuleInput
): Promise<Module | null> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.title !== undefined) updateDoc.title = updates.title;
  if (updates.description !== undefined) updateDoc.description = updates.description;
  if (updates.order !== undefined) updateDoc.order = updates.order;
  if (updates.estimatedMinutes !== undefined) updateDoc.estimatedMinutes = updates.estimatedMinutes;

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(moduleId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? toResponse(result) : null;
}

/**
 * Delete a module
 */
export async function deleteModule(moduleId: string): Promise<boolean> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  const result = await collection.deleteOne({ _id: toObjectId(moduleId) });
  return result.deletedCount > 0;
}

/**
 * Increment lesson count for a module
 */
export async function incrementLessonCount(
  moduleId: string,
  increment: number = 1
): Promise<void> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  await collection.updateOne(
    { _id: toObjectId(moduleId) },
    {
      $inc: { lessonCount: increment },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Get modules count for a course
 */
export async function getModulesCount(courseId: string): Promise<number> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  return collection.countDocuments({ courseId });
}

/**
 * Bulk create modules (for seeding or AI generation)
 */
export async function bulkCreateModules(
  inputs: CreateModuleInput[]
): Promise<Module[]> {
  if (inputs.length === 0) return [];

  const collection = await getCollection<ModuleDocument>(COLLECTION);
  const now = new Date();

  const docs: ModuleDocument[] = inputs.map((input) => ({
    courseId: input.courseId,
    title: input.title,
    description: input.description,
    order: input.order,
    lessonCount: 0,
    estimatedMinutes: input.estimatedMinutes || 0,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs);

  return docs.map((doc, index) => toResponse({
    ...doc,
    _id: result.insertedIds[index],
  }));
}

/**
 * Delete all modules for a course
 */
export async function deleteModulesByCourse(courseId: string): Promise<number> {
  const collection = await getCollection<ModuleDocument>(COLLECTION);
  const result = await collection.deleteMany({ courseId });
  return result.deletedCount;
}
