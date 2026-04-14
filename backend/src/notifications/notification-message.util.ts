import { StatusServis, WashRequestStatus, WorkOrderStatus } from '@prisma/client';

const serviceStatusLabels: Record<StatusServis, string> = {
  ANTRIAN: 'Antrian',
  DIKERJAKAN: 'Dikerjakan',
  TEST_DRIVE: 'Test Drive',
  SELESAI: 'Selesai',
  DIAMBIL: 'Diambil',
  TERKENDALA: 'Terkendala',
};

const washStatusLabels: Record<WashRequestStatus, string> = {
  TIDAK_PERLU: 'Tidak perlu',
  MENUNGGU: 'Menunggu',
  SELESAI: 'Selesai',
};

const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'Diproses',
  CLOSED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

type UnitContext = {
  nomorWo?: string | number | null;
  plateNumber?: string | null;
  carType?: string | null;
};

function cleanPart(value?: string | number | null) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export function formatUnitLabel(context: UnitContext) {
  const parts = [
    cleanPart(context.nomorWo) ? `WO ${cleanPart(context.nomorWo)}` : null,
    cleanPart(context.plateNumber),
    cleanPart(context.carType),
  ].filter(Boolean);

  return parts.length ? parts.join(' - ') : 'Work order';
}

export function buildWorkOrderCreatedMessage(context: UnitContext) {
  return {
    title: 'Work order baru dibuat',
    message: `${formatUnitLabel(context)} baru dibuat.`,
  };
}

export function buildWorkOrderUpdatedMessage(context: UnitContext) {
  return {
    title: 'Data work order diperbarui',
    message: `${formatUnitLabel(context)} telah diperbarui.`,
  };
}

export function buildWorkOrderStatusMessage(context: UnitContext, fromStatus: WorkOrderStatus, toStatus: WorkOrderStatus) {
  return {
    title: 'Status work order berubah',
    message: `${formatUnitLabel(context)}: ${workOrderStatusLabels[fromStatus]} -> ${workOrderStatusLabels[toStatus]}`,
  };
}

export function buildServiceCreatedMessage(context: UnitContext) {
  return {
    title: 'Servis baru dibuat',
    message: `${formatUnitLabel(context)}: data servis baru sudah dibuat.`,
  };
}

export function buildServiceUpdatedMessage(context: UnitContext) {
  return {
    title: 'Data servis diperbarui',
    message: `${formatUnitLabel(context)}: data servis telah diperbarui.`,
  };
}

export function buildServiceStatusMessage(context: UnitContext, fromStatus: StatusServis, toStatus: StatusServis) {
  return {
    title: 'Status servis berubah',
    message: `${formatUnitLabel(context)}: ${serviceStatusLabels[fromStatus]} -> ${serviceStatusLabels[toStatus]}`,
  };
}

export function buildWashStatusMessage(context: UnitContext, fromStatus: WashRequestStatus, toStatus: WashRequestStatus) {
  return {
    title: 'Status cuci mobil berubah',
    message: `${formatUnitLabel(context)}: ${washStatusLabels[fromStatus]} -> ${washStatusLabels[toStatus]}`,
  };
}

export function buildMechanicNoteMessage(context: UnitContext) {
  return {
    title: 'Catatan mekanik ditambahkan',
    message: `${formatUnitLabel(context)}: catatan mekanik baru ditambahkan.`,
  };
}
