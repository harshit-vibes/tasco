"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Download, ExternalLink, Loader2 } from "lucide-react";

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          setBlobUrl(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  const handleOpenNewTab = () => window.open(blobUrl || url, "_blank");
  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "document.pdf";
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end gap-1 px-2 py-1.5 border-b shrink-0">
        <Button variant="ghost" size="sm" onClick={handleOpenNewTab} title="Open in new tab">
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <iframe
        src={blobUrl || url}
        className="flex-1 w-full border-0"
        title="PDF Document"
      />
    </div>
  );
}

export default PDFViewer;
