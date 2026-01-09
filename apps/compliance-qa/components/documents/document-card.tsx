"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@tasco/ui";
import { FileText, Download, Trash2, MoreVertical, Clock } from "@tasco/ui/icons";

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedAt: Date;
  size: string;
  pages: number;
  status: "processing" | "ready" | "error";
}

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function DocumentCard({
  document,
  onDelete,
  onDownload,
}: DocumentCardProps) {
  const statusColors = {
    processing: "bg-yellow-100 text-yellow-800",
    ready: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };

  const categoryColors: Record<string, string> = {
    "Legal Documents": "bg-blue-100 text-blue-800",
    "Company Charters": "bg-purple-100 text-purple-800",
    "Meeting Minutes": "bg-orange-100 text-orange-800",
    "Internal Policies": "bg-green-100 text-green-800",
    Contracts: "bg-pink-100 text-pink-800",
    "Governance Documents": "bg-indigo-100 text-indigo-800",
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium line-clamp-1">
                {document.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {document.type.toUpperCase()} • {document.size} • {document.pages} pages
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={categoryColors[document.category] || "bg-gray-100 text-gray-800"}
            >
              {document.category}
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[document.status]}
            >
              {document.status === "processing" && (
                <Clock className="mr-1 h-3 w-3 animate-spin" />
              )}
              {document.status}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDownload?.(document.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(document.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Uploaded {document.uploadedAt.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
