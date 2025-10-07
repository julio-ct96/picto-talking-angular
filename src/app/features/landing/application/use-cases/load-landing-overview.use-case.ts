import { inject, Injectable } from '@angular/core';

import { LandingOverviewSnapshot } from '../../domain/entities/landing-overview.entity';
import { LANDING_CONTENT_PORT, LandingContentPort } from '../ports/landing-content.port';
import { LANDING_LOCALE_PORT, LandingLocalePort } from '../ports/landing-locale.port';
import {
  LANDING_TELEMETRY_PORT,
  LandingTelemetryPort,
} from '../ports/landing-telemetry.port';

@Injectable()
export class LoadLandingOverviewUseCase {
  private readonly content = inject<LandingContentPort>(LANDING_CONTENT_PORT);
  private readonly locale = inject<LandingLocalePort>(LANDING_LOCALE_PORT);
  private readonly telemetry = inject<LandingTelemetryPort>(LANDING_TELEMETRY_PORT);

  async execute(): Promise<{
    locale: ReturnType<LandingLocalePort['resolvePreferredLocale']>;
    snapshot: LandingOverviewSnapshot;
  }> {
    const locale = this.locale.resolvePreferredLocale();
    const overview = await this.content.loadInitialContent();
    const snapshot = overview.toSnapshot(locale);
    this.telemetry.trackLandingLoaded();
    return { locale, snapshot };
  }
}
