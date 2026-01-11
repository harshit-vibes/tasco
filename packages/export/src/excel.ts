/**
 * Excel Export Utilities
 *
 * Generates Excel files using the xlsx library.
 *
 * @example
 * import { exportToExcel } from "@tasco/export/excel";
 *
 * exportToExcel({
 *   filename: "orders.xlsx",
 *   sheets: [{
 *     name: "Orders",
 *     data: [...],
 *     columns: [...]
 *   }]
 * });
 */

import * as XLSX from "xlsx";
import { getValue, generateFilename } from "./utils";

/**
 * Column definition for Excel export
 */
export interface ExcelColumn {
  /** Column header text */
  header: string;
  /** Key to extract from data object */
  key: string;
  /** Column width (characters) */
  width?: number;
  /** Transform function for cell value */
  transform?: (value: unknown) => string | number;
}

/**
 * Sheet definition
 */
export interface ExcelSheet<T = Record<string, unknown>> {
  /** Sheet name */
  name: string;
  /** Data rows */
  data: T[];
  /** Column definitions (optional - will auto-detect if not provided) */
  columns?: ExcelColumn[];
}

/**
 * Excel export options
 */
export interface ExcelExportOptions<T = Record<string, unknown>> {
  /** Output filename */
  filename?: string;
  /** Sheets to include */
  sheets: ExcelSheet<T>[];
}

/**
 * Export data to Excel file
 *
 * @example
 * import { exportToExcel } from "@tasco/export/excel";
 *
 * exportToExcel({
 *   filename: "report.xlsx",
 *   sheets: [{
 *     name: "Data",
 *     data: [
 *       { name: "Item 1", value: 100 },
 *       { name: "Item 2", value: 200 },
 *     ],
 *     columns: [
 *       { header: "Name", key: "name", width: 20 },
 *       { header: "Value", key: "value", width: 15 },
 *     ]
 *   }]
 * });
 */
export function exportToExcel<T extends Record<string, unknown>>(
  options: ExcelExportOptions<T>
): void {
  const { filename = generateFilename("export", "xlsx"), sheets } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const { name, data, columns } = sheet;

    let sheetData: Record<string, unknown>[];
    let colWidths: { wch: number }[] | undefined;

    if (columns) {
      // Map data to column structure
      sheetData = data.map((row) => {
        const mapped: Record<string, unknown> = {};
        for (const col of columns) {
          let value = row[col.key];
          // Handle confidence objects
          value = getValue(value as unknown);
          // Apply transform if provided
          if (col.transform) {
            value = col.transform(value);
          }
          mapped[col.header] = value;
        }
        return mapped;
      });

      // Set column widths
      colWidths = columns.map((col) => ({ wch: col.width || 15 }));
    } else {
      // Use data as-is, extracting values from confidence objects
      sheetData = data.map((row) => {
        const mapped: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          mapped[key] = getValue(value as unknown);
        }
        return mapped;
      });
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sheetData);

    // Apply column widths
    if (colWidths) {
      ws["!cols"] = colWidths;
    }

    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  // Generate and download file
  XLSX.writeFile(wb, filename);
}

/**
 * Export a simple table to Excel
 *
 * @example
 * import { exportTableToExcel } from "@tasco/export/excel";
 *
 * exportTableToExcel(
 *   [
 *     { name: "Item 1", price: 100 },
 *     { name: "Item 2", price: 200 },
 *   ],
 *   "products.xlsx"
 * );
 */
export function exportTableToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename?: string,
  sheetName = "Sheet1"
): void {
  exportToExcel({
    filename,
    sheets: [{ name: sheetName, data }],
  });
}

// ============================================================
// Specialized Export Functions for Common Use Cases
// ============================================================

/**
 * Order item for Bravo ERP export
 */
export interface BravoOrderItem {
  productCode: string | { value: string; confidence: number };
  productName: string | { value: string; confidence: number };
  quantity: number | { value: number; confidence: number };
  unit: string | { value: string; confidence: number };
  unitPrice: number | { value: number; confidence: number };
  amount: number;
}

/**
 * Order for Bravo ERP export
 */
export interface BravoOrder {
  id: string;
  customerName: string | { value: string; confidence: number };
  customerCode: string | { value: string; confidence: number };
  orderDate: string | { value: string; confidence: number };
  deliveryDate: string | { value: string; confidence: number };
  items: BravoOrderItem[];
  totalAmount: number;
  notes?: string | { value: string; confidence: number };
}

/**
 * Export orders to Bravo ERP format
 *
 * Generates an Excel file in Bravo ERP's import template format.
 *
 * @example
 * import { exportToBravoExcel } from "@tasco/export/excel";
 *
 * exportToBravoExcel(orders, "bravo-orders.xlsx");
 */
export function exportToBravoExcel(
  orders: BravoOrder[],
  filename = "bravo-orders.xlsx"
): void {
  // Prepare data for Bravo format
  const bravoData: Record<string, unknown>[] = [];

  for (const order of orders) {
    const customerName = getValue(order.customerName);
    const customerCode = getValue(order.customerCode);
    const orderDate = getValue(order.orderDate);
    const deliveryDate = getValue(order.deliveryDate);
    const notes = order.notes ? getValue(order.notes) : "";

    // Add rows for each item in the order
    for (let index = 0; index < order.items.length; index++) {
      const item = order.items[index];
      bravoData.push({
        "Order ID": order.id,
        "Customer Code": customerCode,
        "Customer Name": customerName,
        "Order Date": orderDate,
        "Delivery Date": deliveryDate,
        "Line Item": index + 1,
        "Product Code": getValue(item.productCode),
        "Product Name": getValue(item.productName),
        Quantity: getValue(item.quantity),
        Unit: getValue(item.unit),
        "Unit Price": getValue(item.unitPrice),
        Amount: item.amount,
        Notes: index === 0 ? notes : "",
      });
    }

    // Add total row
    bravoData.push({
      "Order ID": order.id,
      "Customer Code": "",
      "Customer Name": "",
      "Order Date": "",
      "Delivery Date": "",
      "Line Item": "",
      "Product Code": "",
      "Product Name": "TOTAL",
      Quantity: "",
      Unit: "",
      "Unit Price": "",
      Amount: order.totalAmount,
      Notes: "",
    });

    // Add empty row for separation
    bravoData.push({
      "Order ID": "",
      "Customer Code": "",
      "Customer Name": "",
      "Order Date": "",
      "Delivery Date": "",
      "Line Item": "",
      "Product Code": "",
      "Product Name": "",
      Quantity: "",
      Unit: "",
      "Unit Price": "",
      Amount: "",
      Notes: "",
    });
  }

  exportToExcel({
    filename,
    sheets: [
      {
        name: "Orders",
        data: bravoData,
        columns: [
          { header: "Order ID", key: "Order ID", width: 12 },
          { header: "Customer Code", key: "Customer Code", width: 15 },
          { header: "Customer Name", key: "Customer Name", width: 25 },
          { header: "Order Date", key: "Order Date", width: 12 },
          { header: "Delivery Date", key: "Delivery Date", width: 12 },
          { header: "Line Item", key: "Line Item", width: 10 },
          { header: "Product Code", key: "Product Code", width: 15 },
          { header: "Product Name", key: "Product Name", width: 30 },
          { header: "Quantity", key: "Quantity", width: 10 },
          { header: "Unit", key: "Unit", width: 10 },
          { header: "Unit Price", key: "Unit Price", width: 12 },
          { header: "Amount", key: "Amount", width: 15 },
          { header: "Notes", key: "Notes", width: 30 },
        ],
      },
    ],
  });
}

/**
 * Export a single order to Bravo ERP format
 */
export function exportSingleOrderToBravo(order: BravoOrder): void {
  const filename = generateFilename(`bravo-order-${order.id}`, "xlsx");
  exportToBravoExcel([order], filename);
}

/**
 * Get Bravo export data as JSON (for API calls)
 */
export function getBravoExportData(orders: BravoOrder[]) {
  return orders.map((order) => ({
    orderId: order.id,
    customerCode: getValue(order.customerCode),
    customerName: getValue(order.customerName),
    orderDate: getValue(order.orderDate),
    deliveryDate: getValue(order.deliveryDate),
    items: order.items.map((item) => ({
      productCode: getValue(item.productCode),
      productName: getValue(item.productName),
      quantity: getValue(item.quantity),
      unit: getValue(item.unit),
      unitPrice: getValue(item.unitPrice),
      amount: item.amount,
    })),
    totalAmount: order.totalAmount,
    notes: order.notes ? getValue(order.notes) : "",
  }));
}
