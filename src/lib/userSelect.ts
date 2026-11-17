import { Prisma } from '@prisma/client';

/**
 * Satu-satunya daftar field user yang boleh keluar dari API.
 * `password` (hash bcrypt) tidak pernah ikut terambil (AGENTS.md §6.1).
 */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
