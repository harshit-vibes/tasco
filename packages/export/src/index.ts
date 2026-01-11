/**
 * @tasco/export - Export utilities for PDF and Excel generation
 *
 * @example
 * // PDF export
 * import { exportToPDF, exportChatToPDF } from "@tasco/export";
 *
 * exportToPDF({
 *   title: "Report",
 *   sections: [...],
 * });
 *
 * @example
 * // Excel export
 * import { exportToExcel, exportToBravoExcel } from "@tasco/export";
 *
 * exportToExcel({
 *   filename: "data.xlsx",
 *   sheets: [{ name: "Sheet1", data: [...] }],
 * });
 */

// PDF exports
export {
  exportToPDF,
  exportChatToPDF,
  generatePDFHTML,
  type PDFExportOptions,
  type PDFSection,
  type PDFSectionType,
  type PDFHeadingSection,
  type PDFParagraphSection,
  type PDFListSection,
  type PDFQASection,
  type PDFTableSection,
  type PDFInfoBoxSection,
  type PDFCitationSection,
  type ChatMessage,
  type ChatExportOptions,
} from "./pdf";

// Excel exports
export {
  exportToExcel,
  exportTableToExcel,
  exportToBravoExcel,
  exportSingleOrderToBravo,
  getBravoExportData,
  type ExcelColumn,
  type ExcelSheet,
  type ExcelExportOptions,
  type BravoOrder,
  type BravoOrderItem,
} from "./excel";

// Utilities
export {
  escapeHtml,
  formatMarkdown,
  formatDate,
  formatDateForFilename,
  generateFilename,
  getValue,
  openPrintWindow,
  downloadBlob,
} from "./utils";
