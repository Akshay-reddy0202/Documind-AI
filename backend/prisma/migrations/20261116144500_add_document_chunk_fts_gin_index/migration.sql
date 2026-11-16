-- Create GIN index on DocumentChunk content for high-performance Full-Text Search
CREATE INDEX IF NOT EXISTS "DocumentChunk_content_fts_idx"
ON "DocumentChunk"
USING gin (to_tsvector('english', "content"));
