import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { type PublicUser, publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import { normalizeEmail } from '../utils/email.js';

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, 'Pengguna tidak ditemukan');
  }

  return user;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const data: Prisma.UserUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (existing && existing.id !== userId) {
      throw new AppError(409, 'Email sudah digunakan pengguna lain');
    }

    data.email = email;
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Pengguna tidak ditemukan');
      }
      if (error.code === 'P2002') {
        throw new AppError(409, 'Email sudah digunakan pengguna lain');
      }
    }
    throw error;
  }
}
