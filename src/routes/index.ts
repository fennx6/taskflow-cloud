import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';

/**
 * Root router untuk /api/v1 (AGENTS.md §8).
 * Backend Developer 2 menambahkan router project/task/team di sini.
 */
export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
