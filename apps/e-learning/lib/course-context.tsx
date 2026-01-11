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

// Types matching the database schema
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;
  questionCount: number;
  timeLimit?: number;
  questions?: QuizQuestion[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  estimatedMinutes: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  estimatedMinutes: number;
  lessons?: Lesson[];
  quiz?: Quiz;
}

export type CourseCategory =
  | "motor-insurance"
  | "health-insurance"
  | "claims-processing"
  | "underwriting"
  | "compliance"
  | "customer-service"
  | "sales"
  | "general";

export type CourseDifficulty = "beginner" | "intermediate" | "advanced";

export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
  id: string;
  appId: string;
  entityId: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  status: CourseStatus;
  estimatedMinutes: number;
  moduleCount: number;
  isAIGenerated: boolean;
  coverImage?: string;
  tags?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modules?: Module[];
}

// UI-friendly course type with nested modules
export interface FullCourse extends Course {
  modules: (Module & {
    lessons: Lesson[];
    quiz?: Quiz & { questions: QuizQuestion[] };
  })[];
}

interface CourseContextValue {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  getCourse: (courseId: string) => Course | undefined;
  getFullCourse: (courseId: string) => Promise<FullCourse | null>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | null>(null);

interface CourseProviderProps {
  children: ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/courses?appId=${APP_ID}&entityId=${ENTITY_ID}&status=published`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        throw new Error(data.error || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => [...prev, course]);
  }, []);

  const updateCourse = useCallback(
    (courseId: string, updates: Partial<Course>) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, ...updates } : course
        )
      );
    },
    []
  );

  const deleteCourse = useCallback((courseId: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  }, []);

  const getCourse = useCallback(
    (courseId: string) => courses.find((course) => course.id === courseId),
    [courses]
  );

  // Fetch full course with modules, lessons, and quizzes
  const getFullCourse = useCallback(
    async (courseId: string): Promise<FullCourse | null> => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/full?appId=${APP_ID}&entityId=${ENTITY_ID}&courseId=${courseId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();

        if (data.success) {
          return data.course as FullCourse;
        }

        return null;
      } catch (err) {
        console.error("Error fetching full course:", err);
        return null;
      }
    },
    []
  );

  const refreshCourses = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        isLoading,
        error,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getFullCourse,
        refreshCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
