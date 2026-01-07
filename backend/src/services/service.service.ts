import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class ServiceService {
  async getAll(companyId: string) {
    return prisma.service.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string, companyId: string) {
    const service = await prisma.service.findFirst({
      where: { id, companyId },
    });

    if (!service) {
      throw new AppError(404, 'Service not found');
    }

    return service;
  }

  async create(companyId: string, data: {
    name: string;
    description?: string;
    duration?: number;
    price: number;
    isActive?: boolean;
  }) {
    return prisma.service.create({
      data: {
        ...data,
        companyId,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, companyId: string, data: Partial<{
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
  }>) {
    await this.getById(id, companyId);

    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);

    // Check if service is used in orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { serviceId: id },
    });

    if (orderItems) {
      throw new AppError(400, 'Cannot delete service that has been used in orders');
    }

    await prisma.service.delete({ where: { id } });
  }
}


