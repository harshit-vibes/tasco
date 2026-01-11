"use client";

import { Button, Textarea } from "@tasco/ui";
import { Lightbulb, Sparkles, RefreshCw } from "@tasco/ui/icons";
import { DocumentUpload, type UploadedDocument } from "../builder/document-upload";
import { useTranslation } from "@tasco/i18n";

interface DescribeScreenProps {
  requirement: string;
  polishedRequirement: string | null;
  document: UploadedDocument | null;
  isPolishing: boolean;
  onRequirementChange: (requirement: string) => void;
  onDocumentChange: (doc: UploadedDocument | null) => void;
  onPolish: () => void;
}

export function DescribeScreen({
  requirement,
  polishedRequirement,
  document,
  isPolishing,
  onRequirementChange,
  onDocumentChange,
  onPolish,
}: DescribeScreenProps) {
  const { t } = useTranslation("elearning");

  const exampleRequirements = [
    t("create.examples.motor"),
    t("create.examples.risk"),
    t("create.examples.compliance"),
    t("create.examples.customer"),
  ];

  const applyExample = (example: string) => {
    onRequirementChange(example);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("create.describeTitle")}</h1>
        <p className="text-muted-foreground">
          {t("create.describeSubtitle")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="requirement" className="text-sm font-medium">
            {t("create.requirementLabel")}
          </label>
          <Textarea
            id="requirement"
            placeholder={t("create.requirementPlaceholder")}
            value={requirement}
            onChange={(e) => onRequirementChange(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {requirement.trim().length > 10 && !polishedRequirement && (
          <Button
            variant="outline"
            onClick={onPolish}
            disabled={isPolishing}
            className="gap-2"
          >
            {isPolishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t("create.polishing")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("create.polishButton")}
              </>
            )}
          </Button>
        )}

        {polishedRequirement && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {t("create.aiEnhanced")}
            </label>
            <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4">
              <p className="text-sm leading-relaxed">{polishedRequirement}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPolish}
              disabled={isPolishing}
              className="gap-2 text-muted-foreground"
            >
              {isPolishing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  {t("create.repolishing")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  {t("create.repolish")}
                </>
              )}
            </Button>
          </div>
        )}

        <DocumentUpload
          document={document}
          onDocumentChange={onDocumentChange}
          isDisabled={isPolishing}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span>{t("create.exampleHint")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exampleRequirements.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyExample(example)}
              className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 dark:hover:border-orange-800"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
