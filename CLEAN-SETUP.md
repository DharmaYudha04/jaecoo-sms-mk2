# JAECOO Service System - Clean Project Notes

Proyek ini sudah dirapikan untuk fokus pada:
- notifikasi per-user
- sender tidak menerima notifnya sendiri
- halaman **Notifikasi** dan **Broadcast** dipisah
- realtime update via SSE
- fondasi web push + service worker
- CTA izin notifikasi perangkat di frontend

## Hal yang sudah dibersihkan
- migrasi patch notifikasi yang duplikat dan saling bentrok dihapus
- import modul realtime lama yang sudah tidak ada dibersihkan
- frontend diperbaiki agar build kembali normal
- file sensitif dan file yang tidak perlu untuk source bundle akan dihapus dari ZIP final

## Struktur notifikasi
- `/notifications` = notifikasi sistem
- `/broadcasts` = broadcast manual antar role
- read state menggunakan `NotificationRecipient` per user
- sender dikecualikan dari daftar penerima

## Setup backend
1. salin `backend/.env.example` menjadi `backend/.env`
2. isi `DATABASE_URL`, `JWT_SECRET`, dan jika ingin push background isi juga:
   - `WEB_PUSH_PUBLIC_KEY`
   - `WEB_PUSH_PRIVATE_KEY`
   - `WEB_PUSH_SUBJECT`
3. install dependency:
   - `npm install`
4. generate Prisma client:
   - `npx prisma generate`
5. jalankan migrasi:
   - `npx prisma migrate deploy`
6. jalankan backend:
   - `npm run start:dev`

## Setup frontend
1. salin `frontend/.env.example` menjadi `frontend/.env`
2. pastikan `VITE_API_BASE_URL` mengarah ke backend Anda
3. install dependency:
   - `npm install`
4. jalankan frontend:
   - `npm run dev`

## Catatan database
Jika Anda memakai database lokal yang sebelumnya sudah sempat terkena patch notifikasi lama yang rusak, lebih aman memakai database baru atau reset database dev sebelum menjalankan migrasi bersih ini.

## Generate web push key
Di backend tersedia script:
- `node scripts/generate-web-push-keys.mjs`

Salin hasilnya ke `.env` backend.
