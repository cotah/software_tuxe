import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class PaymentService {
  async getAll(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate as string);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate as string);
      }
    }

    return prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string, companyId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, companyId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    return payment;
  }

  async create(companyId: string, data: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    metadata?: any;
  }) {
    // Verify order exists and belongs to company
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, companyId },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        companyId,
        status: 'PENDING',
      },
      include: {
        order: true,
      },
    });

    // If payment is marked as paid, update paidAt
    if (data.metadata?.status === 'PAID') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus, companyId: string) {
    const payment = await this.getById(id, companyId);

    const updateData: any = { status };

    if (status === 'PAID' && !payment.paidAt) {
      updateData.paidAt = new Date();
    }

    return prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
      },
    });
  }
}


