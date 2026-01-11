"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@tasco/ui";
import {
  Clock,
  RotateCcw,
  ExternalLink,
  FileText,
  Trash2,
  CheckCircle,
  RefreshCw,
} from "@tasco/ui/icons";
import { useTranslation } from "@tasco/i18n";

interface DocumentVersion {
  versionId: string;
  key: string;
  lastModified: string;
  size: number;
  isLatest: boolean;
  isDeleteMarker: boolean;
}

interface DocumentVersionHistoryProps {
  documentKey: string;
  documentName: string;
  onVersionRestored?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentVersionHistory({
  documentKey,
  documentName,
  onVersionRestored,
}: DocumentVersionHistoryProps) {
  const { t } = useTranslation("compliance");
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<DocumentVersion | null>(null);

  // Fetch versions
  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/documents/versions?key=${encodeURIComponent(documentKey)}`
      );
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documentKey) {
      fetchVersions();
    }
  }, [documentKey]);

  // Handle restore
  const handleRestore = async (version: DocumentVersion) => {
    setIsRestoring(version.versionId);
    try {
      const response = await fetch("/api/documents/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          key: documentKey,
          versionId: version.versionId,
        }),
      });

      if (response.ok) {
        // Refresh versions list
        await fetchVersions();
        onVersionRestored?.();
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
    } finally {
      setIsRestoring(null);
      setConfirmRestore(null);
    }
  };

  // Handle view version
  const handleViewVersion = async (version: DocumentVersion) => {
    try {
      const response = await fetch("/api/documents/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getUrl",
          key: documentKey,
          versionId: version.versionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.open(data.url, "_blank");
        }
      }
    } catch (error) {
      console.error("Failed to get version URL:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t("versions.title", "Version History")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t("versions.title", "Version History")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("versions.noVersions", "No version history available")}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {t("versions.enableHint", "Enable S3 versioning to track document changes")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              {t("versions.title", "Version History")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchVersions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.versionId}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  version.isLatest
                    ? "border-primary/50 bg-primary/5"
                    : version.isDeleteMarker
                      ? "border-red-200 bg-red-50"
                      : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    version.isDeleteMarker
                      ? "bg-red-100"
                      : version.isLatest
                        ? "bg-primary/10"
                        : "bg-muted"
                  }`}
                >
                  {version.isDeleteMarker ? (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  ) : version.isLatest ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {version.isDeleteMarker
                        ? t("versions.deleted", "Deleted")
                        : `v${versions.length - index}`}
                    </span>
                    {version.isLatest && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {t("versions.current", "Current")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(version.lastModified)}</span>
                    {!version.isDeleteMarker && (
                      <>
                        <span>·</span>
                        <span>{formatBytes(version.size)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!version.isDeleteMarker && !version.isLatest && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewVersion(version)}
                      title={t("versions.view", "View this version")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRestore(version)}
                      disabled={isRestoring === version.versionId}
                      title={t("versions.restore", "Restore this version")}
                    >
                      {isRestoring === version.versionId ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {!version.isDeleteMarker && version.isLatest && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVersion(version)}
                    title={t("versions.view", "View this version")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Restore Dialog */}
      <Dialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("versions.confirmRestore.title", "Restore Version")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "versions.confirmRestore.description",
                "Are you sure you want to restore this version? This will create a new version with the content from the selected version."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <span className="font-medium">{t("versions.document", "Document")}:</span>{" "}
              {documentName}
            </p>
            {confirmRestore && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{t("versions.from", "From")}:</span>{" "}
                {formatDate(confirmRestore.lastModified)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={() => confirmRestore && handleRestore(confirmRestore)}
              disabled={!!isRestoring}
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("versions.restoring", "Restoring...")}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("versions.restoreButton", "Restore Version")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
