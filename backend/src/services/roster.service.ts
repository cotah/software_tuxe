import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class RosterService {
  async getAll(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate as string);
      }
    }

    return prisma.roster.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getMyRoster(userId: string, companyId: string, filters: any = {}) {
    const where: any = { userId, companyId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate as string);
      }
    }

    return prisma.roster.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });
  }

  async create(companyId: string, data: {
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    const user = await prisma.user.findFirst({
      where: { id: data.userId, companyId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return prisma.roster.create({
      data: {
        ...data,
        date: new Date(data.date),
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, companyId: string, data: Partial<{
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
  }>) {
    const roster = await prisma.roster.findFirst({
      where: { id, companyId },
    });

    if (!roster) {
      throw new AppError(404, 'Roster not found');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return prisma.roster.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const roster = await prisma.roster.findFirst({
      where: { id, companyId },
    });

    if (!roster) {
      throw new AppError(404, 'Roster not found');
    }

    await prisma.roster.delete({ where: { id } });
  }
}


