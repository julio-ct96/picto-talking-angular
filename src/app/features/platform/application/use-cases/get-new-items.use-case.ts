import { inject, Injectable } from '@angular/core';

import {
  ARASAAC_REPOSITORY,
  ArasaacRepository,
  GetNewItemsParams,
  NewItemsResult,
} from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class GetNewItemsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute<TType extends GetNewItemsParams['type']>(
    params: GetNewItemsParams<TType>,
  ): Promise<NewItemsResult<TType>> {
    if (params.type === 'materials') {
      return this.repository.getNewItems(
        params as GetNewItemsParams<'materials'>,
      ) as Promise<NewItemsResult<TType>>;
    }

    return this.repository.getNewItems(
      params as GetNewItemsParams<'pictograms'>,
    ) as Promise<NewItemsResult<TType>>;
  }
}
