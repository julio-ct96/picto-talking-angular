import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePlatformData } from '@features/platform/infrastructure/providers/platform.providers';
import { provideLandingFeature } from '@features/landing/infrastructure/providers/landing.providers';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    providePlatformData(),
    provideLandingFeature(),
    provideHttpClient(),
  ],
};
