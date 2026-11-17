import type { Request, Response } from 'express';
import { requireAuthUser } from '../middlewares/authenticate.js';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import type { UpdatePasswordInput, UpdateProfileInput } from '../validators/auth.validator.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const user = await userService.getProfile(authUser.id);

  sendSuccess({ res, message: 'Profil berhasil diambil', data: { user } });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const user = await userService.updateProfile(authUser.id, req.body as UpdateProfileInput);

  sendSuccess({ res, message: 'Profil berhasil diperbarui', data: { user } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  await userService.changePassword(authUser.id, req.body as UpdatePasswordInput);

  // Token yang sudah beredar tetap berlaku sampai kedaluwarsa (README §8).
  sendSuccess({ res, message: 'Password berhasil diubah', data: null });
}
