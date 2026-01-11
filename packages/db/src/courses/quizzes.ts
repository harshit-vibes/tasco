import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import {
  TABLES,
  buildQuizPK,
  buildQuizSK,
  buildQuestionPK,
  buildQuestionSK,
} from "../tables";
import type {
  Quiz,
  QuizItem,
  CreateQuizInput,
  UpdateQuizInput,
  QuizQuestion,
  QuizQuestionItem,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
  QuizWithQuestions,
  PaginatedResult,
} from "./types";

/**
 * Generate unique IDs
 */
const generateQuizId = (): string => {
  return `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generateQuestionId = (): string => {
  return `question_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB items to domain objects
 */
const itemToQuiz = (item: QuizItem): Quiz => ({
  id: item.id,
  moduleId: item.moduleId,
  title: item.title,
  description: item.description,
  passingScore: item.passingScore,
  questionCount: item.questionCount,
  timeLimit: item.timeLimit,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const itemToQuestion = (item: QuizQuestionItem): QuizQuestion => ({
  id: item.id,
  quizId: item.quizId,
  question: item.question,
  options: item.options,
  correctAnswer: item.correctAnswer,
  explanation: item.explanation,
  order: item.order,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// ============================================
// Quiz CRUD
// ============================================

/**
 * Create a new quiz for a module
 */
export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  const id = generateQuizId();
  const now = new Date().toISOString();

  const item: QuizItem = {
    pk: buildQuizPK(input.moduleId),
    sk: buildQuizSK(id),
    id,
    moduleId: input.moduleId,
    title: input.title,
    description: input.description,
    passingScore: input.passingScore || 70,
    questionCount: 0,
    timeLimit: input.timeLimit,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToQuiz(item);
}

/**
 * Get a quiz by ID
 */
export async function getQuiz(
  moduleId: string,
  quizId: string
): Promise<Quiz | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuizPK(moduleId),
        sk: buildQuizSK(quizId),
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return itemToQuiz(result.Item as QuizItem);
}

/**
 * Get quiz for a module (there's typically one quiz per module)
 */
export async function getQuizForModule(moduleId: string): Promise<Quiz | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :quizPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildQuizPK(moduleId),
        ":quizPrefix": "QUIZ#",
      },
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return itemToQuiz(result.Items[0] as QuizItem);
}

/**
 * Update a quiz
 */
export async function updateQuiz(
  moduleId: string,
  quizId: string,
  updates: UpdateQuizInput
): Promise<Quiz | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    updateExpressions.push("#title = :title");
    expressionAttributeNames["#title"] = "title";
    expressionAttributeValues[":title"] = updates.title;
  }

  if (updates.description !== undefined) {
    updateExpressions.push("#description = :description");
    expressionAttributeNames["#description"] = "description";
    expressionAttributeValues[":description"] = updates.description;
  }

  if (updates.passingScore !== undefined) {
    updateExpressions.push("#passingScore = :passingScore");
    expressionAttributeNames["#passingScore"] = "passingScore";
    expressionAttributeValues[":passingScore"] = updates.passingScore;
  }

  if (updates.timeLimit !== undefined) {
    updateExpressions.push("#timeLimit = :timeLimit");
    expressionAttributeNames["#timeLimit"] = "timeLimit";
    expressionAttributeValues[":timeLimit"] = updates.timeLimit;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuizPK(moduleId),
        sk: buildQuizSK(quizId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToQuiz(result.Attributes as QuizItem);
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(
  moduleId: string,
  quizId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuizPK(moduleId),
        sk: buildQuizSK(quizId),
      },
    })
  );
}

// ============================================
// Quiz Question CRUD
// ============================================

/**
 * Create a quiz question
 */
export async function createQuizQuestion(
  input: CreateQuizQuestionInput
): Promise<QuizQuestion> {
  const id = generateQuestionId();
  const now = new Date().toISOString();

  const item: QuizQuestionItem = {
    pk: buildQuestionPK(input.quizId),
    sk: buildQuestionSK(input.order, id),
    id,
    quizId: input.quizId,
    question: input.question,
    options: input.options,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    order: input.order,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.COURSES,
      Item: item,
    })
  );

  return itemToQuestion(item);
}

/**
 * Batch create quiz questions
 */
export async function batchCreateQuizQuestions(
  questions: CreateQuizQuestionInput[]
): Promise<QuizQuestion[]> {
  const now = new Date().toISOString();
  const createdQuestions: QuizQuestion[] = [];

  // DynamoDB BatchWrite limit is 25 items
  const chunks = [];
  for (let i = 0; i < questions.length; i += 25) {
    chunks.push(questions.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    const items: QuizQuestionItem[] = chunk.map((input) => {
      const id = generateQuestionId();
      return {
        pk: buildQuestionPK(input.quizId),
        sk: buildQuestionSK(input.order, id),
        id,
        quizId: input.quizId,
        question: input.question,
        options: input.options,
        correctAnswer: input.correctAnswer,
        explanation: input.explanation,
        order: input.order,
        createdAt: now,
        updatedAt: now,
      };
    });

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLES.COURSES]: items.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      })
    );

    createdQuestions.push(...items.map(itemToQuestion));
  }

  return createdQuestions;
}

/**
 * List questions for a quiz
 */
export async function listQuizQuestions(
  quizId: string,
  limit: number = 100
): Promise<PaginatedResult<QuizQuestion>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.COURSES,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :questionPrefix)",
      ExpressionAttributeValues: {
        ":pk": buildQuestionPK(quizId),
        ":questionPrefix": "QUESTION#",
      },
      ScanIndexForward: true, // Ascending order
      Limit: limit,
    })
  );

  const items = (result.Items || []) as QuizQuestionItem[];

  return {
    items: items.map(itemToQuestion),
    lastEvaluatedKey: result.LastEvaluatedKey,
    hasMore: !!result.LastEvaluatedKey,
  };
}

/**
 * Update a quiz question
 */
export async function updateQuizQuestion(
  quizId: string,
  order: number,
  questionId: string,
  updates: UpdateQuizQuestionInput
): Promise<QuizQuestion | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.question !== undefined) {
    updateExpressions.push("#question = :question");
    expressionAttributeNames["#question"] = "question";
    expressionAttributeValues[":question"] = updates.question;
  }

  if (updates.options !== undefined) {
    updateExpressions.push("#options = :options");
    expressionAttributeNames["#options"] = "options";
    expressionAttributeValues[":options"] = updates.options;
  }

  if (updates.correctAnswer !== undefined) {
    updateExpressions.push("#correctAnswer = :correctAnswer");
    expressionAttributeNames["#correctAnswer"] = "correctAnswer";
    expressionAttributeValues[":correctAnswer"] = updates.correctAnswer;
  }

  if (updates.explanation !== undefined) {
    updateExpressions.push("#explanation = :explanation");
    expressionAttributeNames["#explanation"] = "explanation";
    expressionAttributeValues[":explanation"] = updates.explanation;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuestionPK(quizId),
        sk: buildQuestionSK(order, questionId),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  if (!result.Attributes) {
    return null;
  }

  return itemToQuestion(result.Attributes as QuizQuestionItem);
}

/**
 * Delete a quiz question
 */
export async function deleteQuizQuestion(
  quizId: string,
  order: number,
  questionId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuestionPK(quizId),
        sk: buildQuestionSK(order, questionId),
      },
    })
  );
}

// ============================================
// Composite operations
// ============================================

/**
 * Get quiz with all its questions
 */
export async function getQuizWithQuestions(
  moduleId: string,
  quizId: string
): Promise<QuizWithQuestions | null> {
  const quiz = await getQuiz(moduleId, quizId);
  if (!quiz) return null;

  const { items: questions } = await listQuizQuestions(quizId);

  return {
    ...quiz,
    questions,
  };
}

/**
 * Increment question count for a quiz
 */
export async function incrementQuestionCount(
  moduleId: string,
  quizId: string,
  increment: number = 1
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: {
        pk: buildQuizPK(moduleId),
        sk: buildQuizSK(quizId),
      },
      UpdateExpression:
        "SET #questionCount = if_not_exists(#questionCount, :zero) + :inc, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#questionCount": "questionCount",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":inc": increment,
        ":zero": 0,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}
