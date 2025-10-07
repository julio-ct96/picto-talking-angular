import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';

import {
  DEFAULT_SECTION_ID,
  LandingSectionId,
} from '../../domain/value-objects/landing-section-id';
import { LandingLocaleCode } from '../../domain/value-objects/landing-locale';
import { LoadLandingOverviewUseCase } from '../../application/use-cases/load-landing-overview.use-case';
import { TrackMenuSectionSelectedUseCase } from '../../application/use-cases/track-menu-section-selected.use-case';
import {
  ReportSpeechUnavailableUseCase,
  SpeechUnavailableReason,
} from '../../application/use-cases/report-speech-unavailable.use-case';
import { ReportSpeechPlaybackStartedUseCase } from '../../application/use-cases/report-speech-playback-started.use-case';
import { ReportSpeechPlaybackFailedUseCase } from '../../application/use-cases/report-speech-playback-failed.use-case';
import {
  LANDING_FEATURE_FLAG_PORT,
  LandingFeatureFlagPort,
} from '../../application/ports/landing-feature-flag.port';
import {
  SpeechPlaybackFacade,
  SpeechPlaybackIssue,
} from '../../../platform/application/services/speech-playback.facade';
import { LandingOverviewSnapshot } from '../../domain/entities/landing-overview.entity';
import { LocaleCode } from '../../../platform/domain/value-objects/locale-code';

export interface LandingSectionView {
  readonly id: LandingSectionId;
  readonly label: string;
  readonly hint: string;
  readonly icon: string;
}

export interface LandingCategoryView {
  readonly id: string;
  readonly title: string;
  readonly pictogramUrl: string;
  readonly imageAlt: string;
  readonly speechText: string;
}

export interface LandingSpeechBanner {
  readonly title: string;
  readonly description: string;
  readonly type: 'warning';
}

export interface LandingViewState {
  readonly loading: boolean;
  readonly featureEnabled: boolean;
  readonly menuCollapsed: boolean;
  readonly sections: readonly LandingSectionView[];
  readonly activeSectionId: LandingSectionId;
  readonly categories: readonly LandingCategoryView[];
  readonly speechBanner: LandingSpeechBanner | null;
  readonly liveAnnouncement: string | null;
  readonly locale: LandingLocaleCode;
}

@Injectable()
export class LandingViewModel {
  private readonly loadOverview = inject(LoadLandingOverviewUseCase);
  private readonly trackSectionSelected = inject(TrackMenuSectionSelectedUseCase);
  private readonly reportSpeechUnavailable = inject(ReportSpeechUnavailableUseCase);
  private readonly reportSpeechStarted = inject(ReportSpeechPlaybackStartedUseCase);
  private readonly reportSpeechFailed = inject(ReportSpeechPlaybackFailedUseCase);

  private readonly featureFlag = inject<LandingFeatureFlagPort>(
    LANDING_FEATURE_FLAG_PORT,
  );
  private readonly speechFacade = inject(SpeechPlaybackFacade);

  private readonly loading: WritableSignal<boolean> = signal(true);
  private readonly featureEnabled: WritableSignal<boolean> = signal(true);
  private readonly menuCollapsed: WritableSignal<boolean> = signal(false);
  private readonly sections: WritableSignal<readonly LandingSectionView[]> = signal([]);
  private readonly categories: WritableSignal<readonly LandingCategoryView[]> = signal(
    [],
  );
  private readonly activeSection: WritableSignal<LandingSectionId> =
    signal(DEFAULT_SECTION_ID);
  private readonly locale: WritableSignal<LandingLocaleCode> = signal('es');
  private readonly speechBanner: WritableSignal<LandingSpeechBanner | null> =
    signal(null);
  private readonly liveAnnouncement: WritableSignal<string | null> = signal(null);
  private readonly lastSpokenCategoryId: WritableSignal<string | null> = signal(null);

  private lastHandledIssueAt = 0;

  readonly state = computed<LandingViewState>(() => ({
    loading: this.loading(),
    featureEnabled: this.featureEnabled(),
    menuCollapsed: this.menuCollapsed(),
    sections: this.sections(),
    activeSectionId: this.activeSection(),
    categories: this.categories(),
    speechBanner: this.speechBanner(),
    liveAnnouncement: this.liveAnnouncement(),
    locale: this.locale(),
  }));

  constructor() {
    effect(() => {
      const issue = this.speechFacade.lastIssue();
      if (!issue || issue.occurredAt <= this.lastHandledIssueAt) {
        return;
      }

      this.lastHandledIssueAt = issue.occurredAt;
      this.handleSpeechIssue(issue);
    });
  }

  async initialize(): Promise<void> {
    const enabled = this.featureFlag.isLandingEnabled();
    this.featureEnabled.set(enabled);

    if (!enabled) {
      this.loading.set(false);
      return;
    }

    try {
      const { locale, snapshot } = await this.loadOverview.execute();
      this.locale.set(locale);
      this.applyOverviewSnapshot(snapshot);
      this.loading.set(false);
      this.announceActiveSection(DEFAULT_SECTION_ID);
    } catch (error) {
      console.error('[Landing] Failed to load overview', error);
      this.loading.set(false);
      this.speechBanner.set(this.buildFallbackBanner());
    }
  }

  toggleMenu(): void {
    this.menuCollapsed.update((current) => !current);
  }

  setMenuCollapsed(collapsed: boolean): void {
    this.menuCollapsed.set(collapsed);
  }

  selectSection(sectionId: LandingSectionId): void {
    if (this.activeSection() === sectionId) {
      return;
    }

    this.activeSection.set(sectionId);
    this.trackSectionSelected.execute(sectionId);
    this.announceActiveSection(sectionId);
    if (this.isSmallViewport()) {
      this.menuCollapsed.set(true);
    }
  }

  async activateCategory(categoryId: string): Promise<void> {
    const category = this.categories().find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    this.speechFacade.clearIssue();
    this.speechBanner.set(null);

    const enabled = this.speechFacade.isEnabled();
    if (!enabled) {
      this.emitSpeechUnavailable('feature-disabled');
      return;
    }

    if (!this.speechFacade.supportsSpeech()) {
      this.emitSpeechUnavailable('engine-not-supported');
      return;
    }

    this.lastSpokenCategoryId.set(categoryId);
    this.reportSpeechStarted.execute(categoryId);

    await this.speechFacade.requestSpeech({
      text: category.speechText,
      locale: this.locale() as LocaleCode,
    });
  }

  dismissSpeechBanner(): void {
    this.speechFacade.clearIssue();
    this.speechBanner.set(null);
  }

  private applyOverviewSnapshot(snapshot: LandingOverviewSnapshot): void {
    this.sections.set(snapshot.sections);
    this.categories.set(snapshot.categories as readonly LandingCategoryView[]);
  }

  private announceActiveSection(sectionId: LandingSectionId): void {
    const locale = this.locale();
    const section = this.sections().find((item) => item.id === sectionId);
    if (!section) {
      return;
    }

    const message =
      locale === 'en'
        ? `Active section: ${section.label}`
        : `Sección activa: ${section.label}`;
    this.liveAnnouncement.set(message);
  }

  private handleSpeechIssue(issue: SpeechPlaybackIssue): void {
    if (issue.type === 'unavailable') {
      this.reportSpeechUnavailable.execute(issue.reason as SpeechUnavailableReason);
      this.speechBanner.set(
        this.buildUnavailableBanner(issue.reason as SpeechUnavailableReason),
      );
      return;
    }

    const categoryId = this.lastSpokenCategoryId() ?? 'unknown';
    this.reportSpeechFailed.execute(categoryId, issue.reason);
    this.speechBanner.set(this.buildFailedBanner());
  }

  private emitSpeechUnavailable(reason: SpeechUnavailableReason): void {
    this.reportSpeechUnavailable.execute(reason);
    this.speechBanner.set(this.buildUnavailableBanner(reason));
  }

  private buildUnavailableBanner(reason: SpeechUnavailableReason): LandingSpeechBanner {
    const locale = this.locale();
    if (locale === 'en') {
      const description =
        reason === 'feature-disabled'
          ? 'Enable the voice feature in system settings or ask a coordinator for help.'
          : 'Your device cannot play speech right now. Check your internet connection or retry later.';
      return {
        title: 'Voice not available',
        description,
        type: 'warning',
      };
    }

    const descriptionEs =
      reason === 'feature-disabled'
        ? 'Activa el servicio de voz en la configuración o pide ayuda a tu coordinador.'
        : 'No podemos reproducir la voz ahora mismo. Comprueba tu conexión o inténtalo de nuevo.';
    return {
      title: 'Voz no disponible',
      description: descriptionEs,
      type: 'warning',
    };
  }

  private buildFailedBanner(): LandingSpeechBanner {
    const locale = this.locale();
    if (locale === 'en') {
      return {
        title: 'We could not finish the voice playback',
        description:
          'Please try again. If the problem continues, refresh the page or contact support.',
        type: 'warning',
      };
    }

    return {
      title: 'No pudimos completar la reproducción de voz',
      description:
        'Vuelve a intentarlo. Si el problema persiste, actualiza la página o contacta con soporte.',
      type: 'warning',
    };
  }

  private buildFallbackBanner(): LandingSpeechBanner {
    const locale = this.locale();
    if (locale === 'en') {
      return {
        title: 'Landing content is temporarily unavailable',
        description: 'Reload the page or switch to the legacy experience from the menu.',
        type: 'warning',
      };
    }

    return {
      title: 'El contenido de la landing no está disponible',
      description: 'Recarga la página o vuelve a la experiencia anterior desde el menú.',
      type: 'warning',
    };
  }

  private isSmallViewport(): boolean {
    if (
      typeof globalThis === 'undefined' ||
      typeof globalThis.matchMedia !== 'function'
    ) {
      return false;
    }

    return globalThis.matchMedia('(max-width: 1024px)').matches;
  }
}
