import prisma from './prisma';
import { logger } from './logger';

export interface TranslationOptions {
  companyId?: string;
  locale?: string;
  namespace?: string;
}

/**
 * Get translation for a key
 */
export async function t(
  key: string,
  options: TranslationOptions = {}
): Promise<string> {
  const { companyId, locale = 'pt-BR', namespace } = options;

  try {
    // Try to get company-specific translation first
    if (companyId) {
      const translation = await prisma.translation.findUnique({
        where: {
          key_locale_companyId: {
            key,
            locale,
            companyId,
          },
        },
      });

      if (translation) {
        return translation.value;
      }
    }

    // Fallback to system-wide translation (companyId = null)
    const systemTranslation = await prisma.translation.findUnique({
      where: {
        key_locale_companyId: {
          key,
          locale,
          companyId: null as any, // System translations have null companyId
        },
      },
    });

    if (systemTranslation) {
      return systemTranslation.value;
    }

    // Return key if no translation found
    logger.warn(`Translation missing for key: ${key}, locale: ${locale}`);
    return key;
  } catch (error) {
    logger.error(`Error fetching translation: ${error}`);
    return key;
  }
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date/time based on timezone and locale
 */
export function formatDateTime(
  date: Date,
  timezone: string = 'America/Sao_Paulo',
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  }
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timezone,
  }).format(date);
}

/**
 * Get company locale and currency
 */
export async function getCompanyLocale(companyId: string): Promise<{
  locale: string;
  currency: string;
  timezone: string;
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      locale: true,
      currency: true,
      timezone: true,
    },
  });

  return {
    locale: company?.locale || 'pt-BR',
    currency: company?.currency || 'BRL',
    timezone: company?.timezone || 'America/Sao_Paulo',
  };
}

export default {
  t,
  formatCurrency,
  formatDateTime,
  getCompanyLocale,
};

