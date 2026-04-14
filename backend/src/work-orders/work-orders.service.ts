import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PriorityLevel, StatusServis, WashRequestStatus, WorkOrderStatus } from '@prisma/client';
import { parseOptionalDate, parseToken } from '../common/auth';
import { PrismaService } from '../prisma/prisma.service';

const workOrderInclude = {
  kendaraan: { include: { pemilik: true } },
  servis: {
    include: {
      detail_servis: { include: { jenis_servis: true } },
      catatan: true,
      riwayat: true,
    },
  },
  createdBy: {
    select: { id_user: true, email: true, role: true, isActive: true },
  },
} as const;

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.workOrder.findMany({
      include: workOrderInclude,
      orderBy: { waktuMasuk: 'desc' },
    });
  }

  async detail(id: number) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id_wo: id },
      include: workOrderInclude,
    });

    if (!workOrder) {
      throw new NotFoundException('Work order tidak ditemukan');
    }

    return workOrder;
  }

  async update(
    id: number,
    body: {
      status?: WorkOrderStatus;
      nomor_wo_pusat?: string;
      waktuMasuk?: string;
      no_rangka?: string;
      customer?: {
        nik: string;
        nama: string;
        no_hp?: string | null;
        alamat?: string | null;
      };
      vehicle?: {
        no_rangka: string;
        plat_nomor: string;
        jenis_mobil?: string | null;
        warna?: string | null;
        tahun?: number | null;
        kilometer?: number;
        nik_pemilik: string;
      };
      servis?: {
        keluhan?: string;
        estimasiSelesai?: string | null;
        status?: StatusServis;
        prioritas?: PriorityLevel;
        statusCuciMobil?: WashRequestStatus;
        catatanCuciMobil?: string | null;
      };
      detail_servis?: string[];
    },
  ) {
    const existing = await this.prisma.workOrder.findUnique({
      where: { id_wo: id },
      include: { servis: true },
    });

    if (!existing) {
      throw new NotFoundException('Work order tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      if (body.customer) {
        await tx.pemilik.upsert({
          where: { nik: body.customer.nik },
          update: {
            nama: body.customer.nama,
            no_hp: body.customer.no_hp ?? null,
            alamat: body.customer.alamat ?? null,
          },
          create: {
            nik: body.customer.nik,
            nama: body.customer.nama,
            no_hp: body.customer.no_hp ?? null,
            alamat: body.customer.alamat ?? null,
          },
        });
      }

      if (body.vehicle) {
        await tx.kendaraan.upsert({
          where: { no_rangka: body.vehicle.no_rangka },
          update: {
            plat_nomor: body.vehicle.plat_nomor,
            jenis_mobil: body.vehicle.jenis_mobil ?? null,
            warna: body.vehicle.warna ?? null,
            tahun: body.vehicle.tahun ?? null,
            kilometer: body.vehicle.kilometer ?? 0,
            nik_pemilik: body.vehicle.nik_pemilik,
          },
          create: {
            no_rangka: body.vehicle.no_rangka,
            plat_nomor: body.vehicle.plat_nomor,
            jenis_mobil: body.vehicle.jenis_mobil ?? null,
            warna: body.vehicle.warna ?? null,
            tahun: body.vehicle.tahun ?? null,
            kilometer: body.vehicle.kilometer ?? 0,
            nik_pemilik: body.vehicle.nik_pemilik,
          },
        });
      }

      await tx.workOrder.update({
        where: { id_wo: id },
        data: {
          status: body.status ?? existing.status,
          nomor_wo_pusat: body.nomor_wo_pusat ?? existing.nomor_wo_pusat,
          waktuMasuk: parseOptionalDate(body.waktuMasuk) ?? existing.waktuMasuk,
          no_rangka: body.no_rangka ?? body.vehicle?.no_rangka ?? existing.no_rangka,
        },
      });

      const existingService = existing.servis[0];
      if (existingService) {
        await tx.servis.update({
          where: { id_servis: existingService.id_servis },
          data: {
            keluhan: body.servis?.keluhan ?? existingService.keluhan,
            estimasiSelesai:
              body.servis?.estimasiSelesai !== undefined
                ? parseOptionalDate(body.servis.estimasiSelesai) ?? null
                : existingService.estimasiSelesai,
            status: body.servis?.status ?? existingService.status,
            prioritas: body.servis?.prioritas ?? existingService.prioritas,
            statusCuciMobil: body.servis?.statusCuciMobil ?? existingService.statusCuciMobil,
            catatanCuciMobil: body.servis?.catatanCuciMobil !== undefined ? body.servis.catatanCuciMobil?.trim() || null : existingService.catatanCuciMobil,
          },
        });

        if (body.detail_servis !== undefined) {
          await tx.detailServis.deleteMany({
            where: { id_servis: existingService.id_servis },
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
                id_servis: existingService.id_servis,
                id_jenis_servis: jenisServis.id_jenis_servis,
                keterangan: cleanItem,
              },
            });
          }
        }
      }

      return tx.workOrder.findUnique({
        where: { id_wo: id },
        include: workOrderInclude,
      });
    });
  }

  async create(
    body: {
      no_rangka: string;
      waktuMasuk?: string;
      status?: WorkOrderStatus;
      nomor_wo_pusat?: string;
      customer?: {
        nik: string;
        nama: string;
        no_hp?: string | null;
        alamat?: string | null;
      };
      vehicle?: {
        no_rangka: string;
        plat_nomor: string;
        jenis_mobil?: string | null;
        warna?: string | null;
        tahun?: number | null;
        kilometer?: number;
        nik_pemilik: string;
      };
      servis: {
        keluhan?: string;
        estimasiSelesai?: string | null;
        status?: StatusServis;
        prioritas?: PriorityLevel;
        statusCuciMobil?: WashRequestStatus;
        catatanCuciMobil?: string | null;
      };
      detail_servis?: string[];
    },
    authorization?: string,
  ) {
    if (!body.no_rangka || !body.nomor_wo_pusat || !body.customer || !body.vehicle) {
      throw new BadRequestException('Payload work order tidak lengkap.');
    }

    const authUser = authorization ? parseToken(authorization) : null;

    return this.prisma.$transaction(async (tx) => {
      await tx.pemilik.upsert({
        where: { nik: body.customer!.nik },
        update: {
          nama: body.customer!.nama,
          no_hp: body.customer!.no_hp ?? null,
          alamat: body.customer!.alamat ?? null,
        },
        create: {
          nik: body.customer!.nik,
          nama: body.customer!.nama,
          no_hp: body.customer!.no_hp ?? null,
          alamat: body.customer!.alamat ?? null,
        },
      });

      await tx.kendaraan.upsert({
        where: { no_rangka: body.vehicle!.no_rangka },
        update: {
          plat_nomor: body.vehicle!.plat_nomor,
          jenis_mobil: body.vehicle!.jenis_mobil ?? null,
          warna: body.vehicle!.warna ?? null,
          tahun: body.vehicle!.tahun ?? null,
          kilometer: body.vehicle!.kilometer ?? 0,
          nik_pemilik: body.vehicle!.nik_pemilik,
        },
        create: {
          no_rangka: body.vehicle!.no_rangka,
          plat_nomor: body.vehicle!.plat_nomor,
          jenis_mobil: body.vehicle!.jenis_mobil ?? null,
          warna: body.vehicle!.warna ?? null,
          tahun: body.vehicle!.tahun ?? null,
          kilometer: body.vehicle!.kilometer ?? 0,
          nik_pemilik: body.vehicle!.nik_pemilik,
        },
      });

      const workOrder = await tx.workOrder.create({
        data: {
          no_rangka: body.no_rangka,
          nomor_wo_pusat: body.nomor_wo_pusat ?? null,
          waktuMasuk: parseOptionalDate(body.waktuMasuk) ?? new Date(),
          status: body.status ?? 'OPEN',
          created_by_user_id: authUser?.id_user,
        },
      });

      const service = await tx.servis.create({
        data: {
          id_wo: workOrder.id_wo,
          keluhan: body.servis.keluhan?.trim() || '',
          estimasiSelesai: parseOptionalDate(body.servis.estimasiSelesai) ?? null,
          status: body.servis.status ?? 'ANTRIAN',
          prioritas: body.servis.prioritas ?? 'NORMAL',
          statusCuciMobil: body.servis.statusCuciMobil ?? 'TIDAK_PERLU',
          catatanCuciMobil: body.servis.catatanCuciMobil?.trim() || null,
        },
      });

      await tx.riwayatServis.create({
        data: {
          id_servis: service.id_servis,
          status: service.status,
        },
      });

      for (const item of body.detail_servis ?? []) {
        const cleanItem = item.trim();
        if (!cleanItem) continue;
        const jenisServis = await tx.jenisServis.upsert({
          where: { nama_servis: cleanItem },
          update: {},
          create: { nama_servis: cleanItem },
        });

        await tx.detailServis.create({
          data: {
            id_servis: service.id_servis,
            id_jenis_servis: jenisServis.id_jenis_servis,
            keterangan: cleanItem,
          },
        });
      }

      return tx.workOrder.findUnique({
        where: { id_wo: workOrder.id_wo },
        include: workOrderInclude,
      });
    });
  }

  async delete(id: number) {
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
      throw new BadRequestException('ID work order tidak valid');
    }

    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id_wo: id },
      include: {
        servis: {
          include: {
            detail_servis: true,
            catatan: true,
            riwayat: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order tidak ditemukan');
    }

    if (workOrder.status !== 'OPEN' && workOrder.status !== 'CANCELLED') {
      throw new BadRequestException('Work order tidak dapat dihapus karena sudah dalam proses atau selesai');
    }

    return this.prisma.$transaction(async (tx) => {
      const serviceIds = workOrder.servis.map((s) => s.id_servis);

      if (serviceIds.length > 0) {
        await tx.detailServis.deleteMany({ where: { id_servis: { in: serviceIds } } });
        await tx.catatanMekanik.deleteMany({ where: { id_servis: { in: serviceIds } } });
        await tx.riwayatServis.deleteMany({ where: { id_servis: { in: serviceIds } } });
        await tx.servis.deleteMany({ where: { id_wo: id } });
      }

      await tx.workOrder.delete({ where: { id_wo: id } });

      return { success: true, message: 'Work order berhasil dihapus' };
    });
  }
}
