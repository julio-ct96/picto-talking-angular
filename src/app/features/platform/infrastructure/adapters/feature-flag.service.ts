import { inject, Injectable, InjectionToken } from '@angular/core';

import { FeatureFlagPort } from '../../application/ports/feature-flag.port';

export type FeatureFlagDictionary = Readonly<Record<string, boolean>>;

export const FEATURE_FLAG_DEFAULTS = new InjectionToken<FeatureFlagDictionary>(
  'FEATURE_FLAG_DEFAULTS',
  {
    factory: (): FeatureFlagDictionary => ({
      ff_speech_service: true,
    }),
  },
);

@Injectable()
export class FeatureFlagService implements FeatureFlagPort {
  private readonly defaults = inject(FEATURE_FLAG_DEFAULTS);
  private readonly flags = new Map<string, boolean>(Object.entries(this.defaults));

  isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }
}
