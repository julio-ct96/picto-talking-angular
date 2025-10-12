import { CategoryWithSubcategories } from '../../domain/entities/category-with-subcategories.entity';
import { CategoryWithSubcategoriesDto } from '../dtos/category-with-subcategories.dto';
import { categoryMapper } from './category.mapper';
import { subcategoryMapper } from './subcategory.mapper';

class CategoryWithSubcategoriesMapper {
  toEntity(dto: CategoryWithSubcategoriesDto): CategoryWithSubcategories {
    const category = categoryMapper.toEntity(dto.category);
    const subcategories = dto.subcategories.map(sub =>
      subcategoryMapper.toEntity(sub)
    );
    return CategoryWithSubcategories.create(category, subcategories);
  }

  toDto(entity: CategoryWithSubcategories): CategoryWithSubcategoriesDto {
    return {
      category: categoryMapper.toDto(entity.category),
      subcategories: entity.subcategories.map(sub =>
        subcategoryMapper.toDto(sub)
      ),
    };
  }
}

export const categoryWithSubcategoriesMapper =
  new CategoryWithSubcategoriesMapper();
