import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BTRIX API Documentation',
      version: '1.0.0',
      description: 'Modular, scalable backend API for multi-business type management',
      contact: {
        name: 'BTRIX Support',
        email: 'support@btrix.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.btrix.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'STAFF', 'KITCHEN'] },
            companyId: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            businessType: { type: 'string', enum: ['RESTAURANT', 'BIKE_SHOP', 'CLINIC', 'PET_STORE', 'GENERAL'] },
            timezone: { type: 'string' },
            locale: { type: 'string' },
            currency: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            status: { type: 'string' },
            totalAmount: { type: 'number' },
            companyId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tenantId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            timezone: { type: 'string' },
            assignedUserId: { type: 'string' },
            customerId: { type: 'string' },
            location: { type: 'string' },
            metadata: { type: 'object' },
          },
        },
        AppointmentStatusHistory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            appointmentId: { type: 'string' },
            fromStatus: { type: 'string' },
            toStatus: { type: 'string' },
            reason: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CalendarProviderConnection: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tenantId: { type: 'string' },
            provider: { type: 'string', enum: ['GOOGLE', 'MICROSOFT', 'CALENDLY'] },
            displayName: { type: 'string' },
            isEnabled: { type: 'boolean' },
            scopes: { type: 'array', items: { type: 'string' } },
            externalAccountEmail: { type: 'string' },
            webhookChannelId: { type: 'string' },
            webhookResourceId: { type: 'string' },
            webhookExpiration: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AppointmentExternalMapping: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            appointmentId: { type: 'string' },
            provider: { type: 'string', enum: ['GOOGLE', 'MICROSOFT', 'CALENDLY'] },
            externalCalendarId: { type: 'string' },
            externalEventId: { type: 'string' },
            etag: { type: 'string' },
            syncState: { type: 'string', enum: ['OK', 'NEEDS_UPDATE', 'CONFLICT', 'ERROR'] },
            lastSyncedAt: { type: 'string', format: 'date-time' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            locale: { type: 'string' },
            status: { type: 'string', enum: ['NEW', 'ENGAGED', 'QUALIFIED', 'WAITING_HUMAN', 'CONVERTED', 'LOST'] },
            temperature: { type: 'string', enum: ['HOT', 'WARM', 'COLD'] },
            source: { type: 'string', enum: ['INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'WEBSITE', 'OTHER'] },
            tags: { type: 'array', items: { type: 'string' } },
            lastInteractionAt: { type: 'string', format: 'date-time' },
          },
        },
        LeadStatusHistory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            leadId: { type: 'string' },
            fromStatus: { type: 'string' },
            toStatus: { type: 'string' },
            reason: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            leadId: { type: 'string' },
            channel: { type: 'string', enum: ['INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'WEBSITE', 'EMAIL', 'OTHER'] },
            state: { type: 'string', enum: ['OPEN', 'BOT_ACTIVE', 'HUMAN_REQUIRED', 'CLOSED'] },
            lastMessageAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            conversationId: { type: 'string' },
            direction: { type: 'string', enum: ['INBOUND', 'OUTBOUND'] },
            text: { type: 'string' },
            provider: { type: 'string', enum: ['MANYCHAT', 'SYSTEM', 'HUMAN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WebhookEndpoint: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            url: { type: 'string' },
            eventTypes: { type: 'array', items: { type: 'string' } },
            isEnabled: { type: 'boolean' },
          },
        },
        TenantAISettings: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            dailyTokenLimit: { type: 'integer' },
            defaultModel: { type: 'string' },
            allowSummarize: { type: 'boolean' },
            allowDraftReply: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/api/appointments': {
        get: {
          summary: 'List appointments',
          tags: ['Appointments'],
          parameters: [
            { in: 'query', name: 'from', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'to', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'assignedUserId', schema: { type: 'string' } },
            { in: 'query', name: 'customerId', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Appointment list',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create appointment',
          tags: ['Appointments'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Appointment',
                },
              },
            },
          },
          responses: {
            201: { description: 'Created' },
          },
        },
      },
      '/api/appointments/{id}': {
        get: {
          summary: 'Get appointment',
          tags: ['Appointments'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Appointment detail' } },
        },
        patch: {
          summary: 'Update appointment',
          tags: ['Appointments'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Updated' } },
        },
      },
      '/api/appointments/{id}/status': {
        post: {
          summary: 'Change appointment status',
          tags: ['Appointments'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    reason: { type: 'string' },
                  },
                  required: ['status'],
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
      },
      '/api/appointments/{id}/ics': {
        get: {
          summary: 'Download appointment ICS file',
          tags: ['Appointments'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'ICS file' } },
        },
      },
      '/api/calendar/providers': {
        get: {
          summary: 'List calendar provider connections',
          tags: ['Calendar'],
          responses: { 200: { description: 'Provider list' } },
        },
      },
      '/api/calendar/{provider}/connect': {
        post: {
          summary: 'Start OAuth flow',
          tags: ['Calendar'],
          parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Auth URL' } },
        },
      },
      '/api/calendar/{provider}/callback': {
        get: {
          summary: 'Handle OAuth callback',
          tags: ['Calendar'],
          parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Connection saved' } },
        },
      },
      '/api/calendar/{provider}/disconnect': {
        post: {
          summary: 'Disconnect provider',
          tags: ['Calendar'],
          parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Disconnected' } },
        },
      },
      '/api/calendar/{provider}/sync/push/{appointmentId}': {
        post: {
          summary: 'Push appointment to external calendar',
          tags: ['Calendar'],
          parameters: [
            { in: 'path', name: 'provider', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'appointmentId', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Push scheduled' } },
        },
      },
      '/api/calendar/{provider}/sync/pull': {
        post: {
          summary: 'Pull events from external calendar',
          tags: ['Calendar'],
          parameters: [
            { in: 'path', name: 'provider', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'from', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'to', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'safe', schema: { type: 'boolean' } },
          ],
          responses: { 200: { description: 'Pull scheduled' } },
        },
      },
      '/api/ingest/manychat': {
        post: {
          summary: 'Ingest events/messages from ManyChat',
          tags: ['Ingest'],
          requestBody: { required: true },
          responses: { 200: { description: 'Accepted' } },
        },
      },
      '/api/ingest/website': {
        post: {
          summary: 'Ingest leads from website form',
          tags: ['Ingest'],
          requestBody: { required: true },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/leads': {
        get: {
          summary: 'List leads',
          tags: ['Leads'],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'temperature', schema: { type: 'string' } },
            { in: 'query', name: 'source', schema: { type: 'string' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Lead list', content: { 'application/json': { schema: { $ref: '#/components/schemas/Lead' } } } } },
        },
      },
      '/api/leads/{id}': {
        get: {
          summary: 'Get lead',
          tags: ['Leads'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lead detail' } },
        },
        patch: {
          summary: 'Update lead',
          tags: ['Leads'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lead updated' } },
        },
      },
      '/api/leads/{id}/status': {
        post: {
          summary: 'Change lead status',
          tags: ['Leads'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string' }, reason: { type: 'string' } },
                  required: ['status'],
                },
              },
            },
          },
          responses: { 200: { description: 'Status changed' } },
        },
      },
      '/api/conversations': {
        get: {
          summary: 'List conversations',
          tags: ['Conversations'],
          responses: { 200: { description: 'Conversation list' } },
        },
      },
      '/api/conversations/{id}/messages': {
        get: {
          summary: 'List messages of a conversation',
          tags: ['Conversations'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Messages' } },
        },
      },
      '/api/conversations/{id}/escalate': {
        post: {
          summary: 'Escalate conversation to human',
          tags: ['Conversations'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Escalated' } },
        },
      },
      '/api/conversations/{id}/close': {
        post: {
          summary: 'Close conversation',
          tags: ['Conversations'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Closed' } },
        },
      },
      '/api/webhook-endpoints': {
        get: {
          summary: 'List webhook endpoints',
          tags: ['Webhooks'],
          responses: { 200: { description: 'Endpoints' } },
        },
        post: {
          summary: 'Create webhook endpoint',
          tags: ['Webhooks'],
          requestBody: { required: true },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/ai/leads/{leadId}/classify': {
        post: {
          summary: 'Classify lead with AI',
          tags: ['AI'],
          parameters: [{ in: 'path', name: 'leadId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Classification result' }, 403: { description: 'AI disabled' }, 429: { description: 'AI daily token limit reached' }, 503: { description: 'Provider unavailable' } },
        },
      },
      '/api/ai/conversations/{conversationId}/summarize': {
        post: {
          summary: 'Summarize conversation with AI',
          tags: ['AI'],
          parameters: [{ in: 'path', name: 'conversationId', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    style: { type: 'string', enum: ['short', 'medium', 'detailed'] },
                    locale: { type: 'string', enum: ['pt-BR', 'en-US', 'es-ES'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Summary' }, 403: { description: 'AI disabled' }, 429: { description: 'AI daily token limit reached' }, 503: { description: 'AI provider unavailable' } },
        },
      },
      '/api/ai/conversations/{conversationId}/draft-reply': {
        post: {
          summary: 'Draft a reply suggestion',
          tags: ['AI'],
          parameters: [{ in: 'path', name: 'conversationId', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    goal: { type: 'string', enum: ['sales', 'support', 'billing', 'booking', 'generic'] },
                    tone: { type: 'string', enum: ['friendly', 'neutral', 'premium'] },
                    locale: { type: 'string', enum: ['pt-BR', 'en-US', 'es-ES'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Draft reply' }, 403: { description: 'AI disabled' }, 429: { description: 'AI daily token limit reached' }, 503: { description: 'AI provider unavailable' } },
        },
      },
      '/api/ai/settings': {
        get: {
          summary: 'Get AI settings',
          tags: ['AI'],
          responses: { 200: { description: 'Settings', content: { 'application/json': { schema: { $ref: '#/components/schemas/TenantAISettings' } } } } },
        },
        patch: {
          summary: 'Update AI settings',
          tags: ['AI'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean' },
                    dailyTokenLimit: { type: 'integer' },
                    defaultModel: { type: 'string' },
                    allowSummarize: { type: 'boolean' },
                    allowDraftReply: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Updated' } },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BTRIX API Documentation',
  }));

  // JSON endpoint for Swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export default swaggerSpec;

