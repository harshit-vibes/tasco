/**
 * MongoDB Course Operations for E-Learning
 */

import { getCollection, generateId, toObjectId } from "../client";
import type {
  CourseDocument,
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  PaginatedResult,
  CourseStatus,
} from "./types";

const COLLECTION = "courses";

/**
 * Convert MongoDB document to Course response
 */
function toResponse(doc: CourseDocument): Course {
  return {
    id: doc._id?.toHexString() || "",
    appId: doc.appId,
    entityId: doc.entityId,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    difficulty: doc.difficulty,
    status: doc.status,
    estimatedMinutes: doc.estimatedMinutes,
    moduleCount: doc.moduleCount,
    isAIGenerated: doc.isAIGenerated,
    coverImage: doc.coverImage,
    tags: doc.tags,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const now = new Date();

  const doc: CourseDocument = {
    appId: input.appId,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: input.difficulty,
    status: "draft",
    estimatedMinutes: input.estimatedMinutes || 0,
    moduleCount: 0,
    isAIGenerated: input.isAIGenerated || false,
    coverImage: input.coverImage,
    tags: input.tags,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return toResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get a course by ID
 */
export async function getCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const doc = await collection.findOne({
    _id: toObjectId(courseId),
    appId,
    entityId,
  });

  return doc ? toResponse(doc) : null;
}

/**
 * Get a course by ID only (without appId/entityId check)
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const doc = await collection.findOne({ _id: toObjectId(courseId) });
  return doc ? toResponse(doc) : null;
}

/**
 * List courses for an app/entity
 */
export async function listCourses(
  appId: string,
  entityId: string,
  options?: {
    limit?: number;
    status?: string;
    category?: string;
  }
): Promise<PaginatedResult<Course>> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const { limit = 50, status, category } = options || {};

  const filter: Record<string, unknown> = { appId, entityId };
  if (status) filter.status = status;
  if (category) filter.category = category;

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(toResponse),
    hasMore: docs.length < total,
    total,
  };
}

/**
 * List all courses (admin view)
 */
export async function listAllCourses(
  options?: {
    limit?: number;
    status?: string;
  }
): Promise<PaginatedResult<Course>> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const { limit = 100, status } = options || {};

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: docs.map(toResponse),
    hasMore: docs.length < total,
    total,
  };
}

/**
 * Update a course
 */
export async function updateCourse(
  appId: string,
  entityId: string,
  courseId: string,
  updates: UpdateCourseInput
): Promise<Course | null> {
  const collection = await getCollection<CourseDocument>(COLLECTION);

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.title !== undefined) updateDoc.title = updates.title;
  if (updates.description !== undefined) updateDoc.description = updates.description;
  if (updates.category !== undefined) updateDoc.category = updates.category;
  if (updates.difficulty !== undefined) updateDoc.difficulty = updates.difficulty;
  if (updates.status !== undefined) updateDoc.status = updates.status;
  if (updates.estimatedMinutes !== undefined) updateDoc.estimatedMinutes = updates.estimatedMinutes;
  if (updates.coverImage !== undefined) updateDoc.coverImage = updates.coverImage;
  if (updates.tags !== undefined) updateDoc.tags = updates.tags;

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(courseId), appId, entityId },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? toResponse(result) : null;
}

/**
 * Delete a course
 */
export async function deleteCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<boolean> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  const result = await collection.deleteOne({
    _id: toObjectId(courseId),
    appId,
    entityId,
  });
  return result.deletedCount > 0;
}

/**
 * Increment module count for a course
 */
export async function incrementModuleCount(
  courseId: string,
  increment: number = 1
): Promise<void> {
  const collection = await getCollection<CourseDocument>(COLLECTION);
  await collection.updateOne(
    { _id: toObjectId(courseId) },
    {
      $inc: { moduleCount: increment },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Publish a course
 */
export async function publishCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  return updateCourse(appId, entityId, courseId, { status: "published" });
}

/**
 * Archive a course
 */
export async function archiveCourse(
  appId: string,
  entityId: string,
  courseId: string
): Promise<Course | null> {
  return updateCourse(appId, entityId, courseId, { status: "archived" });
}

/**
 * Bulk create courses (for seeding)
 */
export async function bulkCreateCourses(
  inputs: CreateCourseInput[]
): Promise<Course[]> {
  if (inputs.length === 0) return [];

  const collection = await getCollection<CourseDocument>(COLLECTION);
  const now = new Date();

  const docs: CourseDocument[] = inputs.map((input) => ({
    appId: input.appId,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: input.difficulty,
    status: "draft" as CourseStatus,
    estimatedMinutes: input.estimatedMinutes || 0,
    moduleCount: 0,
    isAIGenerated: input.isAIGenerated || false,
    coverImage: input.coverImage,
    tags: input.tags,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs);

  return docs.map((doc, index) => toResponse({
    ...doc,
    _id: result.insertedIds[index],
  }));
}
