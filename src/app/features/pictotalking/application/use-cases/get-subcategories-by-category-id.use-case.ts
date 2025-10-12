import { inject, Injectable } from '@angular/core';
import { Subcategory } from '../../domain/entities/subcategory.entity';
import { PictotalkingRepository } from '../ports/pictotalking.repository';

@Injectable()
export class GetSubcategoriesByCategoryIdUseCase {
  private readonly repository = inject(PictotalkingRepository);

  execute(categoryId: string): Promise<Subcategory[]> {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }

    return this.repository.getSubcategoriesByCategoryId(categoryId);
  }
}
