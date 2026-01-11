/**
 * Common utilities for export functions
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  // Server-side fallback
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convert basic markdown to HTML
 */
export function formatMarkdown(text: string): string {
  return text
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/<\/li>\n<li>/g, "</li><li>");
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  return date.toLocaleDateString("en-US", options);
}

/**
 * Format a date for filenames (YYYY-MM-DD)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate a unique filename
 */
export function generateFilename(
  prefix: string,
  extension: string,
  date: Date = new Date()
): string {
  const dateStr = formatDateForFilename(date);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${dateStr}-${random}.${extension}`;
}

/**
 * Extract value from confidence object (used in AI extractions)
 */
export function getValue<T>(
  field: T | { value: T; confidence: number }
): T {
  return typeof field === "object" &&
    field !== null &&
    "value" in field
    ? field.value
    : (field as T);
}

/**
 * Open content in a new window for printing
 */
export function openPrintWindow(html: string): void {
  if (typeof window === "undefined") {
    console.warn("openPrintWindow is only available in browser environment");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Give time for content to render then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Trigger a file download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") {
    console.warn("downloadBlob is only available in browser environment");
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
