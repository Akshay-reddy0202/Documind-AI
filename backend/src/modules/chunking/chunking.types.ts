export type TextChunk = {
    content: string;
    pageNumber: number;
    chunkIndex: number;
  };
  
  export type ExtractedPage = {
    pageNumber: number;
    text: string;
  };