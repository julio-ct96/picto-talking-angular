import { Injectable } from '@angular/core';

import { LandingTelemetryPort } from '../../application/ports/landing-telemetry.port';
import { LandingSectionId } from '../../domain/value-objects/landing-section-id';

@Injectable()
export class ConsoleLandingTelemetryService implements LandingTelemetryPort {
  trackLandingLoaded(): void {
    console.info('[Landing][Telemetry] ui.landing.loaded');
  }

  trackSectionSelected(section: LandingSectionId): void {
    console.info('[Landing][Telemetry] ui.menu.section_selected', { section });
  }

  trackSpeechUnavailable(reason: 'feature-disabled' | 'engine-not-supported'): void {
    console.warn('[Landing][Telemetry] speech.unavailable', { reason });
  }

  trackSpeechPlaybackStarted(categoryId: string): void {
    console.info('[Landing][Telemetry] speech.playback.started', { categoryId });
  }

  trackSpeechPlaybackFailed(categoryId: string, reason: string): void {
    console.warn('[Landing][Telemetry] speech.playback.failed', { categoryId, reason });
  }
}
