import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { type PublicUser, publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import { normalizeEmail } from '../utils/email.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  currentPassword?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
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
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, password: true },
  });

  if (!current) {
    throw new AppError(404, 'Pengguna tidak ditemukan');
  }

  const data: Prisma.UserUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);

    // Email hanya boleh diubah setelah password saat ini diverifikasi, supaya
    // token yang dicuri tidak bisa memindahkan akun ke email penyerang.
    if (email !== current.email) {
      if (input.currentPassword === undefined) {
        throw new AppError(422, 'Password saat ini wajib diisi untuk mengubah email');
      }

      if (!(await verifyPassword(input.currentPassword, current.password))) {
        throw new AppError(403, 'Password saat ini salah');
      }

      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

      if (existing && existing.id !== userId) {
        throw new AppError(409, 'Email sudah digunakan pengguna lain');
      }

      data.email = email;
    }
  }

  // Email tidak berubah dan tidak ada field lain: tidak ada yang perlu ditulis.
  if (Object.keys(data).length === 0) {
    return getProfile(userId);
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

/**
 * Mengubah password milik sendiri (AGENTS.md §6.1).
 *
 * Password lama wajib diverifikasi: tanpa itu, token yang dicuri cukup untuk
 * mengambil alih akun secara permanen. Token JWT yang sudah beredar tetap sah
 * sampai kedaluwarsa karena tidak ada penyimpanan sesi di server.
 */
export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new AppError(404, 'Pengguna tidak ditemukan');
  }

  if (!(await verifyPassword(input.currentPassword, user.password))) {
    throw new AppError(403, 'Password saat ini salah');
  }

  if (await verifyPassword(input.newPassword, user.password)) {
    throw new AppError(422, 'Password baru tidak boleh sama dengan password saat ini');
  }

  const passwordHash = await hashPassword(input.newPassword);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(404, 'Pengguna tidak ditemukan');
    }
    throw error;
  }
}
