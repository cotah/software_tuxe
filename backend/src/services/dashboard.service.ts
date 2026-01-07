import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardService {
  async getAdminDashboard(companyId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Active orders
    const activeOrders = await prisma.order.count({
      where: {
        companyId,
        status: {
          in: ['PENDING', 'PREPARING'],
        },
      },
    });

    // Today's sales
    const todaySales = await prisma.order.aggregate({
      where: {
        companyId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['COMPLETED', 'READY'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Today's payments
    const todayPayments = await prisma.payment.aggregate({
      where: {
        companyId,
        status: 'PAID',
        paidAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Upcoming schedules
    const upcomingSchedules = await prisma.schedule.count({
      where: {
        companyId,
        startDate: {
          gte: now,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    // Low stock items
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        companyId,
        minStock: {
          not: null,
        },
      },
      include: {
        product: true,
      },
    }).then(items =>
      items.filter(item => item.minStock && item.quantity <= item.minStock)
    );

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        status: 'PAID',
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      overview: {
        activeOrders,
        todaySales: todaySales._sum.totalAmount || 0,
        todayPayments: todayPayments._sum.amount || 0,
        upcomingSchedules,
        lowStockItems: lowStockItems.length,
      },
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        product: item.product.name,
        quantity: item.quantity,
        minStock: item.minStock,
        unit: item.unit,
      })),
      monthlyRevenue,
    };
  }

  async getStaffDashboard(companyId: string, userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Today's roster
    const todayRoster = await prisma.roster.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Today's check-in status
    const todayCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Assigned orders
    const assignedOrders = await prisma.order.findMany({
      where: {
        companyId,
        assignedTo: userId,
        status: {
          in: ['PENDING', 'PREPARING'],
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      roster: todayRoster,
      checkIn: todayCheckIn,
      assignedOrders,
    };
  }

  async getKitchenDashboard(companyId: string) {
    // All active orders
    const activeOrders = await prisma.order.findMany({
      where: {
        companyId,
        status: {
          in: ['PENDING', 'PREPARING', 'READY'],
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return {
      orders: activeOrders,
    };
  }
}


