import assert from "node:assert/strict";
import { splitRecursively } from "./chunking.service.js";

const runTest = (name: string, test: () => void): void => {
  try {
    test();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

// 1. Empty text
runTest("should return an empty array for empty text", () => {
  assert.deepEqual(splitRecursively(""), []);
});

// 2. Short text
runTest("should return short text unchanged", () => {
  const text = "Hello, DocuMind AI!";

  assert.deepEqual(splitRecursively(text), [text]);
});

// 3. Text exactly equal to the chunk size
runTest("should not split text equal to the chunk size", () => {
  const text = "A".repeat(10);

  assert.deepEqual(splitRecursively(text, 10), [text]);
});

// 4. Long text without separators
runTest("should split long text within the size limit", () => {
  const text = "A".repeat(25);

  const chunks = splitRecursively(text, 10);

  assert.ok(chunks.every((chunk) => chunk.length <= 10));
});

// 5. Preserve all characters
runTest("should preserve all characters after splitting", () => {
  const text = "A".repeat(25);

  const chunks = splitRecursively(text, 10);

  assert.equal(chunks.join(""), text);
});

// 6. Preserve leading and trailing whitespace
runTest("should preserve leading and trailing whitespace", () => {
  const text = "  Hello world  ";

  assert.deepEqual(splitRecursively(text, 20), [text]);
});

// 7. Preserve trailing separators
runTest("should preserve trailing separators", () => {
  const text = "First paragraph\n\n";

  const chunks = splitRecursively(text, 10);

  assert.equal(chunks.join(""), text);
});

// 8. Prefer paragraph boundaries
runTest("should prefer paragraph boundaries", () => {
  const text = "AAAAAAAA\n\nBBBBBBBB";

  const chunks = splitRecursively(text, 12);

  assert.equal(chunks.join(""), text);
  assert.ok(chunks.every((chunk) => chunk.length <= 12));
  assert.equal(chunks.length, 2);
});

// 9. Preserve repeated separators
runTest("should preserve repeated separators", () => {
  const text = "Hello\n\n\n\nWorld\n\n";

  const chunks = splitRecursively(text, 8);

  assert.equal(chunks.join(""), text);
  assert.ok(chunks.every((chunk) => chunk.length <= 8));
});

// 10. Handle a long paragraph
runTest("should split a long paragraph within the size limit", () => {
  const text = "word ".repeat(500);

  const chunks = splitRecursively(text, 100);

  assert.ok(chunks.every((chunk) => chunk.length <= 100));
  assert.equal(chunks.join(""), text);
});

console.log("\nTest execution completed.");