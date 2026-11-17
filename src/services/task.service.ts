import { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { publicUserSelect } from '../lib/userSelect.js';
import { AppError } from '../utils/AppError.js';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../validators/task.validator.js';

/**
 * Membuat tugas baru di dalam suatu proyek (AGENTS.md §6.3).
 * Memvalidasi bahwa anggota yang ditugaskan (assignee) terdaftar dalam keanggotaan proyek terkait.
 */
export async function createTask(projectId: string, input: CreateTaskInput) {
  if (input.assigneeId) {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: input.assigneeId,
        },
      },
    });

    if (!member) {
      throw new AppError(400, 'Pengguna yang ditugaskan harus merupakan anggota proyek terkait');
    }
  }

  return await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'TODO',
      priority: input.priority ?? 'MEDIUM',
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
    },
    include: {
      assignee: { select: publicUserSelect },
    },
  });
}

/**
 * Mengambil daftar tugas dalam proyek tertentu dengan filter status, prioritas, dan assignee (AGENTS.md §6.3).
 */
export async function getProjectTasks(projectId: string, filter: ListTasksQuery) {
  return await prisma.task.findMany({
    where: {
      projectId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.priority ? { priority: filter.priority } : {}),
      ...(filter.assigneeId ? { assigneeId: filter.assigneeId } : {}),
    },
    include: {
      assignee: { select: publicUserSelect },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Mengambil detail tugas berdasarkan taskId (Data Isolation: hanya anggota proyek yang dapat melihat, AGENTS.md §6.6).
 */
export async function getTaskDetail(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
      assignee: { select: publicUserSelect },
    },
  });

  if (!task) {
    throw new AppError(404, 'Tugas tidak ditemukan');
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Anda tidak memiliki akses ke tugas ini');
  }

  return {
    ...task,
    currentUserRole: membership.role,
  };
}

/**
 * Memperbarui tugas berdasarkan taskId (RBAC & Data Isolation, AGENTS.md §6.3, §6.5).
 * - OWNER dan ADMIN: dapat memperbarui seluruh field tugas.
 * - MEMBER: hanya dapat memperbarui status tugas yang menjadi tanggung jawabnya (assignee).
 */
export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, 'Tugas tidak ditemukan');
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Anda tidak memiliki akses ke tugas ini');
  }

  // Pengecekan hak akses MEMBER (AGENTS.md §6.5)
  if (membership.role === Role.MEMBER) {
    if (task.assigneeId !== userId) {
      throw new AppError(403, 'Anda hanya dapat memperbarui tugas yang ditugaskan kepada Anda');
    }

    if (
      input.title !== undefined ||
      input.description !== undefined ||
      input.priority !== undefined ||
      input.assigneeId !== undefined ||
      input.dueDate !== undefined
    ) {
      throw new AppError(403, 'Anggota tim (MEMBER) hanya diizinkan untuk mengubah status tugas');
    }
  }

  // Jika assignee diubah, pastikan assignee baru adalah anggota proyek
  if (input.assigneeId) {
    const newAssigneeMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: input.assigneeId,
        },
      },
    });

    if (!newAssigneeMember) {
      throw new AppError(400, 'Pengguna yang ditugaskan harus merupakan anggota proyek terkait');
    }
  }

  const data: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assigneeId !== undefined) {
    data.assignee = input.assigneeId
      ? { connect: { id: input.assigneeId } }
      : { disconnect: true };
  }
  if (input.dueDate !== undefined) data.dueDate = input.dueDate;

  return await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: { select: publicUserSelect },
    },
  });
}

/**
 * Menghapus tugas (hanya OWNER dan ADMIN proyek, AGENTS.md §6.3, §6.5).
 */
export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, 'Tugas tidak ditemukan');
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Anda tidak memiliki akses ke tugas ini');
  }

  if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
    throw new AppError(403, 'Hanya OWNER dan ADMIN yang diizinkan untuk menghapus tugas');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });
}

