import { NextRequest, NextResponse } from "next/server";
import {
  listCourses,
  deleteCourse,
  listModules,
} from "@tasco/db";

const APP_ID = "e-learning";
const ENTITY_ID = "e-learning";

/**
 * GET /api/courses/cleanup
 * Lists courses and identifies stale ones (courses without modules)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") !== "false"; // Default to dry run

    // Get all courses (both draft and published)
    const allCourses = await listCourses(APP_ID, ENTITY_ID, { limit: 100 });

    const staleCourses: Array<{ id: string; title: string; status: string; reason: string }> = [];
    const validCourses: Array<{ id: string; title: string; status: string; moduleCount: number }> = [];

    // Check each course for modules
    for (const course of allCourses.items) {
      const modulesResult = await listModules(course.id);
      const moduleCount = modulesResult.items?.length || 0;

      if (moduleCount === 0) {
        staleCourses.push({
          id: course.id,
          title: course.title,
          status: course.status,
          reason: "No modules found",
        });
      } else {
        validCourses.push({
          id: course.id,
          title: course.title,
          status: course.status,
          moduleCount,
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalCourses: allCourses.items.length,
        staleCourses: staleCourses.length,
        validCourses: validCourses.length,
      },
      staleCourses,
      validCourses,
    });
  } catch (error) {
    console.error("[Cleanup API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze courses" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/cleanup
 * Removes stale courses (courses without modules)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") !== "false"; // Default to dry run
    const courseIds = searchParams.get("courseIds")?.split(",").filter(Boolean);

    // Get all courses
    const allCourses = await listCourses(APP_ID, ENTITY_ID, { limit: 100 });

    const toDelete: Array<{ id: string; title: string; reason: string }> = [];
    const deleted: Array<{ id: string; title: string }> = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Identify courses to delete
    for (const course of allCourses.items) {
      // If specific courseIds provided, only process those
      if (courseIds && !courseIds.includes(course.id)) {
        continue;
      }

      const modulesResult = await listModules(course.id);
      const moduleCount = modulesResult.items?.length || 0;

      if (moduleCount === 0) {
        toDelete.push({
          id: course.id,
          title: course.title,
          reason: "No modules found",
        });
      }
    }

    // If not a dry run, actually delete the courses
    if (!dryRun) {
      for (const course of toDelete) {
        try {
          await deleteCourse(APP_ID, ENTITY_ID, course.id);
          deleted.push({ id: course.id, title: course.title });
          console.log(`[Cleanup API] Deleted stale course: ${course.id} (${course.title})`);
        } catch (err) {
          errors.push({
            id: course.id,
            error: err instanceof Error ? err.message : "Unknown error",
          });
          console.error(`[Cleanup API] Failed to delete course ${course.id}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        identified: toDelete.length,
        deleted: deleted.length,
        errors: errors.length,
      },
      toDelete: dryRun ? toDelete : undefined,
      deleted: !dryRun ? deleted : undefined,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Cleanup API] Error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup courses" },
      { status: 500 }
    );
  }
}
