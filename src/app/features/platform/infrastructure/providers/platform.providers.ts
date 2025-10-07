import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ARASAAC_REPOSITORY } from '../../application/ports/arasaac.repository';
import { ArasaacService } from '../repositories/arasaac.service';

export function providePlatformData(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ArasaacService,
    {
      provide: ARASAAC_REPOSITORY,
      useExisting: ArasaacService
    }
  ]);
}
