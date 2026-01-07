import { CalendarProvider } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { ProviderConfig } from '../../config/calendarEnv';
import { GoogleCalendarProvider } from './google.provider';
import { MicrosoftCalendarProvider } from './microsoft.provider';
import { ICalendarProvider } from './types';

export class CalendarProviderFactory {
  getProvider(provider: CalendarProvider, config?: ProviderConfig): ICalendarProvider {
    switch (provider) {
      case 'GOOGLE':
        return new GoogleCalendarProvider(config as any);
      case 'MICROSOFT':
        return new MicrosoftCalendarProvider(config as any);
      case 'CALENDLY':
        throw new AppError(501, 'Calendly provider is not implemented yet');
      default:
        throw new AppError(400, 'Unsupported calendar provider');
    }
  }
}

export const calendarProviderFactory = new CalendarProviderFactory();
