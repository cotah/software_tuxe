import {
  Channel,
  Conversation,
  ConversationState,
  MessageDirection,
  MessageProvider,
} from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { leadService } from './lead.service';
import { eventService } from './eventEmitter.service';

export class ConversationService {
  async findOrCreateConversation(params: {
    tenantId: string;
    leadId: string;
    channel: Channel;
    initialState?: ConversationState;
    assignedUserId?: string | null;
  }): Promise<{ conversation: Conversation; isNew: boolean }> {
    const { tenantId, leadId, channel, initialState, assignedUserId } = params;
    const existing = await prisma.conversation.findFirst({
      where: {
        tenantId,
        leadId,
        channel,
        state: { not: ConversationState.CLOSED },
      },
    });

    if (existing) {
      return { conversation: existing, isNew: false };
    }

    const conversation = await prisma.conversation.create({
      data: {
        tenantId,
        leadId,
        channel,
        state: initialState || ConversationState.OPEN,
        assignedUserId: assignedUserId || null,
      },
    });

    await eventService.emitEvent(tenantId, 'conversation.created', {
      conversationId: conversation.id,
      leadId,
      channel,
    });

    return { conversation, isNew: true };
  }

  async addMessage(params: {
    tenantId: string;
    conversationId: string;
    direction: MessageDirection;
    text?: string | null;
    rawPayload?: any;
    provider: MessageProvider;
  }) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: params.conversationId, tenantId: params.tenantId },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const message = await prisma.message.create({
      data: {
        tenantId: params.tenantId,
        conversationId: params.conversationId,
        direction: params.direction,
        text: params.text || null,
        rawPayload: params.rawPayload as any,
        provider: params.provider,
      },
    });

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { lastMessageAt: new Date() },
    });

    await leadService.recordInteraction(params.tenantId, conversation.leadId, new Date());

    await eventService.emitEvent(
      params.tenantId,
      `message.${params.direction === MessageDirection.INBOUND ? 'inbound' : 'outbound'}`,
      {
        conversationId: params.conversationId,
        leadId: conversation.leadId,
        messageId: message.id,
      }
    );

    return message;
  }

  async listConversations(tenantId: string, filters: any = {}) {
    const where: any = { tenantId };
    if (filters.state) where.state = filters.state;
    if (filters.channel) where.channel = filters.channel;
    if (filters.leadId) where.leadId = filters.leadId;

    return prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversation(tenantId: string, id: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { tenantId, id },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    return conversation;
  }

  async listMessages(tenantId: string, conversationId: string) {
    await this.getConversation(tenantId, conversationId);
    return prisma.message.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async escalateToHuman(tenantId: string, conversationId: string) {
    const conversation = await this.getConversation(tenantId, conversationId);
    if (conversation.state === ConversationState.HUMAN_REQUIRED) {
      return conversation;
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { state: ConversationState.HUMAN_REQUIRED },
    });

    await leadService.changeStatus({
      tenantId,
      leadId: conversation.leadId,
      toStatus: 'WAITING_HUMAN',
      reason: 'Escalated to human',
    });

    return updated;
  }

  async closeConversation(tenantId: string, conversationId: string) {
    await this.getConversation(tenantId, conversationId);
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { state: ConversationState.CLOSED },
    });
  }
}

export const conversationService = new ConversationService();
