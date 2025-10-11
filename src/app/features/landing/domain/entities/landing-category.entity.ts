import {
  DEFAULT_LANDING_LOCALE,
  LandingLocaleCode,
} from '../value-objects/landing-locale';

export interface SubcategoryData {
  readonly id: string;
  readonly titles: Record<LandingLocaleCode, string>;
  readonly pictogramUrl: string;
}

export interface LandingCategorySnapshot {
  readonly id: string;
  readonly title: string;
  readonly pictogramUrl: string;
  readonly imageAlt: string;
  readonly speechText: string;
  readonly subcategories?: readonly {
    readonly id: string;
    readonly label: string;
    readonly pictogramUrl: string;
    readonly imageAlt: string;
  }[];
}

export class LandingCategoryEntity {
  constructor(
    readonly id: string,
    private readonly titleByLocale: Readonly<Record<LandingLocaleCode, string>>,
    readonly pictogramUrl: string,
    private readonly subcategoriesData?: readonly SubcategoryData[],
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
      subcategories: this.subcategoriesData?.map((sub) => ({
        id: sub.id,
        label: sub.titles[locale] ?? sub.titles[DEFAULT_LANDING_LOCALE],
        pictogramUrl: sub.pictogramUrl,
        imageAlt:
          locale === 'en'
            ? `Subcategory ${sub.titles[locale]}`
            : `Subcategoría ${sub.titles[locale]}`,
      })),
    };
  }
}
