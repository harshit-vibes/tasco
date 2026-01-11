"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import { PDFViewer } from "./pdf-viewer";

// Dynamically import PDF viewer to avoid SSR issues
const DynamicPDFViewer = dynamic(
  () => Promise.resolve(PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export interface DocumentContentViewerProps {
  documentId: string;
  filename: string;
  textContent?: string | null;
  highlightText?: string | null;
  onHighlightRef?: (ref: HTMLElement | null) => void;
  /** API path for file endpoint. Default: "/api/documents/file" */
  fileApiPath?: string;
  /** API path for PDF proxy endpoint. Default: "/api/documents/pdf" */
  pdfApiPath?: string;
}

interface FileInfo {
  url: string;
  mimeType: string;
  extension: string;
  base64?: string;
}

// Detect file type from extension
function getFileType(filename: string): "pdf" | "docx" | "doc" | "markdown" | "text" | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "txt") return "text";
  return "unknown";
}

export function DocumentContentViewer({
  documentId,
  filename,
  textContent,
  highlightText,
  onHighlightRef,
  fileApiPath = "/api/documents/file",
  pdfApiPath = "/api/documents/pdf",
}: DocumentContentViewerProps) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileType = getFileType(filename);

  // Fetch file info for binary files
  useEffect(() => {
    if (fileType === "pdf" || fileType === "docx" || fileType === "doc") {
      fetchFileInfo();
    }
  }, [documentId, fileType]);

  const fetchFileInfo = async () => {
    setIsLoadingFile(true);
    setError(null);
    try {
      // For PDFs, get signed URL
      if (fileType === "pdf") {
        const response = await fetch(`${fileApiPath}?id=${encodeURIComponent(documentId)}&format=url`);
        const data = await response.json();
        if (data.success) {
          setFileInfo({
            url: data.document.url,
            mimeType: data.document.mimeType,
            extension: data.document.extension,
          });
        } else {
          setError("Failed to load PDF");
        }
      }

      // For DOCX, get base64 and convert with mammoth
      if (fileType === "docx" || fileType === "doc") {
        const response = await fetch(`${fileApiPath}?id=${encodeURIComponent(documentId)}&format=base64`);
        const data = await response.json();
        if (data.success && data.document.base64) {
          // Convert base64 to array buffer for mammoth
          const binaryString = atob(data.document.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Import mammoth dynamically
          const mammoth = await import("mammoth");
          const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
          setDocxHtml(result.value);
          setFileInfo({
            url: "",
            mimeType: data.document.mimeType,
            extension: data.document.extension,
            base64: data.document.base64,
          });
        } else {
          setError("Failed to convert Word document");
        }
      }
    } catch (err) {
      console.error("Error fetching file info:", err);
      setError("Failed to load document");
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Render content with highlighting for text content
  const renderTextWithHighlight = () => {
    if (!textContent) return null;

    if (highlightText) {
      const decodedText = decodeURIComponent(highlightText);
      const index = textContent.toLowerCase().indexOf(decodedText.toLowerCase());

      if (index !== -1) {
        const before = textContent.slice(0, index);
        const match = textContent.slice(index, index + decodedText.length);
        const after = textContent.slice(index + decodedText.length);

        return (
          <>
            <span className="whitespace-pre-wrap">{before}</span>
            <mark
              ref={onHighlightRef as React.RefCallback<HTMLElement>}
              className="bg-yellow-300 dark:bg-yellow-600/50 px-0.5 rounded scroll-mt-32"
            >
              {match}
            </mark>
            <span className="whitespace-pre-wrap">{after}</span>
          </>
        );
      }
    }

    return <span className="whitespace-pre-wrap">{textContent}</span>;
  };

  // PDF Viewer - use proxy URL to avoid CORS issues
  if (fileType === "pdf") {
    const proxyUrl = `${pdfApiPath}?id=${encodeURIComponent(documentId)}`;
    return <DynamicPDFViewer url={proxyUrl} />;
  }

  // DOCX Viewer (converted to HTML)
  if (fileType === "docx" || fileType === "doc") {
    if (isLoadingFile) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Converting document...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }
    if (docxHtml) {
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-10 w-10 mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Unable to convert Word document</p>
      </div>
    );
  }

  // Markdown content
  if (fileType === "markdown" && textContent) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90">
        <ReactMarkdown>{textContent}</ReactMarkdown>
      </div>
    );
  }

  // Plain text content (default)
  if (textContent) {
    return (
      <pre className="font-sans text-sm leading-relaxed">
        {renderTextWithHighlight()}
      </pre>
    );
  }

  return (
    <p className="text-muted-foreground text-center py-8">
      Unable to load document content
    </p>
  );
}
