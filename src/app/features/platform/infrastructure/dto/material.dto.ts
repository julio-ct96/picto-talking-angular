export interface MaterialDto {
  readonly _id?: string;
  readonly id?: number;
  readonly title?: string;
  readonly desc?: string;
  readonly language?: string;
  readonly lang?: string;
  readonly created?: string;
  readonly lastUpdate?: string;
  readonly downloads?: number;
  readonly score?: number;
  readonly status?: number;
  readonly activity?: readonly number[];
  readonly area?: readonly number[];
  readonly authors?: readonly unknown[];
  readonly files?: Record<string, unknown>;
  readonly file?: Record<string, unknown>;
  readonly screenshots?: Record<string, unknown>;
  readonly translations?: readonly unknown[];
}
