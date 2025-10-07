import { inject, Injectable } from '@angular/core';

import {
  LANDING_TELEMETRY_PORT,
  LandingTelemetryPort,
} from '../ports/landing-telemetry.port';

export type SpeechUnavailableReason = 'feature-disabled' | 'engine-not-supported';

@Injectable()
export class ReportSpeechUnavailableUseCase {
  private readonly telemetry = inject<LandingTelemetryPort>(LANDING_TELEMETRY_PORT);

  execute(reason: SpeechUnavailableReason): void {
    this.telemetry.trackSpeechUnavailable(reason);
  }
}
