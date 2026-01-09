import { LeadTemperature, AIUsageType } from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { IAIProvider, LeadClassificationResult, ConversationSummaryResult, DraftReplyResult } from './ai/provider.interface';
import { OpenAIProvider } from './ai/openai.provider';
import { loadAIEnv } from '../config/aiEnv';
import { eventService } from './eventEmitter.service';

type UsageMeta = {
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
};

class AIService {
  private provider: IAIProvider | null = null;

  private async fetchSettings(tenantId: string) {
    const env = loadAIEnv();
    let record = await prisma.tenantAISettings.findUnique({ where: { tenantId } });
    if (!record) {
      try {
        record = await prisma.tenantAISettings.create({
          data: {
            tenantId,
            enabled: false,
            dailyTokenLimit: 0,
            defaultModel: env.defaultModel || 'gpt-4.1-mini',
            provider: 'openai',
            temperature: 0.2,
            style: 'calm',
            allowSummarize: true,
            allowDraftReply: true,
          },
        });
      } catch {
        record = null;
      }
    }

    const created =
      record ||
      ({
        tenantId,
        enabled: false,
        dailyTokenLimit: 0,
        defaultModel: env.defaultModel || 'gpt-4.1-mini',
        provider: 'openai',
        temperature: 0.2,
        style: 'calm',
        allowSummarize: true,
        allowDraftReply: true,
      } as any);

    const normalized = {
      enabled: (created as any).enabled ?? (created as any).enableAI ?? false,
      dailyTokenLimit: (created as any).dailyTokenLimit ?? (created as any).aiDailyLimit ?? 0,
      defaultModel: (created as any).defaultModel ?? (created as any).aiModel ?? env.defaultModel ?? 'gpt-4.1-mini',
      provider: (created as any).provider ?? 'openai',
      temperature: typeof (created as any).temperature === 'number' ? (created as any).temperature : 0.2,
      style: (created as any).style ?? 'calm',
      allowSummarize: (created as any).allowSummarize ?? true,
      allowDraftReply: (created as any).allowDraftReply ?? true,
    };

    return { settings: normalized, raw: created, env };
  }

  private getProvider(envApiKey?: string, baseUrl?: string) {
    if (!envApiKey) {
      return null;
    }
    if (this.provider) return this.provider;
    this.provider = new OpenAIProvider(envApiKey, baseUrl);
    return this.provider;
  }

  private async assertAIEnabled(tenantId: string) {
    const { settings, env, raw } = await this.fetchSettings(tenantId);
    if (!settings.enabled) {
      throw new AppError(403, 'AI is disabled for this tenant');
    }
    return { settings, env, raw };
  }

  private async checkDailyTokens(tenantId: string, limit: number) {
    if (!limit || limit <= 0) return;
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const sum = await prisma.aIUsageLog.aggregate({
      _sum: { promptTokens: true, completionTokens: true },
      where: { tenantId, createdAt: { gte: start } },
    });
    const used = Number(sum?._sum?.promptTokens || 0) + Number(sum?._sum?.completionTokens || 0);
    if (used >= limit) {
      throw new AppError(429, 'AI daily token limit reached');
    }
  }

  private async logUsage(params: {
    tenantId: string;
    type: AIUsageType;
    model: string;
    userId?: string;
    leadId?: string;
    conversationId?: string;
    meta?: UsageMeta;
    success: boolean;
    errorMessage?: string | null;
  }) {
    const { tenantId, type, model, leadId, conversationId, meta, success, errorMessage, userId } = params;
    await prisma.aIUsageLog.create({
      data: {
        tenantId,
        userId: userId || null,
        leadId: leadId || null,
        conversationId: conversationId || null,
        usageType: type,
        model,
        promptTokens: meta?.promptTokens || 0,
        completionTokens: meta?.completionTokens || 0,
        totalTokens: (meta?.promptTokens || 0) + (meta?.completionTokens || 0),
        cost: meta?.estimatedCost || 0,
        success,
        errorMessage: errorMessage || null,
      },
    });
  }

  private mapTemperature(temp: string): LeadTemperature {
    if (temp === 'HOT' || temp === 'WARM' || temp === 'COLD') {
      return temp as LeadTemperature;
    }
    return 'COLD';
  }

  private buildFallbackSummary(locale?: string, messages?: { direction: string; text: string | null }[]) {
    const snippet = messages
      ?.slice(0, 3)
      .map((m) => `${m.direction}: ${m.text || '(sem texto)'}`)
      .join(' | ');
    const base =
      locale === 'en-US'
        ? 'Recent conversation summarized: lead reached out and is awaiting follow-up.'
        : locale === 'es-ES'
          ? 'Resumen: el lead se puso en contacto y espera una respuesta.'
          : 'Resumo: o lead entrou em contato e aguarda retorno.';
    return snippet ? `${base} Trechos: ${snippet}` : base;
  }

  private async fetchRecentMessages(tenantId: string, leadId: string, take = 10) {
    return prisma.message.findMany({
      where: {
        tenantId,
        conversation: { leadId },
      },
      select: { direction: true, text: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async classifyLead(tenantId: string, leadId: string) {
    const { settings, env } = await this.assertAIEnabled(tenantId);
    await this.checkDailyTokens(tenantId, settings.dailyTokenLimit);
    const provider = this.getProvider(env.apiKey, env.baseUrl);
    if (!provider) throw new AppError(503, 'AI provider unavailable');

    const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead) throw new AppError(404, 'Lead not found');

    const messages = await this.fetchRecentMessages(tenantId, leadId);

    let result: LeadClassificationResult;
    try {
      result = await provider.classifyLead({
        lead,
        messages,
        model: settings.defaultModel || env.defaultModel || 'gpt-4.1-mini',
        temperature: settings.temperature ?? 0.2,
      });
    } catch (error: any) {
      await this.logUsage({
        tenantId,
        type: AIUsageType.LEAD_CLASSIFICATION,
        model: settings.defaultModel,
        leadId,
        success: false,
        meta: {},
        errorMessage: error?.message || 'AI classification failed',
      });
      throw new AppError(502, 'AI classification failed');
    }

    const mappedTemperature = this.mapTemperature(result.temperature);
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiIntent: result.intent,
        aiConfidence: result.confidence,
        aiTemperature: mappedTemperature,
        aiLastClassifiedAt: new Date(),
        aiNotes: result.notes ? { note: result.notes } : undefined,
      },
    });

    await this.logUsage({
      tenantId,
      type: AIUsageType.LEAD_CLASSIFICATION,
      model: settings.defaultModel,
      leadId,
      success: true,
      meta: result,
    });

    await eventService.emitEvent(tenantId, 'lead.ai_classified', {
      leadId,
      temperature: mappedTemperature,
      intent: result.intent,
      confidence: result.confidence,
    });

    return result;
  }

  async summarizeConversation(
    tenantId: string,
    conversationId: string,
    options?: { style?: string; locale?: string; userId?: string }
  ) {
    const { settings, env } = await this.assertAIEnabled(tenantId);
    if (!settings.allowSummarize) throw new AppError(403, 'AI summarize not allowed for this tenant');
    await this.checkDailyTokens(tenantId, settings.dailyTokenLimit);
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { lead: true },
    });
    if (!conversation) throw new AppError(404, 'Conversation not found');

    const messages = await prisma.message.findMany({
      where: { tenantId, conversationId },
      select: { direction: true, text: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const provider = this.getProvider(env.apiKey, env.baseUrl);
    if (!provider && !env.apiKey) {
      const fallback = {
        summary: this.buildFallbackSummary(options?.locale, messages),
        nextActions: ['Responder ao lead', 'Registrar no CRM'],
        promptTokens: 0,
        completionTokens: 0,
        estimatedCost: 0,
        model: settings.defaultModel,
      };
      await this.logUsage({
        tenantId,
        type: AIUsageType.CONVERSATION_SUMMARY,
        model: settings.defaultModel,
        conversationId,
        userId: options?.userId,
        success: true,
        meta: fallback,
      });
      return fallback;
    }
    if (!provider) throw new AppError(503, 'AI provider unavailable');

    let result: ConversationSummaryResult;
    try {
      result = await provider.summarizeConversation({
        lead: conversation.lead,
        messages,
        model: settings.defaultModel || env.defaultModel || 'gpt-4.1-mini',
        temperature: settings.temperature ?? 0.2,
        locale: options?.locale || 'pt-BR',
        style: options?.style || 'short',
      });
    } catch (error: any) {
      await this.logUsage({
        tenantId,
        type: AIUsageType.CONVERSATION_SUMMARY,
        model: settings.defaultModel,
        conversationId,
        userId: options?.userId,
        success: false,
        meta: {},
        errorMessage: error?.message || 'AI summary failed',
      });
      throw new AppError(502, 'AI summary failed');
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        aiSummary: result.summary,
        aiSuggestedNextActions: JSON.stringify(result.nextActions || []),
        aiLastSummarizedAt: new Date(),
      },
    });

    await this.logUsage({
      tenantId,
      type: AIUsageType.CONVERSATION_SUMMARY,
      model: settings.defaultModel,
      conversationId,
      userId: options?.userId,
      success: true,
      meta: result,
    });

    await eventService.emitEvent(tenantId, 'conversation.ai_summarized', {
      conversationId,
      summary: result.summary,
      nextActions: result.nextActions,
    });

    return result;
  }

  async draftReply(
    tenantId: string,
    conversationId: string,
    options?: { goal?: string; tone?: string; locale?: string; userId?: string }
  ) {
    const { settings, env } = await this.assertAIEnabled(tenantId);
    if (!settings.allowDraftReply) throw new AppError(403, 'AI draft not allowed for this tenant');
    await this.checkDailyTokens(tenantId, settings.dailyTokenLimit);

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { lead: true },
    });
    if (!conversation) throw new AppError(404, 'Conversation not found');

    const messages = await prisma.message.findMany({
      where: { tenantId, conversationId },
      select: { direction: true, text: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const provider = this.getProvider(env.apiKey, env.baseUrl);
    if (!provider && !env.apiKey) {
      const fallback = {
        replyText: this.buildFallbackReply(options),
        quickReplies: ['Obrigado!', 'Poderia me contar mais?', 'Vamos marcar um horário?'],
        reasoningTags: [options?.goal || 'generic'],
      };
      await this.logUsage({
        tenantId,
        type: AIUsageType.DRAFT_REPLY,
        model: settings.defaultModel,
        conversationId,
        userId: options?.userId,
        success: true,
        meta: { promptTokens: 0, completionTokens: 0, estimatedCost: 0 },
      });
      return fallback;
    }
    if (!provider) throw new AppError(503, 'AI provider unavailable');

    let result: DraftReplyResult;
    try {
      result = await provider.draftReply({
        lead: conversation.lead,
        messages,
        model: settings.defaultModel || env.defaultModel || 'gpt-4.1-mini',
        temperature: settings.temperature ?? 0.2,
        locale: options?.locale || 'pt-BR',
        goal: options?.goal || 'generic',
        tone: options?.tone || 'neutral',
      });
    } catch (error) {
      await this.logUsage({
        tenantId,
        type: AIUsageType.DRAFT_REPLY,
        model: settings.defaultModel,
        conversationId,
        userId: options?.userId,
        success: false,
        meta: {},
        errorMessage: (error && (error as any).message) || 'AI draft failed',
      });
      throw new AppError(502, 'AI draft failed');
    }

    await this.logUsage({
      tenantId,
      type: AIUsageType.DRAFT_REPLY,
      model: settings.defaultModel,
      conversationId,
      userId: options?.userId,
      success: true,
      meta: result,
    });

    return result;
  }

  private buildFallbackReply(options?: { goal?: string; tone?: string; locale?: string }) {
    const tone = options?.tone || 'neutral';
    const goal = options?.goal || 'generic';
    const locale = options?.locale || 'pt-BR';
    const base =
      locale === 'en-US'
        ? 'Thanks for reaching out. I will help you with your request.'
        : locale === 'es-ES'
          ? 'Gracias por contactarnos. Te ayudaré con tu solicitud.'
          : 'Obrigado pelo contato. Vou te ajudar com sua solicitação.';
    return `${base} (goal: ${goal}, tone: ${tone})`;
  }

  async getSettings(tenantId: string) {
    const { settings } = await this.fetchSettings(tenantId);
    return settings;
  }

  async updateSettings(
    tenantId: string,
    data: Partial<{
      enabled: boolean;
      dailyTokenLimit: number;
      defaultModel: string;
      provider: string;
      temperature: number;
      style: string;
      allowSummarize: boolean;
      allowDraftReply: boolean;
    }>
  ) {
    const existing = await this.fetchSettings(tenantId);
    return prisma.tenantAISettings.upsert({
      where: { tenantId },
      update: {
        enabled: data.enabled ?? existing.settings.enabled,
        dailyTokenLimit: data.dailyTokenLimit ?? existing.settings.dailyTokenLimit,
        defaultModel: data.defaultModel ?? existing.settings.defaultModel,
        provider: data.provider ?? (existing.settings as any).provider ?? 'openai',
        temperature: data.temperature ?? (existing.settings as any).temperature ?? 0.2,
        style: data.style ?? (existing.settings as any).style ?? 'calm',
        allowSummarize: data.allowSummarize ?? existing.settings.allowSummarize,
        allowDraftReply: data.allowDraftReply ?? existing.settings.allowDraftReply,
      },
      create: {
        tenantId,
        enabled: data.enabled ?? existing.settings.enabled,
        dailyTokenLimit: data.dailyTokenLimit ?? existing.settings.dailyTokenLimit,
        defaultModel: data.defaultModel ?? existing.settings.defaultModel,
        provider: data.provider ?? (existing.settings as any).provider ?? 'openai',
        temperature: data.temperature ?? (existing.settings as any).temperature ?? 0.2,
        style: data.style ?? (existing.settings as any).style ?? 'calm',
        allowSummarize: data.allowSummarize ?? existing.settings.allowSummarize,
        allowDraftReply: data.allowDraftReply ?? existing.settings.allowDraftReply,
      },
    });
  }
}

export const aiService = new AIService();

