"use client";

import Link from "next/link";
import { Card, CardContent, Button, Skeleton } from "@tasco/ui";
import {
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp,
  FileText,
  BarChart3,
  Sparkles,
  Play,
  GraduationCap,
  RefreshCw,
  AlertCircle,
} from "@tasco/ui/icons";
import { useCourses, Course } from "../../lib/course-context";
import { useProgress, CourseProgress } from "../../lib/progress-context";
import { categories } from "../../lib/courses-data";

type CourseStatus = "not-started" | "in-progress" | "completed";

const statusBadgeConfig = {
  "not-started": {
    label: "Not Started",
    class: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    class: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/50",
  },
  completed: {
    label: "Completed",
    class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50",
  },
};

// Skeleton for loading state
function ProgressPageSkeleton() {
  return (
    <div className="flex-1 bg-hero-gradient paper-texture-subtle">
      <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Course Cards Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { courses, isLoading, error, refreshCourses } = useCourses();
  const {
    courseProgress: apiCourseProgress,
    isLoadingProgress,
    quizAttempts,
  } = useProgress();

  // Loading state
  if (isLoading || isLoadingProgress) {
    return <ProgressPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-hero-gradient paper-texture-subtle min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Error loading progress</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refreshCourses} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalModules = courses.reduce((sum, c) => sum + c.moduleCount, 0);
  const totalQuizzes = totalModules; // 1 quiz per module

  // Build course progress from API data
  const courseProgressList = courses.map((course) => {
    const apiProgress = apiCourseProgress[course.id];

    // Determine status from API data
    let status: CourseStatus = "not-started";
    if (apiProgress) {
      if (apiProgress.status === "completed") {
        status = "completed";
      } else if (apiProgress.status === "in_progress") {
        status = "in-progress";
      }
    }

    return {
      courseId: course.id,
      status,
      completedModules: apiProgress?.completedModules || 0,
      totalModules: apiProgress?.totalModules || course.moduleCount,
      completedLessons: apiProgress?.completedLessons || 0,
      totalLessons: apiProgress?.totalLessons || 0,
      overallProgress: apiProgress?.overallProgress || 0,
    };
  });

  // Calculate real progress stats from API data
  const progressValues = Object.values(apiCourseProgress);
  const completedCourses = progressValues.filter(p => p.status === "completed").length;
  const completedModulesTotal = progressValues.reduce((sum, p) => sum + (p.completedModules || 0), 0);
  const quizzesPassed = Object.keys(quizAttempts).filter(
    qId => quizAttempts[qId]?.passed
  ).length;

  // Calculate average score from quiz attempts
  const passedQuizzes = Object.values(quizAttempts).filter(q => q?.passed);
  const averageScore = passedQuizzes.length > 0
    ? Math.round(passedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / passedQuizzes.length)
    : 0;

  const stats = [
    {
      label: "Courses Completed",
      value: completedCourses,
      total: courses.length,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Modules Completed",
      value: completedModulesTotal,
      total: totalModules,
      icon: FileText,
      color: "text-sky-600",
      bgColor: "bg-sky-50 dark:bg-sky-950/50",
    },
    {
      label: "Quizzes Passed",
      value: quizzesPassed,
      total: totalQuizzes,
      icon: Trophy,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Average Score",
      value: averageScore || "-",
      suffix: averageScore ? "%" : "",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
  ];

  // Empty state when no courses
  if (courses.length === 0) {
    return (
      <div className="flex-1 bg-hero-gradient paper-texture-subtle">
        <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
          {/* Editorial Header */}
          <header className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
              Your <span className="text-primary">Progress</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Track your learning achievements, completed courses, and quiz scores.
            </p>
          </header>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No courses to track yet</h2>
            <p className="text-muted-foreground mb-6">
              Enroll in courses to start tracking your learning progress.
            </p>
            <Link href="/courses">
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-hero-gradient paper-texture-subtle">
      <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Editorial Header */}
        <header className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Learning Journey
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            Your <span className="text-primary">Progress</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Track your learning achievements, completed courses, and quiz scores.
            Keep going to become an insurance expert!
          </p>
        </header>

        {/* Stats Grid - Staggered Animation */}
        <section className="animate-stagger">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="stat-card-value">{stat.value}</span>
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  )}
                  {stat.total !== undefined && (
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  )}
                </div>
                <p className="stat-card-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Course Progress - Timeline Style */}
        <section className="animate-fade-in-up delay-150">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Course Progress</h2>
            <span className="text-sm text-muted-foreground">
              ({courses.length} courses)
            </span>
          </div>

          <div className="space-y-4">
            {courseProgressList.map((progress, courseIndex) => {
              const course = courses.find((c) => c.id === progress.courseId);
              if (!course) return null;

              // Use progress data from API
              const coursePercentComplete = progress.overallProgress || 0;

              return (
                <Card
                  key={progress.courseId}
                  className="course-card overflow-hidden"
                  style={{ animationDelay: `${courseIndex * 75}ms` }}
                >
                  <CardContent className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-5">
                      {/* Course Number Badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        progress.status === "completed"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50"
                          : progress.status === "in-progress"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {progress.status === "completed" ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          courseIndex + 1
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="badge-teal text-xs px-2.5 py-1 rounded-full">
                            {categories.find((c) => c.id === course.category)?.label || course.category}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                            statusBadgeConfig[progress.status].class
                          }`}>
                            {statusBadgeConfig[progress.status].label}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold mb-1">{course.title}</h3>

                        <p className="text-sm text-muted-foreground mb-4">
                          {course.moduleCount} modules • ~{course.estimatedMinutes} min
                        </p>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 progress-bar h-2">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${coursePercentComplete}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {progress.completedModules}/{progress.totalModules}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex-shrink-0">
                        <Link href={`/courses/${course.id}`}>
                          <Button
                            variant={progress.status === "not-started" ? "default" : "outline"}
                            className="gap-2 hover-lift"
                          >
                            {progress.status === "not-started" ? (
                              <>
                                <Play className="h-4 w-4" />
                                Start
                              </>
                            ) : progress.status === "completed" ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Review
                              </>
                            ) : (
                              <>
                                Continue
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Motivational CTA */}
        <section className="animate-fade-in-up delay-225">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-5 rounded-2xl bg-primary/10 animate-float">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Keep Growing</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">
                    Become a Certified Insurance Expert
                  </h3>

                  <p className="text-muted-foreground max-w-xl">
                    Complete all modules and pass every quiz to earn your certification.
                    Each course brings you closer to mastering insurance knowledge!
                  </p>
                </div>

                <Link href="/courses">
                  <Button size="lg" className="gap-2 shadow-warm-md hover:shadow-warm-lg">
                    Browse Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>

            {/* Decorative Elements */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          </Card>
        </section>
      </div>
    </div>
  );
}
