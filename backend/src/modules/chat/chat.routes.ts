import { Router } from "express";
import { chat } from "./chat.controller.js";

const router = Router();

router.post("/", chat);

export default router;
