import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { AuditLogStatus, Role } from '@prisma/client';
import { parseToken } from '../common/auth';
import { AuditService } from './audit.service';

function parseRole(value?: string): Role | undefined {
  if (!value) return undefined;
  if (Object.values(Role).includes(value as Role)) {
    return value as Role;
  }
  throw new BadRequestException('Role audit tidak valid.');
}

function parseStatus(value?: string): AuditLogStatus | undefined {
  if (!value) return undefined;
  if (Object.values(AuditLogStatus).includes(value as AuditLogStatus)) {
    return value as AuditLogStatus;
  }
  throw new BadRequestException('Status audit tidak valid.');
}

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(
    @Headers('authorization') authorization?: string,
    @Query('actorEmail') actorEmail?: string,
    @Query('actorRole') actorRole?: string,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    const actor = parseToken(authorization);
    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      throw new ForbiddenException('Hanya admin dan manajer yang dapat melihat audit log.');
    }

    const parsedLimit = limit !== undefined ? Number(limit) : undefined;
    if (
      parsedLimit !== undefined
      && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)
    ) {
      throw new BadRequestException('Limit audit log tidak valid.');
    }

    return this.auditService.list({
      actorEmail,
      actorRole: parseRole(actorRole),
      module,
      action,
      status: parseStatus(status),
      search,
      dateFrom,
      dateTo,
      limit: parsedLimit,
    });
  }

  @Delete()
  async clear(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      throw new ForbiddenException('Hanya admin dan manajer yang dapat menghapus audit log.');
    }

    const deletedCount = await this.auditService.clearAll();
    return { success: true, deletedCount };
  }
}
