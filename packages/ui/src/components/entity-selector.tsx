"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Building, ChevronRight, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

// Types for the entity hierarchy
export interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: "parent" | "holding" | "subsidiary";
  parentId?: string;
  children?: Entity[];
  metadata?: {
    location?: string;
    employeeCount?: number;
    industry?: string;
  };
}

// Single select props
interface SingleSelectProps {
  mode?: "single";
  selectedEntityId: string | null;
  onEntityChange: (entityId: string | null) => void;
  selectedEntityIds?: never;
  onEntitiesChange?: never;
}

// Multi select props
interface MultiSelectProps {
  mode: "multi";
  selectedEntityIds: string[];
  onEntitiesChange: (entityIds: string[]) => void;
  selectedEntityId?: never;
  onEntityChange?: never;
}

export type EntitySelectorProps = {
  entities: Entity[];
  allowAll?: boolean;
  allLabel?: string;
  placeholder?: string;
  className?: string;
  showHierarchy?: boolean;
  maxDisplayedSelections?: number;
} & (SingleSelectProps | MultiSelectProps);

// Build entity tree from flat list
function buildEntityTree(entities: Entity[]): Entity[] {
  const entityMap = new Map<string, Entity>();
  const roots: Entity[] = [];

  // First pass: create map
  entities.forEach((entity) => {
    entityMap.set(entity.id, { ...entity, children: [] });
  });

  // Second pass: build tree
  entities.forEach((entity) => {
    const node = entityMap.get(entity.id)!;
    if (entity.parentId && entityMap.has(entity.parentId)) {
      const parent = entityMap.get(entity.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Get all descendant IDs
function getAllDescendantIds(entity: Entity): string[] {
  const ids: string[] = [entity.id];
  if (entity.children) {
    entity.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
  }
  return ids;
}

// Entity type icons
function EntityIcon({ type }: { type: Entity["type"] }) {
  switch (type) {
    case "parent":
      return <Building2 className="h-4 w-4 text-primary" />;
    case "holding":
      return <Building2 className="h-4 w-4 text-blue-500" />;
    case "subsidiary":
      return <Building className="h-4 w-4 text-muted-foreground" />;
  }
}

// Recursive tree item renderer
function EntityTreeItem({
  entity,
  level,
  selectedIds,
  onToggle,
  expandedIds,
  onToggleExpand,
  mode,
}: {
  entity: Entity;
  level: number;
  selectedIds: Set<string>;
  onToggle: (id: string, entity: Entity) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  mode: "single" | "multi";
}) {
  const hasChildren = entity.children && entity.children.length > 0;
  const isExpanded = expandedIds.has(entity.id);
  const isSelected = selectedIds.has(entity.id);

  // For multi-select: check children selection state
  const allDescendants = hasChildren ? getAllDescendantIds(entity).slice(1) : [];
  const allChildrenSelected = allDescendants.length > 0 &&
    allDescendants.every((id) => selectedIds.has(id));
  const someChildrenSelected = allDescendants.length > 0 &&
    allDescendants.some((id) => selectedIds.has(id));

  // Determine checkbox state
  const isFullySelected = isSelected || (hasChildren && allChildrenSelected);
  const isPartiallySelected = !isFullySelected && someChildrenSelected;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
          isFullySelected && "bg-accent font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onToggle(entity.id, entity)}
      >
        {hasChildren && (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(entity.id);
            }}
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}
        {!hasChildren && <span className="w-4" />}

        {/* Checkbox for multi-select */}
        {mode === "multi" && (
          <div
            className={cn(
              "h-4 w-4 rounded border flex items-center justify-center",
              isFullySelected
                ? "bg-primary border-primary"
                : isPartiallySelected
                ? "bg-primary/50 border-primary"
                : "border-input"
            )}
          >
            {isFullySelected && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
            {isPartiallySelected && (
              <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
            )}
          </div>
        )}

        <EntityIcon type={entity.type} />
        <span className="flex-1 truncate">{entity.name}</span>

        {mode === "single" && isSelected && <Check className="h-4 w-4" />}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {entity.children!.map((child) => (
            <EntityTreeItem
              key={child.id}
              entity={child}
              level={level + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EntitySelector(props: EntitySelectorProps) {
  const {
    entities,
    allowAll = true,
    allLabel = "All Companies",
    placeholder = "Select company...",
    className,
    showHierarchy = true,
    maxDisplayedSelections = 2,
  } = props;

  const mode = props.mode || "single";
  const [open, setOpen] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set(entities.filter((e) => e.type !== "subsidiary").map((e) => e.id))
  );
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Compute selected IDs set
  const selectedIds = React.useMemo(() => {
    if (mode === "multi") {
      return new Set(props.selectedEntityIds || []);
    }
    return new Set(props.selectedEntityId ? [props.selectedEntityId] : []);
  }, [mode, mode === "multi" ? props.selectedEntityIds : props.selectedEntityId]);

  // Build tree structure
  const entityTree = React.useMemo(
    () => (showHierarchy ? buildEntityTree(entities) : entities),
    [entities, showHierarchy]
  );

  // Get selected entities for display
  const selectedEntities = entities.filter((e) => selectedIds.has(e.id));

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleExpand = (id: string) => {
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

  const handleToggle = (id: string, entity: Entity) => {
    if (mode === "single" && props.onEntityChange) {
      props.onEntityChange(id);
      setOpen(false);
    } else if (mode === "multi" && props.onEntitiesChange && props.selectedEntityIds) {
      const newIds = new Set(props.selectedEntityIds);
      if (newIds.has(id)) {
        // Deselect: remove this entity and all descendants
        const toRemove = getAllDescendantIds(entity);
        toRemove.forEach((removeId) => newIds.delete(removeId));
      } else {
        // Select: add this entity and optionally all descendants
        newIds.add(id);
        // For parent/holding, also select children
        if (entity.type !== "subsidiary" && entity.children) {
          getAllDescendantIds(entity).forEach((addId) => newIds.add(addId));
        }
      }
      props.onEntitiesChange(Array.from(newIds));
    }
  };

  const handleSelectAll = () => {
    if (mode === "single" && props.onEntityChange) {
      props.onEntityChange(null);
      setOpen(false);
    } else if (mode === "multi" && props.onEntitiesChange) {
      // In multi-mode, "All" means select all entities
      if (selectedIds.size === entities.length) {
        props.onEntitiesChange([]);
      } else {
        props.onEntitiesChange(entities.map((e) => e.id));
      }
    }
  };

  const handleRemoveSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "multi" && props.onEntitiesChange && props.selectedEntityIds) {
      props.onEntitiesChange(props.selectedEntityIds.filter((eid) => eid !== id));
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "multi" && props.onEntitiesChange) {
      props.onEntitiesChange([]);
    }
  };

  // Display text
  const getDisplayContent = () => {
    if (mode === "single") {
      const selected = entities.find((e) => e.id === props.selectedEntityId);
      if (selected) {
        return (
          <div className="flex items-center gap-2 truncate">
            <EntityIcon type={selected.type} />
            <span className="truncate">{selected.shortName || selected.name}</span>
          </div>
        );
      }
      if (props.selectedEntityId === null && allowAll) {
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{allLabel}</span>
          </div>
        );
      }
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    // Multi-select display
    if (selectedEntities.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (selectedEntities.length === entities.length) {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>{allLabel}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {selectedEntities.slice(0, maxDisplayedSelections).map((entity) => (
          <Badge
            key={entity.id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            {entity.shortName || entity.name}
            <span
              role="button"
              tabIndex={0}
              className="hover:bg-muted rounded-full p-0.5 cursor-pointer"
              onClick={(e) => handleRemoveSelection(entity.id, e)}
              onKeyDown={(e) => e.key === "Enter" && handleRemoveSelection(entity.id, e as unknown as React.MouseEvent)}
            >
              <X className="h-3 w-3" />
            </span>
          </Badge>
        ))}
        {selectedEntities.length > maxDisplayedSelections && (
          <Badge variant="outline">
            +{selectedEntities.length - maxDisplayedSelections} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between min-w-[200px] h-auto min-h-[40px] py-1"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 text-left">{getDisplayContent()}</div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {mode === "multi" && selectedEntities.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              className="hover:bg-muted rounded-full p-0.5 cursor-pointer"
              onClick={handleClearAll}
              onKeyDown={(e) => e.key === "Enter" && handleClearAll(e as unknown as React.MouseEvent)}
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </Button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[300px] rounded-md border bg-popover p-1 shadow-md">
          <div className="max-h-[300px] overflow-auto">
            {/* All Companies Option */}
            {allowAll && (
              <>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    (mode === "single" && props.selectedEntityId === null) ||
                    (mode === "multi" && selectedIds.size === entities.length)
                      ? "bg-accent font-medium"
                      : ""
                  )}
                  onClick={handleSelectAll}
                >
                  {mode === "multi" && (
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        selectedIds.size === entities.length
                          ? "bg-primary border-primary"
                          : selectedIds.size > 0
                          ? "bg-primary/50 border-primary"
                          : "border-input"
                      )}
                    >
                      {selectedIds.size === entities.length && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                      {selectedIds.size > 0 && selectedIds.size < entities.length && (
                        <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
                      )}
                    </div>
                  )}
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1">{allLabel}</span>
                  {mode === "single" && props.selectedEntityId === null && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <div className="my-1 border-t" />
              </>
            )}

            {/* Entity Tree */}
            {showHierarchy ? (
              entityTree.map((entity) => (
                <EntityTreeItem
                  key={entity.id}
                  entity={entity}
                  level={0}
                  selectedIds={selectedIds}
                  onToggle={handleToggle}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  mode={mode}
                />
              ))
            ) : (
              entities.map((entity) => (
                <div
                  key={entity.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    selectedIds.has(entity.id) && "bg-accent font-medium"
                  )}
                  onClick={() => handleToggle(entity.id, entity)}
                >
                  {mode === "multi" && (
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        selectedIds.has(entity.id)
                          ? "bg-primary border-primary"
                          : "border-input"
                      )}
                    >
                      {selectedIds.has(entity.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  )}
                  <EntityIcon type={entity.type} />
                  <span className="flex-1 truncate">{entity.name}</span>
                  {mode === "single" && selectedIds.has(entity.id) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
