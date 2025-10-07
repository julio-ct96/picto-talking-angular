import {
  LandingCategoryEntity,
  LandingCategorySnapshot,
} from './landing-category.entity';
import { LandingMenuSectionEntity } from './landing-menu-section.entity';
import { LandingSectionId } from '../value-objects/landing-section-id';
import { LandingLocaleCode } from '../value-objects/landing-locale';

export interface LandingOverviewSnapshot {
  readonly sections: readonly {
    readonly id: LandingSectionId;
    readonly label: string;
    readonly hint: string;
  }[];
  readonly categories: readonly LandingCategorySnapshot[];
}

export class LandingOverviewEntity {
  constructor(
    readonly sections: readonly LandingMenuSectionEntity[],
    readonly categories: readonly LandingCategoryEntity[],
  ) {}

  toSnapshot(locale: LandingLocaleCode): LandingOverviewSnapshot {
    return {
      sections: this.sections.map((section) => ({
        id: section.id,
        label: section.label(locale),
        hint: section.hint(locale),
      })),
      categories: this.categories.map((category) => category.toSnapshot(locale)),
    };
  }
}
