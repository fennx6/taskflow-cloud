# TaskFlow Cloud

Aplikasi SaaS berbasis web untuk mengelola proyek, tugas, dan kolaborasi tim. Pengguna dapat membuat proyek, mengatur tugas beserta status dan prioritas, serta mengundang anggota dengan hak akses berbeda.

Aplikasi dijalankan di infrastruktur cloud milik tim: Proxmox VE sebagai hypervisor, tiga Virtual Machine terpisah, dan Dokku sebagai platform deployment.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Backend | Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT, bcrypt, Zod |
| Frontend | React, Vite, TypeScript, Tailwind CSS, React Router, Axios, TanStack Query |
| Infrastruktur | Proxmox VE, Ubuntu Server, Dokku, Docker, Nginx |
| Monitoring | Prometheus, Grafana, Node Exporter |

## Arsitektur

```
Pengguna -> Browser -> HTTPS/domain
                          |
                   VM 3 (Application)
                   reverse proxy
                    /          \
              frontend        backend
              React/Vite      Express
                                  |
                              Prisma ORM
                                  |
                   VM 2 (Database) - PostgreSQL

VM 1 (Monitoring) - Prometheus, Grafana, Node Exporter
```

Aturan yang tidak boleh dilanggar:

- Frontend dan backend adalah dua aplikasi terpisah dan berkomunikasi lewat REST API.
- Frontend tidak pernah mengakses PostgreSQL secara langsung.
- Backend adalah satu-satunya penentu autentikasi, otorisasi, dan kepemilikan data.
- Setiap pengguna hanya dapat mengakses proyek dan tugas yang diikutinya.

## Struktur Repository

```
TaskFlow/
├── backend/     REST API (Express + Prisma)
├── frontend/    antarmuka React (menyusul)
└── README.md
```

Panduan menjalankan backend ada di [`backend/README.md`](backend/README.md).

## Menjalankan Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env   # lalu isi DATABASE_URL dan JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Server berjalan di `http://localhost:3000`, health check di `GET /health`.

File `.env` tidak pernah di-commit. Nilai secret hanya disimpan di mesin masing-masing dan di server produksi.

## Konvensi Branch

| Branch | Kegunaan |
|---|---|
| `main` | Kondisi stabil / siap demo. Hanya menerima merge dari `develop`. |
| `develop` | Branch integrasi. Semua fitur masuk ke sini lebih dulu. |
| `feature/<modul>` | Pengerjaan fitur baru. |
| `fix/<masalah>` | Perbaikan bug. |
| `chore/<hal>` | Pekerjaan non-fitur (konfigurasi, dependensi, CI). |
| `docs/<hal>` | Dokumentasi. |

Pembagian branch per anggota:

| Anggota | Branch |
|---|---|
| Backend 1 | `feature/authentication`, `feature/user-profile` |
| Backend 2 | `feature/project-management`, `feature/task-management`, `feature/team-management` |
| Frontend 1 | `feature/auth-ui`, `feature/dashboard`, `feature/user-profile-ui` |
| Frontend 2 | `feature/project-ui`, `feature/task-ui`, `feature/team-ui` |

Alur kerja:

1. `git switch develop` lalu `git pull`.
2. Buat branch baru: `git switch -c feature/nama-modul`.
3. Kerjakan dan commit di branch tersebut.
4. `git push -u origin feature/nama-modul`.
5. Buat Pull Request ke `develop`, minta review, lalu merge.
6. Hapus branch setelah di-merge.

Aturan tambahan:

- Satu branch untuk satu modul. Jangan mencampur beberapa fitur.
- Jangan push langsung ke `main` atau `develop`.
- Jangan commit file `.env`, secret, atau kredensial.
- Hindari force push pada branch yang sudah di-push.

## Konvensi Commit

Gunakan Conventional Commits dengan deskripsi berbahasa Indonesia:

```
feat: menambahkan registrasi pengguna
fix: memperbaiki validasi login
refactor: merapikan struktur service autentikasi
docs: memperbarui kontrak API
chore: menambahkan konfigurasi gitignore
```

## Kontrak API

Base URL: `/api/v1`

Response berhasil:

```json
{
  "success": true,
  "message": "Request berhasil",
  "data": {}
}
```

Response gagal:

```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "errors": []
}
```

Status code yang dipakai:

| Status | Keterangan |
|---|---|
| 200 | Berhasil |
| 201 | Data berhasil dibuat |
| 204 | Berhasil tanpa response body |
| 400 | Request tidak valid |
| 401 | Belum terautentikasi |
| 403 | Tidak memiliki izin |
| 404 | Data tidak ditemukan |
| 409 | Konflik data |
| 422 | Validasi gagal |
| 500 | Kesalahan server |

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

Field user yang dikembalikan API: `id`, `name`, `email`, `createdAt`, `updatedAt`. Password hash tidak pernah dikirim.

Endpoint modul proyek, tugas, dan anggota tim akan ditambahkan oleh Backend Developer 2.

## Aturan Keamanan

- Password di-hash dengan bcrypt dan tidak pernah dikembalikan API.
- Email dinormalisasi dan unik di database.
- Endpoint privat wajib memakai header `Authorization: Bearer <token>`.
- JWT hanya memuat `id` dan `email`; role selalu diverifikasi ulang di backend.
- Setiap akses ke resource proyek harus memeriksa keanggotaan pengguna.
- Data pengguna dan proyek tidak boleh dapat diakses lintas akun.

## Pembagian Tugas

| Peran | Tanggung jawab |
|---|---|
| Backend 1 | Autentikasi, JWT, profil pengguna, manajemen akun |
| Backend 2 | Proyek, tugas, anggota tim, undangan, RBAC, isolasi data |
| Frontend 1 | Halaman auth, dashboard, navigasi, profil, komponen UI |
| Frontend 2 | Halaman proyek, tugas, anggota tim, integrasi API |

## Status Pengembangan

- [x] Fondasi backend (TypeScript, Express, Prisma, PostgreSQL schema)
- [x] Modul autentikasi dan profil pengguna
- [ ] Migration dan pengujian end-to-end ke database
- [ ] Modul proyek, tugas, dan anggota tim
- [ ] Frontend
- [ ] Deployment Dokku, domain, dan HTTPS
- [ ] Monitoring infrastruktur
