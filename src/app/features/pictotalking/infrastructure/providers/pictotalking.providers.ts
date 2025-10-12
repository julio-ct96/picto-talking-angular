import { Provider } from '@angular/core';
import { PictotalkingRepository } from '../../application/ports/pictotalking.repository';
import { GetAllCategoriesUseCase } from '../../application/use-cases/get-all-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/use-cases/get-category-by-id.use-case';
import { GetSubcategoriesByCategoryIdUseCase } from '../../application/use-cases/get-subcategories-by-category-id.use-case';
import { HttpPictotalkingRepository } from '../repositories/http-pictotalking.repository';

export function providePictotalkingFeature(): Provider[] {
  return [
    {
      provide: PictotalkingRepository,
      useClass: HttpPictotalkingRepository,
    },
    GetAllCategoriesUseCase,
    GetCategoryByIdUseCase,
    GetSubcategoriesByCategoryIdUseCase,
  ];
}
