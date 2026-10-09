import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Requested resource not found",
      });
      return;
    }

    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        message: "Related resource does not exist",
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
