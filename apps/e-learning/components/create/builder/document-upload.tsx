"use client";

import { useState, useCallback, useRef } from "react";
import { Button, cn } from "@tasco/ui";
import { Upload, FileText, X, Loader2, CheckCircle } from "@tasco/ui/icons";

interface UploadedDocument {
  file: File;
  name: string;
  size: number;
  type: string;
  content: string | null;
  status: "uploading" | "extracting" | "ready" | "error";
  error?: string;
}

interface DocumentUploadProps {
  document: UploadedDocument | null;
  onDocumentChange: (doc: UploadedDocument | null) => void;
  isDisabled?: boolean;
}

const ACCEPTED_TYPES = [
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt" || extension === "md") {
    return await file.text();
  }

  if (extension === "pdf") {
    // For PDFs, we'll send to an API endpoint for extraction
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/course/extract-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract text from PDF");
    }

    const data = await response.json();
    return data.text || "";
  }

  if (extension === "docx") {
    // For DOCX, we'll also use an API endpoint
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/course/extract-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract text from DOCX");
    }

    const data = await response.json();
    return data.text || "";
  }

  throw new Error("Unsupported file type");
}

export function DocumentUpload({
  document,
  onDocumentChange,
  isDisabled = false,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        onDocumentChange({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          content: null,
          status: "error",
          error: "Unsupported file type. Please upload PDF, TXT, MD, or DOCX files.",
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        onDocumentChange({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          content: null,
          status: "error",
          error: "File too large. Maximum size is 10MB.",
        });
        return;
      }

      // Set initial state
      onDocumentChange({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        content: null,
        status: "extracting",
      });

      try {
        const content = await extractTextFromFile(file);
        onDocumentChange({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          content,
          status: "ready",
        });
      } catch (error) {
        onDocumentChange({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          content: null,
          status: "error",
          error: error instanceof Error ? error.message : "Failed to extract text",
        });
      }
    },
    [onDocumentChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isDisabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, isDisabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onDocumentChange(null);
  }, [onDocumentChange]);

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      fileInputRef.current?.click();
    }
  }, [isDisabled]);

  // Show uploaded document
  if (document) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Reference Document</label>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3",
            document.status === "error"
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : document.status === "ready"
              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              document.status === "error"
                ? "bg-red-100 dark:bg-red-900/50"
                : document.status === "ready"
                ? "bg-green-100 dark:bg-green-900/50"
                : "bg-orange-100 dark:bg-orange-900/50"
            )}
          >
            {document.status === "extracting" ? (
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
            ) : document.status === "ready" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <FileText className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{document.name}</p>
            <p className="text-xs text-muted-foreground">
              {document.status === "extracting"
                ? "Extracting text..."
                : document.status === "error"
                ? document.error
                : `${formatFileSize(document.size)} • ${document.content?.length.toLocaleString() || 0} characters extracted`}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={document.status === "extracting"}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show upload area
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reference Document (Optional)</label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          isDragging
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
            : "border-muted-foreground/25 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
          isDisabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDisabled}
        />

        <Upload
          className={cn(
            "h-8 w-8 mb-2",
            isDragging ? "text-orange-500" : "text-muted-foreground"
          )}
        />
        <p className="text-sm font-medium">
          {isDragging ? "Drop file here" : "Upload a document"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, TXT, MD, or DOCX (max 10MB)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Content will be used as reference for course generation
        </p>
      </div>
    </div>
  );
}

export type { UploadedDocument };
