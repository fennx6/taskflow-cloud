/**
 * Error yang memang ditujukan untuk dikirim ke client.
 * Semua error lain dianggap kesalahan internal dan tidak dibocorkan (AGENTS.md §9.2).
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly errors: unknown[];

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, AppError);
  }
}
