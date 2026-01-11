import { NextRequest, NextResponse } from "next/server";
import {
  createCourse,
  createModule,
  createLesson,
  createQuiz,
  batchCreateQuizQuestions,
  publishCourse,
  type CreateCourseInput,
  type CreateModuleInput,
  type CreateLessonInput,
  type CreateQuizInput,
  type CreateQuizQuestionInput,
} from "@tasco/db";
import type { CourseOutline, GeneratedModule } from "../../../../lib/types/creator";

// App and entity IDs for e-learning app
const APP_ID = "e-learning";
const ENTITY_ID = "e-learning";
const CREATED_BY = "ai-course-creator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outline, modules } = body as {
      outline: CourseOutline;
      modules: GeneratedModule[];
    };

    if (!outline || !modules || modules.length === 0) {
      return NextResponse.json(
        { error: "Missing outline or modules" },
        { status: 400 }
      );
    }

    // Validate modules match outline
    if (modules.length !== outline.modules.length) {
      return NextResponse.json(
        { error: "Module count mismatch" },
        { status: 400 }
      );
    }

    // Map level to difficulty format
    const difficultyMap: Record<string, "beginner" | "intermediate" | "advanced"> = {
      beginner: "beginner",
      intermediate: "intermediate",
      advanced: "advanced",
    };

    // 1. Create the course in DynamoDB
    const courseInput: CreateCourseInput = {
      appId: APP_ID,
      entityId: ENTITY_ID,
      title: outline.title,
      description: outline.description || `A comprehensive course on ${outline.title}`,
      category: "general",
      difficulty: difficultyMap[outline.level] || "beginner",
      estimatedMinutes: outline.estimatedMinutes,
      isAIGenerated: true,
      createdBy: CREATED_BY,
    };

    console.log("[Course Publish API] Creating course:", courseInput.title);
    const course = await createCourse(courseInput);

    // 2. Create modules, lessons, and quizzes
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const outlineModule = outline.modules[moduleIndex];
      const generatedModule = modules[moduleIndex];

      // Create module
      const moduleInput: CreateModuleInput = {
        courseId: course.id,
        title: outlineModule.title,
        description: `Module ${moduleIndex + 1} of ${outline.title}`,
        order: moduleIndex + 1,
        estimatedMinutes: Math.ceil(outline.estimatedMinutes / modules.length),
      };

      console.log(`[Course Publish API] Creating module ${moduleIndex + 1}:`, moduleInput.title);
      const dbModule = await createModule(moduleInput);

      // Create lessons for this module
      for (let lessonIndex = 0; lessonIndex < generatedModule.lessons.length; lessonIndex++) {
        const lesson = generatedModule.lessons[lessonIndex];
        const lessonInput: CreateLessonInput = {
          moduleId: dbModule.id,
          title: lesson.title,
          content: lesson.content,
          order: lessonIndex + 1,
          estimatedMinutes: 8 + Math.floor(Math.random() * 5), // 8-12 minutes
        };

        await createLesson(lessonInput);
      }

      // Create quiz for this module
      if (generatedModule.quiz && generatedModule.quiz.questions.length > 0) {
        const quizInput: CreateQuizInput = {
          moduleId: dbModule.id,
          title: `${outlineModule.title} Quiz`,
          description: `Test your knowledge of ${outlineModule.title}`,
          passingScore: 70,
        };

        const dbQuiz = await createQuiz(quizInput);

        // Create quiz questions
        const questionInputs: CreateQuizQuestionInput[] = generatedModule.quiz.questions.map(
          (q, qIndex) => ({
            quizId: dbQuiz.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: qIndex + 1,
          })
        );

        await batchCreateQuizQuestions(questionInputs);
      }
    }

    // 3. Publish the course (set status to published)
    console.log("[Course Publish API] Publishing course:", course.id);
    const publishedCourse = await publishCourse(APP_ID, ENTITY_ID, course.id);

    console.log("[Course Publish API] Course published successfully:", {
      id: course.id,
      title: course.title,
      moduleCount: modules.length,
    });

    // Return the course data
    return NextResponse.json({
      success: true,
      courseId: course.id,
      course: publishedCourse,
    });
  } catch (error) {
    console.error("[Course Publish API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
