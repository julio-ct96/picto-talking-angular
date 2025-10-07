import { KeywordEntity } from '../../domain/entities/keyword.entity';
import { PictogramEntity } from '../../domain/entities/pictogram.entity';
import { KeywordDto } from '../dto/keyword.dto';
import { PictogramDto } from '../dto/pictogram.dto';
import { mapKeywordDtoToEntity } from './keyword.mapper';

const sanitizeKeywords = (keywords?: readonly KeywordDto[]): readonly KeywordEntity[] =>
  keywords?.map(mapKeywordDtoToEntity) ?? [];

export const mapPictogramDtoToEntity = (dto: PictogramDto): PictogramEntity =>
  new PictogramEntity({
    id: dto._id ?? 0,
    keywords: sanitizeKeywords(dto.keywords),
    schematic: dto.schematic ?? false,
    sex: dto.sex ?? false,
    violence: dto.violence ?? false,
    created: dto.created ?? null,
    lastUpdated: dto.lastUpdated ?? null,
    downloads: dto.downloads ?? 0,
    categories: dto.categories ?? [],
    synsets: dto.synsets ?? [],
    tags: dto.tags ?? [],
    description: dto.desc ?? null,
  });
