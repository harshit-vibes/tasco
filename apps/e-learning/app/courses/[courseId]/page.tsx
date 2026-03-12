"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  Button,
  Skeleton,
  ScrollArea,
} from "@tasco/ui";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Trophy,
  FileText,
  Play,
  GraduationCap,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Target,
  Circle,
} from "@tasco/ui/icons";
import { useCourses, type FullCourse, type Module, type Lesson, type Quiz, type QuizQuestion } from "../../../lib/course-context";
import { useProgress, type QuizAttempt } from "../../../lib/progress-context";
import { categories } from "../../../lib/courses-data";
import { QuizContainer } from "../../../components/quiz/quiz-container";

// Types
type ContentView =
  | { type: "overview" }
  | { type: "lesson"; moduleId: string; lessonId: string }
  | { type: "quiz"; moduleId: string };

type FullModule = Module & {
  lessons: Lesson[];
  quiz?: Quiz & { questions: QuizQuestion[] };
};

// Difficulty config
const difficultyConfig = {
  beginner: {
    label: "Beginner",
    class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50",
  },
  intermediate: {
    label: "Intermediate",
    class: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/50",
  },
  advanced: {
    label: "Advanced",
    class: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/50",
  },
};

// Loading skeleton
function CourseLearningSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar skeleton */}
      <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="pl-4 space-y-1">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 p-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Curriculum Sidebar Item
function CurriculumItem({
  module,
  moduleIndex,
  expandedModules,
  toggleModule,
  completedLessons,
  currentView,
  onSelectLesson,
  onSelectQuiz,
}: {
  module: FullModule;
  moduleIndex: number;
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
  completedLessons: Set<string>;
  currentView: ContentView;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onSelectQuiz: (moduleId: string) => void;
}) {
  const isExpanded = expandedModules.has(module.id);
  const lessons = module.lessons || [];
  const completedInModule = lessons.filter(l => completedLessons.has(l.id)).length;
  const allLessonsComplete = completedInModule === lessons.length && lessons.length > 0;
  const moduleProgress = lessons.length > 0 ? (completedInModule / lessons.length) * 100 : 0;

  return (
    <div className="mb-1">
      {/* Module Header */}
      <button
        onClick={() => toggleModule(module.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
          ${allLessonsComplete
            ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50"
            : "hover:bg-muted/50 border border-transparent"
          }`}
      >
        {/* Expand/Collapse */}
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>

        {/* Module Number */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
          ${allLessonsComplete
            ? "bg-emerald-500 text-white"
            : "bg-primary/10 text-primary"
          }`}
        >
          {allLessonsComplete ? <CheckCircle className="h-4 w-4" /> : moduleIndex + 1}
        </div>

        {/* Module Title & Progress */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{module.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden max-w-[100px]">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${moduleProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {completedInModule}/{lessons.length}
            </span>
          </div>
        </div>
      </button>

      {/* Lessons & Quiz List */}
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-border/50 pl-3">
          {/* Lessons */}
          {lessons.map((lesson, lessonIndex) => {
            const isComplete = completedLessons.has(lesson.id);
            const isActive = currentView.type === "lesson" &&
              currentView.moduleId === module.id &&
              currentView.lessonId === lesson.id;

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(module.id, lesson.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-all
                  ${isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-emerald-500"}`} />
                  ) : (
                    <Circle className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : ""}`} />
                  )}
                </div>

                {/* Lesson Title */}
                <span className="flex-1 truncate">{lesson.title}</span>

                {/* Duration */}
                <span className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {lesson.estimatedMinutes}m
                </span>
              </button>
            );
          })}

          {/* Quiz (if exists) */}
          {module.quiz && module.quiz.questions && (
            <button
              onClick={() => allLessonsComplete && onSelectQuiz(module.id)}
              disabled={!allLessonsComplete}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-all mt-1
                ${currentView.type === "quiz" && currentView.moduleId === module.id
                  ? "bg-amber-500 text-white"
                  : allLessonsComplete
                    ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50"
                    : "text-muted-foreground/50 cursor-not-allowed border border-dashed border-border"
                }`}
            >
              {/* Lock/Trophy Icon */}
              <div className="flex-shrink-0">
                {allLessonsComplete ? (
                  <Trophy className={`h-3.5 w-3.5 ${currentView.type === "quiz" && currentView.moduleId === module.id ? "text-white" : "text-amber-500"}`} />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Quiz Title */}
              <span className="flex-1 truncate">
                {allLessonsComplete ? module.quiz.title : "Quiz (complete lessons first)"}
              </span>

              {/* Question Count */}
              {allLessonsComplete && (
                <span className={`text-[10px] ${currentView.type === "quiz" && currentView.moduleId === module.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {module.quiz.questions.length}Q
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Main Content: Overview
function OverviewContent({ course }: { course: FullCourse }) {
  const modules = course.modules || [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const totalQuizzes = modules.filter(m => m.quiz).length;

  return (
    <div className="max-w-3xl">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="badge-teal text-xs px-3 py-1 rounded-full">
            {categories.find(c => c.id === course.category)?.label || course.category}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${difficultyConfig[course.difficulty].class}`}>
            {difficultyConfig[course.difficulty].label}
          </span>
          {course.isAIGenerated && (
            <span className="badge-amber text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{course.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{modules.length}</div>
            <div className="text-xs text-muted-foreground">Modules</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-500/5 to-sky-500/10 border-sky-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-sky-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-sky-600">{totalLessons}</div>
            <div className="text-xs text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-600">{totalQuizzes}</div>
            <div className="text-xs text-muted-foreground">Quizzes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600">{course.estimatedMinutes}</div>
            <div className="text-xs text-muted-foreground">Minutes</div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-amber-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to Learn?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Select any lesson from the curriculum on the left to begin.
                Complete all lessons in a module to unlock its quiz.
                Your progress is automatically tracked.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Circle className="h-3 w-3" />
                  <span>Not started</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Quiz locked</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  <span>Quiz ready</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Content: Lesson
function LessonContent({
  course,
  moduleId,
  lessonId,
  completedLessons,
  onComplete,
  onNavigate,
}: {
  course: FullCourse;
  moduleId: string;
  lessonId: string;
  completedLessons: Set<string>;
  onComplete: (moduleId: string, lessonId: string) => void;
  onNavigate: (moduleId: string, lessonId: string) => void;
}) {
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) return null;

  const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
  const lesson = module.lessons[lessonIndex];
  if (!lesson) return null;

  const isComplete = completedLessons.has(lessonId);
  const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null;

  return (
    <div className="max-w-3xl">
      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="badge-teal px-2.5 py-1 rounded-full text-xs">
            {module.title}
          </span>
          <span>•</span>
          <span>Lesson {lesson.order} of {module.lessons.length}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.estimatedMinutes} min
          </span>
          {isComplete && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="h-3 w-3" />
                Completed
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{lesson.title}</h1>
        <div className="h-1 w-16 bg-primary rounded-full" />
      </div>

      {/* Lesson Content */}
      <Card className="mb-6 shadow-warm-sm">
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-ul:my-4 prose-ol:my-4 prose-li:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Actions & Navigation */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous */}
        {prevLesson ? (
          <Button
            variant="outline"
            onClick={() => onNavigate(moduleId, prevLesson.id)}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {/* Complete Button */}
        {!isComplete ? (
          <Button
            onClick={() => onComplete(moduleId, lessonId)}
            className="gap-2 shadow-warm-md hover:shadow-warm-lg"
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Complete
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            Lesson Complete
          </div>
        )}

        {/* Next */}
        {nextLesson ? (
          <Button
            variant={isComplete ? "default" : "outline"}
            onClick={() => onNavigate(moduleId, nextLesson.id)}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// Main Content: Quiz
function QuizContent({
  course,
  moduleId,
  onComplete,
  onSubmitQuiz,
}: {
  course: FullCourse;
  moduleId: string;
  onComplete: (score: number, passed: boolean) => void;
  onSubmitQuiz: (params: {
    quizId: string;
    moduleId: string;
    courseId: string;
    answers: Record<string, number>;
    timeSpent: number;
    passingScore: number;
  }) => Promise<QuizAttempt | null>;
}) {
  const module = course.modules.find(m => m.id === moduleId);
  if (!module || !module.quiz || !module.quiz.questions) return null;

  const quiz = module.quiz as Quiz & { questions: QuizQuestion[] };

  // Enhanced onComplete that also submits to API
  const handleComplete = async (score: number, passed: boolean) => {
    // Call the local callback first for immediate UI feedback
    onComplete(score, passed);

    // Create answers object from questions (QuizContainer would need to expose this)
    // For now, we'll submit a simplified version
    const answers: Record<string, number> = {};
    quiz.questions.forEach((q, index) => {
      // Note: QuizContainer doesn't expose answers, so this is a placeholder
      // In a full implementation, QuizContainer would pass the answers back
      answers[q.id] = -1; // Placeholder
    });

    // Submit to API (best effort - UI already shows results)
    try {
      await onSubmitQuiz({
        quizId: quiz.id,
        moduleId,
        courseId: course.id,
        answers,
        timeSpent: 0,
        passingScore: quiz.passingScore,
      });
    } catch (error) {
      console.error("Failed to submit quiz to server:", error);
    }
  };

  return (
    <div className="max-w-3xl">
      <QuizContainer
        quiz={quiz}
        onComplete={handleComplete}
        onRetry={() => {}}
      />
    </div>
  );
}

// Main Component
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { getFullCourse } = useCourses();

  // Progress context - persists to database
  const {
    completedLessons,
    markLessonComplete,
    quizAttempts,
    submitQuizAttempt,
    enrollInCourse,
  } = useProgress();

  const [course, setCourse] = useState<FullCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ContentView>({ type: "overview" });

  // Local quiz results for immediate UI feedback (also persisted via context)
  const [quizResults, setQuizResults] = useState<Map<string, { score: number; passed: boolean }>>(new Map());

  // Fetch course and auto-enroll
  useEffect(() => {
    async function fetchCourseAndEnroll() {
      try {
        setIsLoading(true);
        setError(null);
        const fullCourse = await getFullCourse(courseId);
        setCourse(fullCourse);

        // Expand first module by default
        if (fullCourse?.modules?.length) {
          setExpandedModules(new Set([fullCourse.modules[0].id]));

          // Auto-enroll user in this course (idempotent - won't duplicate)
          await enrollInCourse(courseId, fullCourse.modules.length);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourseAndEnroll();
  }, [courseId, getFullCourse, enrollInCourse]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    if (totalLessons === 0) return 0;
    return (completedLessons.size / totalLessons) * 100;
  }, [course, completedLessons]);

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Handle lesson selection
  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setCurrentView({ type: "lesson", moduleId, lessonId });
    // Expand the module
    setExpandedModules(prev => new Set([...prev, moduleId]));
  };

  // Handle quiz selection
  const handleSelectQuiz = (moduleId: string) => {
    setCurrentView({ type: "quiz", moduleId });
    setExpandedModules(prev => new Set([...prev, moduleId]));
  };

  // Handle lesson completion - now persists to database
  const handleLessonComplete = async (moduleId: string, lessonId: string) => {
    await markLessonComplete(moduleId, lessonId);
  };

  // Handle quiz completion - now persists to database
  const handleQuizComplete = async (moduleId: string, score: number, passed: boolean) => {
    // Update local state for immediate UI feedback
    setQuizResults(prev => new Map([...prev, [moduleId, { score, passed }]]));
  };

  // Loading state
  if (isLoading) {
    return <CourseLearningSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Failed to load course</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/courses">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Course not found</h2>
          <p className="text-muted-foreground mb-6">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/courses">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Curriculum Sidebar */}
      <aside className="w-80 border-r bg-muted/20 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-background/50">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <button
            onClick={() => setCurrentView({ type: "overview" })}
            className="w-full text-left"
          >
            <h2 className="font-semibold text-base truncate hover:text-primary transition-colors">
              {course.title}
            </h2>
          </button>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
        </div>

        {/* Curriculum List */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-2">
              Curriculum
            </div>

            {modules.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No modules available
              </div>
            ) : (
              modules.map((module, index) => (
                <CurriculumItem
                  key={module.id}
                  module={module as FullModule}
                  moduleIndex={index}
                  expandedModules={expandedModules}
                  toggleModule={toggleModule}
                  completedLessons={completedLessons}
                  currentView={currentView}
                  onSelectLesson={handleSelectLesson}
                  onSelectQuiz={handleSelectQuiz}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer - Stats */}
        <div className="p-3 border-t bg-background/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedLessons.size} lessons completed</span>
            <span>{quizResults.size} quizzes passed</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 lg:p-10">
          {currentView.type === "overview" && (
            <OverviewContent course={course} />
          )}

          {currentView.type === "lesson" && (
            <LessonContent
              course={course}
              moduleId={currentView.moduleId}
              lessonId={currentView.lessonId}
              completedLessons={completedLessons}
              onComplete={handleLessonComplete}
              onNavigate={handleSelectLesson}
            />
          )}

          {currentView.type === "quiz" && (
            <QuizContent
              course={course}
              moduleId={currentView.moduleId}
              onComplete={(score, passed) => handleQuizComplete(currentView.moduleId, score, passed)}
              onSubmitQuiz={submitQuizAttempt}
            />
          )}
        </div>
      </main>
    </div>
  );
}
