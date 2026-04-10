# Jaecoo Service Frontend

Frontend Vite + React + TypeScript untuk sistem manajemen servis kendaraan.

## Perubahan revisi

- login demo langsung aktif
- sidebar dan halaman menyesuaikan role
- **MANAGER diperlakukan sebagai admin kedua** dengan hak akses penuh operasional
- alur frontdesk, mekanik, admin, dan manajer sekarang tercermin di dashboard dan modul utama

## Akun demo

- `admin@service.com` / `Admin123!`
- `manager@service.com` / `Manager123!`
- `frontline@service.com` / `Frontline123!`
- `mechanic@service.com` / `Mechanic123!`

## Menjalankan proyek

```bash
npm install
npm run dev
```

## Deploy ke Vercel

Frontend ini siap dideploy sebagai aplikasi Vite statis.

Konfigurasi penting:
- Root Directory project Vercel: `frontend`
- SPA rewrite: `vercel.json`

Environment variable yang disarankan:
- `VITE_API_BASE_URL=https://nama-backend-kamu.vercel.app/api`
- `VITE_ENABLE_DEMO_AUTH=false`

Catatan deploy:
- Jika `VITE_API_BASE_URL` tidak diisi, frontend akan fallback ke `/api` di origin yang sama saat berjalan di host non-local.
- Untuk deploy frontend dan backend sebagai dua project Vercel terpisah, isi `VITE_API_BASE_URL` dengan URL backend publik.

## Catatan role

- `ADMIN`: superuser sistem
- `MANAGER`: admin kedua dengan akses penuh
- `FRONTLINE`: ditampilkan di UI sebagai **Frontdesk**
- `MEKANIK`: fokus pengerjaan teknis