import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogStatus, Role } from '@prisma/client';
import { UsersService } from './users.service';
import { parseToken } from '../common/auth';
import { AuditService } from '../audit/audit.service';

const MAX_INT32 = 2_147_483_647;

function parseUserId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_INT32) {
    throw new BadRequestException('ID user tidak valid');
  }
  return parsed;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.usersService.detail(parseUserId(id));
  }

  @Post()
  async create(
    @Body()
    body: {
      fullName?: string;
      email: string;
      password: string;
      role: Role;
      isActive?: boolean;
    },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const actor = parseToken(authorization);
    try {
      const created = await this.usersService.create(body);
      await this.auditService.log({
        actor,
        action: 'USER_CREATED',
        module: 'users',
        entityType: 'user',
        entityId: created.id_user,
        entityLabel: created.email,
        status: AuditLogStatus.SUCCESS,
        message: `Membuat user ${created.email}.`,
        metadata: { role: created.role, isActive: created.isActive },
        req,
      });
      return created;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'USER_CREATE_FAILED',
        module: 'users',
        entityType: 'user',
        entityLabel: body.email?.trim().toLowerCase() || 'unknown',
        status: AuditLogStatus.FAILED,
        message: `Gagal membuat user ${body.email?.trim().toLowerCase() || 'unknown'}.`,
        metadata: { role: body.role, isActive: body.isActive ?? true },
        req,
      });
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      email?: string;
      role?: Role;
      isActive?: boolean;
      password?: string;
    },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const parsedId = parseUserId(id);
    const actor = parseToken(authorization);
    const before = await this.usersService.detail(parsedId);

    try {
      const updated = await this.usersService.update(parsedId, body);
      await this.auditService.log({
        actor,
        action: 'USER_UPDATED',
        module: 'users',
        entityType: 'user',
        entityId: updated.id_user,
        entityLabel: updated.email,
        status: AuditLogStatus.SUCCESS,
        message: `Memperbarui user ${updated.email}.`,
        metadata: {
          before,
          after: updated,
          changedFields: Object.keys(body),
          passwordChanged: body.password !== undefined,
        },
        req,
      });
      return updated;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'USER_UPDATE_FAILED',
        module: 'users',
        entityType: 'user',
        entityId: parsedId,
        entityLabel: before.email,
        status: AuditLogStatus.FAILED,
        message: `Gagal memperbarui user ${before.email}.`,
        metadata: { before, attemptedChanges: { ...body, password: body.password ? '[REDACTED]' : undefined } },
        req,
      });
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const parsedId = parseUserId(id);
    const actor = parseToken(authorization);
    const before = await this.usersService.detail(parsedId);

    try {
      const updated = await this.usersService.delete(parsedId);
      await this.auditService.log({
        actor,
        action: 'USER_DEACTIVATED',
        module: 'users',
        entityType: 'user',
        entityId: updated.id_user,
        entityLabel: updated.email,
        status: AuditLogStatus.SUCCESS,
        message: `Menonaktifkan user ${updated.email}.`,
        metadata: { before, after: updated },
        req,
      });
      return updated;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'USER_DEACTIVATE_FAILED',
        module: 'users',
        entityType: 'user',
        entityId: parsedId,
        entityLabel: before.email,
        status: AuditLogStatus.FAILED,
        message: `Gagal menonaktifkan user ${before.email}.`,
        metadata: { before },
        req,
      });
      throw error;
    }
  }
}
