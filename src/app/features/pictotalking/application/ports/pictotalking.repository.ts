import { Category } from '../../domain/entities/category.entity';
import { CategoryWithSubcategories } from '../../domain/entities/category-with-subcategories.entity';
import { Subcategory } from '../../domain/entities/subcategory.entity';
import { CategoryLevel } from '../../domain/value-objects/category-level';

export abstract class PictotalkingRepository {
  abstract getAllCategories(level?: CategoryLevel): Promise<Category[]>;
  abstract getCategoryById(id: string): Promise<CategoryWithSubcategories>;
  abstract getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]>;
}
