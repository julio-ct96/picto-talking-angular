import { inject, Injectable } from '@angular/core';

import { PictogramEntity } from '../../domain/entities/pictogram.entity';
import { SearchPictogramsParams } from '../ports/arasaac.repository';
import { ARASAAC_REPOSITORY, ArasaacRepository } from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class SearchPictogramsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute(params: SearchPictogramsParams): Promise<readonly PictogramEntity[]> {
    return this.repository.searchPictograms(params);
  }
}
