"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Entity type from the database
 */
export interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: "parent" | "holding" | "subsidiary";
  category?: "tasco-group" | "automotive-showroom" | "automotive-b2b";
  parentId?: string;
  metadata?: {
    location?: string;
    employeeCount?: number;
    industry?: string;
    comments?: string;
  };
}

/**
 * Entity filter context value
 */
interface EntityFilterContextValue {
  // Available entities (fetched from API)
  entities: Entity[];
  isLoading: boolean;
  error: string | null;

  // Selection state
  selectedEntityIds: string[];
  setSelectedEntityIds: (ids: string[]) => void;

  // Derived values
  selectedEntities: Entity[];
  isAllSelected: boolean;

  // Actions
  selectAll: () => void;
  clearSelection: () => void;
  toggleEntity: (id: string) => void;
  refreshEntities: () => Promise<void>;
}

const EntityFilterContext = createContext<EntityFilterContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "customer-lifecycle:selectedEntityIds";

/**
 * Get initial selection from localStorage
 */
function getInitialSelection(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/**
 * Save selection to localStorage
 */
function saveSelection(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

interface EntityFilterProviderProps {
  children: ReactNode;
}

export function EntityFilterProvider({ children }: EntityFilterProviderProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntityIds, setSelectedEntityIdsState] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Fetch entities from API
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/entities");
      if (!response.ok) {
        throw new Error("Failed to fetch entities");
      }
      const data = await response.json();
      setEntities(data.entities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entities");
      setEntities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and load selection from localStorage
  useEffect(() => {
    fetchEntities();
    const stored = getInitialSelection();
    setSelectedEntityIdsState(stored);
    setInitialized(true);
  }, [fetchEntities]);

  // When entities load and we have no selection, select all by default
  useEffect(() => {
    if (
      initialized &&
      !isLoading &&
      entities.length > 0 &&
      selectedEntityIds.length === 0
    ) {
      // Select all entities by default if nothing is selected
      const allIds = entities.map((e) => e.id);
      setSelectedEntityIdsState(allIds);
      saveSelection(allIds);
    }
  }, [initialized, isLoading, entities, selectedEntityIds.length]);

  // Selection handlers
  const setSelectedEntityIds = useCallback((ids: string[]) => {
    setSelectedEntityIdsState(ids);
    saveSelection(ids);
  }, []);

  const selectAll = useCallback(() => {
    const allIds = entities.map((e) => e.id);
    setSelectedEntityIds(allIds);
  }, [entities, setSelectedEntityIds]);

  const clearSelection = useCallback(() => {
    setSelectedEntityIds([]);
  }, [setSelectedEntityIds]);

  const toggleEntity = useCallback(
    (id: string) => {
      setSelectedEntityIds(
        selectedEntityIds.includes(id)
          ? selectedEntityIds.filter((eid) => eid !== id)
          : [...selectedEntityIds, id]
      );
    },
    [selectedEntityIds, setSelectedEntityIds]
  );

  // Derived values
  const selectedEntities = entities.filter((e) =>
    selectedEntityIds.includes(e.id)
  );
  const isAllSelected =
    entities.length > 0 && selectedEntityIds.length === entities.length;

  const value: EntityFilterContextValue = {
    entities,
    isLoading,
    error,
    selectedEntityIds,
    setSelectedEntityIds,
    selectedEntities,
    isAllSelected,
    selectAll,
    clearSelection,
    toggleEntity,
    refreshEntities: fetchEntities,
  };

  return (
    <EntityFilterContext.Provider value={value}>
      {children}
    </EntityFilterContext.Provider>
  );
}

/**
 * Hook to use the entity filter context
 */
export function useEntityFilter(): EntityFilterContextValue {
  const context = useContext(EntityFilterContext);
  if (!context) {
    throw new Error(
      "useEntityFilter must be used within an EntityFilterProvider"
    );
  }
  return context;
}

/**
 * Build query string for API calls with entity filter
 */
export function buildEntityFilterParams(entityIds: string[]): string {
  if (entityIds.length === 0) return "";
  return `entityIds=${entityIds.join(",")}`;
}
