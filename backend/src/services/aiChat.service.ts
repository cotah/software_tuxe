import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';
import { OpenAIChatProvider } from './ai/provider';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  context?: {
    app?: string;
    userId?: string;
    tenantId?: string;
  };
};

class AIChatService {
  private provider: OpenAIChatProvider | null = null;

  private getProvider() {
    const apiKey = process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }
    if (!this.provider) {
      this.provider = new OpenAIChatProvider(apiKey, process.env.OPENAI_BASE_URL);
    }
    return this.provider;
  }

  async generateReply(tenantId: string, input: ChatRequest) {
    const settings = await prisma.tenantAISettings.findUnique({ where: { tenantId } });
    const providerName = settings?.provider || 'openai';
    if (settings && settings.enabled === false) {
      throw new AppError(403, 'AI is disabled');
    }
    if (providerName !== 'openai') {
      throw new AppError(503, 'AI provider not configured');
    }

    const provider = this.getProvider();
    if (!provider) {
      throw new AppError(503, 'AI not configured');
    }

    const model =
      settings?.defaultModel ||
      process.env.AI_MODEL ||
      process.env.DEFAULT_AI_MODEL ||
      'gpt-4.1-mini';
    const temperature = typeof settings?.temperature === 'number' ? settings.temperature : 0.2;
    const result = await provider.generateChatCompletion({
      messages: input.messages,
      model,
      temperature,
    });

    const reply = (result.content || '').trim();
    if (!reply) {
      logger.warn('AI chat returned empty response', { tenantId });
      throw new AppError(502, 'AI response empty');
    }

    return {
      reply,
      usage: result.usage,
      model,
    };
  }
}

export const aiChatService = new AIChatService();
