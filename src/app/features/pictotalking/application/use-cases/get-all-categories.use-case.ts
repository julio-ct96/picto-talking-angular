import { inject, Injectable } from '@angular/core';
import { Category } from '../../domain/entities/category.entity';
import { CategoryLevel } from '../../domain/value-objects/category-level';
import { PictotalkingRepository } from '../ports/pictotalking.repository';

@Injectable()
export class GetAllCategoriesUseCase {
  private readonly repository = inject(PictotalkingRepository);

  execute(level?: CategoryLevel): Promise<Category[]> {
    return this.repository.getAllCategories(level);
  }
}
