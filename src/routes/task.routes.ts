import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { taskIdParamSchema, updateTaskSchema } from '../validators/task.validator.js';

export const taskRouter = Router();

// Seluruh endpoint task mewajibkan autentikasi JWT (AGENTS.md §8.4)
taskRouter.use(authenticate);

// GET /api/v1/tasks/:taskId — detail tugas (Data Isolation AGENTS.md §6.6)
taskRouter.get('/:taskId', validate({ params: taskIdParamSchema }), taskController.getTask);

// PATCH /api/v1/tasks/:taskId — update tugas (RBAC AGENTS.md §6.5)
taskRouter.patch(
  '/:taskId',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask,
);

// DELETE /api/v1/tasks/:taskId — hapus tugas (hanya OWNER dan ADMIN AGENTS.md §6.5)
taskRouter.delete('/:taskId', validate({ params: taskIdParamSchema }), taskController.deleteTask);

