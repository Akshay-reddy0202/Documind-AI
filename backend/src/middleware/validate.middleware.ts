import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { errorResponse } from "../utils/api.response.js";

type RequestSchema = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validate = (schema: RequestSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validations = [
      schema.body?.safeParse(req.body),
      schema.params?.safeParse(req.params),
      schema.query?.safeParse(req.query),
    ];

    const failedValidation = validations.find(
      (result) => result && !result.success,
    );

    if (failedValidation && !failedValidation.success) {
      errorResponse(
        res,
        400,
        failedValidation.error.issues[0]?.message ?? "Invalid request",
      );
      return;
    }

    next();
  };
};
