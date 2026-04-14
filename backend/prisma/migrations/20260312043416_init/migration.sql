-- CreateEnum
CREATE TYPE "StatusServis" AS ENUM ('ANTRIAN', 'DIKERJAKAN', 'SELESAI', 'DIAMBIL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEKANIK', 'FRONTLINE', 'MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Pemilik" (
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "no_hp" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pemilik_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "Kendaraan" (
    "no_rangka" TEXT NOT NULL,
    "plat_nomor" TEXT NOT NULL,
    "jenis_mobil" TEXT,
    "tahun" INTEGER,
    "kilometer" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nik_pemilik" TEXT NOT NULL,

    CONSTRAINT "Kendaraan_pkey" PRIMARY KEY ("no_rangka")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id_wo" SERIAL NOT NULL,
    "waktuMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "no_rangka" TEXT NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id_wo")
);

-- CreateTable
CREATE TABLE "Servis" (
    "id_servis" SERIAL NOT NULL,
    "keluhan" TEXT NOT NULL,
    "estimasiSelesai" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "status" "StatusServis" NOT NULL DEFAULT 'ANTRIAN',
    "prioritas" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_wo" INTEGER NOT NULL,

    CONSTRAINT "Servis_pkey" PRIMARY KEY ("id_servis")
);

-- CreateTable
CREATE TABLE "JenisServis" (
    "id_jenis_servis" SERIAL NOT NULL,
    "nama_servis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JenisServis_pkey" PRIMARY KEY ("id_jenis_servis")
);

-- CreateTable
CREATE TABLE "DetailServis" (
    "id_detail" SERIAL NOT NULL,
    "id_servis" INTEGER NOT NULL,
    "id_jenis_servis" INTEGER NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "DetailServis_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "CatatanMekanik" (
    "id_catatan" SERIAL NOT NULL,
    "id_servis" INTEGER NOT NULL,
    "catatan" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatatanMekanik_pkey" PRIMARY KEY ("id_catatan")
);

-- CreateTable
CREATE TABLE "RiwayatServis" (
    "id_riwayat" SERIAL NOT NULL,
    "id_servis" INTEGER NOT NULL,
    "status" "StatusServis" NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatServis_pkey" PRIMARY KEY ("id_riwayat")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kendaraan_plat_nomor_key" ON "Kendaraan"("plat_nomor");

-- AddForeignKey
ALTER TABLE "Kendaraan" ADD CONSTRAINT "Kendaraan_nik_pemilik_fkey" FOREIGN KEY ("nik_pemilik") REFERENCES "Pemilik"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_no_rangka_fkey" FOREIGN KEY ("no_rangka") REFERENCES "Kendaraan"("no_rangka") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servis" ADD CONSTRAINT "Servis_id_wo_fkey" FOREIGN KEY ("id_wo") REFERENCES "WorkOrder"("id_wo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailServis" ADD CONSTRAINT "DetailServis_id_servis_fkey" FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailServis" ADD CONSTRAINT "DetailServis_id_jenis_servis_fkey" FOREIGN KEY ("id_jenis_servis") REFERENCES "JenisServis"("id_jenis_servis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatatanMekanik" ADD CONSTRAINT "CatatanMekanik_id_servis_fkey" FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatServis" ADD CONSTRAINT "RiwayatServis_id_servis_fkey" FOREIGN KEY ("id_servis") REFERENCES "Servis"("id_servis") ON DELETE RESTRICT ON UPDATE CASCADE;
