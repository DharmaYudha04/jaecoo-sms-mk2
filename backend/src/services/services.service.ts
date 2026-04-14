import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusServis, WashRequestStatus } from '@prisma/client';
import { parseOptionalDate } from '../common/auth';
import { PrismaService } from '../prisma/prisma.service';

const serviceInclude = {
  detail_servis: { include: { jenis_servis: true } },
  catatan: true,
  riwayat: true,
  workOrder: {
    include: {
      kendaraan: { include: { pemilik: true } },
      servis: {
        include: {
          detail_servis: { include: { jenis_servis: true } },
          catatan: true,
          riwayat: true,
        },
      },
    },
  },
} as const;

const MAX_INT32 = 2_147_483_647;

function assertValidServiceId(id: number) {
  if (!Number.isInteger(id) || id <= 0 || id > MAX_INT32) {
    throw new BadRequestException('ID servis tidak valid');
  }
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.servis.findMany({
      include: serviceInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(serviceId: number) {
    assertValidServiceId(serviceId);
    const service = await this.prisma.servis.findUnique({
      where: { id_servis: serviceId },
      include: serviceInclude,
    });
    if (!service) throw new NotFoundException('Servis tidak ditemukan.');
    return service;
  }

  async create(body: {
    id_wo: number;
    keluhan: string;
    estimasiSelesai?: string | null;
    status?: StatusServis;
    prioritas?: 'NORMAL' | 'HIGH' | 'URGENT';
    statusCuciMobil?: WashRequestStatus;
    catatanCuciMobil?: string | null;
  }) {
    const service = await this.prisma.servis.create({
      data: {
        id_wo: body.id_wo,
        keluhan: body.keluhan,
        estimasiSelesai: parseOptionalDate(body.estimasiSelesai) ?? null,
        status: body.status ?? 'ANTRIAN',
        prioritas: body.prioritas ?? 'NORMAL',
        statusCuciMobil: body.statusCuciMobil ?? 'TIDAK_PERLU',
        catatanCuciMobil: body.catatanCuciMobil?.trim() || null,
      },
    });

    await this.prisma.riwayatServis.create({
      data: { id_servis: service.id_servis, status: service.status },
    });
    return this.detail(service.id_servis);
  }

  async update(serviceId: number, body: {
    keluhan?: string;
    estimasiSelesai?: string | null;
    status?: StatusServis;
    prioritas?: 'NORMAL' | 'HIGH' | 'URGENT';
    statusCuciMobil?: WashRequestStatus;
    catatanCuciMobil?: string | null;
    detail_servis?: string[];
  }) {
    assertValidServiceId(serviceId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.servis.findUnique({
        where: { id_servis: serviceId },
      });

      if (!existing) {
        throw new NotFoundException('Servis tidak ditemukan.');
      }

      const nextStatus = body.status ?? existing.status;
      const nextWashStatus = body.statusCuciMobil ?? existing.statusCuciMobil;
      if (nextStatus === 'DIAMBIL' && nextWashStatus === 'MENUNGGU') {
        throw new BadRequestException('Mobil tidak dapat ditandai diambil selama permintaan cuci mobil masih menunggu.');
      }

      await tx.servis.update({
        where: { id_servis: serviceId },
        data: {
          keluhan: body.keluhan?.trim() ?? existing.keluhan,
          estimasiSelesai:
            body.estimasiSelesai !== undefined
              ? parseOptionalDate(body.estimasiSelesai) ?? null
              : existing.estimasiSelesai,
          status: body.status ?? existing.status,
          prioritas: body.prioritas ?? existing.prioritas,
          statusCuciMobil: nextWashStatus,
          catatanCuciMobil: body.catatanCuciMobil !== undefined ? body.catatanCuciMobil?.trim() || null : existing.catatanCuciMobil,
          tanggalSelesai:
            body.status !== undefined
              ? body.status === 'SELESAI' || body.status === 'DIAMBIL'
                ? existing.tanggalSelesai ?? new Date()
                : null
              : existing.tanggalSelesai,
        },
      });

      if (body.status && body.status !== existing.status) {
        await tx.riwayatServis.create({
          data: { id_servis: serviceId, status: body.status },
        });
      }

      if (body.detail_servis !== undefined) {
        await tx.detailServis.deleteMany({
          where: { id_servis: serviceId },
        });

        for (const item of body.detail_servis) {
          const cleanItem = item.trim();
          if (!cleanItem) continue;

          const jenisServis = await tx.jenisServis.upsert({
            where: { nama_servis: cleanItem },
            update: {},
            create: { nama_servis: cleanItem },
          });

          await tx.detailServis.create({
            data: {
              id_servis: serviceId,
              id_jenis_servis: jenisServis.id_jenis_servis,
              keterangan: cleanItem,
            },
          });
        }
      }

      const updated = await tx.servis.findUnique({
        where: { id_servis: serviceId },
        include: serviceInclude,
      });

      if (!updated) {
        throw new NotFoundException('Servis tidak ditemukan.');
      }

      return updated;
    });
  }

  async updateStatus(serviceId: number, body: { status: StatusServis; note?: string }) {
    assertValidServiceId(serviceId);
    const existing = await this.prisma.servis.findUnique({
      where: { id_servis: serviceId },
    });
    if (!existing) throw new NotFoundException('Servis tidak ditemukan.');

    if (body.status === 'DIAMBIL' && existing.statusCuciMobil === 'MENUNGGU') {
      throw new BadRequestException('Mobil tidak dapat ditandai diambil selama permintaan cuci mobil masih menunggu.');
    }

    await this.prisma.servis.update({
      where: { id_servis: serviceId },
      data: {
        status: body.status,
        tanggalSelesai:
          body.status === 'SELESAI' || body.status === 'DIAMBIL'
            ? new Date()
            : existing.tanggalSelesai,
      },
    });

    await this.prisma.riwayatServis.create({
      data: { id_servis: serviceId, status: body.status },
    });

    if (body.note?.trim()) {
      await this.prisma.catatanMekanik.create({
        data: { id_servis: serviceId, catatan: body.note.trim() },
      });
    }

    return this.detail(serviceId);
  }

  async addNote(serviceId: number, body: { catatan: string }) {
    assertValidServiceId(serviceId);
    await this.detail(serviceId);
    await this.prisma.catatanMekanik.create({
      data: { id_servis: serviceId, catatan: body.catatan },
    });
    return { success: true };
  }

  async delete(serviceId: number) {
    assertValidServiceId(serviceId);
    return this.prisma.$transaction(async (tx) => {
      const service = await tx.servis.findUnique({
        where: { id_servis: serviceId },
      });

      if (!service) {
        throw new NotFoundException('Servis tidak ditemukan');
      }

      await tx.catatanMekanik.deleteMany({ where: { id_servis: serviceId } });
      await tx.riwayatServis.deleteMany({ where: { id_servis: serviceId } });
      await tx.detailServis.deleteMany({ where: { id_servis: serviceId } });
      await tx.servis.delete({ where: { id_servis: serviceId } });

      return { success: true, message: 'Servis berhasil dihapus' };
    });
  }
}
