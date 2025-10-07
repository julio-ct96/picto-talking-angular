import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { LandingViewModel } from '../view-models/landing.view-model';
import { LandingSectionId } from '../../domain/value-objects/landing-section-id';
import { LoadLandingOverviewUseCase } from '../../application/use-cases/load-landing-overview.use-case';
import { TrackMenuSectionSelectedUseCase } from '../../application/use-cases/track-menu-section-selected.use-case';
import { ReportSpeechUnavailableUseCase } from '../../application/use-cases/report-speech-unavailable.use-case';
import { ReportSpeechPlaybackStartedUseCase } from '../../application/use-cases/report-speech-playback-started.use-case';
import { ReportSpeechPlaybackFailedUseCase } from '../../application/use-cases/report-speech-playback-failed.use-case';
import { LandingAsideComponent } from '../../../../shared/components/landing-aside/landing-aside.component';

@Component({
  selector: 'pic-landing-page',
  standalone: true,
  imports: [NgOptimizedImage, LandingAsideComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LandingViewModel,
    LoadLandingOverviewUseCase,
    TrackMenuSectionSelectedUseCase,
    ReportSpeechUnavailableUseCase,
    ReportSpeechPlaybackStartedUseCase,
    ReportSpeechPlaybackFailedUseCase,
  ],
})
export class LandingPageComponent implements OnInit {
  readonly vm = inject(LandingViewModel);

  ngOnInit(): void {
    this.vm.initialize();
  }

  onSelectSection(sectionId: LandingSectionId): void {
    this.vm.selectSection(sectionId);
  }

  onToggleMenu(): void {
    this.vm.toggleMenu();
  }

  onCategoryActivate(categoryId: string): void {
    this.vm.activateCategory(categoryId);
  }

  onDismissBanner(): void {
    this.vm.dismissSpeechBanner();
  }
}
