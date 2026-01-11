"use client";

import { Card } from "@tasco/ui";
import { Button } from "@tasco/ui";
import { CheckCircle, Eye, FileText } from "@tasco/ui/icons";

interface ModuleCardProps {
  index: number;
  title: string;
  lessonCount: number;
  quizQuestionCount: number;
  isCompleted?: boolean;
  onPreview?: () => void;
}

export function ModuleCard({
  index,
  title,
  lessonCount,
  quizQuestionCount,
  isCompleted = false,
  onPreview,
}: ModuleCardProps) {
  return (
    <Card className="p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">
              Module {index + 1}: {title}
            </p>
            <p className="text-sm text-muted-foreground">
              {lessonCount} lessons · {quizQuestionCount} quiz questions
            </p>
          </div>
        </div>

        {onPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="flex-shrink-0"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        )}
      </div>
    </Card>
  );
}

interface ModuleListProps {
  modules: Array<{
    title: string;
    lessons: string[];
    quizQuestions: number;
  }>;
  completedModules?: number[];
  onPreviewModule?: (index: number) => void;
}

export function ModuleList({
  modules,
  completedModules = [],
  onPreviewModule,
}: ModuleListProps) {
  return (
    <div className="space-y-2">
      {modules.map((module, index) => (
        <ModuleCard
          key={index}
          index={index}
          title={module.title}
          lessonCount={module.lessons.length}
          quizQuestionCount={module.quizQuestions}
          isCompleted={completedModules.includes(index)}
          onPreview={onPreviewModule ? () => onPreviewModule(index) : undefined}
        />
      ))}
    </div>
  );
}
