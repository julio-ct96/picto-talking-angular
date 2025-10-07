import {
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FeatureFlagPort, FEATURE_FLAG_PORT } from '../ports/feature-flag.port';
import { SPEECH_ENGINE, SpeechEnginePort } from '../ports/speech-engine.port';
import {
  SPEECH_TELEMETRY_PORT,
  SpeechTelemetryPort,
} from '../ports/speech-telemetry.port';
import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { SpeechQueueEntity } from '../../domain/entities/speech-queue.entity';
import {
  SpeechRequestEntity,
  SpeechRequestSnapshot,
} from '../../domain/entities/speech-request.entity';
import { SpeechVoiceEntity } from '../../domain/entities/speech-voice.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { SpeechPitch } from '../../domain/value-objects/speech-pitch';
import { SpeechRate } from '../../domain/value-objects/speech-rate';
import { SpeechVolume } from '../../domain/value-objects/speech-volume';
import {
  BuildSpeechRequestUseCase,
  SpeechRequestOverrides,
} from '../use-cases/build-speech-request.use-case';
import { LoadSpeechPreferencesUseCase } from '../use-cases/load-speech-preferences.use-case';
import { SaveSpeechPreferencesUseCase } from '../use-cases/save-speech-preferences.use-case';
import { ListSpeechVoicesUseCase } from '../use-cases/list-speech-voices.use-case';
import { CancelSpeechPlaybackUseCase } from '../use-cases/cancel-speech-playback.use-case';
import { SpeechPlaybackResult } from '../ports/speech-engine.port';

export interface SpeechPlaybackRequest extends SpeechRequestOverrides {
  readonly text: string;
  readonly locale?: LocaleCode;
}

export interface SpeechFacadeState {
  readonly queue: readonly SpeechRequestSnapshot[];
  readonly isPlaying: boolean;
  readonly isEnabled: boolean;
  readonly preferences: SpeechPreferencesEntity | null;
}

export type SpeechPlaybackIssueReason =
  | 'feature-disabled'
  | 'engine-not-supported'
  | 'playback-error';

export interface SpeechPlaybackIssue {
  readonly type: 'unavailable' | 'failed';
  readonly reason: SpeechPlaybackIssueReason;
  readonly occurredAt: number;
}

@Injectable({ providedIn: 'root' })
export class SpeechPlaybackFacade {
  private static readonly FEATURE_FLAG_KEY = 'ff_speech_service';
  private static readonly DEFAULT_LOCALE: LocaleCode = 'es';

  private readonly featureFlags = inject<FeatureFlagPort>(FEATURE_FLAG_PORT);
  private readonly telemetry = inject<SpeechTelemetryPort>(SPEECH_TELEMETRY_PORT);
  private readonly engine = inject<SpeechEnginePort>(SPEECH_ENGINE);
  private readonly buildSpeechRequest = inject(BuildSpeechRequestUseCase);
  private readonly loadPreferences = inject(LoadSpeechPreferencesUseCase);
  private readonly savePreferences = inject(SaveSpeechPreferencesUseCase);
  private readonly listVoicesUseCase = inject(ListSpeechVoicesUseCase);
  private readonly cancelPlayback = inject(CancelSpeechPlaybackUseCase);

  private readonly queue: WritableSignal<SpeechQueueEntity> = signal(
    SpeechQueueEntity.empty(),
  );
  private readonly playing: WritableSignal<boolean> = signal(false);
  private readonly preferences: WritableSignal<SpeechPreferencesEntity | null> =
    signal(null);
  private readonly enabled: WritableSignal<boolean> = signal(
    this.featureFlags.isEnabled(SpeechPlaybackFacade.FEATURE_FLAG_KEY),
  );
  private readonly speechSupported: WritableSignal<boolean> = signal(
    this.engine.supportsSpeechSynthesis(),
  );
  private readonly issue: WritableSignal<SpeechPlaybackIssue | null> = signal(null);

  readonly queueSnapshot: Signal<readonly SpeechRequestSnapshot[]> = computed(() =>
    this.queue()
      .toArray()
      .map((item) => item.toSnapshot()),
  );

  readonly isPlaying: Signal<boolean> = computed(() => this.playing());
  readonly isEnabled: Signal<boolean> = computed(() => this.enabled());
  readonly preferencesSnapshot: Signal<SpeechPreferencesEntity | null> = computed(() =>
    this.preferences(),
  );
  readonly isSpeechSupported: Signal<boolean> = computed(() => this.speechSupported());
  readonly lastIssue: Signal<SpeechPlaybackIssue | null> = computed(() => this.issue());
  readonly state: Signal<SpeechFacadeState> = computed(() => ({
    queue: this.queueSnapshot(),
    isPlaying: this.isPlaying(),
    isEnabled: this.isEnabled(),
    preferences: this.preferences(),
  }));

  async requestSpeech(request: SpeechPlaybackRequest): Promise<void> {
    this.telemetry.trackEvent('speech.play.requested', {
      textLength: request.text.length,
      locale:
        request.locale ??
        this.preferences()?.locale ??
        SpeechPlaybackFacade.DEFAULT_LOCALE,
    });

    if (!this.enabled()) {
      this.telemetry.logWarning('speech-service-disabled', {
        featureFlag: SpeechPlaybackFacade.FEATURE_FLAG_KEY,
      });
      this.publishIssue('unavailable', 'feature-disabled');
      this.telemetry.trackEvent('speech.unavailable', { reason: 'feature-disabled' });
      return;
    }

    const supported = this.engine.supportsSpeechSynthesis();
    this.speechSupported.set(supported);

    if (!supported) {
      this.telemetry.logWarning('speech-synthesis-not-supported');
      this.publishIssue('unavailable', 'engine-not-supported');
      this.telemetry.trackEvent('speech.unavailable', { reason: 'engine-not-supported' });
      return;
    }

    const preferences = await this.ensurePreferences(request.locale);
    const speechRequest = this.buildSpeechRequest.execute({
      text: request.text,
      locale: request.locale,
      preferences,
      overrides: {
        voiceId: request.voiceId,
        rate: request.rate,
        pitch: request.pitch,
        volume: request.volume,
      },
    });

    this.queue.update((current) => current.enqueue(speechRequest));

    if (!this.playing()) {
      void this.drainQueue();
    }
  }

  clearQueue(): void {
    this.queue.set(SpeechQueueEntity.empty());
    this.cancelPlayback.execute();
    this.playing.set(false);
  }

  supportsSpeech(): boolean {
    return this.speechSupported();
  }

  clearIssue(): void {
    this.issue.set(null);
  }

  async setVoice(voiceId: string | null, locale: LocaleCode): Promise<void> {
    await this.updatePreferences((current) => current.withVoice(voiceId, locale));
  }

  async setRate(rate: number): Promise<void> {
    await this.updatePreferences((current) => current.withRate(SpeechRate.create(rate)));
  }

  async setPitch(pitch: number): Promise<void> {
    await this.updatePreferences((current) =>
      current.withPitch(SpeechPitch.create(pitch)),
    );
  }

  async setVolume(volume: number): Promise<void> {
    await this.updatePreferences((current) =>
      current.withVolume(SpeechVolume.create(volume)),
    );
  }

  async listVoices(locale?: LocaleCode): Promise<readonly SpeechVoiceEntity[]> {
    return this.listVoicesUseCase.execute(
      locale ?? (await this.ensurePreferences()).locale,
    );
  }

  private async drainQueue(): Promise<void> {
    if (this.playing()) {
      return;
    }

    this.playing.set(true);

    try {
      while (!this.queue().isEmpty()) {
        const currentQueue = this.queue();
        const { next, queue } = currentQueue.shift();
        this.queue.set(queue);

        if (next) {
          await this.playRequest(next);
        }
      }
    } finally {
      this.playing.set(false);
    }

    if (!this.queue().isEmpty() && !this.playing()) {
      void this.drainQueue();
    }
  }

  private async playRequest(request: SpeechRequestEntity): Promise<void> {
    try {
      this.telemetry.trackEvent('speech.playback.started', {
        locale: request.locale,
        voiceId: request.voiceId,
        textLength: request.text.length,
      });
      const result: SpeechPlaybackResult = await this.engine.speak(request);
      if (!result.success) {
        this.telemetry.logWarning('speech-playback-fallback-triggered', {
          locale: request.locale,
          voiceId: request.voiceId,
          fallbackUsed: result.fallbackUsed,
        });
        this.telemetry.trackEvent('speech.playback.failed', {
          locale: request.locale,
          voiceId: request.voiceId,
          fallbackUsed: result.fallbackUsed,
          textLength: request.text.length,
        });
        this.publishIssue('failed', 'playback-error');
      }
    } catch (error) {
      const reason = this.describeError(error);
      this.telemetry.logWarning('speech-playback-error', {
        locale: request.locale,
        voiceId: request.voiceId,
        reason,
      });
      this.telemetry.trackEvent('speech.playback.failed', {
        locale: request.locale,
        voiceId: request.voiceId,
        reason,
        textLength: request.text.length,
      });
      this.publishIssue('failed', 'playback-error');
    }
  }

  private publishIssue(
    type: SpeechPlaybackIssue['type'],
    reason: SpeechPlaybackIssueReason,
  ): void {
    this.issue.set({
      type,
      reason,
      occurredAt: Date.now(),
    });
  }

  private async ensurePreferences(locale?: LocaleCode): Promise<SpeechPreferencesEntity> {
    const current = this.preferences();

    if (current) {
      if (locale && current.locale !== locale) {
        const updated = current.withVoice(current.voiceId, locale);
        this.preferences.set(updated);
        await this.persistPreferences(updated);
        return updated;
      }

      return current;
    }

    const fallbackLocale = locale ?? SpeechPlaybackFacade.DEFAULT_LOCALE;

    try {
      const loaded = await this.loadPreferences.execute(fallbackLocale);
      this.preferences.set(loaded);
      return loaded;
    } catch (error) {
      this.telemetry.logWarning('speech-preferences-load-failed', {
        reason: this.describeError(error),
      });
      const fallback = SpeechPreferencesEntity.createDefault(fallbackLocale);
      this.preferences.set(fallback);
      await this.persistPreferences(fallback);
      return fallback;
    }
  }

  private async updatePreferences(
    mutator: (current: SpeechPreferencesEntity) => SpeechPreferencesEntity,
  ): Promise<void> {
    const preferences = await this.ensurePreferences();
    const updated = mutator(preferences);
    this.preferences.set(updated);
    await this.persistPreferences(updated);
  }

  private async persistPreferences(preferences: SpeechPreferencesEntity): Promise<void> {
    try {
      await this.savePreferences.execute(preferences);
    } catch (error) {
      this.telemetry.logWarning('speech-preferences-save-failed', {
        reason: this.describeError(error),
      });
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return typeof error === 'string' ? error : 'unknown-error';
  }
}
