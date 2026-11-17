import { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import type { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator.js';

/**
 * Membuat proyek baru.
 * Otomatis menetapkan pembuat sebagai OWNER dan mendaftarkannya ke dalam ProjectMember (AGENTS.md §6.2).
 */
export async function createProject(userId: string, input: CreateProjectInput) {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        ownerId: userId,
      },
      include: {
        owner: { select: publicUserSelect },
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: Role.OWNER,
      },
    });

    return {
      ...project,
      currentUserRole: Role.OWNER,
      _count: {
        members: 1,
        tasks: 0,
      },
    };
  });
}

/**
 * Mengambil daftar proyek yang dimiliki atau diikuti oleh pengguna (AGENTS.md §6.2, §6.6).
 */
export async function getUserProjects(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          owner: { select: publicUserSelect },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return memberships.map((m) => ({
    ...m.project,
    currentUserRole: m.role,
  }));
}

/**
 * Mengambil detail proyek beserta daftar anggota dan ringkasan tugas (AGENTS.md §6.2).
 */
export async function getProjectDetail(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: publicUserSelect },
      members: {
        include: {
          user: { select: publicUserSelect },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(404, 'Proyek tidak ditemukan');
  }

  return project;
}

/**
 * Mengubah informasi proyek (hanya OWNER dan ADMIN, AGENTS.md §6.5).
 */
export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const data: Prisma.ProjectUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.description !== undefined) {
    data.description = input.description;
  }

  return await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: { select: publicUserSelect },
      _count: {
        select: { members: true, tasks: true },
      },
    },
  });
}

/**
 * Menghapus proyek beserta seluruh relasinya (hanya OWNER, AGENTS.md §6.2, §6.5).
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(404, 'Proyek tidak ditemukan');
    }
    throw error;
  }
}

