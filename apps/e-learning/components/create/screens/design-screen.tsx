"use client";

import { StreamingLoader, MarkdownPreview, RevisionDialog } from "../builder";
import type {
  CourseOutline,
  GeneratedModule,
  DesignSubStage,
} from "../../../lib/types/creator";
import { loadingMessages } from "../../../lib/types/creator";

interface DesignScreenProps {
  subStage: DesignSubStage;
  currentModuleIndex: number;
  outline: CourseOutline | null;
  modules: GeneratedModule[];
  isLoading: boolean;
  showRevisionDialog: boolean;
  onRevisionDialogChange: (open: boolean) => void;
  onReviseOutline: (feedback: string) => void;
  onReviseModule: (feedback: string) => void;
}

export function DesignScreen({
  subStage,
  currentModuleIndex,
  outline,
  modules,
  isLoading,
  showRevisionDialog,
  onRevisionDialogChange,
  onReviseOutline,
  onReviseModule,
}: DesignScreenProps) {

  // Determine loading messages based on context
  const getLoadingMessages = () => {
    if (subStage === "outline") {
      return loadingMessages.outline;
    }
    return loadingMessages.module;
  };

  // Format outline as markdown for preview
  const formatOutlineMarkdown = (outline: CourseOutline): string => {
    let md = `## ${outline.title.toUpperCase()}\n\n`;
    md += `**Target Audience:** ${outline.audience}\n`;
    md += `**Difficulty:** ${outline.level}\n`;
    md += `**Duration:** ~${outline.estimatedMinutes} minutes\n\n`;

    outline.modules.forEach((module, index) => {
      md += `### Module ${index + 1}: ${module.title}\n`;
      module.lessons.forEach((lesson) => {
        md += `- ${lesson}\n`;
      });
      md += `\n> Quiz: ${module.quizQuestions} questions\n\n`;
    });

    return md;
  };

  // Format module content as markdown for preview
  const formatModuleMarkdown = (
    module: GeneratedModule,
    outline: CourseOutline
  ): string => {
    const outlineModule = outline.modules[module.moduleIndex];
    let md = `## MODULE ${module.moduleIndex + 1}: ${outlineModule.title.toUpperCase()}\n\n`;

    module.lessons.forEach((lesson, index) => {
      md += `### Lesson ${index + 1}: ${lesson.title}\n\n`;
      md += `${lesson.content}\n\n`;
    });

    if (module.quiz && module.quiz.questions.length > 0) {
      md += `### Quiz Questions\n\n`;
      module.quiz.questions.forEach((q, index) => {
        md += `**${index + 1}. ${q.question}**\n`;
        q.options.forEach((opt, optIndex) => {
          const isCorrect = optIndex === q.correctAnswer;
          md += `${String.fromCharCode(65 + optIndex)}) ${opt}${isCorrect ? " ✓" : ""}\n`;
        });
        md += `\n> ${q.explanation}\n\n`;
      });
    }

    return md;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <StreamingLoader messages={getLoadingMessages()} />
      </div>
    );
  }

  // Show outline review
  if (subStage === "outline" && outline) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Review Course Outline</h1>
          <p className="text-muted-foreground">
            Review the AI-generated outline and approve or request changes.
          </p>
        </div>

        <MarkdownPreview content={formatOutlineMarkdown(outline)} />

        <RevisionDialog
          open={showRevisionDialog}
          onOpenChange={onRevisionDialogChange}
          onSubmit={onReviseOutline}
          title="What would you like to change?"
          description="Describe the changes you'd like to make to the course outline."
          suggestions={[
            "Add more practical examples",
            "Include a module on claims procedures",
            "Make it more beginner-friendly",
            "Add role-play scenarios",
          ]}
        />
      </div>
    );
  }

  // Show module build/review
  if (subStage === "module" && outline && modules[currentModuleIndex]) {
    const currentModule = modules[currentModuleIndex];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Module {currentModuleIndex + 1} of {outline.modules.length}
          </h1>
          <p className="text-muted-foreground">
            Review the content and approve or request changes.
          </p>
        </div>

        <MarkdownPreview
          content={formatModuleMarkdown(currentModule, outline)}
        />

        <RevisionDialog
          open={showRevisionDialog}
          onOpenChange={onRevisionDialogChange}
          onSubmit={onReviseModule}
          title="What would you like to change?"
          description="Describe the changes you'd like to make to this module."
          suggestions={[
            "Add more examples",
            "Simplify the language",
            "Add more quiz questions",
            "Include case studies",
          ]}
        />
      </div>
    );
  }

  // Fallback - waiting for content
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p>Waiting for content...</p>
    </div>
  );
}

