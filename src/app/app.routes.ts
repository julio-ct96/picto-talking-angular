import { Routes } from '@angular/router';

import { LandingPageComponent } from './features/landing/presentation/components/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
