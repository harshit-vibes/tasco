"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Skeleton,
} from "@tasco/ui";
import {
  Search,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  LibraryBig,
  CheckCircle2,
  Play,
  RefreshCw,
  AlertCircle,
} from "@tasco/ui/icons";
import { categories } from "../../lib/courses-data";
import { useCourses } from "../../lib/course-context";
import { useTranslation } from "@tasco/i18n";

const getDifficultyConfig = (t: (key: string) => string) => ({
  beginner: {
    label: t("difficulty.beginner"),
    class:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50",
  },
  intermediate: {
    label: t("difficulty.intermediate"),
    class:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/50",
  },
  advanced: {
    label: t("difficulty.advanced"),
    class:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/50",
  },
});

function CourseCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedCourseSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex md:flex-col items-center gap-4 md:items-end">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CoursesPage() {
  const { t } = useTranslation("elearning");
  const { courses, isLoading, error, refreshCourses } = useCourses();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const difficultyConfig = getDifficultyConfig(t);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      search === "" ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate featured (first course) from rest for hero treatment
  const featuredCourse = filteredCourses[0];
  const remainingCourses = filteredCourses.slice(1);

  return (
    <div className="flex-1 bg-hero-gradient paper-texture-subtle">
      <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Editorial Page Header */}
        <header className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <LibraryBig className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {isLoading ? t("coursesPage.loading") : t("coursesPage.coursesAvailable", { count: courses.length })}
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            {t("coursesPage.title")} <span className="text-primary">{t("coursesPage.titleAccent")}</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {t("coursesPage.subtitle")}
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="animate-fade-in-up delay-75">
          <div className="flex flex-col gap-4">
            {/* Search Input with Enhanced Styling */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("coursesPage.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-xl border-border/50 bg-background/80 backdrop-blur-sm
                           focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter Pills - Smooth Animated Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`filter-pill ${selectedCategory === null ? "filter-pill-active" : ""}`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {t("coursesPage.allCourses")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`filter-pill ${selectedCategory === cat.id ? "filter-pill-active" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section className="animate-fade-in-up delay-150">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-8 text-center">
                <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("coursesPage.failedToLoad")}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button onClick={refreshCourses} className="hover-lift">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("errors.tryAgain")}
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <section className="animate-fade-in-up delay-150 space-y-6">
            <FeaturedCourseSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {/* Course Grid with Featured Hero */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <section className="animate-fade-in-up delay-150 space-y-6">
            {/* Featured Course - Hero Card */}
            {featuredCourse && (
              <Link href={`/courses/${featuredCourse.id}`}>
                <Card className="course-card-featured group overflow-hidden cursor-pointer">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Left: Course Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="badge-teal text-xs px-3 py-1 rounded-full">
                            {categories.find(
                              (c) => c.id === featuredCourse.category
                            )?.label || featuredCourse.category}
                          </span>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full border ${
                              difficultyConfig[featuredCourse.difficulty].class
                            }`}
                          >
                            {difficultyConfig[featuredCourse.difficulty].label}
                          </span>
                          <span className="badge-amber text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {t("coursesPage.featured")}
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                          {featuredCourse.title}
                        </h2>

                        <p className="text-muted-foreground leading-relaxed">
                          {featuredCourse.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            {t("coursesPage.modules", { count: featuredCourse.moduleCount })}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {t("coursesPage.minutes", { count: featuredCourse.estimatedMinutes })}
                          </span>
                        </div>
                      </div>

                      {/* Right: CTA */}
                      <div className="flex md:flex-col items-center gap-4 md:items-end">
                        <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                          <Play className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          {t("coursesPage.startLearning")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Remaining Courses - Grid */}
            {remainingCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {remainingCourses.map((course, index) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card
                      className="course-card h-full cursor-pointer group"
                      style={{ animationDelay: `${(index + 1) * 50}ms` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge-teal text-xs px-2.5 py-1 rounded-full">
                            {categories.find((c) => c.id === course.category)
                              ?.label || course.category}
                          </span>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                              difficultyConfig[course.difficulty].class
                            }`}
                          >
                            {difficultyConfig[course.difficulty].label}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 leading-relaxed">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            {t("coursesPage.modules", { count: course.moduleCount })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {t("coursesPage.minutes", { count: course.estimatedMinutes })}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: "0%" }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t("coursesPage.notStarted")}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCourses.length === 0 && (
          <section className="animate-fade-in-up delay-150">
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="py-16 text-center">
                <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("coursesPage.noCoursesFound")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {courses.length === 0
                    ? t("coursesPage.noCoursesFoundEmpty")
                    : t("coursesPage.noCoursesFoundFiltered")}
                </p>
                {courses.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory(null);
                    }}
                    className="hover-lift"
                  >
                    {t("coursesPage.clearFilters")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
