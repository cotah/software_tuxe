import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus, BusinessType } from '@prisma/client';
import workflowService from './workflow.service';
import { emitOrderUpdate } from '../utils/websocket';
import notificationService from './notification.service';

export class OrderService {
  async getAll(companyId: string, filters: any = {}) {
    const where: any = { companyId };

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

    return prisma.order.findMany({
      where,
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
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string, companyId: string) {
    const order = await prisma.order.findFirst({
      where: { id, companyId },
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
            email: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    return order;
  }

  async create(companyId: string, data: {
    items: Array<{ serviceId: string; quantity: number; price: number; notes?: string }>;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
    assignedTo?: string;
  }) {
    // Get company to determine business type
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { businessType: true },
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    // Get or create workflow for this business type
    const workflow = await workflowService.getOrCreateDefaultWorkflow(
      company.businessType || BusinessType.GENERAL,
      'ORDER'
    );

    // Generate order number
    const orderCount = await prisma.order.count({
      where: { companyId },
    });
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Calculate total
    const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        companyId,
        totalAmount,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        notes: data.notes,
        assignedTo: data.assignedTo,
        status: workflow.defaultStatus,
        workflowId: workflow.id,
        items: {
          create: data.items,
        },
        statusHistory: {
          create: {
            status: workflow.defaultStatus,
            previousStatus: null,
          },
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        workflow: true,
      },
    });

    // Emit real-time update
    emitOrderUpdate(companyId, order);

    // Send notification if customer email provided
    if (data.customerEmail) {
      await notificationService.queueNotification({
        companyId,
        channel: 'EMAIL',
        recipient: data.customerEmail,
        subject: `Order ${orderNumber} Created`,
        message: `Your order ${orderNumber} has been created and is now ${workflow.defaultStatus}.`,
      });
    }

    return order;
  }

  async updateStatus(id: string, newStatus: string, companyId: string, changedBy?: string, notes?: string) {
    const order = await this.getById(id, companyId);

    if (!order.workflowId) {
      throw new AppError(400, 'Order does not have a workflow assigned');
    }

    // Validate transition
    const isValid = await workflowService.validateTransition(
      order.workflowId,
      order.status,
      newStatus
    );

    if (!isValid) {
      throw new AppError(400, `Invalid status transition from ${order.status} to ${newStatus}`);
    }

    const previousStatus = order.status;

    // Get workflow to check if new status is terminal
    const workflow = await prisma.workflow.findUnique({
      where: { id: order.workflowId },
    });

    if (!workflow) {
      throw new AppError(404, 'Workflow not found');
    }

    const statuses = workflow.statuses as any[];
    const newStatusConfig = statuses.find((s: any) => s.name === newStatus);
    const isTerminal = newStatusConfig?.isTerminal || false;

    const updateData: any = {
      status: newStatus,
    };

    if (isTerminal && !order.completedAt) {
      updateData.completedAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            service: true,
          },
        },
        workflow: true,
      },
    });

    // Record status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: newStatus,
        previousStatus,
        changedBy,
        notes,
      },
    });

    // Emit real-time update
    emitOrderUpdate(companyId, updatedOrder);

    // Send notification
    if (order.customerEmail) {
      await notificationService.queueNotification({
        companyId,
        channel: 'EMAIL',
        recipient: order.customerEmail,
        subject: `Order ${order.orderNumber} Status Updated`,
        message: `Your order ${order.orderNumber} status has been updated to ${newStatus}.`,
      });
    }

    return updatedOrder;
  }

  async assign(id: string, userId: string | null, companyId: string) {
    await this.getById(id, companyId);

    if (userId) {
      const user = await prisma.user.findFirst({
        where: { id: userId, companyId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }
    }

    return prisma.order.update({
      where: { id },
      data: { assignedTo: userId },
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
    });
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    await prisma.order.delete({ where: { id } });
  }
}


