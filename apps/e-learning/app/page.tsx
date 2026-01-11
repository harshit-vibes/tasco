"use client";

import Link from "next/link";
import { Card, CardContent, Button, Skeleton } from "@tasco/ui";
import {
  MessageCircle,
  BookOpen,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  GraduationCap,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";
import { useCourses } from "../lib/course-context";

// Skeleton for loading state
function HomePageSkeleton() {
  return (
    <div className="flex-1 bg-hero-gradient paper-texture-subtle">
      <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Hero Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Featured Courses Skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl lg:row-span-2" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  const { t } = useTranslation("elearning");
  const { courses, isLoading, error, refreshCourses } = useCourses();

  // Loading state
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-hero-gradient paper-texture-subtle min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">{t("errors.loadingCourses")}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refreshCourses} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("errors.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const quickStats = [
    {
      label: t("stats.coursesAvailable"),
      value: String(courses.length),
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("stats.coursesCompleted"),
      value: "0", // TODO: Get from user progress
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: t("stats.quizzesPassed"),
      value: "0", // TODO: Get from user progress
      icon: Trophy,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: t("stats.learningTime"),
      value: "0h", // TODO: Get from user progress
      icon: Clock,
      color: "text-sky-600",
      bgColor: "bg-sky-50 dark:bg-sky-950/50",
    },
  ];

  // Get featured courses (up to 3)
  const featuredCourses = courses.slice(0, 3).map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    duration: `${course.estimatedMinutes} min`,
    lessons: course.moduleCount,
    category: course.category.split("-").map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" "),
    featured: true,
  }));

  // Empty state when no courses
  if (courses.length === 0) {
    return (
      <div className="flex-1 bg-hero-gradient paper-texture-subtle">
        <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
          {/* Editorial Hero Section */}
          <header className="animate-fade-in-up page-header-editorial">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{t("hero.badge")}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-foreground">
              {t("hero.titleLine1")}
              <br />
              <span className="text-primary">{t("hero.titleLine2")}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
              {t("hero.description")}
            </p>
          </header>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t("courses.noCourses")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("courses.noCoursesDesc")}
            </p>
            <Link href="/create">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t("courses.createFirst")}
              </Button>
            </Link>
          </div>

          {/* AI Assistant CTA */}
          <section className="animate-fade-in-up delay-225">
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
                  <div className="p-5 rounded-2xl bg-primary/10 animate-float">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{t("assistant.subtitle")}</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      {t("assistant.title")}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-6 max-w-xl">
                      {t("assistant.description")}
                    </p>

                    <Link href="/chat">
                      <Button size="lg" className="gap-2 shadow-warm-md">
                        <MessageCircle className="h-5 w-5" />
                        {t("assistant.startConversation")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
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

  return (
    <div className="flex-1 bg-hero-gradient paper-texture-subtle">
      <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Editorial Hero Section */}
        <header className="animate-fade-in-up page-header-editorial">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{t("hero.badge")}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-foreground">
            {t("hero.titleLine1")}
            <br />
            <span className="text-primary">{t("hero.titleLine2")}</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
            {t("hero.description")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/chat">
              <Button size="lg" className="gap-2 shadow-warm-md hover:shadow-warm-lg transition-shadow">
                <MessageCircle className="h-5 w-5" />
                {t("hero.askAssistant")}
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="gap-2 hover-lift">
                <BookOpen className="h-5 w-5" />
                {t("hero.browseCourses")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Quick Stats - Staggered Animation */}
        <section className="animate-stagger">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className="stat-card group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {index === 0 && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {t("stats.active")}
                    </span>
                  )}
                </div>
                <p className="stat-card-value">{stat.value}</p>
                <p className="stat-card-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Courses - Editorial Layout */}
        <section className="animate-fade-in-up delay-150">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("courses.subtitle")}</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{t("courses.title")}</h2>
            </div>
            <Link href="/courses">
              <Button variant="ghost" className="gap-2 link-underline font-medium">
                {t("courses.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Featured Course Hero + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured Course - Large Card */}
            {featuredCourses.length > 0 && (
              <Link href={`/courses/${featuredCourses[0].id}`} className="lg:row-span-2">
                <Card className="course-card-featured h-full cursor-pointer group overflow-hidden">
                  <CardContent className="p-6 md:p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge-teal text-xs px-3 py-1 rounded-full">
                        {featuredCourses[0].category}
                      </span>
                      <span className="badge-amber text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {t("courses.featured")}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {featuredCourses[0].title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                      {featuredCourses[0].description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          {t("courses.modules", { count: featuredCourses[0].lessons })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {featuredCourses[0].duration}
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Smaller Course Cards */}
            {featuredCourses.slice(1).map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="course-card h-full cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge-teal text-xs px-2.5 py-1 rounded-full">
                        {course.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("courses.modules", { count: course.lessons })}
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Assistant CTA - Editorial Style */}
        <section className="animate-fade-in-up delay-225">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
                <div className="p-5 rounded-2xl bg-primary/10 animate-float">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{t("assistant.subtitle")}</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-3">
                    {t("assistant.title")}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-6 max-w-xl">
                    {t("assistant.description")}
                  </p>

                  <Link href="/chat">
                    <Button size="lg" className="gap-2 shadow-warm-md">
                      <MessageCircle className="h-5 w-5" />
                      {t("assistant.startConversation")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
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
