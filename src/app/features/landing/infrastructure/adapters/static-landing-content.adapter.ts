import { Injectable } from '@angular/core';

import { LandingContentPort } from '../../application/ports/landing-content.port';
import { LandingOverviewEntity } from '../../domain/entities/landing-overview.entity';
import { buildLandingCategories, buildLandingSections } from '../data/landing-content.data';

@Injectable()
export class StaticLandingContentAdapter implements LandingContentPort {
  async loadInitialContent(): Promise<LandingOverviewEntity> {
    const sections = buildLandingSections();
    const categories = buildLandingCategories();
    return new LandingOverviewEntity(sections, categories);
  }
}
