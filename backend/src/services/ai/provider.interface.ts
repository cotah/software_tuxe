import { Lead, Message } from '@prisma/client';

export type LeadClassificationResult = {
  temperature: 'HOT' | 'WARM' | 'COLD';
  intent: string;
  confidence: number;
  notes?: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
};

export type ConversationSummaryResult = {
  summary: string;
  nextActions: string[];
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
  model?: string;
};

export type DraftReplyResult = {
  replyText: string;
  quickReplies?: string[];
  reasoningTags?: string[];
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
  model?: string;
};

export interface IAIProvider {
  classifyLead(input: {
    lead: Lead;
    messages: Pick<Message, 'direction' | 'text' | 'createdAt'>[];
    model: string;
    temperature: number;
    locale?: string;
  }): Promise<LeadClassificationResult>;

  summarizeConversation(input: {
    lead: Lead;
    messages: Pick<Message, 'direction' | 'text' | 'createdAt'>[];
    model: string;
    temperature: number;
    locale?: string;
    style?: 'short' | 'medium' | 'detailed' | string;
  }): Promise<ConversationSummaryResult>;

  draftReply(input: {
    lead: Lead;
    messages: Pick<Message, 'direction' | 'text' | 'createdAt'>[];
    model: string;
    temperature: number;
    locale?: string;
    goal?: string;
    tone?: string;
  }): Promise<DraftReplyResult>;
}
