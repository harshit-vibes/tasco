"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Input, Select, Badge, Textarea } from "@tasco/ui";
import {
  ArrowLeft,
  Building2,
  Building,
  Loader2,
  Save,
  Trash2,
  Plus,
  MapPin,
} from "@tasco/ui/icons";

// Entity type (matching @tasco/db)
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

const ENTITY_TYPES = [
  { value: "holding", label: "Holding Company" },
  { value: "subsidiary", label: "Subsidiary" },
];

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const entityId = params.id as string;
  const isNew = entityId === "new";

  const [entity, setEntity] = useState<Entity | null>(null);
  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    type: "subsidiary" as "parent" | "holding" | "subsidiary",
    parentId: "",
    location: "",
    employeeCount: "",
    industry: "",
    comments: "",
  });

  // Fetch all entities for parent selection
  useEffect(() => {
    async function fetchAllEntities() {
      try {
        const response = await fetch("/api/entities");
        const data = await response.json();
        if (data.success) {
          setAllEntities(data.entities);
        }
      } catch (err) {
        console.error("Failed to fetch entities:", err);
      }
    }
    fetchAllEntities();
  }, []);

  // Fetch entity data if editing
  useEffect(() => {
    if (isNew) return;

    async function fetchEntity() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/entities/${entityId}`);
        const data = await response.json();

        if (data.success) {
          const e = data.entity;
          setEntity(e);
          setFormData({
            name: e.name || "",
            shortName: e.shortName || "",
            type: e.type || "subsidiary",
            parentId: e.parentId || "",
            location: e.metadata?.location || "",
            employeeCount: e.metadata?.employeeCount?.toString() || "",
            industry: e.metadata?.industry || "",
            comments: e.metadata?.comments || "",
          });
        } else {
          setError(data.error || "Entity not found");
        }
      } catch (err) {
        console.error("Failed to fetch entity:", err);
        setError("Failed to load entity");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntity();
  }, [entityId, isNew]);

  // Parent options (exclude current entity and its children)
  const parentOptions = useMemo(() => {
    const options = [{ value: "", label: "None (Top-level)" }];

    // Filter entities that can be parents (parent or holding types, not the current entity)
    const validParents = allEntities.filter(
      (e) =>
        e.id !== entityId &&
        (e.type === "parent" || e.type === "holding")
    );

    validParents.forEach((e) => {
      options.push({
        value: e.id,
        label: `${e.name} (${e.type})`,
      });
    });

    return options;
  }, [allEntities, entityId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Entity name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || undefined,
        type: formData.type,
        parentId: formData.parentId || undefined,
        metadata: {
          location: formData.location.trim() || undefined,
          employeeCount: formData.employeeCount
            ? parseInt(formData.employeeCount)
            : undefined,
          industry: formData.industry.trim() || undefined,
          comments: formData.comments.trim() || undefined,
        },
      };

      const url = isNew ? "/api/entities" : `/api/entities/${entityId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to the entity list or new entity
        if (isNew) {
          router.push(`/entities/${data.entity.id}`);
        } else {
          setEntity(data.entity);
        }
        router.refresh();
      } else {
        setError(data.error || "Failed to save entity");
      }
    } catch (err) {
      console.error("Failed to save entity:", err);
      setError("Failed to save entity");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entity?")) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/entities/${entityId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/entities");
      } else {
        setError(data.error || "Failed to delete entity");
      }
    } catch (err) {
      console.error("Failed to delete entity:", err);
      setError("Failed to delete entity");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "parent":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
            Parent
          </Badge>
        );
      case "holding":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            Holding
          </Badge>
        );
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
          <p className="text-muted-foreground">Loading entity...</p>
        </div>
      </div>
    );
  }

  // Error state (entity not found)
  if (!isNew && error && !entity) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/entities")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entities
          </Button>
        </div>
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Entity not found</h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button onClick={() => router.push("/entities")}>
            Go to Entities
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              {isNew ? "Create Entity" : entity?.name || "Entity"}
            </h1>
            {!isNew && entity && getTypeBadge(entity.type)}
          </div>
          {!isNew && entity && (
            <p className="text-sm text-muted-foreground">
              ID: {entity.id}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isNew ? (
              <Plus className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Entity Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter entity name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Short Name
              </label>
              <Input
                placeholder="Optional short name"
                value={formData.shortName}
                onChange={(e) => handleInputChange("shortName", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Entity Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={ENTITY_TYPES}
                value={formData.type}
                onChange={(value) => handleInputChange("type", value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Parent Entity
              </label>
              <Select
                options={parentOptions}
                value={formData.parentId}
                onChange={(value) => handleInputChange("parentId", value)}
                placeholder="Select parent entity"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Parent or holding company this entity belongs to.
              </p>
            </div>
          </div>
        </Card>

        {/* Metadata Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Additional Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Location
              </label>
              <Input
                placeholder="e.g., Hanoi, Vietnam"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Employee Count
              </label>
              <Input
                type="number"
                placeholder="Number of employees"
                value={formData.employeeCount}
                onChange={(e) =>
                  handleInputChange("employeeCount", e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Industry
              </label>
              <Input
                placeholder="e.g., Insurance, Automotive"
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Comments
              </label>
              <Textarea
                placeholder="Additional notes or comments about this entity..."
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Timestamps for existing entities */}
      {!isNew && entity && (
        <div className="text-xs text-muted-foreground">
          Created: {new Date(entity.createdAt!).toLocaleString()} •
          Updated: {new Date(entity.updatedAt!).toLocaleString()}
        </div>
      )}
    </div>
  );
}
