# Backend - Jaecoo Service System

Backend ini menggunakan **NestJS + Prisma + PostgreSQL** dan melayani API utama untuk modul:
- auth
- customers
- vehicles
- users
- work orders
- services
- reports
- schedules

Base URL API:
```text
http://localhost:3000/api
```

## Environment

Salin file environment lalu sesuaikan nilainya dengan PostgreSQL lokal kamu:

```bash
cp .env.example .env
```

Contoh variabel penting:
- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `FRONTEND_URL`

## Urutan run-dev yang benar

### Opsi standar
```bash
npm install
npx prisma generate
npm run build
npm run start:dev
```

### Opsi lengkap bila database baru / perlu sinkronisasi schema
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
npm run start:dev
```

### Opsi dev-reset (hanya untuk database lokal yang aman dihapus)
```bash
npx prisma migrate reset
npm run db:seed
npm run start:dev
```

## Health check

Setelah server hidup, cek:

```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/health
```

## Endpoint inti

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/customers`
- `GET/POST/PATCH/DELETE /api/vehicles`
- `GET/POST/PATCH/DELETE /api/users`
- `GET/POST/PATCH/DELETE /api/work-orders`
- `GET/POST/DELETE /api/services`
- `PATCH /api/services/:id/status`
- `POST /api/services/:id/notes`
- `GET /api/reports/services`
- `GET /api/reports/work-orders`
- `GET /api/reports/daily-metrics`
- `POST /api/reports/export`
- `GET /api/schedules/mechanics`
- `GET /api/schedules/by-date`
- `GET /api/schedules/upcoming`
- `POST /api/schedules`

## Catatan

- Project ini **sudah bisa build dan start** jika Prisma client dan koneksi PostgreSQL valid.
- Jika `prisma migrate deploy` gagal, cek dulu kredensial PostgreSQL di `DATABASE_URL`.
- Jangan commit file `.env` yang berisi kredensial asli.
- Untuk review teknis, file config Prisma utama yang dipakai adalah:
  - `prisma.config.ts`
