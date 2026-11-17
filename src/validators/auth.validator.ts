import { z } from 'zod';

const emailField = z
  .string({ error: 'Email wajib diisi' })
  .trim()
  .toLowerCase()
  .min(1, 'Email wajib diisi')
  .max(255, 'Email maksimal 255 karakter')
  .pipe(z.email('Format email tidak valid'));

const nameField = z
  .string({ error: 'Nama wajib diisi' })
  .trim()
  .min(1, 'Nama wajib diisi')
  .max(100, 'Nama maksimal 100 karakter');

/** bcrypt hanya memakai 72 byte pertama, jadi password dibatasi agar tidak terpotong diam-diam. */
const passwordField = z
  .string({ error: 'Password wajib diisi' })
  .min(8, 'Password minimal 8 karakter')
  .max(72, 'Password maksimal 72 karakter');

/**
 * strictObject menolak field tak dikenal, sehingga client tidak bisa menyelipkan
 * `role`, `id`, atau field sensitif lain ke dalam body.
 */
export const registerSchema = z.strictObject({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.strictObject({
  email: emailField,
  password: z.string({ error: 'Password wajib diisi' }).min(1, 'Password wajib diisi'),
});

export const updateProfileSchema = z
  .strictObject({
    name: nameField.optional(),
    email: emailField.optional(),
    /**
     * Hanya wajib jika email berubah. Kewajiban itu tidak bisa diperiksa di sini
     * karena butuh data user saat ini, jadi diverifikasi di service layer.
     */
    currentPassword: z
      .string({ error: 'Password saat ini tidak valid' })
      .min(1, 'Password saat ini wajib diisi')
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Minimal satu field harus diubah',
  });

export const updatePasswordSchema = z.strictObject({
  currentPassword: z
    .string({ error: 'Password saat ini wajib diisi' })
    .min(1, 'Password saat ini wajib diisi'),
  newPassword: passwordField,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
