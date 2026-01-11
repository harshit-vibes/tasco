"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./sheet";
import { Button } from "./button";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { Input } from "./input";
import { EntitySelector, type Entity } from "./entity-selector";
import {
  FileText,
  Building2,
  Calendar,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Download,
  AlertCircle,
  Pencil,
  X,
  Save,
} from "lucide-react";

// Dynamically import PDF viewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import("./pdf-viewer").then((m) => ({ default: m.PDFViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// Default categories
const DEFAULT_CATEGORIES = [
  "Internal Policies",
  "Legal Documents",
  "Company Charters",
  "Meeting Minutes",
  "Contracts",
  "Governance Documents",
  "General",
];

// Default category badge colors
const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  "Internal Policies": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Legal Documents": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Company Charters": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Meeting Minutes": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Contracts": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "Governance Documents": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export interface DocumentPreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  documentName: string | null;
  onDocumentUpdated?: () => void;
  /** Callback for toast notifications */
  onToast?: (message: string, type: "success" | "error") => void;
  /** API path for documents endpoint. Default: "/api/documents" */
  documentsApiPath?: string;
  /** API path for entities endpoint. Default: "/api/entities" */
  entitiesApiPath?: string;
  /** API path for file endpoint. Default: "/api/documents/file" */
  fileApiPath?: string;
  /** API path for PDF proxy endpoint. Default: "/api/documents/pdf" */
  pdfApiPath?: string;
  /** Path to knowledge base page. Default: "/knowledge-base" */
  knowledgeBasePath?: string;
  /** List of available categories */
  categories?: string[];
  /** Category color mapping (CSS classes) */
  categoryColors?: Record<string, string>;
}

interface Document {
  id: string;
  name: string;
  filename: string;
  category: string;
  entity: string;
  entityId?: string;
  effectiveDate: string;
  version: string;
  pages: number;
  summary: string;
  content?: string;
}

interface FileInfo {
  url: string;
  mimeType: string;
  extension: string;
  base64?: string;
}

// Detect file type from extension
function getFileType(filename: string): "pdf" | "docx" | "doc" | "markdown" | "text" | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "txt") return "text";
  return "unknown";
}

export function DocumentPreviewSheet({
  open,
  onOpenChange,
  documentId,
  documentName,
  onDocumentUpdated,
  onToast,
  documentsApiPath = "/api/documents",
  entitiesApiPath = "/api/entities",
  fileApiPath = "/api/documents/file",
  pdfApiPath = "/api/documents/pdf",
  knowledgeBasePath = "/knowledge-base",
  categories = DEFAULT_CATEGORIES,
  categoryColors = DEFAULT_CATEGORY_COLORS,
}: DocumentPreviewSheetProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    entityId: "",
    summary: "",
  });

  // Toast helper
  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (onToast) {
      onToast(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }, [onToast]);

  // Reset edit mode when sheet closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  // Fetch entities for the selector
  useEffect(() => {
    if (!open) return;

    async function fetchEntities() {
      try {
        const response = await fetch(entitiesApiPath);
        const data = await response.json();
        if (data.success) {
          setEntities(data.entities || []);
        }
      } catch (err) {
        console.error("Error fetching entities:", err);
      }
    }

    fetchEntities();
  }, [open, entitiesApiPath]);

  // Fetch file URL and content for binary files
  const fetchFileInfo = useCallback(async (docId: string, fileType: string) => {
    setIsLoadingFile(true);
    try {
      // For PDFs, get signed URL
      if (fileType === "pdf") {
        const response = await fetch(`${fileApiPath}?id=${encodeURIComponent(docId)}&format=url`);
        const data = await response.json();
        if (data.success) {
          setFileInfo({
            url: data.document.url,
            mimeType: data.document.mimeType,
            extension: data.document.extension,
          });
        }
      }

      // For DOCX, get base64 and convert with mammoth
      if (fileType === "docx" || fileType === "doc") {
        const response = await fetch(`${fileApiPath}?id=${encodeURIComponent(docId)}&format=base64`);
        const data = await response.json();
        if (data.success && data.document.base64) {
          // Convert base64 to array buffer for mammoth
          const binaryString = atob(data.document.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Import mammoth dynamically
          const mammoth = await import("mammoth");
          const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
          setDocxHtml(result.value);
          setFileInfo({
            url: "",
            mimeType: data.document.mimeType,
            extension: data.document.extension,
            base64: data.document.base64,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching file info:", err);
    } finally {
      setIsLoadingFile(false);
    }
  }, [fileApiPath]);

  // Fetch document metadata
  useEffect(() => {
    if (!open || !documentId) {
      setDocument(null);
      setFileInfo(null);
      setDocxHtml(null);
      setError(null);
      setIsEditing(false);
      return;
    }

    async function fetchDocument() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch document metadata
        let response = await fetch(`${documentsApiPath}?id=${encodeURIComponent(documentId!)}`);
        let data = await response.json();

        // If not found by ID, try by name
        if (!data.success && documentName) {
          response = await fetch(`${documentsApiPath}?id=${encodeURIComponent(documentName)}`);
          data = await response.json();
        }

        if (data.success && data.document) {
          setDocument(data.document);

          // Fetch file info for rendering
          const fileType = getFileType(data.document.filename);
          if (fileType === "pdf" || fileType === "docx" || fileType === "doc") {
            await fetchFileInfo(documentId!, fileType);
          }
        } else {
          setError(data.error || "Document not found");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocument();
  }, [open, documentId, documentName, documentsApiPath, fetchFileInfo]);

  // Copy link
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + knowledgeBasePath);
    if (documentId) url.searchParams.set("doc", documentId);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [documentId, knowledgeBasePath]);

  // Open in Knowledge Base
  const handleOpenInKB = useCallback(() => {
    const url = new URL(window.location.origin + knowledgeBasePath);
    if (documentId) url.searchParams.set("doc", documentId);
    window.open(url.toString(), "_blank");
  }, [documentId, knowledgeBasePath]);

  // Download document
  const handleDownload = useCallback(() => {
    if (fileInfo?.url) {
      window.open(fileInfo.url, "_blank");
    }
  }, [fileInfo]);

  // Start editing
  const handleStartEdit = useCallback(() => {
    if (document) {
      setEditForm({
        name: document.name,
        category: document.category,
        entityId: document.entityId || "tasco-group",
        summary: document.summary,
      });
      setIsEditing(true);
    }
  }, [document]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Save edits
  const handleSaveEdit = useCallback(async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      const response = await fetch(documentsApiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: document.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDocument(data.document);
        setIsEditing(false);
        showToast("Document updated", "success");
        onDocumentUpdated?.();
      } else {
        showToast(data.error || "Failed to update document", "error");
      }
    } catch (err) {
      console.error("Error updating document:", err);
      showToast("Failed to update document", "error");
    } finally {
      setIsSaving(false);
    }
  }, [document, editForm, onDocumentUpdated, documentsApiPath, showToast]);

  // Render document content based on type
  const renderContent = () => {
    if (!document) return null;

    const fileType = getFileType(document.filename);

    // PDF Viewer - use proxy URL for proper rendering
    if (fileType === "pdf") {
      const proxyUrl = `${pdfApiPath}?id=${encodeURIComponent(document.id)}`;
      return <PDFViewer url={proxyUrl} />;
    }

    // DOCX Viewer (converted to HTML)
    if (fileType === "docx" || fileType === "doc") {
      if (isLoadingFile) {
        return (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Converting document...</span>
          </div>
        );
      }
      if (docxHtml) {
        return (
          <div
            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: docxHtml }}
          />
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Unable to convert Word document</p>
        </div>
      );
    }

    // Markdown/Text content
    if (document.content) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90">
          <ReactMarkdown>{document.content}</ReactMarkdown>
        </div>
      );
    }

    return <p className="text-muted-foreground italic">No content available</p>;
  };

  const fileType = document ? getFileType(document.filename) : "unknown";
  const isPdf = fileType === "pdf";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 pb-3 border-b space-y-1 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <SheetTitle className="text-base font-semibold truncate">
                {document?.name || documentName || "Document Preview"}
              </SheetTitle>
            </div>
            {document && (
              <Badge className={`text-xs shrink-0 ${categoryColors[document.category] || "bg-gray-100"}`}>
                {document.category}
              </Badge>
            )}
          </div>
          {document && !isEditing && (
            <SheetDescription className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {document.entity}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {document.effectiveDate}
              </span>
              <span>v{document.version}</span>
              {document.filename && (
                <Badge variant="outline" className="text-xs">
                  {document.filename.split(".").pop()?.toUpperCase()}
                </Badge>
              )}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : isEditing && document ? (
            // Edit Form
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                  <select
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entity</label>
                  <EntitySelector
                    entities={entities}
                    mode="single"
                    selectedEntityId={editForm.entityId}
                    onEntityChange={(entityId) =>
                      setEditForm({ ...editForm, entityId: entityId || "tasco-group" })
                    }
                    placeholder="Select entity..."
                    showHierarchy={true}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-summary" className="text-sm font-medium">Summary</label>
                  <textarea
                    id="edit-summary"
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </ScrollArea>
          ) : document ? (
            // Document Content - PDF takes full height
            isPdf ? (
              <div className="flex-1 flex flex-col">
                {renderContent()}
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {document.summary && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="text-muted-foreground">
                        <strong>Summary:</strong> {document.summary}
                      </p>
                    </div>
                  )}
                  <div className="border rounded-lg bg-muted/20 overflow-hidden">
                    <div className="px-3 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Document Content
                    </div>
                    <div className="p-4">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex items-center gap-2 bg-muted/30 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-1.5"
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="gap-1.5"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="gap-1.5"
                disabled={!document}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              {fileInfo?.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInKB}
                className="gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in KB
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
