"use client";

import { Card } from "@tasco/ui";
import { ModuleList } from "../builder";
import type { CourseOutline, GeneratedModule } from "../../../lib/types/creator";
import { PartyPopper, Clock, Target, BookOpen, HelpCircle } from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface PublishScreenProps {
  outline: CourseOutline;
  modules: GeneratedModule[];
  onPreviewModule?: (index: number) => void;
}

export function PublishScreen({
  outline,
  modules,
  onPreviewModule,
}: PublishScreenProps) {
  const { t } = useTranslation("elearning");

  // Calculate totals
  const totalLessons = modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const totalQuizQuestions = modules.reduce(
    (sum, m) => sum + (m.quiz?.questions.length || 0),
    0
  );

  // Get level label using i18n
  const getLevelLabel = (level: string) => {
    const key = `difficulty.${level}`;
    return t(key);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("publish.ready")}</h1>
          <p className="text-muted-foreground">
            {t("publish.reviewSubtitle")}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Course Header */}
          <div>
            <h2 className="text-xl font-bold">{outline.title}</h2>
            {outline.description && (
              <p className="mt-2 text-muted-foreground">{outline.description}</p>
            )}
          </div>

          {/* Course Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {t("publish.modulesAndLessons", { modules: outline.modules.length, lessons: totalLessons })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>{t("publish.quizQuestions", { count: totalQuizQuestions })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("publish.duration", { minutes: outline.estimatedMinutes })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{getLevelLabel(outline.level)}</span>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t("publish.courseModules")}</h3>
            <ModuleList
              modules={outline.modules.map((m, i) => ({
                title: m.title,
                lessons: m.lessons,
                quizQuestions: modules[i]?.quiz?.questions.length || m.quizQuestions,
              }))}
              completedModules={modules.map((_, i) => i)}
              onPreviewModule={onPreviewModule}
            />
          </div>
        </div>
      </Card>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          {t("publish.publishNote")}
        </p>
      </div>
    </div>
  );
}
