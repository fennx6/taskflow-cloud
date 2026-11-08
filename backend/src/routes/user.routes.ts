import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

export const userRouter = Router();

userRouter.get('/me', authenticate, userController.getMe);
userRouter.patch('/me', authenticate, validate({ body: updateProfileSchema }), userController.updateMe);
