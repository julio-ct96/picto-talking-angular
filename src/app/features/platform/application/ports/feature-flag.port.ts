import { InjectionToken } from '@angular/core';

export interface FeatureFlagPort {
  isEnabled(flag: string): boolean;
}

export const FEATURE_FLAG_PORT = new InjectionToken<FeatureFlagPort>('FEATURE_FLAG_PORT');
