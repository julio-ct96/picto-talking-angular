import { inject, Injectable } from '@angular/core';

import { MaterialEntity } from '../../domain/entities/material.entity';
import { ARASAAC_REPOSITORY, ArasaacRepository } from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class GetMaterialByIdUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute(id: number): Promise<MaterialEntity> {
    return this.repository.getMaterialById(id);
  }
}
