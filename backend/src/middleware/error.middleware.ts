import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
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

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
