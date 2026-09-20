# ZEntryX Database System

**ZEntryX Database System** adalah platform SaaS enterprise end-to-end berbasis web yang dirancang untuk otomatisasi pendaftaran layanan (CBA, Fiber Optic, VAS, Corporate Services), manajemen tim sales multilapis, monitoring performa real-time, pengolahan dokumen PDF otomatis, dan pusat pemantauan sistem DevOps (Developer Console).

---

## Requirement

To run and develop this project, ensure you have the following installed in your system:
- **Node.js**: v18.17.0, v20.0.0, or newer (LTS recommended)
- **npm**: v9.0.0 or newer (comes standard with Node.js)
- **Git**: For version control and source code management

---

## Cara Install

Ikuti langkah berikut untuk menginstal seluruh dependency yang dibutuhkan aplikasi:

1. Buka terminal atau command prompt di dalam folder utama project.
2. Jalankan perintah instalasi dependency:

```bash
npm install
```

*Catatan:* Jika mengalami kendala konflik peer dependency dengan versi Node.js tertentu, gunakan perintah berikut:

```bash
npm install --legacy-peer-deps
```

---

## Menjalankan Project

Untuk menjalankan server pengembangan (development server) secara lokal:

```bash
npm run dev
```

Setelah server berjalan, buka browser dan akses aplikasi melalui tautan:
**[http://localhost:3000](http://localhost:3000)**

---

## Build Project

Untuk memverifikasi kompilasi TypeScript dan membuat bundle produksi yang dioptimalkan:

```bash
npm run build
```

Setelah proses build selesai, untuk menjalankan aplikasi dalam mode produksi:

```bash
npm start
```

---

## Struktur Folder

Berikut adalah struktur folder utama dari project ZEntryX:

```text
src/
├── app/          # Routing utama aplikasi (Next.js App Router) terbagi per role:
│   ├── developer/  # DevOps Control Center, System Overview, Audit Logs
│   ├── manager/    # Executive Dashboard, Analisa Performa, Laporan Tim
│   ├── leader/     # Team Monitoring, Komposisi Paket, Kalender & Report
│   ├── sales/      # Form Pendaftaran Layanan, Draft, Riwayat, Panduan
│   └── login/      # Sistem Otentikasi & Login Multi-Role
├── components/   # Komponen UI interaktif (Sidebar, Navbar, Chart, Form, Modal)
└── lib/          # Utilitas sistem, koneksi Supabase, dan helper generator PDF
public/           # Aset statis, gambar ikon, logo, serta template dokumen PDF
schema.sql        # Skema lengkap database PostgreSQL (Tabel, RLS Policy, Trigger)
package.json      # Konfigurasi dependency dan script project
```

---

## Environment

Project ini menggunakan file `.env.local` untuk konfigurasi koneksi database dan layanan awan.

- **Nama File:** `.env.local` (berada di root folder)
- **Variabel yang Diperlukan:**
  - `NEXT_PUBLIC_SUPABASE_URL`: URL dari instance project Supabase Anda.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Anonymous Key dari project Supabase Anda.

- **Contoh Isi `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key-for-ui-development
```

*Keunggulan Khusus:* Aplikasi telah dilengkapi dengan mekanisme **Local Preview / Dummy Authentication Engine**. Meskipun Anda belum memasukkan API Key Supabase yang asli, Anda tetap dapat langsung login, mencoba seluruh rute, mengisi form, dan melihat visualisasi grafik secara offline!

---

## Teknologi

Project ZEntryX dibangun dengan teknologi modern kelas enterprise:
- **Core Framework:** React 19 & Next.js 16 (App Router dengan dukungan Turbopack)
- **Language:** TypeScript
- **Styling Architecture:** Vanilla CSS & Custom Design System (Glassmorphism, High-End SaaS Aesthetics, Tanpa TailwindCSS/UI Library eksternal yang kaku)
- **Database & Authentication:** Supabase (PostgreSQL, Row Level Security, Secure Vault)
- **Data Visualization:** Recharts (Sparklines, Donut Charts, Area/Bar Compositions)
- **Document Processing:** `pdf-lib` (Otomatisasi pengisian & penandatanganan dokumen PDF di browser)
- **Optical Character Recognition:** `tesseract.js` (Ekstraksi teks dokumen)
- **Spreadsheet Processing:** `xlsx` (Ekspor laporan dan rekapitulasi data)

---

## Cara Login

Anda dapat langsung mencoba aplikasi menggunakan salah satu **Akun Demo Resmi** yang sudah terintegrasi ke dalam sistem preview lokal aplikasi:

| Role | Email / Username | Password |
|------|-------------------|----------|
| **Developer** | `dev@zentry.com` | `admin123` |
| **Manager** | `manager@zentry.com` | `admin123` |
| **Leader** | `leader@zentry.com` | `admin123` |
| **Sales** | `sales@zentry.com` | `admin123` |

*Catatan:* Akun-akun di atas siap digunakan langsung di halaman Login (`/login`). Gunakan email yang diawali oleh nama role (contoh: `sales...`, `leader...`, `manager...`, atau `dev...`) dengan kata sandi `admin123`.

---

## Hak Akses

ZEntryX menerapkan sistem **Role-Based Access Control (RBAC)** yang ketat sesuai hierarki organisasi:

### 1. Developer (System Administrator & DevOps)
- **Control Center & System Overview:** Monitoring kesehatan server (CPU, RAM, Storage), Uptime, dan latensi API.
- **User & License Management:** Kelola masa aktif lisensi premium, aktivasi akun, dan hak akses.
- **Audit & Security:** Pantau log aktivitas sistem real-time, jejak login, alamat IP, dan User Agent.
- **Infrastructure:** Konfigurasi API, pemantauan error 24 jam, dan riwayat deployment.

### 2. Manager (Executive & Strategic Oversight)
- **Executive Dashboard:** Akses analitik makro penjualan seluruh tim di perusahaan.
- **Leader & Team Supervision:** Pantau produktivitas setiap Leader dan performa tim di bawahnya.
- **Approval & Reporting:** Validasi pencapaian target, ekspor data rekapitulasi ke Excel/CSV.

### 3. Leader (Team Supervisor)
- **Sales Monitoring:** Pemantauan progres harian dan bulanan dari anggota tim Sales di bawahnya.
- **Package Composition:** Analisa peminatan paket (CBA, Fiber, VAS) dalam tim.
- **Team Calendar & Reports:** Penjadwalan aktivitas tim dan tinjauan laporan pengajuan.

### 4. Sales (Field & Representative)
- **Service Registration:** Pengisian form pendaftaran layanan, pemilihan paket, dan perhitungan tarif otomatis.
- **Draft & Submission Management:** Simpan draf pengajuan sementara, kelola kelengkapan berkas, dan tanda tangan digital.
- **History & Tracking:** Lacak status pengajuan (Submitted, Approved, Rejected) secara real-time.
- **Feedback & Support:** Pengiriman kritik, saran, dan pelaporan kendala teknis.

---

## Catatan

- **Instalasi Dependency:** Selalu jalankan `npm install` terlebih dahulu sebelum menjalankan perintah `npm run dev` atau `npm run build`.
- **Kebersihan Repo:** Jangan pernah melakukan commit atau menyertakan folder `node_modules` ataupun `.next` ketika mendistribusikan ulang source code ini.
- **Migrasi Database:** Jika Anda ingin menghubungkan aplikasi ini ke server database Supabase production Anda sendiri, buka file `schema.sql` dan jalankan seluruh query SQL tersebut di fitur **SQL Editor** pada dashboard Supabase Anda. Hal ini akan membuat seluruh tabel, relasi, RLS policy, dan trigger yang dibutuhkan.
- **Keamanan Lisensi:** Sistem pemantauan lisensi premium (*6-segment emerald pill progress*) akan otomatis menghitung sisa masa aktif pengguna secara dinamis di sidebar.
