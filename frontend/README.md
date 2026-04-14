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

## Catatan role

- `ADMIN`: superuser sistem
- `MANAGER`: admin kedua dengan akses penuh
- `FRONTLINE`: ditampilkan di UI sebagai **Frontdesk**
- `MEKANIK`: fokus pengerjaan teknis