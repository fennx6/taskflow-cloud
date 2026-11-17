import type { Request, Response } from 'express';
import { requireAuthUser } from '../middlewares/authenticate.js';
import { getProjectContext } from '../middlewares/projectAuth.js';
import * as teamService from '../services/team.service.js';
import { sendSuccess } from '../utils/response.js';
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  UpdateMemberRoleInput,
} from '../validators/team.validator.js';

export async function listMembers(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const members = await teamService.getProjectMembers(project.id);

  sendSuccess({
    res,
    message: 'Daftar anggota proyek berhasil diambil',
    data: { members },
  });
}

export async function createInvitation(req: Request, res: Response): Promise<void> {
  const { project } = getProjectContext(req);
  const invitation = await teamService.createInvitation(
    project.id,
    req.body as CreateInvitationInput,
  );

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Undangan berhasil dibuat',
    data: { invitation },
  });
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const { project } = getProjectContext(req);
  const rawMemberId = req.params.memberId;
  const memberId = Array.isArray(rawMemberId) ? rawMemberId[0] : rawMemberId;

  const member = await teamService.updateMemberRole(
    project.id,
    memberId,
    authUser.id,
    req.body as UpdateMemberRoleInput,
  );

  sendSuccess({
    res,
    message: 'Role anggota berhasil diperbarui',
    data: { member },
  });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const { project } = getProjectContext(req);
  const rawMemberId = req.params.memberId;
  const memberId = Array.isArray(rawMemberId) ? rawMemberId[0] : rawMemberId;

  await teamService.removeMember(project.id, memberId, authUser.id);

  sendSuccess({
    res,
    message: 'Anggota berhasil dikeluarkan dari proyek',
    data: null,
  });
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const authUser = requireAuthUser(req);
  const { token } = req.body as AcceptInvitationInput;

  const membership = await teamService.acceptInvitation(
    authUser.id,
    authUser.email,
    token,
  );

  sendSuccess({
    res,
    message: 'Berhasil bergabung dengan proyek',
    data: { membership },
  });
}

