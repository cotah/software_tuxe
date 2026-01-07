import { webhookService } from './webhook.service';

export const EVENT_TYPES = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_STATUS_CHANGED: 'lead.status_changed',
  LEAD_QUALIFIED: 'lead.qualified',
  LEAD_ESCALATED: 'lead.escalated_to_human',
  LEAD_AI_CLASSIFIED: 'lead.ai_classified',
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_AI_SUMMARIZED: 'conversation.ai_summarized',
  MESSAGE_INBOUND: 'message.inbound',
  MESSAGE_OUTBOUND: 'message.outbound',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES] | string;

export class EventService {
  async emitEvent(tenantId: string, event: EventType, data: any) {
    const payload = {
      id: `evt_${Date.now()}`,
      event,
      tenantId,
      occurredAt: new Date().toISOString(),
      data,
    };

    await webhookService.enqueueEvent(tenantId, event, payload);
    return payload;
  }
}

export const eventService = new EventService();
