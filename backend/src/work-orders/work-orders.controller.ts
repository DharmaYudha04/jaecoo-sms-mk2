import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AuditLogStatus,
  PriorityLevel,
  StatusServis,
  WashRequestStatus,
  WorkOrderStatus,
} from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';
import { parseToken } from '../common/auth';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildWorkOrderCreatedMessage, buildWorkOrderStatusMessage, buildWorkOrderUpdatedMessage } from '../notifications/notification-message.util';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private parseWorkOrderId(id: string): number {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 2147483647) {
      throw new BadRequestException('ID work order tidak valid');
    }

    return parsed;
  }

  @Get()
  list() {
    return this.workOrdersService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.workOrdersService.detail(this.parseWorkOrderId(id));
  }

  @Post()
  async create(
    @Body()
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
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const actor = parseToken(authorization);

    try {
      const created = await this.workOrdersService.create(body, authorization);

      if (!created) {
        throw new InternalServerErrorException('Work order gagal dibuat.');
      }

      const createdMessage = buildWorkOrderCreatedMessage({
        nomorWo: created.nomor_wo_pusat ?? created.id_wo,
        plateNumber: created.kendaraan?.plat_nomor,
        carType: created.kendaraan?.jenis_mobil,
      });

      await this.notificationsService.create({
        type: 'WORK_ORDER_CREATED',
        title: createdMessage.title,
        message: createdMessage.message,
        entityType: 'work-order',
        entityId: created.id_wo,
        targetPath: `/work-orders`,
        actorUserId: actor.id_user,
      });

      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_CREATED',
        module: 'work-orders',
        entityType: 'work-order',
        entityId: created.id_wo,
        entityLabel: created.nomor_wo_pusat ?? `WO #${created.id_wo}`,
        status: AuditLogStatus.SUCCESS,
        message: `Membuat work order ${created.nomor_wo_pusat ?? created.id_wo}.`,
        metadata: {
          no_rangka: created.no_rangka,
          serviceStatus: created.servis?.[0]?.status ?? null,
          servicePriority: created.servis?.[0]?.prioritas ?? null,
        },
        req,
      });

      return created;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_CREATE_FAILED',
        module: 'work-orders',
        entityType: 'work-order',
        entityLabel: body.nomor_wo_pusat ?? body.no_rangka,
        status: AuditLogStatus.FAILED,
        message: `Gagal membuat work order ${body.nomor_wo_pusat ?? body.no_rangka}.`,
        metadata: {
          no_rangka: body.no_rangka,
          nomor_wo_pusat: body.nomor_wo_pusat ?? null,
          detailCount: body.detail_servis?.length ?? 0,
        },
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
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const workOrderId = this.parseWorkOrderId(id);
    const actor = parseToken(authorization);
    const before = await this.workOrdersService.detail(workOrderId);

    try {
      const updated = await this.workOrdersService.update(workOrderId, body);

      if (!updated) {
        throw new InternalServerErrorException('Work order gagal diperbarui.');
      }

      const workOrderMessage = body.status && body.status !== before.status
        ? buildWorkOrderStatusMessage(
            {
              nomorWo: updated.nomor_wo_pusat ?? workOrderId,
              plateNumber: updated.kendaraan?.plat_nomor,
              carType: updated.kendaraan?.jenis_mobil,
            },
            before.status,
            body.status,
          )
        : buildWorkOrderUpdatedMessage({
            nomorWo: updated.nomor_wo_pusat ?? workOrderId,
            plateNumber: updated.kendaraan?.plat_nomor,
            carType: updated.kendaraan?.jenis_mobil,
          });

      await this.notificationsService.create({
        type: 'WORK_ORDER_UPDATED',
        title: workOrderMessage.title,
        message: workOrderMessage.message,
        entityType: 'work-order',
        entityId: workOrderId,
        targetPath: `/work-orders`,
        actorUserId: actor.id_user,
      });

      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_UPDATED',
        module: 'work-orders',
        entityType: 'work-order',
        entityId: workOrderId,
        entityLabel: updated.nomor_wo_pusat ?? `WO #${workOrderId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Memperbarui work order ${updated.nomor_wo_pusat ?? workOrderId}.`,
        metadata: {
          before: {
            status: before.status,
            nomor_wo_pusat: before.nomor_wo_pusat,
            no_rangka: before.no_rangka,
            service: before.servis?.[0]
              ? {
                  status: before.servis[0].status,
                  prioritas: before.servis[0].prioritas,
                  keluhan: before.servis[0].keluhan,
                }
              : null,
          },
          after: {
            status: updated.status,
            nomor_wo_pusat: updated.nomor_wo_pusat,
            no_rangka: updated.no_rangka,
            service: updated.servis?.[0]
              ? {
                  status: updated.servis[0].status,
                  prioritas: updated.servis[0].prioritas,
                  keluhan: updated.servis[0].keluhan,
                }
              : null,
          },
          changedSections: Object.keys(body),
        },
        req,
      });

      return updated;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_UPDATE_FAILED',
        module: 'work-orders',
        entityType: 'work-order',
        entityId: workOrderId,
        entityLabel: before.nomor_wo_pusat ?? `WO #${workOrderId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal memperbarui work order ${before.nomor_wo_pusat ?? workOrderId}.`,
        metadata: { before, attemptedChanges: body },
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
    const workOrderId = this.parseWorkOrderId(id);
    const actor = parseToken(authorization);
    const before = await this.workOrdersService.detail(workOrderId);

    try {
      const result = await this.workOrdersService.delete(workOrderId);

      if (!result) {
        throw new InternalServerErrorException('Work order gagal dihapus.');
      }

      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_DELETED',
        module: 'work-orders',
        entityType: 'work-order',
        entityId: workOrderId,
        entityLabel: before.nomor_wo_pusat ?? `WO #${workOrderId}`,
        status: AuditLogStatus.SUCCESS,
        message: `Menghapus work order ${before.nomor_wo_pusat ?? workOrderId}.`,
        metadata: { before },
        req,
      });

      return result;
    } catch (error) {
      await this.auditService.log({
        actor,
        action: 'WORK_ORDER_DELETE_FAILED',
        module: 'work-orders',
        entityType: 'work-order',
        entityId: workOrderId,
        entityLabel: before.nomor_wo_pusat ?? `WO #${workOrderId}`,
        status: AuditLogStatus.FAILED,
        message: `Gagal menghapus work order ${before.nomor_wo_pusat ?? workOrderId}.`,
        metadata: { before },
        req,
      });
      throw error;
    }
  }
}