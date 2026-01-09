"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  EntitySelector,
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
} from "@tasco/ui/icons";

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
}

// Lyzr Knowledge Base URL
const LYZR_KB_URL = process.env.NEXT_PUBLIC_LYZR_KB_URL || "https://studio.lyzr.ai/knowledge-base/6960a63fee18986913060bc0";

export default function KnowledgeBasePage() {
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

  // Handle sync/unsync document
  const handleSyncDocument = async (doc: Document, action: "sync" | "unsync") => {
    setIsSyncing(true);
    console.log(`[KnowledgeBase] ${action}ing document:`, doc.id);
    try {
      const response = await fetch("/api/documents/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, action }),
      });
      const data = await response.json();
      console.log(`[KnowledgeBase] Sync response:`, data);
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
        console.log(`[KnowledgeBase] Document ${doc.id} ${action}ed successfully`);
      } else {
        console.error(`[KnowledgeBase] Sync failed:`, data.error);
      }
    } catch (err) {
      console.error(`[KnowledgeBase] Error ${action}ing document:`, err);
    } finally {
      setIsSyncing(false);
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
          // Documents already have syncedToKB from the API/S3 data
          setDocuments(docsData.documents);
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
  const handleViewDocument = async (doc: Document) => {
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
  };

  // Get unique categories
  const categories = [...new Set(documents.map((d) => d.category))];

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

  // Category colors
  const categoryColors: Record<string, string> = {
    "Internal Policies": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Legal Documents": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Company Charters": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Meeting Minutes": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Contracts": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "Governance Documents": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-muted-foreground">
            Manage compliance documents for Tasco Group
          </p>
        </div>
        {/* KB Status Card - Link to Lyzr Studio */}
        <a
          href={LYZR_KB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="px-4 py-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium flex items-center gap-1.5">
                Tasco Compliance KB
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </p>
              <p className="text-xs text-muted-foreground">
                {syncedCount} of {documents.length} documents synced
              </p>
            </div>
          </Card>
        </a>
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
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center mr-2">Category:</span>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Button>
          ))}
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
        /* Grid/Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDocument(doc)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Synced to KB Badge */}
                    {doc.syncedToKB ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                        <Database className="h-3 w-3" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <Database className="h-3 w-3" />
                        Not Synced
                      </Badge>
                    )}
                    <Badge
                      className={categoryColors[doc.category] || "bg-gray-100 text-gray-700"}
                    >
                      {doc.category}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {doc.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {doc.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1" title={`Entity ID: ${doc.entityId}`}>
                    <Building2 className="h-3.5 w-3.5" />
                    {doc.entity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {doc.effectiveDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {doc.pages} pages
                  </span>
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 4 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{doc.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
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

      {/* Document Preview Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>{selectedDocument?.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedDocument?.entity} • Version {selectedDocument?.version}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedDocument?.syncedToKB ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                    <Database className="h-3 w-3" />
                    Synced to KB
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <Database className="h-3 w-3" />
                    Not Synced
                  </Badge>
                )}
                {selectedDocument && (
                  <Badge className={categoryColors[selectedDocument.category] || ""}>
                    {selectedDocument.category}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documentContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {documentContent}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Unable to load document content
              </p>
            )}
          </ScrollArea>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between">
            <div>
              {selectedDocument?.syncedToKB ? (
                <Button
                  variant="outline"
                  onClick={() => handleSyncDocument(selectedDocument, "unsync")}
                  disabled={isSyncing}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Remove from KB
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleSyncDocument(selectedDocument!, "sync")}
                  disabled={isSyncing}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Sync to KB
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
