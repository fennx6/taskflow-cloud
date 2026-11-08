import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { apiRouter } from './routes/index.js';
import { sendSuccess } from './utils/response.js';

export const app = express();

app.disable('x-powered-by');

// Frontend dan backend adalah aplikasi terpisah, jadi CORS wajib dibatasi
// ke origin yang terdaftar di FRONTEND_URL (AGENTS.md §4.2).
app.use(
  cors({
    origin: env.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '100kb' }));

// Dipakai health check Dokku / monitoring.
app.get('/health', (_req, res) => {
  sendSuccess({
    res,
    message: 'Server berjalan',
    data: { status: 'ok', uptime: Math.round(process.uptime()) },
  });
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);
