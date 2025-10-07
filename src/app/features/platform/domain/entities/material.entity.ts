export class MaterialEntity {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly language: string | null;
  readonly createdAt: Date | null;
  readonly lastUpdatedAt: Date | null;
  readonly downloads: number;
  readonly score: number | null;
  readonly status: number | null;
  readonly activityIds: readonly number[];
  readonly areaIds: readonly number[];
  readonly authors: readonly unknown[];
  readonly files: Record<string, unknown> | null;
  readonly screenshots: Record<string, unknown> | null;
  readonly translations: readonly unknown[];

  constructor(params: {
    id: number;
    title: string;
    description: string;
    language?: string | null;
    createdAt?: string | Date | null;
    lastUpdatedAt?: string | Date | null;
    downloads?: number | null;
    score?: number | null;
    status?: number | null;
    activityIds?: readonly number[] | null;
    areaIds?: readonly number[] | null;
    authors?: readonly unknown[] | null;
    files?: Record<string, unknown> | null;
    screenshots?: Record<string, unknown> | null;
    translations?: readonly unknown[] | null;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.language = params.language ?? null;
    this.createdAt = params.createdAt ? new Date(params.createdAt) : null;
    this.lastUpdatedAt = params.lastUpdatedAt ? new Date(params.lastUpdatedAt) : null;
    this.downloads = params.downloads ?? 0;
    this.score = params.score ?? null;
    this.status = params.status ?? null;
    this.activityIds = params.activityIds ?? [];
    this.areaIds = params.areaIds ?? [];
    this.authors = params.authors ?? [];
    this.files = params.files ?? null;
    this.screenshots = params.screenshots ?? null;
    this.translations = params.translations ?? [];
  }

  hasScreenshots(): boolean {
    return this.screenshots !== null && Object.keys(this.screenshots).length > 0;
  }
}
