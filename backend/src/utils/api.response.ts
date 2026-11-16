import type { Response } from "express";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/api.types.js";

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200,
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
