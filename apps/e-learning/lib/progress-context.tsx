"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

// App constants
const APP_ID = "e-learning";
const ENTITY_ID = "e-learning";
const USER_ID_KEY = "e-learning-user-id";

// Generate or retrieve a persistent user ID (for demo purposes)
function getUserId(): string {
  if (typeof window === "undefined") return "demo-user";

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

// Types matching the database schema
export interface CourseProgress {
  userId: string;
  courseId: string;
  appId: string;
  entityId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
  totalTimeSpent: number;
}

export interface ModuleProgress {
  lessonProgress: Record<string, {
    completed: boolean;
    completedAt?: string;
    timeSpent: number;
  }>;
  quizPassed: boolean;
  quizScore?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  attemptedAt: string;
}

interface ProgressContextValue {
  userId: string;
  // Course progress
  courseProgress: Record<string, CourseProgress>;
  isLoadingProgress: boolean;
  // Lesson tracking
  completedLessons: Set<string>;
  markLessonComplete: (moduleId: string, lessonId: string) => Promise<void>;
  // Quiz tracking
  quizAttempts: Record<string, QuizAttempt>;
  submitQuizAttempt: (params: {
    quizId: string;
    moduleId: string;
    courseId: string;
    answers: Record<string, number>;
    timeSpent: number;
    passingScore: number;
  }) => Promise<QuizAttempt | null>;
  // Enrollment
  enrollInCourse: (courseId: string, totalModules: number) => Promise<CourseProgress | null>;
  // Refresh
  refreshProgress: (courseId?: string) => Promise<void>;
  // Get progress for a specific course
  getCourseProgressData: (courseId: string) => CourseProgress | null;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [userId, setUserId] = useState<string>("demo-user");
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgress>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Initialize userId on client side
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // Fetch all user progress
  const fetchAllProgress = useCallback(async () => {
    if (!userId || userId === "demo-user") return;

    try {
      setIsLoadingProgress(true);
      const response = await fetch(`/api/courses/progress?userId=${userId}`);

      if (!response.ok) {
        console.error("Failed to fetch progress:", response.status);
        return;
      }

      const data = await response.json();

      if (data.success && data.progress) {
        const progressMap: Record<string, CourseProgress> = {};
        for (const p of data.progress) {
          progressMap[p.courseId] = p;
        }
        setCourseProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId !== "demo-user") {
      fetchAllProgress();
    }
  }, [userId, fetchAllProgress]);

  // Enroll in a course
  const enrollInCourse = useCallback(async (
    courseId: string,
    totalModules: number
  ): Promise<CourseProgress | null> => {
    try {
      const response = await fetch("/api/courses/progress/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId,
          appId: APP_ID,
          entityId: ENTITY_ID,
          totalModules,
        }),
      });

      if (!response.ok) {
        console.error("Failed to enroll:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.success && data.progress) {
        setCourseProgress(prev => ({
          ...prev,
          [courseId]: data.progress,
        }));
        return data.progress;
      }

      return null;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      return null;
    }
  }, [userId]);

  // Mark lesson as complete
  const markLessonComplete = useCallback(async (
    moduleId: string,
    lessonId: string
  ): Promise<void> => {
    // Optimistic update
    setCompletedLessons(prev => new Set([...prev, lessonId]));

    try {
      const response = await fetch("/api/courses/progress/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleId,
          lessonId,
          completed: true,
          timeSpent: 0, // Could track actual time if needed
        }),
      });

      if (!response.ok) {
        console.error("Failed to update lesson progress:", response.status);
        // Revert optimistic update on failure
        setCompletedLessons(prev => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      // Revert optimistic update
      setCompletedLessons(prev => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
    }
  }, [userId]);

  // Submit quiz attempt
  const submitQuizAttempt = useCallback(async (params: {
    quizId: string;
    moduleId: string;
    courseId: string;
    answers: Record<string, number>;
    timeSpent: number;
    passingScore: number;
  }): Promise<QuizAttempt | null> => {
    try {
      const response = await fetch("/api/courses/progress/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...params,
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit quiz:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.success && data.attempt) {
        setQuizAttempts(prev => ({
          ...prev,
          [params.quizId]: data.attempt,
        }));
        return data.attempt;
      }

      return null;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      return null;
    }
  }, [userId]);

  // Refresh progress for a specific course or all courses
  const refreshProgress = useCallback(async (courseId?: string) => {
    if (courseId) {
      try {
        const response = await fetch(`/api/courses/progress?userId=${userId}&courseId=${courseId}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.progress) {
            setCourseProgress(prev => ({
              ...prev,
              [courseId]: data.progress,
            }));
          }
        }
      } catch (error) {
        console.error("Error refreshing course progress:", error);
      }
    } else {
      await fetchAllProgress();
    }
  }, [userId, fetchAllProgress]);

  // Get progress for a specific course
  const getCourseProgressData = useCallback((courseId: string): CourseProgress | null => {
    return courseProgress[courseId] || null;
  }, [courseProgress]);

  return (
    <ProgressContext.Provider
      value={{
        userId,
        courseProgress,
        isLoadingProgress,
        completedLessons,
        markLessonComplete,
        quizAttempts,
        submitQuizAttempt,
        enrollInCourse,
        refreshProgress,
        getCourseProgressData,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
