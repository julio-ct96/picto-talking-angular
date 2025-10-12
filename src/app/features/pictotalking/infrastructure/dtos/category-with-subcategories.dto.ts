import { CategoryDto } from './category.dto';
import { SubcategoryDto } from './subcategory.dto';

export interface CategoryWithSubcategoriesDto {
  category: CategoryDto;
  subcategories: SubcategoryDto[];
}
