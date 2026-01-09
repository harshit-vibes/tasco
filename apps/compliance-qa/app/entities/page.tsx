"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Badge, Button } from "@tasco/ui";
import { Search, Building2, Building, MapPin, Users, Loader2, ChevronRight, ChevronDown, Plus } from "@tasco/ui/icons";

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
  };
  createdAt?: string;
  updatedAt?: string;
}

// Tree node with children
interface EntityNode extends Entity {
  children: EntityNode[];
}

export default function EntitiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Entities</h1>
          <p className="text-muted-foreground">
            Company hierarchy and organizational structure
          </p>
        </div>
        <Button onClick={() => router.push("/entities/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Entity
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
            onSelect={(id) => router.push(`/entities/${id}`)}
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
            <Button onClick={() => router.push("/entities/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Entity
            </Button>
          )}
        </Card>
      )}
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
