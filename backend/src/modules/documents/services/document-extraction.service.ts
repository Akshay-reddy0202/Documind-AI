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

/**
 * Splits plain text / markdown / log / json / csv content into logical pages.
 * If text contains form feeds (\f), split by form feed.
 * Otherwise, groups lines into logical pages (~2,500 characters per page)
 * so page-level source citations remain meaningful.
 */
export const extractTextPages = (
  fileBuffer: Buffer,
  charsPerPage = 2500,
): ExtractedPage[] => {
  const content = fileBuffer.toString("utf-8").trim();
  if (!content) return [];

  // If text contains explicit form-feed page breaks
  if (content.includes("\f")) {
    const pages = content
      .split("\f")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return pages.map((text, idx) => ({
      pageNumber: idx + 1,
      text,
    }));
  }

  // Split content by lines to avoid cutting sentences or words awkwardly
  const lines = content.split(/\r?\n/);
  const pages: ExtractedPage[] = [];
  let currentPageLines: string[] = [];
  let currentLength = 0;
  let pageNumber = 1;

  for (const line of lines) {
    if (
      currentLength + line.length + 1 > charsPerPage &&
      currentPageLines.length > 0
    ) {
      pages.push({
        pageNumber,
        text: currentPageLines.join("\n").trim(),
      });
      pageNumber += 1;
      currentPageLines = [line];
      currentLength = line.length;
    } else {
      currentPageLines.push(line);
      currentLength += line.length + 1;
    }
  }

  if (currentPageLines.length > 0) {
    const lastText = currentPageLines.join("\n").trim();
    if (lastText) {
      pages.push({
        pageNumber,
        text: lastText,
      });
    }
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text: content }];
};

export const extractDocumentPages = async (
  fileBuffer: Buffer,
  fileName: string,
): Promise<ExtractedPage[]> => {
  if (fileName.toLowerCase().endsWith(".pdf")) {
    return extractPdfPages(fileBuffer);
  }
  return extractTextPages(fileBuffer);
};
