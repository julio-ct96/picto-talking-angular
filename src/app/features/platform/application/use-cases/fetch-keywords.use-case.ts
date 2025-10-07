import { inject, Injectable } from '@angular/core';

import { KeywordEntity } from '../../domain/entities/keyword.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { ARASAAC_REPOSITORY, ArasaacRepository } from '../ports/arasaac.repository';

@Injectable({ providedIn: 'root' })
export class FetchKeywordsUseCase {
  private readonly repository: ArasaacRepository = inject(ARASAAC_REPOSITORY);

  execute(language: LocaleCode): Promise<readonly KeywordEntity[]> {
    return this.repository.fetchKeywords(language);
  }
}
