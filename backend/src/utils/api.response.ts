import { Response } from "express";
import { success } from "zod";

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
): Response<ApiSuccessResponse<T>> => {
  return res.status(200).json({
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
