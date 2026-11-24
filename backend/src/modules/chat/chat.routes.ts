import { Router } from "express";
import {
  chat,
  chatStream,
  getConversationHistory,
  getAllConversations,
  deleteConversation,
} from "./chat.controller.js";

const router = Router();

router.post("/", chat);
router.post("/stream", chatStream);
router.get("/", getAllConversations);
router.get("/:conversationId", getConversationHistory);
router.delete("/:conversationId", deleteConversation);

export default router;
