import { LandingSectionId } from '../value-objects/landing-section-id';
import { DEFAULT_LANDING_LOCALE, LandingLocaleCode } from '../value-objects/landing-locale';

export class LandingMenuSectionEntity {
  constructor(
    readonly id: LandingSectionId,
    private readonly labelByLocale: Readonly<Record<LandingLocaleCode, string>>,
    private readonly hintByLocale: Readonly<Record<LandingLocaleCode, string>>,
  ) {}

  label(locale: LandingLocaleCode): string {
    return this.labelByLocale[locale] ?? this.labelByLocale[DEFAULT_LANDING_LOCALE];
  }

  hint(locale: LandingLocaleCode): string {
    return this.hintByLocale[locale] ?? this.hintByLocale[DEFAULT_LANDING_LOCALE];
  }
}
