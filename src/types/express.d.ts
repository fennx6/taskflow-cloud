import type { Project, ProjectMember } from '@prisma/client';
import type { AuthUser } from './auth.js';

export interface ProjectContext {
  project: Project;
  membership: ProjectMember;
}

declare global {
  namespace Express {
    interface Request {
      /** Diisi oleh middleware `authenticate`. */
      user?: AuthUser;
      /** Diisi oleh middleware `requireProjectMember`. */
      projectContext?: ProjectContext;
    }
  }
}

export {};
