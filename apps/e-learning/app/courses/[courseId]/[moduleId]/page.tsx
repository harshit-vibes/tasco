"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Module detail page - now redirects to unified course interface
 *
 * The course page at /courses/[courseId] now handles all module,
 * lesson, and quiz navigation through an integrated sidebar interface.
 * This redirect ensures old bookmarks and links continue working.
 */
export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  useEffect(() => {
    // Redirect to the unified course page
    // The course page handles module/lesson navigation internally
    router.replace(`/courses/${courseId}`);
  }, [courseId, router]);

  // Show minimal loading state during redirect
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Redirecting to course...</p>
      </div>
    </div>
  );
}
