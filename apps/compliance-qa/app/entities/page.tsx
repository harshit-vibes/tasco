"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { addNotification } from "@/lib/notifications";
import {
  Card,
  Input,
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  ScrollArea,
  Select,
  Textarea,
  Separator,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  EntitySelector,
  type Entity as EntityType,
} from "@tasco/ui";
import {
  Search,
  Building2,
  Building,
  MapPin,
  Users,
  Loader2,
  ChevronRight,
  ChevronDown,
  Plus,
  Save,
  Trash2,
  Calendar,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

// Entity type definition (matches @tasco/db/entities)
interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: "parent" | "holding" | "subsidiary";
  parentId?: string;
  metadata?: {
    location?: string;
    employeeCount?: number;
    industry?: string;
    comments?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Tree node with children
interface EntityNode extends Entity {
  children: EntityNode[];
}

// Entity types for selection
const ENTITY_TYPES = [
  { value: "holding", label: "Holding Company" },
  { value: "subsidiary", label: "Subsidiary" },
];

// Initial form state
const initialFormState = {
  name: "",
  shortName: "",
  type: "subsidiary" as "parent" | "holding" | "subsidiary",
  parentId: "",
  location: "",
  employeeCount: "",
  industry: "",
  comments: "",
};

export default function EntitiesPage() {
  const { t } = useTranslation("compliance");
  const [searchQuery, setSearchQuery] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Sheet state
  const [showEntitySheet, setShowEntitySheet] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isNewEntity, setIsNewEntity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  // Fetch entities from API
  useEffect(() => {
    async function fetchEntities() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/entities");
        const data = await response.json();

        if (data.success) {
          setEntities(data.entities);
          // Auto-expand all parent and holding entities
          const parentAndHoldings = data.entities
            .filter((e: Entity) => e.type === "parent" || e.type === "holding")
            .map((e: Entity) => e.id);
          setExpandedIds(new Set(parentAndHoldings));
        } else {
          setError(data.error || "Failed to fetch entities");
        }
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntities();
  }, []);

  // Build tree structure from flat list
  const entityTree = useMemo(() => {
    const entityMap = new Map<string, EntityNode>();
    const roots: EntityNode[] = [];

    // First pass: create nodes
    entities.forEach((entity) => {
      entityMap.set(entity.id, { ...entity, children: [] });
    });

    // Second pass: build tree
    entities.forEach((entity) => {
      const node = entityMap.get(entity.id)!;
      if (entity.parentId && entityMap.has(entity.parentId)) {
        entityMap.get(entity.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by type (holdings first, then subsidiaries) and name
    const sortChildren = (nodes: EntityNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          const order = { parent: 0, holding: 1, subsidiary: 2 };
          return order[a.type] - order[b.type];
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((node) => sortChildren(node.children));
    };

    sortChildren(roots);
    return roots;
  }, [entities]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return entityTree;

    const query = searchQuery.toLowerCase();

    const filterNode = (node: EntityNode): EntityNode | null => {
      const matches =
        node.name.toLowerCase().includes(query) ||
        node.shortName?.toLowerCase().includes(query) ||
        node.metadata?.industry?.toLowerCase().includes(query) ||
        node.metadata?.location?.toLowerCase().includes(query);

      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is EntityNode => n !== null);

      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return entityTree
      .map(filterNode)
      .filter((n): n is EntityNode => n !== null);
  }, [searchQuery, entityTree]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = entities
      .filter((e) => e.type === "parent" || e.type === "holding")
      .map((e) => e.id);
    setExpandedIds(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Count total entities in tree
  const countEntities = (nodes: EntityNode[]): number => {
    return nodes.reduce((acc, node) => acc + 1 + countEntities(node.children), 0);
  };

  // Get valid parent entities (parent or holding type, excluding current entity)
  const parentEntities = useMemo((): EntityType[] => {
    return entities
      .filter((e) => (e.type === "parent" || e.type === "holding") && e.id !== selectedEntity?.id)
      .map((e) => ({
        id: e.id,
        name: e.name,
        shortName: e.shortName,
        type: e.type,
        parentId: e.parentId,
      }));
  }, [entities, selectedEntity?.id]);

  // Open create entity sheet
  const handleCreateEntity = () => {
    setSelectedEntity(null);
    setIsNewEntity(true);
    setFormData(initialFormState);
    setShowEntitySheet(true);
  };

  // Open view/edit entity sheet
  const handleSelectEntity = async (entityId: string) => {
    const entity = entities.find((e) => e.id === entityId);
    if (entity) {
      setSelectedEntity(entity);
      setIsNewEntity(false);
      setFormData({
        name: entity.name || "",
        shortName: entity.shortName || "",
        type: entity.type || "subsidiary",
        parentId: entity.parentId || "",
        location: entity.metadata?.location || "",
        employeeCount: entity.metadata?.employeeCount?.toString() || "",
        industry: entity.metadata?.industry || "",
        comments: entity.metadata?.comments || "",
      });
      setShowEntitySheet(true);
    }
  };

  // Close sheet and reset state
  const handleCloseSheet = () => {
    setShowEntitySheet(false);
    setSelectedEntity(null);
    setIsNewEntity(false);
    setFormData(initialFormState);
  };

  // Handle form input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save entity (create or update)
  const handleSaveEntity = async () => {
    if (!formData.name.trim()) {
      toast.error("Entity name is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isNewEntity ? "Creating entity..." : "Saving entity...");

    try {
      const payload = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || undefined,
        type: formData.type,
        parentId: formData.parentId || undefined,
        metadata: {
          location: formData.location.trim() || undefined,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
          industry: formData.industry.trim() || undefined,
          comments: formData.comments.trim() || undefined,
        },
      };

      const url = isNewEntity ? "/api/entities" : `/api/entities/${selectedEntity?.id}`;
      const method = isNewEntity ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isNewEntity ? "Entity created" : "Entity updated", {
          id: toastId,
          description: formData.name,
        });

        // Add notification
        addNotification({
          id: `entity-${isNewEntity ? "created" : "updated"}-${Date.now()}`,
          type: isNewEntity ? "created" : "updated",
          category: "entity",
          title: formData.name,
          timestamp: new Date(),
          read: false,
        });

        // Update local state
        if (isNewEntity) {
          setEntities((prev) => [...prev, data.entity]);
        } else {
          setEntities((prev) =>
            prev.map((e) => (e.id === data.entity.id ? data.entity : e))
          );
          setSelectedEntity(data.entity);
        }

        if (isNewEntity) {
          handleCloseSheet();
        }
      } else {
        toast.error(isNewEntity ? "Failed to create entity" : "Failed to save entity", {
          id: toastId,
          description: data.error,
        });
      }
    } catch (err) {
      console.error("Error saving entity:", err);
      toast.error("Failed to save entity", {
        id: toastId,
        description: "Network error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entity
  const handleDeleteEntity = async () => {
    if (!selectedEntity) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${selectedEntity.name}"...`);

    try {
      const response = await fetch(`/api/entities/${selectedEntity.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Entity deleted", {
          id: toastId,
          description: selectedEntity.name,
        });

        // Add notification
        addNotification({
          id: `entity-deleted-${Date.now()}`,
          type: "deleted",
          category: "entity",
          title: selectedEntity.name,
          timestamp: new Date(),
          read: false,
        });

        // Update local state
        setEntities((prev) => prev.filter((e) => e.id !== selectedEntity.id));
        setShowDeleteDialog(false);
        handleCloseSheet();
      } else {
        toast.error("Failed to delete entity", {
          id: toastId,
          description: data.error,
        });
      }
    } catch (err) {
      console.error("Error deleting entity:", err);
      toast.error("Failed to delete entity", {
        id: toastId,
        description: "Network error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get type badge for display
  const getTypeBadgeForSheet = (type: string) => {
    switch (type) {
      case "parent":
        return <Badge className="bg-primary/10 text-primary">Parent</Badge>;
      case "holding":
        return <Badge className="bg-blue-100 text-blue-700">Holding</Badge>;
      default:
        return <Badge variant="secondary">Subsidiary</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading entities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error loading entities</h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="text-3xl">{t("entities.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("entities.description")}
          </p>
        </div>
        <Button onClick={handleCreateEntity}>
          <Plus className="h-4 w-4 mr-2" />
          {t("entities.addEntity")}
        </Button>
      </div>

      {/* Search & Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities by name, industry, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Expand all
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {countEntities(filteredTree)} of {entities.length} entities
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Entity Tree */}
      <div className="space-y-2">
        {filteredTree.map((node) => (
          <EntityTreeNode
            key={node.id}
            node={node}
            level={0}
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
            onSelect={handleSelectEntity}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTree.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No entities found</h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            {searchQuery
              ? `No entities match "${searchQuery}". Try a different search term.`
              : "No entities have been added yet. Create your first entity to get started."}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateEntity}>
              <Plus className="h-4 w-4 mr-2" />
              Create Entity
            </Button>
          )}
        </Card>
      )}

      {/* Entity Create/Edit Sheet */}
      <Sheet open={showEntitySheet} onOpenChange={(open) => !open && handleCloseSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="space-y-1 pb-4 border-b">
            <div className="flex items-center gap-2">
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {isNewEntity ? "Create Entity" : "Entity Details"}
              </SheetTitle>
              {!isNewEntity && selectedEntity && getTypeBadgeForSheet(selectedEntity.type)}
            </div>
            <SheetDescription>
              {isNewEntity
                ? "Add a new company or subsidiary to the organization hierarchy."
                : `ID: ${selectedEntity?.id}`}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 py-4">
            <div className="space-y-5 pr-4">
              {/* Entity Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Entity Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter entity name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* Short Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Name</label>
                <Input
                  placeholder="Optional short name"
                  value={formData.shortName}
                  onChange={(e) => handleInputChange("shortName", e.target.value)}
                />
              </div>

              {/* Entity Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Entity Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={ENTITY_TYPES}
                  value={formData.type}
                  onChange={(value) => handleInputChange("type", value)}
                />
              </div>

              {/* Parent Entity - using EntitySelector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Entity</label>
                <EntitySelector
                  entities={parentEntities}
                  mode="single"
                  selectedEntityId={formData.parentId}
                  onEntityChange={(entityId) => handleInputChange("parentId", entityId || "")}
                  placeholder="Select parent entity..."
                  showHierarchy={true}
                  allowAll={false}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Parent or holding company this entity belongs to.
                </p>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g., Hanoi, Vietnam"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee Count</label>
                <Input
                  type="number"
                  placeholder="Number of employees"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  placeholder="e.g., Insurance, Automotive"
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                />
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  placeholder="Additional notes or comments..."
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Timestamps for existing entities */}
              {!isNewEntity && selectedEntity && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {new Date(selectedEntity.createdAt!).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Updated: {new Date(selectedEntity.updatedAt!).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between gap-2">
              {!isNewEntity && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              )}
              <div className={`flex items-center gap-2 ${isNewEntity ? "ml-auto" : ""}`}>
                <Button variant="outline" size="sm" onClick={handleCloseSheet}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEntity} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : isNewEntity ? (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Create
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEntity?.name}"? This action cannot be undone.
              {selectedEntity && entities.some((e) => e.parentId === selectedEntity.id) && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400">
                  Warning: This entity has child entities. They will become orphaned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntity}
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

// Entity Tree Node Component
interface EntityTreeNodeProps {
  node: EntityNode;
  level: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function EntityTreeNode({ node, level, expandedIds, onToggle, onSelect }: EntityTreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "parent":
        return <Building2 className="h-5 w-5 text-primary" />;
      case "holding":
        return <Building2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Building className="h-5 w-5 text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "parent":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1.5 py-0">Parent</Badge>;
      case "holding":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px] px-1.5 py-0">Holding</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Subsidiary</Badge>;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "parent":
        return "border-l-primary";
      case "holding":
        return "border-l-blue-500";
      default:
        return "border-l-slate-300 dark:border-l-slate-600";
    }
  };

  return (
    <div style={{ marginLeft: level > 0 ? `${level * 24}px` : 0 }}>
      <Card
        className={`p-3 hover:shadow-md transition-shadow border-l-4 cursor-pointer ${getBorderColor(node.type)}`}
        onClick={() => onSelect(node.id)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Icon */}
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            {getEntityIcon(node.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{node.name}</h3>
              {getTypeBadge(node.type)}
              {hasChildren && (
                <span className="text-xs text-muted-foreground">
                  ({node.children.length})
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
              {node.metadata?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {node.metadata.location}
                </span>
              )}
              {node.metadata?.employeeCount && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {node.metadata.employeeCount.toLocaleString()}
                </span>
              )}
              {node.metadata?.industry && (
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                  {node.metadata.industry}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2 relative">
          {/* Connector line */}
          <div
            className="absolute left-3 top-0 bottom-2 w-px bg-slate-200 dark:bg-slate-700"
            style={{ marginLeft: level > 0 ? 0 : 0 }}
          />
          {node.children.map((child) => (
            <EntityTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
