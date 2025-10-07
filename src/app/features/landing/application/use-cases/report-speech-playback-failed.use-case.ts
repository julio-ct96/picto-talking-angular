import { inject, Injectable } from '@angular/core';

import { LANDING_TELEMETRY_PORT, LandingTelemetryPort } from '../ports/landing-telemetry.port';

@Injectable()
export class ReportSpeechPlaybackFailedUseCase {
  private readonly telemetry = inject<LandingTelemetryPort>(LANDING_TELEMETRY_PORT);

  execute(categoryId: string, reason: string): void {
    this.telemetry.trackSpeechPlaybackFailed(categoryId, reason);
  }
}
