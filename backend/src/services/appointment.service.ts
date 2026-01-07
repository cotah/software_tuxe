import { AppointmentStatus, SyncState } from '@prisma/client';
import { zonedTimeToUtc } from 'date-fns-tz';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

type AppointmentInput = {
  title: string;
  description?: string;
  startAt: string | Date;
  endAt: string | Date;
  timezone?: string;
  customerId?: string;
  assignedUserId?: string;
  location?: string;
  metadata?: Record<string, any>;
  status?: AppointmentStatus;
};

function isValidTimeZone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function toUtc(date: string | Date, timezone: string): Date {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, 'Invalid date provided');
  }
  return zonedTimeToUtc(parsed, timezone);
}

export class AppointmentService {
  private async getTenantSettings(tenantId: string) {
    const existing = await prisma.tenantCalendarSettings.findUnique({
      where: { tenantId },
    });

    if (existing) {
      return existing;
    }

    return prisma.tenantCalendarSettings.create({
      data: {
        tenantId,
        defaultTimezone: 'Europe/Dublin',
      },
    });
  }

  private async ensureNoOverlap(
    tenantId: string,
    assignedUserId: string,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string
  ) {
    const overlapping = await prisma.appointment.findFirst({
      where: {
        tenantId,
        assignedUserId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        OR: [
          {
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
        ],
      },
    });

    if (overlapping) {
      throw new AppError(400, 'Overlap detected for the assigned user');
    }
  }

  async createAppointment(tenantId: string, input: AppointmentInput, createdByUserId: string) {
    const settings = await this.getTenantSettings(tenantId);
    const timezone = input.timezone || settings.defaultTimezone;

    if (!isValidTimeZone(timezone)) {
      throw new AppError(400, 'Invalid timezone. Please provide an IANA timezone string.');
    }

    const startAtUtc = toUtc(input.startAt, timezone);
    const endAtUtc = toUtc(input.endAt, timezone);

    if (startAtUtc >= endAtUtc) {
      throw new AppError(400, 'startAt must be before endAt');
    }

    if (settings.preventOverbooking && input.assignedUserId) {
      await this.ensureNoOverlap(tenantId, input.assignedUserId, startAtUtc, endAtUtc);
    }

    const status = input.status || AppointmentStatus.SCHEDULED;

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        title: input.title,
        description: input.description,
        status,
        startAt: startAtUtc,
        endAt: endAtUtc,
        timezone,
        customerId: input.customerId,
        assignedUserId: input.assignedUserId,
        location: input.location,
        metadata: input.metadata as any,
        createdByUserId,
        statusHistory: {
          create: {
            tenantId,
            fromStatus: null,
            toStatus: status,
            changedByUserId: createdByUserId,
            reason: 'Created',
          },
        },
      },
    });

    return appointment;
  }

  async listAppointments(
    tenantId: string,
    filters: {
      from?: string;
      to?: string;
      status?: AppointmentStatus;
      assignedUserId?: string;
      customerId?: string;
    }
  ) {
    const where: any = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.from || filters.to) {
      where.startAt = {};
      if (filters.from) {
        where.startAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.startAt.lte = new Date(filters.to);
      }
    }

    return prisma.appointment.findMany({
      where,
      orderBy: { startAt: 'asc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }

    return appointment;
  }

  private async markMappingsForSync(appointmentId: string, tenantId: string) {
    await prisma.appointmentExternalMapping.updateMany({
      where: { appointmentId, tenantId },
      data: { syncState: SyncState.NEEDS_UPDATE, errorMessage: null },
    });
  }

  async updateAppointment(
    id: string,
    tenantId: string,
    data: Partial<AppointmentInput>,
    _updatedByUserId: string
  ) {
    const existing = await this.getById(id, tenantId);
    const settings = await this.getTenantSettings(tenantId);
    const timezone = data.timezone || existing.timezone || settings.defaultTimezone;

    if (data.timezone && !isValidTimeZone(data.timezone)) {
      throw new AppError(400, 'Invalid timezone. Please provide an IANA timezone string.');
    }

    let startAtUtc = existing.startAt;
    let endAtUtc = existing.endAt;

    if (data.startAt) {
      startAtUtc = toUtc(data.startAt, timezone);
    }
    if (data.endAt) {
      endAtUtc = toUtc(data.endAt, timezone);
    }

    if (startAtUtc >= endAtUtc) {
      throw new AppError(400, 'startAt must be before endAt');
    }

    if (settings.preventOverbooking && (data.assignedUserId || data.startAt || data.endAt)) {
      const assignedUserId = data.assignedUserId || existing.assignedUserId;
      if (assignedUserId) {
        await this.ensureNoOverlap(tenantId, assignedUserId, startAtUtc, endAtUtc, id);
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        startAt: startAtUtc,
        endAt: endAtUtc,
        timezone,
        customerId: data.customerId ?? existing.customerId,
        assignedUserId: data.assignedUserId ?? existing.assignedUserId,
        location: data.location ?? existing.location,
        metadata: data.metadata !== undefined ? (data.metadata as any) : existing.metadata,
      },
    });

    await this.markMappingsForSync(id, tenantId);

    return updated;
  }

  async changeStatus(
    id: string,
    tenantId: string,
    toStatus: AppointmentStatus,
    reason: string | undefined,
    changedByUserId: string
  ) {
    const appointment = await this.getById(id, tenantId);

    if (appointment.status === toStatus) {
      throw new AppError(400, 'Appointment is already in the requested status');
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: toStatus,
      },
    });

    await prisma.appointmentStatusHistory.create({
      data: {
        tenantId,
        appointmentId: id,
        fromStatus: appointment.status,
        toStatus,
        changedByUserId,
        reason: reason || undefined,
      },
    });

    await this.markMappingsForSync(id, tenantId);

    return updated;
  }
}

export const appointmentService = new AppointmentService();
