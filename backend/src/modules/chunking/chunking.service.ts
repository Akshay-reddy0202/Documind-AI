type TextChunk = {
  content: string;
  pageNumber: number;
  chunkIndex: number;
};

type ExtractedPage = {
  pageNumber: number;
  text: string;
};

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

// Split text into paragraphs.
const splitIntoParagraphs = (text: string): string[] => {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
};

const combineParagraphs = (paragraphs: string[]): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      chunks.push(...splitRecursively(paragraph));
      continue;
    }

    const candidate = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (candidate.length <= CHUNK_SIZE) {
      currentChunk = candidate;
    } else {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

// Split long text while preserving separators.
export const splitRecursively = (
  text: string,
  chunkSize = CHUNK_SIZE,
  separators = ["\n\n", "\n", ". ", " "],
): string[] => {
  const trimmed = text.trim();
  if (trimmed.length <= chunkSize) {
    return trimmed ? [trimmed] : [];
  }

 
  let chosenSep = separators.find((sep) => trimmed.includes(sep));


  if (!chosenSep) {
    const rawChunks: string[] = [];
    for (let i = 0; i < trimmed.length; i += chunkSize) {
      rawChunks.push(trimmed.slice(i, i + chunkSize));
    }
    return rawChunks;
  }

  const splits = trimmed.split(chosenSep);
  const nextSeparators = separators.slice(separators.indexOf(chosenSep) + 1);

  const chunks: string[] = [];
  let current = "";

  for (const piece of splits) {
    const candidate = current ? `${current}${chosenSep}${piece}` : piece;

    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      if (current) {
        chunks.push(current.trim());
      }
      
      if (piece.length > chunkSize) {
        chunks.push(...splitRecursively(piece, chunkSize, nextSeparators));
        current = "";
      } else {
        current = piece;
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
};

/**
 * Creates overlapping chunks respecting token/character limits
 */
export const createOverlappingChunks = (
  text: string,
  chunkSize = CHUNK_SIZE,
  chunkOverlap = CHUNK_OVERLAP,
): string[] => {
  const baseChunks = splitRecursively(text, chunkSize - chunkOverlap);
  if (baseChunks.length <= 1) return baseChunks;

  const result: string[] = [];

  for (let i = 0; i < baseChunks.length; i++) {
    let chunk = baseChunks[i];

    // Prepend overlap from previous chunk if available
    if (i > 0) {
      const prev = baseChunks[i - 1];
      const overlapText = prev.slice(-chunkOverlap);
      // Align to closest space so words are not truncated
      const spaceIdx = overlapText.indexOf(" ");
      const cleanOverlap =
        spaceIdx !== -1 ? overlapText.slice(spaceIdx + 1) : overlapText;
      chunk = `${cleanOverlap} ${chunk}`;
    }

    result.push(chunk.trim());
  }

  return result;
};

// Process extracted pages into metadata-bearing chunks.
export const chunkPages = (
    pages: ExtractedPage[],
    chunkSize = CHUNK_SIZE,
    chunkOverlap = CHUNK_OVERLAP
  ): TextChunk[] => {
    const chunks: TextChunk[] = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      const pageChunks = createOverlappingChunks(page.text, chunkSize, chunkOverlap);

      for (const content of pageChunks) {
        if (!content) continue;
        chunks.push({
          content,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
        });
      }
    }

    return chunks;
  };