import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { type PublicUser, publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import { normalizeEmail } from '../utils/email.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const email = normalizeEmail(input.email);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new AppError(409, 'Email sudah terdaftar');
  }

  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: { name: input.name.trim(), email, password: passwordHash },
      select: publicUserSelect,
    });
  } catch (error) {
    // Menangani dua request registrasi bersamaan dengan email yang sama.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email sudah terdaftar');
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...publicUserSelect, password: true },
  });

  // Pesan sengaja identik untuk email tidak terdaftar dan password salah,
  // supaya endpoint ini tidak bisa dipakai menebak email mana yang punya akun.
  if (!user) {
    throw new AppError(401, 'Email atau password salah');
  }

  const isPasswordValid = await verifyPassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Email atau password salah');
  }

  const { password: _passwordHash, ...publicUser } = user;

  return {
    token: signAccessToken({ sub: user.id, email: user.email }),
    user: publicUser,
  };
}
