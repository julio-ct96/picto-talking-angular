import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { LANDING_CONTENT_PORT } from '../../application/ports/landing-content.port';
import { LANDING_LOCALE_PORT } from '../../application/ports/landing-locale.port';
import { LANDING_TELEMETRY_PORT } from '../../application/ports/landing-telemetry.port';
import { StaticLandingContentAdapter } from '../adapters/static-landing-content.adapter';
import { LandingLocaleAdapter } from '../adapters/landing-locale.adapter';
import { ConsoleLandingTelemetryService } from '../adapters/console-landing-telemetry.service';

export function provideLandingFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    StaticLandingContentAdapter,
    LandingLocaleAdapter,
    ConsoleLandingTelemetryService,
    {
      provide: LANDING_CONTENT_PORT,
      useExisting: StaticLandingContentAdapter,
    },
    {
      provide: LANDING_LOCALE_PORT,
      useExisting: LandingLocaleAdapter,
    },
    {
      provide: LANDING_TELEMETRY_PORT,
      useExisting: ConsoleLandingTelemetryService,
    },
  ]);
}
