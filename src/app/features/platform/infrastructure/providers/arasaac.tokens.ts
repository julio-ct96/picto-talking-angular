import { InjectionToken } from '@angular/core';

export const ARASAAC_API_BASE_URL = new InjectionToken<string>('ARASAAC_API_BASE_URL', {
  factory: () => 'https://api.arasaac.org/v1'
});
