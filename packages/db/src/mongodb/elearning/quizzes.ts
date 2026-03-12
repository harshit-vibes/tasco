/**
 * MongoDB Quiz Operations for E-Learning
 */

import { getCollection, toObjectId } from "../client";
import type {
  QuizDocument,
  Quiz,
  CreateQuizInput,
  UpdateQuizInput,
  QuizQuestionDocument,
  QuizQuestion,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
  QuizWithQuestions,
  PaginatedResult,
} from "./types";

const QUIZ_COLLECTION = "quizzes";
const QUESTION_COLLECTION = "quizQuestions";

// ============================================
// Quiz Response Converters
// ============================================

function quizToResponse(doc: QuizDocument): Quiz {
  return {
    id: doc._id?.toHexString() || "",
    moduleId: doc.moduleId,
    title: doc.title,
    description: doc.description,
    passingScore: doc.passingScore,
    questionCount: doc.questionCount,
    timeLimit: doc.timeLimit,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function questionToResponse(doc: QuizQuestionDocument): QuizQuestion {
  return {
    id: doc._id?.toHexString() || "",
    quizId: doc.quizId,
    question: doc.question,
    options: doc.options,
    correctAnswer: doc.correctAnswer,
    explanation: doc.explanation,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ============================================
// Quiz Operations
// ============================================

/**
 * Create a new quiz
 */
export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);
  const now = new Date();

  const doc: QuizDocument = {
    moduleId: input.moduleId,
    title: input.title,
    description: input.description,
    passingScore: input.passingScore || 70,
    questionCount: 0,
    timeLimit: input.timeLimit,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return quizToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Get a quiz by ID
 */
export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);
  const doc = await collection.findOne({ _id: toObjectId(quizId) });
  return doc ? quizToResponse(doc) : null;
}

/**
 * Get quiz for a module (each module has one quiz)
 */
export async function getQuizForModule(moduleId: string): Promise<Quiz | null> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);
  const doc = await collection.findOne({ moduleId });
  return doc ? quizToResponse(doc) : null;
}

/**
 * Get quiz with questions
 */
export async function getQuizWithQuestions(
  quizId: string
): Promise<QuizWithQuestions | null> {
  const quiz = await getQuiz(quizId);
  if (!quiz) return null;

  const { items: questions } = await listQuizQuestions(quizId);
  return { ...quiz, questions };
}

/**
 * Update a quiz
 */
export async function updateQuiz(
  quizId: string,
  updates: UpdateQuizInput
): Promise<Quiz | null> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.title !== undefined) updateDoc.title = updates.title;
  if (updates.description !== undefined) updateDoc.description = updates.description;
  if (updates.passingScore !== undefined) updateDoc.passingScore = updates.passingScore;
  if (updates.timeLimit !== undefined) updateDoc.timeLimit = updates.timeLimit;

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(quizId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? quizToResponse(result) : null;
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(quizId: string): Promise<boolean> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);
  const result = await collection.deleteOne({ _id: toObjectId(quizId) });
  return result.deletedCount > 0;
}

/**
 * Increment question count for a quiz
 */
export async function incrementQuestionCount(
  quizId: string,
  increment: number = 1
): Promise<void> {
  const collection = await getCollection<QuizDocument>(QUIZ_COLLECTION);
  await collection.updateOne(
    { _id: toObjectId(quizId) },
    {
      $inc: { questionCount: increment },
      $set: { updatedAt: new Date() },
    }
  );
}

// ============================================
// Quiz Question Operations
// ============================================

/**
 * Create a quiz question
 */
export async function createQuizQuestion(
  input: CreateQuizQuestionInput
): Promise<QuizQuestion> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);
  const now = new Date();

  const doc: QuizQuestionDocument = {
    quizId: input.quizId,
    question: input.question,
    options: input.options,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    order: input.order,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);

  // Increment quiz question count
  await incrementQuestionCount(input.quizId, 1);

  return questionToResponse({ ...doc, _id: result.insertedId });
}

/**
 * Batch create quiz questions
 */
export async function batchCreateQuizQuestions(
  inputs: CreateQuizQuestionInput[]
): Promise<QuizQuestion[]> {
  if (inputs.length === 0) return [];

  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);
  const now = new Date();

  const docs: QuizQuestionDocument[] = inputs.map((input) => ({
    quizId: input.quizId,
    question: input.question,
    options: input.options,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    order: input.order,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs);

  // Increment quiz question count (assuming all questions are for the same quiz)
  if (inputs.length > 0) {
    await incrementQuestionCount(inputs[0].quizId, inputs.length);
  }

  return docs.map((doc, index) => questionToResponse({
    ...doc,
    _id: result.insertedIds[index],
  }));
}

/**
 * Get a quiz question by ID
 */
export async function getQuizQuestion(
  questionId: string
): Promise<QuizQuestion | null> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);
  const doc = await collection.findOne({ _id: toObjectId(questionId) });
  return doc ? questionToResponse(doc) : null;
}

/**
 * List quiz questions (ordered by order number)
 */
export async function listQuizQuestions(
  quizId: string,
  limit: number = 100
): Promise<PaginatedResult<QuizQuestion>> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);

  const [docs, total] = await Promise.all([
    collection
      .find({ quizId })
      .sort({ order: 1 })
      .limit(limit)
      .toArray(),
    collection.countDocuments({ quizId }),
  ]);

  return {
    items: docs.map(questionToResponse),
    hasMore: docs.length < total,
    total,
  };
}

/**
 * Update a quiz question
 */
export async function updateQuizQuestion(
  questionId: string,
  updates: UpdateQuizQuestionInput
): Promise<QuizQuestion | null> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);

  const updateDoc: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.question !== undefined) updateDoc.question = updates.question;
  if (updates.options !== undefined) updateDoc.options = updates.options;
  if (updates.correctAnswer !== undefined) updateDoc.correctAnswer = updates.correctAnswer;
  if (updates.explanation !== undefined) updateDoc.explanation = updates.explanation;
  if (updates.order !== undefined) updateDoc.order = updates.order;

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(questionId) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );

  return result ? questionToResponse(result) : null;
}

/**
 * Delete a quiz question
 */
export async function deleteQuizQuestion(questionId: string): Promise<boolean> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);

  // Get the question first to know which quiz to update
  const question = await collection.findOne({ _id: toObjectId(questionId) });
  if (!question) return false;

  const result = await collection.deleteOne({ _id: toObjectId(questionId) });

  if (result.deletedCount > 0) {
    // Decrement quiz question count
    await incrementQuestionCount(question.quizId, -1);
    return true;
  }

  return false;
}

/**
 * Delete all questions for a quiz
 */
export async function deleteQuestionsByQuiz(quizId: string): Promise<number> {
  const collection = await getCollection<QuizQuestionDocument>(QUESTION_COLLECTION);
  const result = await collection.deleteMany({ quizId });
  return result.deletedCount;
}

/**
 * Delete quiz and all its questions
 */
export async function deleteQuizWithQuestions(quizId: string): Promise<boolean> {
  await deleteQuestionsByQuiz(quizId);
  return deleteQuiz(quizId);
}
