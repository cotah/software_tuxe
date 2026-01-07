import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import workflowService from '../services/workflow.service';
import { AppError } from '../middleware/errorHandler';
import { BusinessType } from '@prisma/client';

export class WorkflowController {
  /**
   * @swagger
   * /api/workflows:
   *   get:
   *     summary: Get workflows for company
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of workflows
   */
  async getWorkflows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { businessType, entityType } = req.query;

      // Get or create default workflow
      if (businessType && entityType) {
        const workflow = await workflowService.getOrCreateDefaultWorkflow(
          businessType as BusinessType,
          entityType as string
        );
        return res.json({
          success: true,
          data: workflow,
        });
      }

      // TODO: Get company-specific workflows
      return res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /api/workflows/{id}/transitions:
   *   get:
   *     summary: Get available transitions for a status
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   */
  async getAvailableTransitions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { currentStatus } = req.query;

      if (!currentStatus) {
        throw new AppError(400, 'currentStatus query parameter is required');
      }

      const transitions = await workflowService.getAvailableTransitions(
        id,
        currentStatus as string
      );

      return res.json({
        success: true,
        data: transitions,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new WorkflowController();

