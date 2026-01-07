import {
  Prisma,
  PrismaClient,
  BusinessType,
  UserRole,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  AppointmentStatus,
  LeadStatus,
  LeadSource,
  IdentityProvider,
  Channel,
  ConversationState,
  MessageDirection,
  MessageProvider,
} from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';
import { encrypt } from '../utils/encryption';

const prisma = new PrismaClient();

async function ensureWorkflow(businessType: BusinessType) {
  const existing = await prisma.workflow.findFirst({
    where: {
      businessType,
      entityType: 'ORDER',
      isSystem: true,
    },
  });

  if (existing) {
    return existing;
  }

  const statuses = [
    {
      name: 'PENDING',
      label: 'Pendente',
      color: '#fbbf24',
      transitions: ['CONFIRMED', 'CANCELLED'],
    },
    {
      name: 'CONFIRMED',
      label: 'Confirmado',
      color: '#3b82f6',
      transitions: ['PREPARING', 'CANCELLED'],
    },
    {
      name: 'PREPARING',
      label: 'Preparando',
      color: '#8b5cf6',
      transitions: ['READY', 'CANCELLED'],
    },
    {
      name: 'READY',
      label: 'Pronto',
      color: '#10b981',
      transitions: ['DELIVERED', 'COMPLETED'],
    },
    {
      name: 'DELIVERED',
      label: 'Entregue',
      color: '#059669',
      transitions: [],
      isTerminal: true,
    },
    {
      name: 'COMPLETED',
      label: 'Concluido',
      color: '#059669',
      transitions: [],
      isTerminal: true,
    },
    {
      name: 'CANCELLED',
      label: 'Cancelado',
      color: '#ef4444',
      transitions: [],
      isTerminal: true,
    },
  ];

  return prisma.workflow.create({
    data: {
      name: `Default ORDER Workflow - ${businessType}`,
      businessType,
      entityType: 'ORDER',
      statuses: statuses as Prisma.JsonArray,
      defaultStatus: 'PENDING',
      isSystem: true,
    },
  });
}

async function main() {
  const company =
    (await prisma.company.findFirst({
      where: { name: 'BTRIX Demo Company' },
    })) ||
    (await prisma.company.create({
      data: {
        name: 'BTRIX Demo Company',
        businessType: BusinessType.RESTAURANT,
        email: 'admin@btrix.com',
        phone: '+55 11 99999-9999',
        address: 'Demo Street, 123',
        locale: 'pt-BR',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        settings: {
          orderPrefix: 'ORD',
        },
      },
    }));

  const workflow = await ensureWorkflow(company.businessType);

  const passwordAdmin = await hashPassword('admin123');
  const passwordStaff = await hashPassword('staff123');
  const passwordKitchen = await hashPassword('kitchen123');

  const adminUser =
    (await prisma.user.findUnique({ where: { email: 'admin@btrix.com' } })) ||
    (await prisma.user.create({
      data: {
        email: 'admin@btrix.com',
        password: passwordAdmin,
        name: 'Admin User',
        role: UserRole.ADMIN,
        companyId: company.id,
        isActive: true,
      },
    }));

  const staffUser =
    (await prisma.user.findUnique({ where: { email: 'staff@btrix.com' } })) ||
    (await prisma.user.create({
      data: {
        email: 'staff@btrix.com',
        password: passwordStaff,
        name: 'Staff User',
        role: UserRole.STAFF,
        companyId: company.id,
        isActive: true,
      },
    }));

  const kitchenUser =
    (await prisma.user.findUnique({ where: { email: 'kitchen@btrix.com' } })) ||
    (await prisma.user.create({
      data: {
        email: 'kitchen@btrix.com',
        password: passwordKitchen,
        name: 'Kitchen User',
        role: UserRole.KITCHEN,
        companyId: company.id,
        isActive: true,
      },
    }));

  const [service1, service2, service3] = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        companyId: company.id,
        name: 'Consulta',
        description: 'Serviço padrão',
        price: new Prisma.Decimal(150),
        duration: 60,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        companyId: company.id,
        name: 'Serviço Expresso',
        description: 'Entrega rápida',
        price: new Prisma.Decimal(75),
        duration: 30,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        companyId: company.id,
        name: 'Revisão Completa',
        description: 'Revisão e checklist',
        price: new Prisma.Decimal(250),
        duration: 90,
      },
    }),
  ]);

  const product =
    (await prisma.product.findFirst({
      where: { companyId: company.id, name: 'Item de Estoque' },
    })) ||
    (await prisma.product.create({
      data: {
        companyId: company.id,
        name: 'Item de Estoque',
        sku: 'SKU-001',
        description: 'Item demo para estoque',
      },
    }));

  await prisma.inventoryItem.upsert({
    where: {
      productId_companyId: {
        productId: product.id,
        companyId: company.id,
      },
    },
    update: {
      quantity: 25,
      minStock: 5,
      unit: 'unit',
    },
    create: {
      companyId: company.id,
      productId: product.id,
      quantity: 25,
      minStock: 5,
      unit: 'unit',
    },
  });

  const orderNumber = 'ORD-000001';
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!existingOrder) {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        companyId: company.id,
        totalAmount: new Prisma.Decimal(225),
        customerName: 'Cliente Demo',
        customerEmail: 'cliente@demo.com',
        status: workflow.defaultStatus as OrderStatus,
        workflowId: workflow.id,
        assignedTo: staffUser.id,
        items: {
          create: [
            {
              serviceId: service1.id,
              quantity: 1,
              price: new Prisma.Decimal(150),
            },
            {
              serviceId: service2.id,
              quantity: 1,
              price: new Prisma.Decimal(75),
            },
          ],
        },
        statusHistory: {
          create: {
            status: workflow.defaultStatus,
          },
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        companyId: company.id,
        amount: new Prisma.Decimal(225),
        method: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        metadata: { seed: true },
      },
    });
  }

  await prisma.roster.upsert({
    where: { id: 'roster-demo' },
    update: {},
    create: {
      id: 'roster-demo',
      companyId: company.id,
      userId: staffUser.id,
      date: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      notes: 'Plantão inicial',
    },
  });

  await prisma.schedule.upsert({
    where: { id: 'schedule-demo' },
    update: {},
    create: {
      id: 'schedule-demo',
      companyId: company.id,
      title: 'Reunião de Kickoff',
      description: 'Configuração inicial do ambiente',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      type: 'MEETING',
      status: 'scheduled',
      customerName: 'Time BTRIX',
    },
  });

  await prisma.tenantCalendarSettings.upsert({
    where: { tenantId: company.id },
    update: {
      defaultTimezone: 'Europe/Dublin',
      preventOverbooking: false,
    },
    create: {
      tenantId: company.id,
      defaultTimezone: 'Europe/Dublin',
      preventOverbooking: false,
    },
  });

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 11, 0, 0));
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEnd = new Date(todayEnd.getTime() + 24 * 60 * 60 * 1000);
  const nextWeekStart = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekEnd = new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

  const appointmentsSeed = [
    {
      title: 'Consulta inicial',
      description: 'Atendimento presencial',
      startAt: todayStart,
      endAt: todayEnd,
      assignedUserId: staffUser.id,
      createdByUserId: adminUser.id,
    },
    {
      title: 'Retorno de acompanhamento',
      description: 'Sessão de acompanhamento',
      startAt: tomorrowStart,
      endAt: tomorrowEnd,
      assignedUserId: adminUser.id,
      createdByUserId: adminUser.id,
    },
    {
      title: 'Planejamento semanal',
      description: 'Revisão de backlog',
      startAt: nextWeekStart,
      endAt: nextWeekEnd,
      assignedUserId: staffUser.id,
      createdByUserId: adminUser.id,
    },
  ];

  for (const seedAppointment of appointmentsSeed) {
    await prisma.appointment.create({
      data: {
        tenantId: company.id,
        title: seedAppointment.title,
        description: seedAppointment.description,
        status: AppointmentStatus.SCHEDULED,
        startAt: seedAppointment.startAt,
        endAt: seedAppointment.endAt,
        timezone: 'Europe/Dublin',
        assignedUserId: seedAppointment.assignedUserId,
        createdByUserId: seedAppointment.createdByUserId,
        statusHistory: {
          create: {
            tenantId: company.id,
            fromStatus: null,
            toStatus: AppointmentStatus.SCHEDULED,
            changedByUserId: seedAppointment.createdByUserId,
            reason: 'Seed',
          },
        },
      },
    });
  }

  const leadSeeds = [
    {
      id: 'lead-instagram',
      fullName: 'Igor Instagram',
      email: 'igor@demo.com',
      phone: null,
      source: LeadSource.INSTAGRAM,
      identity: { provider: IdentityProvider.INSTAGRAM, externalUserId: 'ig_user_1' },
      channel: Channel.INSTAGRAM,
      message: 'Olá! Interesse em serviço.',
    },
    {
      id: 'lead-whatsapp',
      fullName: 'Wanda WhatsApp',
      email: null,
      phone: '+551199999999',
      source: LeadSource.WHATSAPP,
      identity: { provider: IdentityProvider.WHATSAPP, externalUserId: 'wa_user_1' },
      channel: Channel.WHATSAPP,
      message: 'Preciso de informações sobre preços',
    },
    {
      id: 'lead-website',
      fullName: 'Web Visitor',
      email: 'visitor@site.com',
      phone: '+351911111111',
      source: LeadSource.WEBSITE,
      identity: { provider: IdentityProvider.WEBSITE, externalUserId: 'web_user_1' },
      channel: Channel.WEBSITE,
      message: 'Enviei um formulário no site.',
    },
  ];

  for (const seed of leadSeeds) {
    const lead = await prisma.lead.upsert({
      where: { id: seed.id },
      update: {
        fullName: seed.fullName,
        email: seed.email,
        phone: seed.phone,
        source: seed.source,
        tags: ['seed'],
      },
      create: {
        id: seed.id,
        tenantId: company.id,
        fullName: seed.fullName,
        email: seed.email,
        phone: seed.phone,
        source: seed.source,
        status: LeadStatus.NEW,
        tags: ['seed'],
        lastInteractionAt: new Date(),
      },
    });

    await prisma.leadIdentity.upsert({
      where: {
        tenantId_provider_externalUserId: {
          tenantId: company.id,
          provider: seed.identity.provider,
          externalUserId: seed.identity.externalUserId,
        },
      },
      update: { leadId: lead.id },
      create: {
        tenantId: company.id,
        leadId: lead.id,
        provider: seed.identity.provider,
        externalUserId: seed.identity.externalUserId,
      },
    });

    const conversation = await prisma.conversation.upsert({
      where: { id: `${seed.id}-conversation` },
      update: {
        channel: seed.channel,
      },
      create: {
        id: `${seed.id}-conversation`,
        tenantId: company.id,
        leadId: lead.id,
        channel: seed.channel,
        state: ConversationState.OPEN,
        lastMessageAt: new Date(),
      },
    });

    await prisma.message.upsert({
      where: { id: `${seed.id}-message-1` },
      update: { text: seed.message },
      create: {
        id: `${seed.id}-message-1`,
        tenantId: company.id,
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        text: seed.message,
        provider: seed.channel === Channel.WEBSITE ? MessageProvider.SYSTEM : MessageProvider.MANYCHAT,
      },
    });

    await prisma.leadStatusHistory.upsert({
      where: { id: `${seed.id}-status` },
      update: {},
      create: {
        id: `${seed.id}-status`,
        tenantId: company.id,
        leadId: lead.id,
        fromStatus: null,
        toStatus: LeadStatus.NEW,
        reason: 'Seed',
      },
    });
  }

  await prisma.webhookEndpoint.upsert({
    where: { id: 'seed-webhook-endpoint' },
    update: {},
    create: {
      id: 'seed-webhook-endpoint',
      tenantId: company.id,
      name: 'Seed n8n endpoint',
      url: 'https://example.com/webhook',
      secretEncrypted: encrypt('seed-webhook-secret'),
      eventTypes: ['lead.created', 'message.inbound'],
      isEnabled: false,
    },
  });

  await prisma.translation.upsert({
    where: {
      key_locale_companyId: {
        key: 'welcome',
        locale: 'pt-BR',
        companyId: company.id,
      },
    },
    update: {},
    create: {
      key: 'welcome',
      locale: 'pt-BR',
      companyId: company.id,
      value: 'Bem-vindo ao BTRIX',
    },
  });

  console.log('Seed completed successfully');
  console.table([
    { email: adminUser.email, password: 'admin123' },
    { email: staffUser.email, password: 'staff123' },
    { email: kitchenUser.email, password: 'kitchen123' },
  ]);
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
