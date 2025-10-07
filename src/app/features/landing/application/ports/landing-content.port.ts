import { InjectionToken } from '@angular/core';

import { LandingOverviewEntity } from '../../domain/entities/landing-overview.entity';

export interface LandingContentPort {
  loadInitialContent(): Promise<LandingOverviewEntity>;
}

export const LANDING_CONTENT_PORT = new InjectionToken<LandingContentPort>(
  'LANDING_CONTENT_PORT',
);
