import {
  Appointment,
  AppointmentExternalMapping,
  CalendarProvider,
  CalendarProviderConnection,
} from '@prisma/client';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import crypto from 'crypto';
import {
  AppointmentDraft,
  CalendarEventResult,
  ICalendarProvider,
  ProviderTokenResult,
} from './types';

type MicrosoftProviderConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenant: string;
  scopes: string[];
};

export class MicrosoftCalendarProvider implements ICalendarProvider {
  provider: CalendarProvider = 'MICROSOFT';

  constructor(private config: MicrosoftProviderConfig) {}

  async getAuthUrl(state?: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: 'query',
      scope: this.config.scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `https://login.microsoftonline.com/${this.config.tenant}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  private async requestTokens(params: Record<string, string>): Promise<ProviderTokenResult> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      ...params,
    });

    const response = await fetch(
      `https://login.microsoftonline.com/${this.config.tenant}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to exchange Microsoft auth code');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      scopes: data.scope ? data.scope.split(' ') : this.config.scopes,
    };
  }

  exchangeCodeForTokens(code: string): Promise<ProviderTokenResult> {
    return this.requestTokens({
      grant_type: 'authorization_code',
      code,
    });
  }

  async refreshAccessTokenIfNeeded(tokens: ProviderTokenResult): Promise<ProviderTokenResult> {
    if (tokens.expiresAt && tokens.expiresAt.getTime() - Date.now() > 2 * 60 * 1000) {
      return tokens;
    }

    if (!tokens.refreshToken) {
      return tokens;
    }

    return this.requestTokens({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      scope: this.config.scopes.join(' '),
    });
  }

  private getClient(accessToken: string) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  private buildCalendarPath(calendarId?: string) {
    return calendarId ? `/me/calendars/${calendarId}` : '/me';
  }

  async upsertEventFromAppointment(params: {
    appointment: Appointment;
    mapping?: AppointmentExternalMapping | null;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<CalendarEventResult> {
    const { appointment, mapping, tokens } = params;
    const calendarId = params.calendarId || mapping?.externalCalendarId;
    const client = this.getClient(tokens.accessToken);

    const body = {
      subject: appointment.title,
      body: {
        contentType: 'HTML',
        content: appointment.description || '',
      },
      start: {
        dateTime: appointment.startAt.toISOString(),
        timeZone: appointment.timezone,
      },
      end: {
        dateTime: appointment.endAt.toISOString(),
        timeZone: appointment.timezone,
      },
      location: appointment.location
        ? {
            displayName: appointment.location,
          }
        : undefined,
    };

    const basePath = this.buildCalendarPath(calendarId);
    let response;

    if (mapping?.externalEventId) {
      response = await client.api(`${basePath}/events/${mapping.externalEventId}`).patch(body);
    } else {
      response = await client.api(`${basePath}/events`).post(body);
    }

    return {
      externalEventId: response.id || mapping?.externalEventId || '',
      externalCalendarId: calendarId || 'primary',
      etag: response['@odata.etag'] || null,
    };
  }

  async deleteEventForAppointment(params: {
    mapping: AppointmentExternalMapping;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<void> {
    const { mapping, tokens } = params;
    const calendarId = params.calendarId || mapping.externalCalendarId;
    const client = this.getClient(tokens.accessToken);
    const basePath = this.buildCalendarPath(calendarId);

    await client.api(`${basePath}/events/${mapping.externalEventId}`).delete();
  }

  async listEvents(params: {
    tokens: ProviderTokenResult;
    from?: Date;
    to?: Date;
    calendarId?: string;
  }): Promise<any[]> {
    const { tokens, from, to } = params;
    const calendarId = params.calendarId;
    const client = this.getClient(tokens.accessToken);
    const basePath = this.buildCalendarPath(calendarId);

    const start = from ? from.toISOString() : undefined;
    const end = to ? to.toISOString() : undefined;

    let query = `${basePath}/events`;
    if (start && end) {
      query = `${basePath}/calendarView?startDateTime=${encodeURIComponent(
        start
      )}&endDateTime=${encodeURIComponent(end)}`;
    }

    const response = await client.api(query).get();
    return response.value || [];
  }

  parseExternalEventToAppointmentDraft(event: any): AppointmentDraft {
    return {
      title: event.subject || 'External Event',
      description: event.bodyPreview || undefined,
      startAt: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(),
      endAt: event.end?.dateTime ? new Date(event.end.dateTime) : new Date(),
      timezone: event.start?.timeZone || 'UTC',
      location: event.location?.displayName || undefined,
      metadata: {
        organizer: event.organizer,
      },
    };
  }

  async ensureWebhookSubscription(params: {
    tokens: ProviderTokenResult;
    baseWebhookUrl: string;
    calendarId?: string;
    connection: CalendarProviderConnection;
  }) {
    const { tokens, baseWebhookUrl, connection } = params;
    const client = this.getClient(tokens.accessToken);
    const resource = params.calendarId
      ? `/me/calendars/${params.calendarId}/events`
      : '/me/events';
    const clientState = connection.clientState || crypto.randomUUID();

    const response = await client.api('/subscriptions').post({
      changeType: 'created,updated,deleted',
      notificationUrl: `${baseWebhookUrl}/api/webhooks/microsoft/calendar`,
      resource,
      expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      clientState,
    });

    return {
      channelId: response.id,
      resourceId: response.resource,
      expiration: new Date(response.expirationDateTime),
      clientState,
    };
  }
}

