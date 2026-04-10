import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { sign, verify, type JwtPayload, type SignOptions } from 'jsonwebtoken';

export type AuthUser = {
  id_user: number;
  email: string;
  role: Role;
};

function isAuthUserPayload(
  payload: string | JwtPayload,
): payload is JwtPayload & AuthUser {
  return (
    typeof payload !== 'string' &&
    typeof payload.id_user === 'number' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string'
  );
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required.');
  }
  return secret;
}

export function signToken(user: AuthUser): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    '8h') as SignOptions['expiresIn'];
  return sign(user, getJwtSecret(), {
    expiresIn,
    issuer: 'jaecoo-backend',
    audience: 'jaecoo-frontend',
  });
}

export function parseAccessToken(raw: string): AuthUser {
  try {
    const payload = verify(raw, getJwtSecret(), {
      issuer: 'jaecoo-backend',
      audience: 'jaecoo-frontend',
    });

    if (!isAuthUserPayload(payload)) {
      throw new Error('invalid payload');
    }

    return {
      id_user: payload.id_user,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    throw new UnauthorizedException('Token tidak valid atau kedaluwarsa.');
  }
}

export function parseToken(header?: string): AuthUser {
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token tidak ditemukan.');
  }

  return parseAccessToken(header.slice(7));
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Format tanggal tidak valid.');
  }
  return date;
}
