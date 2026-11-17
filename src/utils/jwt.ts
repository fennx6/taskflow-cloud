import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

/**
 * Payload JWT sengaja minimal (id + email) dan tidak pernah memuat role,
 * karena role harus selalu diverifikasi ulang dari database (AGENTS.md §6.6).
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    algorithm: 'HS256',
    subject: payload.sub,
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ email: payload.email }, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  let decoded: string | JwtPayload;

  try {
    // Algoritma dipatok ke HS256: token dengan alg lain (mis. "none") ditolak,
    // bukan hanya diverifikasi berdasarkan secret (praktik standar jsonwebtoken).
    decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new AppError(401, 'Token autentikasi tidak valid atau sudah kedaluwarsa');
  }

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new AppError(401, 'Token autentikasi tidak valid');
  }

  return {
    sub: decoded.sub,
    email: typeof decoded.email === 'string' ? decoded.email : '',
  };
}
