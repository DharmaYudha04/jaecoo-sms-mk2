# Frontend Integration Checklist

This frontend is now aligned with the current backend Prisma schema.

## Backend enums used by the frontend

### Role
- `MEKANIK`
- `FRONTLINE`
- `MANAGER`
- `ADMIN`

### StatusServis
- `ANTRIAN`
- `DIKERJAKAN`
- `TEST_DRIVE`
- `SELESAI`
- `DIAMBIL`
- `TERKENDALA`

### WorkOrder.status
Current backend schema stores a string with default `OPEN`.
Known values used by the frontend:
- `OPEN`
- `IN_PROGRESS`
- `CLOSED`
- `CANCELLED`

### Prioritas Servis
- `NORMAL`
- `HIGH`
- `URGENT`

## Suggested integration order
1. `POST /auth/login`
2. `GET /auth/me`
3. `GET /customers`
4. `GET /vehicles`
5. `GET /work-orders`
6. `POST /work-orders`
7. `GET /services`
8. `GET /services/:id`
9. `PATCH /services/:id/status`
10. `GET /users`
11. `GET /schedules`
12. `GET /reports`

## Current frontend preparation
- Uses backend-aligned enum values internally.
- Uses display labels separately so UI wording can differ without changing enum values.
- Uses mapper functions to normalize backend payloads before rendering.
- Keeps demo auth optional through `VITE_ENABLE_DEMO_AUTH`.

## Important notes
- UI label `Frontdesk` maps to backend role `FRONTLINE`.
- UI label `PROSES SERVIS` maps to backend status `DIKERJAKAN`.
- UI label `SIAP TEST DRIVE` maps to backend status `TEST_DRIVE`.


## Stage 5 frontend readiness
- Centralized endpoint map lives in `src/services/endpoints.ts`.
- Backend/mock switching is controlled by `VITE_ENABLE_MOCK_FALLBACK`.
- Report and schedule form submissions now go through React Query hooks.
- Major list/detail pages now use a shared fallback helper so the switch to backend data can be turned off from env without editing pages.
