import type { Request, Response, NextFunction } from "express";

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export default notFoundMiddleware;
