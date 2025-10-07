import {
  DEFAULT_LANDING_LOCALE,
  LandingLocaleCode,
} from '../value-objects/landing-locale';

export interface LandingCategorySnapshot {
  readonly id: string;
  readonly title: string;
  readonly pictogramUrl: string;
  readonly imageAlt: string;
  readonly speechText: string;
}

export class LandingCategoryEntity {
  constructor(
    readonly id: string,
    private readonly titleByLocale: Readonly<Record<LandingLocaleCode, string>>,
    readonly pictogramUrl: string,
  ) {}

  title(locale: LandingLocaleCode): string {
    return this.titleByLocale[locale] ?? this.titleByLocale[DEFAULT_LANDING_LOCALE];
  }

  speechText(locale: LandingLocaleCode): string {
    return this.title(locale);
  }

  imageAlt(locale: LandingLocaleCode): string {
    const title = this.title(locale);
    return locale === 'en' ? `Category ${title}` : `Categoría ${title}`;
  }

  toSnapshot(locale: LandingLocaleCode): LandingCategorySnapshot {
    return {
      id: this.id,
      title: this.title(locale),
      pictogramUrl: this.pictogramUrl,
      imageAlt: this.imageAlt(locale),
      speechText: this.speechText(locale),
    };
  }
}
