import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const VALID_ROLES: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns mechanic assignments derived from pending / in-progress services.
   * Optionally filtered by user role.
   */
  async getMechanics(role?: string) {
    if (role !== undefined && !VALID_ROLES.includes(role as Role)) {
      throw new BadRequestException(`Role tidak valid. Gunakan salah satu dari: ${VALID_ROLES.join(', ')}.`);
    }

    const users = await this.prisma.user.findMany({
      where: { isActive: true, ...(role ? { role: role as Role } : {}) },
      select: {
        id_user: true,
        email: true,
        role: true,
      },
      orderBy: { id_user: 'asc' },
    });

    return users;
  }

  /**
   * Returns services for a specific date (YYYY-MM-DD).
   */
  async getByDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Format tanggal tidak valid. Gunakan YYYY-MM-DD.');
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Tanggal tidak valid.');
    }

    return this.prisma.servis.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        workOrder: { select: { id_wo: true, no_rangka: true, nomor_wo_pusat: true } },
        detail_servis: true,
      },
      orderBy: { prioritas: 'asc' },
    });
  }

  /**
   * Returns upcoming services within the next N days (default 7).
   */
  async getUpcoming(daysAhead: number = 7) {
    const days = Math.max(1, Math.min(Number.isFinite(daysAhead) ? daysAhead : 7, 90));
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + days);

    return this.prisma.servis.findMany({
      where: {
        status: { notIn: ['SELESAI', 'DIAMBIL'] },
        estimasiSelesai: { gte: now, lte: future },
      },
      include: {
        workOrder: { select: { id_wo: true, no_rangka: true, nomor_wo_pusat: true, waktuMasuk: true } },
      },
      orderBy: [{ prioritas: 'asc' }, { estimasiSelesai: 'asc' }],
    });
  }
}
