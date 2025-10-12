import { Category } from '../../domain/entities/category.entity';
import { CategoryLevel } from '../../domain/value-objects/category-level';
import { CategoryDto } from '../dtos/category.dto';

export interface Mapper<Entity, Dto> {
  toEntity(dto: Dto): Entity;
  toDto(entity: Entity): Dto;
}

class CategoryMapper implements Mapper<Category, CategoryDto> {
  toEntity(dto: CategoryDto): Category {
    return Category.create(
      dto.id,
      dto.name,
      dto.arasaacName,
      dto.description,
      CategoryLevel[dto.level],
      dto.imageUrl,
      dto.icon,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  toDto(entity: Category): CategoryDto {
    return {
      id: entity.id,
      name: entity.name,
      arasaacName: entity.arasaacName,
      description: entity.description,
      level: entity.level,
      imageUrl: entity.imageUrl,
      icon: entity.icon,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

export const categoryMapper = new CategoryMapper();
