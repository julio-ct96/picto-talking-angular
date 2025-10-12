import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { PictotalkingRepository } from '../../application/ports/pictotalking.repository';
import { Category } from '../../domain/entities/category.entity';
import { CategoryWithSubcategories } from '../../domain/entities/category-with-subcategories.entity';
import { Subcategory } from '../../domain/entities/subcategory.entity';
import { CategoryLevel } from '../../domain/value-objects/category-level';
import { CategoryDto } from '../dtos/category.dto';
import { CategoryWithSubcategoriesDto } from '../dtos/category-with-subcategories.dto';
import { SubcategoryDto } from '../dtos/subcategory.dto';
import { categoryMapper } from '../mappers/category.mapper';
import { categoryWithSubcategoriesMapper } from '../mappers/category-with-subcategories.mapper';
import { subcategoryMapper } from '../mappers/subcategory.mapper';

@Injectable()
export class HttpPictotalkingRepository implements PictotalkingRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  async getAllCategories(level?: CategoryLevel): Promise<Category[]> {
    let params = new HttpParams();
    if (level) {
      params = params.set('level', level);
    }

    const categories$ = this.http
      .get<CategoryDto[]>(`${this.baseUrl}/categories`, { params })
      .pipe(map(dtos => dtos.map(dto => categoryMapper.toEntity(dto))));

    return firstValueFrom(categories$);
  }

  async getCategoryById(id: string): Promise<CategoryWithSubcategories> {
    const category$ = this.http
      .get<CategoryWithSubcategoriesDto>(`${this.baseUrl}/categories/${id}`)
      .pipe(map(dto => categoryWithSubcategoriesMapper.toEntity(dto)));

    return firstValueFrom(category$);
  }

  async getSubcategoriesByCategoryId(
    categoryId: string
  ): Promise<Subcategory[]> {
    const subcategories$ = this.http
      .get<SubcategoryDto[]>(
        `${this.baseUrl}/categories/${categoryId}/subcategories`
      )
      .pipe(map(dtos => dtos.map(dto => subcategoryMapper.toEntity(dto))));

    return firstValueFrom(subcategories$);
  }
}
