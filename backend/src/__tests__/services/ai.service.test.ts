import { aiService } from '../../services/ai.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

jest.mock('../../utils/prisma', () => ({
  tenantAISettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  aIUsageLog: {
    aggregate: jest.fn(),
    create: jest.fn(),
  },
  lead: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  conversation: {
    findFirst: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
  },
}));

jest.mock('../../config/aiEnv', () => ({
  loadAIEnv: () => ({ apiKey: 'test-key', baseUrl: 'http://localhost', defaultModel: 'gpt-4.1-mini' }),
}));

jest.mock('../../services/eventEmitter.service', () => ({
  eventService: {
    emitEvent: jest.fn(),
  },
}));

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: false,
      dailyTokenLimit: 1,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
  });

  it('throws when AI disabled', async () => {
    await expect(aiService.classifyLead('tenant-1', 'lead-1')).rejects.toBeInstanceOf(AppError);
  });

  it('blocks when daily limit reached', async () => {
    (prisma.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 1,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prisma.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 1, completionTokens: 1 } });
    await expect(aiService.classifyLead('tenant-1', 'lead-1')).rejects.toBeInstanceOf(AppError);
  });

  it('persists classification to lead', async () => {
    (prisma.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 0,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prisma.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 0, completionTokens: 0 } });
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      tenantId: 'tenant-1',
    });
    (prisma.message.findMany as jest.Mock).mockResolvedValue([]);
    (aiService as any).provider = {
      classifyLead: jest.fn().mockResolvedValue({
        temperature: 'HOT',
        intent: 'buy',
        confidence: 0.9,
        notes: 'ready to buy',
      }),
    };

    await aiService.classifyLead('tenant-1', 'lead-1');

    expect(prisma.lead.update as jest.Mock).toHaveBeenCalled();
  });

  it('returns 502 when provider response invalid', async () => {
    (prisma.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 0,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prisma.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 0, completionTokens: 0 } });
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      tenantId: 'tenant-1',
    });
    (prisma.message.findMany as jest.Mock).mockResolvedValue([]);
    (aiService as any).provider = {
      classifyLead: jest.fn().mockRejectedValue(new Error('bad output')),
    };

    await expect(aiService.classifyLead('tenant-1', 'lead-1')).rejects.toBeInstanceOf(AppError);
  });

  it('settings PATCH requires admin via middleware', async () => {
    const req: any = { role: UserRole.STAFF };
    const res: any = {};
    const next = jest.fn();
    const guard = requireRole(UserRole.ADMIN);
    guard(req, res, next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(403);
  });

  it('uses fallback summary when API key missing', async () => {
    jest.resetModules();
    jest.doMock('../../config/aiEnv', () => ({
      loadAIEnv: () => ({ apiKey: undefined }),
    }));
    const prismaMock = require('../../utils/prisma');
    const { aiService: fallbackService } = require('../../services/ai.service');
    (prismaMock.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 0,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prismaMock.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 0, completionTokens: 0 } });
    (prismaMock.conversation.findFirst as jest.Mock).mockResolvedValue({
      id: 'conv-1',
      tenantId: 'tenant-1',
      lead: { id: 'lead-1', fullName: 'Lead' },
    });
    (prismaMock.message.findMany as jest.Mock).mockResolvedValue([]);

    const result = await fallbackService.summarizeConversation('tenant-1', 'conv-1');
    expect(result.summary).toBeTruthy();
  });

  it('draft reply respects daily token limit', async () => {
    (prisma.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 1,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prisma.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 3, completionTokens: 2 } });
    await expect(aiService.draftReply('tenant-1', 'conv-1')).rejects.toBeInstanceOf(AppError);
  });

  it('draft uses fallback without API key', async () => {
    jest.resetModules();
    jest.doMock('../../config/aiEnv', () => ({
      loadAIEnv: () => ({ apiKey: undefined }),
    }));
    const prismaMock = require('../../utils/prisma');
    const { aiService: fallbackService } = require('../../services/ai.service');
    (prismaMock.tenantAISettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      dailyTokenLimit: 0,
      defaultModel: 'gpt-4.1-mini',
      allowSummarize: true,
      allowDraftReply: true,
    });
    (prismaMock.aIUsageLog.aggregate as jest.Mock).mockResolvedValue({ _sum: { promptTokens: 0, completionTokens: 0 } });
    (prismaMock.conversation.findFirst as jest.Mock).mockResolvedValue({
      id: 'conv-1',
      tenantId: 'tenant-1',
      lead: { id: 'lead-1', fullName: 'Lead' },
    });
    (prismaMock.message.findMany as jest.Mock).mockResolvedValue([]);

    const result = await fallbackService.draftReply('tenant-1', 'conv-1', { goal: 'sales' });
    expect(result.replyText).toBeTruthy();
    expect(result.quickReplies?.length).toBeGreaterThan(0);
  });
});
