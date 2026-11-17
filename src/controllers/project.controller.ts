import type { Request, Response } from 'express';
import { requireAuthUser } from '../middlewares/authenticate.js';
import { getProjectContext } from '../middlewares/projectAuth.js';
import * as projectService from '../services/project.service.js';
import { sendSuccess } from '../utils/response.js';
import type { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator.js';

export async function createProject(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const project = await projectService.createProject(authUser.id, req.body as CreateProjectInput);

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Proyek berhasil dibuat',
    data: { project },
  });
}

export async function listProjects(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const projects = await projectService.getUserProjects(authUser.id);

  sendSuccess({
    res,
    message: 'Daftar proyek berhasil diambil',
    data: { projects },
  });
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const projectDetail = await projectService.getProjectDetail(project.id);

  sendSuccess({
    res,
    message: 'Detail proyek berhasil diambil',
    data: { project: projectDetail },
  });
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const updatedProject = await projectService.updateProject(
    project.id,
    req.body as UpdateProjectInput,
  );

  sendSuccess({
    res,
    message: 'Informasi proyek berhasil diperbarui',
    data: { project: updatedProject },
  });
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  await projectService.deleteProject(project.id);

  sendSuccess({
    res,
    message: 'Proyek berhasil dihapus',
    data: null,
  });
}

