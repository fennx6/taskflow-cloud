# TaskFlow Backend

REST API TaskFlow Cloud. Stack: Node.js + TypeScript + Express + Prisma + PostgreSQL (AGENTS.md §2.1).

Modul yang sudah tersedia: **Authentication & User Management** (Backend Developer 1, AGENTS.md §5.1).

---

## 1. Prasyarat

- Node.js 20 atau lebih baru
- PostgreSQL (development: PostgreSQL lokal di port 5432)

## 2. Setup database development

Jalankan sebagai superuser PostgreSQL:

```sql
CREATE ROLE taskflow WITH LOGIN PASSWORD 'PILIH_SENDIRI' CREATEDB;
CREATE DATABASE taskflow_dev OWNER taskflow;
```

`CREATEDB` diperlukan karena `prisma migrate dev` membuat shadow database sementara.

## 3. Konfigurasi environment

```powershell
Copy-Item .env.example .env
```

Isi `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://taskflow:PILIH_SENDIRI@localhost:5432/taskflow_dev?schema=public"
JWT_SECRET=<minimal 32 karakter acak>
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

File `.env` tidak boleh di-commit (sudah masuk `.gitignore`).

## 4. Install, migration, dan menjalankan

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate     # membuat tabel dari prisma/schema.prisma
npm run dev                # http://localhost:3000
```

Perintah lain:

| Script | Kegunaan |
|---|---|
| `npm run typecheck` | Pemeriksaan TypeScript tanpa emit |
| `npm run build` | Compile ke `dist/` (dipakai saat deployment) |
| `npm start` | Menjalankan hasil build |
| `npm run prisma:deploy` | Menerapkan migration di server (produksi/Dokku) |
| `npm run prisma:studio` | GUI database |

## 5. Endpoint

Semua endpoint berada di bawah `/api/v1` dan memakai format response AGENTS.md §8.6.

### Authentication

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | - | Registrasi pengguna baru |
| POST | `/auth/login` | - | Login, mengembalikan JWT |
| POST | `/auth/logout` | Bearer | Logout (token dibuang di sisi client) |
| GET | `/auth/me` | Bearer | Data pengguna dari token |

### User

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/users/me` | Bearer | Profil pengguna |
| PATCH | `/users/me` | Bearer | Ubah `name` dan/atau `email` |

### Contoh

```bash
# register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","email":"budi@example.com","password":"rahasia123"}'

# login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@example.com","password":"rahasia123"}'

# endpoint privat
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

Response sukses:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": { "token": "<jwt>", "user": { "id": "uuid", "name": "Budi", "email": "budi@example.com" } }
}
```

Response gagal:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [{ "field": "body.password", "message": "Password minimal 8 karakter" }]
}
```

## 6. Aturan keamanan yang diterapkan

- Password di-hash dengan bcrypt (cost 12) dan tidak pernah dikembalikan API.
- Email dinormalisasi (trim + lowercase) dan unik di database.
- Login memakai pesan error generik agar tidak membocorkan email mana yang terdaftar.
- JWT hanya memuat `id` dan `email`; role tidak dimasukkan ke token.
- Middleware `authenticate` mengambil ulang user dari database setiap request.
- Body request ditolak (422) jika memuat field tak dikenal, misalnya `role`.

## 7. Catatan untuk Backend Developer 2

- `prisma/schema.prisma` sudah memuat 5 model awal dari AGENTS.md §7.1 dan **wajib direview** sebelum migration pertama dijalankan.
- Middleware `authenticate` mengisi `req.user` dengan bentuk `{ id, name, email }`. Gunakan `requireAuthUser(req)` untuk mengambilnya.
- Gunakan `sendSuccess` / `sendError` dari `src/utils/response.ts` agar format response konsisten.
- Tambahkan router modul project/task/team pada `src/routes/index.ts`.

## 8. Catatan logout

JWT bersifat stateless, sehingga `POST /auth/logout` tidak membatalkan token di server. Client wajib menghapus token dari penyimpanannya. Jika tim membutuhkan pembatalan token dari server, perlu mekanisme tambahan (refresh token atau blacklist) yang harus disepakati terlebih dahulu.
