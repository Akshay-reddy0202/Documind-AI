import { reEmbedAllChunks } from "../documents/services/re-embedding.service.js";

const run = async (): Promise<void> => {
  await reEmbedAllChunks();
};

run();