import type { Request, Response } from 'express';
import { apiEndpoints } from '../routes/apiCatalog.js';
import { sendSuccess } from '../utils/response.js';

/**
 * GET /api/v1 — daftar endpoint yang tersedia.
 *
 * Tidak memerlukan autentikasi karena hanya memuat metadata kontrak API,
 * bukan data aplikasi.
 */
export function listEndpoints(_req: Request, res: Response): void {
  sendSuccess({
    res,
    message: 'Daftar endpoint TaskFlow API',
    data: {
      name: 'TaskFlow API',
      version: 'v1',
      basePath: '/api/v1',
      total: apiEndpoints.length,
      endpoints: apiEndpoints,
    },
  });
}
