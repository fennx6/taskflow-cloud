import { Router } from 'express';
import { Role } from '@prisma/client';
import * as projectController from '../controllers/project.controller.js';
import * as taskController from '../controllers/task.controller.js';
import * as teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireProjectMember } from '../middlewares/projectAuth.js';
import { validate } from '../middlewares/validate.js';
import {
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';
import { createTaskSchema, listTasksQuerySchema } from '../validators/task.validator.js';
import {
  createInvitationSchema,
  memberIdParamSchema,
  updateMemberRoleSchema,
} from '../validators/team.validator.js';

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

// POST /api/v1/projects/:projectId/tasks — membuat tugas baru di proyek (AGENTS.md §8.4)
projectRouter.post(
  '/:projectId/tasks',
  validate({ params: projectIdParamSchema, body: createTaskSchema }),
  requireProjectMember(),
  taskController.createTask,
);

// GET /api/v1/projects/:projectId/tasks — melihat daftar tugas proyek (AGENTS.md §8.4)
projectRouter.get(
  '/:projectId/tasks',
  validate({ params: projectIdParamSchema, query: listTasksQuerySchema }),
  requireProjectMember(),
  taskController.listProjectTasks,
);

// GET /api/v1/projects/:projectId/members — melihat daftar anggota tim (AGENTS.md §8.5)
projectRouter.get(
  '/:projectId/members',
  validate({ params: projectIdParamSchema }),
  requireProjectMember(),
  teamController.listMembers,
);

// POST /api/v1/projects/:projectId/invitations — mengundang anggota tim (hanya OWNER dan ADMIN, AGENTS.md §8.5)
projectRouter.post(
  '/:projectId/invitations',
  validate({ params: projectIdParamSchema, body: createInvitationSchema }),
  requireProjectMember([Role.OWNER, Role.ADMIN]),
  teamController.createInvitation,
);

// PATCH /api/v1/projects/:projectId/members/:memberId — mengubah role anggota (hanya OWNER dan ADMIN, AGENTS.md §8.5)
projectRouter.patch(
  '/:projectId/members/:memberId',
  validate({ params: memberIdParamSchema, body: updateMemberRoleSchema }),
  requireProjectMember([Role.OWNER, Role.ADMIN]),
  teamController.updateMemberRole,
);

// DELETE /api/v1/projects/:projectId/members/:memberId — mengeluarkan anggota / keluar dari proyek (AGENTS.md §8.5)
projectRouter.delete(
  '/:projectId/members/:memberId',
  validate({ params: memberIdParamSchema }),
  requireProjectMember(),
  teamController.removeMember,
);



