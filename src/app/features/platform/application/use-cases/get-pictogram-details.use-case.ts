import { inject, Injectable } from '@angular/core';

import { PictogramEntity } from '../../domain/entities/pictogram.entity';
import {
  GetPictogramDetailsParams,
  ARASAAC_REPOSITORY,
  ArasaacRepository,
} from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class GetPictogramDetailsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute(
    params: GetPictogramDetailsParams,
  ): Promise<PictogramEntity | readonly PictogramEntity[]> {
    return this.repository.getPictogramDetails(params);
  }
}
