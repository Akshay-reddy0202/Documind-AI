import type { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
