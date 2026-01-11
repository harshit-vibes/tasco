"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  Card,
  Input,
  Badge,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Select,
  Switch,
  Separator,
} from "@tasco/ui";
import {
  Database,
  Loader2,
  FileText,
  Search,
  Calendar,
  LayoutGrid,
  List,
  Check,
  X,
  RefreshCw,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  Pencil,
  Save,
  Scale,
  Globe,
} from "@tasco/ui/icons";
import { addNotification } from "@/lib/notifications";
import { DocumentContentViewer } from "@tasco/ui";
import { useTranslation } from "@tasco/i18n";
import { DocumentVersionHistory } from "@/components/document-version-history";

// Special category for law-of-the-land documents (not entity-specific)
const LEGAL_CATEGORY = "_LEGAL";

interface Document {
  id: string;
  name: string;
  filename: string;
  type: string;
  category: string; // '_LEGAL' for law-of-the-land documents
  entityId?: string;
  entity: string;
  entityName?: string;
  effectiveDate: string;
  version: string;
  pages: number;
  tags: string[];
  summary: string;
  syncedToKB?: boolean;
  // Legal-specific fields
  jurisdiction?: string;
  legalType?: string; // Visible type: "Laws & Regulations", "Decrees", etc.
  enactmentDate?: string;
}

// Document Card Component for Legal Framework
interface DocumentCardProps {
  doc: Document;
  legalTypeColors: Record<string, string>;
  onView: (doc: Document) => void;
}

function LegalDocumentCard({ doc, legalTypeColors, onView }: DocumentCardProps) {
  const displayType = doc.legalType || "Laws & Regulations";

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:border-[hsl(45,93%,47%)]/30 transition-all duration-200 overflow-hidden"
      onClick={() => onView(doc)}
    >
      {/* Sync Status Indicator Bar */}
      <div className={`h-1 ${doc.syncedToKB ? "bg-green-500" : "bg-muted"}`} />

      <div className="p-4">
        {/* Header: Legal Type Badge + Sync Status */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className={`text-[10px] font-medium ${legalTypeColors[displayType] || "bg-gray-100 text-gray-700"}`}
          >
            {displayType}
          </Badge>
          {doc.syncedToKB ? (
            <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
              <Database className="h-3 w-3" />
              Synced
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Database className="h-3 w-3" />
              Not synced
            </span>
          )}
        </div>

        {/* Document Title */}
        <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-[hsl(45,93%,47%)] transition-colors line-clamp-2">
          {doc.name}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {doc.summary}
        </p>

        {/* Metadata Row - Legal specific */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {doc.jurisdiction && (
            <>
              <span className="flex items-center gap-1 bg-[hsl(222,47%,11%)]/10 px-1.5 py-0.5 rounded text-[hsl(222,47%,20%)] dark:text-[hsl(210,20%,80%)]">
                <Globe className="h-3 w-3" />
                {doc.jurisdiction}
              </span>
              <span className="text-muted-foreground/50">•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {doc.enactmentDate || doc.effectiveDate}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>{doc.pages}p</span>
          <span className="text-muted-foreground/50">•</span>
          <span>v{doc.version}</span>
        </div>

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-dashed">
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                +{doc.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Wrapper component with Suspense for useSearchParams
export default function LegalFrameworkPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LegalFrameworkContent />
    </Suspense>
  );
}

function LegalFrameworkContent() {
  const { t } = useTranslation("compliance");
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightRef = useRef<HTMLElement>(null);

  // Get URL params for deep linking
  const docIdParam = searchParams.get("doc");
  const highlightParam = searchParams.get("highlight");

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add/Delete document state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [newDocForm, setNewDocForm] = useState({
    name: "",
    legalType: "Laws & Regulations", // Visible type shown in UI
    jurisdiction: "Vietnam",
    summary: "",
    tags: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit document state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    legalType: "Laws & Regulations",
    jurisdiction: "Vietnam",
    summary: "",
  });

  // Handle sync/unsync document
  const handleSyncDocument = async (doc: Document, action: "sync" | "unsync") => {
    setIsSyncing(true);
    const actionLabel = action === "sync" ? "Syncing" : "Removing";
    const toastId = toast.loading(`${actionLabel} "${doc.name}"...`);

    try {
      const response = await fetch("/api/documents/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, action }),
      });
      const data = await response.json();

      if (data.success) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, syncedToKB: action === "sync" } : d
          )
        );
        if (selectedDocument?.id === doc.id) {
          setSelectedDocument({ ...selectedDocument, syncedToKB: action === "sync" });
        }

        if (action === "sync") {
          toast.success(`Document synced to Knowledge Base`, { id: toastId, description: doc.name });
          addNotification({
            id: `document-synced-${Date.now()}`,
            type: "updated",
            category: "document",
            title: doc.name,
            timestamp: new Date(),
            read: false,
          });
        } else {
          toast.success(`Document removed from Knowledge Base`, { id: toastId, description: doc.name });
        }
      } else {
        toast.error(`Failed to ${action} document`, { id: toastId, description: data.error });
      }
    } catch (err) {
      console.error(`[LegalFramework] Error ${action}ing document:`, err);
      toast.error(`Failed to ${action} document`, { id: toastId, description: "Network error" });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newDocForm.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewDocForm((prev) => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  // Handle add document - automatically sets entityId to _LEGAL
  const handleAddDocument = async () => {
    if (!newDocForm.name || !selectedFile) {
      toast.error("Name and file are required");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading legal document...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", newDocForm.name);
      formData.append("category", LEGAL_CATEGORY); // Always _LEGAL for law-of-the-land docs
      formData.append("legalType", newDocForm.legalType); // Visible document type (Laws, Decrees, etc.)
      formData.append("jurisdiction", newDocForm.jurisdiction);
      formData.append("summary", newDocForm.summary || newDocForm.name);
      formData.append("tags", newDocForm.tags);
      formData.append("syncToKB", syncEnabled ? "true" : "false");

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Legal document added successfully", {
          id: toastId,
          description: syncEnabled ? `${newDocForm.name} (synced to KB)` : newDocForm.name,
        });
        addNotification({
          id: `legal-doc-created-${Date.now()}`,
          type: "created",
          category: "document",
          title: newDocForm.name,
          timestamp: new Date(),
          read: false,
        });
        setDocuments((prev) => [...prev, data.document]);
        setShowAddSheet(false);
        setNewDocForm({
          name: "",
          legalType: "Laws & Regulations",
          jurisdiction: "Vietnam",
          summary: "",
          tags: "",
        });
        setSelectedFile(null);
        setSyncEnabled(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error("Failed to add document", { id: toastId, description: data.error });
      }
    } catch (err) {
      console.error("Error adding document:", err);
      toast.error("Failed to add document", { id: toastId, description: "Network error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete document
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${selectedDocument.name}"...`);

    try {
      const response = await fetch(`/api/documents?id=${selectedDocument.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document deleted", { id: toastId, description: selectedDocument.name });
        addNotification({
          id: `document-deleted-${Date.now()}`,
          type: "deleted",
          category: "document",
          title: selectedDocument.name,
          timestamp: new Date(),
          read: false,
        });
        setDocuments((prev) => prev.filter((d) => d.id !== selectedDocument.id));
        setShowDeleteDialog(false);
        handleCloseSidebar();
      } else {
        toast.error("Failed to delete document", { id: toastId, description: data.error });
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document", { id: toastId, description: "Network error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle start editing
  const handleStartEdit = () => {
    if (selectedDocument) {
      setEditForm({
        name: selectedDocument.name,
        legalType: selectedDocument.legalType || "Laws & Regulations",
        jurisdiction: selectedDocument.jurisdiction || "Vietnam",
        summary: selectedDocument.summary,
      });
      setIsEditing(true);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedDocument) return;

    setIsSavingEdit(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDocument.id,
          name: editForm.name,
          legalType: editForm.legalType,
          jurisdiction: editForm.jurisdiction,
          summary: editForm.summary,
          category: LEGAL_CATEGORY, // Keep as _LEGAL
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document updated", { id: toastId });
        setDocuments((prev) =>
          prev.map((d) => (d.id === selectedDocument.id ? { ...d, ...data.document } : d))
        );
        setSelectedDocument({ ...selectedDocument, ...data.document });
        setIsEditing(false);
      } else {
        toast.error("Failed to update document", { id: toastId, description: data.error });
      }
    } catch (err) {
      console.error("Error updating document:", err);
      toast.error("Failed to update document", { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Fetch documents - filter by _LEGAL entityId
  useEffect(() => {
    async function fetchData() {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/documents?_t=${timestamp}`, { cache: "no-store" });
        const data = await response.json();

        if (data.success) {
          // Filter only documents with category = '_LEGAL' (law-of-the-land)
          const legalDocs = data.documents.filter(
            (doc: Document) => doc.category === LEGAL_CATEGORY
          );
          setDocuments(legalDocs);
        }
      } catch (err) {
        console.error("Error fetching legal documents:", err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    fetchData();
  }, []);

  // Fetch document content
  const handleViewDocument = useCallback(async (doc: Document) => {
    setSelectedDocument(doc);
    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/documents?id=${doc.id}`);
      const data = await response.json();
      if (data.success) {
        setDocumentContent(data.document.content);
      }
    } catch (err) {
      console.error("Error fetching document content:", err);
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  // Handle deep link
  useEffect(() => {
    if (docIdParam && documents.length > 0) {
      const doc = documents.find((d) => d.id === docIdParam)
        || documents.find((d) => d.name === docIdParam);
      if (doc && selectedDocument?.id !== doc.id) {
        handleViewDocument(doc);
      }
    }
  }, [docIdParam, documents, selectedDocument?.id, handleViewDocument]);

  // Scroll to highlight
  useEffect(() => {
    if (highlightRef.current && highlightParam && documentContent) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [documentContent, highlightParam]);

  // Close sidebar
  const handleCloseSidebar = useCallback(() => {
    setSelectedDocument(null);
    setDocumentContent(null);
    setIsEditing(false);
    if (docIdParam || highlightParam) {
      router.replace("/legal-framework", { scroll: false });
    }
  }, [docIdParam, highlightParam, router]);

  // Copy link
  const handleCopyLink = useCallback(() => {
    if (!selectedDocument) return;
    const url = new URL(window.location.origin + "/legal-framework");
    url.searchParams.set("doc", selectedDocument.id);
    if (highlightParam) {
      url.searchParams.set("highlight", highlightParam);
    }
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedDocument, highlightParam]);

  // Get document count per legal type
  const legalTypeDocCounts = documents.reduce((acc, doc) => {
    const docType = doc.legalType || "Laws & Regulations";
    acc[docType] = (acc[docType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const docType = doc.legalType || "Laws & Regulations";
    const matchesType = !selectedCategory || docType === selectedCategory;
    return matchesSearch && matchesType;
  });

  // Stats
  const syncedCount = documents.filter((d) => d.syncedToKB).length;

  // Legal-specific categories
  const LEGAL_CATEGORIES = [
    "Laws & Regulations",
    "Decrees",
    "Circulars",
    "Court Decisions",
    "Legal Opinions",
    "Regulatory Guidelines",
  ];

  // Legal type colors
  const legalTypeColors: Record<string, string> = {
    "Laws & Regulations": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Decrees": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "Circulars": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    "Court Decisions": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Legal Opinions": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    "Regulatory Guidelines": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  // Jurisdiction options
  const JURISDICTIONS = [
    "Vietnam",
    "Singapore",
    "Thailand",
    "Indonesia",
    "Malaysia",
    "Philippines",
    "International",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header - Legal Framework themed */}
      <div className="flex items-start justify-between page-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[hsl(222,47%,11%)] flex items-center justify-center">
              <Scale className="h-5 w-5 text-[hsl(45,93%,47%)]" />
            </div>
            <div>
              <h1 className="text-3xl">Legal Framework</h1>
              <p className="text-muted-foreground">
                Laws, regulations, and decrees applicable to all entities
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAddSheet(true)} className="gap-2 btn-gold">
          <Plus className="h-4 w-4" />
          Add Legal Document
        </Button>
      </div>

      {/* Search and Filters - No entity selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search legal documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legal Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center mr-2">Type:</span>
          {LEGAL_CATEGORIES.map((legalType) => {
            const count = legalTypeDocCounts[legalType] || 0;
            return (
              <Button
                key={legalType}
                variant={selectedCategory === legalType ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === legalType ? null : legalType)}
                className={count === 0 ? "opacity-60" : ""}
              >
                {legalType}
                {count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                )}
              </Button>
            );
          })}
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Documents */}
      {isLoadingDocs ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed">
          <div className="h-16 w-16 rounded-2xl bg-[hsl(222,47%,11%)]/10 flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-[hsl(222,47%,20%)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Legal Documents Found</h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            {searchQuery || selectedCategory
              ? "Try adjusting your search or filters"
              : "Add laws, regulations, and decrees that apply across all entities"}
          </p>
          <Button onClick={() => setShowAddSheet(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Document
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <LegalDocumentCard
              key={doc.id}
              doc={doc}
              legalTypeColors={legalTypeColors}
              onView={handleViewDocument}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left font-medium p-3 whitespace-nowrap">Name</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Type</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Jurisdiction</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Effective Date</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Version</th>
                  <th className="text-center font-medium p-3 whitespace-nowrap">Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[hsl(222,47%,11%)]/10 flex items-center justify-center shrink-0">
                          <Scale className="h-4 w-4 text-[hsl(222,47%,20%)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[250px]">{doc.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {doc.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge className={`text-xs ${legalTypeColors[doc.legalType || "Laws & Regulations"] || "bg-gray-100 text-gray-700"}`}>
                        {doc.legalType || "Laws & Regulations"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {doc.jurisdiction || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {doc.enactmentDate || doc.effectiveDate}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {doc.version}
                    </td>
                    <td className="p-3 whitespace-nowrap text-center">
                      {doc.syncedToKB ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground border-t flex justify-between">
            <span>Showing {filteredDocuments.length} of {documents.length} legal documents</span>
            <span>{syncedCount} synced to Knowledge Base</span>
          </div>
        </div>
      )}

      {/* Document Preview Sidebar */}
      <Sheet open={!!selectedDocument} onOpenChange={(open) => !open && handleCloseSidebar()}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
          <SheetHeader className="space-y-1 pb-4 border-b">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-semibold truncate">
                  {selectedDocument?.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1 text-xs">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {selectedDocument?.jurisdiction || "Vietnam"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedDocument?.enactmentDate || selectedDocument?.effectiveDate}
                  </span>
                  <span>•</span>
                  <span>v{selectedDocument?.version}</span>
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 gap-1.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-3 w-3" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {selectedDocument?.syncedToKB ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 text-xs">
                  <Database className="h-2.5 w-2.5" />
                  Synced
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
                  <Database className="h-2.5 w-2.5" />
                  Not Synced
                </Badge>
              )}
              {selectedDocument && (
                <Badge className={`text-xs ${legalTypeColors[selectedDocument.legalType || "Laws & Regulations"] || ""}`}>
                  {selectedDocument.legalType || "Laws & Regulations"}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Highlight indicator */}
          {highlightParam && !isEditing && (
            <div className="px-1 py-2 border-b">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs">
                <span className="font-medium">Highlighted:</span>
                <span className="max-w-[200px] truncate">
                  "{decodeURIComponent(highlightParam)}"
                </span>
              </div>
            </div>
          )}

          {/* Edit Form or Document Content */}
          {isEditing ? (
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4 pr-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-legalType" className="text-sm font-medium">Type</label>
                  <select
                    id="edit-legalType"
                    value={editForm.legalType}
                    onChange={(e) => setEditForm({ ...editForm, legalType: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {LEGAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-jurisdiction" className="text-sm font-medium">Jurisdiction</label>
                  <select
                    id="edit-jurisdiction"
                    value={editForm.jurisdiction}
                    onChange={(e) => setEditForm({ ...editForm, jurisdiction: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {JURISDICTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
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
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedDocument ? (
                <DocumentContentViewer
                  documentId={selectedDocument.id}
                  filename={selectedDocument.filename}
                  textContent={documentContent}
                  highlightText={highlightParam}
                  onHighlightRef={(ref) => {
                    (highlightRef as React.MutableRefObject<HTMLElement | null>).current = ref;
                  }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Unable to load document content
                </p>
              )}
            </div>
          )}

          {/* Version History Section */}
          {!isEditing && selectedDocument && (
            <div className="py-4 border-t">
              <DocumentVersionHistory
                documentKey={`documents/${selectedDocument.id}/${selectedDocument.filename}`}
                documentName={selectedDocument.name}
                onVersionRestored={() => {
                  handleViewDocument(selectedDocument);
                  toast.success("Version restored successfully");
                }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t space-y-2 shrink-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSavingEdit}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={isSavingEdit}>
                  {isSavingEdit ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  {selectedDocument?.syncedToKB ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncDocument(selectedDocument, "unsync")}
                      disabled={isSyncing}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Database className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Remove from KB
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncDocument(selectedDocument!, "sync")}
                      disabled={isSyncing}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Database className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Sync to KB
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Document Sheet - No entity selector, auto-set to _LEGAL */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="space-y-1 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-[hsl(45,93%,47%)]" />
              Add Legal Document
            </SheetTitle>
            <SheetDescription>
              Upload a law, regulation, or decree that applies across all entities.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 py-4">
            <div className="space-y-5 pr-4">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload File *</label>
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    hover:border-[hsl(45,93%,47%)]/50 hover:bg-muted/50 transition-colors
                    ${selectedFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted-foreground/25"}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        TXT, MD, PDF, DOC supported
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Document Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Name *</label>
                <Input
                  placeholder="e.g., Enterprise Law No. 59/2020/QH14"
                  value={newDocForm.name}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={newDocForm.legalType}
                  onChange={(value) => setNewDocForm((prev) => ({ ...prev, legalType: value }))}
                  options={LEGAL_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                />
              </div>

              {/* Jurisdiction */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jurisdiction</label>
                <Select
                  value={newDocForm.jurisdiction}
                  onChange={(value) => setNewDocForm((prev) => ({ ...prev, jurisdiction: value }))}
                  options={JURISDICTIONS.map((j) => ({ value: j, label: j }))}
                />
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Brief description of the legal document"
                  value={newDocForm.summary}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, summary: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., enterprise, corporate, governance"
                  value={newDocForm.tags}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <Separator />

              {/* Sync Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Sync to Knowledge Base</label>
                  <p className="text-xs text-muted-foreground">
                    Enable RAG search for this document
                  </p>
                </div>
                <Switch
                  checked={syncEnabled}
                  onChange={setSyncEnabled}
                />
              </div>

              {/* Info box about _LEGAL */}
              <div className="rounded-lg bg-[hsl(222,47%,11%)]/5 border border-[hsl(222,47%,11%)]/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Documents added here are marked as "law of the land" and apply globally to all Tasco entities. They will not be associated with any specific company.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="pt-4 border-t flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddSheet(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={isUploading || !newDocForm.name || !selectedFile}
              className="btn-gold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Legal Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
              {selectedDocument?.syncedToKB && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400">
                  This document is currently synced to the Knowledge Base. It will also be removed from the KB.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
