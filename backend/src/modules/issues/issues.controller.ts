import type { Request, Response } from "express";
import { ZodError } from "zod";
import { issuesService } from "./issues.factory.js";
import { issueFilterSchema, issueIdParamSchema } from "./issues.validation.js";
import { successResponse, errorResponse } from "../../utils/api.response.js";

export const getIssues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = issueFilterSchema.parse(req.query);
    const data = await issuesService.listIssues(filters);
    return successResponse(res, "Issues retrieved successfully", data);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        400,
        error.issues[0]?.message ?? "Invalid query parameters",
      );
    }
    const message = error instanceof Error ? error.message : "Failed to retrieve issues";
    return errorResponse(res, 500, message);
  }
};

export const getIssueById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = issueIdParamSchema.parse(req.params);
    const issue = await issuesService.getIssueById(id);

    if (!issue) {
      return errorResponse(res, 404, "Issue not found");
    }

    return successResponse(res, "Issue details retrieved successfully", issue);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        400,
        error.issues[0]?.message ?? "Invalid issue ID parameter",
      );
    }
    const message = error instanceof Error ? error.message : "Failed to retrieve issue details";
    return errorResponse(res, 500, message);
  }
};
