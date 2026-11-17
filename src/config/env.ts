import 'dotenv/config';
import { z } from 'zod';

/**
 * Semua konfigurasi sensitif wajib berasal dari environment variable
 * (AGENTS.md §11). Aplikasi sengaja gagal start kalau konfigurasi tidak valid,
 * supaya tidak berjalan dengan secret kosong tanpa disadari.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  FRONTEND_URL: z.string().min(1).default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`Konfigurasi environment tidak valid:\n${detail}`);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  nodeEnv: data.NODE_ENV,
  port: data.PORT,
  databaseUrl: data.DATABASE_URL,
  jwtSecret: data.JWT_SECRET,
  jwtExpiresIn: data.JWT_EXPIRES_IN,
  frontendUrl: data.FRONTEND_URL,
  isProduction: data.NODE_ENV === 'production',
  isDevelopment: data.NODE_ENV === 'development',
  /** FRONTEND_URL boleh berisi beberapa origin dipisah koma. */
  allowedOrigins: data.FRONTEND_URL.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
};
