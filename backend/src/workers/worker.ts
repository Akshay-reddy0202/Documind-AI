import { documentWorker } from "./document.worker.js";

console.log("DocuMind AI document worker started");

async function shutdown(): Promise<void> {
  console.log("Shutting down document worker...");

  await documentWorker.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
