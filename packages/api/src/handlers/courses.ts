import { NextRequest, NextResponse } from "next/server";
import {
  // Course operations
  createCourse,
  getCourse,
  listCourses,
  updateCourse,
  deleteCourse,
  publishCourse,
  // Module operations
  createModule,
  listModules,
  // Lesson operations
  createLesson,
  listLessons,
  // Quiz operations
  createQuiz,
  getQuizForModule,
  createQuizQuestion,
  batchCreateQuizQuestions,
  listQuizQuestions,
  getQuizWithQuestions,
  // Progress operations
  enrollInCourse,
  getCourseProgress,
  listUserCourseProgress,
  updateCourseProgress,
  startModule,
  getModuleProgress,
  updateModuleProgress,
  updateLessonProgress,
  recordQuizAttempt,
  listQuizAttempts,
  getBestQuizAttempt,
  // Types
  type CreateCourseInput,
  type CreateModuleInput,
  type CreateLessonInput,
  type CreateQuizInput,
  type CreateQuizQuestionInput,
} from "@tasco/db";

// ============================================
// Course Handlers
// ============================================

/**
 * GET /api/courses - List all courses for an app/entity
 */
export async function handleListCourses(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!appId || !entityId) {
      return NextResponse.json(
        { success: false, error: "appId and entityId are required" },
        { status: 400 }
      );
    }

    const result = await listCourses(appId, entityId, { limit, status });
    return NextResponse.json({
      success: true,
      courses: result.items,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error listing courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list courses" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/[id] - Get a single course
 */
export async function handleGetCourse(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const courseId = searchParams.get("courseId");

    if (!appId || !entityId || !courseId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and courseId are required" },
        { status: 400 }
      );
    }

    const course = await getCourse(appId, entityId, courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Error getting course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get course" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses - Create a new course
 */
export async function handleCreateCourse(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, entityId, title, description, category, difficulty, estimatedMinutes, isAIGenerated, createdBy } = body;

    if (!appId || !entityId || !title || !description || !category || !difficulty || !createdBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const input: CreateCourseInput = {
      appId,
      entityId,
      title,
      description,
      category,
      difficulty,
      estimatedMinutes,
      isAIGenerated: isAIGenerated || false,
      createdBy,
    };

    const course = await createCourse(input);
    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/courses - Update a course
 */
export async function handleUpdateCourse(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, entityId, courseId, ...updates } = body;

    if (!appId || !entityId || !courseId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and courseId are required" },
        { status: 400 }
      );
    }

    const course = await updateCourse(appId, entityId, courseId, updates);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses - Delete a course
 */
export async function handleDeleteCourse(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const courseId = searchParams.get("courseId");

    if (!appId || !entityId || !courseId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and courseId are required" },
        { status: 400 }
      );
    }

    await deleteCourse(appId, entityId, courseId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/publish - Publish a course
 */
export async function handlePublishCourse(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, entityId, courseId } = body;

    if (!appId || !entityId || !courseId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and courseId are required" },
        { status: 400 }
      );
    }

    const course = await publishCourse(appId, entityId, courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Error publishing course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish course" },
      { status: 500 }
    );
  }
}

// ============================================
// Full Course Structure Handler
// ============================================

/**
 * GET /api/courses/full - Get full course with modules, lessons, quizzes
 */
export async function handleGetFullCourse(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const entityId = searchParams.get("entityId");
    const courseId = searchParams.get("courseId");

    if (!appId || !entityId || !courseId) {
      return NextResponse.json(
        { success: false, error: "appId, entityId, and courseId are required" },
        { status: 400 }
      );
    }

    // Get course
    const course = await getCourse(appId, entityId, courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Get modules
    const { items: modules } = await listModules(courseId);

    // Get lessons and quizzes for each module
    const modulesWithContent = await Promise.all(
      modules.map(async (module) => {
        const { items: lessons } = await listLessons(module.id);
        const quiz = await getQuizForModule(module.id);

        let quizWithQuestions = null;
        if (quiz) {
          const { items: questions } = await listQuizQuestions(quiz.id);
          quizWithQuestions = { ...quiz, questions };
        }

        return {
          ...module,
          lessons,
          quiz: quizWithQuestions,
        };
      })
    );

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithContent,
      },
    });
  } catch (error) {
    console.error("Error getting full course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get course" },
      { status: 500 }
    );
  }
}

// ============================================
// Module Handlers
// ============================================

/**
 * GET /api/courses/modules - List modules for a course
 */
export async function handleListModules(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    const result = await listModules(courseId);
    return NextResponse.json({
      success: true,
      modules: result.items,
    });
  } catch (error) {
    console.error("Error listing modules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list modules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/modules - Create a module
 */
export async function handleCreateModule(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, title, description, order, estimatedMinutes } = body;

    if (!courseId || !title || !description || order === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const module = await createModule({
      courseId,
      title,
      description,
      order,
      estimatedMinutes,
    });

    return NextResponse.json({ success: true, module }, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    );
  }
}

// ============================================
// Lesson Handlers
// ============================================

/**
 * GET /api/courses/lessons - List lessons for a module
 */
export async function handleListLessons(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      );
    }

    const result = await listLessons(moduleId);
    return NextResponse.json({
      success: true,
      lessons: result.items,
    });
  } catch (error) {
    console.error("Error listing lessons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list lessons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/lessons - Create a lesson
 */
export async function handleCreateLesson(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, title, content, order, estimatedMinutes } = body;

    if (!moduleId || !title || !content || order === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const lesson = await createLesson({
      moduleId,
      title,
      content,
      order,
      estimatedMinutes,
    });

    return NextResponse.json({ success: true, lesson }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

// ============================================
// Quiz Handlers
// ============================================

/**
 * GET /api/courses/quiz - Get quiz for a module
 */
export async function handleGetQuiz(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const includeQuestions = searchParams.get("includeQuestions") === "true";

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      );
    }

    const quiz = await getQuizForModule(moduleId);
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (includeQuestions) {
      const { items: questions } = await listQuizQuestions(quiz.id);
      return NextResponse.json({
        success: true,
        quiz: { ...quiz, questions },
      });
    }

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error("Error getting quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get quiz" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/quiz - Create a quiz with questions
 */
export async function handleCreateQuiz(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, title, description, passingScore, timeLimit, questions } = body;

    if (!moduleId || !title) {
      return NextResponse.json(
        { success: false, error: "moduleId and title are required" },
        { status: 400 }
      );
    }

    // Create quiz
    const quiz = await createQuiz({
      moduleId,
      title,
      description,
      passingScore,
      timeLimit,
    });

    // Create questions if provided
    let createdQuestions: Awaited<ReturnType<typeof batchCreateQuizQuestions>> = [];
    if (questions && questions.length > 0) {
      const questionInputs: CreateQuizQuestionInput[] = questions.map(
        (q: { question: string; options: string[]; correctAnswer: number; explanation?: string }, index: number) => ({
          quizId: quiz.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: index + 1,
        })
      );

      createdQuestions = await batchCreateQuizQuestions(questionInputs);
    }

    return NextResponse.json(
      {
        success: true,
        quiz: { ...quiz, questions: createdQuestions },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

// ============================================
// Progress Handlers
// ============================================

/**
 * GET /api/courses/progress - Get user's course progress
 */
export async function handleGetProgress(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (courseId) {
      // Get progress for specific course
      const progress = await getCourseProgress(userId, courseId);
      return NextResponse.json({ success: true, progress });
    } else {
      // Get all course progress for user
      const result = await listUserCourseProgress(userId);
      return NextResponse.json({
        success: true,
        progress: result.items,
      });
    }
  } catch (error) {
    console.error("Error getting progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get progress" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/progress/enroll - Enroll in a course
 */
export async function handleEnrollCourse(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, appId, entityId, totalModules } = body;

    if (!userId || !courseId || !appId || !entityId || totalModules === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await getCourseProgress(userId, courseId);
    if (existing) {
      return NextResponse.json({
        success: true,
        progress: existing,
        message: "Already enrolled",
      });
    }

    const progress = await enrollInCourse(
      { userId, courseId, appId, entityId },
      totalModules
    );

    return NextResponse.json({ success: true, progress }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/progress/lesson - Update lesson progress
 */
export async function handleUpdateLessonProgress(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId, lessonId, completed, timeSpent } = body;

    if (!userId || !moduleId || !lessonId) {
      return NextResponse.json(
        { success: false, error: "userId, moduleId, and lessonId are required" },
        { status: 400 }
      );
    }

    const progress = await updateLessonProgress(userId, moduleId, lessonId, {
      completed,
      timeSpent,
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/progress/quiz - Submit quiz attempt
 */
export async function handleSubmitQuizAttempt(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, quizId, moduleId, courseId, answers, timeSpent, passingScore } = body;

    if (!userId || !quizId || !moduleId || !courseId || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attempt = await recordQuizAttempt(
      {
        userId,
        quizId,
        moduleId,
        courseId,
        answers,
        timeSpent: timeSpent || 0,
      },
      passingScore || 70
    );

    // If passed, update module progress
    if (attempt.passed) {
      await updateModuleProgress(userId, moduleId, {
        quizPassed: true,
        quizScore: attempt.score,
      });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/progress/quiz - Get quiz attempts
 */
export async function handleGetQuizAttempts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const quizId = searchParams.get("quizId");
    const best = searchParams.get("best") === "true";

    if (!userId || !quizId) {
      return NextResponse.json(
        { success: false, error: "userId and quizId are required" },
        { status: 400 }
      );
    }

    if (best) {
      const attempt = await getBestQuizAttempt(userId, quizId);
      return NextResponse.json({ success: true, attempt });
    }

    const result = await listQuizAttempts(userId, quizId);
    return NextResponse.json({
      success: true,
      attempts: result.items,
    });
  } catch (error) {
    console.error("Error getting quiz attempts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get quiz attempts" },
      { status: 500 }
    );
  }
}
