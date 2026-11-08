import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

/**
 * Satu-satunya tempat error diterjemahkan menjadi response (AGENTS.md §9.2).
 * Detail internal hanya dicetak ke log server, tidak dikirim ke client.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      sendError(res, 409, 'Data sudah ada', [
        { field: formatTarget(error.meta?.target), message: 'Nilai ini sudah digunakan' },
      ]);
      return;
    }

    if (error.code === 'P2025') {
      sendError(res, 404, 'Data tidak ditemukan');
      return;
    }
  }

  const maybeHttpError = error as { status?: number };
  if (error instanceof SyntaxError && maybeHttpError.status === 400) {
    sendError(res, 400, 'Format JSON pada request tidak valid');
    return;
  }

  console.error('[error]', error);

  const errors =
    env.isProduction || !(error instanceof Error) ? [] : [{ message: error.message }];

  sendError(res, 500, 'Terjadi kesalahan pada server', errors);
}

function formatTarget(target: unknown): string {
  if (Array.isArray(target)) {
    return target.map(String).join(', ');
  }
  if (typeof target === 'string') {
    return target;
  }
  return 'unknown';
}
