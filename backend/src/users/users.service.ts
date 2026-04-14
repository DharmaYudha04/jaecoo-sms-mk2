import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

function inferNameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  const normalized = local.replace(/[._-]+/g, ' ').trim();
  if (!normalized) return null;
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function withDisplayName<T extends { fullName: string | null; email: string }>(user: T): T {
  return { ...user, fullName: user.fullName?.trim() || inferNameFromEmail(user.email) } as T;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { id_user: 'asc' },
      select: { id_user: true, fullName: true, email: true, role: true, isActive: true },
    });
    return users.map((item) => withDisplayName(item));
  }

  async detail(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: id },
      select: { id_user: true, fullName: true, email: true, role: true, isActive: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return withDisplayName(user);
  }

  async create(body: {
    fullName?: string;
    email: string;
    password: string;
    role: Role;
    isActive?: boolean;
  }) {
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();
    const fullName = body.fullName?.trim() || null;

    if (password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter.');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const passwordHash = hashSync(password, rounds);

    try {
      const created = await this.prisma.user.create({
        data: {
          fullName,
          email,
          password: passwordHash,
          role: body.role,
          isActive: body.isActive ?? true,
        },
        select: { id_user: true, fullName: true, email: true, role: true, isActive: true },
      });
      return withDisplayName(created);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        throw new ConflictException('Email sudah terdaftar.');
      }
      throw error;
    }
  }

  async update(id: number, body: { fullName?: string; email?: string; role?: Role; isActive?: boolean; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id_user: id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const data: { fullName?: string | null; email?: string; role?: Role; isActive?: boolean; password?: string } = {};


    if (body.fullName !== undefined) data.fullName = body.fullName.trim() || null;

    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!email) {
        throw new BadRequestException('Email wajib diisi.');
      }
      const existing = await this.prisma.user.findFirst({
        where: { email, NOT: { id_user: id } },
        select: { id_user: true },
      });
      if (existing) {
        throw new ConflictException('Email sudah terdaftar.');
      }
      data.email = email;
    }

    if (body.role !== undefined) data.role = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.password !== undefined) {
      const password = body.password.trim();
      if (password.length < 8) {
        throw new BadRequestException('Password minimal 8 karakter.');
      }
      const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
      data.password = hashSync(password, rounds);
    }

    const updated = await this.prisma.user.update({
      where: { id_user: id },
      data,
      select: { id_user: true, fullName: true, email: true, role: true, isActive: true },
    });
    return withDisplayName(updated);
  }

  async delete(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: {
        createdWorkOrders: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check if user has active work orders
    const activeWorkOrders = user.createdWorkOrders.filter(
      (wo) => wo.status === 'OPEN' || wo.status === 'IN_PROGRESS',
    );
    if (activeWorkOrders.length > 0) {
      throw new BadRequestException(
        'User tidak dapat dihapus karena memiliki work order aktif',
      );
    }

    // Soft delete by setting isActive to false instead of hard delete
    const updated = await this.prisma.user.update({
      where: { id_user: id },
      data: { isActive: false },
      select: { id_user: true, fullName: true, email: true, role: true, isActive: true },
    });
    return withDisplayName(updated);
  }
}
