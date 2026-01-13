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
  EntitySelector,
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
  type Entity,
} from "@tasco/ui";
import {
  Database,
  Loader2,
  FileText,
  Search,
  Calendar,
  Building2,
  LayoutGrid,
  List,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  Pencil,
  Save,
  CheckCircle,
  Clock,
} from "@tasco/ui/icons";
import { addNotification } from "@/lib/notifications";
import { DocumentContentViewer } from "@tasco/ui";
import { useTranslation } from "@tasco/i18n";
import { DocumentVersionHistory } from "@/components/document-version-history";

// Special category for law-of-the-land documents (shown in Legal Framework page)
const LEGAL_CATEGORY = "_LEGAL";

interface Document {
  id: string;
  name: string;
  filename: string;
  type: string;
  category: string;
  entityId?: string;
  entity: string;
  entityName?: string;
  effectiveDate: string;
  version: string;
  pages: number;
  tags: string[];
  summary: string;
  syncedToKB?: boolean; // Whether document is synced to knowledge base
  reviewStatus?: "pending" | "approved" | "rejected" | "archived"; // Document approval status
}

// Lyzr Knowledge Base URL
const LYZR_KB_URL = process.env.NEXT_PUBLIC_LYZR_KB_URL || "https://studio.lyzr.ai/knowledge-base/6960a63fee18986913060bc0";

// Document Card Component
interface DocumentCardProps {
  doc: Document;
  categoryColors: Record<string, string>;
  onView: (doc: Document) => void;
  showEntity?: boolean;
}

function DocumentCard({ doc, categoryColors, onView, showEntity = true }: DocumentCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden"
      onClick={() => onView(doc)}
    >
      {/* Status Indicator Bar - amber for pending, green for synced */}
      <div className={`h-1 ${
        doc.reviewStatus === "pending"
          ? "bg-amber-400"
          : doc.syncedToKB
            ? "bg-green-500"
            : "bg-muted"
      }`} />

      <div className="p-4">
        {/* Header: Category Badge + Sync Status */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className={`text-[10px] font-medium ${categoryColors[doc.category] || "bg-gray-100 text-gray-700"}`}
          >
            {doc.category}
          </Badge>
          {doc.reviewStatus === "pending" ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          ) : doc.syncedToKB ? (
            <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
              <Database className="h-3 w-3" />
              Synced
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Approved
            </span>
          )}
        </div>

        {/* Document Title */}
        <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {doc.name}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {doc.summary}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {showEntity && (
            <>
              <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                <Building2 className="h-3 w-3" />
                {doc.entity}
              </span>
              <span className="text-muted-foreground/50">•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {doc.effectiveDate}
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
export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <KnowledgeBaseContent />
    </Suspense>
  );
}

function KnowledgeBaseContent() {
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
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [entities, setEntities] = useState<Entity[]>([]);
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
    category: "General",
    entityId: "tasco-group",
    summary: "",
    tags: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit document state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "General",
    entityId: "tasco-group",
    summary: "",
  });

  // Approval state
  const [isApproving, setIsApproving] = useState(false);

  // Handle sync/unsync document
  const handleSyncDocument = async (doc: Document, action: "sync" | "unsync") => {
    setIsSyncing(true);
    const actionLabel = action === "sync" ? "Syncing" : "Removing";

    // Show loading toast
    const toastId = toast.loading(`${actionLabel} "${doc.name}"...`);

    try {
      const response = await fetch("/api/documents/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, action }),
      });
      const data = await response.json();

      if (data.success) {
        // Update document in state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, syncedToKB: action === "sync" } : d
          )
        );
        // Update selected document if open
        if (selectedDocument?.id === doc.id) {
          setSelectedDocument({ ...selectedDocument, syncedToKB: action === "sync" });
        }

        // Show success toast and add notification
        if (action === "sync") {
          toast.success(`Document synced to Knowledge Base`, {
            id: toastId,
            description: doc.name,
          });
          addNotification({
            id: `document-synced-${Date.now()}`,
            type: "updated",
            category: "document",
            title: doc.name,
            timestamp: new Date(),
            read: false,
          });
        } else {
          toast.success(`Document removed from Knowledge Base`, {
            id: toastId,
            description: doc.name,
          });
          addNotification({
            id: `document-unsynced-${Date.now()}`,
            type: "updated",
            category: "document",
            title: `${doc.name} (unsynced)`,
            timestamp: new Date(),
            read: false,
          });
        }
      } else {
        toast.error(`Failed to ${action} document`, {
          id: toastId,
          description: data.error || "Unknown error",
        });
      }
    } catch (err) {
      console.error(`[KnowledgeBase] Error ${action}ing document:`, err);
      toast.error(`Failed to ${action} document`, {
        id: toastId,
        description: "Network error. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle document approval
  const handleApproveDocument = async (doc: Document) => {
    setIsApproving(true);
    const toastId = toast.loading(`Approving "${doc.name}"...`);

    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc.id,
          reviewStatus: "approved",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, reviewStatus: "approved" } : d
          )
        );
        // Update selected document
        if (selectedDocument?.id === doc.id) {
          setSelectedDocument({ ...selectedDocument, reviewStatus: "approved" });
        }

        toast.success("Document approved", {
          id: toastId,
          description: doc.name,
        });

        // Add audit notification
        addNotification({
          id: `document-approved-${Date.now()}`,
          type: "updated",
          category: "document",
          title: `${doc.name} (approved)`,
          timestamp: new Date(),
          read: false,
        });
      } else {
        toast.error("Failed to approve document", {
          id: toastId,
          description: data.error,
        });
      }
    } catch (err) {
      console.error("Error approving document:", err);
      toast.error("Failed to approve document", { id: toastId });
    } finally {
      setIsApproving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename if empty
      if (!newDocForm.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewDocForm((prev) => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  // Handle add document
  const handleAddDocument = async () => {
    if (!newDocForm.name || !selectedFile) {
      toast.error("Name and file are required");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading document...");

    try {
      // Use FormData for proper binary file handling (PDFs, etc.)
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", newDocForm.name);
      formData.append("category", newDocForm.category);
      formData.append("entityId", newDocForm.entityId);
      formData.append("summary", newDocForm.summary || newDocForm.name);
      formData.append("tags", newDocForm.tags);
      formData.append("syncToKB", syncEnabled ? "true" : "false");

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document added successfully", {
          id: toastId,
          description: syncEnabled ? `${newDocForm.name} (synced to KB)` : newDocForm.name,
        });
        // Add notification
        addNotification({
          id: `document-created-${Date.now()}`,
          type: "created",
          category: "document",
          title: newDocForm.name,
          timestamp: new Date(),
          read: false,
        });
        // Add to local state
        setDocuments((prev) => [...prev, data.document]);
        setShowAddSheet(false);
        // Reset form
        setNewDocForm({
          name: "",
          category: "General",
          entityId: "tasco-group",
          summary: "",
          tags: "",
        });
        setSelectedFile(null);
        setSyncEnabled(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error("Failed to add document", {
          id: toastId,
          description: data.error,
        });
      }
    } catch (err) {
      console.error("Error adding document:", err);
      toast.error("Failed to add document", {
        id: toastId,
        description: "Network error",
      });
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
        toast.success("Document deleted", {
          id: toastId,
          description: selectedDocument.name,
        });
        // Add notification
        addNotification({
          id: `document-deleted-${Date.now()}`,
          type: "deleted",
          category: "document",
          title: selectedDocument.name,
          timestamp: new Date(),
          read: false,
        });
        // Remove from local state
        setDocuments((prev) => prev.filter((d) => d.id !== selectedDocument.id));
        setShowDeleteDialog(false);
        handleCloseSidebar();
      } else {
        toast.error("Failed to delete document", {
          id: toastId,
          description: data.error,
        });
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document", {
        id: toastId,
        description: "Network error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle start editing
  const handleStartEdit = () => {
    if (selectedDocument) {
      setEditForm({
        name: selectedDocument.name,
        category: selectedDocument.category,
        entityId: selectedDocument.entityId || "tasco-group",
        summary: selectedDocument.summary,
      });
      setIsEditing(true);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
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
          ...editForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document updated", { id: toastId });
        // Update in local state
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

  // Fetch documents and entities
  useEffect(() => {
    async function fetchData() {
      try {
        // Add timestamp to bust any caching
        const timestamp = Date.now();
        const [docsResponse, entitiesResponse] = await Promise.all([
          fetch(`/api/documents?_t=${timestamp}`, { cache: "no-store" }),
          fetch(`/api/entities?_t=${timestamp}`, { cache: "no-store" }),
        ]);

        const docsData = await docsResponse.json();
        const entitiesData = await entitiesResponse.json();

        console.log("[KnowledgeBase] Fetched documents:", docsData.documents?.map((d: Document) => ({ id: d.id, syncedToKB: d.syncedToKB })));

        if (docsData.success) {
          // Filter out _LEGAL category docs - they are shown in Legal Framework page
          const internalDocs = docsData.documents.filter(
            (doc: Document) => doc.category !== LEGAL_CATEGORY
          );
          setDocuments(internalDocs);
        }

        if (entitiesData.success) {
          const fetchedEntities = entitiesData.entities || [];
          setEntities(fetchedEntities);
          setSelectedEntityIds(fetchedEntities.map((e: Entity) => e.id));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
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

  // Handle deep link from URL params (e.g., from citation click)
  useEffect(() => {
    console.log("[KB Deep Link] docIdParam:", docIdParam, "documents count:", documents.length);
    if (docIdParam && documents.length > 0) {
      // Find by ID first, then by name (for backward compatibility with old citations)
      const doc = documents.find((d) => d.id === docIdParam)
        || documents.find((d) => d.name === docIdParam)
        || documents.find((d) => d.name.toLowerCase() === docIdParam.toLowerCase());
      console.log("[KB Deep Link] Found doc:", doc?.name || "NOT FOUND");
      if (doc && selectedDocument?.id !== doc.id) {
        console.log("[KB Deep Link] Opening document sidebar");
        handleViewDocument(doc);
      }
    }
  }, [docIdParam, documents, selectedDocument?.id, handleViewDocument]);

  // Scroll to highlight after content loads
  useEffect(() => {
    if (highlightRef.current && highlightParam && documentContent) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [documentContent, highlightParam]);

  // Close sidebar and clear URL params
  const handleCloseSidebar = useCallback(() => {
    setSelectedDocument(null);
    setDocumentContent(null);
    setIsEditing(false);
    // Clear URL params
    if (docIdParam || highlightParam) {
      router.replace("/knowledge-base", { scroll: false });
    }
  }, [docIdParam, highlightParam, router]);

  // Copy shareable link with highlight
  const handleCopyLink = useCallback(() => {
    if (!selectedDocument) return;
    const url = new URL(window.location.origin + "/knowledge-base");
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

  // Render content with highlighting
  const renderContentWithHighlight = useCallback(() => {
    if (!documentContent) return null;

    if (highlightParam) {
      const decodedText = decodeURIComponent(highlightParam);
      const index = documentContent.toLowerCase().indexOf(decodedText.toLowerCase());

      if (index !== -1) {
        const before = documentContent.slice(0, index);
        const match = documentContent.slice(index, index + decodedText.length);
        const after = documentContent.slice(index + decodedText.length);

        return (
          <>
            <span className="whitespace-pre-wrap">{before}</span>
            <mark
              ref={highlightRef as React.RefObject<HTMLElement>}
              className="bg-yellow-300 dark:bg-yellow-600/50 px-0.5 rounded scroll-mt-32"
            >
              {match}
            </mark>
            <span className="whitespace-pre-wrap">{after}</span>
          </>
        );
      }
    }

    return <span className="whitespace-pre-wrap">{documentContent}</span>;
  }, [documentContent, highlightParam]);

  // Get document count per category
  const categoryDocCounts = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;

    // Entity matching: if all entities selected (or none), show all docs
    // Otherwise check if document's entity is in the selected list
    const allEntitiesSelected = selectedEntityIds.length === entities.length || selectedEntityIds.length === 0;
    const matchesEntity = allEntitiesSelected ||
      selectedEntityIds.includes(doc.entityId || "") ||
      selectedEntityIds.some(id => {
        const entity = entities.find(e => e.id === id);
        return entity?.name === doc.entity || entity?.shortName === doc.entity;
      });

    return matchesSearch && matchesCategory && matchesEntity;
  });

  // Stats
  const syncedCount = documents.filter((d) => d.syncedToKB).length;

  // Get unique categories from actual documents (only show categories that have docs)
  const availableCategories = [...new Set(documents.map((doc) => doc.category))].sort();

  // Category colors for internal/entity-specific documents
  // (Law-of-the-land categories are in Legal Framework page)
  const categoryColors: Record<string, string> = {
    // Company documents
    "Internal Policies": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Legal Documents": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Company Charters": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Meeting Minutes": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Contracts": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "Governance Documents": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    // Financial report categories
    "Annual Reports": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Quarterly Reports": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "Board Resolutions": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-3xl">{t("knowledgeBase.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("knowledgeBase.description")}
          </p>
        </div>
        {/* Add Document Button */}
        <Button onClick={() => setShowAddSheet(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("knowledgeBase.uploadDocument")}
        </Button>
      </div>

      {/* Search, Filters, and View Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Entity Filter */}
          <EntitySelector
            entities={entities}
            mode="multi"
            selectedEntityIds={selectedEntityIds}
            onEntitiesChange={setSelectedEntityIds}
            allowAll={true}
            allLabel="All Companies"
            placeholder="Select entities..."
            showHierarchy={true}
            className="w-[280px]"
          />
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
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
        {/* Category Filter - clicking selected category again deselects it (shows all) */}
        {availableCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground self-center mr-2">Category:</span>
            {availableCategories.map((category) => {
              const count = categoryDocCounts[category] || 0;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  {category}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
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
        )}
      </div>

      {/* Documents */}
      {isLoadingDocs ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery || selectedCategory
              ? "Try adjusting your search or filters"
              : "No compliance documents available"}
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid/Card View with Entity Sections */
        (() => {
          // Group documents by entity
          const groupedDocs = filteredDocuments.reduce((acc, doc) => {
            const entityKey = doc.entity || "Unknown";
            if (!acc[entityKey]) acc[entityKey] = [];
            acc[entityKey].push(doc);
            return acc;
          }, {} as Record<string, Document[]>);

          const entityGroups = Object.entries(groupedDocs);
          const hasMultipleEntities = entityGroups.length > 1;

          // Show sections when documents span multiple entities
          if (hasMultipleEntities) {
            return (
              <div className="space-y-8">
                {entityGroups.map(([entityName, docs], index) => (
                  <div key={entityName}>
                    {/* Horizontal Separator (except for first section) */}
                    {index > 0 && (
                      <hr className="border-border mb-8" />
                    )}
                    {/* Entity Section Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{entityName}</h2>
                        <p className="text-xs text-muted-foreground">{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {docs.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          doc={doc}
                          categoryColors={categoryColors}
                          onView={handleViewDocument}
                          showEntity={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          // Single entity: flat grid without sections
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  categoryColors={categoryColors}
                  onView={handleViewDocument}
                  showEntity={false}
                />
              ))}
            </div>
          );
        })()
      ) : (
        /* List/Table View */
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left font-medium p-3 whitespace-nowrap">Name</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Category</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Entity</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Effective Date</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Version</th>
                  <th className="text-left font-medium p-3 whitespace-nowrap">Pages</th>
                  <th className="text-center font-medium p-3 whitespace-nowrap">Synced to KB</th>
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
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                      <Badge className={`text-xs ${categoryColors[doc.category] || "bg-gray-100 text-gray-700"}`}>
                        {doc.category}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {doc.entity}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {doc.effectiveDate}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {doc.version}
                    </td>
                    <td className="p-3 text-muted-foreground text-center whitespace-nowrap">
                      {doc.pages}
                    </td>
                    <td className="p-3 whitespace-nowrap text-center">
                      {doc.syncedToKB ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <X className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground border-t flex justify-between">
            <span>Showing {filteredDocuments.length} of {documents.length} documents</span>
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
                    <Building2 className="h-3 w-3" />
                    {selectedDocument?.entity}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedDocument?.effectiveDate}
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
              {/* Review Status Badge */}
              {selectedDocument?.reviewStatus === "pending" ? (
                <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
                  <Clock className="h-2.5 w-2.5" />
                  Pending Approval
                </Badge>
              ) : (
                <Badge className="gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Approved
                </Badge>
              )}
              {/* Sync Status Badge */}
              {selectedDocument?.syncedToKB ? (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1 text-xs">
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
                <Badge className={`text-xs ${categoryColors[selectedDocument.category] || ""}`}>
                  {selectedDocument.category}
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
                  <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                  <select
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Object.keys(categoryColors).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="General">General</option>
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
                  // Refresh document content after version restore
                  handleViewDocument(selectedDocument);
                  toast.success("Version restored successfully");
                  addNotification({
                    id: `version-restored-${Date.now()}`,
                    type: "updated",
                    category: "document",
                    title: `${selectedDocument.name} (version restored)`,
                    timestamp: new Date(),
                    read: false,
                  });
                }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t space-y-2 shrink-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSavingEdit}
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  {/* Approve Button - Only show if pending */}
                  {selectedDocument?.reviewStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveDocument(selectedDocument)}
                      disabled={isApproving}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      {isApproving ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Approve
                    </Button>
                  )}
                  {/* Sync/Unsync Buttons - Only available for approved documents */}
                  {selectedDocument?.reviewStatus !== "pending" && (
                    selectedDocument?.syncedToKB ? (
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
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        {isSyncing ? (
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Database className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Sync to KB
                      </Button>
                    )
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

      {/* Add Document Sheet (Right Sidebar) */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="space-y-1 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add New Document
            </SheetTitle>
            <SheetDescription>
              Upload a compliance document to the knowledge base.
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
                    hover:border-primary/50 hover:bg-muted/50 transition-colors
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
                  placeholder="e.g., Travel & Expense Policy"
                  value={newDocForm.name}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Entity Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Entity</label>
                <EntitySelector
                  entities={entities}
                  mode="single"
                  selectedEntityId={newDocForm.entityId}
                  onEntityChange={(entityId) =>
                    setNewDocForm((prev) => ({ ...prev, entityId: entityId || "tasco-group" }))
                  }
                  placeholder="Select entity..."
                  showHierarchy={true}
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newDocForm.category}
                  onChange={(value) => setNewDocForm((prev) => ({ ...prev, category: value }))}
                  options={[
                    { value: "General", label: "General" },
                    // Company documents
                    { value: "Internal Policies", label: "Internal Policies" },
                    { value: "Legal Documents", label: "Legal Documents" },
                    { value: "Company Charters", label: "Company Charters" },
                    { value: "Meeting Minutes", label: "Meeting Minutes" },
                    { value: "Contracts", label: "Contracts" },
                    { value: "Governance Documents", label: "Governance Documents" },
                    // Financial reports
                    { value: "Annual Reports", label: "Annual Reports" },
                    { value: "Quarterly Reports", label: "Quarterly Reports" },
                    { value: "Board Resolutions", label: "Board Resolutions" },
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  For law-of-the-land documents, use the Legal Framework page.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Brief description of the document"
                  value={newDocForm.summary}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, summary: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., compliance, policy, travel"
                  value={newDocForm.tags}
                  onChange={(e) => setNewDocForm((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <Separator />

              {/* Approval Workflow Info */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Pending Approval
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    New documents require approval before they can be synced to the Knowledge Base.
                  </p>
                </div>
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
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
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
