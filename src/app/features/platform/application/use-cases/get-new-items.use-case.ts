import { inject, Injectable } from '@angular/core';

import {
  ARASAAC_REPOSITORY,
  ArasaacRepository,
  GetNewItemsParams,
  NewItemsResult
} from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class GetNewItemsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute<TType extends GetNewItemsParams['type']>(params: GetNewItemsParams<TType>): Promise<NewItemsResult<TType>> {
    return this.repository.getNewItems(params);
  }
}
