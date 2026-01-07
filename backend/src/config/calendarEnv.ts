import { CalendarProvider } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

const googleSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI: z.string().min(1, 'GOOGLE_REDIRECT_URI is required'),
});

const microsoftSchema = z.object({
  MICROSOFT_CLIENT_ID: z.string().min(1, 'MICROSOFT_CLIENT_ID is required'),
  MICROSOFT_CLIENT_SECRET: z.string().min(1, 'MICROSOFT_CLIENT_SECRET is required'),
  MICROSOFT_REDIRECT_URI: z.string().min(1, 'MICROSOFT_REDIRECT_URI is required'),
  MICROSOFT_TENANT: z.string().min(1).default('common'),
});

const baseSchema = z.object({
  APP_BASE_URL: z.string().min(1, 'APP_BASE_URL is required'),
});

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
};

export type MicrosoftConfig = {
  clientId: string;
  clientSecret: string;
  tenant: string;
  redirectUri: string;
  scopes: string[];
};

export type ProviderConfig = GoogleConfig | MicrosoftConfig;

function formatMissingError(provider: string, missing: string[]): AppError {
  const message = `${provider} configuration missing environment variables: ${missing.join(', ')}`;
  return new AppError(400, message);
}

function parseEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  providerLabel: string
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const missing = Array.from(
      new Set(result.error.issues.map((issue) => issue.path.join('.')))
    );
    throw formatMissingError(providerLabel, missing);
  }
  return result.data;
}

export function requireBaseAppUrl(): string {
  const result = baseSchema.safeParse(process.env);
  if (!result.success) {
    const missing = Array.from(
      new Set(result.error.issues.map((issue) => issue.path.join('.')))
    );
    throw formatMissingError('APP', missing);
  }
  return result.data.APP_BASE_URL;
}

export function getProviderConfig(provider: CalendarProvider): ProviderConfig {
  switch (provider) {
    case 'GOOGLE': {
      const env = parseEnv(googleSchema, 'Google Calendar');
      return {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: env.GOOGLE_REDIRECT_URI,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      };
    }
    case 'MICROSOFT': {
      const env = parseEnv(microsoftSchema, 'Microsoft Calendar');
      return {
        clientId: env.MICROSOFT_CLIENT_ID,
        clientSecret: env.MICROSOFT_CLIENT_SECRET,
        tenant: env.MICROSOFT_TENANT,
        redirectUri: env.MICROSOFT_REDIRECT_URI,
        scopes: ['offline_access', 'Calendars.ReadWrite', 'User.Read'],
      };
    }
    default:
      throw new AppError(501, 'Provider not supported yet');
  }
}

