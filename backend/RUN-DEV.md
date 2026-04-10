# Run Dev Guide

## Prasyarat
- Node.js terpasang
- PostgreSQL aktif
- file `.env` sudah terisi
- `DATABASE_URL` mengarah ke database yang benar

## Jalur tercepat
```bash
npm install
npx prisma generate
npm run build
npm run start:dev
```

## Jalur lengkap
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
npm run start:dev
```

## Verifikasi cepat
```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/health
```

## Bila gagal di migrate
- cek username/password PostgreSQL
- cek port database
- cek nama database
- jangan ubah migration dulu sebelum koneksi database valid
