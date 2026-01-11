declare module "pdf-parse" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
    text: string;
  }

  interface Options {
    max?: number;
    version?: string;
    pagerender?: (pageData: unknown) => Promise<string>;
  }

  function PDFParse(
    dataBuffer: Buffer | ArrayBuffer,
    options?: Options
  ): Promise<PDFData>;

  export default PDFParse;
}
