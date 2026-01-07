import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class ScheduleService {
  async getAll(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.endDate = { lte: new Date(filters.endDate as string) };
      }
    }

    return prisma.schedule.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async getById(id: string, companyId: string) {
    const schedule = await prisma.schedule.findFirst({
      where: { id, companyId },
    });

    if (!schedule) {
      throw new AppError(404, 'Schedule not found');
    }

    return schedule;
  }

  async create(companyId: string, data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    type: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    status?: string;
  }) {
    return prisma.schedule.create({
      data: {
        ...data,
        companyId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'scheduled',
      },
    });
  }

  async update(id: string, companyId: string, data: Partial<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status: string;
  }>) {
    await this.getById(id, companyId);

    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return prisma.schedule.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    await prisma.schedule.delete({ where: { id } });
  }
}


