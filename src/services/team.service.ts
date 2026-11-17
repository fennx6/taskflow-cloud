import { randomBytes } from 'node:crypto';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateInvitationInput,
  UpdateMemberRoleInput,
} from '../validators/team.validator.js';

/**
 * Mengambil daftar seluruh anggota proyek beserta data profil dan rolenya (AGENTS.md §6.4).
 */
export async function getProjectMembers(projectId: string) {
  return await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: publicUserSelect },
    },
    orderBy: [
      { role: 'asc' }, // OWNER -> ADMIN -> MEMBER
      { joinedAt: 'asc' },
    ],
  });
}

/**
 * Membuat dan mengirim undangan bergabung ke proyek (hanya OWNER dan ADMIN, AGENTS.md §6.4, §6.5).
 */
export async function createInvitation(projectId: string, input: CreateInvitationInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMember) {
      throw new AppError(409, 'Pengguna dengan email tersebut sudah menjadi anggota proyek ini');
    }
  }

  const activeInvitation = await prisma.invitation.findFirst({
    where: {
      projectId,
      email: input.email,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
  });

  if (activeInvitation) {
    throw new AppError(409, 'Undangan aktif sudah pernah dikirimkan ke email ini');
  }

  // Token acak 32-byte hex yang aman dan sulit ditebak (AGENTS.md §6.4)
  const token = randomBytes(32).toString('hex');
  // Masa berlaku 7 hari (AGENTS.md §6.4)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.invitation.create({
    data: {
      projectId,
      email: input.email,
      role: input.role,
      token,
      expiresAt,
    },
  });
}

/**
 * Mengubah role anggota proyek (hanya OWNER dan ADMIN sesuai wewenang, AGENTS.md §6.4, §6.5).
 */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  currentUserId: string,
  input: UpdateMemberRoleInput,
) {
  const currentMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: currentUserId,
      },
    },
  });

  if (!currentMember || (currentMember.role !== Role.OWNER && currentMember.role !== Role.ADMIN)) {
    throw new AppError(403, 'Hanya OWNER dan ADMIN yang dapat mengubah role anggota');
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: { user: { select: publicUserSelect } },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    throw new AppError(404, 'Anggota proyek tidak ditemukan');
  }

  if (targetMember.role === Role.OWNER) {
    throw new AppError(403, 'Role OWNER proyek tidak dapat diubah');
  }

  // Aturan proteksi ADMIN:
  // ADMIN tidak boleh mengubah role ADMIN lain dan tidak boleh mengubah rolenya sendiri
  if (currentMember.role === Role.ADMIN) {
    if (targetMember.role === Role.ADMIN) {
      throw new AppError(403, 'Hanya OWNER yang dapat mengubah role anggota berstatus ADMIN');
    }
    if (targetMember.userId === currentUserId) {
      throw new AppError(403, 'Anda tidak dapat mengubah role Anda sendiri');
    }
  }

  return await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: input.role },
    include: {
      user: { select: publicUserSelect },
    },
  });
}

/**
 * Mengeluarkan anggota dari proyek atau keluar sendiri dari proyek (AGENTS.md §6.4, §6.5).
 * Otomatis melepaskan tugas yang di-assign kepada anggota yang keluar.
 */
export async function removeMember(
  projectId: string,
  memberId: string,
  currentUserId: string,
): Promise<void> {
  const currentMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: currentUserId,
      },
    },
  });

  if (!currentMember) {
    throw new AppError(403, 'Anda bukan anggota proyek ini');
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    throw new AppError(404, 'Anggota proyek tidak ditemukan');
  }

  if (targetMember.role === Role.OWNER) {
    throw new AppError(403, 'OWNER proyek tidak dapat dikeluarkan dari proyek');
  }

  // Hak akses penghapusan anggota
  if (currentMember.role === Role.MEMBER && targetMember.userId !== currentUserId) {
    throw new AppError(403, 'Anggota biasa (MEMBER) hanya dapat mengeluarkan diri sendiri');
  }

  if (currentMember.role === Role.ADMIN) {
    if (targetMember.role === Role.ADMIN && targetMember.userId !== currentUserId) {
      throw new AppError(403, 'Hanya OWNER yang dapat mengeluarkan anggota berstatus ADMIN');
    }
  }

  // Transaksi penghapusan keanggotaan dan pembersihan tugas terkait (AGENTS.md §6.3)
  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: {
        projectId,
        assigneeId: targetMember.userId,
      },
      data: {
        assigneeId: null,
      },
    });

    await tx.projectMember.delete({
      where: { id: memberId },
    });
  });
}

/**
 * Menerima undangan bergabung ke proyek menggunakan token (AGENTS.md §6.4).
 * Memvalidasi kepemilikan akun penerima, masa berlaku, dan status undangan.
 */
export async function acceptInvitation(
  userId: string,
  userEmail: string,
  token: string,
) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new AppError(404, 'Undangan tidak ditemukan atau token tidak valid');
  }

  if (invitation.status !== 'PENDING') {
    throw new AppError(400, `Undangan sudah ${invitation.status.toLowerCase()}`);
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw new AppError(400, 'Undangan telah kedaluwarsa');
  }

  // Menjamin pengguna tidak menerima undangan akun lain (AGENTS.md §6.4)
  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new AppError(403, 'Undangan ini ditujukan untuk alamat email yang berbeda dari akun Anda');
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: invitation.projectId,
        userId,
      },
    },
  });

  if (existingMember) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });
    throw new AppError(409, 'Anda sudah menjadi anggota proyek ini');
  }

  return await prisma.$transaction(async (tx) => {
    const member = await tx.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId,
        role: invitation.role,
      },
      include: {
        project: true,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    return member;
  });
}

