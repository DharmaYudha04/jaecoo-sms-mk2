import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compareSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { parseToken, signToken } from '../common/auth';

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

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException('Email atau password tidak valid.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rawPassword = password.trim();
    if (!normalizedEmail || !rawPassword) {
      throw new UnauthorizedException('Email atau password tidak valid.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email atau password tidak valid.');
    }

    let validPassword = false;
    try {
      validPassword = compareSync(rawPassword, user.password);
    } catch {
      // Guard against invalid password hash values stored in DB.
      throw new UnauthorizedException('Email atau password tidak valid.');
    }
    if (!validPassword) {
      throw new UnauthorizedException('Email atau password tidak valid.');
    }

    const safeUser = {
      id_user: user.id_user,
      email: user.email,
      fullName: user.fullName?.trim() || inferNameFromEmail(user.email),
      role: user.role,
      isActive: user.isActive,
    };

    return {
      accessToken: signToken(safeUser),
      user: safeUser,
    };
  }

  async me(authorization?: string) {
    const session = parseToken(authorization);
    const user = await this.prisma.user.findUnique({
      where: { id_user: session.id_user },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sesi tidak aktif.');
    }
    return {
      id_user: user.id_user,
      email: user.email,
      fullName: user.fullName?.trim() || inferNameFromEmail(user.email),
      role: user.role,
      isActive: user.isActive,
    };
  }
}
