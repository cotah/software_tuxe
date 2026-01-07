import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/bcrypt';
import { UserRole } from '@prisma/client';

export class UserService {
  async getAll(companyId: string) {
    return prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getById(id: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async create(companyId: string, data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, companyId: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: UserRole;
  }>) {
    await this.getById(id, companyId);

    // If email is being updated, check for duplicates
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async toggleStatus(id: string, companyId: string) {
    const user = await this.getById(id, companyId);

    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const user = await this.getById(id, companyId);

    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          companyId,
          role: 'ADMIN',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        throw new AppError(400, 'Cannot delete the last admin user');
      }
    }

    await prisma.user.delete({ where: { id } });
  }
}


