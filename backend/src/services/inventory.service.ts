import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class InventoryService {
  async getAll(companyId: string) {
    return prisma.inventoryItem.findMany({
      where: { companyId },
      include: {
        product: true,
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
  }

  async getProducts(companyId: string) {
    return prisma.product.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(companyId: string, data: {
    name: string;
    sku?: string;
    description?: string;
  }) {
    return prisma.product.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async getItems(companyId: string) {
    return prisma.inventoryItem.findMany({
      where: { companyId },
      include: {
        product: true,
      },
    });
  }

  async createItem(companyId: string, data: {
    productId: string;
    quantity: number;
    minStock?: number;
    unit?: string;
    location?: string;
  }) {
    // Check if product exists in company
    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    // Check if item already exists
    const existing = await prisma.inventoryItem.findUnique({
      where: {
        productId_companyId: {
          productId: data.productId,
          companyId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'Inventory item already exists for this product');
    }

    return prisma.inventoryItem.create({
      data: {
        ...data,
        companyId,
        unit: data.unit || 'unit',
      },
      include: {
        product: true,
      },
    });
  }

  async updateItem(id: string, companyId: string, data: Partial<{
    quantity: number;
    minStock: number;
    unit: string;
    location: string;
  }>) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, companyId },
    });

    if (!item) {
      throw new AppError(404, 'Inventory item not found');
    }

    return prisma.inventoryItem.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  async getLowStock(companyId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: {
        companyId,
        minStock: {
          not: null,
        },
      },
      include: {
        product: true,
      },
    });

    return items.filter(item => item.minStock && item.quantity <= item.minStock);
  }
}


