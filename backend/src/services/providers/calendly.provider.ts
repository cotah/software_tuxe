import { CalendarProvider } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import {
  AppointmentDraft,
  CalendarEventResult,
  ICalendarProvider,
  ProviderTokenResult,
} from './types';

export class CalendlyProvider implements ICalendarProvider {
  provider: CalendarProvider = 'CALENDLY';

  private notImplemented(): never {
    throw new AppError(501, 'Calendly integration is not implemented yet');
  }

  getAuthUrl(): Promise<string> {
    this.notImplemented();
  }

  exchangeCodeForTokens(): Promise<ProviderTokenResult> {
    this.notImplemented();
  }

  refreshAccessTokenIfNeeded(): Promise<ProviderTokenResult> {
    this.notImplemented();
  }

  upsertEventFromAppointment(): Promise<CalendarEventResult> {
    this.notImplemented();
  }

  deleteEventForAppointment(): Promise<void> {
    this.notImplemented();
  }

  listEvents(): Promise<any[]> {
    this.notImplemented();
  }

  parseExternalEventToAppointmentDraft(): AppointmentDraft {
    this.notImplemented();
  }
}

