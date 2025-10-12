import { inject, Injectable } from '@angular/core';
import { CategoryWithSubcategories } from '../../domain/entities/category-with-subcategories.entity';
import { PictotalkingRepository } from '../ports/pictotalking.repository';

@Injectable()
export class GetCategoryByIdUseCase {
  private readonly repository = inject(PictotalkingRepository);

  execute(categoryId: string): Promise<CategoryWithSubcategories> {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }

    return this.repository.getCategoryById(categoryId);
  }
}
