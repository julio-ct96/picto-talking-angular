export type LandingLocaleCode = 'es' | 'en';

export const DEFAULT_LANDING_LOCALE: LandingLocaleCode = 'es';

export function normalizeLandingLocale(
  locale: string | null | undefined,
): LandingLocaleCode {
  if (!locale) {
    return DEFAULT_LANDING_LOCALE;
  }

  const normalized = locale.split(/[-_]/)[0]?.toLowerCase() ?? DEFAULT_LANDING_LOCALE;
  if (normalized === 'en' || normalized === 'es') {
    return normalized;
  }

  return DEFAULT_LANDING_LOCALE;
}
