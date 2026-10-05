import { Router } from "express";
import healthRouter from "./health.routes.js";
import documentRouter from "../modules/documents/documents.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";

const router = Router();
router.use("/health", healthRouter);
router.use("/documents", documentRouter);
router.use("/chat", chatRoutes);

export default router;
