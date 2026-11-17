import { z } from 'zod';

export const projectIdParamSchema = z.strictObject({
  projectId: z
    .string({ error: 'Project ID wajib diisi' })
    .uuid('Format Project ID harus berupa UUID yang valid'),
});

export const createProjectSchema = z.strictObject({
  name: z
    .string({ error: 'Nama proyek wajib diisi' })
    .trim()
    .min(1, 'Nama proyek wajib diisi')
    .max(100, 'Nama proyek maksimal 100 karakter'),
  description: z
    .string()
    .trim()
    .max(1000, 'Deskripsi proyek maksimal 1000 karakter')
    .optional()
    .nullable(),
});

export const updateProjectSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(1, 'Nama proyek tidak boleh kosong')
      .max(100, 'Nama proyek maksimal 100 karakter')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Deskripsi proyek maksimal 1000 karakter')
      .optional()
      .nullable(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'Minimal satu field harus diubah',
  });

export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

