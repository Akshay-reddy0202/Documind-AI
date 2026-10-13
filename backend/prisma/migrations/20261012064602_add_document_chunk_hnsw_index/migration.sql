-- This is an empty migration.
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw_idx"
ON "DocumentChunk"
USING hnsw (
    ("embedding"::halfvec(3072)) halfvec_cosine_ops
)
WITH (
    m = 16,
    ef_construction = 64
);