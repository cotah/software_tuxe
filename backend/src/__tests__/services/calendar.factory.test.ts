import { CalendarProviderFactory } from '../../services/providers/factory';
import { calendarService } from '../../services/calendar.service';
import { AppError } from '../../middleware/errorHandler';

describe('Calendar provider factory', () => {
  const factory = new CalendarProviderFactory();

  it('returns provider instances for Google and Microsoft', () => {
    const google = factory.getProvider('GOOGLE', {
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost',
      scopes: ['scope'],
    } as any);

    const microsoft = factory.getProvider('MICROSOFT', {
      clientId: 'id',
      clientSecret: 'secret',
      tenant: 'common',
      redirectUri: 'http://localhost',
      scopes: ['scope'],
    } as any);

    expect(google.provider).toBe('GOOGLE');
    expect(microsoft.provider).toBe('MICROSOFT');
  });

  it('throws for Calendly since it is not implemented', () => {
    expect(() => factory.getProvider('CALENDLY' as any, {} as any)).toThrow(AppError);
  });
});

describe('Calendar env validation', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws 400 when Google env vars are missing', async () => {
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.GOOGLE_CLIENT_SECRET = '';
    process.env.GOOGLE_REDIRECT_URI = '';

    await expect(calendarService.getAuthUrl('GOOGLE', 'tenant-1')).rejects.toBeInstanceOf(AppError);
  });
});

