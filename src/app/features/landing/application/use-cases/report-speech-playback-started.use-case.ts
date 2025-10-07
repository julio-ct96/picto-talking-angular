import { inject, Injectable } from '@angular/core';

import {
  LANDING_TELEMETRY_PORT,
  LandingTelemetryPort,
} from '../ports/landing-telemetry.port';

@Injectable()
export class ReportSpeechPlaybackStartedUseCase {
  private readonly telemetry = inject<LandingTelemetryPort>(LANDING_TELEMETRY_PORT);

  execute(categoryId: string): void {
    this.telemetry.trackSpeechPlaybackStarted(categoryId);
  }
}
