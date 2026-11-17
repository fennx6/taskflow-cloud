import type { Request, Response } from 'express';
import { sendError } from '../utils/response.js';

export function notFound(req: Request, res: Response): void {
  sendError(res, 404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`);
}
