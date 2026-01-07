import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class CheckInService {
  async checkIn(userId: string, companyId: string, notes?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existing = await prisma.checkIn.findFirst({
      where: {
        userId,
        companyId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        checkOut: null,
      },
    });

    if (existing) {
      throw new AppError(400, 'Already checked in today');
    }

    return prisma.checkIn.create({
      data: {
        userId,
        companyId,
        notes,
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

  async checkOut(userId: string, companyId: string, notes?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        companyId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        checkOut: null,
      },
    });

    if (!checkIn) {
      throw new AppError(400, 'No active check-in found');
    }

    return prisma.checkIn.update({
      where: { id: checkIn.id },
      data: {
        checkOut: new Date(),
        notes: notes || checkIn.notes,
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

  async getHistory(userId: string, companyId: string, filters: any = {}) {
    const where: any = {
      userId,
      companyId,
    };

    if (filters.startDate || filters.endDate) {
      where.checkIn = {};
      if (filters.startDate) {
        where.checkIn.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.checkIn.lte = new Date(filters.endDate as string);
      }
    }

    return prisma.checkIn.findMany({
      where,
      orderBy: {
        checkIn: 'desc',
      },
    });
  }

  async getAllHistory(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.checkIn = {};
      if (filters.startDate) {
        where.checkIn.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.checkIn.lte = new Date(filters.endDate as string);
      }
    }

    return prisma.checkIn.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });
  }
}


