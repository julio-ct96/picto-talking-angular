import { Subcategory } from '../../domain/entities/subcategory.entity';
import { SubcategoryDto } from '../dtos/subcategory.dto';
import { Mapper } from './category.mapper';

class SubcategoryMapper implements Mapper<Subcategory, SubcategoryDto> {
  toEntity(dto: SubcategoryDto): Subcategory {
    return Subcategory.create(
      dto.id,
      dto.categoryId,
      dto.name,
      dto.description,
      dto.imageUrl,
      dto.arasaacCategories,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  toDto(entity: Subcategory): SubcategoryDto {
    return {
      id: entity.id,
      categoryId: entity.categoryId,
      name: entity.name,
      description: entity.description,
      imageUrl: entity.imageUrl,
      arasaacCategories: [...entity.arasaacCategories],
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

export const subcategoryMapper = new SubcategoryMapper();
