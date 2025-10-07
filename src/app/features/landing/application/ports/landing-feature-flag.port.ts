import { InjectionToken } from '@angular/core';

export interface LandingFeatureFlagPort {
  isLandingEnabled(): boolean;
}

export const LANDING_FEATURE_FLAG_PORT = new InjectionToken<LandingFeatureFlagPort>(
  'LANDING_FEATURE_FLAG_PORT',
);
