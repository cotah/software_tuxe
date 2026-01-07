import { leadService } from '../../services/lead.service';
import { webhookService } from '../../services/webhook.service';
import prisma from '../../utils/prisma';
import { LeadStatus } from '@prisma/client';
import crypto from 'crypto';

jest.mock('../../utils/prisma', () => ({
  leadIdentity: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  lead: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  leadStatusHistory: {
    create: jest.fn(),
  },
}));

jest.mock('../../services/eventEmitter.service', () => ({
  eventService: {
    emitEvent: jest.fn(),
  },
}));

describe('LeadService dedupe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reuses existing lead by identity', async () => {
    const existingLead = { id: 'lead-1', tenantId: 'tenant-1', status: LeadStatus.NEW };
    (prisma.leadIdentity.findFirst as jest.Mock).mockResolvedValue({ lead: existingLead });

    const result = await leadService.upsertLeadByIdentity({
      tenantId: 'tenant-1',
      provider: 'MANYCHAT' as any,
      externalUserId: 'ext-1',
    });

    expect(result.lead.id).toBe(existingLead.id);
    expect(result.isNew).toBe(false);
    expect(prisma.leadIdentity.create).not.toHaveBeenCalled();
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });
});

describe('Webhook signature', () => {
  it('matches HMAC-SHA256 output', () => {
    const payload = JSON.stringify({ hello: 'world' });
    const secret = 'super-secret';
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const signature = webhookService.computeSignature(secret, payload);
    expect(signature).toBe(expected);
  });
});

describe('Lead status history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates history entry on status change', async () => {
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      tenantId: 'tenant-1',
      status: LeadStatus.NEW,
    });
    (prisma.lead.update as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      tenantId: 'tenant-1',
      status: LeadStatus.QUALIFIED,
    });

    await leadService.changeStatus({
      tenantId: 'tenant-1',
      leadId: 'lead-1',
      toStatus: LeadStatus.QUALIFIED,
      reason: 'Test',
    });

    expect(prisma.leadStatusHistory.create).toHaveBeenCalled();
  });
});

