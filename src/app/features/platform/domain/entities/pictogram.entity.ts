import { KeywordEntity } from './keyword.entity';

export class PictogramEntity {
  readonly id: number;
  readonly keywords: readonly KeywordEntity[];
  readonly schematic: boolean;
  readonly sex: boolean;
  readonly violence: boolean;
  readonly created: Date | null;
  readonly lastUpdated: Date | null;
  readonly downloads: number;
  readonly categories: readonly string[];
  readonly synsets: readonly string[];
  readonly tags: readonly string[];
  readonly description: string | null;

  constructor(params: {
    id: number;
    keywords?: readonly KeywordEntity[];
    schematic?: boolean;
    sex?: boolean;
    violence?: boolean;
    created?: Date | string | null;
    lastUpdated?: Date | string | null;
    downloads?: number;
    categories?: readonly string[] | null;
    synsets?: readonly string[] | null;
    tags?: readonly string[] | null;
    description?: string | null;
  }) {
    this.id = params.id;
    this.keywords = params.keywords ?? [];
    this.schematic = params.schematic ?? false;
    this.sex = params.sex ?? false;
    this.violence = params.violence ?? false;
    this.created = params.created ? new Date(params.created) : null;
    this.lastUpdated = params.lastUpdated ? new Date(params.lastUpdated) : null;
    this.downloads = params.downloads ?? 0;
    this.categories = params.categories ?? [];
    this.synsets = params.synsets ?? [];
    this.tags = params.tags ?? [];
    this.description = params.description ?? null;
  }

  isDeprecated(): boolean {
    return this.tags.includes('deprecated');
  }
}
