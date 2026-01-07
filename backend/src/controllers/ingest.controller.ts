import { Request, Response, NextFunction } from 'express';
import {
  Channel,
  ConversationState,
  IdentityProvider,
  LeadSource,
  MessageDirection,
  MessageProvider,
} from '@prisma/client';
import { leadService } from '../services/lead.service';
import { conversationService } from '../services/conversation.service';
import { AppError } from '../middleware/errorHandler';
import { eventService } from '../services/eventEmitter.service';

function parseTenantKeyMap(): Record<string, string> {
  const raw = process.env.INGEST_TENANT_KEYS || '';
  if (!raw) return {};
  return raw.split(',').reduce((acc, pair) => {
    const [key, tenant] = pair.split(':').map((s) => s.trim());
    if (key && tenant) {
      acc[key] = tenant;
    }
    return acc;
  }, {} as Record<string, string>);
}

function resolveTenantId(req: Request): string {
  const header = (req.headers['x-tenant-key'] as string) || '';
  const map = parseTenantKeyMap();
  const tenantId = map[header];
  if (!tenantId) {
    throw new AppError(401, 'Invalid tenant key for ingest');
  }
  return tenantId;
}

function mapChannel(platform?: string): Channel {
  const normalized = (platform || '').toUpperCase();
  switch (normalized) {
    case 'INSTAGRAM':
      return Channel.INSTAGRAM;
    case 'FACEBOOK':
      return Channel.FACEBOOK;
    case 'WHATSAPP':
      return Channel.WHATSAPP;
    case 'EMAIL':
      return Channel.EMAIL;
    case 'WEBSITE':
      return Channel.WEBSITE;
    default:
      return Channel.OTHER;
  }
}

function mapSource(platform?: string): LeadSource {
  const normalized = (platform || '').toUpperCase();
  switch (normalized) {
    case 'INSTAGRAM':
      return LeadSource.INSTAGRAM;
    case 'FACEBOOK':
      return LeadSource.FACEBOOK;
    case 'WHATSAPP':
      return LeadSource.WHATSAPP;
    case 'WEBSITE':
      return LeadSource.WEBSITE;
    default:
      return LeadSource.OTHER;
  }
}

export class IngestController {
  async ingestManyChat(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      const payload = req.body || {};
      const externalUserId =
        payload.user?.id || payload.subscriber?.id || payload.user?.user_id || payload.contact?.id;

      if (!externalUserId) {
        throw new AppError(400, 'Missing external user id');
      }

      const platform = payload.platform || payload.channel || 'WHATSAPP';
      const channel = mapChannel(platform);
      const source = mapSource(platform);

      const leadData = {
        fullName: payload.user?.name || payload.subscriber?.name || payload.contact?.name,
        email: payload.user?.email || payload.subscriber?.email || payload.contact?.email,
        phone: payload.user?.phone || payload.subscriber?.phone || payload.contact?.phone,
        locale: payload.user?.locale || payload.subscriber?.locale,
        source,
      };

      const { lead, isNew } = await leadService.upsertLeadByIdentity({
        tenantId,
        provider: IdentityProvider.MANYCHAT,
        externalUserId: String(externalUserId),
        externalThreadId: payload.conversation_id || payload.thread_id || null,
        leadData,
      });

      if (isNew) {
        await eventService.emitEvent(tenantId, 'lead.created', { leadId: lead.id });
      } else {
        await eventService.emitEvent(tenantId, 'lead.updated', { leadId: lead.id });
      }

      const { conversation } = await conversationService.findOrCreateConversation({
        tenantId,
        leadId: lead.id,
        channel,
        initialState: ConversationState.BOT_ACTIVE,
      });

      const text =
        payload.message?.text ||
        payload.message?.content ||
        payload.text ||
        payload.content ||
        payload.last_input ||
        null;

      await conversationService.addMessage({
        tenantId,
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        text,
        rawPayload: payload,
        provider: MessageProvider.MANYCHAT,
      });

      await leadService.markEngagedIfNew(tenantId, lead);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async ingestWebsite(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      const { fullName, email, phone, message, locale } = req.body;

      const { lead, isNew } = await leadService.upsertLeadFromContact(tenantId, {
        fullName,
        email,
        phone,
        locale,
        source: LeadSource.WEBSITE,
      });

      if (isNew) {
        await eventService.emitEvent(tenantId, 'lead.created', { leadId: lead.id });
      } else {
        await eventService.emitEvent(tenantId, 'lead.updated', { leadId: lead.id });
      }

      const { conversation } = await conversationService.findOrCreateConversation({
        tenantId,
        leadId: lead.id,
        channel: Channel.WEBSITE,
        initialState: ConversationState.OPEN,
      });

      await conversationService.addMessage({
        tenantId,
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        text: message || null,
        rawPayload: req.body,
        provider: MessageProvider.SYSTEM,
      });

      await leadService.markEngagedIfNew(tenantId, lead);

      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const ingestController = new IngestController();

