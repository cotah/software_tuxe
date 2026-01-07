import {
  Appointment,
  AppointmentExternalMapping,
  CalendarProvider,
  CalendarProviderConnection,
} from '@prisma/client';
import { calendar_v3, google } from 'googleapis';
import crypto from 'crypto';
import {
  AppointmentDraft,
  CalendarEventResult,
  ICalendarProvider,
  ProviderTokenResult,
} from './types';

type GoogleProviderConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
};

export class GoogleCalendarProvider implements ICalendarProvider {
  provider: CalendarProvider = 'GOOGLE';
  private auth;

  constructor(private config: GoogleProviderConfig) {
    this.auth = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
  }

  getAuthUrl(state?: string): Promise<string> {
    const url = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
      state,
    });
    return Promise.resolve(url);
  }

  async exchangeCodeForTokens(code: string): Promise<ProviderTokenResult> {
    const { tokens } = await this.auth.getToken(code);
    return {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scopes: tokens.scope ? tokens.scope.split(' ') : this.config.scopes,
    };
  }

  async refreshAccessTokenIfNeeded(tokens: ProviderTokenResult): Promise<ProviderTokenResult> {
    if (tokens.expiresAt && tokens.expiresAt.getTime() - Date.now() > 2 * 60 * 1000) {
      return tokens;
    }

    if (!tokens.refreshToken) {
      return tokens;
    }

    this.auth.setCredentials({ refresh_token: tokens.refreshToken });
    const refreshed = await this.auth.refreshAccessToken();
    const credentials = refreshed.credentials;

    return {
      accessToken: credentials.access_token || tokens.accessToken,
      refreshToken: credentials.refresh_token || tokens.refreshToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : tokens.expiresAt,
      scopes: credentials.scope ? credentials.scope.split(' ') : tokens.scopes,
    };
  }

  private getCalendar(tokens: ProviderTokenResult) {
    this.auth.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    return google.calendar({ version: 'v3', auth: this.auth });
  }

  async upsertEventFromAppointment(params: {
    appointment: Appointment;
    mapping?: AppointmentExternalMapping | null;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<CalendarEventResult> {
    const { appointment, mapping, tokens } = params;
    const calendarId = params.calendarId || mapping?.externalCalendarId || 'primary';
    const calendar = this.getCalendar(tokens);

    const eventBody: calendar_v3.Schema$Event = {
      summary: appointment.title,
      description: appointment.description || undefined,
      start: {
        dateTime: appointment.startAt instanceof Date ? appointment.startAt.toISOString() : appointment.startAt,
        timeZone: appointment.timezone,
      },
      end: {
        dateTime: appointment.endAt instanceof Date ? appointment.endAt.toISOString() : appointment.endAt,
        timeZone: appointment.timezone,
      },
      location: appointment.location || undefined,
      extendedProperties: appointment.metadata
        ? {
            private: {
              appointmentId: appointment.id,
            },
          }
        : undefined,
    };

    const eventId = mapping?.externalEventId;
    let response;

    if (eventId) {
      response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventBody,
        sendUpdates: 'none',
      });
    } else {
      response = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
        sendUpdates: 'none',
      });
    }

    return {
      externalEventId: response.data.id || eventId || '',
      externalCalendarId: calendarId,
      etag: response.data.etag || null,
    };
  }

  async deleteEventForAppointment(params: {
    mapping: AppointmentExternalMapping;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<void> {
    const { mapping, tokens } = params;
    const calendarId = params.calendarId || mapping.externalCalendarId || 'primary';
    const calendar = this.getCalendar(tokens);

    await calendar.events.delete({
      calendarId,
      eventId: mapping.externalEventId,
      sendUpdates: 'none',
    });
  }

  async listEvents(params: {
    tokens: ProviderTokenResult;
    from?: Date;
    to?: Date;
    calendarId?: string;
  }): Promise<any[]> {
    const { tokens } = params;
    const calendarId = params.calendarId || 'primary';
    const calendar = this.getCalendar(tokens);

    const response = await calendar.events.list({
      calendarId,
      timeMin: params.from ? params.from.toISOString() : undefined,
      timeMax: params.to ? params.to.toISOString() : undefined,
      showDeleted: false,
      singleEvents: true,
    });

    return response.data.items || [];
  }

  parseExternalEventToAppointmentDraft(event: calendar_v3.Schema$Event): AppointmentDraft {
    return {
      title: event.summary || 'External Event',
      description: event.description || undefined,
      startAt: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(),
      endAt: event.end?.dateTime ? new Date(event.end.dateTime) : new Date(),
      timezone: event.start?.timeZone || 'UTC',
      location: event.location || undefined,
      metadata: {
        creator: event.creator,
      },
    };
  }

  async ensureWebhookSubscription(params: {
    tokens: ProviderTokenResult;
    baseWebhookUrl: string;
    calendarId?: string;
    connection: CalendarProviderConnection;
  }) {
    const { tokens, baseWebhookUrl } = params;
    const calendarId = params.calendarId || 'primary';
    const calendar = this.getCalendar(tokens);
    const channelId = params.connection.webhookChannelId || crypto.randomUUID();

    const response = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: `${baseWebhookUrl}/api/webhooks/google/calendar`,
      },
    });

    return {
      channelId,
      resourceId: response.data.resourceId || '',
      expiration: response.data.expiration ? new Date(Number(response.data.expiration)) : new Date(),
    };
  }
}
