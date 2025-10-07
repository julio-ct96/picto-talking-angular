import { Injectable } from '@angular/core';

import { LandingLocalePort } from '../../application/ports/landing-locale.port';
import { LandingLocaleCode, normalizeLandingLocale } from '../../domain/value-objects/landing-locale';

@Injectable()
export class LandingLocaleAdapter implements LandingLocalePort {
  resolvePreferredLocale(): LandingLocaleCode {
    if (typeof globalThis !== 'undefined') {
      const language =
        (globalThis.navigator?.language as string | undefined) ??
        (globalThis.navigator?.languages?.[0] as string | undefined) ??
        null;
      return normalizeLandingLocale(language);
    }

    return normalizeLandingLocale(null);
  }
}
