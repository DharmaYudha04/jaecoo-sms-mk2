-- Align database schema with current Prisma models without changing connection settings.
-- Safe for dev/testing databases that already applied the previous migrations.

-- Add missing enum values for StatusServis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StatusServis' AND e.enumlabel = 'TEST_DRIVE'
  ) THEN
    ALTER TYPE "StatusServis" ADD VALUE 'TEST_DRIVE';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StatusServis' AND e.enumlabel = 'TERKENDALA'
  ) THEN
    ALTER TYPE "StatusServis" ADD VALUE 'TERKENDALA';
  END IF;
END $$;

-- Create missing enums used by Prisma schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkOrderStatus') THEN
    CREATE TYPE "WorkOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PriorityLevel') THEN
    CREATE TYPE "PriorityLevel" AS ENUM ('NORMAL', 'HIGH', 'URGENT');
  END IF;
END $$;

-- Kendaraan additions
ALTER TABLE "Kendaraan"
  ADD COLUMN IF NOT EXISTS "warna" TEXT;

-- WorkOrder additions
ALTER TABLE "WorkOrder"
  ADD COLUMN IF NOT EXISTS "nomor_wo_pusat" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "created_by_user_id" INTEGER;

-- Convert WorkOrder.status from TEXT to enum
ALTER TABLE "WorkOrder"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "WorkOrder"
  ALTER COLUMN "status" TYPE "WorkOrderStatus"
  USING (
    CASE
      WHEN "status"::text = 'OPEN' THEN 'OPEN'::"WorkOrderStatus"
      WHEN "status"::text = 'IN_PROGRESS' THEN 'IN_PROGRESS'::"WorkOrderStatus"
      WHEN "status"::text = 'CLOSED' THEN 'CLOSED'::"WorkOrderStatus"
      WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'::"WorkOrderStatus"
      ELSE 'OPEN'::"WorkOrderStatus"
    END
  );

ALTER TABLE "WorkOrder"
  ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- Servis additions
ALTER TABLE "Servis"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Convert Servis.prioritas from TEXT to enum
ALTER TABLE "Servis"
  ALTER COLUMN "prioritas" DROP DEFAULT;

ALTER TABLE "Servis"
  ALTER COLUMN "prioritas" TYPE "PriorityLevel"
  USING (
    CASE
      WHEN "prioritas"::text = 'NORMAL' THEN 'NORMAL'::"PriorityLevel"
      WHEN "prioritas"::text = 'HIGH' THEN 'HIGH'::"PriorityLevel"
      WHEN "prioritas"::text = 'URGENT' THEN 'URGENT'::"PriorityLevel"
      ELSE 'NORMAL'::"PriorityLevel"
    END
  );

ALTER TABLE "Servis"
  ALTER COLUMN "prioritas" SET DEFAULT 'NORMAL';

-- Recreate foreign keys so DB behavior matches Prisma schema
ALTER TABLE "Kendaraan" DROP CONSTRAINT IF EXISTS "Kendaraan_nik_pemilik_fkey";
ALTER TABLE "Kendaraan"
  ADD CONSTRAINT "Kendaraan_nik_pemilik_fkey"
  FOREIGN KEY ("nik_pemilik") REFERENCES "Pemilik"("nik")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_no_rangka_fkey";
ALTER TABLE "WorkOrder"
  ADD CONSTRAINT "WorkOrder_no_rangka_fkey"
  FOREIGN KEY ("no_rangka") REFERENCES "Kendaraan"("no_rangka")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_created_by_user_id_fkey";
ALTER TABLE "WorkOrder"
  ADD CONSTRAINT "WorkOrder_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id_user")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Servis" DROP CONSTRAINT IF EXISTS "Servis_id_wo_fkey";
ALTER TABLE "Servis"
  ADD CONSTRAINT "Servis_id_wo_fkey"
  FOREIGN KEY ("id_wo") REFERENCES "WorkOrder"("id_wo")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DetailServis" DROP CONSTRAINT IF EXISTS "DetailServis_id_servis_fkey";
ALTER TABLE "DetailServis"
  ADD CONSTRAINT "DetailServis_id_servis_fkey"
  FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CatatanMekanik" DROP CONSTRAINT IF EXISTS "CatatanMekanik_id_servis_fkey";
ALTER TABLE "CatatanMekanik"
  ADD CONSTRAINT "CatatanMekanik_id_servis_fkey"
  FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RiwayatServis" DROP CONSTRAINT IF EXISTS "RiwayatServis_id_servis_fkey";
ALTER TABLE "RiwayatServis"
  ADD CONSTRAINT "RiwayatServis_id_servis_fkey"
  FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis")
  ON DELETE CASCADE ON UPDATE CASCADE;
