"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@tasco/ui";
import { ArrowRight, AlertTriangle, CheckCircle } from "@tasco/ui/icons";

interface DataField {
  key: string;
  label: string;
  sourceValue: string | number | null;
  targetValue: string | number | null;
}

interface DataComparisonViewProps {
  sourceSystem: string;
  targetSystem: string;
  recordId?: string;
  recordType?: string;
  fields: DataField[];
}

export function DataComparisonView({
  sourceSystem,
  targetSystem,
  recordId,
  recordType,
  fields,
}: DataComparisonViewProps) {
  const hasMismatches = fields.some(
    (f) => f.sourceValue !== f.targetValue && f.sourceValue && f.targetValue
  );
  const hasMissing = fields.some(
    (f) => (f.sourceValue && !f.targetValue) || (!f.sourceValue && f.targetValue)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Data Comparison</CardTitle>
          {recordId && (
            <span className="text-sm text-muted-foreground">
              {recordType}: {recordId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span className="font-medium text-foreground">{sourceSystem}</span>
          <ArrowRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{targetSystem}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 bg-muted/50 px-4 py-2 text-sm font-medium">
            <div>Field</div>
            <div>{sourceSystem}</div>
            <div>{targetSystem}</div>
            <div className="text-center">Status</div>
          </div>

          {/* Rows */}
          {fields.map((field) => {
            const isMatch =
              field.sourceValue === field.targetValue &&
              field.sourceValue !== null;
            const isMismatch =
              field.sourceValue !== field.targetValue &&
              field.sourceValue !== null &&
              field.targetValue !== null;
            const isMissing =
              (field.sourceValue && !field.targetValue) ||
              (!field.sourceValue && field.targetValue);

            return (
              <div
                key={field.key}
                className={`grid grid-cols-4 gap-4 px-4 py-3 text-sm border-t ${
                  isMismatch
                    ? "bg-yellow-50 dark:bg-yellow-900/10"
                    : isMissing
                      ? "bg-red-50 dark:bg-red-900/10"
                      : ""
                }`}
              >
                <div className="text-muted-foreground">{field.label}</div>
                <div className="font-mono">
                  {field.sourceValue ?? (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </div>
                <div className="font-mono">
                  {field.targetValue ?? (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {isMatch && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {isMismatch && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  {isMissing && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          {hasMismatches && (
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              Value mismatches detected
            </span>
          )}
          {hasMissing && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              Missing data detected
            </span>
          )}
          {!hasMismatches && !hasMissing && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              All fields match
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
