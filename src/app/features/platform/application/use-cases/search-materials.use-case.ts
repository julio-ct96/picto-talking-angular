import { inject, Injectable } from '@angular/core';

import { MaterialEntity } from '../../domain/entities/material.entity';
import { ARASAAC_REPOSITORY, ArasaacRepository, SearchMaterialsParams } from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class SearchMaterialsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute(params: SearchMaterialsParams): Promise<readonly MaterialEntity[]> {
    return this.repository.searchMaterials(params);
  }
}
