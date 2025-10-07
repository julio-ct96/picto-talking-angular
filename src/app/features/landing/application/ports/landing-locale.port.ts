import { InjectionToken } from '@angular/core';

import { LandingLocaleCode } from '../../domain/value-objects/landing-locale';

export interface LandingLocalePort {
  resolvePreferredLocale(): LandingLocaleCode;
}

export const LANDING_LOCALE_PORT = new InjectionToken<LandingLocalePort>(
  'LANDING_LOCALE_PORT',
);
