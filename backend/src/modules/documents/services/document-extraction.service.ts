import { PDFParse } from "pdf-parse";
import type { ExtractedPage } from "../../chunking/chunking.types.js";

export const extractPdfPages = async (
  fileBuffer: Buffer,
): Promise<ExtractedPage[]> => {
  const parser = new PDFParse({
    data: fileBuffer,
  });

  try {
    const result = await parser.getText();

    return result.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }));
  } finally {
    await parser.destroy();
  }
};