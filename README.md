# TaskFlow Backend

REST API TaskFlow Cloud. Stack: Node.js + TypeScript + Express + Prisma + PostgreSQL.

Modul yang sudah tersedia:

- **Authentication & User Management** — registrasi, login, profil, ganti password.
- **Project, Task & Team Management** — proyek, tugas, anggota, undangan, RBAC, dan isolasi data.

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

Catatan:

- `FRONTEND_URL` boleh berisi beberapa origin dipisah koma (dipakai CORS).
- File `.env` tidak boleh di-commit (sudah masuk `.gitignore`).
- Aplikasi sengaja gagal start jika `DATABASE_URL` kosong atau `JWT_SECRET` kurang dari 32 karakter.

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
| `npm run build` | Compile ke `dist/` |
| `npm start` | Menjalankan hasil build |
| `npm run heroku-postbuild` | `prisma generate` + build; dipanggil otomatis oleh Dokku saat deploy |
| `npm run prisma:deploy` | Menerapkan migration di server (produksi/Dokku) |
| `npm run prisma:studio` | GUI database |

Saat deployment (Dokku), jalankan migration sekali setelah build:

```bash
dokku run <nama-app> npm run prisma:deploy
```

## 5. Endpoint

Semua endpoint berada di bawah `/api/v1` dan memakai format response yang sama:

```json
{ "success": true, "message": "Request berhasil", "data": {} }
```

```json
{ "success": false, "message": "Terjadi kesalahan", "errors": [] }
```

Daftar endpoint di bawah ini juga bisa diambil langsung dari `GET /api/v1`. Sumber datanya ada di [`src/routes/apiCatalog.ts`](src/routes/apiCatalog.ts); setiap kali menambah route baru, perbarui file tersebut.

### Umum

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/v1` | - | Daftar endpoint yang tersedia (JSON) |
| GET | `/health` | - | Health check server + status database (Dokku/monitoring) |

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
| PATCH | `/users/me` | Bearer | Ubah `name` dan/atau `email`. `currentPassword` wajib jika email berubah |
| PATCH | `/users/me/password` | Bearer | Ubah password sendiri (`currentPassword` + `newPassword`) |

### Projects

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/projects` | Bearer | Membuat proyek (pembuat otomatis menjadi OWNER) |
| GET | `/projects` | Bearer | Daftar proyek yang dimiliki atau diikuti |
| GET | `/projects/:projectId` | Bearer | Detail proyek, anggota, dan ringkasan tugas |
| PATCH | `/projects/:projectId` | Bearer | Ubah nama/deskripsi (OWNER atau ADMIN) |
| DELETE | `/projects/:projectId` | Bearer | Hapus proyek beserta data terkait (OWNER) |

### Tasks

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/projects/:projectId/tasks` | Bearer | Membuat tugas |
| GET | `/projects/:projectId/tasks` | Bearer | Daftar tugas; filter `status`, `priority`, `assigneeId` |
| GET | `/tasks/:taskId` | Bearer | Detail tugas |
| PATCH | `/tasks/:taskId` | Bearer | Ubah tugas (MEMBER hanya boleh mengubah status tugas miliknya) |
| DELETE | `/tasks/:taskId` | Bearer | Hapus tugas (OWNER atau ADMIN) |

Status tugas: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
Prioritas tugas: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

### Team & Invitations

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/projects/:projectId/members` | Bearer | Daftar anggota proyek beserta role |
| POST | `/projects/:projectId/invitations` | Bearer | Kirim undangan (OWNER atau ADMIN) |
| PATCH | `/projects/:projectId/members/:memberId` | Bearer | Ubah role anggota (OWNER atau ADMIN) |
| DELETE | `/projects/:projectId/members/:memberId` | Bearer | Keluarkan anggota atau keluar sendiri |
| POST | `/invitations/accept` | Bearer | Menerima undangan dengan `token` |

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
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <token>"

# buat proyek
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"name":"Proyek Pertama","description":"Contoh"}'

# buat tugas
curl -X POST http://localhost:3000/api/v1/projects/<projectId>/tasks \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Menyusun laporan","priority":"HIGH"}'

# ganti password
curl -X PATCH http://localhost:3000/api/v1/users/me/password \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"currentPassword":"rahasia123","newPassword":"rahasia456"}'
```

## 6. Aturan keamanan yang diterapkan

- Password di-hash dengan bcrypt (cost 12) dan tidak pernah dikembalikan API.
- Email dinormalisasi (trim + lowercase) dan unik di database.
- Login memakai pesan error generik agar tidak membocorkan email mana yang terdaftar.
- JWT hanya memuat `id` dan `email`; role tidak dimasukkan ke token.
- Token ditandatangani dan diverifikasi dengan algoritma HS256 yang dipatok, sehingga token dengan `alg` lain (mis. `none`) ditolak.
- Middleware `authenticate` mengambil ulang user dari database setiap request.
- Body request ditolak (422) jika memuat field tak dikenal, misalnya `role`.
- Mengubah email wajib menyertakan `currentPassword` dan password tersebut diverifikasi dengan bcrypt (403 jika salah).
- Mengubah password wajib memverifikasi password lama, menolak password baru yang sama dengan yang lama, dan tidak pernah mengembalikan hash.
- Seluruh operasi proyek/tugas/anggota memeriksa keanggotaan proyek; pengguna di luar proyek mendapat 403.
- Role diverifikasi ulang di backend untuk setiap operasi sensitif (OWNER/ADMIN/MEMBER).

## 7. Catatan integrasi untuk frontend

- `PATCH /users/me` mengembalikan **422** jika email berubah tetapi `currentPassword` tidak dikirim, dan **403** jika password salah. Sengaja bukan 401 agar frontend tidak otomatis logout.
- `PATCH /users/me/password` memakai 403 untuk password lama yang salah dan 422 jika password baru sama dengan yang lama.
- `GET /projects` menyertakan `currentUserRole` pada setiap proyek. `GET /projects/:projectId` belum menyertakannya; gunakan data dari daftar proyek atau daftar anggota.
- `POST /projects/:projectId/invitations` mengembalikan objek undangan termasuk `token` (belum ada pengiriman email otomatis). Frontend perlu menampilkan/mengirim tautan undangan tersebut.
- Undangan hanya bisa diterima oleh akun dengan email yang sama, masih berstatus `PENDING`, dan belum kedaluwarsa (7 hari).
- MEMBER hanya boleh mengubah **status** tugas yang di-assign kepadanya; field lain dan penghapusan tugas ditolak 403.
- Belum ada pagination; endpoint daftar mengembalikan seluruh data.

## 8. Catatan logout dan token

JWT bersifat stateless, sehingga `POST /auth/logout` tidak membatalkan token di server. Client wajib menghapus token dari penyimpanannya.

Konsekuensi yang sama berlaku untuk `PATCH /users/me/password`: token yang sudah beredar sebelum password diubah **tetap sah** sampai `JWT_EXPIRES_IN` habis. Frontend sebaiknya meminta pengguna login ulang secara sukarela setelah mengganti password. Jika nanti tim ingin token lama otomatis gugur, tambahkan kolom `tokenVersion` atau `passwordChangedAt` pada `User` (perubahan schema, wajib disepakati tim) lalu periksa di middleware `authenticate`.
