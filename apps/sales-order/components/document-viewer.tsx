"use client";

import { useState } from "react";
import { Button, Card } from "@tasco/ui";
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from "@tasco/ui/icons";
import { cn } from "@tasco/ui";

interface DocumentViewerProps {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  className?: string;
}

export function DocumentViewer({
  fileUrl,
  fileName,
  fileType,
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "document";
      link.click();
    }
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const isPDF = fileType === "application/pdf" || fileName?.endsWith(".pdf");
  const isImage = fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif)$/i.test(fileName || "");

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {fileName || "Document"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center text-sm">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="mx-2 h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
            disabled={!fileUrl}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex-1 overflow-auto bg-muted/10 p-4">
        <div className="flex min-h-full items-center justify-center">
          {!fileUrl ? (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No document to display</p>
              <p className="mt-1 text-xs">Upload a document to view it here</p>
            </div>
          ) : isPDF ? (
            <div
              className="bg-white shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease-out",
              }}
            >
              <iframe
                src={fileUrl}
                className="h-[800px] w-[600px]"
                title={fileName}
              />
            </div>
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-full max-w-full object-contain shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease-out",
              }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Unsupported file type</p>
              <p className="mt-1 text-xs">
                Please upload a PDF or image file
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
