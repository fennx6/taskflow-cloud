import type { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuthUser } from './authenticate.js';
import { AppError } from '../utils/AppError.js';
import type { ProjectContext } from '../types/express.js';

/**
 * Middleware untuk memastikan pengguna adalah anggota proyek (Data Isolation, AGENTS.md §6.6)
 * dan memiliki Role yang diizinkan jika dibatasi (RBAC, AGENTS.md §6.5).
 */
export function requireProjectMember(allowedRoles?: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      const rawProjectId = req.params.projectId;
      const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

      if (!projectId) {
        throw new AppError(400, 'Parameter projectId diperlukan');
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError(404, 'Proyek tidak ditemukan');
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: authUser.id,
          },
        },
      });

      if (!membership) {
        throw new AppError(403, 'Anda tidak memiliki akses ke proyek ini');
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        throw new AppError(403, 'Peran Anda tidak memiliki izin untuk melakukan tindakan ini');
      }

      req.projectContext = {
        project,
        membership,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function getProjectContext(req: Request): ProjectContext {
  if (!req.projectContext) {
    throw new AppError(500, 'Project context belum diinisialisasi');
  }
  return req.projectContext;
}

