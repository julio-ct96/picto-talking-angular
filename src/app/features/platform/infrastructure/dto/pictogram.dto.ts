import { KeywordDto } from './keyword.dto';

export interface PictogramDto {
  readonly _id?: number;
  readonly keywords?: readonly KeywordDto[];
  readonly schematic?: boolean;
  readonly sex?: boolean;
  readonly violence?: boolean;
  readonly created?: string;
  readonly lastUpdated?: string;
  readonly downloads?: number;
  readonly categories?: readonly string[];
  readonly synsets?: readonly string[];
  readonly tags?: readonly string[];
  readonly desc?: string;
}
