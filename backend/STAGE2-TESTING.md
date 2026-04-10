# Stage 2 Testing Guide

## Goal
Validate that Prisma schema and SQL migrations are aligned on your laptop without changing DATABASE_URL.

## 1) Ensure PostgreSQL is running
Your `.env` should still point to the same database/port you already use.

## 2) From backend folder
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:dev
```

## 3) Verify health endpoints
In another terminal:
```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/health
```

## 4) Optional: seed sample data
```bash
npm run db:seed
```

## 5) Spot-check key modules
- Login: POST /api/auth/login
- Customers: GET /api/customers
- Vehicles: GET /api/vehicles
- Work Orders: GET /api/work-orders
- Services: GET /api/services
- Reports: GET /api/reports/daily-metrics
- Schedules: GET /api/schedules/upcoming

## 6) If migrate deploy says database drift or failed migration
Use dev-safe reset only if your local DB is disposable:
```bash
npx prisma migrate reset
npm run db:seed
npm run start:dev
```
