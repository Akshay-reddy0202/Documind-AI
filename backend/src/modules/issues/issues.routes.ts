import { Router } from "express";
import { getIssues, getIssueById } from "./issues.controller.js";

const router = Router();

router.get("/", getIssues);
router.get("/:id", getIssueById);

export default router;
