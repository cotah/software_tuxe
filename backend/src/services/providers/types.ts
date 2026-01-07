import {
  Appointment,
  AppointmentExternalMapping,
  CalendarProvider,
  CalendarProviderConnection,
} from '@prisma/client';

export type ProviderTokenResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
};

export type CalendarEventResult = {
  externalEventId: string;
  externalCalendarId: string;
  etag?: string | null;
};

export type AppointmentDraft = {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  location?: string;
  metadata?: Record<string, any>;
};

export interface ICalendarProvider {
  provider: CalendarProvider;
  getAuthUrl(state?: string): Promise<string>;
  exchangeCodeForTokens(code: string): Promise<ProviderTokenResult>;
  refreshAccessTokenIfNeeded(tokens: ProviderTokenResult): Promise<ProviderTokenResult>;
  upsertEventFromAppointment(params: {
    appointment: Appointment;
    mapping?: AppointmentExternalMapping | null;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<CalendarEventResult>;
  deleteEventForAppointment(params: {
    mapping: AppointmentExternalMapping;
    calendarId?: string;
    tokens: ProviderTokenResult;
  }): Promise<void>;
  listEvents(params: {
    tokens: ProviderTokenResult;
    from?: Date;
    to?: Date;
    calendarId?: string;
  }): Promise<any[]>;
  parseExternalEventToAppointmentDraft(event: any): AppointmentDraft;
  ensureWebhookSubscription?(params: {
    tokens: ProviderTokenResult;
    baseWebhookUrl: string;
    calendarId?: string;
    connection: CalendarProviderConnection;
  }): Promise<{
    channelId: string;
    resourceId: string;
    expiration: Date;
    clientState?: string;
  }>;
}

