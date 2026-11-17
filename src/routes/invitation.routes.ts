import { Router } from 'express';
import * as teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { acceptInvitationSchema } from '../validators/team.validator.js';

export const invitationRouter = Router();

// Seluruh endpoint undangan mewajibkan autentikasi JWT (AGENTS.md §8.5)
invitationRouter.use(authenticate);

// POST /api/v1/invitations/accept — menerima undangan bergabung proyek (AGENTS.md §6.4, §8.5)
invitationRouter.post(
  '/accept',
  validate({ body: acceptInvitationSchema }),
  teamController.acceptInvitation,
);

