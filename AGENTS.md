# AGENTS.md — TaskFlow Cloud

> **Nama Proyek:** TaskFlow Cloud  
> **Jenis Proyek:** Cloud-Based Project and Task Management SaaS  
> **Arsitektur:** Client-Server Architecture  
> **Infrastruktur:** Proxmox VE dan 3 Virtual Machine  
> **Jumlah Anggota:** 4 Developer (2 Backend dan 2 Frontend)  
> **Bahasa Pemrograman:** TypeScript  
> **Version Control:** Git dan GitHub  
> **Deployment Platform:** Dokku

---

# 1. Gambaran Umum Proyek

TaskFlow Cloud merupakan aplikasi SaaS berbasis web yang dirancang untuk membantu pengguna mengelola proyek, tugas, dan kolaborasi tim dalam satu platform.

Aplikasi ini dikembangkan sebagai bagian dari proyek praktikum Komputasi Awan dengan tujuan mengintegrasikan tiga model layanan cloud, yaitu IaaS, PaaS, dan SaaS.

TaskFlow Cloud menjadi produk SaaS yang dapat digunakan secara langsung oleh pengguna melalui browser tanpa perlu melakukan instalasi aplikasi.

## 1.1 Tujuan Proyek

1. Membangun aplikasi manajemen proyek berbasis cloud.
2. Memungkinkan pengguna membuat dan mengelola proyek.
3. Memungkinkan pengguna membuat dan mengelola tugas.
4. Mendukung kolaborasi beberapa pengguna dalam satu proyek.
5. Menyediakan sistem autentikasi dan pembatasan hak akses.
6. Menerapkan isolasi data antar pengguna dan proyek.
7. Menjalankan aplikasi pada infrastruktur cloud milik tim.
8. Mengimplementasikan deployment aplikasi menggunakan Dokku.
9. Mengintegrasikan GitHub dengan proses CI/CD.
10. Menyediakan monitoring terhadap kondisi infrastruktur cloud.

## 1.2 Fitur Utama

Fitur utama TaskFlow Cloud meliputi:

- Registrasi pengguna.
- Login dan logout pengguna.
- Dashboard pengguna.
- Membuat proyek.
- Melihat daftar proyek.
- Mengubah informasi proyek.
- Menghapus proyek.
- Membuat dan mengelola tugas.
- Mengatur status dan prioritas tugas.
- Mengatur deadline tugas.
- Mengundang anggota tim.
- Mengatur role dan hak akses anggota.
- Mengelola profil pengguna.
- Menyimpan data secara terpusat menggunakan PostgreSQL.
- Menjamin isolasi data setiap pengguna dan proyek.

---

# 2. Teknologi yang Digunakan

Seluruh anggota wajib mengikuti teknologi yang telah disepakati.

## 2.1 Backend

| Teknologi | Kegunaan |
| --- | --- |
| Node.js | Lingkungan eksekusi JavaScript |
| TypeScript | Bahasa pemrograman |
| Express.js | Framework backend |
| PostgreSQL | Sistem manajemen basis data |
| Prisma ORM | Pengelolaan akses database |
| JWT | Autentikasi pengguna |
| bcrypt | Hashing password |
| Zod | Validasi request dan data |

## 2.2 Frontend

| Teknologi | Kegunaan |
| --- | --- |
| React | Library antarmuka pengguna |
| Vite | Build tool dan development server |
| TypeScript | Bahasa pemrograman |
| Tailwind CSS | Styling antarmuka |
| React Router | Navigasi halaman |
| Axios | Komunikasi HTTP dengan backend |
| TanStack Query | Pengelolaan server state |

## 2.3 Infrastruktur dan Deployment

| Teknologi | Kegunaan |
| --- | --- |
| Proxmox VE | Virtualisasi infrastruktur |
| Ubuntu Server | Sistem operasi VM |
| Dokku | Platform deployment aplikasi |
| Docker | Container aplikasi |
| GitHub | Pengelolaan source code |
| GitHub Webhook | Pemicu deployment otomatis |
| Nginx / Dokku Proxy | Reverse proxy |
| HTTPS | Keamanan komunikasi aplikasi |

## 2.4 Monitoring

Teknologi monitoring yang direkomendasikan:

| Teknologi | Kegunaan |
| --- | --- |
| Prometheus | Pengumpulan metrik |
| Grafana | Visualisasi monitoring |
| Node Exporter | Pengumpulan metrik sistem operasi |

Monitoring difokuskan pada:

- Penggunaan CPU.
- Penggunaan RAM.
- Penggunaan disk.
- Penggunaan jaringan.
- Status layanan.
- Kondisi Virtual Machine.

Pemilihan komponen monitoring dapat disesuaikan dengan kapasitas infrastruktur.

**Aturan:** Jangan menambahkan framework, library, atau teknologi utama baru tanpa persetujuan tim.

---

# 3. Arsitektur Infrastruktur Cloud

TaskFlow Cloud menggunakan Proxmox VE sebagai hypervisor untuk menjalankan tiga Virtual Machine.

Masing-masing VM memiliki tanggung jawab yang berbeda.

## 3.1 Pembagian Virtual Machine

| Virtual Machine | Fungsi | Komponen |
| --- | --- | --- |
| VM 1 | Monitoring Server | Prometheus, Grafana, Node Exporter |
| VM 2 | Database Server | PostgreSQL |
| VM 3 | Application Server | Backend, Frontend, Dokku, Docker |

## 3.2 VM 1 — Monitoring Server

VM 1 bertanggung jawab memantau kondisi infrastruktur cloud.

Tanggung jawab:

- Mengumpulkan metrik penggunaan CPU.
- Mengumpulkan metrik penggunaan RAM.
- Memantau kapasitas disk.
- Memantau penggunaan jaringan.
- Memantau status layanan server.
- Menampilkan informasi monitoring melalui dashboard.
- Membantu mendeteksi gangguan infrastruktur.

Monitoring harus mencakup VM yang relevan, termasuk VM 2 dan VM 3.

## 3.3 VM 2 — Database Server

VM 2 bertanggung jawab menyimpan seluruh data aplikasi TaskFlow Cloud.

Komponen utama:

- PostgreSQL.
- Database pengguna.
- Database proyek.
- Database tugas.
- Database keanggotaan proyek.
- Database undangan.

Ketentuan:

1. Database tidak boleh diakses langsung oleh frontend.
2. Hanya backend yang diperbolehkan melakukan operasi database aplikasi.
3. Koneksi database menggunakan jaringan internal.
4. Kredensial database wajib disimpan dalam environment variable.
5. Lakukan backup database secara berkala.
6. Batasi akses PostgreSQL berdasarkan kebutuhan jaringan.
7. Gunakan migration untuk setiap perubahan struktur database.

## 3.4 VM 3 — Application Server

VM 3 bertanggung jawab menjalankan seluruh komponen aplikasi dan layanan deployment PaaS.

Komponen utama:

- Backend Node.js, TypeScript, dan Express.js.
- Frontend React, Vite, dan Tailwind CSS.
- Dokku sebagai platform deployment.
- Docker sebagai lingkungan container.
- Reverse proxy untuk pengaturan akses aplikasi.

Ketentuan:

1. Backend dan frontend merupakan aplikasi terpisah.
2. Backend dan frontend dapat dijalankan melalui container atau mekanisme deployment Dokku yang sesuai.
3. Komunikasi frontend dan backend menggunakan REST API.
4. Reverse proxy mengatur routing menuju frontend dan backend.
5. Dokku digunakan untuk deployment dan pengelolaan aplikasi.
6. Pastikan layanan tidak saling menghabiskan resource secara berlebihan.
7. Jangan menjalankan database utama pada VM 3.

---

# 4. Arsitektur Aplikasi

TaskFlow Cloud menggunakan arsitektur Client-Server dengan pemisahan frontend, backend, dan database.

## 4.1 Diagram Arsitektur

```text
                    USER
                      |
                      v
                 WEB BROWSER
                      |
                      v
                DOMAIN / HTTPS
                      |
                      v
              VM 3 - APPLICATION
                      |
                REVERSE PROXY
                  /       \
                 /         \
                v           v
           FRONTEND       BACKEND
            React         Express
            Vite          TypeScript
                              |
                              |
                          Prisma ORM
                              |
                              v
                       VM 2 - DATABASE
                           PostgreSQL


              VM 1 - MONITORING
              Prometheus / Grafana
                       |
                       v
              Monitoring Metrics
                       |
                       v
              Infrastruktur Cloud
```

## 4.2 Aturan Arsitektur

- Frontend dan backend harus tetap menjadi aplikasi yang terpisah.
- Frontend berkomunikasi dengan backend melalui REST API.
- Frontend tidak boleh mengakses PostgreSQL secara langsung.
- Backend bertanggung jawab atas business logic aplikasi.
- Backend bertanggung jawab atas autentikasi dan otorisasi.
- Seluruh operasi database dilakukan melalui backend.
- Komunikasi antarsistem menggunakan jaringan internal jika memungkinkan.
- Aplikasi yang dipublikasikan wajib menggunakan HTTPS.
- Konfigurasi domain dan reverse proxy harus disesuaikan dengan kondisi deployment sebenarnya.

---

# 5. Struktur Tim dan Pembagian Tugas

Tim terdiri dari empat anggota yang dibagi menjadi dua Backend Developer dan dua Frontend Developer.

Setiap anggota memiliki tanggung jawab utama, tetapi tetap wajib berkoordinasi dalam proses integrasi.

## 5.1 Backend Developer 1 — Authentication dan User Management

Tanggung jawab:

- Membuat API registrasi pengguna.
- Membuat API login dan logout.
- Mengimplementasikan autentikasi JWT.
- Mengimplementasikan hashing password.
- Membuat middleware autentikasi.
- Membuat API profil pengguna.
- Melakukan validasi request.
- Menangani keamanan autentikasi.
- Mengelola integrasi autentikasi dengan PostgreSQL.

## 5.2 Backend Developer 2 — Project, Task, dan Team Management

Tanggung jawab:

- Membuat API manajemen proyek.
- Membuat API manajemen tugas.
- Membuat API manajemen anggota proyek.
- Membuat sistem undangan anggota.
- Mengimplementasikan Role-Based Access Control.
- Membuat middleware otorisasi.
- Mengimplementasikan isolasi data.
- Mengelola integrasi modul proyek, tugas, dan anggota dengan PostgreSQL.

## 5.3 Frontend Developer 1 — Authentication dan Dashboard

Tanggung jawab:

- Membuat halaman registrasi.
- Membuat halaman login.
- Mengimplementasikan autentikasi frontend.
- Membuat protected routes.
- Membuat dashboard utama.
- Membuat navigasi aplikasi.
- Membuat halaman profil pengguna.
- Membuat komponen UI yang dapat digunakan bersama.

## 5.4 Frontend Developer 2 — Project, Task, dan Team Interface

Tanggung jawab:

- Membuat halaman daftar proyek.
- Membuat halaman detail proyek.
- Membuat antarmuka manajemen tugas.
- Membuat antarmuka anggota tim.
- Membuat halaman undangan anggota.
- Membuat antarmuka pengaturan role.
- Mengintegrasikan seluruh fitur dengan API backend.

## 5.5 Aturan Koordinasi

- Backend Developer 1 dan 2 harus menyepakati struktur database.
- Backend Developer harus menyepakati kontrak API sebelum frontend melakukan integrasi.
- Frontend Developer harus menggunakan tipe data yang sesuai dengan response backend.
- Perubahan API wajib dikomunikasikan kepada seluruh anggota terkait.
- Setiap anggota wajib memahami bagian sistem yang terhubung dengan pekerjaannya.

---

# 6. Kebutuhan Fungsional Aplikasi

## 6.1 Authentication

Pengguna dapat:

- Melakukan registrasi menggunakan nama, email, dan password.
- Melakukan login.
- Melakukan logout.
- Melihat profil pengguna.
- Mengubah informasi profil.

Ketentuan keamanan:

- Password wajib di-hash menggunakan bcrypt.
- Password tidak boleh disimpan dalam bentuk plaintext.
- Email harus unik.
- Seluruh input harus divalidasi.
- Endpoint privat harus dilindungi middleware autentikasi.
- Password hash tidak boleh dikirim melalui response API.
- Token autentikasi harus dikelola secara aman.

## 6.2 Project Management

Pengguna dapat:

- Membuat proyek baru.
- Melihat daftar proyek yang dimiliki atau diikuti.
- Melihat detail proyek.
- Mengubah informasi proyek.
- Menghapus proyek jika memiliki hak akses.
- Melihat anggota proyek.
- Mengelola anggota sesuai role.

Ketentuan:

- Setiap proyek harus memiliki OWNER.
- Pengguna hanya dapat mengakses proyek yang dimiliki atau diikuti.
- Operasi pengelolaan proyek harus memeriksa hak akses.

## 6.3 Task Management

Pengguna dengan hak akses yang sesuai dapat:

- Membuat tugas.
- Melihat daftar tugas.
- Mengubah informasi tugas.
- Menghapus tugas.
- Menentukan anggota yang bertanggung jawab.
- Mengatur status tugas.
- Mengatur prioritas tugas.
- Mengatur deadline tugas.

Status tugas:

- TODO
- IN_PROGRESS
- REVIEW
- DONE

Prioritas tugas:

- LOW
- MEDIUM
- HIGH
- URGENT

Ketentuan:

- Setiap tugas harus terhubung dengan satu proyek.
- Anggota yang ditugaskan harus merupakan anggota proyek terkait.
- Perubahan status dan informasi tugas harus memeriksa izin pengguna.

## 6.4 Team Collaboration

Pengguna dengan hak akses yang sesuai dapat:

- Mengundang anggota ke proyek.
- Melihat daftar anggota proyek.
- Mengubah role anggota.
- Menghapus anggota.
- Menentukan anggota yang bertanggung jawab atas tugas.

Ketentuan:

- Undangan harus terhubung dengan proyek tertentu.
- Undangan harus memiliki status.
- Undangan memiliki masa berlaku.
- Token undangan harus sulit ditebak.
- Pengguna tidak boleh menerima undangan yang ditujukan kepada akun lain.

## 6.5 Role-Based Access Control (RBAC)

Gunakan tiga role utama:

| Role | Hak Akses |
| --- | --- |
| OWNER | Kendali penuh terhadap proyek |
| ADMIN | Mengelola proyek, tugas, dan anggota sesuai kebijakan |
| MEMBER | Melihat proyek dan mengelola tugas sesuai izin |

Ketentuan:

**OWNER**

- Mengelola seluruh informasi proyek.
- Menghapus proyek.
- Mengundang anggota.
- Mengatur role anggota.
- Mengelola tugas.
- Memiliki kendali penuh terhadap proyek.

**ADMIN**

- Mengelola informasi proyek sesuai kebijakan.
- Mengelola tugas.
- Mengundang anggota jika diizinkan.
- Mengelola anggota sesuai kebijakan.
- Tidak boleh mengambil alih kepemilikan proyek.

**MEMBER**

- Melihat informasi proyek.
- Melihat tugas.
- Mengelola tugas sesuai izin.
- Memperbarui tugas yang menjadi tanggung jawabnya jika diizinkan.
- Tidak boleh mengelola pengaturan sensitif proyek.

Ketentuan tambahan:

- Backend wajib memvalidasi role sebelum menjalankan operasi.
- Frontend hanya menyesuaikan tampilan berdasarkan hak akses.
- Frontend bukan pengaman utama sistem.

## 6.6 Data Isolation

Isolasi data merupakan salah satu aspek keamanan paling penting dalam TaskFlow Cloud.

Ketentuan:

- Pengguna hanya dapat melihat proyek yang dimiliki atau diikuti.
- Pengguna tidak boleh mengakses tugas dari proyek yang tidak diikutinya.
- Setiap permintaan terhadap resource proyek harus memeriksa membership.
- Pengguna tidak boleh mengubah data pengguna lain tanpa izin.
- ID pengguna dan role dari frontend tidak boleh dipercaya tanpa verifikasi backend.
- Query database harus memperhatikan kepemilikan dan keanggotaan proyek.
- Pengguna yang telah dihapus dari proyek tidak boleh mengakses resource proyek tersebut.
- Setiap operasi sensitif harus memeriksa hak akses pada backend.

---

# 7. Perancangan Database

Gunakan PostgreSQL pada VM 2 dan Prisma ORM untuk pengelolaan database.

## 7.1 Entitas Database

### User

- id
- name
- email
- password
- createdAt
- updatedAt

### Project

- id
- name
- description
- ownerId
- createdAt
- updatedAt

### ProjectMember

- id
- projectId
- userId
- role
- joinedAt

### Task

- id
- projectId
- title
- description
- status
- priority
- assigneeId
- dueDate
- createdAt
- updatedAt

### Invitation

- id
- projectId
- email
- role
- token
- status
- expiresAt
- createdAt

## 7.2 Aturan Database

- Gunakan UUID sebagai primary key.
- Gunakan foreign key untuk menjaga integritas relasi.
- Email harus unik.
- Gunakan timestamp untuk pencatatan waktu.
- Buat index pada kolom yang sering digunakan.
- Gunakan migration Prisma untuk perubahan struktur database.
- Jangan mengubah struktur database produksi secara manual.
- Pastikan relasi pengguna, proyek, tugas, dan anggota terdefinisi dengan benar.
- Gunakan constraint untuk mencegah keanggotaan proyek yang duplikat.
- Pastikan penghapusan data mempertimbangkan integritas relasi.

## 7.3 Aturan Perubahan Schema

Karena database digunakan bersama oleh kedua Backend Developer:

1. Diskusikan perubahan schema terlebih dahulu.
2. Tentukan dampak perubahan terhadap modul lain.
3. Gunakan Prisma migration.
4. Uji migration pada lingkungan development.
5. Komunikasikan perubahan kepada Frontend Developer jika memengaruhi kontrak API.
6. Jangan mengubah schema produksi tanpa persetujuan tim.

Struktur database di atas merupakan rancangan awal dan dapat disempurnakan berdasarkan kebutuhan implementasi.

---

# 8. Standar API Backend

Gunakan REST API dengan versi awal:

```text
/api/v1
```

## 8.1 Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

## 8.2 User

```text
GET    /api/v1/users/me
PATCH  /api/v1/users/me
```

## 8.3 Projects

```text
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
```

## 8.4 Tasks

```text
POST   /api/v1/projects/:projectId/tasks
GET    /api/v1/projects/:projectId/tasks
GET    /api/v1/tasks/:taskId
PATCH  /api/v1/tasks/:taskId
DELETE /api/v1/tasks/:taskId
```

## 8.5 Team Members dan Invitations

```text
GET    /api/v1/projects/:projectId/members
POST   /api/v1/projects/:projectId/invitations
PATCH  /api/v1/projects/:projectId/members/:memberId
DELETE /api/v1/projects/:projectId/members/:memberId
POST   /api/v1/invitations/accept
```

## 8.6 Format Response API

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

Gunakan HTTP status code yang sesuai:

| Status | Keterangan |
| --- | --- |
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

Kontrak API harus disepakati sebelum frontend mengimplementasikan integrasi.

---

# 9. Standar Penulisan Kode

Seluruh anggota wajib mengikuti standar penulisan kode yang konsisten.

## 9.1 Aturan Umum

- Gunakan TypeScript.
- Hindari penggunaan tipe `any` tanpa alasan yang jelas.
- Gunakan nama variabel dan fungsi yang mudah dipahami.
- Pisahkan fungsi berdasarkan tanggung jawab.
- Hindari duplikasi kode.
- Gunakan komponen dan fungsi yang dapat digunakan kembali.
- Tangani error secara eksplisit.
- Hindari abstraksi yang tidak diperlukan.
- Gunakan format kode yang konsisten.

## 9.2 Standar Backend

Gunakan arsitektur modular dengan pemisahan:

- Routes.
- Controllers.
- Services.
- Middlewares.
- Validators.
- Database / Prisma.
- Utilities.

Ketentuan:

- Semua request wajib divalidasi.
- Business logic berada pada service layer.
- Endpoint privat wajib memiliki autentikasi.
- Operasi sensitif wajib memiliki pemeriksaan otorisasi.
- Jangan mengirim detail internal error kepada pengguna.
- Gunakan environment variable untuk konfigurasi.
- Gunakan asynchronous handling dan error middleware secara konsisten.

## 9.3 Standar Frontend

Gunakan React Functional Components dan Hooks.

Ketentuan:

- Gunakan komponen reusable.
- Gunakan Tailwind CSS untuk styling.
- Pisahkan API request ke dalam service layer.
- Gunakan TypeScript untuk seluruh tipe data.
- Implementasikan loading state.
- Implementasikan error state.
- Implementasikan empty state.
- Gunakan protected routes untuk halaman privat.
- Jangan menuliskan URL API produksi secara langsung di komponen.
- Hindari duplikasi logika komunikasi API.
- Pisahkan komponen berdasarkan tanggung jawab.
- Pastikan tampilan responsif.

---

# 10. Git dan Kolaborasi Tim

Seluruh pengembangan menggunakan Git dan GitHub.

## 10.1 Struktur Branch

```text
main

feature/authentication
feature/user-profile
feature/project-management
feature/task-management
feature/team-management

fix/login-validation
fix/project-permission
```

Branch `develop` tidak digunakan pada proyek ini. Integrasi dilakukan langsung ke `main` melalui Pull Request.

## 10.2 Format Commit

Gunakan Conventional Commits.

Contoh:

```text
feat: menambahkan registrasi pengguna
feat: membuat manajemen proyek
feat: menambahkan manajemen tugas
fix: memperbaiki validasi login
fix: memperbaiki hak akses proyek
refactor: merapikan struktur backend
style: memperbaiki tampilan dashboard
docs: memperbarui dokumentasi API
```

## 10.3 Aturan Git dan Kolaborasi

- Jangan melakukan push langsung ke branch main.
- Gunakan feature branch untuk setiap pekerjaan.
- Ambil perubahan terbaru dari branch main sebelum memulai pekerjaan.
- Gunakan Pull Request untuk integrasi ke branch main.
- Lakukan review kode sebelum merge.
- Selesaikan merge conflict dengan koordinasi anggota tim.
- Jangan commit file `.env`, secret, atau kredensial.
- Jangan mengubah modul anggota lain tanpa koordinasi.

## 10.4 Commit dan Push Wajib Manual

Seluruh aktivitas Git yang mengubah repository wajib dikendalikan secara manual oleh anggota tim.

AI Coding Agent hanya diperbolehkan membantu:

- Membuat dan mengubah kode.
- Memeriksa perubahan kode.
- Menjalankan pengujian.
- Menjelaskan perubahan yang dilakukan.
- Memberikan rekomendasi pesan commit.
- Memberikan instruksi perintah Git yang perlu dijalankan anggota tim.

AI Coding Agent DILARANG melakukan tindakan berikut tanpa instruksi eksplisit dari anggota tim:

- Menjalankan `git add`.
- Menjalankan `git commit`.
- Menjalankan `git push`.
- Melakukan merge branch.
- Menghapus branch.
- Mengubah riwayat Git.
- Melakukan force push.
- Mengubah konfigurasi remote repository.

Setelah implementasi selesai, AI Agent harus:

1. Menampilkan daftar file yang diubah.
2. Menjelaskan perubahan yang dilakukan.
3. Menampilkan hasil pemeriksaan atau pengujian.
4. Memberikan rekomendasi pesan commit.
5. Memberikan instruksi Git jika diperlukan.

Anggota tim sendiri yang memutuskan kapan melakukan staging, commit, push, dan merge.

**Prinsip utama: Tidak boleh ada commit, push, atau merge otomatis tanpa instruksi eksplisit dari anggota tim.**

---

# 11. Konfigurasi Environment

Gunakan environment variable untuk seluruh konfigurasi yang bersifat rahasia atau bergantung pada lingkungan.

## 11.1 Backend .env.example

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=1d

FRONTEND_URL=
```

## 11.2 Frontend .env.example

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Ketentuan:

- Jangan commit file `.env`.
- Sediakan `.env.example`.
- Pisahkan konfigurasi development dan production.
- Secret produksi harus disimpan pada server.
- Jangan menempatkan kredensial database atau JWT secret di frontend.
- Variabel dengan awalan `VITE_` dianggap dapat diakses oleh browser sehingga tidak boleh berisi secret.

---

# 12. Pengujian dan Quality Assurance

Sebelum fitur dianggap selesai, lakukan pengujian sesuai modul.

## 12.1 Backend

- API mengembalikan response sesuai kontrak.
- Validasi request berjalan.
- Registrasi dan login berjalan.
- Autentikasi berjalan.
- Otorisasi berdasarkan role berjalan.
- Operasi database berhasil.
- Akses tanpa izin ditolak.
- Error handling berjalan.
- Isolasi data berjalan.

## 12.2 Frontend

- Seluruh halaman dapat ditampilkan.
- Form memiliki validasi.
- Integrasi API berjalan.
- Loading state ditampilkan.
- Error state ditampilkan.
- Protected routes berjalan.
- Tampilan responsif.
- Navigasi berjalan dengan benar.

## 12.3 Integrasi Aplikasi

- Pengguna dapat melakukan registrasi dan login.
- Pengguna dapat membuat dan mengelola proyek.
- Pengguna dapat membuat dan mengelola tugas.
- Pengguna dapat mengundang anggota.
- Role dan hak akses berjalan sesuai ketentuan.
- Data antar pengguna dan proyek terisolasi.
- Frontend dapat berkomunikasi dengan backend.
- Backend dapat mengakses PostgreSQL pada VM 2.

## 12.4 Infrastruktur dan Deployment

- Tiga VM berjalan pada Proxmox.
- VM 1 menjalankan layanan monitoring.
- VM 2 menjalankan PostgreSQL.
- VM 3 menjalankan backend dan frontend.
- Dokku dapat melakukan deployment aplikasi.
- Aplikasi dapat dikelola melalui perintah Dokku.
- Push manual ke GitHub dapat memicu deployment otomatis.
- Aplikasi dapat diakses melalui domain HTTPS.
- Dashboard monitoring menampilkan kondisi infrastruktur.

---

# 13. Instruksi Khusus untuk AI Coding Agent

Setiap AI Coding Agent yang digunakan anggota tim wajib mengikuti ketentuan berikut.

1. Baca AGENTS.md sebelum melakukan perubahan kode.
2. Periksa struktur repository sebelum mengimplementasikan fitur.
3. Jangan menganggap file, fungsi, API, atau database sudah tersedia tanpa memeriksanya.
4. Ikuti arsitektur dan standar penulisan kode yang telah disepakati.
5. Jangan menulis ulang implementasi yang sudah berjalan tanpa alasan.
6. Jangan mengubah modul lain yang tidak berkaitan dengan tugas.
7. Koordinasikan perubahan kontrak API dan database sebelum mengimplementasikan fitur yang bergantung padanya.
8. Hindari pembuatan komponen, service, dan utility duplikat.
9. Jangan melewati proses autentikasi dan otorisasi.
10. Jangan mengekspos secret, password, atau informasi sensitif.
11. Jangan memasang dependency baru tanpa menjelaskan alasannya.
12. Jalankan pemeriksaan dan pengujian setelah implementasi.
13. Laporkan file yang diubah, fitur yang dibuat, dan masalah yang belum diselesaikan.
14. Jika terdapat kebutuhan yang tidak jelas, tanyakan terlebih dahulu sebelum mengubah arsitektur.
15. Jangan mengklaim fitur berhasil apabila belum diimplementasikan dan diuji.
16. Jangan menjalankan perintah Git yang mengubah staging area, commit, remote repository, atau riwayat Git tanpa instruksi eksplisit.
17. Jangan melakukan commit, push, merge, atau force push secara otomatis.
18. Setelah menyelesaikan pekerjaan, berikan ringkasan perubahan dan rekomendasi perintah Git kepada anggota tim.
19. Jangan mengubah konfigurasi server produksi tanpa persetujuan anggota tim.
20. Jangan menjalankan perintah destruktif terhadap database, container, VM, atau infrastruktur tanpa persetujuan eksplisit.

## Prinsip Keamanan

Backend merupakan sumber utama kebenaran untuk autentikasi, otorisasi, dan kepemilikan data.

Pembatasan akses pada frontend saja tidak cukup untuk melindungi data pengguna.

## Prinsip Kolaborasi

AI Coding Agent bertugas membantu proses pengembangan, bukan mengambil alih kendali repository dan infrastruktur.

Seluruh keputusan mengenai staging, commit, push, merge, perubahan database produksi, dan konfigurasi server tetap berada di tangan anggota tim.

---

# 14. Tahapan Pengembangan

Ikuti urutan pengembangan berikut.

## Fase 1 — Persiapan Fondasi

- Menyiapkan repository frontend dan backend.
- Mengatur TypeScript.
- Mengatur PostgreSQL pada VM 2.
- Mengatur Prisma ORM.
- Menentukan struktur database.
- Menentukan kontrak API.
- Mengatur lingkungan development.

## Fase 2 — Authentication

- Registrasi pengguna.
- Login pengguna.
- Logout pengguna.
- JWT authentication.
- Protected routes.
- Profil pengguna.

## Fase 3 — Project Management

- Membuat proyek.
- Menampilkan daftar proyek.
- Mengubah proyek.
- Menghapus proyek.
- Melihat detail proyek.

## Fase 4 — Task Management

- Membuat tugas.
- Menampilkan daftar tugas.
- Mengubah tugas.
- Menghapus tugas.
- Menentukan anggota penanggung jawab.
- Mengatur status dan prioritas.

## Fase 5 — Team Collaboration

- Mengundang anggota.
- Mengelola keanggotaan proyek.
- Mengimplementasikan RBAC.
- Mengatur hak akses.
- Memastikan isolasi data.

## Fase 6 — Cloud Deployment

- Mengonfigurasi Dokku pada VM 3.
- Melakukan deployment backend.
- Melakukan deployment frontend.
- Menghubungkan PostgreSQL pada VM 2.
- Mengonfigurasi GitHub Webhook dan CI/CD.
- Mengonfigurasi domain.
- Mengaktifkan HTTPS.

## Fase 7 — Monitoring dan Pengujian

- Mengonfigurasi monitoring pada VM 1.
- Memantau CPU, RAM, disk, dan jaringan.
- Menguji seluruh fitur aplikasi.
- Menguji hak akses pengguna.
- Menguji isolasi data.
- Menguji otomatisasi deployment.
- Menyiapkan bukti implementasi dan dokumentasi.

## 14.1 Ketentuan Deployment dan CI/CD

Alur deployment harus mengikuti prinsip berikut:

1. Developer mengubah kode secara lokal melalui editor seperti VS Code.
2. Developer memeriksa perubahan kode.
3. Developer menjalankan pengujian secara lokal.
4. Developer melakukan `git add`, `git commit`, dan `git push` secara manual.
5. GitHub menerima perubahan kode.
6. GitHub Webhook atau mekanisme CI/CD memicu proses deployment.
7. Dokku menjalankan proses build dan deployment.
8. Aplikasi diperbarui pada server.

Ketentuan tambahan:

- Commit dan push tidak boleh dilakukan otomatis oleh AI Agent.
- GitHub tidak boleh melakukan commit atau push balik ke repository secara otomatis.
- CI/CD boleh menjalankan pengujian, build, dan deployment.
- Deployment produksi harus mengikuti branch dan kebijakan yang disepakati tim.
- Kegagalan deployment harus dapat diketahui dan diperiksa oleh anggota tim.

**Prinsip utama: Pengembangan dan pengiriman kode dikendalikan manusia, sedangkan proses build dan deployment dapat diotomatisasi.**

---

# 15. Kriteria Penyelesaian Proyek (Definition of Done)

Sebuah fitur dianggap selesai apabila:

- Sudah diimplementasikan sesuai arsitektur.
- Pemeriksaan TypeScript berhasil.
- Pengujian yang relevan berhasil.
- Integrasi API berjalan jika diperlukan.
- Autentikasi dan otorisasi diterapkan dengan benar.
- Tidak ada informasi sensitif yang terekspos.
- Perubahan sudah diperiksa oleh anggota tim.
- Perubahan didokumentasikan jika diperlukan.

## 15.1 Target Implementasi Akhir

### IaaS — Infrastructure as a Service

- Proxmox VE menjalankan tiga VM.
- VM 1 digunakan untuk monitoring.
- VM 2 digunakan untuk database.
- VM 3 digunakan untuk backend dan frontend.
- Ketiga VM dapat saling berkomunikasi sesuai kebutuhan.

### PaaS — Platform as a Service

- Dokku berhasil dipasang dan dikonfigurasi.
- Aplikasi berhasil di-deploy melalui Dokku.
- Aplikasi dapat dikelola menggunakan perintah Dokku.
- Deployment dapat dilakukan ulang ketika terdapat perubahan kode.

### CI/CD

- Source code dikelola menggunakan GitHub.
- Developer melakukan commit dan push secara manual.
- Push ke GitHub memicu proses deployment otomatis.
- Hasil deployment dapat diperiksa melalui log.

### SaaS — Software as a Service

- Pengguna dapat melakukan registrasi.
- Pengguna dapat login dan logout.
- Pengguna dapat membuat dan mengelola proyek.
- Pengguna dapat membuat dan mengelola tugas.
- Pengguna dapat mengundang anggota.
- Pengguna dapat mengatur role sesuai hak akses.
- Data pengguna dan proyek terisolasi.
- Data tersimpan di PostgreSQL pada VM 2.

### Publikasi dan Monitoring

- Aplikasi dapat diakses melalui domain HTTPS.
- Frontend dan backend berjalan pada VM 3.
- Database berjalan pada VM 2.
- VM 1 menampilkan kondisi monitoring infrastruktur.
- Kondisi CPU, RAM, disk, dan jaringan dapat dipantau.

---

# 16. Target Akhir TaskFlow Cloud

TaskFlow Cloud harus menjadi aplikasi SaaS manajemen proyek dan tugas yang berfungsi secara nyata dan berjalan pada infrastruktur cloud milik tim.

Produk akhir harus membuktikan integrasi tiga model layanan cloud:

**IaaS (Infrastructure as a Service)**

Penyediaan dan pengelolaan infrastruktur virtual menggunakan Proxmox VE dan tiga Virtual Machine.

**PaaS (Platform as a Service)**

Penyediaan platform deployment aplikasi menggunakan Dokku serta otomatisasi build dan deployment melalui GitHub CI/CD.

**SaaS (Software as a Service)**

TaskFlow Cloud sebagai aplikasi manajemen proyek dan tugas yang dapat digunakan langsung oleh pengguna melalui browser.

**Prinsip pengembangan utama:**

- Arsitektur harus konsisten.
- Kode harus mudah dipahami dan dipelihara.
- Keamanan dan isolasi data harus diperhatikan.
- Kolaborasi antaranggota harus terkoordinasi.
- Commit, push, dan merge dilakukan secara manual.
- Deployment boleh dilakukan secara otomatis melalui CI/CD.
- Setiap fitur harus diuji sebelum dianggap selesai.

Seluruh pengembangan harus mengarah pada satu tujuan:

**Membangun platform cloud terintegrasi yang dapat berjalan, digunakan, dikelola, dipantau, dan dibuktikan implementasinya.**
