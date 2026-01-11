/**
 * PDF Export Utilities
 *
 * Generates print-ready HTML documents that can be saved as PDF.
 * Uses the browser's print dialog for PDF generation.
 *
 * @example
 * import { exportToPDF } from "@tasco/export/pdf";
 *
 * exportToPDF({
 *   title: "Report",
 *   sections: [
 *     { type: "heading", content: "Summary" },
 *     { type: "paragraph", content: "This is the report content..." },
 *   ]
 * });
 */

import { escapeHtml, formatMarkdown, formatDate, openPrintWindow } from "./utils";

/**
 * PDF content section types
 */
export type PDFSectionType =
  | "heading"
  | "paragraph"
  | "list"
  | "qa"        // Question-Answer pair
  | "table"
  | "info-box"
  | "citation";

/**
 * Base section interface
 */
export interface PDFSectionBase {
  type: PDFSectionType;
}

/**
 * Heading section
 */
export interface PDFHeadingSection extends PDFSectionBase {
  type: "heading";
  content: string;
  level?: 1 | 2 | 3;
}

/**
 * Paragraph section
 */
export interface PDFParagraphSection extends PDFSectionBase {
  type: "paragraph";
  content: string;
  markdown?: boolean;
}

/**
 * List section
 */
export interface PDFListSection extends PDFSectionBase {
  type: "list";
  items: string[];
  ordered?: boolean;
}

/**
 * Question-Answer section (for chat exports)
 */
export interface PDFQASection extends PDFSectionBase {
  type: "qa";
  question: string;
  answer: string;
  validation?: {
    score?: number;
    confidence?: string;
    risk?: "low" | "medium" | "high";
    issues?: string[];
  };
  citations?: Array<{
    source: string;
    page?: number;
  }>;
}

/**
 * Table section
 */
export interface PDFTableSection extends PDFSectionBase {
  type: "table";
  headers: string[];
  rows: string[][];
}

/**
 * Info box section
 */
export interface PDFInfoBoxSection extends PDFSectionBase {
  type: "info-box";
  title: string;
  content: string;
  variant?: "info" | "warning" | "success" | "error";
}

/**
 * Citation section
 */
export interface PDFCitationSection extends PDFSectionBase {
  type: "citation";
  sources: Array<{
    name: string;
    page?: number;
    url?: string;
  }>;
}

/**
 * Union type for all section types
 */
export type PDFSection =
  | PDFHeadingSection
  | PDFParagraphSection
  | PDFListSection
  | PDFQASection
  | PDFTableSection
  | PDFInfoBoxSection
  | PDFCitationSection;

/**
 * PDF export options
 */
export interface PDFExportOptions {
  /** Document title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Metadata fields shown in header */
  metadata?: Record<string, string>;
  /** Content sections */
  sections: PDFSection[];
  /** Footer text */
  footer?: string;
  /** Custom CSS to inject */
  customCSS?: string;
  /** Brand color (hex) */
  brandColor?: string;
}

/**
 * Generate CSS for PDF document
 */
function generateCSS(options: PDFExportOptions): string {
  const brandColor = options.brandColor || "#1a1a1a";

  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    header {
      border-bottom: 2px solid ${brandColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: ${brandColor};
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 12px;
    }

    .meta {
      font-size: 14px;
      color: #666;
    }

    .meta span {
      margin-right: 20px;
    }

    h2 {
      font-size: 20px;
      margin: 24px 0 12px;
      color: ${brandColor};
    }

    h3 {
      font-size: 16px;
      margin: 20px 0 10px;
    }

    p {
      margin-bottom: 12px;
    }

    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    li {
      margin-bottom: 6px;
    }

    /* Q&A Blocks */
    .qa-block {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .question {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .answer {
      padding: 0 15px;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      display: block;
      margin-bottom: 8px;
    }

    /* Validation Box */
    .validation {
      margin-top: 20px;
      padding: 15px;
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      border-radius: 0 8px 8px 0;
    }

    .validation h4 {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #0284c7;
    }

    .validation-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      font-size: 13px;
    }

    .validation-item {
      display: flex;
      justify-content: space-between;
    }

    .risk-high { color: #dc2626; }
    .risk-medium { color: #d97706; }
    .risk-low { color: #16a34a; }

    /* Citations */
    .citations {
      margin-top: 15px;
      padding: 15px;
      background: #fefce8;
      border-radius: 8px;
    }

    .citations h4 {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #854d0e;
    }

    .citation-item {
      font-size: 13px;
      margin-bottom: 6px;
      padding-left: 15px;
      position: relative;
    }

    .citation-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #854d0e;
    }

    /* Info Boxes */
    .info-box {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .info-box.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
    .info-box.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
    .info-box.success { background: #f0fdf4; border-left: 4px solid #22c55e; }
    .info-box.error { background: #fef2f2; border-left: 4px solid #ef4444; }

    .info-box h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 14px;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    /* Footer */
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    @media print {
      body {
        padding: 20px;
      }

      .qa-block {
        page-break-inside: avoid;
      }
    }

    ${options.customCSS || ""}
  `;
}

/**
 * Render a section to HTML
 */
function renderSection(section: PDFSection): string {
  switch (section.type) {
    case "heading": {
      const tag = `h${section.level || 2}`;
      return `<${tag}>${escapeHtml(section.content)}</${tag}>`;
    }

    case "paragraph": {
      const content = section.markdown
        ? formatMarkdown(section.content)
        : escapeHtml(section.content);
      return `<p>${content}</p>`;
    }

    case "list": {
      const tag = section.ordered ? "ol" : "ul";
      const items = section.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }

    case "qa": {
      let validationHtml = "";
      if (section.validation) {
        const v = section.validation;
        const riskClass = v.risk ? `risk-${v.risk}` : "";
        validationHtml = `
          <div class="validation">
            <h4>Quality Assessment</h4>
            <div class="validation-grid">
              ${v.score !== undefined ? `
                <div class="validation-item">
                  <span>Score</span>
                  <span>${v.score}/100</span>
                </div>
              ` : ""}
              ${v.confidence ? `
                <div class="validation-item">
                  <span>Confidence</span>
                  <span>${v.confidence}</span>
                </div>
              ` : ""}
              ${v.risk ? `
                <div class="validation-item">
                  <span>Risk Level</span>
                  <span class="${riskClass}">${v.risk.toUpperCase()}</span>
                </div>
              ` : ""}
            </div>
            ${v.issues?.length ? `
              <div style="margin-top: 10px; font-size: 13px;">
                <strong>Issues:</strong> ${v.issues.join("; ")}
              </div>
            ` : ""}
          </div>
        `;
      }

      let citationsHtml = "";
      if (section.citations?.length) {
        citationsHtml = `
          <div class="citations">
            <h4>Sources</h4>
            ${section.citations.map((c) => `
              <div class="citation-item">
                ${escapeHtml(c.source)}${c.page ? `, Page ${c.page}` : ""}
              </div>
            `).join("")}
          </div>
        `;
      }

      return `
        <div class="qa-block">
          <div class="question">
            <span class="label">Question:</span>
            <p>${escapeHtml(section.question)}</p>
          </div>
          <div class="answer">
            <span class="label">Answer:</span>
            <div>${formatMarkdown(section.answer)}</div>
            ${validationHtml}
            ${citationsHtml}
          </div>
        </div>
      `;
    }

    case "table": {
      const headerRow = section.headers
        .map((h) => `<th>${escapeHtml(h)}</th>`)
        .join("");
      const bodyRows = section.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("");
      return `
        <table>
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      `;
    }

    case "info-box": {
      const variant = section.variant || "info";
      return `
        <div class="info-box ${variant}">
          <h4>${escapeHtml(section.title)}</h4>
          <p>${escapeHtml(section.content)}</p>
        </div>
      `;
    }

    case "citation": {
      return `
        <div class="citations">
          <h4>References</h4>
          ${section.sources.map((s) => `
            <div class="citation-item">
              ${escapeHtml(s.name)}${s.page ? `, Page ${s.page}` : ""}
            </div>
          `).join("")}
        </div>
      `;
    }

    default:
      return "";
  }
}

/**
 * Generate complete HTML document for PDF export
 */
export function generatePDFHTML(options: PDFExportOptions): string {
  const css = generateCSS(options);

  const metaHtml = options.metadata
    ? Object.entries(options.metadata)
        .map(([key, value]) => `<span><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</span>`)
        .join("")
    : "";

  const sectionsHtml = options.sections.map(renderSection).join("");

  const footerHtml = options.footer
    ? `<footer><p>${escapeHtml(options.footer)}</p></footer>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>${css}</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(options.title)}</h1>
    ${options.subtitle ? `<div class="subtitle">${escapeHtml(options.subtitle)}</div>` : ""}
    ${metaHtml ? `<div class="meta">${metaHtml}</div>` : ""}
  </header>

  <main>
    ${sectionsHtml}
  </main>

  ${footerHtml}
</body>
</html>
  `;
}

/**
 * Export content to PDF (opens print dialog)
 *
 * @example
 * import { exportToPDF } from "@tasco/export/pdf";
 *
 * exportToPDF({
 *   title: "Compliance Report",
 *   subtitle: "Q4 2024 Analysis",
 *   metadata: {
 *     Entity: "Tasco Group",
 *     Generated: new Date().toLocaleDateString()
 *   },
 *   sections: [
 *     { type: "qa", question: "...", answer: "..." },
 *   ],
 *   footer: "Generated by Tasco AI"
 * });
 */
export function exportToPDF(options: PDFExportOptions): void {
  const html = generatePDFHTML(options);
  openPrintWindow(html);
}

/**
 * Quick export for chat messages
 *
 * @example
 * import { exportChatToPDF } from "@tasco/export/pdf";
 *
 * exportChatToPDF(messages, {
 *   title: "Compliance Chat Export",
 *   entityName: "Tasco Auto"
 * });
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  validation?: {
    score?: number;
    confidence?: string;
    complianceRisk?: "low" | "medium" | "high";
    potentialConflicts?: string[];
    missingClauses?: string[];
  };
  citations?: Array<{
    documentName?: string;
    page?: number;
  }>;
}

export interface ChatExportOptions {
  title?: string;
  entityName?: string;
  exportDate?: Date;
  footer?: string;
}

export function exportChatToPDF(
  messages: ChatMessage[],
  options: ChatExportOptions = {}
): void {
  const {
    title = "Chat Export",
    entityName = "All",
    exportDate = new Date(),
    footer = "Generated by Tasco AI Assistant",
  } = options;

  // Convert messages to Q&A sections
  const sections: PDFSection[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      // Look for next assistant message
      const nextMsg = messages[i + 1];
      if (nextMsg?.role === "assistant") {
        sections.push({
          type: "qa",
          question: msg.content,
          answer: nextMsg.content,
          validation: nextMsg.validation
            ? {
                score: nextMsg.validation.score,
                confidence: nextMsg.validation.confidence,
                risk: nextMsg.validation.complianceRisk,
                issues: [
                  ...(nextMsg.validation.potentialConflicts || []),
                  ...(nextMsg.validation.missingClauses || []),
                ],
              }
            : undefined,
          citations: nextMsg.citations?.map((c) => ({
            source: c.documentName || "Unknown",
            page: c.page,
          })),
        });
        i++; // Skip the assistant message since we've processed it
      }
    }
  }

  exportToPDF({
    title,
    metadata: {
      Entity: entityName,
      Generated: formatDate(exportDate),
    },
    sections,
    footer,
  });
}
