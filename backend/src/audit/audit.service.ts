import { Injectable } from '@nestjs/common';
import { AuditLogStatus, Prisma, Role } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type AuditActor = {
  id_user?: number | null;
  email?: string | null;
  role?: Role | null;
};

export type CreateAuditLogInput = {
  actor?: AuditActor | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | number | null;
  entityLabel?: string | null;
  status?: AuditLogStatus;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: Request;
};

function extractIpAddress(req?: Request): string | null {
  if (!req) return null;

  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]
      : null;

  return forwardedIp?.trim() || req.ip || req.socket?.remoteAddress || null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorUserId: input.actor?.id_user ?? null,
          actorEmail: input.actor?.email ?? null,
          actorRole: input.actor?.role ?? null,
          action: input.action,
          module: input.module,
          entityType: input.entityType ?? null,
          entityId: input.entityId != null ? String(input.entityId) : null,
          entityLabel: input.entityLabel ?? null,
          status: input.status ?? AuditLogStatus.SUCCESS,
          message: input.message ?? null,
          metadata:
            input.metadata == null
              ? undefined
              : (input.metadata as Prisma.InputJsonValue),
          ipAddress: extractIpAddress(input.req),
          userAgent: input.req?.headers['user-agent'] ?? null,
        },
      });
    } catch (error) {
      console.error('[audit] failed to persist audit log', error);
    }
  }

  list(params: {
    actorEmail?: string;
    actorRole?: Role;
    module?: string;
    action?: string;
    status?: AuditLogStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 100, 1), 250);
    const search = params.search?.trim();
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : null;
    const dateTo = params.dateTo
      ? new Date(`${params.dateTo}T23:59:59.999Z`)
      : null;

    return this.prisma.auditLog.findMany({
      where: {
        actorEmail: params.actorEmail
          ? {
              contains: params.actorEmail.trim().toLowerCase(),
              mode: 'insensitive',
            }
          : undefined,
        actorRole: params.actorRole,
        module: params.module || undefined,
        action: params.action || undefined,
        status: params.status,
        createdAt:
          dateFrom || dateTo
            ? {
                gte: dateFrom ?? undefined,
                lte: dateTo ?? undefined,
              }
            : undefined,
        OR: search
          ? [
              { actorEmail: { contains: search, mode: 'insensitive' } },
              { action: { contains: search, mode: 'insensitive' } },
              { module: { contains: search, mode: 'insensitive' } },
              { entityLabel: { contains: search, mode: 'insensitive' } },
              { entityId: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }


  async clearAll() {
    const result = await this.prisma.auditLog.deleteMany();
    return result.count;
  }
}
