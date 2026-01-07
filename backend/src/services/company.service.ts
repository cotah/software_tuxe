import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class CompanyService {
  async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            services: true,
            orders: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    return company;
  }

  async update(id: string, data: Partial<{
    name: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    timezone: string;
    workingHours: any;
  }>) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  async getSettings(id: string) {
    const company = await this.getById(id);
    return {
      name: company.name,
      logo: company.logo,
      phone: company.phone,
      email: company.email,
      address: company.address,
      timezone: company.timezone,
      workingHours: company.workingHours,
      settings: company.settings,
    };
  }

  async updateSettings(id: string, data: Partial<{
    name: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    timezone: string;
    workingHours: any;
    settings: any;
  }>) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }
}


