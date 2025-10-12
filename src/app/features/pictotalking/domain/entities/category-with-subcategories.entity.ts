import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity';

export class CategoryWithSubcategories {
  private constructor(
    public readonly category: Category,
    public readonly subcategories: readonly Subcategory[]
  ) {}

  static create(
    category: Category,
    subcategories: readonly Subcategory[]
  ): CategoryWithSubcategories {
    return new CategoryWithSubcategories(category, subcategories);
  }

  get subcategoryCount(): number {
    return this.subcategories.length;
  }

  get hasSubcategories(): boolean {
    return this.subcategories.length > 0;
  }

  findSubcategory(subcategoryId: string): Subcategory | undefined {
    return this.subcategories.find(sub => sub.id === subcategoryId);
  }
}
