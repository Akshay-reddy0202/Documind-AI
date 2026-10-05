import { ragService } from "./rag.factory.js";

const result = await ragService.answerQuestion(
  "What is my name?",
  5,
);

console.log("ANSWER:");
console.log(result.answer);

console.log("\nSOURCES:");
console.log(result.sources);

process.exit(0);