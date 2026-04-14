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
import { AuditLogStatus, StatusServis, WashRequestStatus } from '@prisma/client';
import { ServicesService } from './services.service';
import { parseToken } from '../common/auth';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildMechanicNoteMessage, buildServiceCreatedMessage, buildServiceStatusMessage, buildServiceUpdatedMessage, buildWashStatusMessage } from '../notifications/notification-message.util';

const MAX_INT32 = 2_147_483_647;

function parseServiceId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_INT32) {
    throw new BadRequestException('ID servis tidak valid');
  }
  return parsed;
}

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  list() {
    return this.servicesService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.servicesService.detail(parseServiceId(id));
  }

  @Post()
  async create(
    @Body()
    body: {
      id_wo: number;
      keluhan: string;
      estimasiSelesai?: string | null;
      status?: StatusServis;
      prioritas?: 'NORMAL' | 'HIGH' | 'URGENT';
      statusCuciMobil?: WashRequestStatus;
      catatanCuciMobil?: string | null;
    },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const actor = parseToken(authorization);
    try {
      const created = await this.servicesService.create(body);
      const createdMessage = buildServiceCreatedMessage({
        nomorWo: created.workOrder?.nomor_wo_pusat ?? created.id_wo,
        plateNumber: created.workOrder?.kendaraan?.plat_nomor,
        carType: created.workOrder?.kendaraan?.jenis_mobil,
      });

      await this.notificationsService.create({
        type: 'SERVICE_CREATED',
        title: createdMessage.title,
        message: createdMessage.message,
        entityType: 'service',
        entityId: created.id_servis,
        targetPath: `/services/${created.id_servis}`,
        actorUserId: actor.id_user,
      });
      await this.auditService.log({
        actor,
        action: 'SERVICE_CREATED',
        module: 'services',
        entityType: 'service',
        entityId: created.id_servis,
        entityLabel: created.workOrder?.nomor_wo_pusat ?? `Servis #${created.id_servis}`,
        status: AuditLogStatus.SUCCESS,
        message: `Membuat servis baru untuk work order ${created.workOrder?.nomor_wo_pusat ?? created.id_wo}.`,
        metadata: { payload: body },
        req,
      });
      return created;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'SERVICE_CREATE_FAILED',
        module: 'services',
        entityType: 'service',
        entityLabel: `WO #${body.id_wo}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal membuat servis untuk work order ${body.id_wo}.`,
        metadata: { payload: body },
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
      keluhan?: string;
      estimasiSelesai?: string | null;
      status?: StatusServis;
      prioritas?: 'NORMAL' | 'HIGH' | 'URGENT';
      statusCuciMobil?: WashRequestStatus;
      catatanCuciMobil?: string | null;
      detail_servis?: string[];
    },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const serviceId = parseServiceId(id);
    const actor = parseToken(authorization);
    const before = await this.servicesService.detail(serviceId);

    try {
      const updated = await this.servicesService.update(serviceId, body);
      const context = {
        nomorWo: updated.workOrder?.nomor_wo_pusat ?? serviceId,
        plateNumber: updated.workOrder?.kendaraan?.plat_nomor,
        carType: updated.workOrder?.kendaraan?.jenis_mobil,
      };
      const serviceMessage = body.status && body.status !== before.status
        ? buildServiceStatusMessage(context, before.status, body.status)
        : body.statusCuciMobil && body.statusCuciMobil !== before.statusCuciMobil
          ? buildWashStatusMessage(context, before.statusCuciMobil, body.statusCuciMobil)
          : buildServiceUpdatedMessage(context);

      await this.notificationsService.create({
        type: 'SERVICE_UPDATED',
        title: serviceMessage.title,
        message: serviceMessage.message,
        entityType: 'service',
        entityId: serviceId,
        targetPath: `/services/${serviceId}`,
        actorUserId: actor.id_user,
      });
      await this.auditService.log({
        actor,
        action: 'SERVICE_UPDATED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: updated.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Memperbarui data servis ${serviceId}.`,
        metadata: {
          before: {
            keluhan: before.keluhan,
            estimasiSelesai: before.estimasiSelesai,
            status: before.status,
            prioritas: before.prioritas,
            detail_servis: before.detail_servis?.map((item) => item.keterangan ?? item.jenis_servis?.nama_servis ?? null),
          },
          after: {
            keluhan: updated.keluhan,
            estimasiSelesai: updated.estimasiSelesai,
            status: updated.status,
            prioritas: updated.prioritas,
            detail_servis: updated.detail_servis?.map((item) => item.keterangan ?? item.jenis_servis?.nama_servis ?? null),
          },
        },
        req,
      });
      return updated;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'SERVICE_UPDATE_FAILED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: before.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal memperbarui data servis ${serviceId}.`,
        metadata: { before, attempted: body },
        req,
      });
      throw error;
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: StatusServis; note?: string },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const serviceId = parseServiceId(id);
    const actor = parseToken(authorization);
    const before = await this.servicesService.detail(serviceId);

    try {
      const updated = await this.servicesService.updateStatus(serviceId, body);
      const statusMessage = buildServiceStatusMessage(
        {
          nomorWo: updated.workOrder?.nomor_wo_pusat ?? serviceId,
          plateNumber: updated.workOrder?.kendaraan?.plat_nomor,
          carType: updated.workOrder?.kendaraan?.jenis_mobil,
        },
        before.status,
        updated.status,
      );
      await this.notificationsService.create({
        type: 'SERVICE_STATUS_UPDATED',
        title: statusMessage.title,
        message: statusMessage.message,
        entityType: 'service',
        entityId: serviceId,
        targetPath: `/services/${serviceId}`,
        actorUserId: actor.id_user,
      });
      await this.auditService.log({
        actor,
        action: 'SERVICE_STATUS_UPDATED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: updated.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Mengubah status servis dari ${before.status} ke ${updated.status}.`,
        metadata: {
          before: { status: before.status, tanggalSelesai: before.tanggalSelesai },
          after: { status: updated.status, tanggalSelesai: updated.tanggalSelesai },
          note: body.note ?? null,
        },
        req,
      });
      return updated;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'SERVICE_STATUS_UPDATE_FAILED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: before.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal mengubah status servis ${serviceId} ke ${body.status}.`,
        metadata: { before: { status: before.status }, attemptedStatus: body.status, note: body.note ?? null },
        req,
      });
      throw error;
    }
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { catatan: string },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const serviceId = parseServiceId(id);
    const actor = parseToken(authorization);
    const service = await this.servicesService.detail(serviceId);

    try {
      const result = await this.servicesService.addNote(serviceId, body);
      const noteMessage = buildMechanicNoteMessage({
        nomorWo: service.workOrder?.nomor_wo_pusat ?? serviceId,
        plateNumber: service.workOrder?.kendaraan?.plat_nomor,
        carType: service.workOrder?.kendaraan?.jenis_mobil,
      });
      await this.notificationsService.create({
        type: 'SERVICE_NOTE_ADDED',
        title: noteMessage.title,
        message: noteMessage.message,
        entityType: 'service',
        entityId: serviceId,
        targetPath: `/services/${serviceId}`,
        actorUserId: actor.id_user,
      });
      await this.auditService.log({
        actor,
        action: 'SERVICE_NOTE_ADDED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: service.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Menambahkan catatan pada servis ${serviceId}.`,
        metadata: { noteLength: body.catatan?.trim().length ?? 0 },
        req,
      });
      return result;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'SERVICE_NOTE_ADD_FAILED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: service.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal menambahkan catatan pada servis ${serviceId}.`,
        metadata: { noteLength: body.catatan?.trim().length ?? 0 },
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
    const serviceId = parseServiceId(id);
    const actor = parseToken(authorization);
    const before = await this.servicesService.detail(serviceId);

    try {
      const result = await this.servicesService.delete(serviceId);
      await this.auditService.log({
        actor,
        action: 'SERVICE_DELETED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: before.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Menghapus servis ${serviceId}.`,
        metadata: { before },
        req,
      });
      return result;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'SERVICE_DELETE_FAILED',
        module: 'services',
        entityType: 'service',
        entityId: serviceId,
        entityLabel: before.workOrder?.nomor_wo_pusat ?? `Servis #${serviceId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal menghapus servis ${serviceId}.`,
        metadata: { before },
        req,
      });
      throw error;
    }
  }
}
