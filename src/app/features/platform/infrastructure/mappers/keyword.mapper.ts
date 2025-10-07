import { KeywordEntity } from '../../domain/entities/keyword.entity';
import { KeywordDto } from '../dto/keyword.dto';

export const mapKeywordDtoToEntity = (dto: KeywordDto): KeywordEntity =>
  new KeywordEntity({
    id: dto.idKeyword ?? null,
    label: dto.keyword ?? '',
    plural: dto.plural ?? null,
    meaning: dto.meaning ?? null,
    type: dto.type ?? null,
    signLanguageId: dto.lse ?? null
  });

export const mapKeywordStringToEntity = (keyword: string): KeywordEntity =>
  new KeywordEntity({
    label: keyword
  });
