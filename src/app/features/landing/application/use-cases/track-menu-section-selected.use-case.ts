import { inject, Injectable } from '@angular/core';

import { LandingSectionId } from '../../domain/value-objects/landing-section-id';
import { LANDING_TELEMETRY_PORT, LandingTelemetryPort } from '../ports/landing-telemetry.port';

@Injectable()
export class TrackMenuSectionSelectedUseCase {
  private readonly telemetry = inject<LandingTelemetryPort>(LANDING_TELEMETRY_PORT);

  execute(section: LandingSectionId): void {
    this.telemetry.trackSectionSelected(section);
  }
}
