import { Response } from "express";

type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  message: string;
};

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
