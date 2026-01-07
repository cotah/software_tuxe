import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { BusinessType, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export interface WorkflowStatus {
  name: string;
  label: string;
  color?: string;
  transitions: string[];
  isTerminal?: boolean;
}

export interface WorkflowConfig {
  name: string;
  businessType: BusinessType;
  entityType: string;
  statuses: WorkflowStatus[];
  defaultStatus: string;
}

class WorkflowService {
  /**
   * Get or create default workflow for business type
   */
  async getOrCreateDefaultWorkflow(
    businessType: BusinessType,
    entityType: string
  ): Promise<any> {
    let workflow = await prisma.workflow.findFirst({
      where: {
        businessType,
        entityType,
        isSystem: true,
      },
    });

    if (!workflow) {
      workflow = await this.createDefaultWorkflow(businessType, entityType);
    }

    return workflow;
  }

  /**
   * Create default workflow based on business type
   */
  private async createDefaultWorkflow(
    businessType: BusinessType,
    entityType: string
  ): Promise<any> {
    let statuses: WorkflowStatus[] = [];

    if (entityType === 'ORDER') {
      switch (businessType) {
        case 'RESTAURANT':
          statuses = [
            { name: 'PENDING', label: 'Pendente', color: '#fbbf24', transitions: ['CONFIRMED', 'CANCELLED'] },
            { name: 'CONFIRMED', label: 'Confirmado', color: '#3b82f6', transitions: ['PREPARING', 'CANCELLED'] },
            { name: 'PREPARING', label: 'Preparando', color: '#8b5cf6', transitions: ['READY', 'CANCELLED'] },
            { name: 'READY', label: 'Pronto', color: '#10b981', transitions: ['DELIVERED', 'COMPLETED'] },
            { name: 'DELIVERED', label: 'Entregue', color: '#059669', transitions: [], isTerminal: true },
            { name: 'COMPLETED', label: 'Concluido', color: '#059669', transitions: [], isTerminal: true },
            { name: 'CANCELLED', label: 'Cancelado', color: '#ef4444', transitions: [], isTerminal: true },
          ];
          break;
        case 'BIKE_SHOP':
          statuses = [
            { name: 'QUOTE_REQUESTED', label: 'Orcamento Solicitado', color: '#fbbf24', transitions: ['QUOTE_SENT', 'CANCELLED'] },
            { name: 'QUOTE_SENT', label: 'Orcamento Enviado', color: '#3b82f6', transitions: ['QUOTE_APPROVED', 'QUOTE_REJECTED', 'CANCELLED'] },
            { name: 'QUOTE_APPROVED', label: 'Orcamento Aprovado', color: '#10b981', transitions: ['IN_PROGRESS', 'CANCELLED'] },
            { name: 'QUOTE_REJECTED', label: 'Orcamento Rejeitado', color: '#ef4444', transitions: [], isTerminal: true },
            { name: 'IN_PROGRESS', label: 'Em Andamento', color: '#8b5cf6', transitions: ['READY_FOR_PICKUP', 'CANCELLED'] },
            { name: 'READY_FOR_PICKUP', label: 'Pronto para Retirada', color: '#10b981', transitions: ['COMPLETED'] },
            { name: 'COMPLETED', label: 'Concluido', color: '#059669', transitions: [], isTerminal: true },
            { name: 'CANCELLED', label: 'Cancelado', color: '#ef4444', transitions: [], isTerminal: true },
          ];
          break;
        default:
          statuses = [
            { name: 'PENDING', label: 'Pendente', color: '#fbbf24', transitions: ['IN_PROGRESS', 'CANCELLED'] },
            { name: 'IN_PROGRESS', label: 'Em Andamento', color: '#3b82f6', transitions: ['COMPLETED', 'CANCELLED'] },
            { name: 'COMPLETED', label: 'Concluido', color: '#10b981', transitions: [], isTerminal: true },
            { name: 'CANCELLED', label: 'Cancelado', color: '#ef4444', transitions: [], isTerminal: true },
          ];
      }
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: `Default ${entityType} Workflow - ${businessType}`,
        businessType,
        entityType,
        statuses: statuses as unknown as Prisma.JsonArray,
        defaultStatus: statuses[0]?.name || 'PENDING',
        isSystem: true,
      },
    });

    logger.info(`Created default workflow for ${businessType} - ${entityType}`);
    return workflow;
  }

  /**
   * Validate status transition
   */
  async validateTransition(
    workflowId: string,
    currentStatus: string,
    newStatus: string
  ): Promise<boolean> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new AppError(404, 'Workflow not found');
    }

    const statuses = workflow.statuses as unknown as WorkflowStatus[];
    const currentStatusConfig = statuses.find((s) => s.name === currentStatus);

    if (!currentStatusConfig) {
      throw new AppError(400, `Invalid current status: ${currentStatus}`);
    }

    if (currentStatusConfig.isTerminal) {
      throw new AppError(400, 'Cannot transition from terminal status');
    }

    if (!currentStatusConfig.transitions.includes(newStatus)) {
      throw new AppError(400, `Transition from ${currentStatus} to ${newStatus} is not allowed`);
    }

    return true;
  }

  /**
   * Get available transitions for a status
   */
  async getAvailableTransitions(workflowId: string, currentStatus: string): Promise<string[]> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new AppError(404, 'Workflow not found');
    }

    const statuses = workflow.statuses as unknown as WorkflowStatus[];
    const currentStatusConfig = statuses.find((s) => s.name === currentStatus);

    if (!currentStatusConfig) {
      return [];
    }

    return currentStatusConfig.transitions;
  }

  /**
   * Create custom workflow for a company
   */
  async createCustomWorkflow(
    companyId: string,
    config: WorkflowConfig
  ): Promise<any> {
    return prisma.workflow.create({
      data: {
        ...config,
        statuses: config.statuses as unknown as Prisma.JsonArray,
        companyId,
        isSystem: false,
      },
    });
  }
}

export default new WorkflowService();
