import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { LandingViewModel } from '../view-models/landing.view-model';
import { LandingSectionId } from '../../domain/value-objects/landing-section-id';
import { LoadLandingOverviewUseCase } from '../../application/use-cases/load-landing-overview.use-case';
import { TrackMenuSectionSelectedUseCase } from '../../application/use-cases/track-menu-section-selected.use-case';
import { ReportSpeechUnavailableUseCase } from '../../application/use-cases/report-speech-unavailable.use-case';
import { ReportSpeechPlaybackStartedUseCase } from '../../application/use-cases/report-speech-playback-started.use-case';
import { ReportSpeechPlaybackFailedUseCase } from '../../application/use-cases/report-speech-playback-failed.use-case';
import { LandingAsideComponent } from '@shared/components/landing-aside/landing-aside.component';
import { CardComponent } from '@shared/components/card/card.component';
import { PictogramOptionsComponent } from '@shared/components/pictogram-options/pictogram-options.component';
import { PictogramOptionsSelectionChangedEvent } from '@shared/components/pictogram-options/pictogram-options.interface';

@Component({
  selector: 'pic-landing-page',
  standalone: true,
  imports: [LandingAsideComponent, CardComponent, PictogramOptionsComponent],
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
  readonly expandedCategoryId = signal<string | null>(null);
  readonly isFocusMode = computed(() => this.expandedCategoryId() !== null);

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
    const isAlreadyExpanded = this.expandedCategoryId() === categoryId;
    this.expandedCategoryId.set(isAlreadyExpanded ? null : categoryId);

    if (isAlreadyExpanded) {
      this.vm.announceFocusModeExit();
      return;
    }

    this.vm.activateCategory(categoryId);
    this.vm.announceFocusModeEntry(categoryId);
  }

  onSubsectionsChanged(
    categoryId: string,
    event: PictogramOptionsSelectionChangedEvent,
  ): void {
    if (!event.isSelected) {
      return;
    }

    this.vm.selectSubcategory(categoryId, event.lastChangedId);
  }

  onDismissBanner(): void {
    this.vm.dismissSpeechBanner();
  }
}
