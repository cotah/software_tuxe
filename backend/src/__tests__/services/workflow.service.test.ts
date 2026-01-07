import workflowService from '../../services/workflow.service';
import prisma from '../../utils/prisma';
import { BusinessType } from '@prisma/client';

// Mock Prisma
jest.mock('../../utils/prisma', () => ({
  workflow: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('WorkflowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateDefaultWorkflow', () => {
    it('should return existing workflow if found', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Default ORDER Workflow - RESTAURANT',
        businessType: 'RESTAURANT' as BusinessType,
        entityType: 'ORDER',
        statuses: [],
        defaultStatus: 'PENDING',
        isSystem: true,
      };

      (prisma.workflow.findFirst as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await workflowService.getOrCreateDefaultWorkflow(
        BusinessType.RESTAURANT,
        'ORDER'
      );

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.findFirst).toHaveBeenCalledWith({
        where: {
          businessType: BusinessType.RESTAURANT,
          entityType: 'ORDER',
          isSystem: true,
        },
      });
    });

    it('should create default workflow if not found', async () => {
      (prisma.workflow.findFirst as jest.Mock).mockResolvedValue(null);

      const mockCreatedWorkflow = {
        id: 'workflow-123',
        name: 'Default ORDER Workflow - RESTAURANT',
        businessType: 'RESTAURANT' as BusinessType,
        entityType: 'ORDER',
        statuses: expect.any(Array),
        defaultStatus: 'PENDING',
        isSystem: true,
      };

      (prisma.workflow.create as jest.Mock).mockResolvedValue(mockCreatedWorkflow);

      const result = await workflowService.getOrCreateDefaultWorkflow(
        BusinessType.RESTAURANT,
        'ORDER'
      );

      expect(result).toBeDefined();
      expect(prisma.workflow.create).toHaveBeenCalled();
    });
  });

  describe('validateTransition', () => {
    it('should validate allowed transition', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        statuses: [
          {
            name: 'PENDING',
            transitions: ['CONFIRMED', 'CANCELLED'],
          },
          {
            name: 'CONFIRMED',
            transitions: ['PREPARING'],
          },
        ],
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const isValid = await workflowService.validateTransition(
        'workflow-123',
        'PENDING',
        'CONFIRMED'
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid transition', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        statuses: [
          {
            name: 'PENDING',
            transitions: ['CONFIRMED'],
          },
        ],
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      await expect(
        workflowService.validateTransition('workflow-123', 'PENDING', 'INVALID_STATUS')
      ).rejects.toThrow();
    });
  });
});

