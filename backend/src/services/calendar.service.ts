import { CalendarProvider, CalendarProviderConnection, SyncState, UserRole } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../utils/encryption';
import { getProviderConfig, requireBaseAppUrl } from '../config/calendarEnv';
import { calendarProviderFactory } from './providers/factory';
import { AppointmentDraft, ProviderTokenResult } from './providers/types';
import { appointmentService } from './appointment.service';
import { logger } from '../utils/logger';

type PushResult = {
  mappingId: string;
  externalEventId: string;
  externalCalendarId: string;
  etag?: string | null;
};

function decryptTokens(connection: CalendarProviderConnection): ProviderTokenResult {
  return {
    accessToken: connection.accessTokenEncrypted ? decrypt(connection.accessTokenEncrypted) : '',
    refreshToken: connection.refreshTokenEncrypted ? decrypt(connection.refreshTokenEncrypted) : undefined,
    expiresAt: connection.expiresAt || undefined,
    scopes: connection.scopes,
  };
}

function sanitizeConnection(connection: CalendarProviderConnection) {
  const { accessTokenEncrypted, refreshTokenEncrypted, ...rest } = connection;
  return rest;
}

export class CalendarService {
  private async getTenantCalendarSettings(tenantId: string) {
    const existing = await prisma.tenantCalendarSettings.findUnique({ where: { tenantId } });
    if (existing) {
      return existing;
    }

    return prisma.tenantCalendarSettings.create({
      data: {
        tenantId,
        defaultTimezone: 'Europe/Dublin',
      },
    });
  }

  async listConnections(tenantId: string) {
    const connections = await prisma.calendarProviderConnection.findMany({
      where: { tenantId },
    });

    return connections.map(sanitizeConnection);
  }

  async getAuthUrl(provider: CalendarProvider, tenantId: string) {
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    return client.getAuthUrl(tenantId);
  }

  async handleCallback(provider: CalendarProvider, tenantId: string, code: string) {
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    const tokens = await client.exchangeCodeForTokens(code);

    const connection = await prisma.calendarProviderConnection.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
      },
      update: {
        accessTokenEncrypted: tokens.accessToken ? encrypt(tokens.accessToken) : null,
        refreshTokenEncrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        expiresAt: tokens.expiresAt,
        scopes: tokens.scopes || config.scopes,
        isEnabled: true,
      },
      create: {
        tenantId,
        provider,
        displayName: `${provider} Calendar`,
        isEnabled: true,
        scopes: tokens.scopes || config.scopes,
        accessTokenEncrypted: tokens.accessToken ? encrypt(tokens.accessToken) : null,
        refreshTokenEncrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        expiresAt: tokens.expiresAt,
      },
    });

    return sanitizeConnection(connection);
  }

  async disconnect(provider: CalendarProvider, tenantId: string) {
    const existing = await prisma.calendarProviderConnection.findFirst({
      where: { tenantId, provider },
    });

    if (!existing) {
      throw new AppError(404, 'Connection not found');
    }

    await prisma.calendarProviderConnection.update({
      where: { id: existing.id },
      data: {
        isEnabled: false,
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        webhookChannelId: null,
        webhookResourceId: null,
        webhookExpiration: null,
      },
    });
  }

  private async getConnectionOrThrow(provider: CalendarProvider, tenantId: string) {
    const connection = await prisma.calendarProviderConnection.findFirst({
      where: { tenantId, provider, isEnabled: true },
    });

    if (!connection) {
      throw new AppError(404, 'Calendar provider is not connected for this tenant');
    }

    return connection;
  }

  private async refreshTokensIfNeeded(
    provider: CalendarProvider,
    connection: CalendarProviderConnection,
    tokens: ProviderTokenResult
  ) {
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    const refreshed = await client.refreshAccessTokenIfNeeded(tokens);

    if (refreshed.accessToken !== tokens.accessToken || refreshed.expiresAt !== tokens.expiresAt) {
      await prisma.calendarProviderConnection.update({
        where: { id: connection.id },
        data: {
          accessTokenEncrypted: encrypt(refreshed.accessToken),
          refreshTokenEncrypted: refreshed.refreshToken ? encrypt(refreshed.refreshToken) : connection.refreshTokenEncrypted,
          expiresAt: refreshed.expiresAt,
        },
      });
    }

    return refreshed;
  }

  private async getDefaultUserForTenant(tenantId: string) {
    const user =
      (await prisma.user.findFirst({
        where: { companyId: tenantId, role: UserRole.ADMIN },
      })) ||
      (await prisma.user.findFirst({
        where: { companyId: tenantId },
      }));

    if (!user) {
      throw new AppError(400, 'No user found for tenant to own appointment');
    }

    return user;
  }

  private async upsertMapping(params: {
    tenantId: string;
    appointmentId: string;
    provider: CalendarProvider;
    externalCalendarId: string;
    externalEventId: string;
    etag?: string | null;
    syncState?: SyncState;
    errorMessage?: string | null;
    connectionId?: string;
  }) {
    const {
      tenantId,
      appointmentId,
      provider,
      externalCalendarId,
      externalEventId,
      etag,
      syncState,
      errorMessage,
      connectionId,
    } = params;

    const mapping = await prisma.appointmentExternalMapping.upsert({
      where: {
        tenantId_provider_appointmentId: {
          tenantId,
          provider,
          appointmentId,
        },
      },
      create: {
        tenantId,
        appointmentId,
        provider,
        externalCalendarId,
        externalEventId,
        etag: etag || null,
        syncState: syncState || SyncState.OK,
        errorMessage: errorMessage || null,
        connectionId,
      },
      update: {
        externalCalendarId,
        externalEventId,
        etag: etag || null,
        syncState: syncState || SyncState.OK,
        errorMessage: errorMessage || null,
        lastSyncedAt: new Date(),
        connectionId,
      },
    });

    return mapping;
  }

  async pushAppointment(appointmentId: string, provider: CalendarProvider, tenantId: string): Promise<PushResult> {
    if (provider === 'CALENDLY') {
      throw new AppError(501, 'Calendly integration is not implemented yet');
    }

    const appointment = await appointmentService.getById(appointmentId, tenantId);
    const connection = await this.getConnectionOrThrow(provider, tenantId);
    const tokens = decryptTokens(connection);
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    const validTokens = await this.refreshTokensIfNeeded(provider, connection, tokens);

    const settings = await this.getTenantCalendarSettings(tenantId);
    const mapping = await prisma.appointmentExternalMapping.findFirst({
      where: { tenantId, provider, appointmentId },
    });

    const result = await client.upsertEventFromAppointment({
      appointment,
      mapping,
      calendarId: settings.defaultExternalCalendarId || connection.externalAccountId || 'primary',
      tokens: validTokens,
    });

    const savedMapping = await this.upsertMapping({
      tenantId,
      appointmentId,
      provider,
      externalCalendarId: result.externalCalendarId,
      externalEventId: result.externalEventId,
      etag: result.etag || undefined,
      syncState: SyncState.OK,
      errorMessage: null,
      connectionId: connection.id,
    });

    return {
      mappingId: savedMapping.id,
      externalEventId: result.externalEventId,
      externalCalendarId: result.externalCalendarId,
      etag: result.etag,
    };
  }

  private async handleExternalDraft(
    tenantId: string,
    provider: CalendarProvider,
    draft: AppointmentDraft,
    externalCalendarId: string,
    externalEventId: string,
    etag?: string | null,
    safeMode?: boolean
  ) {
    const mapping = await prisma.appointmentExternalMapping.findFirst({
      where: { tenantId, provider, externalCalendarId, externalEventId },
    });

    if (mapping) {
      if (mapping.etag && etag && mapping.etag !== etag) {
        if (safeMode) {
          await prisma.appointmentExternalMapping.update({
            where: { id: mapping.id },
            data: {
              syncState: SyncState.CONFLICT,
              errorMessage: 'External event changed; awaiting review',
            },
          });
          return;
        }

        await prisma.appointment.update({
          where: { id: mapping.appointmentId },
          data: {
            title: draft.title,
            description: draft.description,
            startAt: draft.startAt,
            endAt: draft.endAt,
            timezone: draft.timezone,
            location: draft.location,
            metadata: draft.metadata as any,
          },
        });
      }

      await prisma.appointmentExternalMapping.update({
        where: { id: mapping.id },
        data: {
          etag: etag || mapping.etag,
          lastSyncedAt: new Date(),
          syncState: SyncState.OK,
          errorMessage: null,
        },
      });

      return;
    }

    if (safeMode) {
      logger.info('Safe mode enabled, skipping creation for external event', {
        provider,
        externalCalendarId,
        externalEventId,
      });
      return;
    }

    const owner = await this.getDefaultUserForTenant(tenantId);
    const appointment = await appointmentService.createAppointment(tenantId, draft, owner.id);

    await this.upsertMapping({
      tenantId,
      appointmentId: appointment.id,
      provider,
      externalCalendarId,
      externalEventId,
      etag: etag || undefined,
      syncState: SyncState.OK,
    });
  }

  async pullEvents(params: {
    tenantId: string;
    provider: CalendarProvider;
    from?: string;
    to?: string;
    safeMode?: boolean;
  }) {
    const { tenantId, provider, from, to, safeMode } = params;
    if (provider === 'CALENDLY') {
      throw new AppError(501, 'Calendly integration is not implemented yet');
    }

    const connection = await this.getConnectionOrThrow(provider, tenantId);
    const tokens = decryptTokens(connection);
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    const validTokens = await this.refreshTokensIfNeeded(provider, connection, tokens);

    const settings = await this.getTenantCalendarSettings(tenantId);

    const events = await client.listEvents({
      tokens: validTokens,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      calendarId: settings.defaultExternalCalendarId || undefined,
    });

    for (const event of events) {
      const draft = client.parseExternalEventToAppointmentDraft(event);
      await this.handleExternalDraft(
        tenantId,
        provider,
        draft,
        settings.defaultExternalCalendarId || draft.metadata?.calendarId || 'primary',
        event.id || event.iCalUID || crypto.randomUUID(),
        event.etag || event['@odata.etag'] || null,
        safeMode
      );
    }
  }

  async renewSubscription(tenantId: string, provider: CalendarProvider) {
    if (provider === 'CALENDLY') {
      throw new AppError(501, 'Calendly integration is not implemented yet');
    }

    const connection = await this.getConnectionOrThrow(provider, tenantId);
    const tokens = decryptTokens(connection);
    const config = getProviderConfig(provider);
    const client = calendarProviderFactory.getProvider(provider, config);
    const validTokens = await this.refreshTokensIfNeeded(provider, connection, tokens);
    const baseUrl = requireBaseAppUrl();

    if (!client.ensureWebhookSubscription) {
      throw new AppError(400, 'Webhook subscription not supported for this provider');
    }

    const subscription = await client.ensureWebhookSubscription({
      tokens: validTokens,
      baseWebhookUrl: baseUrl,
      calendarId: connection.externalAccountId || undefined,
      connection,
    });

    await prisma.calendarProviderConnection.update({
      where: { id: connection.id },
      data: {
        webhookChannelId: subscription.channelId,
        webhookResourceId: subscription.resourceId,
        webhookExpiration: subscription.expiration,
        clientState: subscription.clientState || connection.clientState,
      },
    });
  }

  async processWebhookEvent(provider: CalendarProvider, payload: any, headers: any) {
    switch (provider) {
      case 'GOOGLE': {
        const channelId = headers['x-goog-channel-id'];
        const resourceId = headers['x-goog-resource-id'];
        if (!channelId || !resourceId) {
          throw new AppError(400, 'Missing webhook headers');
        }

        const connection = await prisma.calendarProviderConnection.findFirst({
          where: { webhookChannelId: channelId, webhookResourceId: resourceId, isEnabled: true },
        });

        if (!connection) {
          throw new AppError(404, 'No calendar connection found for webhook');
        }

        await prisma.appointmentExternalMapping.updateMany({
          where: { tenantId: connection.tenantId, provider },
          data: { syncState: SyncState.NEEDS_UPDATE },
        });

        return { tenantIds: [connection.tenantId] };
      }
      case 'MICROSOFT': {
        const notifications = payload?.value || [];
        const tenantIds = new Set<string>();
        for (const notification of notifications) {
          const connection = await prisma.calendarProviderConnection.findFirst({
            where: {
              webhookChannelId: notification.subscriptionId,
              isEnabled: true,
            },
          });

          if (!connection) {
            continue;
          }

          if (connection.clientState && notification.clientState !== connection.clientState) {
            continue;
          }

          await prisma.appointmentExternalMapping.updateMany({
            where: { tenantId: connection.tenantId, provider },
            data: { syncState: SyncState.NEEDS_UPDATE },
          });
          tenantIds.add(connection.tenantId);
        }

        return { tenantIds: Array.from(tenantIds) };
      }
      default:
        throw new AppError(400, 'Unsupported provider webhook');
    }
  }
}

export const calendarService = new CalendarService();
