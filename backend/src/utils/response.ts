import type { Response } from 'express';

/**
 * Format response mengikuti AGENTS.md §8.6, dipakai bersama oleh seluruh modul.
 */
export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: unknown[];
}

interface SuccessOptions<T> {
  res: Response;
  data: T;
  message?: string;
  statusCode?: number;
}

export function sendSuccess<T>({
  res,
  data,
  message = 'Request berhasil',
  statusCode = 200,
}: SuccessOptions<T>): Response {
  const body: ApiSuccessBody<T> = { success: true, message, data };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors: unknown[] = [],
): Response {
  const body: ApiErrorBody = { success: false, message, errors };
  return res.status(statusCode).json(body);
}
