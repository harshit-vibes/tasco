"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type {
  CreatorStage,
  DesignSubStage,
  CourseOutline,
  GeneratedModule,
  UploadedDocument,
} from "../types/creator";

interface UseCreatorReturn {
  // Stage tracking
  stage: CreatorStage;
  designSubStage: DesignSubStage;
  currentModuleIndex: number;
  totalModules: number;

  // Data - new requirement-based flow
  requirement: string;
  polishedRequirement: string | null;
  document: UploadedDocument | null;
  outline: CourseOutline | null;
  modules: GeneratedModule[];

  // Session tracking (bp-sdk pattern)
  sessionId: string | null;

  // Loading states
  isLoading: boolean;
  isPolishing: boolean;
  error: string | null;

  // Requirement updates
  updateRequirement: (requirement: string) => void;
  updateDocument: (doc: UploadedDocument | null) => void;
  polishRequirement: () => Promise<void>;

  // Navigation
  goToDescribe: () => void;
  goToDesign: () => void;
  goToPublish: () => void;
  nextModule: () => void;
  prevModule: () => void;

  // Outline actions
  generateOutline: () => Promise<void>;
  reviseOutline: (feedback: string) => Promise<void>;
  approveOutline: () => void;

  // Module actions
  generateModule: (index: number) => Promise<void>;
  reviseModule: (feedback: string) => Promise<void>;
  approveModule: () => void;

  // Publish
  publishCourse: () => Promise<string>;

  // Helpers
  canGoNext: boolean;
  canGoBack: boolean;
  actionMode: "submit" | "approve" | "publish" | "loading";
  nextLabel: string;
}

export function useCreator(): UseCreatorReturn {
  // Stage tracking
  const [stage, setStage] = useState<CreatorStage>("describe");
  const [designSubStage, setDesignSubStage] = useState<DesignSubStage>("outline");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  // Data - new requirement-based flow
  const [requirement, setRequirement] = useState("");
  const [polishedRequirement, setPolishedRequirement] = useState<string | null>(null);
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [modules, setModules] = useState<GeneratedModule[]>([]);

  // Session tracking (bp-sdk pattern)
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to always have latest state (bp-sdk pattern - fixes React closure stale state)
  const outlineRef = useRef<CourseOutline | null>(null);
  const modulesRef = useRef<GeneratedModule[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    outlineRef.current = outline;
  }, [outline]);

  useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);

  // Total modules (from outline)
  const totalModules = outline?.modules.length || 0;

  // Requirement updates
  const updateRequirement = useCallback((newRequirement: string) => {
    setRequirement(newRequirement);
    // Clear polished requirement when user edits
    if (polishedRequirement) {
      setPolishedRequirement(null);
    }
  }, [polishedRequirement]);

  // Document updates
  const updateDocument = useCallback((doc: UploadedDocument | null) => {
    setDocument(doc);
  }, []);

  // Polish requirement with AI
  const polishRequirement = useCallback(async () => {
    if (!requirement.trim()) return;

    setIsPolishing(true);
    setError(null);
    try {
      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "polish",
          data: { requirement },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to polish requirement");
      }

      const data = await response.json();
      setPolishedRequirement(data.polished);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsPolishing(false);
    }
  }, [requirement]);

  // Navigation
  const goToDescribe = useCallback(() => {
    setStage("describe");
    setDesignSubStage("outline");
    setCurrentModuleIndex(0);
  }, []);

  const goToDesign = useCallback(() => {
    setStage("design");
  }, []);

  const goToPublish = useCallback(() => {
    setStage("publish");
  }, []);

  const nextModule = useCallback(() => {
    if (currentModuleIndex < totalModules - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
    }
  }, [currentModuleIndex, totalModules]);

  const prevModule = useCallback(() => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
    } else {
      // Go back to outline review
      setDesignSubStage("outline");
    }
  }, [currentModuleIndex]);

  // API calls
  const generateOutline = useCallback(async () => {
    // Use polished requirement if available, otherwise use raw requirement
    const finalRequirement = polishedRequirement || requirement;
    if (!finalRequirement.trim()) return;

    // Create session ID for this course creation journey (bp-sdk pattern)
    const newSessionId = `course-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setSessionId(newSessionId);

    // Reset previous state when generating new outline
    setModules([]);
    setCurrentModuleIndex(0);

    setIsLoading(true);
    setError(null);
    try {
      // Include document content if available
      const documentContent = document?.status === "ready" ? document.content : null;

      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "outline",
          data: {
            requirement: finalRequirement,
            sessionId: newSessionId,
            documentContent,
            documentName: document?.name,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate outline");
      }

      const data = await response.json();
      setOutline(data.outline);
      setStage("design");
      setDesignSubStage("outline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [requirement, polishedRequirement, document]);

  const reviseOutline = useCallback(
    async (feedback: string) => {
      if (!outline) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/course/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "revise-outline",
            data: { outline, feedback },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to revise outline");
        }

        const data = await response.json();
        setOutline(data.outline);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [outline]
  );

  const approveOutline = useCallback(async () => {
    if (!outline) return;

    setDesignSubStage("module");
    setCurrentModuleIndex(0);

    // Trigger first module generation directly here to avoid stale closure
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "module",
          data: { outline, moduleIndex: 0 },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate module");
      }

      const data = await response.json();
      setModules((prev) => {
        const newModules = [...prev];
        newModules[0] = data.module;
        return newModules;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [outline]);

  const generateModule = useCallback(
    async (index: number) => {
      if (!outline) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/course/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "module",
            data: { outline, moduleIndex: index },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate module");
        }

        const data = await response.json();
        setModules((prev) => {
          const newModules = [...prev];
          newModules[index] = data.module;
          return newModules;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [outline]
  );

  const reviseModule = useCallback(
    async (feedback: string) => {
      if (!outline || !modules[currentModuleIndex]) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/course/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "revise-module",
            data: {
              outline,
              module: modules[currentModuleIndex],
              feedback,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to revise module");
        }

        const data = await response.json();
        setModules((prev) => {
          const newModules = [...prev];
          newModules[currentModuleIndex] = data.module;
          return newModules;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [outline, modules, currentModuleIndex]
  );

  const approveModule = useCallback(() => {
    if (currentModuleIndex < totalModules - 1) {
      // Move to next module
      const nextIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(nextIndex);
      // Generate next module if not already generated
      if (!modules[nextIndex]) {
        generateModule(nextIndex);
      }
    } else {
      // All modules approved, go to publish
      setStage("publish");
    }
  }, [currentModuleIndex, totalModules, modules, generateModule]);

  const publishCourse = useCallback(async (): Promise<string> => {
    if (!outline) throw new Error("No outline to publish");

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/course/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline,
          modules,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish course");
      }

      const data = await response.json();
      return data.courseId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [outline, modules]);

  // Computed helpers
  const canGoNext = useMemo(() => {
    if (stage === "describe") {
      // Need at least 10 characters of requirement
      return requirement.trim().length >= 10;
    }
    if (stage === "design") {
      if (designSubStage === "outline") {
        return !!outline && !isLoading;
      }
      return !!modules[currentModuleIndex] && !isLoading;
    }
    return true;
  }, [stage, designSubStage, requirement, outline, modules, currentModuleIndex, isLoading]);

  const canGoBack = useMemo(() => {
    if (stage === "describe") return false;
    if (stage === "design" && designSubStage === "outline") return true;
    if (stage === "design" && designSubStage === "module") return true;
    if (stage === "publish") return true;
    return false;
  }, [stage, designSubStage]);

  const actionMode = useMemo((): "submit" | "approve" | "publish" | "loading" => {
    if (isLoading) return "loading";
    if (stage === "describe") return "submit";
    if (stage === "design") return "approve";
    if (stage === "publish") return "publish";
    return "submit";
  }, [stage, isLoading]);

  const nextLabel = useMemo(() => {
    if (stage === "describe") return "Generate Outline";
    if (stage === "design" && designSubStage === "outline") return "Approve Outline";
    if (stage === "design" && designSubStage === "module") {
      return currentModuleIndex < totalModules - 1
        ? "Approve & Continue"
        : "Approve & Finish";
    }
    return "Publish Course";
  }, [stage, designSubStage, currentModuleIndex, totalModules]);

  return {
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
    sessionId,
    isLoading,
    isPolishing,
    error,

    // Requirement updates
    updateRequirement,
    updateDocument,
    polishRequirement,

    // Navigation
    goToDescribe,
    goToDesign,
    goToPublish,
    nextModule,
    prevModule,

    // Outline actions
    generateOutline,
    reviseOutline,
    approveOutline,

    // Module actions
    generateModule,
    reviseModule,
    approveModule,

    // Publish
    publishCourse,

    // Helpers
    canGoNext,
    canGoBack,
    actionMode,
    nextLabel,
  };
}
