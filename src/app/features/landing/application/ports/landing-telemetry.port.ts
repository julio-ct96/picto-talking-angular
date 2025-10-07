import { InjectionToken } from '@angular/core';

import { LandingSectionId } from '../../domain/value-objects/landing-section-id';

export interface LandingTelemetryPort {
  trackLandingLoaded(): void;
  trackSectionSelected(section: LandingSectionId): void;
  trackSpeechUnavailable(reason: 'feature-disabled' | 'engine-not-supported'): void;
  trackSpeechPlaybackStarted(categoryId: string): void;
  trackSpeechPlaybackFailed(categoryId: string, reason: string): void;
}

export const LANDING_TELEMETRY_PORT = new InjectionToken<LandingTelemetryPort>(
  'LANDING_TELEMETRY_PORT',
);
