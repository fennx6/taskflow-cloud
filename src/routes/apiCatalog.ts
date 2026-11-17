/**
 * Katalog endpoint TaskFlow API.
 *
 * Sumber data untuk `GET /api/v1` (lihat src/controllers/api.controller.ts).
 * Array ini WAJIB diperbarui setiap kali route baru ditambahkan, karena
 * endpoint ini adalah daftar API yang dilihat frontend dan penguji.
 */
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/** `bearer` berarti request wajib menyertakan header Authorization: Bearer <token>. */
export type AuthType = 'public' | 'bearer';

export interface ApiEndpoint {
  /** Grup fitur, dipakai client untuk mengelompokkan daftar endpoint. */
  tag: string;
  method: HttpMethod;
  /** Path lengkap termasuk prefix /api/v1 (kecuali /health). */
  path: string;
  auth: AuthType;
  description: string;
  /**
   * Nama field body yang diterima, sesuai urutan kontrak.
   * Akhiran `?` menandakan field opsional.
   */
  body?: string[];
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    tag: 'Umum',
    method: 'GET',
    path: '/health',
    auth: 'public',
    description: 'Health check server, dipakai Dokku dan monitoring',
  },
  {
    tag: 'Umum',
    method: 'GET',
    path: '/api/v1',
    auth: 'public',
    description: 'Daftar endpoint yang tersedia',
  },
  {
    tag: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/register',
    auth: 'public',
    description: 'Registrasi pengguna baru, mengembalikan data user',
    body: ['name', 'email', 'password'],
  },
  {
    tag: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/login',
    auth: 'public',
    description: 'Login, mengembalikan JWT dan data user',
    body: ['email', 'password'],
  },
  {
    tag: 'Authentication',
    method: 'POST',
    path: '/api/v1/auth/logout',
    auth: 'bearer',
    description: 'Logout, token wajib dihapus di sisi client',
  },
  {
    tag: 'Authentication',
    method: 'GET',
    path: '/api/v1/auth/me',
    auth: 'bearer',
    description: 'Data pengguna yang sedang login berdasarkan token',
  },
  {
    tag: 'User',
    method: 'GET',
    path: '/api/v1/users/me',
    auth: 'bearer',
    description: 'Profil pengguna yang sedang login',
  },
  {
    tag: 'User',
    method: 'PATCH',
    path: '/api/v1/users/me',
    auth: 'bearer',
    description: 'Mengubah nama dan/atau email profil sendiri',
    body: ['name?', 'email?'],
  },
  {
    tag: 'Projects',
    method: 'POST',
    path: '/api/v1/projects',
    auth: 'bearer',
    description: 'Membuat proyek baru',
    body: ['name', 'description?'],
  },
  {
    tag: 'Projects',
    method: 'GET',
    path: '/api/v1/projects',
    auth: 'bearer',
    description: 'Melihat daftar proyek yang dimiliki atau diikuti',
  },
  {
    tag: 'Projects',
    method: 'GET',
    path: '/api/v1/projects/:projectId',
    auth: 'bearer',
    description: 'Melihat detail proyek, anggota, dan ringkasan tugas',
  },
  {
    tag: 'Projects',
    method: 'PATCH',
    path: '/api/v1/projects/:projectId',
    auth: 'bearer',
    description: 'Mengubah informasi proyek (hanya OWNER atau ADMIN)',
    body: ['name?', 'description?'],
  },
  {
    tag: 'Projects',
    method: 'DELETE',
    path: '/api/v1/projects/:projectId',
    auth: 'bearer',
    description: 'Menghapus proyek beserta seluruh data terkait (hanya OWNER)',
  },
];
