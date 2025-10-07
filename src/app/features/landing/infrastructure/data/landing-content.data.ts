import { LandingMenuSectionEntity } from '../../domain/entities/landing-menu-section.entity';
import { LandingCategoryEntity } from '../../domain/entities/landing-category.entity';
import { LandingLocaleCode } from '../../domain/value-objects/landing-locale';
import { LandingSectionId } from '../../domain/value-objects/landing-section-id';

interface SectionData {
  readonly id: LandingSectionId;
  readonly labels: Record<LandingLocaleCode, string>;
  readonly hints: Record<LandingLocaleCode, string>;
}

interface CategoryData {
  readonly id: string;
  readonly titles: Record<LandingLocaleCode, string>;
  readonly pictogramUrl: string;
}

const SECTION_DATA: readonly SectionData[] = [
  {
    id: 'categories',
    labels: {
      es: 'Categorías',
      en: 'Categories',
    },
    hints: {
      es: 'Explora pictogramas organizados por temas',
      en: 'Browse pictograms organised by theme',
    },
  },
  {
    id: 'favorites',
    labels: {
      es: 'Favoritos',
      en: 'Favorites',
    },
    hints: {
      es: 'Accede rápidamente a tus pictogramas guardados',
      en: 'Reach your saved pictograms right away',
    },
  },
  {
    id: 'phrases',
    labels: {
      es: 'Frases predefinidas',
      en: 'Preset phrases',
    },
    hints: {
      es: 'Encuentra frases útiles preparadas para ti',
      en: 'Find ready-made helpful phrases',
    },
  },
];

const CATEGORY_DATA: readonly CategoryData[] = [
  {
    id: 'animals',
    titles: {
      es: 'Animales',
      en: 'Animals',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/11220/11220_500.png',
  },
  {
    id: 'food',
    titles: {
      es: 'Comida',
      en: 'Food',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/3470/3470_500.png',
  },
  {
    id: 'people',
    titles: {
      es: 'Personas',
      en: 'People',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/32608/32608_500.png',
  },
  {
    id: 'actions',
    titles: {
      es: 'Acciones',
      en: 'Actions',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/33327/33327_500.png',
  },
  {
    id: 'feelings',
    titles: {
      es: 'Emociones',
      en: 'Feelings',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/15062/15062_500.png',
  },
  {
    id: 'school',
    titles: {
      es: 'Escuela',
      en: 'School',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/3700/3700_500.png',
  },
  {
    id: 'home',
    titles: {
      es: 'Casa',
      en: 'Home',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/15910/15910_500.png',
  },
  {
    id: 'leisure',
    titles: {
      es: 'Juegos',
      en: 'Play',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/13921/13921_500.png',
  },
  {
    id: 'health',
    titles: {
      es: 'Salud',
      en: 'Health',
    },
    pictogramUrl: 'https://static.arasaac.org/pictograms/14563/14563_500.png',
  },
];

export function buildLandingSections(): readonly LandingMenuSectionEntity[] {
  return SECTION_DATA.map(
    (section) => new LandingMenuSectionEntity(section.id, section.labels, section.hints),
  );
}

export function buildLandingCategories(): readonly LandingCategoryEntity[] {
  return CATEGORY_DATA.map(
    (category) =>
      new LandingCategoryEntity(category.id, category.titles, category.pictogramUrl),
  );
}
