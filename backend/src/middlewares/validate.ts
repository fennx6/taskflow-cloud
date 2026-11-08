import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export interface ValidationSchema {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

interface ValidationIssue {
  field: string;
  message: string;
}

function toIssues(scope: string, error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    field: [scope, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }));
}

/**
 * Menjalankan validasi Zod sebelum request masuk ke controller (AGENTS.md §9.2).
 * Body yang valid dan sudah ditransformasi (trim/lowercase) menggantikan req.body.
 */
export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const issues: ValidationIssue[] = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
      } else {
        issues.push(...toIssues('body', result.error));
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        issues.push(...toIssues('params', result.error));
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        issues.push(...toIssues('query', result.error));
      }
    }

    if (issues.length > 0) {
      next(new AppError(422, 'Validasi gagal', issues));
      return;
    }

    next();
  };
}
