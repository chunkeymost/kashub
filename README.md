# Kas — Kelola Keuangan & Rencana Aset

Aplikasi pencatatan keuangan harian dengan fitur perencanaan cicilan aset. Data disimpan secara permanen di database MySQL.

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** MySQL (via `mysql2` driver)
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Dependencies:** `express`, `mysql2`, `cors`, `helmet`, `express-rate-limit`, `dotenv`

## Prerequisites

- Node.js v20 atau lebih tinggi
- MySQL Server berjalan di `localhost:3306`

## Installation

```bash
# 1. Buka folder project
cd kasku

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env

# 4. Edit .env dengan credential Anda
# (lihat Environment Variables di bawah)

# 5. Import database schema
mysql -u root -p < db_schema.sql

# 6. Jalankan server
npm start
```

Server akan berjalan di **http://localhost:3000**

> **Note:** Body limit diatur ke 10mb untuk mendukung upload gambar base64 sebagai bukti setoran.

## Environment Variables

Buat file `.env` dari template `.env.example` dan isi dengan credential Anda:

| Variable | Keterangan | Contoh |
|----------|------------|--------|
| `DB_HOST` | Host MySQL | `127.0.0.1` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Username MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | `your_password` |
| `DB>Nama` | Nama database | `db_kas` |
| `SUPABASE_URL` | URL Supabase (untuk Vercel) | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key Supabase | `eyJhbGci...` |
| `RESET_TOKEN` | Token untuk reset endpoint | `your-secret-token` |

> **Penting:** Jangan commit file `.env` ke repository. File `.env` sudah ada di `.gitignore`.

## Database Setup

### Tabel

**transactions**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | ID unik transaksi (timestamp) |
| date | DATE | Tanggal transaksi |
| type | ENUM | `income`, `expense`, `saving` |
| category | VARCHAR(100) | Kategori transaksi |
| amount | INT | Jumlah dalam Rupiah |
| note | TEXT | Catatan tambahan (opsional) |
| plan_id | BIGINT | ID rencana terkait (opsional) |
| evidence | MEDIUMTEXT | Bukti gambar setoran dalam base64 (opsional) |
| created_at | TIMESTAMP | Waktu data dibuat |

**plans**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | ID unik rencana (timestamp) |
| name | VARCHAR(200) | Nama aset |
| target_amount | INT | Target harga aset |
| mode | ENUM | `date` (berdasarkan tanggal) atau `monthly` (cicilan tetap) |
| target_date | DATE | Tanggal target tercapai (mode date) |
| monthly_fixed | INT | Cicilan per bulan (mode monthly) |
| purchase_link | VARCHAR(500) | Link pembelian aset (opsional) |
| created_at | DATE | Tanggal rencana dibuat |

### Migrasi Database

Jika database sudah ada sebelumnya, jalankan perintah berikut untuk menambah kolom baru:

```sql
ALTER TABLE plans ADD COLUMN purchase_link VARCHAR(500) DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN evidence MEDIUMTEXT DEFAULT NULL;
```

## API Documentation

### Transactions

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/transactions` | Ambil semua transaksi |
| POST | `/api/transactions` | Tambah transaksi baru |
| PUT | `/api/transactions/:id` | Update transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |

**POST /api/transactions — Request Body:**

```json
{
  "id": 1723728000000,
  "date": "2026-08-15",
  "type": "income",
  "category": "Gaji",
  "amount": 5000000,
  "note": "Gaji bulanan",
  "planId": null,
  "evidence": null
}
```

**PUT /api/transactions/:id — Request Body:**

```json
{
  "date": "2026-08-15",
  "type": "income",
  "category": "Gaji",
  "amount": 5500000,
  "note": "Gaji bulanan + bonus",
  "evidence": "data:image/jpeg;base64,..."
}
```

### Plans

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/plans` | Ambil semua rencana |
| POST | `/api/plans` | Tambah rencana baru |
| PUT | `/api/plans/:id` | Update rencana |
| DELETE | `/api/plans/:id` | Hapus rencana |
| POST | `/api/plans/:id/contrib` | Tambah setoran ke rencana |

**POST /api/plans — Request Body:**

```json
{
  "id": 1723728001000,
  "name": "Motor",
  "targetAmount": 25000000,
  "mode": "monthly",
  "targetDate": "",
  "monthlyFixed": 2000000,
  "purchaseLink": "https://www.tokopedia.com/motor/beat",
  "createdAt": "2026-08-15"
}
```

**PUT /api/plans/:id — Request Body:**

```json
{
  "name": "Motor Honda Beat",
  "targetAmount": 25000000,
  "mode": "monthly",
  "targetDate": "",
  "monthlyFixed": 2500000,
  "purchaseLink": "https://www.tokopedia.com/motor/beat"
}
```

**POST /api/plans/:id/contrib — Request Body:**

```json
{
  "id": 1723728002000,
  "date": "2026-08-15",
  "amount": 500000,
  "planName": "Motor",
  "evidence": "data:image/jpeg;base64,..."
}
```

### Reset

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| DELETE | `/api/reset` | Hapus semua data transaksi dan rencana |

## Project Structure

```
kasku/
├── index.html          # Frontend (single page)
├── server.js           # Express server + API routes
├── db.js               # MySQL connection pool
├── db_schema.sql       # Database schema
├── .env.example        # Environment variables template
├── .env                # Environment variables (gitignored)
├── package.json        # Dependencies
├── node_modules/       # Installed packages
└── README.md           # Dokumentasi ini
```

## How It Works

1. Frontend (`index.html`) menggunakan `fetch()` untuk memanggil API
2. Backend (`server.js`) menerima request dan mengeksekusi query ke MySQL
3. Data tersimpan permanen di database `db_kas`
4. Frontend dilayani langsung oleh Express via `express.static`

## Usage

Buka **http://localhost:3000** di browser, lalu:

1. **Dasbor** — Lihat ringkasan saldo, pemasukan, pengeluaran, dan transaksi terakhir
2. **Transaksi** — Tambah, edit, filter, dan hapus catatan pemasukan/pengeluaran
   - Klik tombol **✎** pada baris transaksi untuk mengedit
   - Klik tombol **✕** untuk menghapus transaksi
3. **Rencana Aset** — Buat rencana cicilan aset, catat setoran berkala, dan unggah bukti
   - Klik **✎ Edit** pada rencana untuk mengubah nama, target, cicilan, atau link pembelian
   - Klik **Lihat Setoran** untuk melihat daftar semua setoran per rencana
   - Klik **+ Tambah Setoran** lalu unggah gambar bukti sebagai evidence
   - Klik thumbnail gambar untuk melihat bukti dalam ukuran penuh (lightbox)
   - Klik **✕** pada thumbnail untuk menghapus bukti gambar
   - Link pembelian ditampilkan sebagai "🔗 Lihat Produk" jika sudah diisi

### Fitur Responsive

Tampilan otomatis menyesuaikan di perangkat mobile (< 720px):
- Tabel transaksi berubah menjadi card layout
- Form input menyesuaikan lebar layar
- Navigasi stack vertikal dengan scroll horizontal
