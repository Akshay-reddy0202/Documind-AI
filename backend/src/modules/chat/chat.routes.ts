import { Router } from "express";
import {
  chat,
  getConversationHistory,
  getAllConversations,
  deleteConversation,
} from "./chat.controller.js";

const router = Router();

router.post("/", chat);
router.get("/", getAllConversations);
router.get("/:conversationId", getConversationHistory);
router.delete("/:conversationId", deleteConversation);

export default router;
