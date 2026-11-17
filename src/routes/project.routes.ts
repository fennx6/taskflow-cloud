import { Router } from 'express';
import { Role } from '@prisma/client';
import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireProjectMember } from '../middlewares/projectAuth.js';
import { validate } from '../middlewares/validate.js';
import {
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';

export const projectRouter = Router();

// Seluruh endpoint proyek mewajibkan autentikasi JWT (AGENTS.md §8.3)
projectRouter.use(authenticate);

// POST /api/v1/projects — membuat proyek baru
projectRouter.post('/', validate({ body: createProjectSchema }), projectController.createProject);

// GET /api/v1/projects — daftar proyek yang dimiliki atau diikuti pengguna
projectRouter.get('/', projectController.listProjects);

// GET /api/v1/projects/:projectId — detail proyek (hanya anggota proyek, Data Isolation AGENTS.md §6.6)
projectRouter.get(
  '/:projectId',
  validate({ params: projectIdParamSchema }),
  requireProjectMember(),
  projectController.getProject,
);

// PATCH /api/v1/projects/:projectId — update proyek (hanya OWNER dan ADMIN, RBAC AGENTS.md §6.5)
projectRouter.patch(
  '/:projectId',
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  requireProjectMember([Role.OWNER, Role.ADMIN]),
  projectController.updateProject,
);

// DELETE /api/v1/projects/:projectId — hapus proyek (hanya OWNER, RBAC AGENTS.md §6.5)
projectRouter.delete(
  '/:projectId',
  validate({ params: projectIdParamSchema }),
  requireProjectMember([Role.OWNER]),
  projectController.deleteProject,
);

