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

export const splitRecursively = (
  text: string,
  chunkSize = CHUNK_SIZE,
  separators = ["\n\n", "\n", ". ", " "],
): string[] => {
  if (!text) {
    return [];
  }

  if (text.length <= chunkSize) {
    return [text];
  }

  // Find the first separator present in the text
  const chosenSep = separators.find((sep) => text.includes(sep));

  // Fallback if no separators match: split by character length safely
  if (!chosenSep) {
    const rawChunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      rawChunks.push(text.slice(i, i + chunkSize));
    }
    return rawChunks;
  }

  const splits = text.split(chosenSep);
  const nextSeparators = separators.slice(separators.indexOf(chosenSep) + 1);
  const chunks: string[] = [];
  let current = "";

  for (let i = 0; i < splits.length; i++) {
    const piece = splits[i];
    // Re-attach the separator if it's not the last element
    const pieceWithSep = i < splits.length - 1 ? `${piece}${chosenSep}` : piece;

    if ((current + pieceWithSep).length <= chunkSize) {
      current += pieceWithSep;
    } else {
      if (current) {
        chunks.push(current);
      }

      if (pieceWithSep.length > chunkSize) {
        // Safe recursion passing down the current piece with its separator intact
        chunks.push(
          ...splitRecursively(pieceWithSep, chunkSize, nextSeparators),
        );
        current = "";
      } else {
        current = pieceWithSep;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
};

/**
 * Creates true overlapping chunks across a continuous series of atomic text pieces.
 */
export const chunkPages = (
  pages: ExtractedPage[],
  chunkSize = CHUNK_SIZE,
  chunkOverlap = CHUNK_OVERLAP,
): TextChunk[] => {
  const chunks: TextChunk[] = [];
  let globalChunkIndex = 0;

  // 1. Process pages into smaller structural fragments while tracking their origin page
  const fragments: { text: string; pageNumber: number }[] = [];

  for (const page of pages) {
    // Split by the smallest common denominator (words/spaces) to create basic fragments
    const baseSplits = splitRecursively(page.text, chunkSize - chunkOverlap);
    for (const split of baseSplits) {
      if (split) {
        fragments.push({ text: split, pageNumber: page.pageNumber });
      }
    }
  }

  // 2. Build overlapping windows using the fragments across page lines
  let i = 0;
  while (i < fragments.length) {
    let currentChunkText = "";
    let startPageNumber = fragments[i].pageNumber;
    let j = i;

    // Expand forward until we hit the maximum chunk size limit
    while (
      j < fragments.length &&
      (currentChunkText + fragments[j].text).length <= chunkSize
    ) {
      currentChunkText += fragments[j].text;
      j++;
    }

    if (currentChunkText.trim()) {
      chunks.push({
        content: currentChunkText.trim(),
        pageNumber: startPageNumber,
        chunkIndex: globalChunkIndex++,
      });
    }

    // Step forward based on overlap window size rather than resetting blindly to index j
    // This maintains continuity across boundaries
    const nextIndex = fragments.findIndex(
      (f, idx) =>
        idx > i &&
        fragments
          .slice(idx, j)
          .map((f) => f.text)
          .join("").length <= chunkOverlap,
    );

    if (nextIndex !== -1 && nextIndex < j) {
      i = nextIndex;
    } else {
      i = j; // Fallback if a single fragment is massive
    }

    if (j === fragments.length && i === nextIndex) break; // Prevent infinite loops at execution completion
  }

  return chunks;
};
