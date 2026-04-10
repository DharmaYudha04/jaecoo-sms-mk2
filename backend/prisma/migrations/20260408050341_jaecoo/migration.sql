/*
  Warnings:

  - A unique constraint covering the columns `[nama_servis]` on the table `JenisServis` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Servis" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "JenisServis_nama_servis_key" ON "JenisServis"("nama_servis");
