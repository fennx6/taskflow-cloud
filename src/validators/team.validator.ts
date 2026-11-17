import { z } from 'zod';

export const memberIdParamSchema = z.strictObject({
  projectId: z
    .string({ error: 'Project ID wajib diisi' })
    .uuid('Format Project ID harus berupa UUID yang valid'),
  memberId: z
    .string({ error: 'Member ID wajib diisi' })
    .uuid('Format Member ID harus berupa UUID yang valid'),
});

export const createInvitationSchema = z.strictObject({
  email: z
    .string({ error: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .min(1, 'Email wajib diisi')
    .max(255, 'Email maksimal 255 karakter')
    .pipe(z.email('Format email tidak valid')),
  role: z
    .enum(['ADMIN', 'MEMBER'], {
      error: 'Role undangan harus berupa ADMIN atau MEMBER',
    })
    .optional()
    .default('MEMBER'),
});

export const updateMemberRoleSchema = z.strictObject({
  role: z.enum(['ADMIN', 'MEMBER'], {
    error: 'Role anggota harus berupa ADMIN atau MEMBER',
  }),
});

export const acceptInvitationSchema = z.strictObject({
  token: z
    .string({ error: 'Token undangan wajib diisi' })
    .trim()
    .min(1, 'Token undangan wajib diisi'),
});

export type MemberIdParam = z.infer<typeof memberIdParamSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

