import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.pemilik.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(nik: string) {
    const customer = await this.prisma.pemilik.findUnique({ where: { nik } });
    if (!customer) throw new NotFoundException('Pelanggan tidak ditemukan');
    return customer;
  }

  async create(body: {
    nik: string;
    nama: string;
    no_hp?: string | null;
    alamat?: string | null;
  }) {
    return this.prisma.pemilik.upsert({
      where: { nik: body.nik },
      update: {
        nama: body.nama,
        no_hp: body.no_hp ?? null,
        alamat: body.alamat ?? null,
      },
      create: {
        nik: body.nik,
        nama: body.nama,
        no_hp: body.no_hp ?? null,
        alamat: body.alamat ?? null,
      },
    });
  }

  async update(
    nik: string,
    body: { nama?: string; no_hp?: string | null; alamat?: string | null },
  ) {
    const customer = await this.prisma.pemilik.findUnique({ where: { nik } });
    if (!customer) throw new NotFoundException('Pelanggan tidak ditemukan');

    return this.prisma.pemilik.update({
      where: { nik },
      data: {
        nama: body.nama ?? customer.nama,
        no_hp: body.no_hp !== undefined ? (body.no_hp ?? null) : customer.no_hp,
        alamat: body.alamat !== undefined ? (body.alamat ?? null) : customer.alamat,
      },
    });
  }

  async delete(nik: string) {
    const customer = await this.prisma.pemilik.findUnique({
      where: { nik },
      include: {
        kendaraan: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    // Check if customer has vehicles
    if (customer.kendaraan.length > 0) {
      throw new BadRequestException(
        'Pelanggan tidak dapat dihapus karena masih memiliki kendaraan terdaftar',
      );
    }

    return this.prisma.pemilik.delete({ where: { nik } });
  }
}
