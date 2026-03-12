/**
 * MongoDB Lesson Operations for E-Learning
 */

import { getCollection, toObjectId } from "../client";
import type {
  LessonDocument,
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  PaginatedResult,
} from "./types";

const COLLECTION = "lessons";

/**
 * Convert MongoDB document to Lesson response
 */
function toResponse(doc: LessonDocument): Lesson {
  return {
    id: doc._id?.toHexString() || "",
    moduleId: doc.moduleId,
    title: doc.title,
    content: doc.content,
    order: doc.order,
    estimatedMinutes: doc.estimatedMinutes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Create a new lesson
 */
export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const collection = await getCollection<LessonDocument>(COLLECTION);
  const now = new Date();

  const doc: LessonDocument = {
    moduleId: input.moduleId,
    title: input.title,
    content: input.content,
    order: input.order,
    estimatedMinutes: input.estimatedMinutes || 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return toResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get a lesson by ID
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const collection = await getCollection<LessonDocument>(COLLECTION);
  const doc = await collection.findOne({ _id: toObjectId(lessonId) });
  return doc ? toResponse(doc) : null;
}

/**
 * List lessons for a module (ordered by order number)
 */
export async function listLessons(
  moduleId: string,
  limit: number = 50
): Promise<PaginatedResult<Lesson>> {
  const collection = await getCollection<LessonDocument>(COLLECTION);

  const [docs, total] = await Promise.all([
    collection
      .find({ moduleId })
      .sort({ order: 1 })
      .limit(limit)
      .toArray(),
    collection.countDocuments({ moduleId }),
  ]);

  return {
    items: docs.map(toResponse),
    hasMore: docs.length < total,
    total,
  };
}

/**
 * Update a lesson
 */
export async function updateLesson(
  lessonId: string,
  updates: UpdateLessonInput
): Promise<Lesson | null> {
  const collection = await getCollection<LessonDocument>(COLLECTION);

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.title !== undefined) updateDoc.title = updates.title;
  if (updates.content !== undefined) updateDoc.content = updates.content;
  if (updates.order !== undefined) updateDoc.order = updates.order;
  if (updates.estimatedMinutes !== undefined) updateDoc.estimatedMinutes = updates.estimatedMinutes;

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(lessonId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? toResponse(result) : null;
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string): Promise<boolean> {
  const collection = await getCollection<LessonDocument>(COLLECTION);
  const result = await collection.deleteOne({ _id: toObjectId(lessonId) });
  return result.deletedCount > 0;
}

/**
 * Get lessons count for a module
 */
export async function getLessonsCount(moduleId: string): Promise<number> {
  const collection = await getCollection<LessonDocument>(COLLECTION);
  return collection.countDocuments({ moduleId });
}

/**
 * Bulk create lessons (for seeding or AI generation)
 */
export async function bulkCreateLessons(
  inputs: CreateLessonInput[]
): Promise<Lesson[]> {
  if (inputs.length === 0) return [];

  const collection = await getCollection<LessonDocument>(COLLECTION);
  const now = new Date();

  const docs: LessonDocument[] = inputs.map((input) => ({
    moduleId: input.moduleId,
    title: input.title,
    content: input.content,
    order: input.order,
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
 * Delete all lessons for a module
 */
export async function deleteLessonsByModule(moduleId: string): Promise<number> {
  const collection = await getCollection<LessonDocument>(COLLECTION);
  const result = await collection.deleteMany({ moduleId });
  return result.deletedCount;
}
