"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
} from "@tasco/ui";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "@tasco/ui/icons";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  category?: string;
  error?: string;
}

const categories = [
  "Legal Documents",
  "Company Charters",
  "Meeting Minutes",
  "Internal Policies",
  "Contracts",
  "Governance Documents",
];

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileCategory = (id: string, category: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, category } : f))
    );
  };

  const simulateUpload = async (uploadFile: UploadedFile) => {
    // Update to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" } : f
      )
    );

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
      );
    }

    // Update to processing
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "processing" } : f
      )
    );

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update to complete
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "complete" } : f
      )
    );
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    for (const file of pendingFiles) {
      await simulateUpload(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload PDF and DOCX files to add to the knowledge base
        </p>
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Drag and drop files here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <Input
            type="file"
            accept=".pdf,.docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Supported formats: PDF, DOCX
          </p>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Files ({files.length})
            </h2>
            <Button
              onClick={uploadAllFiles}
              disabled={!files.some((f) => f.status === "pending")}
            >
              Upload All
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((uploadFile) => (
              <Card key={uploadFile.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>

                  {/* Category Selector */}
                  {uploadFile.status === "pending" && (
                    <select
                      className="text-sm border rounded-md px-2 py-1"
                      value={uploadFile.category || ""}
                      onChange={(e) =>
                        updateFileCategory(uploadFile.id, e.target.value)
                      }
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {uploadFile.status === "pending" && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    {uploadFile.status === "uploading" && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{uploadFile.progress}%</span>
                      </div>
                    )}
                    {uploadFile.status === "processing" && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    {uploadFile.status === "complete" && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Badge>
                    )}
                    {uploadFile.status === "error" && (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  {uploadFile.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
