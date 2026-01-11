"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorShell } from "../../components/create/shell";
import { DescribeScreen } from "../../components/create/screens/describe-screen";
import { DesignScreen } from "../../components/create/screens/design-screen";
import { PublishScreen } from "../../components/create/screens/publish-screen";
import { useCreator } from "../../lib/hooks/use-creator";
import { useCourses } from "../../lib/course-context";
import type { Course } from "../../lib/courses-data";

function CreateCourseContent() {
  const router = useRouter();
  const { addCourse } = useCourses();
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

  const {
    // State
    stage,
    designSubStage,
    currentModuleIndex,
    totalModules,
    requirement,
    polishedRequirement,
    document,
    outline,
    modules,
    isLoading,
    isPolishing,
    error,
    // Requirement updates
    updateRequirement,
    updateDocument,
    polishRequirement,
    // Navigation
    goToDescribe,
    // Outline actions
    generateOutline,
    reviseOutline,
    approveOutline,
    // Module actions
    reviseModule,
    approveModule,
    // Publish
    publishCourse,
    // Helpers
    canGoNext,
    canGoBack,
    actionMode,
    nextLabel,
  } = useCreator();

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (stage === "publish") {
      // Go back to last module
      // This would need more complex state management for full back navigation
      router.push("/courses");
    } else if (stage === "design") {
      if (designSubStage === "module" && currentModuleIndex > 0) {
        // Go to previous module - handled by prevModule in hook
      } else if (designSubStage === "module") {
        // Go back to outline - handled by hook
      } else {
        // Go back to describe
        goToDescribe();
      }
    }
  }, [stage, designSubStage, currentModuleIndex, goToDescribe, router]);

  // Handle next/submit action
  const handleNext = useCallback(async () => {
    if (stage === "describe") {
      await generateOutline();
    } else if (stage === "design") {
      if (designSubStage === "outline") {
        approveOutline();
      } else {
        approveModule();
      }
    }
  }, [stage, designSubStage, generateOutline, approveOutline, approveModule]);

  // Handle revise action
  const handleRevise = useCallback(() => {
    setShowRevisionDialog(true);
  }, []);

  // Handle revision submission
  const handleRevisionSubmit = useCallback(
    async (feedback: string) => {
      if (designSubStage === "outline") {
        await reviseOutline(feedback);
      } else {
        await reviseModule(feedback);
      }
      setShowRevisionDialog(false);
    },
    [designSubStage, reviseOutline, reviseModule]
  );

  // Handle publish
  const handlePublish = useCallback(async () => {
    try {
      const response = await fetch("/api/course/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline, modules }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish course");
      }

      const data = await response.json();

      // Add to course context
      if (data.course) {
        addCourse(data.course as Course);
      }

      // Navigate to courses page
      router.push("/courses");
    } catch (err) {
      console.error("Publish error:", err);
    }
  }, [outline, modules, addCourse, router]);

  // Handle stage click navigation
  const handleStageClick = useCallback(
    (clickedStage: "describe" | "design" | "publish") => {
      // Only allow clicking on completed stages
      if (clickedStage === "describe") {
        goToDescribe();
      }
      // Design and publish stages require progression
    },
    [goToDescribe]
  );

  // Render current screen
  const renderScreen = () => {
    switch (stage) {
      case "describe":
        return (
          <DescribeScreen
            requirement={requirement}
            polishedRequirement={polishedRequirement}
            document={document}
            isPolishing={isPolishing}
            onRequirementChange={updateRequirement}
            onDocumentChange={updateDocument}
            onPolish={polishRequirement}
          />
        );

      case "design":
        return (
          <DesignScreen
            subStage={designSubStage}
            currentModuleIndex={currentModuleIndex}
            outline={outline}
            modules={modules}
            isLoading={isLoading}
            showRevisionDialog={showRevisionDialog}
            onRevisionDialogChange={setShowRevisionDialog}
            onReviseOutline={handleRevisionSubmit}
            onReviseModule={handleRevisionSubmit}
          />
        );

      case "publish":
        if (!outline) return null;
        return (
          <PublishScreen
            outline={outline}
            modules={modules}
          />
        );

      default:
        return null;
    }
  };

  // Calculate design sub-step for header (0 = outline, 1-N = modules)
  const designSubStep =
    designSubStage === "outline" ? 0 : currentModuleIndex + 1;

  // Handle close
  const handleClose = useCallback(() => {
    router.push("/courses");
  }, [router]);

  return (
    <CreatorShell
      // Header
      currentStage={stage}
      designSubStep={designSubStep}
      totalModules={totalModules}
      onStageClick={handleStageClick}
      onClose={handleClose}
      // Footer
      actionMode={actionMode}
      onBack={handleBack}
      onNext={handleNext}
      onRevise={handleRevise}
      onApprove={handleNext}
      onPublish={handlePublish}
      canGoBack={canGoBack}
      canGoNext={canGoNext}
      isLoading={isLoading}
      nextLabel={nextLabel}
      // Error
      error={error}
    >
      {renderScreen()}
    </CreatorShell>
  );
}

// Page wrapper with centered card (bp-sdk pattern)
export default function CreateCoursePage() {
  return (
    <div className="min-h-dvh bg-muted/30 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-dvh sm:h-auto sm:min-h-[600px] sm:max-h-[90vh] sm:max-w-2xl bg-background sm:rounded-2xl sm:shadow-2xl sm:border flex flex-col overflow-hidden">
        <CreateCourseContent />
      </div>
    </div>
  );
}
