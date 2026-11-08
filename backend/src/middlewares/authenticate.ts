import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AuthUser } from '../types/auth.js';

/**
 * Middleware autentikasi (AGENTS.md §6.1, §9.2).
 *
 * User diambil ulang dari database setiap request, bukan hanya dipercaya dari isi
 * token. Dengan begitu akun yang sudah dihapus atau email yang berubah langsung
 * kehilangan akses tanpa menunggu token kedaluwarsa.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Token autentikasi tidak ditemukan');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new AppError(401, 'Token autentikasi tidak ditemukan');
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new AppError(401, 'Sesi tidak valid, silakan login kembali');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/** Dipakai controller setelah `authenticate` untuk memastikan user tersedia. */
export function requireAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AppError(401, 'Belum terautentikasi');
  }
  return req.user;
}
