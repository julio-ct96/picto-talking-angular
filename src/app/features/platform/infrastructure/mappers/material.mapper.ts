import { MaterialEntity } from '../../domain/entities/material.entity';
import { MaterialDto } from '../dto/material.dto';

export const mapMaterialDtoToEntity = (dto: MaterialDto): MaterialEntity =>
  new MaterialEntity({
    id: dto.id ?? 0,
    title: dto.title ?? '',
    description: dto.desc ?? '',
    language: dto.language ?? dto.lang ?? null,
    createdAt: dto.created ?? null,
    lastUpdatedAt: dto.lastUpdate ?? null,
    downloads: dto.downloads ?? 0,
    score: dto.score ?? null,
    status: dto.status ?? null,
    activityIds: dto.activity ?? [],
    areaIds: dto.area ?? [],
    authors: dto.authors ?? [],
    files: dto.files ?? dto.file ?? null,
    screenshots: dto.screenshots ?? null,
    translations: dto.translations ?? [],
  });
