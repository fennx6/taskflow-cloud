import type { Request, Response } from 'express';
import { requireAuthUser } from '../middlewares/authenticate.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.registerUser(req.body as RegisterInput);

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Registrasi berhasil',
    data: { user },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.loginUser(req.body as LoginInput);

  sendSuccess({ res, message: 'Login berhasil', data: result });
}

/**
 * JWT bersifat stateless: token tidak bisa dibatalkan dari server tanpa
 * menyimpan blacklist. Untuk fase ini logout berarti client membuang token.
 */
export function logout(_req: Request, res: Response): void {
  sendSuccess({
    res,
    message: 'Logout berhasil, hapus token pada sisi client',
    data: null,
  });
}

export function me(req: Request, res: Response): void {
  const user = requireAuthUser(req);

  sendSuccess({ res, message: 'Data pengguna berhasil diambil', data: { user } });
}
