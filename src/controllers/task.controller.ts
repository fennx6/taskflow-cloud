import type { Request, Response } from 'express';
import { requireAuthUser } from '../middlewares/authenticate.js';
import { getProjectContext } from '../middlewares/projectAuth.js';
import * as taskService from '../services/task.service.js';
import { sendSuccess } from '../utils/response.js';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../validators/task.validator.js';

export async function createTask(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const task = await taskService.createTask(project.id, req.body as CreateTaskInput);

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Tugas berhasil dibuat',
    data: { task },
  });
}

export async function listProjectTasks(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const tasks = await taskService.getProjectTasks(project.id, req.query as ListTasksQuery);

  sendSuccess({
    res,
    message: 'Daftar tugas berhasil diambil',
    data: { tasks },
  });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const rawTaskId = req.params.taskId;
  const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId;

  const task = await taskService.getTaskDetail(taskId, authUser.id);

  sendSuccess({
    res,
    message: 'Detail tugas berhasil diambil',
    data: { task },
  });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const rawTaskId = req.params.taskId;
  const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId;

  const updatedTask = await taskService.updateTask(
    taskId,
    authUser.id,
    req.body as UpdateTaskInput,
  );

  sendSuccess({
    res,
    message: 'Tugas berhasil diperbarui',
    data: { task: updatedTask },
  });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const rawTaskId = req.params.taskId;
  const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId;

  await taskService.deleteTask(taskId, authUser.id);

  sendSuccess({
    res,
    message: 'Tugas berhasil dihapus',
    data: null,
  });
}

