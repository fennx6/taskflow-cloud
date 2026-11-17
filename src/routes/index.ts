import { Router } from 'express';
import * as apiController from '../controllers/api.controller.js';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';

/**
 * Root router untuk /api/v1 (AGENTS.md §8).
 * Backend Developer 2 menambahkan router project/task/team di sini.
 */
export const apiRouter = Router();

// Daftar endpoint yang tersedia; perbarui src/routes/apiCatalog.ts saat menambah route.
apiRouter.get('/', apiController.listEndpoints);

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
