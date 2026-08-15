# Kas — Kelola Keuangan & Rencana Aset

Aplikasi pencatatan keuangan harian dengan fitur perencanaan cicilan aset. Data disimpan secara permanen di database MySQL.

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** MySQL (via `mysql2` driver)
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Dependencies:** `express`, `mysql2`, `cors`

## Prerequisites

- Node.js v20 atau lebih tinggi
- MySQL Server berjalan di `localhost:3306`

## Installation

```bash
# 1. Buka folder project
cd kasku

# 2. Install dependencies
npm install

# 3. Import database schema
mysql -u root -p < db_schema.sql

# 4. Jalankan server
npm start
```

Server akan berjalan di **http://localhost:3000**

## Database Setup

| Parameter | Value |
|-----------|-------|
| Host | `127.0.0.1` |
| Port | `3306` |
| User | `root` |
| Database | `db_kas` |

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
| created_at | DATE | Tanggal rencana dibuat |

## API Documentation

### Transactions

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/transactions` | Ambil semua transaksi |
| POST | `/api/transactions` | Tambah transaksi baru |
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
  "planId": null
}
```

### Plans

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/plans` | Ambil semua rencana |
| POST | `/api/plans` | Tambah rencana baru |
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
  "createdAt": "2026-08-15"
}
```

**POST /api/plans/:id/contrib — Request Body:**

```json
{
  "id": 1723728002000,
  "date": "2026-08-15",
  "amount": 500000,
  "planName": "Motor"
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
2. **Transaksi** — Tambah, filter, dan hapus catatan pemasukan/pengeluaran
3. **Rencana Aset** — Buat rencana cicilan aset dan catat setoran berkala
