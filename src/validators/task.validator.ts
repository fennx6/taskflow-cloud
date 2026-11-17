import { z } from 'zod';

export const taskIdParamSchema = z.strictObject({
  taskId: z
    .string({ error: 'Task ID wajib diisi' })
    .uuid('Format Task ID harus berupa UUID yang valid'),
});

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], {
  error: 'Status tugas harus salah satu dari: TODO, IN_PROGRESS, REVIEW, DONE',
});

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  error: 'Prioritas tugas harus salah satu dari: LOW, MEDIUM, HIGH, URGENT',
});

const dueDateSchema = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Format dueDate harus berupa tanggal yang valid (ISO 8601)',
  })
  .transform((val) => new Date(val))
  .optional()
  .nullable();

export const createTaskSchema = z.strictObject({
  title: z
    .string({ error: 'Judul tugas wajib diisi' })
    .trim()
    .min(1, 'Judul tugas wajib diisi')
    .max(150, 'Judul tugas maksimal 150 karakter'),
  description: z
    .string()
    .trim()
    .max(2000, 'Deskripsi tugas maksimal 2000 karakter')
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assigneeId: z
    .string()
    .uuid('Format Assignee ID harus berupa UUID yang valid')
    .optional()
    .nullable(),
  dueDate: dueDateSchema,
});

export const updateTaskSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(1, 'Judul tugas tidak boleh kosong')
      .max(150, 'Judul tugas maksimal 150 karakter')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Deskripsi tugas maksimal 2000 karakter')
      .optional()
      .nullable(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    assigneeId: z
      .string()
      .uuid('Format Assignee ID harus berupa UUID yang valid')
      .optional()
      .nullable(),
    dueDate: dueDateSchema,
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined ||
      data.assigneeId !== undefined ||
      data.dueDate !== undefined,
    {
      message: 'Minimal satu field harus diubah',
    },
  );

export const listTasksQuerySchema = z.strictObject({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assigneeId: z
    .string()
    .uuid('Format Assignee ID harus berupa UUID yang valid')
    .optional(),
});

export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

