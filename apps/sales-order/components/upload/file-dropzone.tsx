"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import { Card, Button, Badge } from "@tasco/ui";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "@tasco/ui/icons";
import { cn } from "@tasco/ui";
import { useTranslation } from "@tasco/i18n";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
  extractedData?: any;
}

interface FileDropzoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

export function FileDropzone({
  onFilesUploaded,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    "application/pdf": [".pdf"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
  },
}: FileDropzoneProps) {
  const { t } = useTranslation("app");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: "uploading" as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload and processing
      newFiles.forEach((uploadedFile) => {
        simulateUploadAndProcess(uploadedFile);
      });
    },
    [onFilesUploaded]
  );

  const simulateUploadAndProcess = async (uploadedFile: UploadedFile) => {
    try {
      // Upload file to S3 via API
      const formData = new FormData();
      formData.append("file", uploadedFile.file);
      formData.append("entityId", "inochi");
      formData.append("userId", "user"); // TODO: Get from auth

      // Simulate upload progress (FormData upload doesn't support progress tracking easily)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 20;
        if (progress <= 100) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }
      }, 200);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const { orderId, sourceUrl, fileName, fileSize, sourceType } =
        uploadData.data;

      // Update to processing state
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, status: "processing", progress: 100 } : f
        )
      );

      // TODO: Optionally trigger OCR and extraction here
      // For now, we'll just mark as complete since extraction happens automatically
      // const extractResponse = await fetch("/api/extract", {...})

      // Simulate a small delay for processing state visibility
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update to complete
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "complete" as const,
                extractedData: {
                  orderId,
                  sourceUrl,
                  fileName,
                  fileSize,
                  sourceType,
                },
              }
            : f
        );

        // Notify parent of completed uploads
        const completedFiles = updated.filter((f) => f.status === "complete");
        if (completedFiles.length > 0) {
          onFilesUploaded(completedFiles);
        }

        return updated;
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Update to error state
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error" as const,
                error:
                  error instanceof Error
                    ? error.message
                    : "Upload failed. Please try again.",
              }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (file.type.startsWith("image/")) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-orange-500" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return t("upload.dropzone.uploading", "Uploading...");
      case "processing":
        return t("upload.dropzone.processing", "Processing with AI...");
      case "complete":
        return t("common.success", "Complete");
      case "error":
        return t("common.error", "Error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragActive ? "bg-primary/10" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div>
            <p className="text-lg font-medium">
              {t("upload.dropzone.title", "Drop files here or click to upload")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "upload.dropzone.description",
                "Supports PDF, PNG, JPG, JPEG (max 10MB)"
              )}
            </p>
          </div>

          <Button type="button" variant="secondary" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t("upload.dropzone.title", "Select Files")}
          </Button>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("upload.recentUploads", "Recent Uploads")} ({files.length})
          </h3>

          <div className="grid gap-3">
            {files.map((uploadedFile) => (
              <Card
                key={uploadedFile.id}
                className="flex items-center gap-4 p-4"
              >
                {/* File icon or preview */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    getFileIcon(uploadedFile.file)
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>

                  {/* Progress bar */}
                  {uploadedFile.status === "uploading" && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      uploadedFile.status === "complete"
                        ? "default"
                        : uploadedFile.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(uploadedFile.status)}
                    <span className="text-xs">
                      {getStatusText(uploadedFile.status)}
                    </span>
                  </Badge>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
