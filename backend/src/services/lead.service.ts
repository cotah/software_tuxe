import {
  Channel,
  ConversationState,
  IdentityProvider,
  Lead,
  LeadSource,
  LeadStatus,
  LeadTemperature,
  MessageDirection,
  MessageProvider,
} from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { eventService } from './eventEmitter.service';

type LeadUpsertInput = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  locale?: string | null;
  source?: LeadSource;
  tags?: string[];
  metadata?: any;
};

export class LeadService {
  private async findLeadByContact(tenantId: string, email?: string | null, phone?: string | null) {
    if (email) {
      const lead = await prisma.lead.findFirst({ where: { tenantId, email } });
      if (lead) return lead;
    }
    if (phone) {
      const lead = await prisma.lead.findFirst({ where: { tenantId, phone } });
      if (lead) return lead;
    }
    return null;
  }

  private async ensureLeadIdentity(
    tenantId: string,
    leadId: string,
    provider: IdentityProvider,
    externalUserId: string,
    externalThreadId?: string | null
  ) {
    const existing = await prisma.leadIdentity.findFirst({
      where: { tenantId, provider, externalUserId },
    });

    if (existing) {
      return existing;
    }

    return prisma.leadIdentity.create({
      data: {
        tenantId,
        leadId,
        provider,
        externalUserId,
        externalThreadId: externalThreadId || null,
      },
    });
  }

  private async createStatusHistory(
    tenantId: string,
    leadId: string,
    toStatus: LeadStatus,
    fromStatus?: LeadStatus | null,
    reason?: string
  ) {
    await prisma.leadStatusHistory.create({
      data: {
        tenantId,
        leadId,
        fromStatus: fromStatus ?? null,
        toStatus,
        reason: reason || null,
      },
    });
  }

  async upsertLeadByIdentity(params: {
    tenantId: string;
    provider: IdentityProvider;
    externalUserId: string;
    externalThreadId?: string | null;
    leadData?: LeadUpsertInput;
  }): Promise<{ lead: Lead; isNew: boolean }> {
    const { tenantId, provider, externalUserId, externalThreadId, leadData } = params;

    const existingIdentity = await prisma.leadIdentity.findFirst({
      where: { tenantId, provider, externalUserId },
      include: { lead: true },
    });

    if (existingIdentity?.lead) {
      if (existingIdentity.externalThreadId !== externalThreadId && externalThreadId) {
        await prisma.leadIdentity.update({
          where: { id: existingIdentity.id },
          data: { externalThreadId },
        });
      }
      return { lead: existingIdentity.lead, isNew: false };
    }

    const dedupLead = await this.findLeadByContact(tenantId, leadData?.email, leadData?.phone);

    const lead =
      dedupLead ||
      (await prisma.lead.create({
        data: {
          tenantId,
          fullName: leadData?.fullName || null,
          email: leadData?.email || null,
          phone: leadData?.phone || null,
          locale: leadData?.locale || null,
          source: leadData?.source || LeadSource.OTHER,
          tags: leadData?.tags || [],
          metadata: leadData?.metadata as any,
          status: LeadStatus.NEW,
        },
      }));

    if (!dedupLead) {
      await this.createStatusHistory(tenantId, lead.id, LeadStatus.NEW, null, 'Created from identity ingest');
    }

    await this.ensureLeadIdentity(tenantId, lead.id, provider, externalUserId, externalThreadId);

    return { lead, isNew: !dedupLead };
  }

  async upsertLeadFromContact(
    tenantId: string,
    input: LeadUpsertInput
  ): Promise<{ lead: Lead; isNew: boolean }> {
    const existing = await this.findLeadByContact(tenantId, input.email, input.phone);
    if (existing) {
      return { lead: existing, isNew: false };
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        fullName: input.fullName || null,
        email: input.email || null,
        phone: input.phone || null,
        locale: input.locale || null,
        source: input.source || LeadSource.OTHER,
        tags: input.tags || [],
        metadata: input.metadata as any,
      },
    });

    await this.createStatusHistory(tenantId, lead.id, LeadStatus.NEW, null, 'Created from contact ingest');

    return { lead, isNew: true };
  }

  async listLeads(tenantId: string, filters: any = {}) {
    const where: any = { tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.temperature) where.temperature = filters.temperature;
    if (filters.source) where.source = filters.source;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLead(tenantId: string, id: string) {
    const lead = await prisma.lead.findFirst({
      where: { tenantId, id },
    });
    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }
    return lead;
  }

  async updateLead(tenantId: string, id: string, data: Partial<Lead>) {
    const lead = await this.getLead(tenantId, id);
    if (data.status && data.status !== lead.status) {
      return this.changeStatus({
        tenantId,
        leadId: id,
        toStatus: data.status as LeadStatus,
      });
    }
    return prisma.lead.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        locale: data.locale ?? undefined,
        status: data.status ?? undefined,
        temperature: data.temperature ?? undefined,
        source: data.source ?? undefined,
        tags: data.tags as any,
        metadata: data.metadata as any,
      },
    });
  }

  async changeStatus(params: {
    tenantId: string;
    leadId: string;
    toStatus: LeadStatus;
    reason?: string;
    changedByUserId?: string;
  }) {
    const { tenantId, leadId, toStatus, reason, changedByUserId } = params;
    const lead = await this.getLead(tenantId, leadId);
    if (lead.status === toStatus) {
      return lead;
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: toStatus },
    });

    await prisma.leadStatusHistory.create({
      data: {
        tenantId,
        leadId,
        fromStatus: lead.status,
        toStatus,
        changedByUserId: changedByUserId || null,
        reason: reason || null,
      },
    });

    await eventService.emitEvent(tenantId, 'lead.status_changed', {
      leadId,
      from: lead.status,
      to: toStatus,
      reason,
    });

    if (toStatus === LeadStatus.QUALIFIED) {
      await eventService.emitEvent(tenantId, 'lead.qualified', { leadId });
    }

    if (toStatus === LeadStatus.WAITING_HUMAN) {
      await eventService.emitEvent(tenantId, 'lead.escalated_to_human', { leadId });
    }

    return updated;
  }

  async markEngagedIfNew(tenantId: string, lead: Lead) {
    if (lead.status !== LeadStatus.NEW) {
      return lead;
    }

    const updated = await this.changeStatus({
      tenantId,
      leadId: lead.id,
      toStatus: LeadStatus.ENGAGED,
      reason: 'Inbound message',
    });

    await eventService.emitEvent(tenantId, 'lead.updated', { leadId: lead.id });
    return updated;
  }

  async recordInteraction(tenantId: string, leadId: string, date: Date) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastInteractionAt: date },
    });
  }
}

export const leadService = new LeadService();
