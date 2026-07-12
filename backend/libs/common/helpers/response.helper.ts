import type { Response } from 'express';
import { ApiResponse } from '../classes/api-response';

export function sendSuccess<TData>(
  res: Response,
  message: string,
  data: TData,
  httpCode: number,
) {
  return res
    .status(httpCode)
    .json(new ApiResponse(true, message, httpCode, data));
}

export function sendError(
  res: Response,
  error: unknown,
  httpCode: number,
) {
  const message = error instanceof Error ? error.message : 'Internal server error';

  return res
    .status(httpCode)
    .json(new ApiResponse(false, message, httpCode, []));
}
