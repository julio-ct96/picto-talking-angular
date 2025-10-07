import { inject, Injectable } from '@angular/core';

import { LandingFeatureFlagPort } from '../../application/ports/landing-feature-flag.port';
import { FEATURE_FLAG_PORT, FeatureFlagPort } from '../../../platform/application/ports/feature-flag.port';

@Injectable()
export class FeatureFlagLandingAdapter implements LandingFeatureFlagPort {
  private static readonly LANDING_FLAG_KEY = 'ff_ui_landing_base';

  private readonly featureFlags = inject<FeatureFlagPort>(FEATURE_FLAG_PORT);

  isLandingEnabled(): boolean {
    return this.featureFlags.isEnabled(FeatureFlagLandingAdapter.LANDING_FLAG_KEY);
  }
}
